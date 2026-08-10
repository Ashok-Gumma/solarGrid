import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Package, RotateCcw, Wrench, XCircle, FileText, ArrowRight } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { Order } from '../../types';
import { TaxInvoiceModal } from '../../components/invoice/TaxInvoiceModal';

export function MyOrdersPage() {
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState('Defective / Damaged equipment received');
  const [returnNotes, setReturnNotes] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const returnReasons = [
    'Defective / Damaged equipment received',
    'Incorrect specification delivered',
    'Incompatible with existing solar setup',
    'Cancelled installation / project scope change',
    'Other return request',
  ];

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    setLoading(true);
    const res = await fetchApi<any>('/orders');
    if (res.success) {
      const rawRes = res as any;
      const orderList = Array.isArray(res.data)
        ? res.data
        : rawRes.orders || (res.data && (res.data as any).orders) || [];
      setOrders(orderList);
    }
    setLoading(false);
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Cancel this order?')) return;
    setCancellingId(orderId);
    const res = await fetchApi(`/orders/${orderId}/cancel`, { method: 'POST' });
    if (res.success) { alert('Order cancelled successfully.'); loadOrders(); }
    else alert(res.message || 'Failed to cancel order.');
    setCancellingId(null);
  };

  const handleRequestReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSubmittingReturn(true);
    const res = await fetchApi(`/orders/${selectedOrder.id}/return`, {
      method: 'POST',
      body: JSON.stringify({ reason: returnReason, notes: returnNotes }),
    });
    if (res.success) {
      alert('Return request submitted! Support team will arrange pickup & inspection.');
      setShowReturnModal(false);
      loadOrders();
    } else alert(res.message || 'Failed to submit return request.');
    setSubmittingReturn(false);
  };

  const statusBadge = (status: string) => {
    if (status === 'DELIVERED' || status === 'COMPLETED') return 'badge badge-green';
    if (status === 'CANCELLED') return 'badge badge-slate';
    if (status === 'RETURN_REQUESTED') return 'badge badge-red';
    return 'badge badge-amber';
  };

  return (
    <div className="space-y-6 animate-rise">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header">
          <h1>My Orders & Equipment Purchases</h1>
          <p>Track purchases, download tax invoices, cancel pending orders, or request returns.</p>
        </div>
        <button onClick={() => setLocation('/store')} className="btn-primary">
          <Package size={14} /> Browse Catalog
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-32" />
          <div className="skeleton h-32" />
        </div>
      ) : orders.length === 0 ? (
        <div className="surface flex flex-col items-center p-16 text-center space-y-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <Package size={26} />
          </span>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Equipment Orders Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Browse our catalog to order solar panels, inverters, and storage batteries.
            </p>
          </div>
          <button onClick={() => setLocation('/store')} className="btn-primary">
            Browse Equipment Store
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const isDelivered = o.status === 'DELIVERED' || o.status === 'COMPLETED';
            const isPendingOrConfirmed = o.status === 'CONFIRMED' || o.status === 'PENDING';
            const isCancelled = o.status === 'CANCELLED';

            return (
              <div key={o.id} className="surface p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                  <div>
                    <b className="text-base font-bold text-slate-900">{o.orderNumber}</b>
                    <span className="ml-2 text-xs text-slate-400">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={statusBadge(o.status)}>
                    {isDelivered ? 'DELIVERED' : o.status}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="space-y-1">
                    <p>Installation: <b className="text-slate-700">{o.installationType === 'SOLARGRID_INSTALLER' ? 'SolarGrid Crew' : 'Direct Supply'}</b></p>
                    <p>Address: <span className="text-slate-600">{o.addressText || 'Saved Address'}</span></p>
                    {o.returnReason && <p className="text-red-500 font-semibold">Return: {o.returnReason}</p>}
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] uppercase text-slate-400">Total Payable</span>
                    <b className="text-lg font-extrabold text-slate-900">₹{o.totalAmount.toLocaleString('en-IN')}</b>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  {!isCancelled && (
                    <button onClick={() => setInvoiceOrder(o)} className="btn-ghost py-2 text-xs">
                      <FileText size={13} /> GST Invoice
                    </button>
                  )}
                  {isPendingOrConfirmed && (
                    <button
                      disabled={cancellingId === o.id}
                      onClick={() => handleCancelOrder(o.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50 transition cursor-pointer"
                    >
                      <XCircle size={13} />
                      {cancellingId === o.id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                  {isDelivered && (() => {
                    const dateStr = o.deliveredAt || o.updatedAt || o.createdAt;
                    const deliveryTime = dateStr ? new Date(dateStr).getTime() : new Date().getTime();
                    const diffInDays = (new Date().getTime() - deliveryTime) / (1000 * 60 * 60 * 24);
                    const canReturn = diffInDays <= 15;

                    return (
                      <>
                        <button onClick={() => setLocation('/book-service')} className="btn-ghost py-2 text-xs">
                          <Wrench size={13} /> Book Service
                        </button>
                        {canReturn ? (
                          <button
                            onClick={() => { setSelectedOrder(o); setShowReturnModal(true); }}
                            className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition cursor-pointer"
                          >
                            <RotateCcw size={13} /> Request Return
                          </button>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400 italic">
                            Return Period Expired (15 Days)
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {invoiceOrder && <TaxInvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}

      {showReturnModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bento-card p-7 space-y-4 text-xs animate-rise">
            <h3 className="text-base font-bold text-slate-900">
              Request Return: <span className="text-emerald-600">{selectedOrder.orderNumber}</span>
            </h3>
            <form onSubmit={handleRequestReturn} className="space-y-3">
              <div>
                <label className="block font-bold uppercase text-slate-400 text-[10px] mb-1.5">Reason *</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="input-field"
                >
                  {returnReasons.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-400 text-[10px] mb-1.5">Additional Comments</label>
                <textarea
                  rows={3}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Describe damage, serial number, or pickup notes..."
                  className="input-field resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowReturnModal(false)} className="btn-ghost py-2">Cancel</button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer transition"
                >
                  {submittingReturn ? 'Submitting...' : 'Submit Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
