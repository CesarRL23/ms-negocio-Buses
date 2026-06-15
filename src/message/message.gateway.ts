import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Namespace, Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { MessageService } from './message.service';
import { PersonGroup } from '../person-group/entities/person-group.entity';
import { Message } from './entities/message.entity';
import { SYSTEM_ANNOUNCEMENTS_SENDER_ID } from '../announcement/constants';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  },
  namespace: '/messages',
})
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Namespace;
  private readonly logger = new Logger('MessageGateway');
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly messageService: MessageService,
    @InjectRepository(PersonGroup)
    private readonly personGroupRepository: Repository<PersonGroup>,
  ) {}

  private async joinUserGroupRooms(client: Socket, userId: string) {
    const memberships = await this.personGroupRepository.find({
      where: { person: { userId } },
      relations: ['group'],
    });

    for (const membership of memberships) {
      const groupRoom = `group-${membership.group.id}`;
      client.join(groupRoom);
    }
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token as string;
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token, disconnecting`);
        client.disconnect(true);
        return;
      }

      const rawSecret = process.env.JWT_SECRET || 'carl';
      const keyBuffer = crypto.createHash('sha256').update(rawSecret, 'utf8').digest();
      const payload = jwt.verify(token, keyBuffer) as { id?: string; sub?: string };
      const userId = payload.id || payload.sub;

      if (!userId) {
        this.logger.warn(`Token for ${client.id} has no userId claim`);
        client.disconnect(true);
        return;
      }

      client.data.userId = userId;
      client.join(userId);
      await this.joinUserGroupRooms(client, userId);
      this.connectedUsers.set(userId, client.id);
    } catch {
      this.logger.warn(`Invalid token for client ${client.id}, disconnecting`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId as string | undefined;
    if (userId) {
      this.connectedUsers.delete(userId);
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { receptor: string; contenido: string; latitud?: number; longitud?: number },
  ) {
    const emisor = client.data?.userId as string;
    if (!emisor) {
      client.emit('message_error', { error: 'No autenticado' });
      return;
    }

    if (!body.contenido || body.contenido.trim().length === 0) {
      client.emit('message_error', { error: 'El mensaje no puede estar vacío' });
      return;
    }

    if (body.contenido.length > 500) {
      client.emit('message_error', { error: 'El mensaje no puede superar los 500 caracteres' });
      return;
    }

    if (!body.receptor) {
      client.emit('message_error', { error: 'Debes indicar un destinatario' });
      return;
    }

    if (body.receptor === SYSTEM_ANNOUNCEMENTS_SENDER_ID) {
      client.emit('message_error', { error: 'No se puede responder a este canal' });
      return;
    }

    try {
      const saved = await this.messageService.saveMessage({
        emisor,
        receptor: body.receptor,
        contenido: body.contenido.trim(),
        fechaDeEnvio: new Date() as any,
        latitud: body.latitud,
        longitud: body.longitud,
      });

      // Entrega al receptor en tiempo real
      this.server.to(body.receptor).emit('new_message', saved);

      // Confirmación al emisor
      client.emit('message_sent', saved);
    } catch (error) {
      this.logger.error(`Error guardando mensaje: ${error}`);
      client.emit('message_error', { error: 'No se pudo guardar el mensaje' });
    }
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { messageId: number },
  ) {
    const callerUserId = client.data?.userId as string;
    if (!callerUserId) {
      client.emit('message_error', { error: 'No autenticado' });
      return;
    }

    try {
      const updated = await this.messageService.markAsRead(body.messageId, callerUserId);

      // Notifica al emisor original que su mensaje fue leído
      if (updated.emisor) {
        this.server.to(updated.emisor).emit('message_read', {
          messageId: updated.id,
          fechaLectura: updated.fechaLectura,
        });
      }

      // Confirma al lector
      client.emit('read_receipt', {
        messageId: updated.id,
        fechaLectura: updated.fechaLectura,
      });
    } catch {
      client.emit('message_error', { error: 'No se pudo marcar como leído' });
    }
  }

  // ── Returns which of the given userIds currently have an open socket ──
  getConnectedUserIds(userIds: string[]): string[] {
    return userIds.filter((userId) => this.connectedUsers.has(userId));
  }

  // ── Broadcast a mass announcement to a set of users ──
  broadcastAnnouncement(
    userIds: string[],
    payload: { id: number; title: string; message: string; isUrgent: boolean; createdAt: Date },
    isUrgent: boolean,
  ) {
    if (userIds.length === 0) return;

    this.server.to(userIds).emit('announcement', payload);
    if (isUrgent) {
      this.server.to(userIds).emit('urgent_announcement', payload);
    }
    this.logger.log(`Broadcast announcement #${payload.id} to ${userIds.length} usuario(s)`);
  }

  // ── Deliver newly created announcement-messages to connected recipients ──
  broadcastNewMessages(messages: Message[]) {
    for (const msg of messages) {
      if (msg.receptor) {
        this.server.to(msg.receptor).emit('new_message', msg);
      }
    }
  }

  // ── Notify user they were added to a group ──
  notifyGroupAdded(userId: string, payload: { groupId: number; groupName: string; addedBy: string }) {
    const groupRoom = `group-${payload.groupId}`;
    const namespace = this.server;
    const userSockets = namespace.adapter.rooms.get(userId);
    if (userSockets) {
      for (const socketId of userSockets) {
        const socket = namespace.sockets.get(socketId);
        socket?.join(groupRoom);
      }
    }

    namespace.to(userId).emit('group_added', payload);
    this.logger.log(`Notified ${userId} about group "${payload.groupName}"`);
  }
}
