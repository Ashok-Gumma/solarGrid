import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, Lock, Mail, ShieldCheck, HardHat, Box, ShoppingBag, Sun, Eye, EyeOff, CheckCircle2, Zap } from 'lucide-react';
import { useAuth, Role } from '../../lib/auth-context';

export function SigninPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState<Role | 'ALL'>('ALL');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rolePortals: { role: Role; label: string; icon: any; emailHint: string; desc: string; color: string }[] = [
    { role: 'ADMIN',      label: 'Admin',      icon: ShieldCheck, emailHint: 'admin@solargrid.com',      desc: 'Full ERP & CRM control',  color: 'emerald' },
    { role: 'WAREHOUSE',  label: 'Warehouse',  icon: Box,         emailHint: 'warehouse@solargrid.com',  desc: 'Inventory & Dispatch',   color: 'blue' },
    { role: 'TECHNICIAN', label: 'Technician', icon: HardHat,     emailHint: 'tech@solargrid.com',       desc: 'Field Installations',     color: 'amber' },
    { role: 'CUSTOMER',   label: 'Customer',   icon: ShoppingBag, emailHint: '',                        desc: 'Store & Warranties',      color: 'slate' },
  ];

  const handleTabClick = (p: typeof rolePortals[0]) => {
    setActiveTab(p.role);
    if (p.role !== 'CUSTOMER') {
      setEmail(p.emailHint);
      setPassword('password123');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const loggedInUser = await login(email, password);
    if (loggedInUser) {
      const redirects: Record<Role, string> = {
        ADMIN: '/admin', WAREHOUSE: '/inventory', TECHNICIAN: '/technician', CUSTOMER: '/store',
      };
      setLocation(redirects[loggedInUser.role] || '/store');
    } else {
      setError('Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden font-sans">
      {/* Dynamic Ambient Backdrops */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -right-40 h-[650px] w-[650px] rounded-full bg-emerald-500/15 blur-[160px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-[650px] w-[650px] rounded-full bg-blue-600/15 blur-[160px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* Main Glass Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-2xl shadow-2xl shadow-black/80 overflow-hidden">

          {/* Left Hero Panel (Hidden on Mobile) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-10 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 border-r border-slate-800/80 relative">
            <div>
              <Link href="/" className="inline-flex items-center gap-3 group">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
                  <Sun size={22} className="text-slate-950 font-bold" />
                </span>
                <div>
                  <span className="text-xl font-extrabold text-white tracking-tight block leading-tight">SolarGrid</span>
                  <span className="text-[10px] uppercase font-bold tracking-[.25em] text-emerald-400">Enterprise ERP</span>
                </div>
              </Link>

              <div className="mt-12 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 backdrop-blur">
                  <Zap size={13} className="animate-bounce text-emerald-400" />
                  <span>Next-Gen Clean Energy Suite</span>
                </div>

                <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Powering Commercial & Residential Solar Operations.
                </h2>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Streamlined inventory management, automated dispatch challans, technician job routing, and real-time customer tracking in one unified portal.
                </p>

                <div className="space-y-3 pt-2">
                  {[
                    'Instant Inventory & Stock Tracking',
                    'Automated Service Request Dispatch',
                    'GST-Compliant Tax Invoices & Challans',
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800/60">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>© 2026 SolarGrid Technologies</span>
                <span className="text-emerald-400/80 font-bold">256-Bit SSL Encrypted</span>
              </div>
            </div>
          </div>

          {/* Right Auth Form Panel */}
          <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-center bg-slate-900/40">

            {/* Mobile Header Logo */}
            <div className="lg:hidden flex items-center justify-between mb-8">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400 text-slate-950 font-bold shadow-md">
                  <Sun size={18} />
                </span>
                <span className="text-lg font-extrabold text-white">SolarGrid</span>
              </Link>
              <span className="badge badge-green text-[10px]">ERP v2.4</span>
            </div>

            <div className="mb-7">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Sign in to your account</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                Select your workspace role or enter your account credentials below.
              </p>
            </div>

            {/* Role Quick Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Quick Portal Login</span>
                <span className="text-[10px] text-emerald-400 font-semibold">One-click Demo Switch</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {rolePortals.map((p) => {
                  const Icon = p.icon;
                  const active = activeTab === p.role;
                  return (
                    <button
                      key={p.role}
                      type="button"
                      onClick={() => handleTabClick(p)}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-xs font-semibold transition cursor-pointer ${
                        active
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/25 font-bold scale-[1.02]'
                          : 'bg-slate-800/50 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <Icon size={18} className={active ? 'text-slate-950' : 'text-slate-400'} />
                      <span className="text-xs">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-5 rounded-2xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-xs text-red-400 font-medium flex items-center gap-2 animate-rise">
                <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
                <span>{error}</span>
              </div>
            )}

            {/* Signin Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@solargrid.com"
                    className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 pl-11 pr-4 py-3.5 text-sm text-white outline-none transition focus:border-emerald-400 focus:bg-slate-950 font-medium placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300">Password</label>
                  <span className="text-[11px] text-slate-500 font-medium">Demo: password123</span>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 pl-11 pr-11 py-3.5 text-sm text-white outline-none transition focus:border-emerald-400 focus:bg-slate-950 font-medium placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                    Authenticating session...
                  </span>
                ) : (
                  <>
                    <span>Sign in to Workspace</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <p className="text-slate-400">
                Don't have an account?{' '}
                <Link href="/signup" className="font-bold text-emerald-400 hover:underline transition">
                  Create customer account
                </Link>
              </p>
              <Link href="/" className="text-slate-500 hover:text-slate-300 transition font-medium">
                Back to Home
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
