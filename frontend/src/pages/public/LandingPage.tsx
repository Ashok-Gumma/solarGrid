import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  Heart, ShoppingBag, ArrowRight, Star,
  Sparkles, CheckCircle2, ShieldCheck, Box, HardHat,
  Wrench, FileText, Activity, Users, TrendingUp, Cpu, Layers,
  Sun, Search, Calculator, Check, ExternalLink
} from 'lucide-react';

// Authentic Rural Indian Solar Photography & Product Category Renders
const RURAL_WOMAN_SOLAR_HUT = '/user_woman_solar_hut.jpg';
const WOMEN_FARM_SOLAR = '/user_women_farm_solar_array.png';
const FARMERS_HARVEST_SOLAR = '/user_farmers_harvest_solar.png';
const SOLAR_COOKING_VILLAGE = '/user_solar_cooking_infographic.png';

// Product Equipment Category Renders
const INVERTER_REAL = '/realistic_hybrid_inverter_1786378375305.png';
const BATTERY_STORAGE_REAL = '/realistic_battery_storage_1786378539144.png';
const MOUNTING_RACK_REAL = '/realistic_mounting_rack_1786378559206.png';
const SMART_METER_REAL = '/realistic_smart_grid_meter_1786378583622.png';

interface DealItem {
  id: string;
  name: string;
  category: string;
  price: string;
  numericPrice: number;
  rating: number;
  image: string;
  tag?: string;
  specs: string;
}

const DEALS: DealItem[] = [
  {
    id: '1',
    name: 'Waaree Energee 550W Mono PERC Module',
    category: 'Panels',
    price: '₹18,499',
    numericPrice: 18499,
    rating: 4.9,
    image: RURAL_WOMAN_SOLAR_HUT,
    tag: 'PM SURYA GHAR SUBSIDY APPROVED',
    specs: 'BIS Certified • 24.8% Cell Efficiency • Made in India'
  },
  {
    id: '2',
    name: 'Tata Power Solar 540W Bifacial Panel',
    category: 'Panels',
    price: '₹19,250',
    numericPrice: 19250,
    rating: 4.8,
    image: WOMEN_FARM_SOLAR,
    tag: 'TOP SELLER IN GUJARAT & MAHARASHTRA',
    specs: 'Dual Glass • ALMM Listed • High Heat Intolerant'
  },
  {
    id: '3',
    name: 'Microtek Solar MAX 10kVA Hybrid Inverter',
    category: 'Inverters',
    price: '₹74,500',
    numericPrice: 74500,
    rating: 4.9,
    image: INVERTER_REAL,
    tag: '50% GOVT SUBSIDY READY',
    specs: 'Pure Sine Wave • Built-in MPPT Controller • Indian Grid Sync'
  },
  {
    id: '4',
    name: 'Luminous Solar 5kW Heavy Duty Off-Grid Inverter',
    category: 'Inverters',
    price: '₹42,000',
    numericPrice: 42000,
    rating: 4.7,
    image: INVERTER_REAL,
    tag: 'RURAL GRID HEAVY DUTY',
    specs: 'Dual Output • Indian Voltage Surge Regulator'
  },
  {
    id: '5',
    name: 'Exide Sunday LiFePO4 48V Solar Battery Pack',
    category: 'Storage',
    price: '₹88,900',
    numericPrice: 88900,
    rating: 4.9,
    image: BATTERY_STORAGE_REAL,
    tag: '10 YEAR WARRANTY',
    specs: '100Ah Capacity • 6,000 Cycle Life • Zero Maintenance'
  },
  {
    id: '6',
    name: 'Kusum Yojana Solar Water Pump System 7.5HP',
    category: 'Storage',
    price: '₹1,24,000',
    numericPrice: 124000,
    rating: 5.0,
    image: FARMERS_HARVEST_SOLAR,
    tag: 'PM-KUSUM FARMER SCHEME',
    specs: 'Submersible DC Motor • Automatic Sun Tracking'
  },
  {
    id: '7',
    name: 'Galvanized Iron Rooftop Mounting Structure',
    category: 'Mounting',
    price: '₹6,450',
    numericPrice: 6450,
    rating: 4.8,
    image: MOUNTING_RACK_REAL,
    tag: '150 KM/H WIND RESISTANT',
    specs: 'HDG 80 Micron Coating • Easy DIY Clamps'
  },
  {
    id: '8',
    name: 'Genus Smart Net Metering Discom Hub',
    category: 'Smart Grid',
    price: '₹12,800',
    numericPrice: 12800,
    rating: 4.9,
    image: SMART_METER_REAL,
    tag: 'DISCOM APPROVED (ALL STATES)',
    specs: 'Bidirectional Tariff Logger • 4G SIM Connected'
  }
];

