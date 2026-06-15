export class UpdatePqrsDto {
  status?: 'PENDIENTE' | 'EN_REVISION' | 'EN_PROCESO' | 'RESUELTO';
  agentResponse?: string;
}
