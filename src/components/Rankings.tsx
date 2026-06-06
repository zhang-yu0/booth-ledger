import React, { useState, useMemo } from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import { useSales } from '../hooks/useSales';
import { todayStr, weekStartStr, monthStartStr } from '../utils/dateUtils';
import { formatMoney } from '../utils/calculations';
import type { Period } from '../types';

const periods: { value: Period; label: string }[] = [
  { value: 'today', label: '今日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
];

export default function Rankings() {
  const [period, setPeriod] = useState<Period>('today');
  const [mode, setMode] = useState<'sales' | 'profit'>('sales');
  const { sales } = useSales();

  const rangeStart = useMemo(() => {
    if (period === 'today') return todayStr();
    if (period === 'week') return weekStartStr();
    return monthStartStr();
  }, [period]);

  const rankings = useMemo(() => {
    const filtered = sales.filter((s) => s.date >= rangeStart && s.date <= todayStr());
    const map = new Map<string, { name: string; qty: number; profit: number }>();
    filtered.forEach((s) => {
      const prev = map.get(s.productId) || { name: s.productName, qty: 0, profit: 0 };
      prev.qty += s.quantity;
      prev.profit += s.profit;
      map.set(s.productId, prev);
    });
    const list = [...map.values()];
    list.sort((a, b) => (mode === 'sales' ? b.qty - a.qty : b.profit - a.profit));
    return list;
  }, [sales, rangeStart, mode]);

  return (
    <div className="max-w-3xl space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex bg-bg rounded-btn p-1 w-fit border border-border">
          {periods.map((p) => (
            <button
              key={p.value}
              className={`px-4 py-1.5 rounded-btn text-sm font-medium transition-all duration-200 ${
                period === p.value ? 'bg-accent text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex bg-bg rounded-btn p-1 w-fit border border-border">
          <button
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-btn text-sm font-medium transition-all duration-200 ${
              mode === 'sales' ? 'bg-accent text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setMode('sales')}
          >
            <Trophy size={14} /> 销量排行
          </button>
          <button
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-btn text-sm font-medium transition-all duration-200 ${
              mode === 'profit' ? 'bg-accent text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setMode('profit')}
          >
            <TrendingUp size={14} /> 利润排行
          </button>
        </div>
      </div>

      {/* Rankings list */}
      <div className="card-static overflow-hidden">
        {rankings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-hint">
            <Trophy size={48} className="mb-3 opacity-30" />
            <span>{period === 'today' ? '今日暂无数据' : period === 'week' ? '本周暂无数据' : '本月暂无数据'}</span>
          </div>
        ) : (
          <div>
            {rankings.map((item, i) => (
              <div key={i} className="table-row flex items-center px-6">
                <span className="w-8 text-lg font-bold text-text-hint">
                  {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                </span>
                <span className="flex-1 text-sm font-medium text-text-primary">{item.name}</span>
                <span className="text-sm font-semibold text-accent">
                  {mode === 'sales' ? `${item.qty} 件` : `${formatMoney(item.profit)} 元`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
