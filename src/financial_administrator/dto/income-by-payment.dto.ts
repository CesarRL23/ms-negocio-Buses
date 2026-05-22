export class MonthlyDataDto {
  month: string;
  total: number;
}

export class PaymentMethodDataDto {
  type: string;
  monthlyData: MonthlyDataDto[];
  periodTotal: number;
}

export class IncomeByPaymentDto {
  period: number;
  months: string[];
  paymentMethods: PaymentMethodDataDto[];
  grandTotal: number;
}
