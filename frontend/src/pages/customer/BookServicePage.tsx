import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Wrench, ArrowRight, Package, ShieldCheck } from 'lucide-react';
import { MapPicker } from '../../components/maps/MapPicker';
import { fetchApi } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { Order } from '../../types';

export function BookServicePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrderEquipment, setSelectedOrderEquipment] = useState<string>('');

  const [problemCategory, setProblemCategory] = useState('Inverter issue');
  const [description, setDescription] = useState('');
  const [productId, setProductId] = useState('');
  const savedDefaultAddress =
    localStorage.getItem(`solargrid_default_addr_${user?.id || 'guest'}`) ||
    '17B, Palm Grove, Markapur, Andhra Pradesh 523316';

  const [addressChoice, setAddressChoice] = useState<'DEFAULT' | 'NEW'>('DEFAULT');
  const [componentName, setComponentName] = useState('');
  const [addressText, setAddressText] = useState(savedDefaultAddress);
  const [lat, setLat] = useState(18.5204);
  const [lng, setLng] = useState(73.8567);
  const [showMap, setShowMap] = useState(false);
  const [warrantyClaimInfo, setWarrantyClaimInfo] = useState<{ productName: string; serialNumber: string; warrantyId: string } | null>(null);

  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [scheduledDate, setScheduledDate] = useState(tomorrowStr);
  const [timeSlot, setTimeSlot] = useState('09:00 - 12:00');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (addressChoice === 'DEFAULT') {
      setAddressText(savedDefaultAddress);
      setShowMap(false);
    }
  }, [addressChoice, savedDefaultAddress]);

  const problemCategories = [
    'Warranty Claim / Repair',
    'Inverter issue',
    'Panel issue',
    'Battery problem',
    'Wiring problem',
    'System error / tripping',
    'Physical damage',
    'Other service support',
  ];

  useEffect(() => {
    // Parse query params for direct Warranty Claim links
    const searchParams = new URLSearchParams(window.location.search);
    const pName = searchParams.get('productName');
    const sNum = searchParams.get('serialNumber');
    const wId = searchParams.get('warrantyId');

    if (pName && sNum) {
      setComponentName(`${pName} (Serial: ${sNum})`);
      setProblemCategory('Warranty Claim / Repair');
      setWarrantyClaimInfo({ productName: pName, serialNumber: sNum, warrantyId: wId || '' });
    }

    async function loadCustomerPurchases() {
      setLoadingOrders(true);
      const res = await fetchApi<any>('/orders');
      if (res.success) {
        const rawData = res as any;
        const orderList = Array.isArray(res.data)
          ? res.data
          : rawData.orders || (res.data && res.data.orders) || [];
        setCustomerOrders(orderList);
        if (orderList.length > 0 && orderList[0].addressText) {
          setAddressText((prev) => prev || orderList[0].addressText);
        }
      }
      setLoadingOrders(false);
    }
    loadCustomerPurchases();
  }, []);

  const handleSelectOrderEquipment = (orderId: string) => {
    setSelectedOrderEquipment(orderId);
    if (orderId === '' || orderId === 'OTHER') {
      setComponentName('');
      return;
    }

    const order = customerOrders.find((o) => o.id === orderId);
    if (order) {
      setComponentName(`Order ${order.orderNumber} - Solar Equipment`);
      if (order.addressText) {
        setAddressText(order.addressText);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please describe the problem.');
      return;
    }
    if (!addressText.trim()) {
      alert('Please provide a service site location.');
      return;
    }

    setSubmitting(true);
    const res = await fetchApi('/services', {
      method: 'POST',
      body: JSON.stringify({
        customerId: user?.id || 'GUEST',
        customerName: user?.name || 'Customer',
        addressText,
        problemCategory,
        description: warrantyClaimInfo
          ? `[WARRANTY CLAIM - Serial: ${warrantyClaimInfo.serialNumber}] ${description}`
          : description,
        productId,
        productName: componentName || problemCategory,
        scheduledDate,
        timeSlot,
      }),
    });

    if (res.success) {
      alert('Warranty Service Ticket logged successfully! A Field Technician will be assigned to your rooftop location.');
      setLocation('/my-warranties');
    } else {
      alert(res.message || 'Service ticket submitted successfully.');
      setLocation('/my-orders');
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Book Equipment Service & Warranty Claim</h1>
        <p className="text-xs text-slate-500">
          Submit a technician dispatch request for warranty coverage claims or out-of-warranty equipment maintenance.
        </p>
      </div>

      {warrantyClaimInfo && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-100 p-4 text-xs text-slate-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white shrink-0">
            <ShieldCheck size={20} />
          </span>
          <div>
            <b className="block text-sm text-emerald-700">Active Warranty Claim Auto-Populated</b>
            <p className="text-[11px] text-[#3e5e48]">
              Claiming warranty service for <b>{warrantyClaimInfo.productName}</b> (Serial: <code>{warrantyClaimInfo.serialNumber}</code>). No labor or parts charge for active warranty claims.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="surface rounded-2xl p-6 space-y-5">
        {/* Previously Ordered Equipment Selector */}
        {!warrantyClaimInfo && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
            <label className="flex items-center gap-1.5 font-bold uppercase text-emerald-700 text-xs">
              <Package size={16} className="text-emerald-600" /> Select From Your Delivered Orders
            </label>

            {loadingOrders ? (
              <p className="text-xs text-slate-400">Loading order history...</p>
            ) : customerOrders.length > 0 ? (
              <select
                value={selectedOrderEquipment}
                onChange={(e) => handleSelectOrderEquipment(e.target.value)}
                className="w-full rounded-xl border border-[#b3c79c] bg-white p-2.5 text-xs font-semibold text-slate-900 outline-none"
              >
                <option value="">-- Choose From Your Delivered Orders --</option>
                {customerOrders.map((ord) => (
                  <option key={ord.id} value={ord.id}>
                    Order {ord.orderNumber} (Placed on {new Date(ord.createdAt).toLocaleDateString()} - ₹{ord.totalAmount.toLocaleString('en-IN')})
                  </option>
                ))}
                <option value="OTHER">+ Other / Custom Out-of-Warranty Equipment</option>
              </select>
            ) : (
              <p className="text-xs text-slate-500">
                No previous orders found in your account history. Enter custom equipment details below.
              </p>
            )}
          </div>
        )}

        {/* Component Name */}
        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
            Solar Equipment / Component Name *
          </label>
          <input
            type="text"
            required
            value={componentName}
            onChange={(e) => setComponentName(e.target.value)}
            placeholder="e.g. 5kW Hybrid Inverter, 550W Mono PERC Panel..."
            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>

        {/* Problem Category */}
        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
            Problem Category *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {problemCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setProblemCategory(cat)}
                className={`rounded-xl border p-2.5 text-left text-xs font-semibold transition cursor-pointer ${
                  problemCategory === cat
                    ? 'border-[#6f9841] bg-[#e7efcf] text-slate-900'
                    : 'border-[#d6decd] bg-slate-50 text-[#4d5f52]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Problem Description */}
        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
            Detailed Issue Description *
          </label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe error code, inverter trip frequency, or physical observation..."
            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>

        {/* Address Selection Choice */}
        <div className="space-y-3">
          <label className="block text-[11px] font-bold uppercase text-slate-400">
            Service Site Location Address *
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAddressChoice('DEFAULT')}
              className={`rounded-2xl border p-3 text-left text-xs font-bold transition cursor-pointer ${
                addressChoice === 'DEFAULT'
                  ? 'border-[#6f9841] bg-[#e7efcf] text-slate-900'
                  : 'border-[#d6decd] bg-slate-50 text-[#4d5f52]'
              }`}
            >
              <span className="block text-[10px] uppercase font-bold text-emerald-600 mb-0.5">Option 1</span>
              <b>Use Saved Default Address</b>
            </button>

            <button
              type="button"
              onClick={() => setAddressChoice('NEW')}
              className={`rounded-2xl border p-3 text-left text-xs font-bold transition cursor-pointer ${
                addressChoice === 'NEW'
                  ? 'border-[#6f9841] bg-[#e7efcf] text-slate-900'
                  : 'border-[#d6decd] bg-slate-50 text-[#4d5f52]'
              }`}
            >
              <span className="block text-[10px] uppercase font-bold text-emerald-600 mb-0.5">Option 2</span>
              <b>Use New / Interactive Map Location</b>
            </button>
          </div>

          {addressChoice === 'DEFAULT' ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-slate-900 font-medium flex items-center justify-between">
              <div>
                <b className="block text-emerald-700 mb-0.5">Profile Default Saved Address:</b>
                <span>{addressText}</span>
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0 ml-2">
                DEFAULT
              </span>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Specify New Service Address:</span>
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  {showMap ? 'Close Interactive Map' : 'Select on Interactive Leaflet Map'}
                </button>
              </div>

              {showMap ? (
                <MapPicker
                  initialLat={lat}
                  initialLng={lng}
                  initialAddress={addressText}
                  onConfirm={(loc) => {
                    setAddressText(loc.address);
                    setLat(loc.lat);
                    setLng(loc.lng);
                    setShowMap(false);
                  }}
                />
              ) : (
                <input
                  type="text"
                  required
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  placeholder="Enter complete street address, city, and pincode..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500"
                />
              )}
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Preferred Technician Arrival Date *
            </label>
            <input
              type="date"
              required
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Time Slot *
            </label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none"
            >
              <option value="09:00 - 12:00">Morning Slot (09:00 AM - 12:00 PM)</option>
              <option value="14:00 - 17:00">Afternoon Slot (02:00 PM - 05:00 PM)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-black disabled:opacity-50 cursor-pointer"
        >
          <span>{submitting ? 'Submitting Service Ticket...' : 'Log Warranty Service Ticket'}</span>
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
