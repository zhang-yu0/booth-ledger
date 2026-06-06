import React, { useState } from 'react';
import Layout from './components/Layout';
import type { Page } from './components/Layout';
import Dashboard from './components/Dashboard';
import SaleRecords from './components/SaleRecords';
import ProductManagement from './components/ProductManagement';
import StockIn from './components/StockIn';
import DailyExpenses from './components/DailyExpenses';
import ProfitCalculator from './components/ProfitCalculator';
import BreakevenCalculator from './components/BreakevenCalculator';
import Rankings from './components/Rankings';
import Analytics from './components/Analytics';
import Settings from './components/Settings';

const pages: Record<Page, React.ReactNode> = {
  dashboard: <Dashboard />,
  sales: <SaleRecords />,
  products: <ProductManagement />,
  stockin: <StockIn />,
  expenses: <DailyExpenses />,
  'profit-calc': <ProfitCalculator />,
  'breakeven-calc': <BreakevenCalculator />,
  rankings: <Rankings />,
  analytics: <Analytics />,
  settings: <Settings />,
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {pages[currentPage]}
    </Layout>
  );
}
