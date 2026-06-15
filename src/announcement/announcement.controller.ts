import { Body, Controller, Get, Param, Post, Query, Req, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

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

  private extractToken(req: any): string | undefined {
    const authHeader = req.headers.authorization;
    if (!authHeader) return undefined;
    return authHeader.replace('Bearer ', '');
  }

  @Post()
  create(@Body() dto: CreateAnnouncementDto, @Req() req: any) {
    const senderUserId = this.extractUserId(req);
    return this.announcementService.create(dto, senderUserId, this.extractToken(req));
  }

  @Get('recipients-count')
  getRecipientsCount(@Query('scope') scope: string, @Query('scopeValue') scopeValue: string | undefined, @Req() req: any) {
    return this.announcementService
      .getRecipientCount(scope, scopeValue, this.extractToken(req))
      .then((count) => ({ count }));
  }

  @Get('zones')
  getZones() {
    return this.announcementService.getZoneOptions();
  }

  @Get('mine')
  findMine(@Req() req: any) {
    const userId = this.extractUserId(req);
    return this.announcementService.findForUser(userId);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.announcementService.getStats(+id);
  }

  @Post(':id/read')
  markRead(@Param('id') id: string, @Req() req: any) {
    const userId = this.extractUserId(req);
    return this.announcementService.markRead(+id, userId).then(() => ({ ok: true }));
  }

  @Get()
  findAll() {
    return this.announcementService.findAllForAdmin();
  }
}
