import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { UnauthorizedException } from '@nestjs/common';

export function extractUserIdFromAuthHeader(authHeader: string | undefined): string {
  if (!authHeader) throw new UnauthorizedException('Token de autorización faltante');

  const token = authHeader.replace('Bearer ', '');
  const rawSecret = process.env.JWT_SECRET || 'carl';
  const keyBuffer = crypto.createHash('sha256').update(rawSecret, 'utf8').digest();

  try {
    const payload = jwt.verify(token, keyBuffer) as { id?: string; sub?: string };
    const userId = payload.id || payload.sub;
    if (!userId) throw new UnauthorizedException('Token inválido: sin userId');
    return userId;
  } catch {
    throw new UnauthorizedException('Token inválido o expirado');
  }
}
