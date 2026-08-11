import React, { useEffect, useState } from 'react';
import { Package, CheckCircle2, XCircle, FileText, Search, RotateCcw } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { Order } from '../../types';
import { TaxInvoiceModal } from '../../components/invoice/TaxInvoiceModal';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

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

  const handleMarkDelivered = async (orderId: string) => {
    if (!window.confirm('Mark as DELIVERED and activate product warranties?')) return;
    setActionId(orderId);
    const res = await fetchApi(`/orders/${orderId}/deliver`, { method: 'POST' });
    if (res.success) { alert('Order marked DELIVERED! Warranties activated.'); loadOrders(); }
    else alert(res.message || 'Failed to update order status.');
    setActionId(null);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Cancel this order?')) return;
    setActionId(orderId);
    const res = await fetchApi(`/orders/${orderId}/cancel`, { method: 'POST' });
    if (res.success) { alert('Order cancelled.'); loadOrders(); }
    else alert(res.message || 'Failed to cancel order.');
    setActionId(null);
  };

  const handleApproveReturn = async (orderId: string) => {
    if (!window.confirm('Confirm receipt of returned items into warehouse stock? Product stock will be increased and customer will be notified.')) return;
    setActionId(orderId);
    const res = await fetchApi(`/orders/${orderId}/approve-return`, { method: 'POST' });
    if (res.success) {
      alert('Return approved: Stock increased & customer notified!');
      loadOrders();
    } else {
      alert(res.message || 'Failed to approve return.');
    }
    setActionId(null);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.addressText && o.addressText.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const statusBadge = (o: Order) => {
    const isDelivered = o.status === 'DELIVERED' || o.status === 'COMPLETED';
    const isCancelled = o.status === 'CANCELLED';
    const isReturn = o.status === 'RETURN_REQUESTED';
    if (isDelivered) return 'badge badge-green';
    if (isCancelled) return 'badge badge-slate';
    if (isReturn)    return 'badge badge-red';
    return 'badge badge-amber';
  };

  return (
    <div className="space-y-6 animate-rise">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header">
          <h1>System Sales Orders Management</h1>
          <p>Review all equipment orders placed across retail, wholesale, and distributor accounts.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order #, customer..."
              className="rounded-full border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-xs outline-none focus:border-emerald-500 font-medium shadow-xs transition"
            />
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-700 outline-none focus:border-emerald-500 font-medium shadow-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="RETURN_REQUESTED">RETURN_REQUESTED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-32" />
          <div className="skeleton h-32" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="surface flex flex-col items-center p-16 text-center space-y-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <Package size={26} />
          </span>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Sales Orders Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No equipment orders match the selected filter criteria.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((o) => {
            const isDelivered = o.status === 'DELIVERED' || o.status === 'COMPLETED';
            const isPendingOrConfirmed = o.status === 'CONFIRMED' || o.status === 'PENDING';
            const isReturnRequested = o.status === 'RETURN_REQUESTED';
            const isCancelled = o.status === 'CANCELLED';

            return (
              <div key={o.id} className="surface p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <b className="text-base font-bold text-slate-900">{o.orderNumber}</b>
                    <span className="text-xs text-slate-500">
                      {o.customerName || 'Valued Customer'}
                    </span>
                    <span className="text-xs text-slate-400">
                      · {new Date(o.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={statusBadge(o)}>
                    {isDelivered ? 'DELIVERED' : o.status}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="space-y-1">
                    <p>
                      Installation: <b className="text-slate-700">
                        {o.installationType === 'SOLARGRID_INSTALLER' ? 'SolarGrid Certified Crew' : 'Direct Equipment Supply'}
                      </b>
                    </p>
                    <p>Address: <span className="text-slate-600">{o.addressText || 'Registered Address'}</span></p>
                    {o.returnReason && <p className="text-red-500 font-semibold">Return Reason: {o.returnReason}</p>}
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] uppercase text-slate-400">Total Order Value</span>
                    <b className="text-lg font-extrabold text-slate-900">₹{(o.totalAmount || 0).toLocaleString('en-IN')}</b>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  {!isCancelled && (
                    <button onClick={() => setInvoiceOrder(o)} className="btn-ghost py-2 text-xs">
                      <FileText size={13} /> GST Invoice
                    </button>
                  )}
                  {isReturnRequested && (
                    <button
                      disabled={actionId === o.id}
                      onClick={() => handleApproveReturn(o.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-50 transition cursor-pointer"
                    >
                      <RotateCcw size={13} />
                      {actionId === o.id ? 'Processing Restock...' : 'Approve Return & Restock'}
                    </button>
                  )}
                  {isPendingOrConfirmed && (
                    <>
                      <button
                        disabled={actionId === o.id}
                        onClick={() => handleMarkDelivered(o.id)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition cursor-pointer"
                      >
                        <CheckCircle2 size={13} />
                        {actionId === o.id ? 'Updating...' : 'Mark Delivered'}
                      </button>
                      <button
                        disabled={actionId === o.id}
                        onClick={() => handleCancelOrder(o.id)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50 transition cursor-pointer"
                      >
                        <XCircle size={13} />
                        {actionId === o.id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {invoiceOrder && <TaxInvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
    </div>
  );
}
