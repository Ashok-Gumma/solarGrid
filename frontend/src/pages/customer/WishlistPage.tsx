import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Heart, ShoppingBag, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { Product } from '../../types';

const DEFAULT_PRODUCT_IMAGES: Record<string, string> = {
  'Solar Panels': '/assets/products/solar_panel_550w.png',
  'Inverters': '/assets/products/hybrid_inverter_5kw.png',
  'Batteries': '/assets/products/lithium_battery_wall.png',
  'Mounting': '/assets/products/mounting_rack_structure.png',
  'Electrical': '/assets/products/dc_combiner_box.png',
};

const ALT_IMAGES = [
  '/assets/products/solar_panel_550w.png',
  '/assets/products/hybrid_inverter_5kw.png',
  '/assets/products/lithium_battery_wall.png',
];

export function WishlistPage({
  onAddToCart,
}: {
  onAddToCart: (product: Product, quantity?: number) => void;
}) {
  const [, setLocation] = useLocation();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('solargrid_wishlist') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    async function loadWishlist() {
      setLoading(true);
      const res = await fetchApi<Product[]>('/products');
      if (res.success && res.data) {
        const saved = res.data.filter((p) => wishlistIds.includes(p.id));
        setWishlistProducts(saved);
      }
      setLoading(false);
    }
    loadWishlist();
  }, [wishlistIds]);

  const handleRemoveFromWishlist = (productId: string) => {
    const updated = wishlistIds.filter((id) => id !== productId);
    setWishlistIds(updated);
    localStorage.setItem('solargrid_wishlist', JSON.stringify(updated));
  };

  const PRODUCT_SPECIFIC_IMAGES: Record<string, string> = {
    'ELE-DCB-2IN': '/assets/products/dc_combiner_box.png',
    'MNT-ROOF-4P': '/assets/products/mounting_rack_structure.png',
    'ELE-DCC-4MM': '/assets/products/dc_cable_roll.png',
    'INV-ONG-10K-3P': 'https://cpimg.tistatic.com/01502375/b/4/Solar-Product.jpg',
    'INV-HYB-5K-1P': '/assets/products/hybrid_inverter_5kw.png',
    'SP-540-BIFI': 'https://tiimg.tistatic.com/fp/1/699/solar-panels-027.jpg',
    'SP-550-MONO': '/assets/products/solar_panel_550w.png',
    'BAT-LFP-5K': '/assets/products/lithium_battery_wall.png',
  };

  const getProductImg = (p: Product) => {
    if (p.sku && PRODUCT_SPECIFIC_IMAGES[p.sku]) {
      return PRODUCT_SPECIFIC_IMAGES[p.sku];
    }
    return p.imageUrl || DEFAULT_PRODUCT_IMAGES[p.categoryName || ''] || ALT_IMAGES[0];
  };

  return (
    <div className="space-y-6 animate-rise">
      <div className="flex items-center justify-between">
        <div className="page-header">
          <h1 className="flex items-center gap-2">
            <Heart className="text-red-500 fill-red-500" size={24} /> My Saved Wishlist
          </h1>
          <p>Bookmarked solar modules, inverters, and accessories saved for future purchase.</p>
        </div>
        <button onClick={() => setLocation('/store')} className="btn-ghost">
          ← Back to Catalog
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="skeleton h-64" />
          <div className="skeleton h-64" />
        </div>
      ) : wishlistProducts.length === 0 ? (
        <div className="surface flex flex-col items-center p-16 text-center space-y-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <Heart size={26} />
          </span>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Your Wishlist is Empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Click the heart icon on any product in the store catalog to save it here for later.
            </p>
          </div>
          <button onClick={() => setLocation('/store')} className="btn-primary">
            Explore Equipment Catalog
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlistProducts.map((p) => {
            const pImg = getProductImg(p);
            return (
              <div
                key={p.id}
                className="surface p-5 space-y-4 flex flex-col justify-between"
              >
                <div
                  onClick={() => setLocation(`/products/${p.id}`)}
                  className="space-y-3 cursor-pointer"
                >
                  <div className="h-44 w-full overflow-hidden rounded-2xl bg-white border border-slate-200 p-3 flex items-center justify-center">
                    <img src={pImg} alt={p.name} className="h-full w-full object-contain rounded-xl" />
                  </div>
                  <div>
                    <span className="badge badge-green text-[10px] mb-1">{p.categoryName}</span>
                    <b className="block text-sm font-bold text-slate-900 truncate">{p.name}</b>
                    <p className="mono text-[11px] text-slate-400">SKU: {p.sku}</p>
                  </div>
                  <b className="text-lg font-extrabold text-slate-900 block">
                    ₹{p.unitPrice.toLocaleString('en-IN')}
                  </b>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onAddToCart(p, 1)}
                    className="btn-primary flex-1 py-2 text-xs"
                  >
                    <ShoppingCart size={13} /> Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemoveFromWishlist(p.id)}
                    className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition cursor-pointer"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
