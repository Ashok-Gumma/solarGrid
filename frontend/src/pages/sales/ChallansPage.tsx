import React, { useEffect, useState } from 'react';
import { FileText, Plus, CheckCircle2, Truck, ShieldCheck, Check, Trash2 } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { Challan, Customer, Product, Order } from '../../types';

export function ChallansPage() {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ordersMap, setOrdersMap] = useState<Record<string, Order>>({});
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deliveringOrderId, setDeliveringOrderId] = useState<string | null>(null);

  // Form state for draft challan
  const [customerId, setCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [chalRes, custRes, prodRes, ordRes] = await Promise.all([
      fetchApi<Challan[]>('/challans'),
      fetchApi<any>('/customers?limit=100'),
      fetchApi<Product[]>('/products'),
      fetchApi<Order[]>('/orders'),
    ]);

    if (chalRes.success && chalRes.data) {
      setChallans(chalRes.data);
    } else {
      setChallans([]);
    }

    if (ordRes.success && ordRes.data) {
      const map: Record<string, Order> = {};
      ordRes.data.forEach((o) => {
        map[o.id] = o;
      });
      setOrdersMap(map);
    }

    const customerList = custRes.data?.data || (Array.isArray(custRes.data) ? custRes.data : []);
    setCustomers(customerList);
    if (customerList.length > 0) setCustomerId(customerList[0].id);

    if (prodRes.success && prodRes.data) {
      setProducts(prodRes.data);
      if (prodRes.data.length > 0) setSelectedProductId(prodRes.data[0].id);
    }
    setLoading(false);
  }

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !selectedProductId) {
      alert('Please select a customer and a product.');
      return;
    }

    const res = await fetchApi('/challans', {
      method: 'POST',
      body: JSON.stringify({
        customerId,
        items: [{ productId: selectedProductId, quantity: Number(quantity) }],
      }),
    });

    if (res.success) {
      setShowCreateModal(false);
      loadData();
    } else {
      alert(res.message || 'Failed to create draft challan.');
    }
  };

  const handleConfirmChallan = async (challanId: string) => {
    setConfirmingId(challanId);
    const res = await fetchApi<any>(`/challans/${challanId}/confirm`, {
      method: 'POST',
    });

    if (res.success) {
      alert('Sales Challan successfully confirmed! Inventory safely reduced and stock OUT movement logged.');
      loadData();
    } else {
      alert(`CONFIRMATION FAILED:\n\n${res.message || 'Stock transaction conflict.'}`);
    }
    setConfirmingId(null);
  };

  const handleDeleteChallan = async (challan: Challan) => {
    if (!window.confirm(`Are you sure you want to delete / void challan ${challan.challanNumber}? Deducted stock will be safely restored.`)) {
      return;
    }

    setDeletingId(challan.id);
    const res = await fetchApi(`/challans/${challan.id}`, {
      method: 'DELETE',
    });

    if (res.success) {
      alert(`Challan ${challan.challanNumber} deleted successfully. Inventory restored.`);
      loadData();
    } else {
      alert(res.message || 'Failed to delete challan.');
    }
    setDeletingId(null);
  };

  const handleMarkOrderDelivered = async (orderId: string) => {
    if (!orderId) return;
    setDeliveringOrderId(orderId);
    const res = await fetchApi(`/orders/${orderId}/deliver`, {
      method: 'POST',
    });

    if (res.success) {
      alert('Order marked as DELIVERED! Equipment warranties registered for customer.');
      loadData();
    } else {
      alert(res.message || 'Failed to mark order as delivered.');
    }
    setDeliveringOrderId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Challans & Dispatch Ledger</h1>
          <p className="text-xs text-slate-500">Issue delivery sales challans with automated stock deduction, delivery tracking, and warranty activation.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-black"
        >
          <Plus size={16} /> Generate Draft Challan
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-24 skeleton" />
          <div className="h-24 skeleton" />
        </div>
      ) : challans.length === 0 ? (
        <div className="surface rounded-[2rem] p-12 text-center space-y-3 border border-slate-200">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 mx-auto">
            <FileText size={24} />
          </span>
          <h3 className="text-lg font-bold text-slate-900">No Sales Challans Generated Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your sales challans ledger is clean. Click Generate Draft Challan to issue your first equipment delivery challan.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-black"
          >
            <Plus size={16} /> Generate First Challan
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {challans.map((ch) => {
            const linkedOrder = ch.orderId ? ordersMap[ch.orderId] : null;
            const isOrderDelivered = linkedOrder?.status === 'DELIVERED' || linkedOrder?.status === 'COMPLETED';

            return (
              <div key={ch.id} className="surface rounded-2xl p-5 space-y-3 border border-slate-200 hover:border-[#b0c49b] transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <b className="text-base font-bold text-slate-900">{ch.challanNumber}</b>
                    <span className="ml-3 text-xs text-slate-500">Customer: <b>{ch.customerName || 'Solar Customer'}</b></span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      ch.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-700'
                    }`}>
                      CHALLAN {ch.status}
                    </span>

                    {ch.status === 'DRAFT' && (
                      <button
                        disabled={confirmingId === ch.id}
                        onClick={() => handleConfirmChallan(ch.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-black disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} />
                        {confirmingId === ch.id ? 'Deducting Stock...' : 'Confirm & Dispatch (Deduct Stock)'}
                      </button>
                    )}

                    {ch.status === 'CONFIRMED' && ch.orderId && (
                      isOrderDelivered ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#b5cca2] bg-emerald-100 px-3.5 py-1.5 text-xs font-bold text-[#1b4226] shadow-xs">
                          <Check size={14} className="text-[#27522f]" />
                          <ShieldCheck size={14} className="text-[#27522f]" />
                          ORDER DELIVERED (Warranties Active)
                        </span>
                      ) : (
                        <button
                          disabled={deliveringOrderId === ch.orderId}
                          onClick={() => handleMarkOrderDelivered(ch.orderId!)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#b8cfa7] bg-[#edf4e3] px-3.5 py-1.5 text-xs font-bold text-[#1b4226] hover:bg-[#dce8cd] transition disabled:opacity-50"
                        >
                          <Truck size={14} />
                          <ShieldCheck size={14} />
                          {deliveringOrderId === ch.orderId ? 'Registering Delivery...' : 'Mark Order Delivered & Activate Warranties'}
                        </button>
                      )
                    )}

                    {/* Delete / Void Challan Action */}
                    <button
                      disabled={deletingId === ch.id}
                      onClick={() => handleDeleteChallan(ch)}
                      className="inline-flex items-center gap-1 rounded-xl border border-[#fae0d9] bg-red-50 px-3 py-1.5 text-xs font-bold text-[#a63e3e] hover:bg-red-100 transition disabled:opacity-50"
                      title="Delete / Void Challan & Restore Stock"
                    >
                      <Trash2 size={14} />
                      {deletingId === ch.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-500 flex justify-between items-center">
                  <span>Total Items: <b>{ch.totalQuantity} units</b></span>
                  <span className="mono text-[10px] text-slate-400">Issued by: {ch.createdByName || 'Operations Desk'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Draft Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Generate Draft Sales Challan</h3>

            <form onSubmit={handleCreateDraft} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-400 mb-1">Customer Account *</label>
                {customers.length === 0 ? (
                  <p className="text-xs text-[#a63e3e]">No customers found. Create a customer first in CRM Desk.</p>
                ) : (
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.businessName ? `(${c.businessName})` : ''} - {c.customerType}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-400 mb-1">Select Product Component *</label>
                {products.length === 0 ? (
                  <p className="text-xs text-[#a63e3e]">No products found. Register products in Inventory Desk first.</p>
                ) : (
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stock: {p.currentStock} units | ₹{p.unitPrice.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-400 mb-1">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl px-4 py-2 font-semibold text-[#57685b]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={customers.length === 0 || products.length === 0}
                  className="rounded-xl bg-slate-900 px-5 py-2 font-bold text-white hover:bg-black disabled:opacity-50"
                >
                  Save Draft Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
