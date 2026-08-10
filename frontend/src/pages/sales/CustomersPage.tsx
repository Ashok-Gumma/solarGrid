import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Users, Search, Plus, Phone, Mail, ArrowRight } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { Customer } from '../../types';

export function CustomersPage() {
  const [, setLocation] = useLocation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [customerType, setCustomerType] = useState('RETAIL');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Pune');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('411045');

  useEffect(() => { loadCustomers(); }, [search, statusFilter]);

  async function loadCustomers() {
    setLoading(true);
    let url = '/customers?limit=50';
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (statusFilter) url += `&status=${statusFilter}`;
    const res = await fetchApi<Customer[]>(url);
    if (res.success && res.data) setCustomers(res.data);
    setLoading(false);
  }

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) { alert('Name, email, and phone are required.'); return; }

    const res = await fetchApi('/customers', {
      method: 'POST',
      body: JSON.stringify({ name, businessName, email, phone, customerType, initialAddress: { addressLine, city, state, pincode } }),
    });

    if (res.success) {
      setShowAddModal(false);
      setName(''); setEmail(''); setPhone('');
      loadCustomers();
    } else alert(res.message || 'Failed to create customer.');
  };

  return (
    <div className="space-y-6 animate-rise">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header">
          <h1>Customer CRM Management</h1>
          <p>Manage retail buyers, solar dealers, wholesale distributors, and CRM follow-ups.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <Plus size={15} /> Add New Customer
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
        <div className="relative flex-1 md:max-w-xs">
          <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, business, or phone..."
            className="w-full rounded-full border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-xs outline-none focus:border-emerald-500 font-medium shadow-xs"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {['', 'LEAD', 'ACTIVE', 'INACTIVE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === '' ? 'All' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Grid */}
      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-20" />
          <div className="skeleton h-20" />
        </div>
      ) : customers.length === 0 ? (
        <div className="surface flex flex-col items-center p-16 text-center space-y-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <Users size={26} />
          </span>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Customers Registered Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Click Add New Customer to create your first customer profile.
            </p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <Plus size={14} /> Add First Customer
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((c) => (
            <div
              key={c.id}
              onClick={() => setLocation(`/customers/${c.id}`)}
              className="surface p-5 space-y-3 cursor-pointer hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                  {c.businessName && <p className="text-xs text-slate-500 font-medium">{c.businessName}</p>}
                </div>
                <span className={`badge ${c.status === 'ACTIVE' ? 'badge-green' : 'badge-amber'}`}>
                  {c.status}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-slate-400" />
                  <span>{c.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-slate-400" />
                  <span className="truncate">{c.email}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="badge badge-slate">{c.customerType}</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-[11px]">
                  View Profile <ArrowRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bento-card p-7 space-y-4 animate-rise">
            <h3 className="text-lg font-extrabold text-slate-900">Add New Customer Account</h3>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold uppercase text-slate-400 text-[10px] mb-1.5">Customer Name *</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-400 text-[10px] mb-1.5">Business / Firm Name</label>
                  <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="input-field" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold uppercase text-slate-400 text-[10px] mb-1.5">Email Address *</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-400 text-[10px] mb-1.5">Phone Number *</label>
                  <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-400 text-[10px] mb-1.5">Classification</label>
                <select value={customerType} onChange={(e) => setCustomerType(e.target.value)} className="input-field">
                  <option value="RETAIL">Retail Customer</option>
                  <option value="WHOLESALE">Wholesale Dealer</option>
                  <option value="DISTRIBUTOR">Distributor Partner</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-400 text-[10px] mb-1.5">Address Line</label>
                <input type="text" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder="Plot / Street / Building..." className="input-field" />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block font-bold uppercase text-slate-400 text-[10px] mb-1.5">City</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-400 text-[10px] mb-1.5">State</label>
                  <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-400 text-[10px] mb-1.5">Pincode</label>
                  <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} className="input-field" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-ghost py-2">Cancel</button>
                <button type="submit" className="btn-primary py-2">Save Customer Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
