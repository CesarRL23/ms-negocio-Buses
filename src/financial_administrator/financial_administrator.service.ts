import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../ticket/entities/ticket.entity';
import { IncomeByPaymentDto } from './dto/income-by-payment.dto';

const PAYMENT_TYPES = ['CARD', 'CASH', 'APP'];

@Injectable()
export class FinancialAdministratorService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async getIncomeByPaymentMethod(period: number): Promise<IncomeByPaymentDto> {
    const validPeriods = [3, 6, 12];
    const months = validPeriods.includes(period) ? period : 6;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const rows: { month: string; metodoPago: string; total: string }[] =
      await this.ticketRepository
        .createQueryBuilder('t')
        .select("DATE_FORMAT(t.fechaCompra, '%Y-%m')", 'month')
        .addSelect('t.metodoPago', 'metodoPago')
        .addSelect('SUM(t.precio)', 'total')
        .where('t.fechaCompra >= :start', { start: startDate })
        .andWhere("t.estado IN ('USADO', 'COMPLETADO')")
        .groupBy("DATE_FORMAT(t.fechaCompra, '%Y-%m'), t.metodoPago")
        .orderBy('month', 'ASC')
        .getRawMany();

    // Build complete list of months in range
    const allMonths: string[] = [];
    const cursor = new Date(startDate);
    const now = new Date();
    while (
      cursor.getFullYear() < now.getFullYear() ||
      (cursor.getFullYear() === now.getFullYear() && cursor.getMonth() <= now.getMonth())
    ) {
      const label = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      allMonths.push(label);
      cursor.setMonth(cursor.getMonth() + 1);
    }

    // Pivot rows into a map: { metodoPago -> { month -> total } }
    const pivot: Record<string, Record<string, number>> = {};
    for (const type of PAYMENT_TYPES) {
      pivot[type] = {};
      for (const m of allMonths) {
        pivot[type][m] = 0;
      }
    }

    for (const row of rows) {
      const type = (row.metodoPago || '').toUpperCase();
      if (pivot[type] && row.month) {
        pivot[type][row.month] = parseFloat(row.total) || 0;
      }
    }

    let grandTotal = 0;
    const paymentMethods = PAYMENT_TYPES.map((type) => {
      const monthlyData = allMonths.map((m) => ({ month: m, total: pivot[type][m] }));
      const periodTotal = monthlyData.reduce((sum, d) => sum + d.total, 0);
      grandTotal += periodTotal;
      return { type, monthlyData, periodTotal };
    });

    return { period: months, months: allMonths, paymentMethods, grandTotal };
  }
}
