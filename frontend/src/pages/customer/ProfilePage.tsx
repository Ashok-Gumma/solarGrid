import React, { useEffect, useState } from 'react';
import { ShieldCheck, Wrench, Trash2, Calendar, MapPin, Building, Phone, Mail, UserCheck, Check } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { fetchApi } from '../../lib/api';
import { ServiceRequest } from '../../types';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit Profile Form State
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [businessNameInput, setBusinessNameInput] = useState(user?.businessName || '');
  const [gstInput, setGstInput] = useState(user?.gstNumber || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [defaultAddress, setDefaultAddress] = useState<string>(() =>
    localStorage.getItem(`solargrid_default_addr_${user?.id || 'guest'}`) || '17B, Palm Grove, Markapur, Andhra Pradesh 523316'
  );
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState(defaultAddress);

  useEffect(() => { loadMyServiceTickets(); }, [user]);

  useEffect(() => {
    if (user) {
      setNameInput(user.name || '');
      setPhoneInput(user.phone || '');
      setBusinessNameInput(user.businessName || '');
      setGstInput(user.gstNumber || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setSavingProfile(true);
    const updated = await updateProfile({
      name: nameInput.trim(),
      phone: phoneInput.trim(),
      businessName: businessNameInput.trim(),
      gstNumber: gstInput.trim(),
    });
    if (updated) {
      setEditingProfile(false);
      alert('Profile updated successfully!');
    } else {
      alert('Failed to update profile.');
    }
    setSavingProfile(false);
  };

  async function loadMyServiceTickets() {
    if (!user) return;
    setLoadingServices(true);
    const res = await fetchApi<any>('/services');
    if (res.success) {
      const rawData = res as any;
      const allServices: ServiceRequest[] = Array.isArray(res.data)
        ? res.data
        : rawData.services || (res.data && res.data.services) || [];
      const myTickets = allServices.filter(
        (s) => s.customerId === user.id || (s.customerName && s.customerName.toLowerCase().includes(user.name.toLowerCase()))
      );
      setServices(myTickets);
    }
    setLoadingServices(false);
  }

  const handleSaveDefaultAddress = () => {
    if (!addressInput.trim()) return;
    setDefaultAddress(addressInput.trim());
    localStorage.setItem(`solargrid_default_addr_${user?.id || 'guest'}`, addressInput.trim());
    setEditingAddress(false);
    alert('Default Delivery & Installation Address updated successfully!');
  };

  const handleDeleteTicket = async (ticketId: string, serviceNumber: string) => {
    if (!window.confirm(`Delete service ticket ${serviceNumber}?`)) return;
    setDeletingId(ticketId);
    const res = await fetchApi(`/services/${ticketId}`, { method: 'DELETE' });
    if (res.success) { alert('Service ticket deleted.'); loadMyServiceTickets(); }
    else alert(res.message || 'Failed to delete ticket.');
    setDeletingId(null);
  };

  const infoItems = [
    { icon: Mail,       label: 'Email Address',      value: user?.email || 'N/A' },
    { icon: Phone,      label: 'Contact Phone',       value: user?.phone || '+91 98765 43210' },
    { icon: UserCheck,  label: 'Account Tier',        value: user?.customerType || 'RETAIL CUSTOMER' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-rise">
      {/* Profile Header Card */}
      <div className="surface p-6 sm:p-8 space-y-6">
        {/* Identity Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-900 text-white font-extrabold text-2xl shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{user?.name || 'Account Profile'}</h1>
                <span className="badge badge-green uppercase">
                  {user?.customerType && user.customerType !== 'RETAIL'
                    ? `${user.customerType} ${user?.role || 'CUSTOMER'}`
                    : user?.role || 'CUSTOMER'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="btn-primary text-xs py-2 px-4"
          >
            {editingProfile ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>

        {/* Edit Profile Form */}
        {editingProfile && (
          <form onSubmit={handleSaveProfile} className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-4 text-xs animate-rise">
            <h3 className="font-extrabold text-sm text-slate-900">Update Profile Details</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="input-field"
                  placeholder="Enter your name..."
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="input-field"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Business / Enterprise Name</label>
                <input
                  type="text"
                  value={businessNameInput}
                  onChange={(e) => setBusinessNameInput(e.target.value)}
                  className="input-field"
                  placeholder="Company or Business Name..."
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">GST Number (GSTIN)</label>
                <input
                  type="text"
                  value={gstInput}
                  onChange={(e) => setGstInput(e.target.value)}
                  className="input-field"
                  placeholder="27AAAAA0000A1Z5"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingProfile(false)}
                className="btn-ghost text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="btn-primary text-xs py-2 px-4"
              >
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        )}

        {/* Profile Details Grid */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 text-xs">
          {infoItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-1">
                <span className="flex items-center gap-1.5 font-bold text-slate-400 uppercase text-[10px]">
                  <Icon size={13} className="text-emerald-600" /> {item.label}
                </span>
                <p className="font-semibold text-slate-900">{item.value}</p>
              </div>
            );
          })}

          {user?.businessName && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-1 sm:col-span-2">
              <span className="flex items-center gap-1.5 font-bold text-slate-400 uppercase text-[10px]">
                <Building size={13} className="text-emerald-600" /> Business & GST Details
              </span>
              <p className="font-semibold text-slate-900">
                {user.businessName} {user.gstNumber ? `(GSTIN: ${user.gstNumber})` : ''}
              </p>
            </div>
          )}
        </div>

        {/* Address Book */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <MapPin size={17} className="text-emerald-600" />
              <span>Default Installation / Delivery Address</span>
            </div>
            {!editingAddress && (
              <button onClick={() => setEditingAddress(true)} className="btn-ghost py-1.5 text-xs">
                Edit Address
              </button>
            )}
          </div>

          {editingAddress ? (
            <div className="space-y-2">
              <textarea
                rows={2}
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                className="input-field resize-none"
              />
              <div className="flex items-center gap-2 justify-end">
                <button onClick={() => setEditingAddress(false)} className="btn-ghost py-1.5 text-xs">Cancel</button>
                <button onClick={handleSaveDefaultAddress} className="btn-primary py-1.5 text-xs">
                  <Check size={13} /> Save Address
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-emerald-100 p-3.5 text-xs text-slate-700 font-medium flex items-center justify-between">
              <span>{defaultAddress}</span>
              <span className="badge badge-green ml-2">DEFAULT</span>
            </div>
          )}
        </div>
      </div>

      {/* Service Tickets Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">My Service & Repair Tickets</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage, track, or delete submitted warranty and service requests.</p>
          </div>
          <span className="badge badge-slate">{services.length} Ticket{services.length === 1 ? '' : 's'}</span>
        </div>

        {loadingServices ? (
          <div className="skeleton h-28" />
        ) : services.length === 0 ? (
          <div className="surface flex flex-col items-center p-14 text-center space-y-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <Wrench size={22} />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">No Service Tickets Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                You haven't logged any warranty or service requests yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((srv) => (
              <div key={srv.id} className="surface p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <b className="text-base font-bold text-slate-900">{srv.serviceNumber}</b>
                      <span className={`badge ${srv.warrantyStatus === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>
                        {srv.warrantyStatus === 'ACTIVE' ? 'UNDER WARRANTY' : 'OUT OF WARRANTY'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                      {srv.productName || srv.problemCategory} — <span className="text-slate-500">{srv.problemCategory}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-amber">{srv.status}</span>
                    <button
                      disabled={deletingId === srv.id}
                      onClick={() => handleDeleteTicket(srv.id, srv.serviceNumber)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50 transition cursor-pointer"
                    >
                      <Trash2 size={12} />
                      {deletingId === srv.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-500">
                  <p className="leading-relaxed">
                    <b className="text-slate-700">Problem: </b>{srv.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <MapPin size={12} className="text-emerald-600" />
                      <span>{srv.addressText || 'Customer Site'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} className="text-emerald-600" />
                      <span>Scheduled: {srv.scheduledDate} ({srv.timeSlot})</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
