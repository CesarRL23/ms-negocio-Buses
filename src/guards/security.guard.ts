import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SecurityGuard implements CanActivate {
  private readonly logger = new Logger('SecurityGuard');

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Las conexiones WebSocket (eventos @SubscribeMessage) se autentican en handleConnection del gateway
    if (context.getType() === 'ws') return true;

    const request = context.switchToHttp().getRequest();
    const { headers, method } = request;

    // Peticiones HTTP de handshake de Socket.IO (polling/WebSocket upgrade)
    const rawUrl = request.originalUrl || request.url || '';
    if (rawUrl.startsWith('/socket.io')) return true;

    if (!headers.authorization) {
      throw new UnauthorizedException('Token de autorización faltante');
    }

    const token = headers.authorization.replace('Bearer ', '');
    const cleanUrl = rawUrl.split('?')[0];

    if (cleanUrl === '/person/sync' && method === 'POST') {
      this.logger.log(
        `Bypassing permission validation for sync route -> URL: ${cleanUrl} Method: ${method}`,
      );
      return true;
    }

    // Allow PATCH /person/:id (user can update own profile)
    if (cleanUrl.match(/^\/person\/\d+$/) && method === 'PATCH') {
      this.logger.log(
        `Bypassing permission validation for personal update route -> URL: ${cleanUrl} Method: ${method}`,
      );
      return true;
    }

    // Rutas de mensajería privada (validación JWT en el propio controlador)
    if (
      (cleanUrl === '/message/sent' || cleanUrl === '/message/received' || cleanUrl.match(/^\/message\/group\/\d+$/)) &&
      method === 'GET'
    ) {
      return true;
    }
    if (cleanUrl.match(/^\/message\/\d+\/read$/) && method === 'PATCH') {
      return true;
    }
    if (cleanUrl === '/person/search' && method === 'GET') {
      return true;
    }
    if (cleanUrl.match(/^\/person\/by-user-id\//) && method === 'GET') {
      return true;
    }

    // ── Rutas de citas (appointment) ──────────────────────────────
    // GET /appointment/availability → pública (sin token)
    if (cleanUrl === '/appointment/availability' && method === 'GET') {
      return true;
    }
    // GET /appointment/user/:userId → ciudadano consulta sus propias citas
    if (cleanUrl.match(/^\/appointment\/user\//) && method === 'GET') {
      return true;
    }
    // POST /appointment → ciudadano agenda una cita
    if (cleanUrl === '/appointment' && method === 'POST') {
      return true;
    }
    // DELETE /appointment/:id → ciudadano cancela su cita
    if (cleanUrl.match(/^\/appointment\/\d+$/) && method === 'DELETE') {
      return true;
    }
    // GET /appointment → admin lista todas las citas
    if (cleanUrl === '/appointment' && method === 'GET') {
      return true;
    }

    const publicReadRoutes = [
      '/whereabouts',
      '/route',
      '/nodo',
      '/programming',
      '/ticket',
      '/company-admin',
    ];
    const isPublicReadRoute =
      method === 'GET' &&
      publicReadRoutes.some(
        (route) => cleanUrl === route || cleanUrl.startsWith(`${route}/`),
      );

    if (isPublicReadRoute) {
      this.logger.log(
        `Bypassing permission validation for public read route -> URL: ${cleanUrl} Method: ${method}`,
      );
      return true;
    }

    const permissionData = { url: cleanUrl, method };

    try {
      const securityUrl = `${process.env.MS_SECURITY}/api/public/security/permissions-validation`;

      // Log the permission being validated for easier debugging
      this.logger.log(
        `Validating permission -> URL: ${cleanUrl}  Method: ${method}  securityUrl: ${securityUrl}`,
      );
      this.logger.debug(
        `Permission payload: ${JSON.stringify(permissionData)}`,
      );

      const response = await axios.post(securityUrl, permissionData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data === true) return true;
      else throw new UnauthorizedException('Permisos insuficientes');
    } catch (error: any) {
      this.logger.error(`Error al validar permisos: ${error.message}`);
      throw new UnauthorizedException('Error al validar permisos');
    }
  }
}
