import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useSales } from '../hooks/useSales';
import { todayStr, formatDateCN } from '../utils/dateUtils';
import { formatMoney } from '../utils/calculations';
import type { SaleRecord } from '../types';

export default function SaleRecords() {
  const { products, adjustStock, getProduct } = useProducts();
  const { sales, addSale, deleteSale, getSalesByDate } = useSales();

  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [filterDate, setFilterDate] = useState(todayStr());
  const [search, setSearch] = useState('');

  const displaySales = useMemo(() => {
    let list = getSalesByDate(filterDate);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.productName.toLowerCase().includes(q));
    }
    return list;
  }, [getSalesByDate, filterDate, search]);

  const todayTotal = useMemo(() => {
    const ts = getSalesByDate(todayStr());
    return {
      revenue: ts.reduce((s, r) => s + r.revenue, 0),
      profit: ts.reduce((s, r) => s + r.profit, 0),
      qty: ts.reduce((s, r) => s + r.quantity, 0),
    };
  }, [sales]);

  const productOptions = products.filter((p) => p.stock > 0);
  const currentProduct = products.find((p) => p.id === selectedProduct);

  const handleAdd = () => {
    if (!currentProduct || quantity < 1) return;
    const revenue = currentProduct.salePrice * quantity;
    const profit = (currentProduct.salePrice - currentProduct.costPrice) * quantity;

    addSale({
      date: todayStr(),
      productId: currentProduct.id,
      productName: currentProduct.name,
      costPrice: currentProduct.costPrice,
      salePrice: currentProduct.salePrice,
      quantity, revenue, profit,
    });
    adjustStock(currentProduct.id, -quantity);
    setSelectedProduct('');
    setQuantity(1);
    setShowForm(false);
  };

  const handleDelete = (record: SaleRecord) => {
    deleteSale(record.id);
    adjustStock(record.productId, record.quantity);
  };

  return (
    <div className="space-y-6">
      {/* Today summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '今日营业额', value: `${formatMoney(todayTotal.revenue)} 元`, color: 'text-accent' },
          { label: '今日利润', value: `${formatMoney(todayTotal.profit)} 元`, color: 'text-success' },
          { label: '今日销量', value: `${todayTotal.qty} 件`, color: 'text-text-primary' },
        ].map((item, i) => (
          <div key={i} className="card-static p-4 text-center">
            <p className="text-xs text-text-secondary mb-1">{item.label}</p>
            <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-hint" />
          <input
            type="text" className="input pl-9" placeholder="搜索商品名称..."
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <input
          type="date" className="input w-auto"
          value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
        />
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={16} /> 新增销售
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card-static p-5 animate-in space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">新增销售记录</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1">选择商品</label>
              <select
                className="input"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="">请选择商品</option>
                {productOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — 进价{p.costPrice} / 售价{p.salePrice} / 库存{p.stock}
                  </option>
                ))}
              </select>
              {products.length > 0 && productOptions.length === 0 && (
                <p className="text-xs text-danger mt-1">所有商品已售罄，请先补货</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">数量</label>
              <input
                type="number" min={1} className="input"
                value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                disabled={!selectedProduct || quantity < 1}
                onClick={handleAdd}
                className="btn-primary flex-1"
              >
                确认销售
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary">取消</button>
            </div>
          </div>
          {currentProduct && (
            <div className="flex gap-4 text-xs text-text-secondary bg-bg rounded-btn p-3">
              <span>预估收入: <strong className="text-accent">{formatMoney(currentProduct.salePrice * quantity)} 元</strong></span>
              <span>预估利润: <strong className="text-success">{formatMoney((currentProduct.salePrice - currentProduct.costPrice) * quantity)} 元</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Sales table */}
      <div className="card-static overflow-hidden">
        {displaySales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-hint">
            <Search size={40} className="mb-3 opacity-30" />
            <span>{search ? '未找到匹配记录' : '暂无销售记录'}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-5 py-3 font-semibold">商品</th>
                  <th className="text-right px-5 py-3 font-semibold">数量</th>
                  <th className="text-right px-5 py-3 font-semibold">单价</th>
                  <th className="text-right px-5 py-3 font-semibold">小计</th>
                  <th className="text-right px-5 py-3 font-semibold">利润</th>
                  <th className="text-center px-5 py-3 font-semibold w-16">操作</th>
                </tr>
              </thead>
              <tbody>
                {displaySales.map((record) => (
                  <tr key={record.id} className="table-row">
                    <td className="px-5 font-medium text-text-primary">{record.productName}</td>
                    <td className="px-5 text-right">{record.quantity}</td>
                    <td className="px-5 text-right text-text-secondary">{formatMoney(record.salePrice)}</td>
                    <td className="px-5 text-right font-medium text-accent">{formatMoney(record.revenue)} 元</td>
                    <td className="px-5 text-right font-medium text-success">{formatMoney(record.profit)} 元</td>
                    <td className="px-5 text-center">
                      <button
                        onClick={() => handleDelete(record)}
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
  );
}
