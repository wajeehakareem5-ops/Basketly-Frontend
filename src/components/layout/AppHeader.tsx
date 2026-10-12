import React, { useState } from 'react';
import { format } from 'date-fns';
import { Menu, Bell, ShoppingBasket, UserCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '../../api/notificationApi';
import { Link } from 'react-router-dom';

interface AppHeaderProps {
  onOpenMobileMenu: () => void;
  title?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenMobileMenu, title }) => {
  const { user, loginDemo } = useAuth();
  const { itemCount, openCart } = useCart();
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  // Notifications query
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications(),
    refetchInterval: 30000,
  });

  const unreadCount = notificationsData?.unreadCount || 0;
  const todayFormatted = format(new Date(), 'EEEE, dd MMMM yyyy');

  return (
    <header className="h-16 px-6 bg-card border-b border-border flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile hamburger & Date / Title */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 rounded-xl text-text-primary hover:bg-sage border border-border transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base font-bold text-text-primary hidden sm:block">
            {title || 'Dashboard'}
          </h2>
          <span className="text-xs text-text-secondary">{todayFormatted}</span>
        </div>
      </div>

      {/* Right Actions: Demo Switcher, Notification Bell, Cart Basket */}
      <div className="flex items-center gap-3">
        {/* Quick Demo Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sage-muted text-forest border border-border hover:bg-sage transition"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Switch Persona</span>
          </button>

          {showDemoMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-elevated p-2 z-30">
              <div className="px-2 py-1 text-[11px] font-bold text-text-secondary uppercase">
                Demo Accounts
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDemoMenu(false);
                  loginDemo('user');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-left transition ${
                  user?.email === 'demo@basketly.app'
                    ? 'bg-forest text-white font-bold'
                    : 'text-text-primary hover:bg-sage'
                }`}
              >
                <div>
                  <div className="font-semibold">Aarav Sharma</div>
                  <div className="text-[10px] opacity-80">demo@basketly.app (USER)</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDemoMenu(false);
                  loginDemo('admin');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-left transition mt-1 ${
                  user?.email === 'admin@basketly.app'
                    ? 'bg-forest text-white font-bold'
                    : 'text-text-primary hover:bg-sage'
                }`}
              >
                <div>
                  <div className="font-semibold">Basketly Admin</div>
                  <div className="text-[10px] opacity-80">admin@basketly.app (ADMIN)</div>
                </div>
                <ShieldAlert className="w-3.5 h-3.5 ml-2" />
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <Link
          to="/notifications"
          aria-label="View notifications"
          className="relative p-2.5 rounded-xl text-text-primary bg-sage-light hover:bg-sage border border-border transition"
        >
          <Bell className="w-4 h-4 text-forest" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-state-error text-white text-[10px] font-bold flex items-center justify-center border-2 border-card">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Basket / Cart button */}
        <button
          type="button"
          onClick={openCart}
          aria-label="View grocery cart"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white font-semibold text-xs shadow-card transition active:scale-95"
        >
          <ShoppingBasket className="w-4 h-4 text-lime" />
          <span className="hidden sm:inline">Basket</span>
          {itemCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-lime text-forest-deep text-[11px] font-extrabold leading-none">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
