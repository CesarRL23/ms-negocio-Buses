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
    const request = context.switchToHttp().getRequest();
    const { headers, method } = request;

    if (!headers.authorization) {
      throw new UnauthorizedException('Token de autorización faltante');
    }

    const token = headers.authorization.replace('Bearer ', '');
    const rawUrl = request.originalUrl || request.url || '';
    const cleanUrl = rawUrl.split('?')[0];

    if (cleanUrl === '/person/sync' && method === 'POST') {
      this.logger.log(
        `Bypassing permission validation for sync route -> URL: ${cleanUrl} Method: ${method}`,
      );
      return true;
    }

    const publicReadRoutes = [
      '/whereabouts',
      '/route',
      '/nodo',
      '/programming',
      '/ticket',
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
