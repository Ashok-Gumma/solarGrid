import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Search, ShoppingCart, Plus, Check, ShieldCheck, Wrench,
  Heart, X, ArrowRight, Star, Sparkles, ChevronRight, Zap, RefreshCw
} from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { Product } from '../../types';

// High clarity product assets stored directly in project frontend public directory
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

export function ProductCatalogPage({
  onAddToCart,
  cartCount,
}: {
  onAddToCart: (product: Product, quantity?: number) => void;
  cartCount: number;
}) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [addedId, setAddedId] = useState<string | null>(null);

  const getWishlistKey = () => (user ? `solargrid_wishlist_${user.id}` : 'solargrid_wishlist_guest');

  // Wishlist State
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const key = user ? `solargrid_wishlist_${user.id}` : 'solargrid_wishlist_guest';
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const key = getWishlistKey();
      setWishlist(JSON.parse(localStorage.getItem(key) || '[]'));
    } catch {
      setWishlist([]);
    }
  }, [user?.id]);

  // Product Details Modal State
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [modalQty, setModalQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    async function loadProducts() {
      const res = await fetchApi<Product[]>('/products');
      if (res.success && res.data) {
        setProducts(res.data);
      }
      setLoading(false);
    }
    loadProducts();
  }, []);

  const toggleWishlist = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    let updated: string[];
    if (wishlist.includes(productId)) {
      updated = wishlist.filter((id) => id !== productId);
    } else {
      updated = [...wishlist, productId];
    }
    setWishlist(updated);
    try {
      localStorage.setItem(getWishlistKey(), JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save wishlist:', err);
    }
  };

  const openProductModal = (product: Product) => {
    setActiveProduct(product);
    setModalQty(1);
    const img = product.imageUrl || DEFAULT_PRODUCT_IMAGES[product.categoryName || ''] || ALT_IMAGES[0];
    setSelectedImage(img);
  };

  const handleAddFromCard = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    onAddToCart(p, 1);
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const handleAddFromModal = (p: Product) => {
    onAddToCart(p, modalQty);
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const categories = ['All', 'Solar Panels', 'Inverters', 'Batteries', 'Mounting', 'Electrical'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.categoryName === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const PRODUCT_SPECIFIC_IMAGES: Record<string, string> = {
    // 1. IP65 DC Protection Combo Box
    'ELE-DCB-2IN': '/assets/products/dc_combiner_box.png',
    // 2. Aluminum Rooftop Rail Mounting Structure Kit
    'MNT-ROOF-4P': '/assets/products/mounting_rack_structure.png',
    // 3. 4sqmm Solar DC Cable Red/Black 100m Roll (Tinned copper wiring roll)
    'ELE-DCC-4MM': '/assets/products/dc_cable_roll.png',
    // 4. 10kW Three-Phase On-Grid Solar Inverter
    'INV-ONG-10K-3P': 'https://cpimg.tistatic.com/01502375/b/4/Solar-Product.jpg',
    // 5. 5kW Single-Phase Hybrid Solar MPPT Inverter
    'INV-HYB-5K-1P': '/assets/products/hybrid_inverter_5kw.png',
    // 6. 540W Bifacial Dual Glass Solar Module
    'SP-540-BIFI': 'https://tiimg.tistatic.com/fp/1/699/solar-panels-027.jpg',
    // 7. 550W Monocrystalline PERC Solar Panel
    'SP-550-MONO': '/assets/products/solar_panel_550w.png',
    // 8. 5.12kWh LiFePO4 Lithium Battery Wall Pack
    'BAT-LFP-5K': '/assets/products/lithium_battery_wall.png',
  };

  const getProductImage = (p: Product) => {
    if (p.sku && PRODUCT_SPECIFIC_IMAGES[p.sku]) {
      return PRODUCT_SPECIFIC_IMAGES[p.sku];
    }
    return p.imageUrl || DEFAULT_PRODUCT_IMAGES[p.categoryName || ''] || ALT_IMAGES[0];
  };

  const recommendedProducts = products.filter((p) => p.id !== activeProduct?.id).slice(0, 3);

  return (
    <div className="space-y-6 animate-rise">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="page-header">
          <h1>Equipment Catalog</h1>
          <p>Browse verified tier-1 solar panels, hybrid inverters, and lithium battery storage systems.</p>
        </div>
      </div>


      {/* Catalog Filters & Search Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Cart Quick Actions */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by SKU or product name..."
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-500 shadow-xs font-medium"
            />
          </div>

          <button
            onClick={() => setLocation('/cart')}
            className="relative inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer shadow-sm"
          >
            <ShoppingCart size={16} />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="ml-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Product Grid - Farnic Furniture Style Cards */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-[2rem] bg-slate-200/60" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="surface rounded-[2rem] p-12 text-center space-y-3 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">No Solar Equipment Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your catalog database is clean. Products added in the Warehouse Inventory Desk will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((p) => {
            const isWish = wishlist.includes(p.id);
            const imgSrc = getProductImage(p);

            return (
              <article
                key={p.id}
                onClick={() => setLocation(`/products/${p.id}`)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-white border border-slate-200/80 p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-slate-300 cursor-pointer"
              >
                {/* Wishlist Heart Button */}
                <button
                  type="button"
                  onClick={(e) => toggleWishlist(e, p.id)}
                  className={`absolute top-6 right-6 z-10 grid h-9 w-9 place-items-center rounded-2xl border transition cursor-pointer shadow-xs backdrop-blur-md ${
                    isWish
                      ? 'border-red-200 bg-red-50 text-red-500'
                      : 'border-slate-200/80 bg-white/80 text-slate-400 hover:text-red-500 hover:bg-white'
                  }`}
                >
                  <Heart size={16} fill={isWish ? 'currentColor' : 'none'} />
                </button>

                {/* Product Image Container */}
                <div className="relative h-52 w-full overflow-hidden rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-3">
                  <img
                    src={imgSrc}
                    alt={p.name}
                    className="h-full w-full object-contain rounded-xl transition duration-500 group-hover:scale-105"
                  />

                  {/* Installation Badge Overlay */}
                  <div className="absolute bottom-3 left-3 flex gap-1">
                    <span className="rounded-full bg-slate-900/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white">
                      {p.categoryName || 'Equipment'}
                    </span>
                    {p.installationEligible && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white">
                        <Wrench size={10} /> Installation Ready
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="mono text-[10px] font-bold text-slate-400">SKU: {p.sku}</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {p.warrantyMonths}m Warranty
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-600 transition line-clamp-1">
                    {p.name}
                  </h3>

                  <p className="line-clamp-2 text-xs text-slate-500 font-medium leading-relaxed">
                    {p.description}
                  </p>

                  {p.specifications && p.specifications.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {p.specifications.slice(0, 2).map((spec, i) => (
                        <span key={i} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Unit Price</span>
                    <b className="text-lg font-extrabold text-slate-900">₹{p.unitPrice.toLocaleString('en-IN')}</b>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleAddFromCard(e, p)}
                    className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                      addedId === p.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {addedId === p.id ? (
                      <>
                        <Check size={14} /> Added
                      </>
                    ) : (
                      <>
                        <Plus size={14} /> Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
