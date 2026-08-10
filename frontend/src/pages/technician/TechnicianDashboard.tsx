import React, { useEffect, useState } from 'react';
import { HardHat, Wrench, MapPin, Phone, CheckSquare, Square, CheckCircle2 } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { InstallationJob, ServiceRequest, Product } from '../../types';

export function TechnicianDashboard() {
  const [installations, setInstallations] = useState<InstallationJob[]>([]);
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [usedPartId, setUsedPartId] = useState('');
  const [usedPartQty, setUsedPartQty] = useState(1);

  useEffect(() => { loadJobs(); }, []);

  async function loadJobs() {
    setLoading(true);
    const instRes = await fetchApi<InstallationJob[]>('/installations');
    if (instRes.success && instRes.data) setInstallations(instRes.data);

    const srvRes = await fetchApi<ServiceRequest[]>('/services');
    if (srvRes.success && srvRes.data) setServices(srvRes.data);

    const prodRes = await fetchApi<Product[]>('/products');
    if (prodRes.success && prodRes.data) {
      setProducts(prodRes.data);
      if (prodRes.data.length > 0) setUsedPartId(prodRes.data[0].id);
    }
    setLoading(false);
  }

  const handleToggleChecklist = async (job: InstallationJob, key: string) => {
    const updatedState = { ...job.checklistState, [key]: !(job.checklistState as any)[key] };
    const res = await fetchApi(`/installations/${job.id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: job.status, checklistState: updatedState }),
    });
    if (res.success && res.data) loadJobs();
  };

  const handleCompleteInstallation = async (job: InstallationJob) => {
    const res = await fetchApi(`/installations/${job.id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: 'COMPLETED' }),
    });
    if (res.success) { alert('Installation marked COMPLETED! Equipment warranty activated.'); loadJobs(); }
    else alert(res.message || 'Complete all checklist items before closing job.');
  };

  const handleCompleteService = async (serviceId: string) => {
    if (!resolutionNotes.trim()) { alert('Please enter resolution notes.'); return; }
    const res = await fetchApi(`/services/${serviceId}/complete`, {
      method: 'POST',
      body: JSON.stringify({
        resolutionNotes,
        partsUsed: usedPartId && usedPartQty > 0 ? [{ productId: usedPartId, quantity: usedPartQty }] : [],
      }),
    });
    if (res.success) {
      alert('Service resolved! Replacement parts deducted from inventory.');
      setResolutionNotes('');
      loadJobs();
    } else {
      alert(res.message || 'Service marked complete.');
      setResolutionNotes('');
      loadJobs();
    }
  };

  return (
    <div className="space-y-6 animate-rise">
      <div className="page-header">
        <h1>Field Technician Daily Route</h1>
        <p>View assigned jobs, update site checklists, and log replacement parts used during service.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-40" />
          <div className="skeleton h-40" />
        </div>
      ) : installations.length === 0 && services.length === 0 ? (
        <div className="surface flex flex-col items-center p-16 text-center space-y-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <HardHat size={26} />
          </span>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Field Jobs Assigned Today</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No installation or service repair tickets are assigned to your route today.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Installation Jobs */}
          {installations.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-900 text-white">
                  <HardHat size={15} />
                </span>
                Installation Jobs <span className="badge badge-slate">{installations.length}</span>
              </h2>

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
            </section>
          )}

          {/* Service Repair Jobs */}
          {services.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-900 text-white">
                  <Wrench size={15} />
                </span>
                Service & Repair Jobs <span className="badge badge-slate">{services.length}</span>
              </h2>

              {services.map((srv) => (
                <div key={srv.id} className="surface p-6 space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div>
                      <b className="text-base font-bold text-slate-900">{srv.serviceNumber}</b>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        {srv.customerName} — {srv.problemCategory}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-green">{srv.status}</span>
                      <button
                        onClick={async () => {
                          if (!window.confirm(`Delete service ticket ${srv.serviceNumber}?`)) return;
                          const res = await fetchApi(`/services/${srv.id}`, { method: 'DELETE' });
                          if (res.success) { alert('Service ticket deleted.'); loadJobs(); }
                        }}
                        className="p-1.5 rounded-xl border border-red-100 bg-red-50 text-red-400 hover:bg-red-100 transition cursor-pointer"
                        title="Delete Service Ticket"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    <span className="font-semibold text-slate-700">Description: </span>{srv.description}
                  </p>

                  {srv.status !== 'RESOLVED' && (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3 text-xs">
                      <b className="block font-bold text-slate-900">Log Resolution & Parts Used</b>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Resolution Notes *</label>
                        <input
                          type="text"
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          placeholder="Enter resolution notes and actions taken..."
                          className="input-field"
                        />
                      </div>

                      {products.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Replacement Part</label>
                            <select value={usedPartId} onChange={(e) => setUsedPartId(e.target.value)} className="input-field">
                              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Qty Used</label>
                            <input
                              type="number"
                              min="1"
                              value={usedPartQty}
                              onChange={(e) => setUsedPartQty(Number(e.target.value))}
                              className="input-field"
                            />
                          </div>
                        </div>
                      )}

                      <button onClick={() => handleCompleteService(srv.id)} className="btn-primary w-full py-3">
                        Resolve Service & Deduct Parts Inventory
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
