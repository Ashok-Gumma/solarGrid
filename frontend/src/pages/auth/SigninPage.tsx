import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, Lock, Mail, ShieldCheck, HardHat, Box, ShoppingBag, Sun } from 'lucide-react';
import { useAuth, Role } from '../../lib/auth-context';

export function SigninPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState<Role | 'ALL'>('ALL');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rolePortals: { role: Role; label: string; icon: any; emailHint: string }[] = [
    { role: 'ADMIN',      label: 'Admin',      icon: ShieldCheck, emailHint: 'admin@solargrid.com' },
    { role: 'WAREHOUSE',  label: 'Warehouse',  icon: Box,         emailHint: 'warehouse@solargrid.com' },
    { role: 'TECHNICIAN', label: 'Technician', icon: HardHat,     emailHint: 'tech@solargrid.com' },
    { role: 'CUSTOMER',   label: 'Customer',   icon: ShoppingBag, emailHint: '' },
  ];

  const handleTabClick = (p: typeof rolePortals[0]) => {
    setActiveTab(p.role);
    if (p.role !== 'CUSTOMER') { setEmail(p.emailHint); setPassword('password123'); }
    else { setEmail(''); setPassword(''); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const loggedInUser = await login(email, password);
    if (loggedInUser) {
      const redirects: Record<Role, string> = {
        ADMIN: '/admin', WAREHOUSE: '/inventory', TECHNICIAN: '/technician',
        CUSTOMER: '/store', SALES: '/admin', ACCOUNTS: '/admin',
      };
      setLocation(redirects[loggedInUser.role] || '/store');
    } else {
      setError('Invalid email or password.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f0f0f2] flex items-center justify-center p-6">
      {/* Subtle glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-emerald-300/10 blur-[140px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-blue-300/8 blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8 group">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 shadow-lg group-hover:bg-black transition">
            <Sun size={19} className="text-amber-400" />
          </span>
          <span className="text-lg font-extrabold text-slate-800 tracking-tight">SolarGrid</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100/80 p-9">

          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign in</h1>
            <p className="text-sm text-slate-400 mt-1 font-medium">Access your workspace below.</p>
          </div>

          {/* Role selector */}
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Quick login</p>
            <div className="grid grid-cols-4 gap-2">
              {rolePortals.map((p) => {
                const Icon = p.icon;
                const active = activeTab === p.role;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleTabClick(p)}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border py-3 px-2 text-xs font-semibold transition cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                  >
                    <Icon size={16} className={active ? 'text-white' : 'text-slate-400'} />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@solargrid.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition focus:bg-white focus:border-slate-400 font-medium placeholder:text-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition focus:bg-white focus:border-slate-400 font-medium placeholder:text-slate-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white transition hover:bg-black disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-5">
            No account?{' '}
            <Link href="/signup" className="font-bold text-slate-700 hover:text-emerald-600 transition">
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5 font-medium">
          SolarGrid Enterprise · Secure Workspace
        </p>
      </div>
    </div>
  );
}
