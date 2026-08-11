import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  Heart, ShoppingBag, ArrowRight, ArrowLeft, Star, Tag,
  ChevronRight, Sparkles, CheckCircle2, ShieldCheck, Box, HardHat,
  Wrench, FileText, Activity, Users, TrendingUp, Cpu, Layers, SlidersHorizontal,
  ArrowUpRight, Sun
} from 'lucide-react';
import { SolarGridLogo } from '../../components/common/SolarGridLogo';

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
    rating: 4.9,
    image: SMART_METER_REAL,
    tag: 'DISCOM APPROVED (ALL STATES)',
    specs: 'Bidirectional Tariff Logger • 4G SIM Connected'
  }
];

export function LandingPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [erpTab, setErpTab] = useState<'sales' | 'inventory' | 'dispatch' | 'warranty'>('sales');
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [likedDeals, setLikedDeals] = useState<Record<string, boolean>>({});
  const [cartCount, setCartCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModal, setActiveModal] = useState<DealItem | null>(null);

  const categories = ['All', 'Panels', 'Inverters', 'Storage', 'Mounting', 'Smart Grid'];

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % DEALS.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + DEALS.length) % DEALS.length);
  };

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedDeals((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCartCount((prev) => prev + 1);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
    }
  };

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

  const activeDeal = filteredDeals[currentSlide % Math.max(1, filteredDeals.length)] || DEALS[0];

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans antialiased selection:bg-slate-900 selection:text-white pb-24">
      {/* Apple-style Soft Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#f5f5f7]/80 backdrop-blur-xl border-b border-black/[0.04] px-6 py-4 md:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white shadow-lg group-hover:bg-black transition">
              <Sun size={20} className="text-amber-400" />
            </span>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">SolarGrid</span>
          </Link>



          <div className="flex items-center gap-3">
            {cartCount > 0 && (
              <Link
                href="/cart"
                className="relative h-10 w-10 rounded-full bg-white flex items-center justify-center text-slate-800 shadow-xs border border-black/5 hover:bg-slate-50 transition"
              >
                <ShoppingBag size={16} />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              </Link>
            )}
            <Link
              href="/signin"
              className="bento-pill px-4.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-black transition shadow-xs cursor-pointer"
            >
              Launch ERP Desk
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 md:px-8 pt-6 space-y-6">

        {/* Hero Section featuring 2x2 Photo Grid of Authentic Rural Indian Solar Projects */}
        <div className="bento-card p-6 md:p-10 bg-white grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-black/5 overflow-hidden">
          
          <div className="lg:col-span-5 space-y-6">
            <span className="bento-pill px-4 py-2 text-xs font-bold text-amber-900 bg-amber-50 inline-flex items-center gap-2 border border-amber-200">
              <Sparkles size={14} className="text-amber-600" /> Authentic Rural India Transformation
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              <strong>Real Hope.</strong> <strong>Real Light.</strong> <br />
              <span className="font-light text-slate-700">Powered by <strong className="font-extrabold text-slate-900">SolarGrid ERP.</strong></span>
            </h1>

            <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">
              <strong className="text-slate-800">Simplifying</strong> solar distribution for{' '}
              <strong className="text-slate-800">rural homes</strong>,{' '}
              <strong className="text-slate-800">village kitchens</strong>, and{' '}
              <strong className="text-slate-800">agricultural pump</strong> installations across{' '}
              <strong className="text-slate-800">developing India</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href="/signup"
                className="rounded-full bg-slate-900 px-7 py-3.5 text-xs font-bold text-white hover:bg-black transition shadow-md flex items-center gap-2"
              >
                <span>Launch ERP Desk</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* 2x2 Photo Grid with Smaller Image Cards */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-3.5 sm:gap-4">
            
            {/* Photo 1: Rural Woman with Solar Panel */}
            <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden shadow-md group border border-slate-200">
              <img
                src={RURAL_WOMAN_SOLAR_HUT}
                alt="Rural Indian woman smiling with solar panel"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-3.5 text-white">
                <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider">
                  RURAL HOME LIGHTING
                </span>
                <h4 className="text-xs font-bold text-white leading-tight">PM Surya Ghar Beneficiary</h4>
              </div>
            </div>

            {/* Photo 2: Agricultural Solar Pump Array */}
            <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden shadow-md group border border-slate-200">
              <img
                src={WOMEN_FARM_SOLAR}
                alt="Rural Indian women walking past solar powered pump"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-3.5 text-white">
                <span className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider">
                  AGRICULTURAL PUMPS
                </span>
                <h4 className="text-xs font-bold text-white leading-tight">PM-KUSUM Irrigation</h4>
              </div>
            </div>

            {/* Photo 3: Farmers Harvest Solar Canopy */}
            <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden shadow-md group border border-slate-200">
              <img
                src={FARMERS_HARVEST_SOLAR}
                alt="Indian farmers harvesting under solar panel array"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-3.5 text-white">
                <span className="text-[10px] font-extrabold text-blue-300 uppercase tracking-wider">
                  AGRIVOLTAIC FARMLANDS
                </span>
                <h4 className="text-xs font-bold text-white leading-tight">Dual Crop &amp; Solar Income</h4>
              </div>
            </div>

            {/* Photo 4: Village Solar Cooking */}
            <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden shadow-md group border border-slate-200">
              <img
                src={SOLAR_COOKING_VILLAGE}
                alt="Indian village solar powered cooktops"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-3.5 text-white">
                <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider">
                  CLEAN STOVES
                </span>
                <h4 className="text-xs font-bold text-white leading-tight">Smoke-Free Kitchens</h4>
              </div>
            </div>

          </div>

        </div>

        {/* User-Provided Rural Story Gallery (3 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* User Image 2: Women Farmers Walking Past Agricultural Solar Array */}
          <div className="bento-card bg-white p-6 space-y-4 border border-black/5 overflow-hidden group">
            <div className="h-56 w-full rounded-2xl overflow-hidden bg-slate-100 relative">
              <img
                src="/user_women_farm_solar_array.png"
                alt="Rural Indian women walking past solar powered farmland pump"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">AGRICULTURAL FREEDOM</span>
              <h3 className="text-base font-bold text-slate-900">PM-KUSUM Solar Water Pumping</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Empowering rural women farmers with reliable daytime irrigation in corn and paddy fields.
              </p>
            </div>
          </div>

          {/* User Image 3: Farmers Harvesting Crops Under Large Solar Canopy */}
          <div className="bento-card bg-white p-6 space-y-4 border border-black/5 overflow-hidden group">
            <div className="h-56 w-full rounded-2xl overflow-hidden bg-slate-100 relative">
              <img
                src="/user_farmers_harvest_solar.png"
                alt="Indian farmers harvesting under solar panel array"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">RURAL COMMUNITY POWER</span>
              <h3 className="text-base font-bold text-slate-900">Agrivoltaic Crop Farming</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Combining solar energy generation with traditional crop harvesting for dual farm income.
              </p>
            </div>
          </div>

          {/* User Image 4: Village Solar Cooking & Kitchen Power Infographic */}
          <div className="bento-card bg-white p-6 space-y-4 border border-black/5 overflow-hidden group">
            <div className="h-56 w-full rounded-2xl overflow-hidden bg-slate-100 relative">
              <img
                src="/user_solar_cooking_infographic.png"
                alt="Indian village kitchens fully powered by solar power"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">CLEAN VILLAGE KITCHENS</span>
              <h3 className="text-base font-bold text-slate-900">Solar Powered Electric Stoves</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Replacing smoke-heavy firewood with clean solar induction cooktops in village homes.
              </p>
            </div>
          </div>

        </div>
        


        {/* Empowering Rural & Developing India Solar Section */}
        <div className="bento-card p-8 md:p-10 bg-slate-900 text-white space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-35 mix-blend-luminosity">
            <img src="/raw_farmer_field.jpg" alt="Raw Indian farmer field solar pump" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 space-y-3">
            <span className="bento-pill px-3.5 py-1 text-[11px] font-bold text-amber-900 bg-amber-400 uppercase tracking-wider">
              PM-KUSUM & SURYA GHAR IMPACT
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Powering Developing India — From Rooftops to Rural Farmlands
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
              SolarGrid ERP empowers Indian distributors, village sarpanch committees, and agricultural solar installers to monitor solar pumps, rooftop installations, and subsidy dispatch logs across tier-2, tier-3 cities and rural villages.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-1">
              <div className="text-2xl font-bold text-amber-400">1.2+ Million</div>
              <div className="text-xs text-slate-300 font-medium">Rural Solar Pumps Logged</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-1">
              <div className="text-2xl font-bold text-emerald-400">₹300+ Crore</div>
              <div className="text-xs text-slate-300 font-medium">Subsidy Claims Dispatched</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-1">
              <div className="text-2xl font-bold text-white">28 States</div>
              <div className="text-xs text-slate-300 font-medium">DISCOM Net-Metering Connected</div>
            </div>
          </div>
        </div>

        {/* Constructive Bento Grid Section 2: Reactive ERP + CRM Live Simulator */}
        <div className="bento-card p-8 md:p-10 bg-white space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-2">
              <span className="bento-pill px-3.5 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                REACTIVE WORKSPACE ENGINE
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Experience SolarGrid ERP + CRM Live
              </h2>
              <p className="text-sm text-slate-500 max-w-xl">
                Integrated inventory tracking, rooftop dispatching, customer quotes, and warranty logs designed with Apple-like reactivity.
              </p>
            </div>

            {/* Reactive Simulator Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#f5f5f7] rounded-full text-xs font-semibold text-slate-600">
              <button
                onClick={() => setErpTab('sales')}
                className={`px-5 py-2 rounded-full transition ${
                  erpTab === 'sales' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                CRM & Quotes
              </button>
              <button
                onClick={() => setErpTab('inventory')}
                className={`px-5 py-2 rounded-full transition ${
                  erpTab === 'inventory' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Warehouse Inventory
              </button>
              <button
                onClick={() => setErpTab('dispatch')}
                className={`px-5 py-2 rounded-full transition ${
                  erpTab === 'dispatch' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Field Dispatch
              </button>
              <button
                onClick={() => setErpTab('warranty')}
                className={`px-5 py-2 rounded-full transition ${
                  erpTab === 'warranty' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Warranty Desk
              </button>
            </div>
          </div>

          {/* Interactive Dynamic ERP Panel View */}
          <div className="bg-[#f5f5f7] rounded-[1.5rem] p-6 min-h-[260px] border border-black/5">
            {erpTab === 'sales' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-rise">
                <div className="bg-white p-5 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Active Leads</span>
                    <Users size={16} className="text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">142 Accounts</div>
                  <p className="text-[11px] text-emerald-600 font-semibold">+18.4% conversion this month</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Sales Challans</span>
                    <FileText size={16} className="text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">$284,500</div>
                  <p className="text-[11px] text-slate-500 font-medium">34 pending delivery approval</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Average Deal Cycle</span>
                    <TrendingUp size={16} className="text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">4.2 Days</div>
                  <p className="text-[11px] text-emerald-600 font-semibold">Reduced by 2.1 days via automated quotes</p>
                </div>
              </div>
            )}

            {erpTab === 'inventory' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-rise">
                <div className="bg-white p-5 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>580W TOPCon Modules</span>
                    <Box size={16} className="text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">1,480 Units</div>
                  <p className="text-[11px] text-emerald-600 font-semibold">Optimal stock level</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>12kW Hybrid Inverters</span>
                    <Cpu size={16} className="text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">320 Units</div>
                  <p className="text-[11px] text-amber-600 font-semibold">Reorder threshold reached</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>LiFePO4 Storage Packs</span>
                    <Layers size={16} className="text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">850 Units</div>
                  <p className="text-[11px] text-emerald-600 font-semibold">Warehouse Hub A & B synced</p>
                </div>
              </div>
            )}

            {erpTab === 'dispatch' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-rise">
                <div className="bg-white p-5 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Rooftop Field Crews</span>
                    <HardHat size={16} className="text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">8 Active Teams</div>
                  <p className="text-[11px] text-slate-500 font-medium">GPS tracked in real time</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Today's Installations</span>
                    <Activity size={16} className="text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">12 Rooftops</div>
                  <p className="text-[11px] text-emerald-600 font-semibold">85% complete on schedule</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Safety Inspection</span>
                    <CheckCircle2 size={16} className="text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">100% Passed</div>
                  <p className="text-[11px] text-emerald-600 font-semibold">Zero compliance issues reported</p>
                </div>
              </div>
            )}

            {erpTab === 'warranty' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-rise">
                <div className="bg-white p-5 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Warranty Claims</span>
                    <ShieldCheck size={16} className="text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">3 Pending</div>
                  <p className="text-[11px] text-slate-500 font-medium">Avg resolution under 24 hrs</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Technician RMA Dispatch</span>
                    <Wrench size={16} className="text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">2 In-Transit</div>
                  <p className="text-[11px] text-emerald-600 font-semibold">Replacement units dispatched</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Customer SLA Rating</span>
                    <Sparkles size={16} className="text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">99.2%</div>
                  <p className="text-[11px] text-emerald-600 font-semibold">Top tier warranty service score</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Constructive Bento Grid Section 3: Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bento-card p-8 bg-white space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Box size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Serial Stock Tracking</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Scan barcode serials directly into warehouse stock logs with complete batch lineage and instant stock sync.
            </p>
          </div>

          <div className="bento-card p-8 bg-white space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <HardHat size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Rooftop Engineering</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Seamless dispatching for installation teams with uploaded site photos, structural sign-offs, and customer approvals.
            </p>
          </div>

          <div className="bento-card p-8 bg-white space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">25-Year Warranty Ledger</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Maintain full digital audit trails for every panel and inverter sold, enabling instant RMA claim processing.
            </p>
          </div>
        </div>

      </main>

      {/* Apple-style Footer */}
      <footer className="mx-auto max-w-7xl px-6 md:px-12 pt-16 border-t border-black/5 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© 2026 SolarGrid Technologies Inc. All rights reserved.</p>
        <div className="flex items-center gap-6 font-medium text-slate-600">
          <a href="#privacy" className="hover:text-slate-900">Privacy Policy</a>
          <a href="#terms" className="hover:text-slate-900">Terms of Service</a>
          <a href="#contact" className="hover:text-slate-900">ERP Support Desk</a>
        </div>
      </footer>

      {/* Interactive Detail Modal Overlay */}
      {activeModal && (
        <div
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-soft-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl space-y-6 animate-rise border border-black/5"
          >
            <div className="flex items-center justify-between">
              <span className="bento-pill px-3 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50">
                {activeModal.category}
              </span>
              <button
                onClick={() => setActiveModal(null)}
                className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="h-56 w-full rounded-2xl overflow-hidden bg-slate-100 relative">
              <img src={activeModal.image} alt={activeModal.name} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">{activeModal.name}</h3>
              <p className="text-sm text-slate-500 font-medium">{activeModal.specs}</p>
              <div className="text-3xl font-extrabold text-slate-900 pt-2">{activeModal.price}</div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/signin"
                className="flex-1 bg-slate-900 text-white text-center py-3.5 rounded-full font-bold text-xs hover:bg-black transition shadow-xs"
              >
                Order Via ERP Desk
              </Link>
              <button
                onClick={handleAddToCart}
                className="bento-pill px-6 py-3.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
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
