export class CreateAnnouncementDto {
  title: string;
  message: string;
  scope: 'ALL' | 'ROUTE' | 'ZONE';
  scopeValue?: string;
  isUrgent?: boolean;
  scheduledFor?: string;
}
