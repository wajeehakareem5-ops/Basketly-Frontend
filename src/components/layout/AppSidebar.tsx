import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  ShoppingBag,
  Store,
  Truck,
  TrendingUp,
  Heart,
  Bell,
  Settings,
  LogOut,
  Leaf,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

interface AppSidebarProps {
  onCloseMobile?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();

  const workspaceNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Weekly Planner', path: '/planner', icon: CalendarDays },
    { name: 'My Orders', path: '/orders', icon: ShoppingBag },
    { name: 'Browse Groceries', path: '/catalog', icon: Store },
  ];

  const preferencesNavItems = [
    { name: 'Delivery Schedule', path: '/delivery', icon: Truck },
    { name: 'Budget & Analytics', path: '/analytics', icon: TrendingUp },
    { name: 'Favorites', path: '/favorites', icon: Heart },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-[235px] h-screen bg-card border-r border-border flex flex-col justify-between shrink-0 select-none">
      {/* Top Logo & Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-thin">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center text-lime shadow-card">
            <Leaf className="w-5 h-5 fill-lime" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-forest leading-none">
              Basketly
            </h1>
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
              Smart Grocery
            </span>
          </div>
        </div>

        {/* WORKSPACE SECTION */}
        <div className="mb-6">
          <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-text-secondary uppercase">
            Workspace
          </div>
          <nav className="space-y-1">
            {workspaceNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-forest text-white shadow-card font-semibold'
                        : 'text-text-primary hover:bg-sage hover:text-forest'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* ADMIN SECTION (Visible only to ADMIN role) */}
        {user?.role === 'ADMIN' && (
          <div className="mb-6">
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-forest uppercase flex items-center justify-between">
              <span>Admin Console</span>
              <span className="px-1.5 py-0.2 rounded bg-lime text-forest-deep text-[9px] font-extrabold">ADMIN</span>
            </div>
            <nav className="space-y-1">
              {[
                { name: 'Admin Overview', path: '/admin', icon: LayoutDashboard },
                { name: 'Fulfillment Orders', path: '/admin/orders', icon: ShoppingBag },
                { name: 'Manage Inventory', path: '/admin/inventory', icon: Store },
                { name: 'Delivery Windows', path: '/admin/slots', icon: Truck },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin'}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-forest text-white shadow-card font-semibold'
                          : 'text-text-primary hover:bg-sage hover:text-forest'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

        {/* PREFERENCES SECTION */}
        <div className="mb-6">
          <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-text-secondary uppercase">
            Preferences
          </div>
          <nav className="space-y-1">
            {preferencesNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-forest text-white shadow-card font-semibold'
                        : 'text-text-primary hover:bg-sage hover:text-forest'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer: Sustainability Tip & User Profile Card */}
      <div className="p-4 border-t border-border bg-sage-light/60 space-y-3">
        {/* Sustainability Tip */}
        <div className="p-3 rounded-xl bg-forest-deep text-white text-xs relative overflow-hidden shadow-subtle">
          <div className="flex items-center gap-1.5 text-lime font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sustainability Tip</span>
          </div>
          <p className="text-[11px] leading-relaxed text-sage-light/90">
            Planning weekly meals reduces grocery waste by up to 28%!
          </p>
        </div>

        {/* User Card */}
        {user && (
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-forest text-lime flex items-center justify-center font-bold text-xs shrink-0 border border-lime/40">
                {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-text-primary truncate">
                  {user.fullName}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Badge variant={user.role === 'ADMIN' ? 'forest' : 'lime'} size="sm">
                    {user.role}
                  </Badge>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Log out"
              aria-label="Log out"
              className="p-1.5 rounded-lg text-text-secondary hover:text-state-error hover:bg-rose-50 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
