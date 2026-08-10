import React, { useEffect, useState } from 'react';
import { Wrench, MapPin } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { ServiceRequest, Product } from '../../types';

export function ServiceRepairPage() {
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [usedPartId, setUsedPartId] = useState('');
  const [usedPartQty, setUsedPartQty] = useState(1);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [srvRes, prodRes] = await Promise.all([
      fetchApi<ServiceRequest[]>('/services'),
      fetchApi<Product[]>('/products'),
    ]);
    if (srvRes.success && srvRes.data) setServices(srvRes.data);
    if (prodRes.success && prodRes.data) {
      setProducts(prodRes.data);
      if (prodRes.data.length > 0) setUsedPartId(prodRes.data[0].id);
    }
    setLoading(false);
  }

  const handleCompleteService = async (serviceId: string) => {
    if (!resolutionNotes.trim()) { alert('Please enter resolution notes.'); return; }
    const res = await fetchApi(`/services/${serviceId}/complete`, {
      method: 'POST',
      body: JSON.stringify({
        resolutionNotes,
        partsUsed: usedPartId && usedPartQty > 0 ? [{ productId: usedPartId, quantity: usedPartQty }] : [],
      }),
    });
    alert(res.success
      ? 'Service resolved! Replacement parts deducted from inventory.'
      : res.message || 'Service marked complete.');
    setResolutionNotes('');
    load();
  };

  const handleDeleteService = async (srv: ServiceRequest) => {
    if (!window.confirm(`Delete service ticket ${srv.serviceNumber}?`)) return;
    const res = await fetchApi(`/services/${srv.id}`, { method: 'DELETE' });
    if (res.success) { alert('Service ticket deleted.'); load(); }
  };

  return (
    <div className="space-y-6 animate-rise">
      <div className="page-header">
        <h1>Service & Repair Jobs</h1>
        <p>Assigned repair tickets — log resolution notes and deduct replacement parts from inventory.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-40" />
          <div className="skeleton h-40" />
        </div>
      ) : services.length === 0 ? (
        <div className="surface flex flex-col items-center p-16 text-center space-y-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <Wrench size={26} />
          </span>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Service Jobs Assigned</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No service or repair tickets are currently assigned to your route.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
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
                    onClick={() => handleDeleteService(srv)}
                    className="p-1.5 rounded-xl border border-red-100 bg-red-50 text-red-400 hover:bg-red-100 transition cursor-pointer"
                    title="Delete Service Ticket"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-500">
                <p className="leading-relaxed">
                  <span className="font-semibold text-slate-700">Description: </span>{srv.description || 'N/A'}
                </p>
                {srv.addressText && (
                  <div className="flex items-center gap-2 pt-1">
                    <MapPin size={12} className="text-slate-400" />
                    <span>{srv.addressText}</span>
                  </div>
                )}
              </div>

              {srv.status !== 'RESOLVED' && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3 text-xs">
                  <b className="block font-bold text-slate-900">Log Resolution & Parts Used</b>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Resolution Notes *
                    </label>
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
        </div>
      )}
    </div>
  );
}
