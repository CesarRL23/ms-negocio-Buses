import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly messageGateway: MessageGateway,
  ) { }

  private extractUserId(req: any): string {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new UnauthorizedException('Token faltante');
    const token = authHeader.replace('Bearer ', '');
    const payload = jwt.decode(token) as { id?: string; sub?: string } | null;
    if (!payload) throw new UnauthorizedException('Token inválido');
    const userId = payload.id || payload.sub;
    if (!userId) throw new UnauthorizedException('No se pudo identificar al usuario');
    return userId;
  }

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
  }

  @Get('sent')
  findSent(@Req() req: any) {
    const userId = this.extractUserId(req);
    return this.messageService.findSent(userId);
  }

  @Get('received')
  findReceived(@Req() req: any) {
    const userId = this.extractUserId(req);
    return this.messageService.findReceived(userId);
  }

  @Get('group/:groupId')
  findGroupMessages(@Param('groupId') groupId: string, @Req() req: any) {
    const userId = this.extractUserId(req);
    return this.messageService.findGroupMessages(+groupId, userId);
  }

  @Get('group/:groupId/:messageId/reads')
  getGroupMessageReads(@Param('messageId') messageId: string, @Req() req: any) {
    const userId = this.extractUserId(req);
    return this.messageService.getGroupMessageReadStatus(+messageId, userId);
  }

  @Delete('group/:messageId')
  async removeGroupMessage(@Param('messageId') messageId: string, @Req() req: any) {
    const userId = this.extractUserId(req);
    const updated = await this.messageService.removeGroupMessage(+messageId, userId);
    if (updated.receptor) {
      this.messageGateway.broadcastMessageDeleted(updated.receptor, updated.id as number);
    }
    return updated;
  }

  @Get()
  findAll() {
    return this.messageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(+id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Req() req: any) {
    const userId = this.extractUserId(req);
    return this.messageService.markAsRead(+id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messageService.update(+id, updateMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messageService.remove(+id);
  }
}
