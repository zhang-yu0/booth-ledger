import React, { useState, useMemo } from 'react';
import { Minus, Plus } from 'lucide-react';
import { formatMoney } from '../utils/calculations';

const COST_OPTIONS = [7, 10, 12, 15, 20, 30, 40, 45, 50, 55, 65, 75];

export default function ProfitCalculator() {
  const [costPrice, setCostPrice] = useState(7);
  const [salePrice, setSalePrice] = useState(10);
  const [quantity, setQuantity] = useState(1);
  const [costCustom, setCostCustom] = useState(false);

  const result = useMemo(() => {
    const totalCost = costPrice * quantity;
    const totalRevenue = salePrice * quantity;
    const grossProfit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    return { totalCost, totalRevenue, grossProfit, margin };
  }, [costPrice, salePrice, quantity]);

  return (
    <div className="max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Input area */}
        <div className="card-static p-6 space-y-5">
          <h3 className="text-base font-semibold text-text-primary">输入参数</h3>

          <div>
            <label className="block text-sm text-text-secondary mb-2">进货价</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {COST_OPTIONS.map((p) => (
                <button
                  key={p}
                  className={`py-2 text-sm font-medium rounded-btn border transition-all duration-200 ${
                    !costCustom && costPrice === p
                      ? 'bg-accent text-white border-accent'
                      : 'border-border text-text-secondary hover:border-accent hover:text-accent'
                  }`}
                  onClick={() => { setCostCustom(false); setCostPrice(p); }}
                >
                  {p}元
                </button>
              ))}
              <button
                className={`py-2 text-sm font-medium rounded-btn border transition-all duration-200 ${
                  costCustom
                    ? 'bg-accent text-white border-accent'
                    : 'border-border text-text-secondary hover:border-accent hover:text-accent'
                }`}
                onClick={() => setCostCustom(true)}
              >
                自定义
              </button>
            </div>
            {costCustom && (
              <input
                type="number" min={0} step={0.01}
                className="input" value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                placeholder="输入进货价"
              />
            )}
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">售价（元）</label>
            <input
              type="number" min={0} step={0.01}
              className="input"
              value={salePrice || ''}
              onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
              placeholder="输入售价"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">数量</label>
            <div className="flex items-center gap-2">
              <button
                className="w-10 h-10 rounded-btn border border-border flex items-center justify-center hover:bg-bg transition"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={16} className="text-text-secondary" />
              </button>
              <input
                type="number" min={1}
                className="input w-24 text-center"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <button
                className="w-10 h-10 rounded-btn border border-border flex items-center justify-center hover:bg-bg transition"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus size={16} className="text-text-secondary" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Result card */}
        <div className="card-static p-6 space-y-4">
          <h3 className="text-base font-semibold text-text-primary mb-2">计算结果</h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-text-secondary">总成本</span>
              <span className="text-sm font-medium text-text-primary">{formatMoney(result.totalCost)} 元</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-text-secondary">总销售额</span>
              <span className="text-sm font-medium text-text-primary">{formatMoney(result.totalRevenue)} 元</span>
            </div>

            <div className="border-t border-border pt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-text-secondary">毛利润</span>
                <span className={`text-xl font-bold ${result.grossProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatMoney(result.grossProfit)} 元
                </span>
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-secondary">利润率</span>
                <span className={`text-xl font-bold ${result.margin >= 0 ? 'text-accent' : 'text-danger'}`}>
                  {formatMoney(result.margin)}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill bg-accent"
                  style={{ width: `${Math.min(Math.abs(result.margin), 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
