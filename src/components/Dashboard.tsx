import React, { useMemo } from 'react';
import {
  DollarSign, TrendingUp, ShoppingBag, Package, AlertTriangle, ArrowRight,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useProducts } from '../hooks/useProducts';
import { useSales, useExpenses } from '../hooks/useSales';
import { todayStr, daysAgo } from '../utils/dateUtils';
import { calcTotalRevenue, calcTotalProfit, calcNetProfit, formatMoney } from '../utils/calculations';

export default function Dashboard() {
  const { products, lowStockProducts } = useProducts();
  const { sales } = useSales();
  const { expenses } = useExpenses();
  const today = todayStr();

  const todaySales = useMemo(() => sales.filter((s) => s.date === today), [sales, today]);
  const todayExpenses = useMemo(() => expenses.filter((e) => e.date === today), [expenses, today]);

  const revenue = calcTotalRevenue(todaySales);
  const grossProfit = calcTotalProfit(todaySales);
  const netProfit = calcNetProfit(todaySales, todayExpenses);
  const totalStock = products.reduce((s, p) => s + p.stock, 0);

  // Yesterday comparison for trend indicators
  const yesterday = daysAgo(1);
  const yesterdaySales = useMemo(() => sales.filter((s) => s.date === yesterday), [sales, yesterday]);
  const yesterdayRevenue = calcTotalRevenue(yesterdaySales);
  const yesterdayExpenses = useMemo(() => expenses.filter((e) => e.date === yesterday), [expenses, yesterday]);
  const yesterdayNetProfit = calcNetProfit(yesterdaySales, yesterdayExpenses);

  const trendPct = (today: number, yesterday: number) => {
    if (yesterday === 0) return today > 0 ? 100 : 0;
    return ((today - yesterday) / yesterday) * 100;
  };
  const revenueTrend = trendPct(revenue, yesterdayRevenue);
  const profitTrend = trendPct(netProfit, yesterdayNetProfit);

  const todayQty = todaySales.reduce((s, r) => s + r.quantity, 0);
  const yesterdayQty = yesterdaySales.reduce((s, r) => s + r.quantity, 0);
  const qtyTrend = trendPct(todayQty, yesterdayQty);

  // 7-day profit data
  const chartData = useMemo(() => {
    const days: { label: string; profit: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = daysAgo(i);
      const ds = sales.filter((s) => s.date === d);
      const de = expenses.filter((e) => e.date === d);
      days.push({
        label: d.slice(5),
        profit: Math.round(calcNetProfit(ds, de) * 100) / 100,
      });
    }
    return days;
  }, [sales, expenses]);

  // Hot products ranking
  const hotProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; profit: number }>();
    todaySales.forEach((s) => {
      const prev = map.get(s.productId) || { name: s.productName, qty: 0, profit: 0 };
      prev.qty += s.quantity;
      prev.profit += s.profit;
      map.set(s.productId, prev);
    });
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [todaySales]);

  const MetricCard = ({
    icon, label, value, unit, trend,
  }: {
    icon: React.ReactNode; label: string; value: string; unit: string; trend: number;
  }) => (
    <div className="card p-6 animate-in">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 rounded-btn bg-accent-light flex items-center justify-center text-accent">
          {icon}
        </div>
        <span className="text-sm text-text-secondary">{label}</span>
      </div>
      <div className="text-[28px] font-bold text-text-primary leading-none mb-2">
        {value}
        <span className="text-sm font-normal text-text-secondary ml-1">{unit}</span>
      </div>
      <div className={`text-xs font-medium ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% 环比昨日
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Metric cards - 2x2 grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<DollarSign size={20} />} label="今日营业额"
          value={formatMoney(revenue)} unit="元" trend={revenueTrend}
        />
        <MetricCard
          icon={<TrendingUp size={20} />} label="净利润"
          value={formatMoney(netProfit)} unit="元" trend={profitTrend}
        />
        <MetricCard
          icon={<ShoppingBag size={20} />} label="今日销量"
          value={String(todayQty)} unit="件" trend={qtyTrend}
        />
        <MetricCard
          icon={<Package size={20} />} label="库存总量"
          value={String(totalStock)} unit="件" trend={0}
        />
      </div>

      {/* Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Profit trend - left 60% */}
        <div className="lg:col-span-3 card-static p-6">
          <h3 className="text-base font-semibold text-text-primary mb-4">利润趋势</h3>
          {chartData.every((d) => d.profit === 0) ? (
            <div className="flex flex-col items-center justify-center py-16 text-text-hint">
              <TrendingUp size={40} className="mb-2 opacity-40" />
              <span>暂无利润数据</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <XAxis dataKey="label" fontSize={12} stroke="#9CA3AF" tickLine={false} axisLine={false} />
                <YAxis fontSize={12} stroke="#9CA3AF" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8, border: '1px solid #EAECF0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 13,
                  }}
                  formatter={(v: number) => [`${formatMoney(v)} 元`, '净利润']}
                />
                <Line
                  type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={2.5}
                  dot={{ fill: '#3B82F6', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#3B82F6', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Hot products - right 40% */}
        <div className="lg:col-span-2 card-static p-6">
          <h3 className="text-base font-semibold text-text-primary mb-4">热销商品</h3>
          {hotProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-text-hint">
              <ShoppingBag size={40} className="mb-2 opacity-40" />
              <span>今日暂无销售</span>
            </div>
          ) : (
            <div className="space-y-1">
              {hotProducts.map((item, i) => {
                const barColor = i === 0 ? 'bg-accent' : i < 3 ? 'bg-gray-400' : 'bg-gray-200';
                return (
                  <div key={i} className="flex items-center gap-3 py-2.5 group">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${barColor}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">{item.name}</div>
                      <div className="text-xs text-text-hint">{item.qty} 件 · {formatMoney(item.profit)} 元</div>
                    </div>
                    <div className={`w-1 h-8 rounded-full flex-shrink-0 ${barColor}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-card p-4 flex items-center justify-between animate-in">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-warning flex-shrink-0" />
            <span className="text-sm font-medium text-amber-800">
              {lowStockProducts.length} 件商品库存不足，请及时补货
            </span>
          </div>
          <button className="btn-sm btn-secondary text-amber-700 border-amber-300 hover:bg-amber-100">
            去查看 <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* All empty state */}
      {products.length === 0 && sales.length === 0 && (
        <div className="card-static p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-accent-light flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={32} className="text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">欢迎使用摊位账本</h3>
          <p className="text-sm text-text-secondary mb-6">从添加商品和记录销售开始管理您的摊位生意</p>
          <div className="flex items-center justify-center gap-3">
            <button className="btn-primary">添加商品</button>
            <button className="btn-secondary">记录销售</button>
          </div>
        </div>
      )}
    </div>
  );
}
