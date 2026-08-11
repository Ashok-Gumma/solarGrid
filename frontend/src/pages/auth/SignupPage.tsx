import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, Lock, Mail, User, Phone, Building, Sun, Eye, EyeOff, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { CustomerType } from '../../types';

export function SignupPage() {
  const [, setLocation] = useLocation();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [customerType, setCustomerType] = useState<CustomerType>('RETAIL');
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    try {
      const newUser = await register({
        name,
        email,
        phone,
        password,
        customerType,
        businessName: customerType !== 'RETAIL' ? businessName : undefined,
        gstNumber: customerType !== 'RETAIL' ? gstNumber : undefined,
      });
      if (newUser) setLocation('/store');
      else setError('Registration failed. Please check your details and try again.');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Mobile number or email address may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  const accountTypes = [
    { type: 'RETAIL',      label: 'Retail Customer', sub: 'Home solar & personal' },
    { type: 'WHOLESALE',   label: 'Wholesale Dealer', sub: 'Resellers & installers' },
    { type: 'DISTRIBUTOR', label: 'Distributor Partner', sub: 'Bulk enterprise supply' },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden font-sans">
      {/* Ambient Lighting */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 h-[650px] w-[650px] rounded-full bg-emerald-500/15 blur-[160px] animate-pulse" />
        <div className="absolute -bottom-40 -right-40 h-[650px] w-[650px] rounded-full bg-blue-600/15 blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* Main Glass Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-2xl shadow-2xl shadow-black/80 overflow-hidden">

          {/* Left Hero Showcase */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-10 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 border-r border-slate-800/80 relative">
            <div>
              <Link href="/" className="inline-flex items-center gap-3 group">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
                  <Sun size={22} className="text-slate-950 font-bold" />
                </span>
                <div>
                  <span className="text-xl font-extrabold text-white tracking-tight block leading-tight">SolarGrid</span>
                  <span className="text-[10px] uppercase font-bold tracking-[.25em] text-emerald-400">Customer Portal</span>
                </div>
              </Link>

              <div className="mt-12 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 backdrop-blur">
                  <Sparkles size={13} className="text-emerald-400" />
                  <span>Join 10,000+ Solar Professionals</span>
                </div>

                <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Direct Access to Tier-1 Solar Panels & Equipment.
                </h2>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Register for retail or wholesale pricing, track warranties in real-time, generate GST invoices, and request certified installation crews.
                </p>

                <div className="space-y-3 pt-2">
                  {[
                    'Instant Wholesale & Retail Catalog Pricing',
                    'Digital Warranty Certificates & Tracking',
                    'Direct Booking for On-Site Technicians',
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
                <span>Verified Buyer Protection</span>
                <span className="text-emerald-400/80 font-bold flex items-center gap-1">
                  <ShieldCheck size={14} /> Official SolarGrid Portal
                </span>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-center bg-slate-900/40">

            {/* Mobile Header Logo */}
            <div className="lg:hidden flex items-center justify-between mb-8">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400 text-slate-950 font-bold shadow-md">
                  <Sun size={18} />
                </span>
                <span className="text-lg font-extrabold text-white">SolarGrid</span>
              </Link>
              <span className="badge badge-green text-[10px]">Create Account</span>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Create your account</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                Register as a retail buyer, dealer, or bulk enterprise distributor.
              </p>
            </div>

            {/* Account Type Selector */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Select Account Tier</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {accountTypes.map((t) => {
                  const active = customerType === t.type;
                  return (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => setCustomerType(t.type as CustomerType)}
                      className={`flex flex-col items-start p-3 rounded-2xl border text-left transition cursor-pointer ${
                        active
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 font-bold scale-[1.01]'
                          : 'bg-slate-800/50 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-xs font-bold">{t.label}</span>
                      <span className={`text-[10px] mt-0.5 ${active ? 'text-slate-900/80 font-medium' : 'text-slate-400'}`}>
                        {t.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-4 rounded-2xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-xs text-red-400 font-medium flex items-center gap-2 animate-rise">
                <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ravi Kumar"
                    className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 pl-11 pr-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:bg-slate-950 font-medium placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 pl-11 pr-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:bg-slate-950 font-medium placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mobile Phone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 pl-11 pr-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:bg-slate-950 font-medium placeholder:text-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* Business Fields (If Wholesale or Distributor) */}
              {customerType !== 'RETAIL' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                  <div>
                    <label className="block text-xs font-bold text-emerald-400 mb-1">Company / Business Name</label>
                    <div className="relative">
                      <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/70" />
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Solar Energy Ltd"
                        className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/90 pl-11 pr-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 font-medium placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-400 mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      required
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      placeholder="27AAAAA0000A1Z5"
                      className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 font-medium placeholder:text-slate-600"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 pl-11 pr-11 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:bg-slate-950 font-medium placeholder:text-slate-600"
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
                    Creating customer account...
                  </span>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <p className="text-slate-400">
                Already have an account?{' '}
                <Link href="/signin" className="font-bold text-emerald-400 hover:underline transition">
                  Sign in here
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
