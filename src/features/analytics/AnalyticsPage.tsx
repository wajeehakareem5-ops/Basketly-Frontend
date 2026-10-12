import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetApi } from '../../api/budgetApi';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  Clock,
  Sparkles,
  Edit2,
  Check,
  Info,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';

export const AnalyticsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Budget editing state
  const [editingWeekly, setEditingWeekly] = useState(false);
  const [weeklyBudgetInput, setWeeklyBudgetInput] = useState<number>(2000);

  // Queries
  const { data: budgetSummary, isLoading: budgetLoading } = useQuery({
    queryKey: ['budgetSummary'],
    queryFn: async () => {
      const data = await budgetApi.getBudgetSummary();
      setWeeklyBudgetInput(data.weeklyBudget);
      return data;
    },
  });

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['spendingTrends'],
    queryFn: () => budgetApi.getSpendingTrends(),
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categoryBreakdown'],
    queryFn: () => budgetApi.getCategoryBreakdown(),
  });

  // Budget update mutation
  const updateBudgetMutation = useMutation({
    mutationFn: (amount: number) => budgetApi.updateWeeklyBudget(amount),
    onSuccess: () => {
      toast.success('Weekly budget updated!');
      setEditingWeekly(false);
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  const COLORS = ['#126044', '#C7FF35', '#24834F', '#E6A323', '#2D72D2', '#8C9B90'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-card flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-forest text-lime flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-text-primary">Budget & Analytics</h2>
          <p className="text-xs text-text-secondary">
            Three-dimensional spending analysis, category distributions, and automated pantry economics
          </p>
        </div>
      </div>

      {/* 3 Spending Measures Explained & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-card border border-border rounded-2xl shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase">1. Planned Spending</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-sage-muted text-forest font-bold">Plan</span>
          </div>
          <div className="text-2xl font-black text-forest">
            ₹{budgetSummary?.plannedSpending?.toFixed(2) || '0.00'}
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Total value of all ingredients and groceries in your active 7-day meal schedule.
          </p>
        </div>

        <div className="p-5 bg-card border border-border rounded-2xl shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase">2. Committed Spending</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-lime text-forest-deep font-bold">Committed</span>
          </div>
          <div className="text-2xl font-black text-forest-deep">
            ₹{budgetSummary?.committedSpending?.toFixed(2) || '0.00'}
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Total value of placed orders that are pending, confirmed, or out for delivery.
          </p>
        </div>

        <div className="p-5 bg-card border border-border rounded-2xl shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase">3. Actual Spending</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-state-success font-bold">Delivered</span>
          </div>
          <div className="text-2xl font-black text-state-success">
            ₹{budgetSummary?.actualSpending?.toFixed(2) || '0.00'}
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Finalized historical expenditure from completed, delivered grocery drops.
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Spending Trend (Recharts BarChart) - 7 cols */}
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">Weekly Spending Trends (₹)</h3>
            <span className="text-xs text-text-secondary">Planned vs Actual</span>
          </div>

          {trendsLoading ? (
            <LoadingSkeleton type="card" count={1} className="h-64" />
          ) : !trends || trends.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-text-secondary">
              No trend data available yet
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EADF" />
                  <XAxis dataKey="weekLabel" stroke="#718176" fontSize={11} />
                  <YAxis stroke="#718176" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2EADF',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="planned" fill="#126044" name="Planned (₹)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" fill="#C7FF35" name="Actual (₹)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category Breakdown (Recharts PieChart) - 5 cols */}
        <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">Category Distribution</h3>
            <span className="text-xs text-text-secondary">By Spending</span>
          </div>

          {categoriesLoading ? (
            <LoadingSkeleton type="card" count={1} className="h-64" />
          ) : !categories || categories.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-text-secondary">
              No category spending recorded yet
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="amount"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {categories.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => `₹${Number(val).toFixed(2)}`}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2EADF',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Budget Limit Config & Time Saved Formula */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget Threshold Config */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">Weekly Budget Cap</h3>
            {!editingWeekly ? (
              <button
                type="button"
                onClick={() => setEditingWeekly(true)}
                className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Change Limit</span>
              </button>
            ) : null}
          </div>

          {editingWeekly ? (
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={100}
                step={100}
                value={weeklyBudgetInput}
                onChange={(e) => setWeeklyBudgetInput(Number(e.target.value))}
                className="px-3 py-2 bg-sage-light border border-border rounded-xl text-xs font-bold w-36"
              />
              <button
                type="button"
                onClick={() => updateBudgetMutation.mutate(weeklyBudgetInput)}
                className="px-3 py-2 bg-forest text-white rounded-xl text-xs font-bold"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingWeekly(false)}
                className="px-2 text-xs text-text-secondary"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-2xl font-black text-text-primary">
                ₹{budgetSummary?.weeklyBudget?.toFixed(2) || '2000.00'}
              </div>
              <p className="text-xs text-text-secondary">
                Weekly spending alerts and progress indicators are calibrated against this limit.
              </p>
            </div>
          )}
        </div>

        {/* Time-Saved Formula Explanation Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-forest" />
            <h3 className="text-sm font-bold text-text-primary">Documented Time-Saved Formula</h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Basketly estimates your weekly time savings using the documented benchmark:
          </p>
          <div className="p-3 bg-sage-light border border-border rounded-xl font-mono text-xs text-forest font-bold">
            Time Saved = (Planned Items × 5 min) + (Deliveries × 45 min)
          </div>
          <p className="text-[11px] text-text-secondary">
            * 5 minutes saved per planned grocery (no mid-week pantry panic or recipe searches) plus 45 minutes saved per scheduled delivery by replacing physical supermarket trips.
          </p>
        </div>
      </div>
    </div>
  );
};
