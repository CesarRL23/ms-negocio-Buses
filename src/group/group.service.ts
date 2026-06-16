import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { Repository } from 'typeorm';
import { PersonGroup } from '../person-group/entities/person-group.entity';
import { Person } from '../person/entities/person.entity';
import { GroupMembershipLog } from './entities/group-membership-log.entity';
import { GroupBan } from './entities/group-ban.entity';
import { MessageGateway } from '../message/message.gateway';
import { Message } from '../message/entities/message.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(PersonGroup)
    private readonly personGroupRepository: Repository<PersonGroup>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    @InjectRepository(GroupMembershipLog)
    private readonly logRepository: Repository<GroupMembershipLog>,
    @InjectRepository(GroupBan)
    private readonly banRepository: Repository<GroupBan>,
    private readonly messageGateway: MessageGateway,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  private async assertAdmin(groupId: number, callerUserId: string): Promise<PersonGroup> {
    const membership = await this.personGroupRepository.findOne({
      where: { group: { id: groupId }, person: { userId: callerUserId } },
      relations: ['person'],
    });
    if (!membership || membership.role !== 'admin') {
      throw new ForbiddenException('Solo un administrador puede realizar esta acción');
    }
    return membership;
  }

  private async recordLog(
    groupId: number,
    action: string,
    actor: Person,
    target: Person,
  ): Promise<void> {
    await this.logRepository.save(
      this.logRepository.create({
        groupId,
        action,
        actorUserId: actor.userId,
        actorName: actor.nombre,
        targetUserId: target.userId,
        targetName: target.nombre,
      }),
    );
  }

  async create(createGroupDto: CreateGroupDto) {
    const { memberUserIds, creatorUserId, ...groupData } = createGroupDto;

    // Validate minimum 2 members besides creator
    const uniqueMembers = [...new Set(memberUserIds.filter((id) => id !== creatorUserId))];
    if (uniqueMembers.length < 2) {
      throw new BadRequestException('Se requieren al menos 2 miembros además del creador');
    }

    // Create the group
    const group = this.groupRepository.create({
      ...groupData,
      creatorUserId,
    });
    const savedGroup = await this.groupRepository.save(group);

    // Find creator person record
    const creatorPerson = await this.personRepository.findOne({
      where: { userId: creatorUserId },
    });

    if (creatorPerson) {
      const creatorMembership = this.personGroupRepository.create({
        person: creatorPerson,
        group: savedGroup,
        role: 'admin',
      });
      await this.personGroupRepository.save(creatorMembership);

      await this.recordLog(savedGroup.id, 'added', creatorPerson, creatorPerson);
    }

    // Add each member
    for (const memberUserId of uniqueMembers) {
      const memberPerson = await this.personRepository.findOne({
        where: { userId: memberUserId },
      });

      if (memberPerson) {
        const membership = this.personGroupRepository.create({
          person: memberPerson,
          group: savedGroup,
          role: 'member',
        });
        await this.personGroupRepository.save(membership);

        if (creatorPerson) {
          await this.recordLog(savedGroup.id, 'added', creatorPerson, memberPerson);
        }

        this.messageGateway.notifyGroupAdded(memberUserId, {
          groupId: savedGroup.id,
          groupName: savedGroup.name,
          addedBy: creatorUserId,
        });
      }
    }

    return this.findOne(savedGroup.id);
  }

  async findAll() {
    return await this.groupRepository.find({
      relations: ['personGroups', 'personGroups.person'],
    });
  }

  async findPublic() {
    const groups = await this.groupRepository.find({
      where: { isPublic: true },
      relations: ['personGroups'],
    });
    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      isPublic: g.isPublic,
      imageUrl: g.imageUrl,
      memberCount: g.personGroups?.length ?? 0,
    }));
  }

  async findOne(id: number) {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['personGroups', 'personGroups.person'],
    });
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return group;
  }

  async findByUserId(userId: string) {
    const person = await this.personRepository.findOne({
      where: { userId },
    });

    if (!person) {
      return [];
    }

    const memberships = await this.personGroupRepository.find({
      where: { person: { id: person.id } },
      relations: ['group', 'group.personGroups', 'group.personGroups.person'],
    });

    return memberships.map((m) => ({
      ...m.group,
      myRole: m.role,
    }));
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    const group = await this.groupRepository.preload({
      id: id,
      ...updateGroupDto,
    });
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return await this.groupRepository.save(group);
  }

  async remove(id: number) {
    const group = await this.findOne(id);
    return await this.groupRepository.remove(group);
  }

  // ── Member management ────────────────────────────────────────────

  async getMembers(groupId: number, callerUserId: string) {
    const callerMembership = await this.personGroupRepository.findOne({
      where: { group: { id: groupId }, person: { userId: callerUserId } },
    });
    if (!callerMembership) {
      throw new ForbiddenException('No eres miembro de este grupo');
    }

    const memberships = await this.personGroupRepository.find({
      where: { group: { id: groupId } },
      relations: ['person'],
      order: { joinedAt: 'ASC' },
    });

    return memberships.map((m) => ({
      personGroupId: m.id,
      personId: m.person.id,
      userId: m.person.userId,
      nombre: m.person.nombre,
      role: m.role,
      joinedAt: m.joinedAt,
    }));
  }

  async removeMember(groupId: number, targetUserId: string, callerUserId: string) {
    const callerMembership = await this.assertAdmin(groupId, callerUserId);
    const callerPerson = callerMembership.person;

    if (callerUserId === targetUserId) {
      throw new BadRequestException('No puedes removerte a ti mismo');
    }

    const targetMembership = await this.personGroupRepository.findOne({
      where: { group: { id: groupId }, person: { userId: targetUserId } },
      relations: ['person'],
    });

    if (!targetMembership) {
      throw new NotFoundException('El usuario no es miembro de este grupo');
    }

    if (targetMembership.role === 'admin') {
      throw new ForbiddenException('No se puede remover a otro administrador');
    }

    const targetPerson = targetMembership.person;
    await this.personGroupRepository.remove(targetMembership);
    await this.recordLog(groupId, 'removed', callerPerson, targetPerson);

    this.messageGateway.notifyMemberRemoved(groupId, targetUserId, callerPerson.nombre ?? '');

    return { success: true };
  }

  async promoteMember(groupId: number, targetUserId: string, callerUserId: string) {
    const callerMembership = await this.assertAdmin(groupId, callerUserId);
    const callerPerson = callerMembership.person;

    const targetMembership = await this.personGroupRepository.findOne({
      where: { group: { id: groupId }, person: { userId: targetUserId } },
      relations: ['person'],
    });

    if (!targetMembership) {
      throw new NotFoundException('El usuario no es miembro de este grupo');
    }

    if (targetMembership.role === 'admin') {
      throw new BadRequestException('El usuario ya es administrador');
    }

    targetMembership.role = 'admin';
    await this.personGroupRepository.save(targetMembership);

    const targetPerson = targetMembership.person;
    await this.recordLog(groupId, 'promoted', callerPerson, targetPerson);

    this.messageGateway.notifyMemberPromoted(
      groupId,
      targetUserId,
      targetPerson.nombre ?? '',
      callerPerson.nombre ?? '',
    );

    return { success: true, newRole: 'admin' };
  }

  async banMember(groupId: number, targetUserId: string, callerUserId: string) {
    const callerMembership = await this.assertAdmin(groupId, callerUserId);
    const callerPerson = callerMembership.person;

    if (callerUserId === targetUserId) {
      throw new BadRequestException('No puedes bloquearte a ti mismo');
    }

    const existingBan = await this.banRepository.findOne({
      where: { groupId, bannedUserId: targetUserId },
    });
    if (existingBan) {
      throw new BadRequestException('Este usuario ya está bloqueado en el grupo');
    }

    const targetMembership = await this.personGroupRepository.findOne({
      where: { group: { id: groupId }, person: { userId: targetUserId } },
      relations: ['person'],
    });

    if (targetMembership?.role === 'admin') {
      throw new ForbiddenException('No se puede bloquear a otro administrador');
    }

    const targetPerson = targetMembership?.person ?? await this.personRepository.findOne({
      where: { userId: targetUserId },
    });

    if (!targetPerson) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (targetMembership) {
      await this.personGroupRepository.remove(targetMembership);
    }

    await this.banRepository.save(
      this.banRepository.create({
        groupId,
        bannedUserId: targetUserId,
        bannedByUserId: callerUserId,
      }),
    );

    await this.recordLog(groupId, 'banned', callerPerson, targetPerson);

    this.messageGateway.notifyMemberRemoved(groupId, targetUserId, callerPerson.nombre ?? '');

    return { success: true };
  }

  async getMembershipLog(groupId: number, callerUserId: string) {
    const callerMembership = await this.personGroupRepository.findOne({
      where: { group: { id: groupId }, person: { userId: callerUserId } },
    });
    if (!callerMembership) {
      throw new ForbiddenException('No eres miembro de este grupo');
    }

    return this.logRepository.find({
      where: { groupId },
      order: { createdAt: 'DESC' },
    });
  }

  async addMember(groupId: number, targetUserId: string, callerUserId: string) {
    const callerMembership = await this.assertAdmin(groupId, callerUserId);
    const callerPerson = callerMembership.person;

    const ban = await this.banRepository.findOne({
      where: { groupId, bannedUserId: targetUserId },
    });
    if (ban) {
      throw new ForbiddenException('Este usuario está bloqueado en el grupo y no puede ser añadido');
    }

    const existing = await this.personGroupRepository.findOne({
      where: { group: { id: groupId }, person: { userId: targetUserId } },
    });
    if (existing) {
      throw new BadRequestException('El usuario ya es miembro del grupo');
    }

    const targetPerson = await this.personRepository.findOne({
      where: { userId: targetUserId },
    });
    if (!targetPerson) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const group = await this.findOne(groupId);

    const membership = this.personGroupRepository.create({
      person: targetPerson,
      group,
      role: 'member',
    });
    await this.personGroupRepository.save(membership);

    await this.recordLog(groupId, 'added', callerPerson, targetPerson);

    this.messageGateway.notifyGroupAdded(targetUserId, {
      groupId,
      groupName: group.name,
      addedBy: callerUserId,
    });

    return {
      personId: targetPerson.id,
      userId: targetPerson.userId,
      nombre: targetPerson.nombre,
      role: 'member' as const,
      joinedAt: membership.joinedAt,
    };
  }

  async selfJoin(groupId: number, callerUserId: string) {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Grupo no encontrado');
    if (!group.isPublic) throw new ForbiddenException('Este grupo es privado');

    const ban = await this.banRepository.findOne({
      where: { groupId, bannedUserId: callerUserId },
    });
    if (ban) throw new ForbiddenException('Estás bloqueado en este grupo');

    const existing = await this.personGroupRepository.findOne({
      where: { group: { id: groupId }, person: { userId: callerUserId } },
    });
    if (existing) throw new BadRequestException('Ya eres miembro de este grupo');

    const callerPerson = await this.personRepository.findOne({
      where: { userId: callerUserId },
    });
    if (!callerPerson) throw new NotFoundException('Usuario no encontrado');

    const membership = this.personGroupRepository.create({
      person: callerPerson,
      group,
      role: 'member',
    });
    await this.personGroupRepository.save(membership);

    await this.recordLog(groupId, 'added', callerPerson, callerPerson);

    this.messageGateway.notifyGroupAdded(callerUserId, {
      groupId,
      groupName: group.name,
      addedBy: callerUserId,
    });

    return { success: true, groupId, groupName: group.name };
  }

  async leaveGroup(groupId: number, callerUserId: string): Promise<{ groupDeleted: boolean }> {
    const callerMembership = await this.personGroupRepository.findOne({
      where: { group: { id: groupId }, person: { userId: callerUserId } },
      relations: ['person'],
    });
    if (!callerMembership) {
      throw new ForbiddenException('No eres miembro de este grupo');
    }

    const allMemberships = await this.personGroupRepository.find({
      where: { group: { id: groupId } },
      relations: ['person'],
    });

    if (allMemberships.length === 1) {
      await this.personGroupRepository.remove(callerMembership);
      await this.messageRepository.delete({ receptor: `group-${groupId}` });
      await this.banRepository.delete({ groupId });
      await this.logRepository.delete({ groupId });
      await this.groupRepository.delete(groupId);
      return { groupDeleted: true };
    }

    if (callerMembership.role === 'admin') {
      const otherAdmins = allMemberships.filter(
        (m) => m.role === 'admin' && m.person.userId !== callerUserId,
      );
      if (otherAdmins.length === 0) {
        throw new BadRequestException(
          'Debes asignar un administrador antes de abandonar el grupo',
        );
      }
    }

    const callerPerson = callerMembership.person;
    const group = await this.groupRepository.findOne({ where: { id: groupId } });

    await this.personGroupRepository.remove(callerMembership);
    await this.recordLog(groupId, 'left', callerPerson, callerPerson);

    const remainingAdminIds = allMemberships
      .filter((m) => m.role === 'admin' && m.person.userId !== callerUserId)
      .map((m) => m.person.userId)
      .filter((id): id is string => !!id);

    this.messageGateway.notifyMemberLeft(
      groupId,
      group?.name ?? '',
      callerUserId,
      callerPerson.nombre ?? '',
      remainingAdminIds,
    );

    return { groupDeleted: false };
  }

  async renameGroup(groupId: number, newName: string, callerUserId: string) {
    const callerMembership = await this.assertAdmin(groupId, callerUserId);
    const callerPerson = callerMembership.person;

    const group = await this.findOne(groupId);
    group.name = newName;
    const saved = await this.groupRepository.save(group);

    this.messageGateway.notifyGroupNameChanged(groupId, newName, callerPerson.nombre ?? '');

    return saved;
  }
}
