import React, { useState } from 'react';
import { Plus, Trash2, Package, ShoppingBag, ArrowUp, ArrowDown, X } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useStockIn } from '../hooks/useSales';
import { todayStr, formatDateCN } from '../utils/dateUtils';
import { formatMoney } from '../utils/calculations';
import type { StockInRecord } from '../types';

const COST_OPTIONS = [7, 10, 12, 15, 20, 30, 40, 45, 50, 55, 65, 75];

export default function StockIn() {
  const { products, adjustStock } = useProducts();
  const { stockIns, addStockIn, deleteStockIn } = useStockIn();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [costPrice, setCostPrice] = useState(7);
  const [quantity, setQuantity] = useState(1);
  const [costCustom, setCostCustom] = useState(false);

  const currentProduct = products.find((p) => p.id === selectedProduct);

  const handleAdd = () => {
    if (!currentProduct || quantity < 1) return;
    const totalCost = costPrice * quantity;
    addStockIn({
      date: todayStr(),
      productId: currentProduct.id,
      productName: currentProduct.name,
      costPrice, quantity, totalCost,
    });
    adjustStock(currentProduct.id, quantity);
    setSelectedProduct('');
    setQuantity(1);
    setCostPrice(COST_OPTIONS[0]);
    setCostCustom(false);
    setModalOpen(false);
  };

  const handleDelete = (record: StockInRecord) => {
    deleteStockIn(record.id);
    adjustStock(record.productId, -record.quantity);
  };

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock === 0) return { label: '缺货', cls: 'badge-danger' };
    if (stock < threshold) return { label: '库存预警', cls: 'badge-warning' };
    return { label: '正常', cls: 'badge-success' };
  };

  return (
    <div className="space-y-6">
      {/* Inventory card grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text-primary">库存概览</h3>
          <button onClick={() => setModalOpen(true)} className="btn-primary btn-sm">
            <Plus size={14} /> 新增进货
          </button>
        </div>

        {products.length === 0 ? (
          <div className="card-static p-12 text-center text-text-hint">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <span>暂无商品，请先在商品管理中添加</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((p) => {
              const status = getStockStatus(p.stock, p.lowStockThreshold);
              const borderColor = p.stock === 0 ? 'border-danger' : p.stock < p.lowStockThreshold ? 'border-warning' : 'border-border';
              return (
                <div
                  key={p.id}
                  className={`card-static p-4 border-l-2 ${borderColor} hover:translate-y-[-2px] transition-all duration-200`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-semibold text-text-primary truncate flex-1">{p.name}</span>
                    <span className={status.cls}>{status.label}</span>
                  </div>

                  <div className="mb-4">
                    <span className={`text-[28px] font-bold leading-none ${p.stock === 0 ? 'text-danger' : p.stock < p.lowStockThreshold ? 'text-warning' : 'text-text-primary'}`}>
                      {p.stock}
                    </span>
                    <span className="text-sm text-text-secondary ml-1">件</span>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 btn-sm btn-secondary text-xs">
                      <ShoppingBag size={12} /> 卖出
                    </button>
                    <button className="flex-1 btn-sm btn-primary text-xs">
                      <ArrowUp size={12} /> 补货
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stock-in history */}
      <div>
        <h3 className="text-base font-semibold text-text-primary mb-4">进货记录</h3>
        <div className="card-static overflow-hidden">
          {stockIns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-hint">
              <ArrowUp size={36} className="mb-2 opacity-30" />
              <span>暂无进货记录</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header">
                    <th className="text-left px-5 py-3 font-semibold">日期</th>
                    <th className="text-left px-5 py-3 font-semibold">商品</th>
                    <th className="text-right px-5 py-3 font-semibold">进价</th>
                    <th className="text-right px-5 py-3 font-semibold">数量</th>
                    <th className="text-right px-5 py-3 font-semibold">总成本</th>
                    <th className="text-center px-5 py-3 font-semibold w-16">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {[...stockIns].reverse().map((r) => (
                    <tr key={r.id} className="table-row">
                      <td className="px-5 text-text-secondary">{formatDateCN(r.date)}</td>
                      <td className="px-5 font-medium text-text-primary">{r.productName}</td>
                      <td className="px-5 text-right text-text-secondary">{formatMoney(r.costPrice)} 元</td>
                      <td className="px-5 text-right">{r.quantity}</td>
                      <td className="px-5 text-right font-medium text-accent">{formatMoney(r.totalCost)} 元</td>
                      <td className="px-5 text-center">
                        <button
                          onClick={() => handleDelete(r)}
                          className="p-1.5 text-text-hint hover:text-danger hover:bg-red-50 rounded-btn transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Stock-in modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-text-primary">新增进货</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-bg rounded-btn transition">
                <X size={18} className="text-text-secondary" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">选择商品</label>
                <select
                  className="input"
                  value={selectedProduct}
                  onChange={(e) => {
                    setSelectedProduct(e.target.value);
                    const p = products.find((x) => x.id === e.target.value);
                    if (p && COST_OPTIONS.includes(p.costPrice)) {
                      setCostPrice(p.costPrice);
                      setCostCustom(false);
                    }
                  }}
                >
                  <option value="">请选择商品</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (库存: {p.stock})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1.5">进货价</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {COST_OPTIONS.map((p) => (
                    <button
                      key={p}
                      className={`px-3 py-1.5 text-xs font-medium rounded-btn border transition-all duration-200 ${
                        !costCustom && costPrice === p
                          ? 'bg-accent text-white border-accent'
                          : 'border-border text-text-secondary hover:border-accent'
                      }`}
                      onClick={() => { setCostCustom(false); setCostPrice(p); }}
                    >
                      {p}元
                    </button>
                  ))}
                  <button
                    className={`px-3 py-1.5 text-xs font-medium rounded-btn border transition-all duration-200 ${
                      costCustom ? 'bg-accent text-white border-accent' : 'border-border text-text-secondary hover:border-accent'
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

              <div>
                <label className="block text-sm text-text-secondary mb-1.5">进货数量</label>
                <input
                  type="number" min={1} className="input"
                  value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>

              {currentProduct && (
                <div className="bg-bg rounded-btn p-3 text-xs text-text-secondary">
                  进货后库存：<strong className="text-text-primary">{currentProduct.stock + quantity}</strong> 件
                  &nbsp;|&nbsp; 总成本：<strong className="text-accent">{formatMoney(costPrice * quantity)} 元</strong>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="btn-secondary">取消</button>
              <button onClick={handleAdd} disabled={!selectedProduct || quantity < 1} className="btn-primary">
                确认进货
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
