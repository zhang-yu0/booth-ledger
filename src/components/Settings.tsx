import React, { useState, useRef } from 'react';
import { Download, Upload, Trash2, Check } from 'lucide-react';
import { useSettings } from '../hooks/useSales';
import { useProducts } from '../hooks/useProducts';
import { useSales, useExpenses, useStockIn } from '../hooks/useSales';

export default function Settings() {
  const { settings, setSettings } = useSettings();
  const { products, setProducts } = useProducts();
  const { sales, setSales } = useSales();
  const { expenses, setExpenses } = useExpenses();
  const { stockIns, setStockIns } = useStockIn();

  const [confirmClear, setConfirmClear] = useState(false);
  const [toast, setToast] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleExport = () => {
    const data = { version: 1, exportedAt: new Date().toISOString(), settings, products, sales, expenses, stockIns };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `摊位账本_备份_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('数据导出成功');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!data.version || !data.products || !data.sales || !data.expenses || !data.stockIns || !data.settings) {
          throw new Error('格式错误');
        }
        if (!window.confirm('导入将覆盖当前所有数据，确定继续？')) return;
        setSettings(data.settings);
        setProducts(data.products);
        setSales(data.sales);
        setExpenses(data.expenses);
        setStockIns(data.stockIns);
        showToast('数据导入成功');
      } catch {
        alert('文件格式错误，导入失败');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAll = () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    if (!window.confirm('此操作不可逆！再次确认清空所有数据？')) return;
    setSettings({ defaultBoothCost: 0 });
    setProducts([]);
    setSales([]);
    setExpenses([]);
    setStockIns([]);
    setConfirmClear(false);
    showToast('所有数据已清空');
  };

  return (
    <div className="max-w-xl space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-surface border border-border rounded-card px-4 py-3 shadow-card-hover animate-slide-up">
          <Check size={16} className="text-success" />
          <span className="text-sm text-text-primary">{toast}</span>
        </div>
      )}

      {/* Default booth cost */}
      <div className="card-static p-6">
        <h3 className="text-base font-semibold text-text-primary mb-4">默认摊位费</h3>
        <div className="flex items-center gap-3">
          <input
            type="number" min={0} step={0.01} className="input w-32"
            value={settings.defaultBoothCost || ''}
            onChange={(e) => setSettings({ ...settings, defaultBoothCost: parseFloat(e.target.value) || 0 })}
          />
          <span className="text-sm text-text-secondary">元</span>
        </div>
        <p className="mt-2 text-xs text-text-hint">新增每日支出时自动填入此默认值</p>
      </div>

      {/* Data management */}
      <div className="card-static p-6 space-y-5">
        <h3 className="text-base font-semibold text-text-primary">数据管理</h3>

        <div className="flex flex-wrap gap-3">
          <button onClick={handleExport} className="btn-primary">
            <Download size={16} /> 导出备份 (JSON)
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn-secondary">
            <Upload size={16} /> 导入备份
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>

        <div className="border-t border-border pt-5">
          {!confirmClear ? (
            <button onClick={handleClearAll} className="btn-danger">
              <Trash2 size={16} /> 清空所有数据
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-card p-4 space-y-3 animate-in">
              <p className="text-sm font-medium text-danger">确定要清空所有数据吗？此操作不可恢复！</p>
              <div className="flex gap-3">
                <button onClick={handleClearAll} className="btn-danger">确认清空</button>
                <button onClick={() => setConfirmClear(false)} className="btn-secondary">取消</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
