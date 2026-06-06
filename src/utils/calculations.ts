import { SaleRecord, DailyExpense } from '../types';

export function calcTotalRevenue(sales: SaleRecord[]): number {
  return sales.reduce((sum, s) => sum + s.revenue, 0);
}

export function calcTotalProfit(sales: SaleRecord[]): number {
  return sales.reduce((sum, s) => sum + s.profit, 0);
}

export function calcTotalExpenses(expenses: DailyExpense[]): number {
  return expenses.reduce(
    (sum, e) => sum + e.boothCost + e.transportCost + e.otherCost,
    0,
  );
}

export function calcNetProfit(sales: SaleRecord[], expenses: DailyExpense[]): number {
  return calcTotalProfit(sales) - calcTotalExpenses(expenses);
}

export function calcProfitMargin(revenue: number, netProfit: number): number {
  if (revenue === 0) return 0;
  return (netProfit / revenue) * 100;
}

export function calcProfitMarginSimple(cost: number, sale: number): number {
  if (sale === 0) return 0;
  return ((sale - cost) / sale) * 100;
}

export function calcBreakevenPrice(
  costPrice: number,
  boothCost: number,
  quantity: number,
): number {
  if (quantity === 0) return 0;
  return (costPrice * quantity + boothCost) / quantity;
}

export function formatMoney(n: number): string {
  return n.toFixed(2);
}
