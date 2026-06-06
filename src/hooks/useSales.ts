import { useCallback } from 'react';
import { SaleRecord, DailyExpense, StockInRecord, Settings } from '../types';
import { useLocalStorage, generateId } from './useLocalStorage';

const SALES_KEY = 'booth-ledger-sales';
const EXPENSES_KEY = 'booth-ledger-expenses';
const STOCK_IN_KEY = 'booth-ledger-stock-in';
const SETTINGS_KEY = 'booth-ledger-settings';

export function useSales() {
  const [sales, setSales] = useLocalStorage<SaleRecord[]>(SALES_KEY, []);

  const addSale = useCallback(
    (data: Omit<SaleRecord, 'id'>) => {
      const record: SaleRecord = { ...data, id: generateId() };
      setSales((prev) => [...prev, record]);
      return record;
    },
    [setSales],
  );

  const deleteSale = useCallback(
    (id: string) => {
      setSales((prev) => prev.filter((s) => s.id !== id));
    },
    [setSales],
  );

  const getSalesByDate = useCallback(
    (date: string) => sales.filter((s) => s.date === date),
    [sales],
  );

  const getSalesByDateRange = useCallback(
    (start: string, end: string) =>
      sales.filter((s) => s.date >= start && s.date <= end),
    [sales],
  );

  return {
    sales,
    setSales,
    addSale,
    deleteSale,
    getSalesByDate,
    getSalesByDateRange,
  };
}

export function useExpenses() {
  const [expenses, setExpenses] = useLocalStorage<DailyExpense[]>(EXPENSES_KEY, []);

  const addExpense = useCallback(
    (data: Omit<DailyExpense, 'id'>) => {
      const record: DailyExpense = { ...data, id: generateId() };
      setExpenses((prev) => [...prev, record]);
    },
    [setExpenses],
  );

  const updateExpense = useCallback(
    (id: string, data: Partial<Omit<DailyExpense, 'id'>>) => {
      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...data } : e)),
      );
    },
    [setExpenses],
  );

  const deleteExpense = useCallback(
    (id: string) => {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    },
    [setExpenses],
  );

  const getExpenseByDate = useCallback(
    (date: string) => expenses.find((e) => e.date === date) ?? null,
    [expenses],
  );

  const getExpensesByDateRange = useCallback(
    (start: string, end: string) =>
      expenses.filter((e) => e.date >= start && e.date <= end),
    [expenses],
  );

  return {
    expenses,
    setExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpenseByDate,
    getExpensesByDateRange,
  };
}

export function useStockIn() {
  const [stockIns, setStockIns] = useLocalStorage<StockInRecord[]>(STOCK_IN_KEY, []);

  const addStockIn = useCallback(
    (data: Omit<StockInRecord, 'id'>) => {
      const record: StockInRecord = { ...data, id: generateId() };
      setStockIns((prev) => [...prev, record]);
    },
    [setStockIns],
  );

  const deleteStockIn = useCallback(
    (id: string) => {
      setStockIns((prev) => prev.filter((s) => s.id !== id));
    },
    [setStockIns],
  );

  return { stockIns, setStockIns, addStockIn, deleteStockIn };
}

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<Settings>(SETTINGS_KEY, {
    defaultBoothCost: 0,
  });

  return { settings, setSettings };
}
