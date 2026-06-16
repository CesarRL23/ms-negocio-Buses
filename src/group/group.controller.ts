import { Controller, Get, Post, Body, Patch, Param, Delete, Headers } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { extractUserIdFromAuthHeader } from '../utils/auth.util';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupService.create(createGroupDto);
  }

  @Get()
  findAll() {
    return this.groupService.findAll();
  }

  @Get('public')
  findPublic() {
    return this.groupService.findPublic();
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.groupService.findByUserId(userId);
  }

  // ── Member management endpoints (must be declared BEFORE @Get(':id')) ────────

  @Get(':id/members')
  getMembers(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    const callerUserId = extractUserIdFromAuthHeader(auth);
    return this.groupService.getMembers(+id, callerUserId);
  }

  @Get(':id/log')
  getMembershipLog(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    const callerUserId = extractUserIdFromAuthHeader(auth);
    return this.groupService.getMembershipLog(+id, callerUserId);
  }

  @Delete(':id/members/:targetUserId')
  removeMember(
    @Param('id') id: string,
    @Param('targetUserId') targetUserId: string,
    @Headers('authorization') auth: string,
  ) {
    const callerUserId = extractUserIdFromAuthHeader(auth);
    return this.groupService.removeMember(+id, targetUserId, callerUserId);
  }

  @Patch(':id/members/:targetUserId/promote')
  promoteMember(
    @Param('id') id: string,
    @Param('targetUserId') targetUserId: string,
    @Headers('authorization') auth: string,
  ) {
    const callerUserId = extractUserIdFromAuthHeader(auth);
    return this.groupService.promoteMember(+id, targetUserId, callerUserId);
  }

  @Post(':id/members')
  addMember(
    @Param('id') id: string,
    @Body('targetUserId') targetUserId: string,
    @Headers('authorization') auth: string,
  ) {
    const callerUserId = extractUserIdFromAuthHeader(auth);
    return this.groupService.addMember(+id, targetUserId, callerUserId);
  }

  @Post(':id/bans')
  banMember(
    @Param('id') id: string,
    @Body('targetUserId') targetUserId: string,
    @Headers('authorization') auth: string,
  ) {
    const callerUserId = extractUserIdFromAuthHeader(auth);
    return this.groupService.banMember(+id, targetUserId, callerUserId);
  }

  @Post(':id/join')
  joinPublic(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    const callerUserId = extractUserIdFromAuthHeader(auth);
    return this.groupService.selfJoin(+id, callerUserId);
  }

  @Post(':id/leave')
  leaveGroup(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    const callerUserId = extractUserIdFromAuthHeader(auth);
    return this.groupService.leaveGroup(+id, callerUserId);
  }

  @Patch(':id/rename')
  renameGroup(
    @Param('id') id: string,
    @Body('name') name: string,
    @Headers('authorization') auth: string,
  ) {
    const callerUserId = extractUserIdFromAuthHeader(auth);
    return this.groupService.renameGroup(+id, name, callerUserId);
  }

  // ── Generic CRUD (after specific sub-routes) ─────────────────────────────────

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupService.update(+id, updateGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupService.remove(+id);
  }
}
