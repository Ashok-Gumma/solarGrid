import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { ShoppingCart, Heart, ArrowLeft, ShieldCheck, Wrench, Sparkles, Check } from 'lucide-react';
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

export function ProductDetailPage({
  onAddToCart,
}: {
  onAddToCart: (product: Product, quantity?: number) => void;
}) {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [added, setAdded] = useState(false);

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('solargrid_wishlist') || '[]');
    } catch {
      return [];
    }
  });

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

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await fetchApi<Product[]>('/products');
      if (res.success && res.data) {
        setAllProducts(res.data);
        const found = res.data.find((p) => p.id === id);
        if (found) {
          setProduct(found);
          setSelectedImage(getProductImg(found));
        }
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  const toggleWishlist = () => {
    if (!product) return;
    let updated: string[];
    if (wishlist.includes(product.id)) {
      updated = wishlist.filter((wId) => wId !== product.id);
    } else {
      updated = [...wishlist, product.id];
    }
    setWishlist(updated);
    localStorage.setItem('solargrid_wishlist', JSON.stringify(updated));
  };

  const handleAddToCart = () => {
    if (!product) return;
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-rise">
        <div className="skeleton h-10 w-32" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="skeleton h-96" />
          <div className="space-y-4">
            <div className="skeleton h-8" />
            <div className="skeleton h-6 w-1/2" />
            <div className="skeleton h-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="surface p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <button onClick={() => setLocation('/store')} className="btn-primary">
          Back to Store Catalog
        </button>
      </div>
    );
  }

  const recommendations = allProducts.filter((p) => p.id !== product.id);
  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="space-y-8 animate-rise">
      {/* Back Button */}
      <button
        onClick={() => setLocation('/store')}
        className="btn-ghost"
      >
        <ArrowLeft size={14} /> Back to Catalog
      </button>

      {/* Main Product Section */}
      <div className="surface p-6 md:p-8 space-y-6">
        <div className="grid gap-8 md:grid-cols-2 items-start">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="h-96 w-full overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 flex items-center justify-center shadow-xs">
              <img
                src={selectedImage}
                alt={product.name}
                className="h-full w-full object-contain rounded-2xl"
              />
            </div>

            <div className="flex gap-2">
              {[
                getProductImg(product),
                PRODUCT_SPECIFIC_IMAGES['SP-550-MONO'],
                PRODUCT_SPECIFIC_IMAGES['INV-HYB-5K-1P'],
              ].map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`h-16 w-16 overflow-hidden rounded-2xl border-2 transition cursor-pointer bg-white p-1 ${
                    selectedImage === img ? 'border-emerald-600 scale-95' : 'border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Specs & Info */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge badge-green">
                {product.categoryName || 'Equipment'}
              </span>
              {product.installationEligible && (
                <span className="badge badge-amber flex items-center gap-1">
                  <Wrench size={12} /> Installation Ready
                </span>
              )}
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>

            <p className="mono text-xs font-bold text-slate-400">SKU: {product.sku}</p>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-extrabold text-slate-900">
                ₹{product.unitPrice.toLocaleString('en-IN')}
              </span>
              <span className="badge badge-slate">
                In Stock ({product.currentStock} Units Available)
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {product.description}
            </p>

            {/* Technical Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <b className="block text-xs font-bold text-slate-900">Technical Specifications:</b>
                <div className="flex flex-wrap gap-2">
                  {product.specifications.map((spec, i) => (
                    <span key={i} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 font-semibold">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Cart Actions */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700">Select Quantity:</span>
                <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-8 w-8 rounded-xl bg-white text-slate-700 font-bold hover:bg-slate-100 cursor-pointer shadow-xs"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-slate-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="h-8 w-8 rounded-xl bg-white text-slate-700 font-bold hover:bg-slate-100 cursor-pointer shadow-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="btn-primary flex-1 py-3.5"
                >
                  {added ? <Check size={16} /> : <ShoppingCart size={16} />}
                  <span>{added ? 'Added to Cart!' : `Add ${quantity} to Cart`}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleWishlist}
                  className={`grid h-12 w-12 place-items-center rounded-full border transition cursor-pointer ${
                    isWishlisted
                      ? 'border-red-200 bg-red-50 text-red-500'
                      : 'border-slate-200 bg-white text-slate-400 hover:text-red-500'
                  }`}
                >
                  <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Recommendations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="page-header">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles size={18} className="text-emerald-600" /> Recommended Equipment & Systems
            </h2>
            <p>Compatible solar modules, inverters, and battery storage for your setup.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((p) => {
            const pImg = getProductImg(p);
            return (
              <div
                key={p.id}
                onClick={() => setLocation(`/products/${p.id}`)}
                className="surface p-5 space-y-3 cursor-pointer hover:-translate-y-0.5"
              >
                <div className="h-40 w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center">
                  <img src={pImg} alt={p.name} className="h-full w-full object-cover rounded-xl" />
                </div>
                <div>
                  <b className="block text-sm font-bold text-slate-900 truncate">{p.name}</b>
                  <p className="mono text-[11px] text-slate-400">SKU: {p.sku}</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <b className="text-base font-extrabold text-slate-900">
                    ₹{p.unitPrice.toLocaleString('en-IN')}
                  </b>
                  <span className="btn-ghost py-1 px-3 text-xs">View Details →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
