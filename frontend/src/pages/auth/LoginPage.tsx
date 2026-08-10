import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Sun, Check, ArrowRight, UserRound, LayoutDashboard, Wrench, ShieldCheck, Box, Calculator } from 'lucide-react';
import { useAuth, Role } from '../../lib/auth-context';

export function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>('ADMIN');

  const roleConfigs: { role: Role; title: string; desc: string; icon: any; color: string }[] = [
    { role: 'ADMIN', title: 'Operations Admin', desc: 'Full access to users, stock, orders & dispatch', icon: LayoutDashboard, color: 'bg-[#d7e3df] text-[#345b4d]' },
    { role: 'SALES', title: 'Sales & CRM', desc: 'Customer follow-ups, orders & challans generation', icon: UserRound, color: 'bg-[#d1e5a1] text-[#34552e]' },
    { role: 'WAREHOUSE', title: 'Warehouse Operations', desc: 'Inventory stock, movements & equipment allocation', icon: Box, color: 'bg-[#e7d9c6] text-[#785429]' },
    { role: 'ACCOUNTS', title: 'Accounts & Billing', desc: 'Challan financial records & customer transactions', icon: Calculator, color: 'bg-[#d2e0ea] text-[#294c63]' },
    { role: 'TECHNICIAN', title: 'Field Technician', desc: 'Assigned installation & service jobs route', icon: Wrench, color: 'bg-[#eee0cb] text-[#8a6738]' },
    { role: 'CUSTOMER', title: 'Customer Portal', desc: 'Shop equipment, book installation & warranties', icon: ShieldCheck, color: 'bg-[#e2edd3] text-[#3e5e2e]' },
  ];

  const handleEnterWorkspace = async () => {
    const roleEmails: Record<Role, string> = {
      ADMIN: 'admin@solargrid.com',
      SALES: 'sales@solargrid.com',
      WAREHOUSE: 'warehouse@solargrid.com',
      ACCOUNTS: 'accounts@solargrid.com',
      TECHNICIAN: 'tech@solargrid.com',
      CUSTOMER: 'aarav@mehtagroup.in',
    };

    await login(roleEmails[selectedRole], 'password123', selectedRole);

    const redirectPath: Record<Role, string> = {
      ADMIN: '/admin',
      SALES: '/customers',
      WAREHOUSE: '/inventory',
      ACCOUNTS: '/challans',
      TECHNICIAN: '/technician',
      CUSTOMER: '/store',
    };

    setLocation(redirectPath[selectedRole]);
  };

  return (
    <div className="grid min-h-screen bg-[#f3f5e9] md:grid-cols-[0.9fr_1.1fr]">
      {/* Left Branding Panel */}
      <div className="relative hidden overflow-hidden bg-[#183d2a] p-12 text-[#edf3dd] md:flex md:flex-col justify-between">
        <div className="flex items-center gap-2 font-bold tracking-tight text-[#eff2df]">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#c5df54] text-[#183d2a]">
            <Sun size={22} strokeWidth={2.5} />
          </span>
          <span className="text-2xl">
            solar<span className="text-[#9ab83c]">grid</span>
          </span>
        </div>

        <div className="relative max-w-md pb-8 z-10">
          <p className="mono mb-4 text-xs uppercase tracking-[0.2em] text-[#b9d778]">
            Mini ERP + CRM Operations Portal
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Solar Equipment Wholesale & Operations Layer.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-[#bdcfbd]">
            One integrated system for CRM follow-ups, stock movement, transactional sales challans, installation crews, and field repair services.
          </p>

          <div className="mt-8 flex gap-6 text-sm text-[#abc39e]">
            <div>
              <b className="block text-2xl text-[#c5df54]">6.2 MW</b>
              <span>Equipment Distributed</span>
            </div>
            <div>
              <b className="block text-2xl text-[#c5df54]">5 Roles</b>
              <span>Enforced Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Role Selector Panel */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-2 md:hidden">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#c5df54] text-[#183d2a]">
              <Sun size={18} strokeWidth={2.5} />
            </span>
            <span className="text-xl font-bold text-[#183d2a]">solargrid</span>
          </div>

          <p className="mono mb-2 text-xs uppercase tracking-wider text-[#6f9841]">
            Hiring Assignment Demo Portal
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-[#1c3e29]">
            Sign in to SolarGrid
          </h2>
          <p className="mt-2 text-sm text-[#6c7b70]">
            Select a role profile below to launch into the corresponding workspace.
          </p>

          {/* Role selector cards */}
          <div className="mt-6 space-y-2.5">
            {roleConfigs.map((cfg) => {
              const Icon = cfg.icon;
              const isSelected = selectedRole === cfg.role;
              return (
                <button
                  key={cfg.role}
                  type="button"
                  onClick={() => setSelectedRole(cfg.role)}
                  className={`flex w-full items-center gap-3.5 rounded-2xl border p-3.5 text-left transition ${
                    isSelected
                      ? 'border-[#6f9841] bg-[#e7efcf] shadow-xs'
                      : 'border-[#d6decd] bg-[#fbfcf6] hover:border-[#a8bc93]'
                  }`}
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${cfg.color}`}>
                    <Icon size={19} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <b className="block text-sm font-bold text-[#294731] truncate">{cfg.title}</b>
                    <span className="block text-xs text-[#758379] truncate">{cfg.desc}</span>
                  </div>
                  {isSelected && <Check size={18} className="text-[#5d8136] shrink-0" />}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleEnterWorkspace}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#244f36] py-3.5 text-sm font-bold text-white transition hover:bg-[#183d2a]"
          >
            <span>Enter {selectedRole} Portal</span>
            <ArrowRight size={17} />
          </button>

          <p className="mt-4 text-center text-xs text-[#89968c]">
            Test Credentials: <span className="font-mono text-[#25452f]">admin@solargrid.com / password123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
