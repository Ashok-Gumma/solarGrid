import React from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard, Users, Package, Box, FileText, HardHat,
  Wrench, ShieldCheck, ShoppingBag, ShoppingCart, Settings2,
  LogOut, Activity, Layers, Heart
} from 'lucide-react';
import { useAuth, Role } from '../../lib/auth-context';
import { Sun } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: any;
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [location, setLocation] = useLocation();
  const { role, logout, user } = useAuth();

  const navMap: Record<Role, NavItem[]> = {
    ADMIN: [
      { href: '/admin',        label: 'Overview',        icon: LayoutDashboard },
      { href: '/customers',    label: 'Customers',       icon: Users },
      { href: '/inventory',    label: 'Inventory & Stock', icon: Box },
      { href: '/challans',     label: 'Sales Challans',  icon: FileText },
      { href: '/orders',       label: 'Orders',          icon: ShoppingBag },
      { href: '/installations',label: 'Installations',   icon: HardHat },
      { href: '/services',     label: 'Service & Repair', icon: Wrench },
      { href: '/audit-logs',   label: 'Audit Logs',      icon: Activity },
      { href: '/profile',      label: 'My Profile & Settings', icon: Settings2 },
    ],
    WAREHOUSE: [
      { href: '/inventory',       label: 'Inventory Management', icon: Box },
      { href: '/stock-movements', label: 'Stock Movements',      icon: Layers },
      { href: '/challans',        label: 'Challans Dispatch',    icon: FileText },
    ],
    TECHNICIAN: [
      { href: '/technician',  label: "Today's Route & Jobs", icon: HardHat },
      { href: '/installations', label: 'Installations',      icon: HardHat },
      { href: '/services',    label: 'Service & Repair',     icon: Wrench },
    ],
    CUSTOMER: [
      { href: '/store',          label: 'Shop Equipment',          icon: ShoppingBag },
      { href: '/cart',           label: 'My Cart',                 icon: ShoppingCart },
      { href: '/wishlist',       label: 'Saved Wishlist',          icon: Heart },
      { href: '/my-orders',      label: 'My Orders',               icon: Package },
      { href: '/my-warranties',  label: 'My Equipment & Warranties', icon: ShieldCheck },
      { href: '/book-service',   label: 'Book Service',            icon: Wrench },
      { href: '/profile',        label: 'My Profile & Tickets',    icon: Settings2 },
    ],
  };

  const navItems = navMap[role] || navMap.CUSTOMER;

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col bg-white border-r border-slate-100 p-4 transition-transform duration-200 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-2 py-3 mb-4">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-900 shadow-sm shrink-0">
            <Sun size={16} className="text-amber-400" />
          </span>
          <span className="text-base font-extrabold text-slate-900 tracking-tight">SolarGrid</span>
        </div>

        {/* Workspace tag */}
        <div className="mx-2 mb-3 text-[9px] font-bold uppercase tracking-[.2em] text-slate-400">
          {user ? `${role} Workspace` : 'Guest Browsing'}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location === item.href || location.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={16} className={active ? 'text-white' : 'text-slate-400'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto border-t border-slate-100 pt-3 space-y-1">
          {user ? (
            <>
              <div className="flex items-center gap-2.5 px-3 py-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-900 text-[11px] font-bold text-white shrink-0">
                  {user.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                </span>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-900 truncate">{user.name}</span>
                  <span className="block text-[10px] text-slate-400 truncate">{user.email}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
              >
                <LogOut size={15} />
                <span>Sign out</span>
              </button>
            </>
          ) : (
            <div className="p-2">
              <Link
                href="/login"
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-black"
              >
                Sign In / Register
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
