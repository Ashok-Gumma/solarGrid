import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { ShieldCheck, Wrench, ArrowRight } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { Warranty } from '../../types';
import { useAuth } from '../../lib/auth-context';

export function MyWarrantiesPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (user?.id) {
        const res = await fetchApi<any>(`/customers/${user.id}`);
        if (res.success && res.data?.warranties) setWarranties(res.data.warranties);
        else setWarranties([]);
      } else setWarranties([]);
      setLoading(false);
    }
    load();
  }, [user]);

  const handleBookWarrantyClaim = (w: Warranty) => {
    const params = new URLSearchParams({ productName: w.productName, serialNumber: w.serialNumber, warrantyId: w.id });
    setLocation(`/book-service?${params.toString()}`);
  };

  return (
    <div className="space-y-6 animate-rise">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header">
          <h1>Solar Equipment & Active Warranties</h1>
          <p>Registered serial numbers, 25-year performance warranties, and single-click warranty claim booking.</p>
        </div>
        <button onClick={() => setLocation('/book-service')} className="btn-primary">
          <Wrench size={14} /> Request Repair / Service
        </button>
      </div>

      {loading ? (
        <div className="skeleton h-24" />
      ) : warranties.length === 0 ? (
        <div className="surface flex flex-col items-center p-16 text-center space-y-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <ShieldCheck size={26} />
          </span>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Registered Equipment Warranties</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              When you purchase solar panels or inverters and complete delivery, your warranties appear here automatically.
            </p>
          </div>
          <button onClick={() => setLocation('/store')} className="btn-primary">
            Browse Equipment Store
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {warranties.map((w) => (
            <div key={w.id} className="surface p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <b className="text-sm font-bold text-slate-900">{w.productName}</b>
                    <p className="mono text-[11px] text-slate-400">Serial: {w.serialNumber}</p>
                  </div>
                  <span className={`badge ${w.status === 'ACTIVE' ? 'badge-green' : 'badge-slate'}`}>
                    {w.status === 'ACTIVE' ? 'ACTIVE' : 'EXPIRED'}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Start Date</span>
                    <b className="text-slate-900">{w.startDate}</b>
                  </div>
                  <div className="flex justify-between">
                    <span>Expiration</span>
                    <b className="text-slate-900">{w.endDate}</b>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleBookWarrantyClaim(w)}
                className="btn-primary w-full py-3"
              >
                <ShieldCheck size={14} />
                <span>Claim Warranty Service</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
