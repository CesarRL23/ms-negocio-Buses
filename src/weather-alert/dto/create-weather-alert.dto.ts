export class CreateWeatherAlertDto {
  citizenUserId: string;
  email: string;
  name: string;
  travelTime?: string;
  city?: string;
  enabled?: boolean;
}
