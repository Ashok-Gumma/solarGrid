import React, { useEffect, useState } from 'react';
import { HardHat, MapPin, Phone, CheckSquare, Square, CheckCircle2 } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { InstallationJob } from '../../types';

export function InstallationsPage() {
  const [installations, setInstallations] = useState<InstallationJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetchApi<InstallationJob[]>('/installations');
    if (res.success && res.data) setInstallations(res.data);
    setLoading(false);
  }

  const handleToggleChecklist = async (job: InstallationJob, key: string) => {
    const updatedState = { ...job.checklistState, [key]: !(job.checklistState as any)[key] };
    const res = await fetchApi(`/installations/${job.id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: job.status, checklistState: updatedState }),
    });
    if (res.success) load();
  };

  const handleCompleteInstallation = async (job: InstallationJob) => {
    const res = await fetchApi(`/installations/${job.id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: 'COMPLETED' }),
    });
    if (res.success) {
      alert('Installation marked COMPLETED! Equipment warranty activated.');
      load();
    } else {
      alert(res.message || 'Complete all checklist items before closing job.');
    }
  };

  return (
    <div className="space-y-6 animate-rise">
      <div className="page-header">
        <h1>Installation Jobs</h1>
        <p>Assigned site installation jobs — update checklists and close completed installations.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-40" />
          <div className="skeleton h-40" />
        </div>
      ) : installations.length === 0 ? (
        <div className="surface flex flex-col items-center p-16 text-center space-y-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <HardHat size={26} />
          </span>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Installation Jobs Assigned</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No installation tickets are currently assigned to your route.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {installations.map((job) => (
            <div key={job.id} className="surface p-6 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <b className="text-base font-bold text-slate-900">{job.jobNumber}</b>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">{job.customerName}</p>
                </div>
                <span className={`badge ${job.status === 'COMPLETED' ? 'badge-green' : 'badge-amber'}`}>
                  {job.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-slate-400" />
                  <span>{job.addressText || 'Customer Site Location'}</span>
                </div>
                {job.customerPhone && (
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-slate-400" />
                    <span>{job.customerPhone}</span>
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <b className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Installation Checklist</b>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'panels',   label: '1. Panels Mounted & Angle Verified' },
                    { key: 'inverter', label: '2. Inverter Mounted & Connected' },
                    { key: 'wiring',   label: '3. DC/AC Wiring & Conduit Done' },
                    { key: 'safety',   label: '4. Earthing & Safety Switch Tested' },
                  ].map((chk) => {
                    const checked = (job.checklistState as any)?.[chk.key];
                    return (
                      <button
                        key={chk.key}
                        type="button"
                        onClick={() => handleToggleChecklist(job, chk.key)}
                        className="flex items-center gap-2 text-left font-semibold text-slate-700 hover:text-slate-900 transition cursor-pointer"
                      >
                        {checked
                          ? <CheckSquare size={15} className="text-emerald-600 shrink-0" />
                          : <Square size={15} className="text-slate-300 shrink-0" />}
                        <span className={checked ? 'line-through text-slate-400' : ''}>{chk.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {job.status !== 'COMPLETED' && (
                <button
                  onClick={() => handleCompleteInstallation(job)}
                  className="btn-primary w-full py-3.5"
                >
                  <CheckCircle2 size={15} /> Complete Installation & Activate Warranty
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
