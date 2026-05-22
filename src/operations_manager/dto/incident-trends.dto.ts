export class TrendMonthDto {
  mes: string;
  mecanico: number;
  accidente: number;
  retraso: number;
  pasajeros: number;
  otro: number;
}

export class TrendTotalsDto {
  mecanico: number;
  accidente: number;
  retraso: number;
  pasajeros: number;
  otro: number;
}

export class IncidentTrendsDto {
  period: number;
  months: string[];
  trends: TrendMonthDto[];
  totals: TrendTotalsDto;
}

export class CompanyOptionDto {
  id: number;
  name: string;
}
