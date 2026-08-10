import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { AuditLog } from '../../types';

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetchApi<AuditLog[]>('/audit-logs');
      if (res.success && res.data) setLogs(res.data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6 animate-rise">
      <div className="page-header">
        <h1>System Audit Logs</h1>
        <p>Audited trace of logins, stock adjustments, challan confirmations, and technician job updates.</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="skeleton h-12" />
          <div className="skeleton h-12" />
          <div className="skeleton h-12" />
        </div>
      ) : (
        <div className="surface p-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-bold">Timestamp</th>
                <th className="pb-3 font-bold">Action</th>
                <th className="pb-3 font-bold">Target Entity</th>
                <th className="pb-3 font-bold">User</th>
                <th className="pb-3 font-bold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 mono text-slate-400">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="py-3 font-bold text-slate-900">{l.action}</td>
                  <td className="py-3 text-slate-500">{l.entity} ({l.entityId || '—'})</td>
                  <td className="py-3 text-slate-400">{l.userName || 'System'}</td>
                  <td className="py-3 mono text-[10px] text-slate-400">{l.details ? JSON.stringify(l.details) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
