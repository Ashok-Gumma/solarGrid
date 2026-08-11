import React, { useEffect, useState } from 'react';
import { Box, AlertTriangle, Plus, RefreshCw, Sparkles, Activity, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { fetchApi } from '../../lib/api';
import { Product, AuditLog } from '../../types';

const solarProductPresets = [
  {
    name: '550W Monocrystalline PERC Solar Panel',
    sku: 'SP-550-MONO',
    categoryName: 'Solar Panels',
    unitPrice: 18500,
    currentStock: 100,
    minStockAlert: 15,
    location: 'Warehouse Bay A-01',
    installationEligible: true,
    warrantyMonths: 300,
    description: 'Tier-1 High Efficiency 550W Mono PERC solar panel with anodized aluminum frame.',
  },
  {
    name: '540W Bifacial Dual Glass Solar Module',
    sku: 'SP-540-BIFI',
    categoryName: 'Solar Panels',
    unitPrice: 19800,
    currentStock: 85,
    minStockAlert: 12,
    location: 'Warehouse Bay A-02',
    installationEligible: true,
    warrantyMonths: 300,
    description: 'Bifacial glass-to-glass solar module capturing rear reflection for up to 25% extra energy generation.',
  },
  {
    name: '5kW Hybrid Solar Inverter (Single Phase)',
    sku: 'INV-HYB-5K-1P',
    categoryName: 'Inverters',
    unitPrice: 65000,
    currentStock: 30,
    minStockAlert: 5,
    location: 'Warehouse Bay B-05',
    installationEligible: true,
    warrantyMonths: 120,
    description: '5kW Hybrid MPPT Solar Inverter supporting battery storage and grid sync.',
  },
  {
    name: '10kW Three-Phase On-Grid Solar Inverter',
    sku: 'INV-ONG-10K-3P',
    categoryName: 'Inverters',
    unitPrice: 92000,
    currentStock: 20,
    minStockAlert: 4,
    location: 'Warehouse Bay B-06',
    installationEligible: true,
    warrantyMonths: 120,
    description: 'Industrial 10kW 3-Phase Grid-Tied solar inverter with dual MPPT tracking.',
  },
  {
    name: '5.12kWh Lithium LiFePO4 Battery Pack (48V 100Ah)',
    sku: 'BAT-LFP-5K',
    categoryName: 'Batteries',
    unitPrice: 135000,
    currentStock: 25,
    minStockAlert: 5,
    location: 'Warehouse Bay C-02',
    installationEligible: true,
    warrantyMonths: 120,
    description: 'Deep-cycle LiFePO4 battery pack with built-in smart BMS and 6,000+ cycle lifespan.',
  },
  {
    name: 'Aluminum Rooftop Rail Mounting Structure Kit (4 Panels)',
    sku: 'MNT-ROOF-4P',
    categoryName: 'Mounting',
    unitPrice: 12500,
    currentStock: 60,
    minStockAlert: 10,
    location: 'Warehouse Rack D-10',
    installationEligible: false,
    warrantyMonths: 60,
    description: 'Corrosion-resistant anodized aluminum mounting rails and mid/end clamps.',
  },
  {
    name: '4sqmm Solar DC Cable Red/Black (100m Roll)',
    sku: 'ELE-DCC-4MM',
    categoryName: 'Electrical',
    unitPrice: 8500,
    currentStock: 40,
    minStockAlert: 8,
    location: 'Warehouse Rack E-03',
    installationEligible: false,
    warrantyMonths: 36,
    description: 'UV & Ozone resistant tinned copper twin-core solar DC cable roll.',
  },
  {
    name: 'IP65 Solar Array Protection Combo DC Box (2 In 2 Out)',
    sku: 'ELE-DCB-2IN',
    categoryName: 'Electrical',
    unitPrice: 4200,
    currentStock: 50,
    minStockAlert: 10,
    location: 'Warehouse Rack E-04',
    installationEligible: false,
    warrantyMonths: 24,
    description: 'Pre-wired outdoor DC combiner box with SPD surge protection and 1000V fuses.',
  },
];

export function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Stock Adjustment Modal State
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(5);
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [reason, setReason] = useState('Supplier Delivery');

  // Add Product Modal State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<string>('');
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [categoryName, setCategoryName] = useState('Solar Panels');
  const [unitPrice, setUnitPrice] = useState(18000);
  const [currentStock, setCurrentStock] = useState(50);
  const [minStockAlert, setMinStockAlert] = useState(10);
  const [location, setLocation] = useState('Warehouse Bay A');
  const [installationEligible, setInstallationEligible] = useState(true);
  const [warrantyMonths, setWarrantyMonths] = useState(300);
  const [description, setDescription] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  async function loadInventory() {
    setLoading(true);
    const res = await fetchApi<any>('/inventory');
    if (res.success && res.data && res.data.products) {
      setProducts(res.data.products);
    } else {
      setProducts([]);
    }
    setLoading(false);
  }

  const handleSelectPreset = (indexStr: string) => {
    setSelectedPresetIndex(indexStr);
    if (indexStr === '') return;
    const preset = solarProductPresets[Number(indexStr)];
    if (preset) {
      setName(preset.name);
      setSku(preset.sku);
      setCategoryName(preset.categoryName);
      setUnitPrice(preset.unitPrice);
      setCurrentStock(preset.currentStock);
      setMinStockAlert(preset.minStockAlert);
      setLocation(preset.location);
      setInstallationEligible(preset.installationEligible);
      setWarrantyMonths(preset.warrantyMonths);
      setDescription(preset.description);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const res = await fetchApi('/stock-movements', {
      method: 'POST',
      body: JSON.stringify({
        productId: selectedProduct.id,
        quantity,
        movementType,
        reason,
      }),
    });

    if (res.success) {
      setShowAdjustModal(false);
      loadInventory();
    } else {
      alert(res.message || 'Failed to adjust stock.');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim()) {
      alert('Product Name and SKU Code are required.');
      return;
    }

    setSavingProduct(true);
    const res = await fetchApi('/products', {
      method: 'POST',
      body: JSON.stringify({
        sku,
        name,
        categoryName,
        unitPrice: Number(unitPrice),
        currentStock: Number(currentStock),
        minStockAlert: Number(minStockAlert),
        location,
        installationEligible,
        warrantyMonths: Number(warrantyMonths),
        description,
        specifications: [`${name} - ${categoryName}`],
      }),
    });

    if (res.success) {
      setShowAddProductModal(false);
      setSku('');
      setName('');
      setDescription('');
      setSelectedPresetIndex('');
      loadInventory();
    } else {
      alert(res.message || 'Failed to add product to catalog.');
    }
    setSavingProduct(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Warehouse Inventory Management</h1>
          <p className="text-xs text-slate-500">Add products to catalog, track stock levels, and set minimum stock alerts.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadInventory}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => setShowAddProductModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-black"
          >
            <Plus size={16} /> Add New Product
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-16 skeleton" />
          <div className="h-16 skeleton" />
        </div>
      ) : products.length === 0 ? (
        <div className="surface rounded-[2rem] p-12 text-center space-y-3 border border-slate-200">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 mx-auto">
            <Box size={24} />
          </span>
          <h3 className="text-lg font-bold text-slate-900">No Products Registered in Catalog</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your inventory catalog is clean. Click Add New Product to select standard solar industry equipment presets or enter custom products.
          </p>
          <button
            onClick={() => setShowAddProductModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-black"
          >
            <Plus size={16} /> Add First Product
          </button>
        </div>
      ) : (
        <div className="surface rounded-2xl p-5 overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap border-separate border-spacing-x-4 border-spacing-y-0 -mx-4">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 px-2 font-bold min-w-[220px]">Component Name</th>
                <th className="pb-3 px-2 font-bold">SKU Code</th>
                <th className="pb-3 px-2 font-bold">Category</th>
                <th className="pb-3 px-2 font-bold">Selling Price</th>
                <th className="pb-3 px-2 font-bold">Warehouse Location</th>
                <th className="pb-3 px-2 font-bold">Current Stock</th>
                <th className="pb-3 px-2 font-bold">Min Alert</th>
                <th className="pb-3 px-2 font-bold">Created At</th>
                <th className="pb-3 px-2 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const isLow = p.currentStock <= p.minStockAlert;
                const createdTimeStr = p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: '2-digit',
                }) + ', ' + new Date(p.createdAt).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                }) : 'N/A';
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-2 font-bold text-slate-900 max-w-[260px] truncate" title={p.name}>
                      {p.name}
                      {p.installationEligible && (
                        <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 shrink-0">
                          Install Eligible
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 mono text-slate-500">{p.sku}</td>
                    <td className="py-3 px-2 text-slate-500">{p.categoryName || 'Equipment'}</td>
                    <td className="py-3 px-2 font-bold text-emerald-700">₹{p.unitPrice.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-2 text-slate-500">{p.location || 'Main Warehouse'}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center gap-1 font-bold ${
                        isLow ? 'text-[#a63e3e]' : 'text-emerald-700'
                      }`}>
                        {p.currentStock} units
                        {isLow && <AlertTriangle size={13} className="text-[#a63e3e]" />}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-400">{p.minStockAlert} units</td>
                    <td className="py-3 px-2 text-slate-500 font-medium text-[11px]">{createdTimeStr}</td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => {
                          setSelectedProduct(p);
                          setShowAdjustModal(true);
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-emerald-700 hover:bg-emerald-50 cursor-pointer shadow-2xs"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add New Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Add New Equipment Product to Catalog</h3>

            {/* Quick Solar Equipment Industry Preset Selector */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 space-y-1.5">
              <label className="flex items-center gap-1.5 font-bold uppercase text-emerald-700 text-[10px]">
                <Sparkles size={13} className="text-emerald-600" /> Quick Solar Industry Presets (Select to Auto-Fill)
              </label>
              <select
                value={selectedPresetIndex}
                onChange={(e) => handleSelectPreset(e.target.value)}
                className="w-full rounded-xl border border-[#b3c79c] bg-white p-2 text-xs font-semibold text-slate-900 outline-none"
              >
                <option value="">-- Choose Standard Solar Component Preset --</option>
                {solarProductPresets.map((preset, idx) => (
                  <option key={preset.sku} value={idx}>
                    {preset.name} ({preset.categoryName} - ₹{preset.unitPrice.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold uppercase text-slate-400 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Solar Panel 550W Monocrystalline"
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-400 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="SP-550-MONO"
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block font-bold uppercase text-slate-400 mb-1">Category</label>
                  <select
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                  >
                    <option value="Solar Panels">Solar Panels</option>
                    <option value="Inverters">Inverters</option>
                    <option value="Batteries">Batteries</option>
                    <option value="Mounting">Mounting</option>
                    <option value="Electrical">Electrical</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-400 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-400 mb-1">Initial Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block font-bold uppercase text-slate-400 mb-1">Min Alert Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-400 mb-1">Rack Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Warehouse Bay A"
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-400 mb-1">Warranty (Months)</label>
                  <input
                    type="number"
                    min="0"
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                    placeholder="300"
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-900 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={installationEligible}
                    onChange={(e) => setInstallationEligible(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-200 text-emerald-700"
                  />
                  <span>Product is Installation Eligible (Requires Crew Dispatch)</span>
                </label>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-400 mb-1">Product Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter detailed technical specs and features..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="rounded-xl px-4 py-2 font-semibold text-[#57685b]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="rounded-xl bg-slate-900 px-5 py-2 font-bold text-white hover:bg-black disabled:opacity-50"
                >
                  {savingProduct ? 'Saving...' : 'Save Product to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjust Modal */}
      {showAdjustModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">
              Adjust Stock: {selectedProduct.name}
            </h3>

            <form onSubmit={handleAdjustStock} className="space-y-3">
              <div>
                <label className="block font-bold uppercase text-slate-400 mb-1">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementType('IN')}
                    className={`rounded-xl p-2.5 font-bold border text-center ${
                      movementType === 'IN' ? 'border-[#6f9841] bg-[#e7efcf] text-slate-900' : 'border-slate-200'
                    }`}
                  >
                    + Stock IN (Restock)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType('OUT')}
                    className={`rounded-xl p-2.5 font-bold border text-center ${
                      movementType === 'OUT' ? 'border-[#a63e3e] bg-red-100 text-[#a63e3e]' : 'border-slate-200'
                    }`}
                  >
                    - Stock OUT (Removal)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-400 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-400 mb-1">Reason for Movement</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Supplier delivery, Damage write-off..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="rounded-xl px-4 py-2 font-semibold text-[#57685b]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-5 py-2 font-bold text-white hover:bg-black"
                >
                  Save Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
