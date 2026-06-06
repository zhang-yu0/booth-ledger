import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Receipt,
  Calculator,
  Scale,
  Trophy,
  BarChart3,
  Settings,
  Menu,
  X,
} from 'lucide-react';

export type Page =
  | 'dashboard'
  | 'sales'
  | 'products'
  | 'stockin'
  | 'expenses'
  | 'profit-calc'
  | 'breakeven-calc'
  | 'rankings'
  | 'analytics'
  | 'settings';

const mainNavItems: { page: Page; label: string }[] = [
  { page: 'dashboard', label: '仪表盘' },
  { page: 'sales', label: '销售' },
  { page: 'products', label: '商品' },
  { page: 'stockin', label: '进货' },
  { page: 'expenses', label: '支出' },
  { page: 'analytics', label: '分析' },
];

const toolItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'profit-calc', label: '利润计算器', icon: <Calculator size={16} /> },
  { page: 'breakeven-calc', label: '保本价计算器', icon: <Scale size={16} /> },
  { page: 'rankings', label: '排行榜', icon: <Trophy size={16} /> },
  { page: 'settings', label: '设置', icon: <Settings size={16} /> },
];

interface LayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}

function getTodayLabel(): string {
  const d = new Date();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${weekDays[d.getDay()]}`;
}

export default function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dateLabel, setDateLabel] = useState(getTodayLabel());

  useEffect(() => {
    const timer = setInterval(() => setDateLabel(getTodayLabel()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentLabel = [...mainNavItems, ...toolItems].find((n) => n.page === currentPage)?.label ?? '';

  const handleNav = (page: Page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const NavLinks = ({ mobile }: { mobile?: boolean }) => (
    <>
      {mainNavItems.map((item) => (
        <button
          key={item.page}
          onClick={() => handleNav(item.page)}
          className={`
            ${mobile ? 'block w-full text-left px-4 py-3 rounded-lg' : 'px-3 py-1.5 rounded-btn text-sm font-medium'}
            transition-all duration-200
            ${currentPage === item.page
              ? mobile
                ? 'bg-accent-light text-accent font-semibold'
                : 'bg-accent text-white'
              : mobile
                ? 'text-text-secondary hover:bg-bg hover:text-text-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg'
            }
          `}
        >
          {item.label}
        </button>
      ))}

      {mobile && (
        <>
          <div className="h-px bg-border my-2" />
          {toolItems.map((item) => (
            <button
              key={item.page}
              onClick={() => handleNav(item.page)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-3 ${
                currentPage === item.page
                  ? 'bg-accent-light text-accent font-semibold'
                  : 'text-text-secondary hover:bg-bg hover:text-text-primary'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </>
      )}
    </>
  );

  const Avatar = () => (
    <div className="w-8 h-8 rounded-full bg-accent-light text-accent flex items-center justify-center text-xs font-semibold">
      Z
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-bg">
      {/* Top navbar */}
      <header className="h-[60px] bg-surface border-b border-border flex items-center justify-between px-4 md:px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-1.5 hover:bg-bg rounded-btn transition"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={20} className="text-text-primary" />
          </button>

          {/* Logo */}
          <button
            onClick={() => handleNav('dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
              <span className="text-white text-xs font-bold">¥</span>
            </div>
            <span className="text-base font-semibold text-text-primary hidden sm:block">
              摊位账本
            </span>
          </button>
        </div>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex items-center gap-1">
          <NavLinks />
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-text-hint hidden sm:block">
            {dateLabel}
          </span>
          <Avatar />
        </div>
      </header>

      {/* Mobile slide-out drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-surface shadow-xl animate-slide-up overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-white text-xs font-bold">¥</span>
                </div>
                <span className="text-base font-semibold text-text-primary">摊位账本</span>
              </div>
              <button
                className="p-1.5 hover:bg-bg rounded-btn transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={18} className="text-text-secondary" />
              </button>
            </div>
            <nav className="p-3 space-y-1">
              <NavLinks mobile />
            </nav>
          </aside>
        </div>
      )}

      {/* Page content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Page header */}
        <div className="px-4 md:px-6 pt-6 pb-2 flex-shrink-0">
          <h2 className="text-xl font-semibold text-text-primary hidden lg:block">
            {currentLabel}
          </h2>
        </div>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto px-4 md:px-6 pb-8" key={currentPage}>
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
