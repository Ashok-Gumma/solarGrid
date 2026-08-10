import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { StockMovement } from '../../types';

export function StockMovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetchApi<StockMovement[]>('/stock-movements?limit=100');
      if (res.success && res.data) setMovements(res.data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6 animate-rise">
      <div className="page-header">
        <h1>Stock Movement Audit Ledger</h1>
        <p>Audited log of every stock IN and OUT transaction across sales challans, purchases, and service repairs.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
        </div>
      ) : (
        <div className="surface p-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-bold">Timestamp</th>
                <th className="pb-3 font-bold">Type</th>
                <th className="pb-3 font-bold">Component</th>
                <th className="pb-3 font-bold">Quantity</th>
                <th className="pb-3 font-bold">Reason</th>
                <th className="pb-3 font-bold">Reference</th>
                <th className="pb-3 font-bold">Logged By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 mono text-slate-400">{new Date(m.createdAt).toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`badge ${m.movementType === 'IN' ? 'badge-green' : 'badge-red'}`}>
                      {m.movementType === 'IN' ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                      {m.movementType}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-slate-900">{m.productName}</td>
                  <td className="py-3 font-semibold text-emerald-700">{m.quantity} units</td>
                  <td className="py-3 text-slate-500">{m.reason}</td>
                  <td className="py-3 mono text-slate-400">{m.referenceId || '—'}</td>
                  <td className="py-3 text-slate-400">{m.createdByName || 'System'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
