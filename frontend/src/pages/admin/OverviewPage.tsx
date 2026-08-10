import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Box, AlertTriangle, Users, FileText, HardHat, Activity, ArrowRight } from 'lucide-react';
import { fetchApi } from '../../lib/api';

export function OverviewPage() {
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState({
    customersCount: 0,
    productsCount: 0,
    lowStockCount: 0,
    ordersCount: 0,
    challansCount: 0,
    installationsCount: 0,
    servicesCount: 0,
  });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [invRes, custRes, ordRes, chalRes, instRes, srvRes, logRes] = await Promise.all([
        fetchApi<any>('/inventory'),
        fetchApi<any>('/customers?limit=100'),
        fetchApi<any[]>('/orders'),
        fetchApi<any[]>('/challans'),
        fetchApi<any[]>('/installations'),
        fetchApi<any[]>('/services'),
        fetchApi<any[]>('/audit-logs'),
      ]);

      setStats({
        productsCount: invRes.data?.totalProducts || 0,
        lowStockCount: invRes.data?.lowStockCount || 0,
        customersCount: custRes.data?.length || (Array.isArray(custRes.data?.data) ? custRes.data.data.length : 0),
        ordersCount: ordRes.data?.length || 0,
        challansCount: chalRes.data?.length || 0,
        installationsCount: instRes.data?.length || 0,
        servicesCount: srvRes.data?.length || 0,
      });

      if (logRes.success && logRes.data) setAuditLogs(logRes.data.slice(0, 6));
      setLoading(false);
    }
    load();
  }, []);

  const metricCards = [
    {
      label: 'Inventory Stock',
      value: `${stats.productsCount} SKUs`,
      sub: stats.lowStockCount > 0
        ? { text: `${stats.lowStockCount} low-stock alerts`, color: 'text-red-500' }
        : { text: 'Stock healthy', color: 'text-emerald-600' },
      icon: Box,
      nav: '/inventory',
    },
    {
      label: 'CRM Accounts',
      value: `${stats.customersCount} Accounts`,
      sub: { text: 'Retail, Wholesale & Distributors', color: 'text-slate-400' },
      icon: Users,
      nav: '/customers',
    },
    {
      label: 'Sales Challans',
      value: `${stats.challansCount} Challans`,
      sub: { text: 'Warehouse dispatch ledger', color: 'text-slate-400' },
      icon: FileText,
      nav: '/challans',
    },
    {
      label: 'Field Jobs',
      value: `${stats.installationsCount + stats.servicesCount} Assigned`,
      sub: { text: 'Installations & repair tickets', color: 'text-slate-400' },
      icon: HardHat,
      nav: '/technician',
    },
  ];

  const quickActions = [
    { icon: Box,      label: 'Inventory & Stock Desk',      desc: 'Add products, view stock levels, and log supplier restocks.',         nav: '/inventory' },
    { icon: Users,    label: 'CRM Customer Desk',           desc: 'Manage customer profiles, lead pipelines, and follow-ups.',            nav: '/customers' },
    { icon: FileText, label: 'Sales Challans & Dispatch',   desc: 'Create challans, confirm stock deduction, and issue invoices.',        nav: '/challans' },
  ];

  return (
    <div className="space-y-6 animate-rise">
      {/* Page Header */}
      <div className="page-header">
        <h1>Operations Executive Dashboard</h1>
        <p>Real-time summary across stock, sales challans, crews, and field jobs.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              onClick={() => setLocation(card.nav)}
              className="surface p-5 cursor-pointer hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="mono text-[10px] font-bold uppercase text-slate-400">{card.label}</span>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-50">
                  <Icon size={16} className="text-emerald-600" />
                </span>
              </div>
              <b className="block text-2xl font-extrabold text-slate-900">{card.value}</b>
              <span className={`mt-1 block text-[11px] font-semibold ${card.sub.color}`}>
                {card.sub.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Quick Action Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => setLocation(action.nav)}
              className="surface p-5 text-left group hover:-translate-y-0.5"
            >
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-slate-900 text-white mb-3 group-hover:bg-black transition">
                <Icon size={18} />
              </span>
              <b className="block text-xs font-bold text-slate-900">{action.label}</b>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{action.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Audit Activity Stream */}
      <section className="surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Activity size={17} className="text-emerald-600" />
            <span>Recent System Audit Stream</span>
          </div>
          <button
            onClick={() => setLocation('/audit-logs')}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition"
          >
            View full log <ArrowRight size={13} />
          </button>
        </div>

        <div className="space-y-2">
          {loading ? (
            <>
              <div className="skeleton h-10" />
              <div className="skeleton h-10" />
              <div className="skeleton h-10" />
            </>
          ) : auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No recent audit activity.</p>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="ml-2 text-slate-400">by {log.userName || 'System User'}</span>
                </div>
                <span className="mono text-[10px] text-slate-400">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
