import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  ShieldAlert,
  ShoppingBag,
  TrendingUp,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Eye,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { OrderDto } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminApi.getStats(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateOrderStatus(id, status),
    onSuccess: (updated) => {
      toast.success(`Order ${updated.orderNumber} updated to ${updated.status}`);
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="success">{status}</Badge>;
      case 'CANCELLED':
        return <Badge variant="error">{status}</Badge>;
      case 'OUT_FOR_DELIVERY':
      case 'READY_FOR_DELIVERY':
      case 'CONFIRMED':
        return <Badge variant="lime">{status}</Badge>;
      default:
        return <Badge variant="warning">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={4} />
      </div>
    );
  }

  const allStatuses = [
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_DELIVERY',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Welcome Banner */}
      <div className="p-6 rounded-3xl bg-forest bg-gradient-to-r from-forest-deep via-forest to-forest-light text-white shadow-elevated border border-forest-deep flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime text-forest-deep text-xs font-black uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </div>
          <h1 className="text-2xl font-black">Platform Command Center</h1>
          <p className="text-xs text-sage-light/80 mt-1">
            Real-time management for fulfillment workflows, stock inventory, and user orders
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="px-4 py-2 rounded-xl bg-card text-forest text-xs font-bold shadow-subtle hover:bg-sage transition"
          >
            Fulfillment Queue
          </Link>
          <Link
            to="/admin/inventory"
            className="px-4 py-2 rounded-xl bg-lime hover:bg-lime-dark text-forest-deep text-xs font-black shadow-subtle transition"
          >
            + Manage Catalog
          </Link>
        </div>
      </div>

      {/* 4 Platform Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          subtitle={`${stats?.pendingOrders || 0} requiring fulfillment`}
          icon={ShoppingBag}
        />
        <StatCard
          title="Platform Revenue"
          value={`₹${stats?.totalRevenue?.toFixed(2) || '0.00'}`}
          subtitle="Non-cancelled orders"
          icon={TrendingUp}
        />
        <StatCard
          title="Catalog Items"
          value={stats?.totalProducts || 0}
          subtitle={`${stats?.activeProducts || 0} currently in stock`}
          icon={Package}
        />
        <StatCard
          title="Registered Users"
          value={stats?.totalUsers || 0}
          subtitle="Active households"
          icon={Users}
        />
      </div>

      {/* Low Stock or Fulfillment Warnings */}
      {stats && stats.lowStockProducts > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-state-warning flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-bold">
              {stats.lowStockProducts} products have 10 or fewer units in stock!
            </span>
          </div>
          <Link to="/admin/inventory" className="font-extrabold underline">
            Review Inventory &rarr;
          </Link>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-forest" />
            <h3 className="text-sm font-bold text-text-primary">Recent Orders & Quick Status Update</h3>
          </div>
          <Link to="/admin/orders" className="text-xs font-bold text-forest hover:underline">
            View All Orders &rarr;
          </Link>
        </div>

        {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
          <p className="text-xs text-text-secondary py-6 text-center">No orders placed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-sage-light text-text-secondary uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Order #</th>
                  <th className="px-4 py-3">Delivery Date & Window</th>
                  <th className="px-4 py-3">Total (₹)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Quick Fulfillment Action</th>
                  <th className="px-4 py-3 rounded-r-xl text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.recentOrders.map((ord: OrderDto) => (
                  <tr key={ord.id} className="hover:bg-sage-light/50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-text-primary">
                      {ord.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {ord.deliveryDate} ({ord.deliverySlot || 'Morning'})
                    </td>
                    <td className="px-4 py-3 font-black text-forest">
                      ₹{ord.totalAmount?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(ord.status)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={ord.status}
                        onChange={(e) =>
                          updateStatusMutation.mutate({ id: ord.id, status: e.target.value })
                        }
                        className="px-2 py-1 bg-sage-light border border-border rounded-lg text-xs font-semibold focus:ring-forest"
                      >
                        {allStatuses.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/orders/${ord.id}`}
                        className="inline-flex items-center gap-1 p-1 rounded-lg hover:bg-sage text-forest"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Quick Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/admin/inventory"
          className="p-5 bg-card border border-border rounded-2xl shadow-card hover:border-forest transition flex items-center justify-between"
        >
          <div>
            <h4 className="text-sm font-bold text-text-primary">Product Catalog & Inventory</h4>
            <p className="text-xs text-text-secondary mt-0.5">
              Add new vegetables, fruits, staples, adjust pricing, and toggle in-stock availability
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-forest shrink-0 ml-4" />
        </Link>

        <Link
          to="/admin/slots"
          className="p-5 bg-card border border-border rounded-2xl shadow-card hover:border-forest transition flex items-center justify-between"
        >
          <div>
            <h4 className="text-sm font-bold text-text-primary">Delivery Capacity & Windows</h4>
            <p className="text-xs text-text-secondary mt-0.5">
              Adjust maximum slot reservations, view booked delivery windows, and add new delivery slots
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-forest shrink-0 ml-4" />
        </Link>
      </div>
    </div>
  );
};
