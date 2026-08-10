import React from 'react';
import { useLocation } from 'wouter';
import { ShoppingBag, ArrowRight, Trash2, ShieldCheck, Wrench, AlertCircle, Minus, Plus } from 'lucide-react';
import { Product } from '../../types';

export interface CartLine {
  product: Product;
  quantity: number;
}

interface CartPageProps {
  cart: CartLine[];
  onUpdateQty: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
}

export function CartPage({ cart, onUpdateQty, onRemove }: CartPageProps) {
  const [, setLocation] = useLocation();

  const totalAmount = cart.reduce((sum, line) => sum + line.product.unitPrice * line.quantity, 0);
  const hasEligibleProduct = cart.some((line) => line.product.installationEligible);

  return (
    <div className="space-y-6 animate-rise">
      <div className="flex items-center justify-between">
        <div className="page-header">
          <h1>Your Equipment Cart</h1>
          <p>Review selected items before choosing delivery & installation.</p>
        </div>
        <button onClick={() => setLocation('/store')} className="btn-ghost">
          ← Continue Shopping
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="surface flex flex-col items-center justify-center p-16 text-center space-y-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <ShoppingBag size={28} />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900">Your cart is empty</h3>
            <p className="mt-1 text-xs text-slate-500">Add panels, inverters, or accessories from the equipment catalog.</p>
          </div>
          <button onClick={() => setLocation('/store')} className="btn-primary mt-2">
            Browse Equipment Catalog
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Items list */}
          <div className="space-y-3">
            {cart.map((line) => (
              <div key={line.product.id} className="surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-sm">{line.product.name}</h3>
                    {line.product.installationEligible ? (
                      <span className="badge badge-green">Installation Eligible</span>
                    ) : (
                      <span className="badge badge-amber">Supply Only</span>
                    )}
                  </div>
                  <p className="mono text-[11px] text-slate-400 mt-0.5">SKU: {line.product.sku}</p>
                  <p className="mt-1 text-xs font-semibold text-emerald-700">
                    ₹{line.product.unitPrice.toLocaleString('en-IN')} each
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 overflow-hidden">
                    <button
                      onClick={() => onUpdateQty(line.product.id, -1)}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-900">{line.quantity}</span>
                    <button
                      onClick={() => onUpdateQty(line.product.id, 1)}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <b className="w-24 text-right text-sm font-bold text-slate-900">
                    ₹{(line.product.unitPrice * line.quantity).toLocaleString('en-IN')}
                  </b>

                  <button
                    onClick={() => onRemove(line.product.id)}
                    className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}

            {/* Installation Banner */}
            {hasEligibleProduct ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 flex gap-3">
                <Wrench className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <b className="text-sm font-bold text-emerald-900">Installation Service Available</b>
                  <p className="mt-0.5 text-xs text-emerald-700 leading-relaxed">
                    Your cart contains equipment eligible for professional SolarGrid technician installation. Select a schedule during checkout.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 flex gap-3">
                <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <b className="text-sm font-bold text-amber-900">Supply Only Equipment Order</b>
                  <p className="mt-0.5 text-xs text-amber-700 leading-relaxed">
                    Your cart consists of balance-of-system items. Installation dispatch will be bypassed for this order.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Checkout Summary */}
          <aside className="surface h-fit p-6 lg:sticky lg:top-24 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Summary</h3>
            <div className="space-y-2 border-b border-slate-100 pb-4 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Equipment Subtotal</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery & Logistics</span>
                <span className="font-bold text-emerald-600">INCLUDED</span>
              </div>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900">
              <span>Total Amount</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <button
              onClick={() => setLocation('/checkout')}
              className="btn-primary w-full py-3.5"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
