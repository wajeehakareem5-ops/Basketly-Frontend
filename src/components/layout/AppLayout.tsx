import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { CartDrawer } from '../cart/CartDrawer';
import { X } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Map path to title
  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/admin/orders')) return 'Admin — Fulfillment & Orders';
    if (pathname.startsWith('/admin/inventory')) return 'Admin — Catalog & Inventory';
    if (pathname.startsWith('/admin/slots')) return 'Admin — Delivery Windows';
    if (pathname.startsWith('/admin')) return 'Admin — Platform Overview';
    if (pathname.startsWith('/dashboard')) return 'Dashboard Overview';
    if (pathname.startsWith('/planner')) return 'Weekly Meal & Grocery Planner';
    if (pathname.startsWith('/orders')) return 'My Orders & History';
    if (pathname.startsWith('/catalog')) return 'Browse Groceries & Staples';
    if (pathname.startsWith('/delivery')) return 'Delivery Schedule';
    if (pathname.startsWith('/analytics')) return 'Budget & Analytics';
    if (pathname.startsWith('/favorites')) return 'Saved Favorites';
    if (pathname.startsWith('/notifications')) return 'Notifications & Alerts';
    if (pathname.startsWith('/settings')) return 'Settings & Addresses';
    if (pathname.startsWith('/checkout')) return 'Secure Checkout';
    return 'Basketly';
  };

  return (
    <div className="flex h-screen bg-sage overflow-hidden font-sans text-text-primary antialiased">
      {/* Desktop Sidebar (fixed w-[235px]) */}
      <div className="hidden lg:block shrink-0">
        <AppSidebar />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 flex">
            <AppSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="m-3 p-2 h-fit rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader
          title={getPageTitle(location.pathname)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 scrollbar-thin">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
};
