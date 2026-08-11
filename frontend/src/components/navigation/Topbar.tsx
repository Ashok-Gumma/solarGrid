import React, { useEffect, useState, useRef } from 'react';
import { Menu, User, Search, Plus, Building2, Bell, ShoppingCart } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '../../lib/auth-context';
import { fetchApi } from '../../lib/api';
import { Notification } from '../../types';

export function Topbar({ onMenuOpen, cartCount = 0 }: { onMenuOpen: () => void; cartCount?: number }) {
  const { user, role } = useAuth();
  const [, setLocation] = useLocation();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (quickRef.current && !quickRef.current.contains(event.target as Node)) {
        setShowQuickActions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [role]);

  async function loadNotifications() {
    const res = await fetchApi<Notification[]>('/notifications');
    if (res.success && res.data) {
      setNotifications(res.data);
    }
  }

  const handleMarkAsRead = async (id: string) => {
    await fetchApi(`/notifications/${id}/read`, { method: 'POST' });
    loadNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const quickActions = [
    { label: '+ Add New Customer', href: '/customers', roleRequired: ['ADMIN', 'SALES'] },
    { label: '+ Create Sales Challan', href: '/challans', roleRequired: ['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE'] },
    { label: '+ Add Product', href: '/inventory', roleRequired: ['ADMIN', 'WAREHOUSE'] },
  ];

  const allowedActions = quickActions.filter(
    (a) => a.roleRequired.includes(role) || role === 'ADMIN'
  );

  return (
    <header className="sticky top-0 z-20 flex h-[64px] items-center justify-between border-b border-slate-100 bg-white/90 px-4 backdrop-blur md:px-8">
      {/* Left section: Mobile Menu & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuOpen}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden cursor-pointer"
        >
          <Menu size={18} />
        </button>

        <div className="hidden items-center gap-2.5 text-xs text-slate-400 md:flex">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Building2 size={15} className="text-emerald-600" />
            <span>SolarGrid ERP & CRM</span>
          </div>
          <span>/</span>
          <span className="badge badge-slate uppercase tracking-wider text-[10px]">
            {user ? `${role} PORTAL` : 'GUEST PORTAL'}
          </span>
        </div>
      </div>

      {/* Center: Search */}
      <div className="hidden lg:flex items-center flex-1 max-w-xs mx-6">
        <div className="relative w-full">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            onFocus={() => {
              setLocation('/customers');
            }}
            placeholder="Search CRM, orders, products..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 outline-none focus:border-slate-400 focus:bg-white transition font-medium placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right section: Actions & Notifications */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowQuickActions(false);
            }}
            className="relative rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bento-card p-4 shadow-xl z-50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <Bell size={14} className="text-emerald-600" />
                  <span>Notifications</span>
                </div>
                <span className="badge badge-green text-[10px]">
                  {unreadCount} Unread
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No notifications.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-2xl border p-3 text-xs space-y-1 transition ${
                        n.isRead ? 'border-slate-100 bg-slate-50 text-slate-500' : 'border-emerald-100 bg-emerald-50/50 text-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <b className="font-bold text-xs">{n.title}</b>
                        {!n.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(n.id)}
                            className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-600">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Button */}
        {allowedActions.length > 0 && (
          <div ref={quickRef} className="relative">
            <button
              onClick={() => {
                setShowQuickActions(!showQuickActions);
                setShowNotifications(false);
              }}
              className="btn-primary py-1.5 px-3 text-xs rounded-full"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Quick Action</span>
            </button>

            {showQuickActions && (
              <div className="absolute right-0 mt-2 w-52 bento-card p-2 shadow-xl z-50 space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">
                  Quick Actions
                </div>
                {allowedActions.map((act) => (
                  <button
                    key={act.label}
                    onClick={() => {
                      setShowQuickActions(false);
                      setLocation(act.href);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                  >
                    <span>{act.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Shopping Cart Icon with Badge */}
        {role === 'CUSTOMER' && (
          <button
            onClick={() => setLocation('/cart')}
            className="relative rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="View Shopping Cart"
          >
            <ShoppingCart size={17} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4.5 w-4.5 place-items-center rounded-full bg-slate-900 text-[10px] font-extrabold text-white px-1 shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        )}

        {/* User Profile / Auth Button */}
        {user ? (
          <div
            onClick={() => setLocation('/profile')}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 cursor-pointer hover:bg-slate-50 transition"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
              {user.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : <User size={12} />}
            </span>
            <span className="hidden text-left text-xs md:block">
              <b className="block text-slate-900 text-[11px] leading-tight">{user.name}</b>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocation('/login')}
              className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-black transition cursor-pointer"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
