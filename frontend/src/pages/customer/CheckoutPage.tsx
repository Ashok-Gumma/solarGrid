import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ShoppingBag, MapPin, Wrench, ShieldCheck, Calendar, ArrowRight, Check } from 'lucide-react';
import { CartLine } from './CartPage';
import { MapPicker } from '../../components/maps/MapPicker';
import { fetchApi } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

export function CheckoutPage({ cart, onClearCart }: { cart: CartLine[]; onClearCart: () => void }) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const savedDefaultAddress =
    localStorage.getItem(`solargrid_default_addr_${user?.id || 'guest'}`) ||
    '17B, Palm Grove, Markapur, Andhra Pradesh 523316';

  const [addressChoice, setAddressChoice] = useState<'DEFAULT' | 'NEW'>('DEFAULT');
  const [addressText, setAddressText] = useState(savedDefaultAddress);
  const [lat, setLat] = useState(18.5204);
  const [lng, setLng] = useState(73.8567);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');

  const [installOption, setInstallOption] = useState<'SOLARGRID_INSTALLER' | 'CUSTOMER_OWN_INSTALLER' | 'NO_INSTALLATION'>('SOLARGRID_INSTALLER');
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [scheduledDate, setScheduledDate] = useState(tomorrowStr);
  const [timeSlot, setTimeSlot] = useState('09:00 - 12:00');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name || '');
      if (!customerPhone) setCustomerPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    if (addressChoice === 'DEFAULT') {
      setAddressText(savedDefaultAddress);
      setShowMapPicker(false);
    }
  }, [addressChoice, savedDefaultAddress]);

  const hasEligibleProduct = cart.some((line) => line.product.installationEligible);
  const totalAmount = cart.reduce((sum, line) => sum + line.product.unitPrice * line.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    if (!addressText.trim()) {
      alert('Please provide a delivery address.');
      return;
    }

    setSubmitting(true);
    const orderRes = await fetchApi('/orders', {
      method: 'POST',
      body: JSON.stringify({
        customerId: user?.id || 'GUEST',
        items: cart.map((line) => ({ productId: line.product.id, quantity: line.quantity })),
        installationType: hasEligibleProduct ? installOption : 'NO_INSTALLATION',
        addressText,
      }),
    });

    if (orderRes.success && orderRes.data) {
      const order = orderRes.data as any;

      if (hasEligibleProduct && installOption === 'SOLARGRID_INSTALLER') {
        await fetchApi('/installations', {
          method: 'POST',
          body: JSON.stringify({
            orderId: order.id,
            customerId: user?.id || 'GUEST',
            customerName: customerName || user?.name || 'Customer',
            customerPhone: customerPhone || user?.phone || '',
            addressText,
            latitude: lat,
            longitude: lng,
            scheduledDate,
            timeSlot,
            notes: 'Rooftop installation booking confirmed by customer.',
          }),
        });
      }

      onClearCart();
      setLocation('/my-orders');
    } else {
      alert(orderRes.message || 'Failed to place order.');
    }
    setSubmitting(false);
  };

  if (cart.length === 0) {
    return (
      <div className="surface rounded-[2rem] p-12 text-center space-y-3 max-w-md mx-auto my-12 border border-slate-200">
        <ShoppingBag size={32} className="text-emerald-700 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">Add equipment products from our store to proceed with checkout.</p>
        <button
          onClick={() => setLocation('/store')}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-black cursor-pointer"
        >
          Browse Equipment Store
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Checkout & Confirm Order</h1>
        <p className="text-xs text-slate-500">Select delivery address preferences and installation choices.</p>
      </div>

      {/* 1. Recipient Contact Details */}
      <section className="surface rounded-2xl p-5 space-y-4 border border-slate-200">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <ShoppingBag size={18} className="text-emerald-600" /> Recipient Contact Information
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500"
              placeholder="Enter contact name..."
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Mobile Phone Number *</label>
            <input
              type="text"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>
      </section>

      {/* 2. Address Selection Preference */}
      <section className="surface rounded-2xl p-5 space-y-4 border border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <MapPin size={18} className="text-emerald-600" /> Delivery & Installation Site Address
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAddressChoice('DEFAULT')}
            className={`rounded-2xl border p-3.5 text-left text-xs font-bold transition cursor-pointer ${
              addressChoice === 'DEFAULT'
                ? 'border-[#6f9841] bg-[#e7efcf] text-slate-900'
                : 'border-[#d6decd] bg-slate-50 text-[#4d5f52]'
            }`}
          >
            <span className="block text-[10px] uppercase font-bold text-emerald-600 mb-1">Option 1</span>
            <b>Use Saved Default Address</b>
          </button>

          <button
            type="button"
            onClick={() => setAddressChoice('NEW')}
            className={`rounded-2xl border p-3.5 text-left text-xs font-bold transition cursor-pointer ${
              addressChoice === 'NEW'
                ? 'border-[#6f9841] bg-[#e7efcf] text-slate-900'
                : 'border-[#d6decd] bg-slate-50 text-[#4d5f52]'
            }`}
          >
            <span className="block text-[10px] uppercase font-bold text-emerald-600 mb-1">Option 2</span>
            <b>Use New / Interactive Map Location</b>
          </button>
        </div>

        {addressChoice === 'DEFAULT' ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs text-slate-900 font-medium flex items-center justify-between">
            <div>
              <b className="block text-emerald-700 mb-0.5">Profile Default Saved Address:</b>
              <span>{addressText}</span>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0 ml-2">
              DEFAULT
            </span>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Specify New Delivery Street Address:</span>
              <button
                type="button"
                onClick={() => setShowMapPicker(!showMapPicker)}
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                {showMapPicker ? 'Close Interactive Map' : 'Pinpoint on Interactive Leaflet Map'}
              </button>
            </div>

            {showMapPicker ? (
              <MapPicker
                initialLat={lat}
                initialLng={lng}
                initialAddress={addressText}
                onConfirm={(loc) => {
                  setAddressText(loc.address);
                  setLat(loc.lat);
                  setLng(loc.lng);
                  setShowMapPicker(false);
                }}
              />
            ) : (
              <input
                type="text"
                required
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                placeholder="Enter complete delivery street address, city, and pincode..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 outline-none focus:border-emerald-500"
              />
            )}
          </div>
        )}
      </section>

      {/* 2. Installation Option */}
      <section className="surface rounded-2xl p-5 space-y-4 border border-slate-200">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Wrench size={18} className="text-emerald-600" /> Solar Installation Options
        </h3>

        {hasEligibleProduct ? (
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => setInstallOption('SOLARGRID_INSTALLER')}
              className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition cursor-pointer ${
                installOption === 'SOLARGRID_INSTALLER'
                  ? 'border-[#6f9841] bg-[#e7efcf]'
                  : 'border-[#d6decd] bg-slate-50'
              }`}
            >
              <Wrench size={18} className="text-emerald-700 mt-0.5" />
              <div className="flex-1">
                <b className="block text-xs font-bold text-slate-900">SolarGrid Certified Crew Installation</b>
                <p className="text-[11px] text-[#637466]">Our trained technicians handle mounting, wiring, safety checks, and net-meter prep.</p>
              </div>
              {installOption === 'SOLARGRID_INSTALLER' && <Check size={18} className="text-[#5d8136]" />}
            </button>

            <button
              type="button"
              onClick={() => setInstallOption('CUSTOMER_OWN_INSTALLER')}
              className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition cursor-pointer ${
                installOption === 'CUSTOMER_OWN_INSTALLER'
                  ? 'border-[#6f9841] bg-[#e7efcf]'
                  : 'border-[#d6decd] bg-slate-50'
              }`}
            >
              <ShieldCheck size={18} className="text-emerald-700 mt-0.5" />
              <div className="flex-1">
                <b className="block text-xs font-bold text-slate-900">Direct Equipment Supply Only (Own Contractor)</b>
                <p className="text-[11px] text-[#637466]">Equipment will be delivered to your site. You arrange your own certified electrical contractor.</p>
              </div>
              {installOption === 'CUSTOMER_OWN_INSTALLER' && <Check size={18} className="text-[#5d8136]" />}
            </button>

            {installOption === 'SOLARGRID_INSTALLER' && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
                <b className="block font-bold text-slate-900">Schedule Crew Arrival Date & Time Slot</b>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Target Date</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Time Window</label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2 text-xs outline-none"
                    >
                      <option value="09:00 - 12:00">Morning Slot (09:00 AM - 12:00 PM)</option>
                      <option value="14:00 - 17:00">Afternoon Slot (02:00 PM - 05:00 PM)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#637466]">Selected equipment does not require rooftop mounting.</p>
        )}
      </section>

      {/* 3. Order Summary & Confirm Button */}
      <section className="surface rounded-2xl p-5 space-y-4 border border-slate-200">
        <h3 className="font-bold text-slate-900 text-sm">Order Summary</h3>
        <div className="space-y-2 text-xs text-slate-500">
          {cart.map((line) => (
            <div key={line.product.id} className="flex justify-between border-b border-slate-100 pb-2">
              <span>
                {line.product.name} x {line.quantity}
              </span>
              <b>₹{(line.product.unitPrice * line.quantity).toLocaleString('en-IN')}</b>
            </div>
          ))}
          <div className="flex justify-between text-sm font-bold text-slate-900 pt-2">
            <span>Total Amount Payable</span>
            <span className="text-emerald-700">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-xs font-bold text-white hover:bg-black disabled:opacity-50 transition cursor-pointer shadow-md"
        >
          <span>{submitting ? 'Processing Order...' : 'Confirm & Place Equipment Order'}</span>
          <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
}
