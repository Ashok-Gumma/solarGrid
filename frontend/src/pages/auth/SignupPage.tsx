import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, Lock, Mail, User, Phone, Building, Sun } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { CustomerType } from '../../types';

export function SignupPage() {
  const [, setLocation] = useLocation();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('RETAIL');
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const newUser = await register({
        name, email, phone, password, customerType,
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

  const inputClass = "w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition focus:bg-white focus:border-slate-400 font-medium placeholder:text-slate-300";
  const labelClass = "block text-xs font-bold text-slate-600 mb-2";

  const accountTypes = [
    { type: 'RETAIL',      label: 'Retail',      sub: 'Personal buyer' },
    { type: 'WHOLESALE',   label: 'Wholesale',   sub: 'Dealer / reseller' },
    { type: 'DISTRIBUTOR', label: 'Distributor', sub: 'Bulk partner' },
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f2] flex items-center justify-center p-6 py-10">
      {/* Background */}
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
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create account</h1>
            <p className="text-sm text-slate-400 mt-1 font-medium">Register as a solar equipment customer.</p>
          </div>

          {/* Account type selector */}
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Account type</p>
            <div className="grid grid-cols-3 gap-2">
              {accountTypes.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setCustomerType(t.type as CustomerType)}
                  className={`flex flex-col items-center gap-0.5 rounded-2xl border py-3 px-2 text-center transition cursor-pointer ${
                    customerType === t.type
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold">{t.label}</span>
                  <span className={`text-[10px] leading-tight ${customerType === t.type ? 'text-slate-300' : 'text-slate-400'}`}>{t.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className={labelClass}>Full name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ravi Kumar" className={inputClass} />
              </div>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Business fields */}
            {customerType !== 'RETAIL' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Business name</label>
                  <div className="relative">
                    <Building size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Solar Energy Co." className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>GSTIN</label>
                  <input type="text" required value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="27AAAAA0000A1Z5" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:bg-white focus:border-slate-400 font-medium placeholder:text-slate-300" />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className={inputClass} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white transition hover:bg-black disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating account…' : 'Create account'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-5">
            Already have an account?{' '}
            <Link href="/signin" className="font-bold text-slate-700 hover:text-emerald-600 transition">
              Sign in
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
