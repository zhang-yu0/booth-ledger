import React, { useState, useMemo } from 'react';
import { useSettings } from '../hooks/useSales';
import { calcBreakevenPrice, formatMoney } from '../utils/calculations';

const COST_OPTIONS = [7, 10, 12, 15, 20, 30, 40, 45, 50, 55, 65, 75];

export default function BreakevenCalculator() {
  const { settings } = useSettings();
  const [costPrice, setCostPrice] = useState(7);
  const [boothCost, setBoothCost] = useState(settings.defaultBoothCost);
  const [expectedQty, setExpectedQty] = useState(10);
  const [costCustom, setCostCustom] = useState(false);

  const result = useMemo(() => {
    const breakeven = calcBreakevenPrice(costPrice, boothCost, expectedQty);
    const recommended = breakeven * 1.25;
    const totalCost = costPrice * expectedQty + boothCost;
    return { breakeven, recommended, totalCost };
  }, [costPrice, boothCost, expectedQty]);

  return (
    <div className="max-w-2xl">
      <div className="card-static p-6 space-y-6">
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
                costCustom ? 'bg-accent text-white border-accent' : 'border-border text-text-secondary hover:border-accent hover:text-accent'
              }`}
              onClick={() => setCostCustom(true)}
            >
              自定义
            </button>
          </div>
          {costCustom && (
            <input
              type="number" min={0} step={0.01} className="input"
              value={costPrice} onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">摊位成本（元）</label>
            <input
              type="number" min={0} step={0.01} className="input"
              value={boothCost || ''} onChange={(e) => setBoothCost(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">预计销量（件）</label>
            <input
              type="number" min={1} className="input"
              value={expectedQty} onChange={(e) => setExpectedQty(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <h3 className="text-base font-semibold text-text-primary mb-4">计算结果</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-bg rounded-card p-4 text-center">
              <p className="text-xs text-text-secondary mb-1">总成本</p>
              <p className="text-lg font-bold text-text-primary">{formatMoney(result.totalCost)} 元</p>
            </div>
            <div className="bg-amber-50 rounded-card p-4 text-center">
              <p className="text-xs text-text-secondary mb-1">保本售价</p>
              <p className="text-lg font-bold text-warning">{formatMoney(result.breakeven)} 元/件</p>
            </div>
            <div className="bg-accent-light rounded-card p-4 text-center">
              <p className="text-xs text-text-secondary mb-1">推荐售价</p>
              <p className="text-lg font-bold text-accent">{formatMoney(result.recommended)} 元/件</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-text-hint">
            计算公式：(进货价 × {expectedQty} + 摊位费 {formatMoney(boothCost)}) ÷ {expectedQty} = 保本价，推荐售价 = 保本价 × 1.25
          </p>
        </div>
      </div>
    </div>
  );
}
