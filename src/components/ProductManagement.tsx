import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { formatMoney, calcProfitMarginSimple } from '../utils/calculations';
import type { Product } from '../types';

const COST_OPTIONS = [7, 10, 12, 15, 20, 30, 40, 45, 50, 55, 65, 75];

const emptyForm = { name: '', costPrice: 7, salePrice: 0, stock: 0, lowStockThreshold: 5 };

export default function ProductManagement() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [costCustom, setCostCustom] = useState(false);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, costPrice: COST_OPTIONS[0] });
    setCostCustom(false);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({ name: p.name, costPrice: p.costPrice, salePrice: p.salePrice, stock: p.stock, lowStockThreshold: p.lowStockThreshold });
    setCostCustom(!COST_OPTIONS.includes(p.costPrice));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      updateProduct(editingId, form);
    } else {
      addProduct(form);
    }
    closeModal();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`确定删除「${name}」？此操作不可恢复。`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-hint" />
          <input
            type="text" className="input pl-9" placeholder="搜索商品名称..."
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> 新增商品
        </button>
      </div>

      {/* Products table */}
      <div className="card-static overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-hint">
            <Search size={48} className="mb-3 opacity-30" />
            <span className="mb-4">
              {search ? '未找到匹配商品' : '暂无商品'}
            </span>
            {!search && (
              <button onClick={openAdd} className="btn-primary">添加第一个商品</button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-5 py-3 font-semibold">商品名称</th>
                  <th className="text-right px-5 py-3 font-semibold">进货价</th>
                  <th className="text-right px-5 py-3 font-semibold">售价</th>
                  <th className="text-right px-5 py-3 font-semibold">库存</th>
                  <th className="text-right px-5 py-3 font-semibold">单件利润</th>
                  <th className="text-center px-5 py-3 font-semibold w-24">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const unitProfit = p.salePrice - p.costPrice;
                  const isLow = p.stock < p.lowStockThreshold;
                  return (
                    <tr key={p.id} className="table-row">
                      <td className="px-5">
                        <span className="font-medium text-text-primary">{p.name}</span>
                      </td>
                      <td className="px-5 text-right text-text-secondary">{formatMoney(p.costPrice)} 元</td>
                      <td className="px-5 text-right text-text-secondary">{formatMoney(p.salePrice)} 元</td>
                      <td className="px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isLow && <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />}
                          <span className={isLow ? 'text-danger font-semibold' : 'text-text-primary'}>
                            {p.stock}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 text-right">
                        <span className={`font-medium ${unitProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                          {unitProfit >= 0 ? '+' : ''}{formatMoney(unitProfit)} 元
                        </span>
                      </td>
                      <td className="px-5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 text-text-hint hover:text-accent hover:bg-accent-light rounded-btn transition"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 text-text-hint hover:text-danger hover:bg-red-50 rounded-btn transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-text-primary">
                {editingId ? '编辑商品' : '新增商品'}
              </h3>
              <button onClick={closeModal} className="p-1.5 hover:bg-bg rounded-btn transition">
                <X size={18} className="text-text-secondary" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">商品名称</label>
                <input
                  type="text" className="input" placeholder="输入商品名称"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1.5">进货价</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {COST_OPTIONS.map((price) => (
                    <button
                      key={price}
                      className={`px-3 py-1.5 text-xs font-medium rounded-btn border transition-all duration-200 ${
                        !costCustom && form.costPrice === price
                          ? 'bg-accent text-white border-accent'
                          : 'border-border text-text-secondary hover:border-accent'
                      }`}
                      onClick={() => { setCostCustom(false); setForm({ ...form, costPrice: price }); }}
                    >
                      {price}元
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
                    value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: parseFloat(e.target.value) || 0 })}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">售价（元）</label>
                  <input
                    type="number" min={0} step={0.01} className="input"
                    value={form.salePrice || ''}
                    onChange={(e) => setForm({ ...form, salePrice: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">库存数量</label>
                  <input
                    type="number" min={0} className="input"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Math.max(0, parseInt(e.target.value) || 0) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1.5">补货提醒阈值</label>
                <input
                  type="number" min={0} className="input"
                  value={form.lowStockThreshold}
                  onChange={(e) => setForm({ ...form, lowStockThreshold: Math.max(0, parseInt(e.target.value) || 0) })}
                />
              </div>

              {form.costPrice > 0 && form.salePrice > 0 && (
                <div className="bg-bg rounded-btn p-3 text-xs text-text-secondary">
                  利润率：<span className={`font-semibold ${form.salePrice >= form.costPrice ? 'text-success' : 'text-danger'}`}>
                    {formatMoney(calcProfitMarginSimple(form.costPrice, form.salePrice))}%
                  </span>
                  &nbsp;|&nbsp; 单件利润：
                  <span className={`font-semibold ${form.salePrice >= form.costPrice ? 'text-success' : 'text-danger'}`}>
                    {formatMoney(form.salePrice - form.costPrice)} 元
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={closeModal} className="btn-secondary">取消</button>
              <button onClick={handleSave} disabled={!form.name.trim()} className="btn-primary">
                {editingId ? '保存修改' : '添加商品'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
