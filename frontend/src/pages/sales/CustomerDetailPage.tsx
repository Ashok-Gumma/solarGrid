import React, { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { MapPin, Phone, Mail, FileText, Package, HardHat, Wrench, ShieldCheck, Calendar, Clock, Plus } from 'lucide-react';
import { fetchApi } from '../../lib/api';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customerData, setCustomerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'addresses' | 'orders' | 'challans' | 'installations' | 'services' | 'warranties' | 'crm' | 'timeline'>('overview');

  // CRM Form
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [followUpDate, setFollowUpDate] = useState(tomorrowStr);
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [submittingCRM, setSubmittingCRM] = useState(false);

  useEffect(() => {
    loadCustomer();
  }, [id]);

  async function loadCustomer() {
    if (!id) return;
    setLoading(true);
    const res = await fetchApi<any>(`/customers/${id}`);
    if (res.success && res.data) {
      setCustomerData(res.data);
    }
    setLoading(false);
  }

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpNotes.trim()) return;
    setSubmittingCRM(true);
    const res = await fetchApi('/crm/followups', {
      method: 'POST',
      body: JSON.stringify({
        customerId: id,
        followUpDate,
        notes: followUpNotes,
      }),
    });
    if (res.success) {
      setFollowUpNotes('');
      loadCustomer();
    } else {
      alert(res.message || 'Failed to record follow-up note.');
    }
    setSubmittingCRM(false);
  };

  if (loading || !customerData) {
    return (
      <div className="space-y-4 animate-rise">
        <div className="skeleton h-32" />
        <div className="skeleton h-48" />
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'addresses', label: `Addresses (${customerData.addresses?.length || 0})` },
    { key: 'orders', label: `Orders (${customerData.orders?.length || 0})` },
    { key: 'challans', label: `Sales Challans (${customerData.challans?.length || 0})` },
    { key: 'installations', label: `Installations (${customerData.installations?.length || 0})` },
    { key: 'services', label: `Services (${customerData.services?.length || 0})` },
    { key: 'warranties', label: `Warranties (${customerData.warranties?.length || 0})` },
    { key: 'crm', label: `CRM Notes (${customerData.followups?.length || 0})` },
    { key: 'timeline', label: 'Activity Timeline' },
  ];

  return (
    <div className="space-y-6 animate-rise">
      {/* Customer Profile Header */}
      <div className="surface p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900">{customerData.name}</h1>
              <span className="badge badge-green">
                {customerData.customerType}
              </span>
              <span className="badge badge-amber">
                {customerData.status}
              </span>
            </div>
            {customerData.businessName && (
              <p className="mt-1 text-xs font-semibold text-slate-500">{customerData.businessName}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-slate-500 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5">
            <Phone size={13} className="text-slate-400" />
            <span>{customerData.phone || 'No Phone Registered'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail size={13} className="text-slate-400" />
            <span>{customerData.email || 'No Email Registered'}</span>
          </div>
          {customerData.gstNumber && (
            <div className="flex items-center gap-1.5">
              <FileText size={13} className="text-slate-400" />
              <span>GSTIN: {customerData.gstNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === t.key
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="surface p-5 space-y-3 text-xs text-slate-900">
          <h3 className="font-extrabold text-sm text-slate-900">Account Overview & Notes</h3>
          <p className="text-slate-500 leading-relaxed">{customerData.notes || 'No general notes recorded for this customer profile.'}</p>
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="space-y-4">
          {(!customerData.addresses || customerData.addresses.length === 0) ? (
            <div className="surface p-8 text-center text-xs text-slate-400">
              No delivery or installation site addresses saved for this customer.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {customerData.addresses.map((addr: any) => (
                <div key={addr.id} className="surface p-5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <b className="font-bold text-slate-900">{addr.addressLabel || 'Site Address'}</b>
                    <span className="badge badge-green text-[10px]">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-slate-500 leading-relaxed">
                    {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {(!customerData.orders || customerData.orders.length === 0) ? (
            <div className="surface p-8 text-center text-xs text-slate-400">
              No equipment purchase orders recorded for this customer.
            </div>
          ) : (
            customerData.orders.map((o: any) => (
              <div key={o.id} className="surface p-5 space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <b className="font-bold text-slate-900 text-sm">{o.orderNumber}</b>
                  <span className="badge badge-green">{o.status}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Placed on {new Date(o.createdAt).toLocaleDateString()}</span>
                  <b className="text-slate-900 font-extrabold text-sm">₹{o.totalAmount.toLocaleString('en-IN')}</b>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'challans' && (
        <div className="space-y-4">
          {(!customerData.challans || customerData.challans.length === 0) ? (
            <div className="surface p-8 text-center text-xs text-slate-400">
              No sales challans generated for this customer.
            </div>
          ) : (
            customerData.challans.map((ch: any) => (
              <div key={ch.id} className="surface p-5 space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <b className="font-bold text-slate-900 text-sm">{ch.challanNumber}</b>
                  <span className="badge badge-slate">{ch.status}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Issued on {new Date(ch.createdAt).toLocaleDateString()}</span>
                  <b className="text-slate-900 font-extrabold">{ch.totalQuantity} items</b>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'installations' && (
        <div className="space-y-4">
          {(!customerData.installations || customerData.installations.length === 0) ? (
            <div className="surface p-8 text-center text-xs text-slate-400">
              No site installation jobs assigned.
            </div>
          ) : (
            customerData.installations.map((inst: any) => (
              <div key={inst.id} className="surface p-5 space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <b className="font-bold text-slate-900 text-sm">{inst.jobNumber}</b>
                  <span className="badge badge-green">{inst.status}</span>
                </div>
                <p className="text-slate-500">{inst.addressText || 'Installation Site'}</p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'services' && (
        <div className="space-y-4">
          {(!customerData.services || customerData.services.length === 0) ? (
            <div className="surface p-8 text-center text-xs text-slate-400">
              No warranty repair or service requests logged.
            </div>
          ) : (
            customerData.services.map((srv: any) => (
              <div key={srv.id} className="surface p-5 space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <b className="font-bold text-slate-900 text-sm">{srv.serviceNumber}</b>
                  <span className="badge badge-amber">{srv.status}</span>
                </div>
                <p className="text-slate-500">Issue: {srv.description || srv.problemCategory}</p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'warranties' && (
        <div className="space-y-4">
          {(!customerData.warranties || customerData.warranties.length === 0) ? (
            <div className="surface p-8 text-center text-xs text-slate-400">
              No active equipment warranties registered.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {customerData.warranties.map((w: any) => (
                <div key={w.id} className="surface p-5 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <b className="font-bold text-slate-900">{w.productName}</b>
                    <span className="badge badge-green">{w.status}</span>
                  </div>
                  <p className="mono text-slate-400 text-[11px]">S/N: {w.serialNumber}</p>
                  <p className="text-slate-500">Valid: {w.startDate} to {w.endDate}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'crm' && (
        <div className="space-y-6">
          <form onSubmit={handleAddFollowUp} className="surface p-5 space-y-3 text-xs">
            <h3 className="font-extrabold text-slate-900 text-sm">Add CRM Follow-Up Note</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Follow-Up Date</label>
                <input
                  type="date"
                  required
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Note Details *</label>
              <textarea
                required
                rows={3}
                value={followUpNotes}
                onChange={(e) => setFollowUpNotes(e.target.value)}
                placeholder="Log customer inquiry, requirement changes, or payment terms discussed..."
                className="input-field resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={submittingCRM} className="btn-primary py-2 text-xs">
                <Plus size={13} /> {submittingCRM ? 'Saving Note...' : 'Record Note'}
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {(!customerData.followups || customerData.followups.length === 0) ? (
              <div className="surface p-8 text-center text-xs text-slate-400">
                No follow-up notes logged for this customer.
              </div>
            ) : (
              customerData.followups.map((f: any) => (
                <div key={f.id} className="surface p-4 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1"><Calendar size={12} /> Scheduled: {f.followUpDate}</span>
                    <span className="mono">{new Date(f.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed">{f.notes}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="surface p-6 space-y-4 text-xs">
          <h3 className="font-extrabold text-sm text-slate-900">Customer Activity Trace</h3>
          <p className="text-slate-500">Timeline of all orders, challans, service tickets, and CRM interactions recorded for {customerData.name}.</p>
        </div>
      )}
    </div>
  );
}
