export class CreatePqrsDto {
  type: 'PETICION' | 'QUEJA' | 'RECLAMO' | 'SUGERENCIA';
  category: 'CONDUCTOR' | 'BUS' | 'RUTA' | 'TARJETA' | 'OTRO';
  description: string;
  email: string;
  citizenUserId?: string;
  citizenName?: string;
  photos?: string[];
}
