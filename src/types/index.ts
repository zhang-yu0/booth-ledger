export interface Product {
  id: string;
  name: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  lowStockThreshold: number;
}

export interface SaleRecord {
  id: string;
  date: string;
  productId: string;
  productName: string;
  costPrice: number;
  salePrice: number;
  quantity: number;
  revenue: number;
  profit: number;
}

export interface DailyExpense {
  id: string;
  date: string;
  boothCost: number;
  transportCost: number;
  otherCost: number;
  note: string;
}

export interface StockInRecord {
  id: string;
  date: string;
  productId: string;
  productName: string;
  costPrice: number;
  quantity: number;
  totalCost: number;
}

export interface Settings {
  defaultBoothCost: number;
}

export type Period = 'today' | 'week' | 'month';

export const COST_PRICE_OPTIONS = [7, 10, 12, 15, 20, 30, 40, 45, 50, 55, 65, 75];
