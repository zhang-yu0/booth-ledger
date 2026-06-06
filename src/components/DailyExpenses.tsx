import React, { useState } from 'react';
import { Plus, Trash2, Pencil, X, Receipt } from 'lucide-react';
import { useExpenses, useSettings } from '../hooks/useSales';
import { todayStr, formatDateCN } from '../utils/dateUtils';
import { formatMoney } from '../utils/calculations';
import type { DailyExpense } from '../types';

export default function DailyExpenses() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses();
  const { settings } = useSettings();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: todayStr(),
    boothCost: settings.defaultBoothCost,
    transportCost: 0,
    otherCost: 0,
    note: '',
  });
  const [filterDate, setFilterDate] = useState(todayStr());

  const openAdd = () => {
    setEditingId(null);
    setForm({
      date: todayStr(),
      boothCost: settings.defaultBoothCost,
      transportCost: 0,
      otherCost: 0,
      note: '',
    });
    setModalOpen(true);
  };

  const openEdit = (e: DailyExpense) => {
    setEditingId(e.id);
    setForm({
      date: e.date,
      boothCost: e.boothCost,
      transportCost: e.transportCost,
      otherCost: e.otherCost,
      note: e.note,
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (editingId) {
      updateExpense(editingId, form);
    } else {
      addExpense(form);
    }
    setModalOpen(false);
  };

  const totalCost = (e: DailyExpense) => e.boothCost + e.transportCost + e.otherCost;

  const filtered = expenses
    .filter((e) => (filterDate ? e.date === filterDate : true))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm text-text-secondary">日期:</label>
          <input
            type="date" className="input w-auto"
            value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
          />
          {filterDate && (
            <button
              className="text-xs text-text-hint hover:text-text-secondary"
              onClick={() => setFilterDate('')}
            >
              清除
            </button>
          )}
        </div>
        <div className="flex-1" />
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> 新增支出
        </button>
      </div>

      {/* Expenses table */}
      <div className="card-static overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-hint">
            <Receipt size={48} className="mb-3 opacity-30" />
            <span>{filterDate ? `${formatDateCN(filterDate)} 暂无支出记录` : '暂无支出记录'}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-5 py-3 font-semibold">日期</th>
                  <th className="text-right px-5 py-3 font-semibold">摊位费</th>
                  <th className="text-right px-5 py-3 font-semibold">运输费</th>
                  <th className="text-right px-5 py-3 font-semibold">其他</th>
                  <th className="text-right px-5 py-3 font-semibold">合计</th>
                  <th className="text-left px-5 py-3 font-semibold">备注</th>
                  <th className="text-center px-5 py-3 font-semibold w-20">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="table-row">
                    <td className="px-5 text-text-secondary">{formatDateCN(e.date)}</td>
                    <td className="px-5 text-right text-text-secondary">{formatMoney(e.boothCost)}</td>
                    <td className="px-5 text-right text-text-secondary">{formatMoney(e.transportCost)}</td>
                    <td className="px-5 text-right text-text-secondary">{formatMoney(e.otherCost)}</td>
                    <td className="px-5 text-right font-semibold text-danger">{formatMoney(totalCost(e))} 元</td>
                    <td className="px-5 text-text-hint max-w-[120px] truncate">{e.note || '-'}</td>
                    <td className="px-5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEdit(e)}
                          className="p-1.5 text-text-hint hover:text-accent hover:bg-accent-light rounded-btn transition"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => deleteExpense(e.id)}
                          className="p-1.5 text-text-hint hover:text-danger hover:bg-red-50 rounded-btn transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-text-primary">
                {editingId ? '编辑支出' : '新增支出'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-bg rounded-btn transition">
                <X size={18} className="text-text-secondary" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">日期</label>
                <input
                  type="date" className="input"
                  value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">摊位费</label>
                  <input
                    type="number" min={0} step={0.01} className="input"
                    value={form.boothCost || ''}
                    onChange={(e) => setForm({ ...form, boothCost: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">运输费</label>
                  <input
                    type="number" min={0} step={0.01} className="input"
                    value={form.transportCost || ''}
                    onChange={(e) => setForm({ ...form, transportCost: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">其他支出</label>
                  <input
                    type="number" min={0} step={0.01} className="input"
                    value={form.otherCost || ''}
                    onChange={(e) => setForm({ ...form, otherCost: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">备注</label>
                <input
                  type="text" className="input" placeholder="可选备注"
                  value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="btn-secondary">取消</button>
              <button onClick={handleSubmit} className="btn-primary">
                {editingId ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
