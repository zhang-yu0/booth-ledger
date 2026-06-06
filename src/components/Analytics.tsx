import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Download, TrendingUp } from 'lucide-react';
import { useSales, useExpenses } from '../hooks/useSales';
import { todayStr, weekStartStr, monthStartStr, yearStartStr } from '../utils/dateUtils';
import { calcTotalRevenue, calcTotalProfit, calcNetProfit, formatMoney } from '../utils/calculations';
import { exportCSV } from '../utils/csvExport';

type Period = 'today' | 'week' | 'month' | 'year';

const periods: { value: Period; label: string }[] = [
  { value: 'today', label: '今日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'year', label: '本年' },
];

export default function Analytics() {
  const [period, setPeriod] = useState<Period>('month');
  const { sales } = useSales();
  const { expenses } = useExpenses();

  const rangeStart = useMemo(() => {
    if (period === 'today') return todayStr();
    if (period === 'week') return weekStartStr();
    if (period === 'month') return monthStartStr();
    return yearStartStr();
  }, [period]);

  const filteredSales = useMemo(
    () => sales.filter((s) => s.date >= rangeStart && s.date <= todayStr()),
    [sales, rangeStart],
  );
  const filteredExpenses = useMemo(
    () => expenses.filter((e) => e.date >= rangeStart && e.date <= todayStr()),
    [expenses, rangeStart],
  );

  const revenue = calcTotalRevenue(filteredSales);
  const profit = calcTotalProfit(filteredSales);
  const totalExpense = filteredExpenses.reduce((s, e) => s + e.boothCost + e.transportCost + e.otherCost, 0);
  const netProfit = calcNetProfit(filteredSales, filteredExpenses);
  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  // Trend data
  const trendData = useMemo(() => {
    const map = new Map<string, { revenue: number; profit: number; expense: number }>();
    filteredSales.forEach((s) => {
      const d = map.get(s.date) || { revenue: 0, profit: 0, expense: 0 };
      d.revenue += s.revenue;
      d.profit += s.profit;
      map.set(s.date, d);
    });
    filteredExpenses.forEach((e) => {
      const d = map.get(e.date) || { revenue: 0, profit: 0, expense: 0 };
      d.expense += e.boothCost + e.transportCost + e.otherCost;
      map.set(e.date, d);
    });
    return [...map.entries()]
      .map(([date, d]) => ({
        date: date.slice(5),
        revenue: Math.round(d.revenue * 100) / 100,
        netProfit: Math.round((d.profit - d.expense) * 100) / 100,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredSales, filteredExpenses]);

  // Product profit ranking
  const productProfit = useMemo(() => {
    const map = new Map<string, { name: string; profit: number }>();
    filteredSales.forEach((s) => {
      const d = map.get(s.productId) || { name: s.productName, profit: 0 };
      d.profit += s.profit;
      map.set(s.productId, d);
    });
    return [...map.values()].sort((a, b) => b.profit - a.profit).slice(0, 10);
  }, [filteredSales]);

  const handleExportCSV = () => {
    const headers = ['日期', '商品', '数量', '售价', '收入', '利润'];
    const rows = filteredSales.map((s) => [
      s.date, s.productName, String(s.quantity),
      formatMoney(s.salePrice), formatMoney(s.revenue), formatMoney(s.profit),
    ]);
    exportCSV(`销售数据_${rangeStart}_${todayStr()}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex bg-bg rounded-btn p-1 border border-border">
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
        <button onClick={handleExportCSV} className="btn-primary btn-sm">
          <Download size={14} /> 导出 CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: '营业额', value: `${formatMoney(revenue)} 元`, color: 'text-accent' },
          { label: '毛利润', value: `${formatMoney(profit)} 元`, color: 'text-success' },
          { label: '总支出', value: `${formatMoney(totalExpense)} 元`, color: 'text-danger' },
          { label: '净利润/率', value: `${formatMoney(netProfit)} 元`, sub: `${formatMoney(margin)}%`, color: 'text-text-primary' },
        ].map((item, i) => (
          <div key={i} className="card-static p-4 text-center">
            <p className="text-xs text-text-secondary mb-1">{item.label}</p>
            <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
            {item.sub && <p className="text-xs text-text-hint">{item.sub}</p>}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit trend AreaChart */}
        <div className="card-static p-6">
          <h3 className="text-base font-semibold text-text-primary mb-4">利润趋势</h3>
          {trendData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-text-hint">
              <TrendingUp size={40} className="mb-2 opacity-30" />
              <span>暂无数据</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <XAxis dataKey="date" fontSize={12} stroke="#9CA3AF" tickLine={false} axisLine={false} />
                <YAxis fontSize={12} stroke="#9CA3AF" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8, border: '1px solid #EAECF0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 13,
                  }}
                  formatter={(v: number, name: string) => [
                    `${formatMoney(v)} 元`,
                    name === 'netProfit' ? '净利润' : '营业额',
                  ]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#EFF6FF" strokeWidth={2} />
                <Area type="monotone" dataKey="netProfit" stroke="#10B981" fill="#ECFDF5" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Product profit BarChart */}
        <div className="card-static p-6">
          <h3 className="text-base font-semibold text-text-primary mb-4">商品利润排名</h3>
          {productProfit.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-text-hint">
              <TrendingUp size={40} className="mb-2 opacity-30" />
              <span>暂无数据</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productProfit} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" fontSize={12} stroke="#9CA3AF" tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" fontSize={12} stroke="#9CA3AF" tickLine={false} axisLine={false} width={80} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8, border: '1px solid #EAECF0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 13,
                  }}
                  formatter={(v: number) => [`${formatMoney(v)} 元`, '累计利润']}
                />
                <Bar dataKey="profit" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
