import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

const CORRECT_PASSWORD = 'zhangyu2025';

interface PasswordGateProps {
  onUnlock: () => void;
}

export default function PasswordGate({ onUnlock }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [exiting, setExiting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setExiting(true);
      sessionStorage.setItem('booth_auth', 'true');
      setTimeout(() => onUnlock(), 250);
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg transition-opacity duration-250"
      style={{ opacity: exiting ? 0 : 1 }}
    >
      <div className="w-full max-w-sm mx-4 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">¥</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">摊位账本</h1>
          <p className="text-sm text-text-secondary mt-1">请输入密码以继续</p>
        </div>

        {/* Password form */}
        <form onSubmit={handleSubmit} className="card-static p-6 space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className={`input pr-10 ${error ? 'border-danger' : ''}`}
              placeholder="输入密码"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              autoFocus
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-hint hover:text-text-secondary transition"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-danger text-center animate-fade-in">
              密码错误，请重试
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={!password.trim()}>
            进入 <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