export function LandingPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [erpTab, setErpTab] = useState<'sales' | 'inventory' | 'dispatch' | 'warranty'>('sales');
  const [likedDeals, setLikedDeals] = useState<Record<string, boolean>>({});
  const [cartCount, setCartCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModal, setActiveModal] = useState<DealItem | null>(null);

  // Solar Calculator State
  const [monthlyBill, setMonthlyBill] = useState<number>(3500);

  const categories = ['All', 'Panels', 'Inverters', 'Storage', 'Mounting', 'Smart Grid'];

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedDeals((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCartCount((prev) => prev + 1);
  };

  // Calculator Logic
  const kwNeeded = Math.max(1, Math.round((monthlyBill / 1200) * 10) / 10);
  const estimatedSubsidy = kwNeeded <= 2 ? kwNeeded * 30000 : Math.min(78000, 60000 + (kwNeeded - 2) * 18000);
  const annualSavings = Math.round(monthlyBill * 12 * 0.88);
  const twentyFiveYrSavings = Math.round(annualSavings * 25);
  const co2ReducedTons = Math.round(kwNeeded * 1.4 * 25);

  const filteredDeals = DEALS.filter((deal) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      deal.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      deal.name.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.specs.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-400 selection:text-slate-950 pb-24 overflow-x-hidden">

      {/* Ambient Lighting Accents */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 right-1/4 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[170px]" />
        <div className="absolute top-1/3 left-0 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[160px]" />
        <div className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[170px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-25" />
      </div>

      {/* Glassmorphism Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 md:px-8 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer shrink-0">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition duration-200">
              <Sun size={22} className="text-slate-950 font-extrabold" />
            </span>
            <div>
              <span className="text-xl font-extrabold text-white tracking-tight leading-none block">SolarGrid</span>
              <span className="text-[10px] uppercase font-extrabold tracking-[.25em] text-emerald-400">Clean Energy Suite</span>
            </div>
          </Link>

          {/* Quick Header Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
            <a href="#catalog" className="hover:text-emerald-400 transition">Equipment Store</a>
            <a href="#calculator" className="hover:text-emerald-400 transition">Solar Calculator</a>
            <a href="#schemes" className="hover:text-emerald-400 transition">Govt Schemes</a>
            <a href="#simulator" className="hover:text-emerald-400 transition">ERP Simulator</a>
          </nav>

          <div className="flex items-center gap-3">
            {cartCount > 0 && (
              <Link
                href="/cart"
                className="relative h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-200 shadow-xs border border-slate-700 hover:bg-slate-800 transition"
              >
                <ShoppingBag size={17} />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              </Link>
            )}
            <Link
              href="/signin"
              className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 px-5 py-2 text-xs font-extrabold text-slate-950 hover:brightness-110 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Launch ERP Desk
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 md:px-8 pt-8 space-y-12">

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-2xl p-8 md:p-12 shadow-2xl shadow-black/80">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-400 backdrop-blur">
              <Sparkles size={14} className="text-emerald-400 animate-bounce" />
              <span>PM SURYA GHAR & PM-KUSUM AUTHORIZED PORTAL</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Pure Clean Energy. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                Powered for Developing India.
              </span>
            </h1>

            <p className="text-sm md:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
              Simplifying solar panel distribution, hybrid inverters, agricultural pumps, and government subsidy dispatch across rooftops, villages, and farmland.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#catalog"
                className="rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-7 py-3.5 text-xs font-extrabold text-slate-950 hover:brightness-110 transition shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer"
              >
                <span>Browse Equipment Catalog</span>
                <ArrowRight size={16} />
              </a>

              <a
                href="#calculator"
                className="rounded-2xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-xs font-bold text-slate-200 hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer"
              >
                <Calculator size={15} className="text-amber-400" />
                <span>Calculate Savings</span>
              </a>
            </div>

            {/* Impact Metric Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
              <div>
                <div className="text-xl font-extrabold text-white">1.2M+</div>
                <div className="text-[11px] text-slate-400 font-medium">Solar Pumps Installed</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-emerald-400">₹300Cr+</div>
                <div className="text-[11px] text-slate-400 font-medium">Subsidy Claims Logged</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-amber-400">28 States</div>
                <div className="text-[11px] text-slate-400 font-medium">DISCOM Connected</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-blue-400">99.4%</div>
                <div className="text-[11px] text-slate-400 font-medium">On-Time Crew SLA</div>
              </div>
            </div>
          </div>

          {/* Featured Beneficiary Image Card */}
          <div className="lg:col-span-6 relative h-[420px] md:h-[480px] w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 group">
            <img
              src={RURAL_WOMAN_SOLAR_HUT}
              alt="Rural Indian woman smiling with solar module"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-end p-8 text-white space-y-2">
              <span className="rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold px-3 py-1 uppercase tracking-wider self-start shadow-md">
                Pure Hope &amp; Transformation
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">
                &ldquo;Solar power changed our daily life and village school hours.&rdquo;
              </h3>
              <p className="text-xs text-slate-300 font-medium flex items-center gap-2">
                <span>— Village Beneficiary</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">PM Surya Ghar Yojana</span>
              </p>
            </div>
          </div>
        </div>

        {/* Solar Savings & ROI Interactive Calculator Section */}
        <section id="calculator" className="rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-2xl p-8 md:p-10 space-y-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                <Calculator size={14} /> Solar ROI Estimator
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Calculate Your Rooftop Solar Savings
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-xl">
                Adjust your current monthly electricity bill to estimate government subsidy benefits and 25-year financial savings.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 uppercase font-bold block">PM Surya Ghar Subsidy</span>
              <span className="text-2xl font-extrabold text-emerald-400">Up to ₹78,000 Direct Credit</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Slider Controls */}
            <div className="lg:col-span-6 space-y-6 bg-slate-950/70 p-6 sm:p-8 rounded-2xl border border-slate-800">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Monthly Electricity Bill</label>
                  <span className="text-xl font-extrabold text-emerald-400">₹{monthlyBill.toLocaleString('en-IN')}/mo</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="500"
                  value={monthlyBill}
                  onChange={(e) => setMonthlyBill(Number(e.target.value))}
                  className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-bold mt-2">
                  <span>₹1,000</span>
                  <span>₹25,000</span>
                  <span>₹50,000+</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-500 font-semibold block">Solar Capacity Needed</span>
                  <span className="text-lg font-extrabold text-white">{kwNeeded} kW System</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-500 font-semibold block">Govt Subsidy Amount</span>
                  <span className="text-lg font-extrabold text-emerald-400">₹{estimatedSubsidy.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Savings Output Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-slate-900 border border-emerald-500/30 space-y-2">
                <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">Annual Bill Savings</span>
                <div className="text-3xl font-extrabold text-white">₹{annualSavings.toLocaleString('en-IN')}</div>
                <p className="text-[11px] text-slate-400">Reduces electricity bill by up to 88%</p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-slate-900 border border-amber-500/30 space-y-2">
                <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">25-Year Lifetime Wealth</span>
                <div className="text-3xl font-extrabold text-white">₹{twentyFiveYrSavings.toLocaleString('en-IN')}</div>
                <p className="text-[11px] text-slate-400">Guaranteed panel performance lifespan</p>
              </div>

              <div className="sm:col-span-2 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-400 font-bold">
                    🌿
                  </div>
                  <div>
                    <span className="font-bold text-white block">Carbon Footprint Reduction</span>
                    <span className="text-slate-400 text-[11px]">{co2ReducedTons} Tons CO₂ avoided over system lifetime</span>
                  </div>
                </div>
                <Link
                  href="/book-service"
                  className="rounded-full bg-emerald-400 px-4 py-2 font-extrabold text-slate-950 hover:bg-emerald-300 transition text-[11px] shrink-0"
                >
                  Book Free Site Audit
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Equipment Catalog Showcase Section */}
        <section id="catalog" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 block mb-1">
                TIER-1 CERTIFIED SOLAR STORE
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Solar Equipment Catalog
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer shrink-0 ${
                      active
                        ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search panels, inverters, batteries, or pumps..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 pl-11 pr-4 py-3 text-xs text-white outline-none focus:border-emerald-400 font-medium placeholder:text-slate-500"
            />
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredDeals.map((deal) => (
              <div
                key={deal.id}
                onClick={() => setActiveModal(deal)}
                className="group relative rounded-3xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-4 cursor-pointer hover:border-slate-700 hover:bg-slate-900 transition duration-300 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-950 mb-3 border border-slate-800">
                    <img
                      src={deal.image}
                      alt={deal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    {deal.tag && (
                      <span className="absolute top-3 left-3 rounded-full bg-slate-950/80 backdrop-blur border border-amber-400/40 text-amber-400 text-[9px] font-extrabold px-2.5 py-1 uppercase tracking-wider">
                        {deal.tag}
                      </span>
                    )}
                    <button
                      onClick={(e) => toggleLike(deal.id, e)}
                      className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-slate-950/70 text-slate-300 hover:text-red-400 backdrop-blur transition"
                    >
                      <Heart size={15} className={likedDeals[deal.id] ? 'fill-red-500 text-red-500' : ''} />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-400 uppercase tracking-wider">{deal.category}</span>
                      <span className="flex items-center gap-1 font-bold text-amber-400">
                        <Star size={12} className="fill-amber-400" /> {deal.rating}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">{deal.name}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{deal.specs}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-2">
                  <div>
                    <span className="block text-[9px] text-slate-500 uppercase font-bold">Offer Price</span>
                    <span className="text-base font-extrabold text-white">{deal.price}</span>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="rounded-full bg-slate-800 hover:bg-emerald-400 hover:text-slate-950 text-white p-2.5 transition cursor-pointer"
                    title="Add to cart"
                  >
                    <ShoppingBag size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Government Schemes & Impact Section */}
        <section id="schemes" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-7 space-y-4">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-400 grid place-items-center font-bold">
              <Sun size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">PM Surya Ghar Scheme</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provides up to ₹78,000 direct financial subsidy for 1kW-3kW residential rooftop solar panel installations.
            </p>
            <Link href="/book-service" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:underline">
              Apply via SolarGrid <ArrowRight size={13} />
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-7 space-y-4">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-400 grid place-items-center font-bold">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">PM-KUSUM Farmers Yojana</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Supports agricultural farmers with 60% govt subsidy for 3HP-10HP solar water pumping systems.
            </p>
            <Link href="/book-service" className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:underline">
              Check Farmer Eligibility <ArrowRight size={13} />
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-7 space-y-4">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 text-blue-400 grid place-items-center font-bold">
              <Activity size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">DISCOM Net Meter Sync</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export excess solar power back to state electricity boards & receive monthly energy bill credits.
            </p>
            <Link href="/signin" className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:underline">
              Connect DISCOM Meter <ArrowRight size={13} />
            </Link>
          </div>
        </section>

        {/* Reactive ERP + CRM Live Simulator Section */}
        <section id="simulator" className="rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-2xl p-8 md:p-10 space-y-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                <Activity size={14} /> LIVE REACTIVE WORKSPACE
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                SolarGrid ERP & CRM Operations Engine
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl font-medium">
                Integrated inventory management, sales challans, rooftop crew routing, and 25-year warranty ledgers.
              </p>
            </div>

            {/* Reactive Simulator Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-full text-xs font-semibold text-slate-400 border border-slate-800">
              <button
                onClick={() => setErpTab('sales')}
                className={`px-4 py-2 rounded-full transition cursor-pointer ${
                  erpTab === 'sales' ? 'bg-emerald-400 text-slate-950 font-extrabold' : 'hover:text-white'
                }`}
              >
                CRM & Quotes
              </button>
              <button
                onClick={() => setErpTab('inventory')}
                className={`px-4 py-2 rounded-full transition cursor-pointer ${
                  erpTab === 'inventory' ? 'bg-emerald-400 text-slate-950 font-extrabold' : 'hover:text-white'
                }`}
              >
                Warehouse
              </button>
              <button
                onClick={() => setErpTab('dispatch')}
                className={`px-4 py-2 rounded-full transition cursor-pointer ${
                  erpTab === 'dispatch' ? 'bg-emerald-400 text-slate-950 font-extrabold' : 'hover:text-white'
                }`}
              >
                Field Dispatch
              </button>
              <button
                onClick={() => setErpTab('warranty')}
                className={`px-4 py-2 rounded-full transition cursor-pointer ${
                  erpTab === 'warranty' ? 'bg-emerald-400 text-slate-950 font-extrabold' : 'hover:text-white'
                }`}
              >
                Warranty Desk
              </button>
            </div>
          </div>

          {/* Interactive Dynamic ERP Panel View */}
          <div className="bg-slate-950/80 rounded-2xl p-6 min-h-[220px] border border-slate-800">
            {erpTab === 'sales' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-rise">
                <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Active CRM Accounts</span>
                    <Users size={16} className="text-slate-500" />
                  </div>
                  <div className="text-2xl font-bold text-white">142 Accounts</div>
                  <p className="text-[11px] text-emerald-400 font-semibold">+18.4% conversion this month</p>
                </div>
                <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Sales Challans</span>
                    <FileText size={16} className="text-slate-500" />
                  </div>
                  <div className="text-2xl font-bold text-white">₹28.4 Lakhs</div>
                  <p className="text-[11px] text-slate-400 font-medium">34 pending delivery approval</p>
                </div>
                <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Average Deal Cycle</span>
                    <TrendingUp size={16} className="text-slate-500" />
                  </div>
                  <div className="text-2xl font-bold text-white">4.2 Days</div>
                  <p className="text-[11px] text-emerald-400 font-semibold">Automated GST quotation workflow</p>
                </div>
              </div>
            )}

            {erpTab === 'inventory' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-rise">
                <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>550W Mono PERC Panels</span>
                    <Box size={16} className="text-slate-500" />
                  </div>
                  <div className="text-2xl font-bold text-white">1,480 Units</div>
                  <p className="text-[11px] text-emerald-400 font-semibold">Stock level optimal</p>
                </div>
                <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>10kVA Hybrid Inverters</span>
                    <Cpu size={16} className="text-slate-500" />
                  </div>
                  <div className="text-2xl font-bold text-white">320 Units</div>
                  <p className="text-[11px] text-amber-400 font-semibold">Reorder alert triggered</p>
                </div>
                <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>LiFePO4 Storage Packs</span>
                    <Layers size={16} className="text-slate-500" />
                  </div>
                  <div className="text-2xl font-bold text-white">850 Units</div>
                  <p className="text-[11px] text-emerald-400 font-semibold">Warehouse Hub A & B synced</p>
                </div>
              </div>
            )}

            {erpTab === 'dispatch' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-rise">
                <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Rooftop Field Crews</span>
                    <HardHat size={16} className="text-slate-500" />
                  </div>
                  <div className="text-2xl font-bold text-white">8 Active Teams</div>
                  <p className="text-[11px] text-slate-400 font-medium">GPS tracked in real time</p>
                </div>
                <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Today's Installations</span>
                    <Activity size={16} className="text-slate-500" />
                  </div>
                  <div className="text-2xl font-bold text-white">12 Rooftops</div>
                  <p className="text-[11px] text-emerald-400 font-semibold">85% complete on schedule</p>
                </div>
                <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Safety Inspection</span>
                    <CheckCircle2 size={16} className="text-slate-500" />
                  </div>
                  <div className="text-2xl font-bold text-white">100% Passed</div>
                  <p className="text-[11px] text-emerald-400 font-semibold">Zero compliance issues reported</p>
                </div>
              </div>
            )}

            {erpTab === 'warranty' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-rise">
                <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Warranty Claims</span>
                    <ShieldCheck size={16} className="text-slate-500" />
                  </div>
                  <div className="text-2xl font-bold text-white">3 Pending</div>
                  <p className="text-[11px] text-slate-400 font-medium">Avg resolution under 24 hrs</p>
                </div>
                <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Technician RMA Dispatch</span>
                    <Wrench size={16} className="text-slate-500" />
                  </div>
                  <div className="text-2xl font-bold text-white">2 In-Transit</div>
                  <p className="text-[11px] text-emerald-400 font-semibold">Replacement units dispatched</p>
                </div>
                <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Customer SLA Rating</span>
                    <Sparkles size={16} className="text-slate-500" />
                  </div>
                  <div className="text-2xl font-bold text-white">99.4%</div>
                  <p className="text-[11px] text-emerald-400 font-semibold">Top tier warranty service score</p>
                </div>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-4 md:px-8 pt-16 border-t border-slate-800/80 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4 mt-12">
        <p>© 2026 SolarGrid Technologies Inc. All rights reserved.</p>
        <div className="flex items-center gap-6 font-medium text-slate-400">
          <a href="#schemes" className="hover:text-emerald-400 transition">PM Surya Ghar</a>
          <a href="#calculator" className="hover:text-emerald-400 transition">Solar ROI Calculator</a>
          <Link href="/signin" className="hover:text-emerald-400 transition">ERP Desk Login</Link>
        </div>
      </footer>

      {/* Product Detail Modal */}
      {activeModal && (
        <div
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-soft-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-7 max-w-lg w-full shadow-2xl space-y-6 animate-rise text-slate-100"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-3 py-1 uppercase tracking-wider border border-emerald-500/30">
                {activeModal.category}
              </span>
              <button
                onClick={() => setActiveModal(null)}
                className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="h-56 w-full rounded-2xl overflow-hidden bg-slate-950 relative border border-slate-800">
              <img src={activeModal.image} alt={activeModal.name} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">{activeModal.name}</h3>
              <p className="text-xs text-slate-400 font-medium">{activeModal.specs}</p>
              <div className="text-2xl font-extrabold text-emerald-400 pt-2">{activeModal.price}</div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/signin"
                className="flex-1 bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-950 text-center py-3.5 rounded-2xl font-extrabold text-xs hover:brightness-110 transition shadow-lg shadow-emerald-500/20"
              >
                Order Via ERP Desk
              </Link>
              <button
                onClick={handleAddToCart}
                className="rounded-2xl border border-slate-700 bg-slate-800 px-6 py-3.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
              >
                Add To Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
