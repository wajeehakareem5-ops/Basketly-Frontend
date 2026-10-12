import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../../api/dashboardApi';
import { plannerApi } from '../../api/plannerApi';
import { catalogApi } from '../../api/catalogApi';
import { useCart } from '../../context/CartContext';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { QuantityStepper } from '../../components/common/QuantityStepper';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Modal } from '../../components/common/Modal';
import {
  CalendarDays,
  ShoppingBag,
  Clock,
  TrendingUp,
  Plus,
  ShoppingCart,
  CheckCircle2,
  Circle,
  Truck,
  Sparkles,
  ArrowRight,
  Info,
  Calendar,
  Search,
  Check,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { ProductDto } from '../../types';

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToCart } = useCart();

  // Selected day index for the 7-day strip (0 = Mon, ..., 6 = Sun)
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [addItemQty, setAddItemQty] = useState<number>(1);

  // Fetch live dashboard summary
  const {
    data: summary,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => dashboardApi.getSummary(),
  });

  // Catalog products query for the "Add Item" modal
  const { data: catalogData } = useQuery({
    queryKey: ['catalogSearch', searchQuery],
    queryFn: () => catalogApi.getProducts({ search: searchQuery, size: 8 }),
    enabled: showAddItemModal,
  });

  // Toggle plan item completed
  const toggleCompleteMutation = useMutation({
    mutationFn: (itemId: string) => plannerApi.toggleComplete(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  // Update item quantity
  const updateQtyMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity <= 0) {
        await plannerApi.deletePlannedItem(itemId);
      } else {
        await plannerApi.updatePlannedItem(itemId, { quantity });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async ({ date, productId, quantity }: { date: string; productId: string; quantity: number }) => {
      return plannerApi.addPlannedItem(date, { productId, quantity, planDate: date });
    },
    onSuccess: () => {
      toast.success('Added item to meal plan');
      setShowAddItemModal(false);
      setSelectedProductId('');
      setAddItemQty(1);
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  // Suggestion actions
  const applySuggestionMutation = useMutation({
    mutationFn: (key: string) => dashboardApi.applySuggestion(key),
    onSuccess: () => {
      toast.success('Suggestion applied to plan!');
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  const dismissSuggestionMutation = useMutation({
    mutationFn: (key: string) => dashboardApi.dismissSuggestion(key),
    onSuccess: () => {
      toast.success('Suggestion dismissed');
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={1} className="h-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton type="card" count={4} />
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border">
        <h3 className="text-lg font-bold text-state-error mb-2">Unable to load dashboard</h3>
        <p className="text-sm text-text-secondary mb-4">Please check your connection and try again.</p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] })}
          className="px-4 py-2 bg-forest text-white rounded-xl text-xs font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  const days = summary.weeklyPlan?.days || [];
  const selectedDay = days[selectedDayIdx] || days[0];

  // Transfer all items of selected day to shopping cart
  const handleTransferDayToCart = async () => {
    if (!selectedDay || !selectedDay.items || selectedDay.items.length === 0) return;
    try {
      let count = 0;
      for (const it of selectedDay.items) {
        await addToCart(it.product.id, it.quantity);
        count++;
      }
      toast.success(`Transferred ${count} planned items to your basket!`);
    } catch {
      toast.error('Failed to transfer some items to basket');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Dark Forest Green Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-forest bg-gradient-to-r from-forest-deep via-forest to-forest-light text-white p-6 sm:p-8 shadow-elevated border border-forest-deep">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/20 border border-lime/30 text-lime text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Weekly Assistant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {summary.greeting}, {summary.userName}!
            </h1>
            <p className="mt-2 text-sm text-sage-light/85 leading-relaxed">
              You have{' '}
              <span className="font-bold text-lime">{summary.plannedItemCount} groceries planned</span>{' '}
              for this week across{' '}
              <span className="font-bold text-lime">{days.length} days</span>. Keep your kitchen stocked and budget on track.
            </p>
          </div>

          {/* Quick Weekly Estimate Pill */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 sm:p-5 rounded-2xl shrink-0">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sage-light/80 block">
                Estimated Spending
              </span>
              <div className="text-2xl font-black text-white mt-0.5">
                ₹{summary.estimatedWeeklySpending?.toFixed(2)}
              </div>
              <span className="text-xs text-lime font-medium">
                ₹{summary.remainingBudget?.toFixed(2)} remaining of ₹{summary.weeklyBudget?.toFixed(2)}
              </span>
            </div>
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-lime hover:bg-lime-dark text-forest-deep text-xs font-extrabold transition shadow-subtle active:scale-95"
            >
              <span>Full Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Four Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Planned Items"
          value={summary.plannedItemCount}
          subtitle={`Across ${days.length} days`}
          icon={CalendarDays}
        />
        <StatCard
          title="Weekly Estimated Total"
          value={`₹${summary.estimatedWeeklySpending?.toFixed(2)}`}
          subtitle={`${summary.budgetPercentageUsed?.toFixed(0)}% of weekly limit`}
          icon={TrendingUp}
          highlight={summary.budgetPercentageUsed > 90}
        />
        <StatCard
          title="Scheduled Orders"
          value={summary.scheduledOrdersCount + summary.confirmedOrdersCount}
          subtitle={`${summary.confirmedOrdersCount} confirmed deliveries`}
          icon={Truck}
        />
        <StatCard
          title="Estimated Time Saved"
          value={summary.timeSavedDisplay}
          subtitle="Formula: (items×5m)+(orders×45m)"
          icon={Clock}
        />
      </div>

      {/* 3. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): 7-Day Strip & Selected Day Grocery List */}
        <div className="lg:col-span-8 space-y-6">
          {/* Seven-Day Strip Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-forest" />
                <h3 className="text-sm font-bold text-text-primary">Weekly Schedule</h3>
              </div>
              <span className="text-xs text-text-secondary font-medium">
                {summary.weekStartDate} — {summary.weekEndDate}
              </span>
            </div>

            {/* 7 Interactive Day Buttons */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day: any, idx: number) => {
                const isSelected = idx === selectedDayIdx;
                const dateObj = parseISO(day.date);
                const dayName = format(dateObj, 'EEE');
                const dayNum = format(dateObj, 'd');
                const itemCount = day.items?.length || 0;

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedDayIdx(idx)}
                    className={`flex flex-col items-center justify-between py-3 px-1 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-forest text-white border-forest shadow-card scale-102 font-bold'
                        : 'bg-sage-light hover:bg-sage text-text-primary border-border'
                    }`}
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
                      {dayName}
                    </span>
                    <span className="text-lg font-black my-1">{dayNum}</span>
                    <div className="flex flex-col items-center gap-0.5">
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isSelected ? 'bg-lime text-forest-deep' : 'bg-sage-muted text-text-secondary'
                        }`}
                      >
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </span>
                      <span className="text-[10px] opacity-75 mt-0.5">
                        ₹{day.dailyEstimatedTotal?.toFixed(0) || '0'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected-Day Grocery List Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-text-primary">
                    {selectedDay
                      ? format(parseISO(selectedDay.date), 'EEEE, MMMM d')
                      : 'Selected Day'}
                  </h3>
                  <Badge variant="lime" size="sm">
                    ₹{selectedDay?.dailyEstimatedTotal?.toFixed(2) || '0.00'}
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  {selectedDay?.items?.length || 0} planned ingredients & groceries
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTransferDayToCart}
                  disabled={!selectedDay?.items?.length}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sage-muted hover:bg-sage border border-border text-forest text-xs font-bold transition disabled:opacity-40"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Transfer to Basket</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-subtle transition"
                >
                  <Plus className="w-3.5 h-3.5 text-lime" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            {/* Day Items List */}
            <div className="mt-4 space-y-2.5">
              {!selectedDay || !selectedDay.items || selectedDay.items.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm font-semibold text-text-primary mb-1">
                    No items planned for this day
                  </p>
                  <p className="text-xs text-text-secondary mb-4">
                    Add groceries or copy items from another day to plan meals in advance.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddItemModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5 text-lime" />
                    <span>Plan First Item</span>
                  </button>
                </div>
              ) : (
                selectedDay.items.map((item: any) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                      item.completed
                        ? 'bg-sage-light/50 border-border opacity-60'
                        : 'bg-white border-border hover:border-forest/20 shadow-subtle'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleCompleteMutation.mutate(item.id)}
                        className="text-forest hover:scale-110 transition shrink-0"
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-state-success fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-border-dark" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div
                          className={`text-sm font-bold text-text-primary truncate ${
                            item.completed ? 'line-through text-text-secondary' : ''
                          }`}
                        >
                          {item.product.name}
                        </div>
                        <div className="text-xs text-text-secondary">
                          ₹{item.product.price.toFixed(2)} • {item.product.unit}
                          {item.notes && <span className="ml-2 italic text-forest">({item.notes})</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-bold text-text-primary">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-text-secondary">
                          ₹{item.product.price.toFixed(2)}/ea
                        </div>
                      </div>

                      <QuantityStepper
                        value={item.quantity}
                        min={1}
                        size="sm"
                        disabled={updateQtyMutation.isPending}
                        onChange={(newQty) =>
                          updateQtyMutation.mutate({ itemId: item.id, quantity: newQty })
                        }
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Budget Progress, Deliveries, Smart Suggestions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Weekly Spending & Budget Tracker Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-text-primary">Budget Utilization</h3>
              <Link to="/analytics" className="text-xs font-bold text-forest hover:underline">
                Analytics
              </Link>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-text-secondary">Planned vs Budget</span>
                  <span className="text-text-primary font-bold">
                    ₹{summary.estimatedWeeklySpending?.toFixed(2)} / ₹{summary.weeklyBudget?.toFixed(2)}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2.5 bg-sage-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      summary.budgetPercentageUsed > 100
                        ? 'bg-state-error'
                        : summary.budgetPercentageUsed > 80
                        ? 'bg-state-warning'
                        : 'bg-forest'
                    }`}
                    style={{ width: `${Math.min(100, summary.budgetPercentageUsed)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-center">
                <div className="p-2 rounded-xl bg-sage-light">
                  <span className="text-[10px] uppercase font-bold text-text-secondary block">
                    Remaining
                  </span>
                  <span
                    className={`text-sm font-black ${
                      summary.remainingBudget < 0 ? 'text-state-error' : 'text-state-success'
                    }`}
                  >
                    ₹{summary.remainingBudget?.toFixed(2)}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-sage-light">
                  <span className="text-[10px] uppercase font-bold text-text-secondary block">
                    % Used
                  </span>
                  <span className="text-sm font-black text-text-primary">
                    {summary.budgetPercentageUsed?.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Deliveries Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-forest" />
                <h3 className="text-sm font-bold text-text-primary">Upcoming Deliveries</h3>
              </div>
              <Link to="/delivery" className="text-xs font-bold text-forest hover:underline">
                View all
              </Link>
            </div>

            {!summary.upcomingDeliveries || summary.upcomingDeliveries.length === 0 ? (
              <div className="py-6 text-center text-xs text-text-secondary">
                No active deliveries scheduled this week.{' '}
                <Link to="/delivery" className="text-forest font-bold block mt-1 hover:underline">
                  Book a delivery slot &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {summary.upcomingDeliveries.map((delivery: any) => (
                  <div
                    key={delivery.id}
                    className="p-3 bg-sage-light border border-border rounded-xl space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-text-primary">
                        {delivery.deliveryDate}
                      </span>
                      <Badge variant="success" size="sm">
                        {delivery.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-text-secondary flex items-center justify-between">
                      <span>{delivery.slot?.startTime} - {delivery.slot?.endTime}</span>
                      <span className="font-semibold text-forest">₹{delivery.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Smart Suggestions Panel */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-forest fill-forest" />
              <h3 className="text-sm font-bold text-text-primary">Smart Suggestions</h3>
            </div>

            {!summary.suggestions || summary.suggestions.length === 0 ? (
              <p className="text-xs text-text-secondary py-3 text-center">
                All pantry items and budget goals look optimal!
              </p>
            ) : (
              <div className="space-y-3">
                {summary.suggestions.slice(0, 3).map((sug: any) => (
                  <div
                    key={sug.id}
                    className="p-3 rounded-xl bg-sage-light/80 border border-border text-xs space-y-2"
                  >
                    <div>
                      <div className="font-bold text-text-primary">{sug.title}</div>
                      <div className="text-text-secondary text-[11px] mt-0.5 leading-relaxed">
                        {sug.description}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => dismissSuggestionMutation.mutate(sug.id)}
                        className="text-text-secondary hover:text-text-primary text-[11px] font-medium"
                      >
                        Dismiss
                      </button>
                      <button
                        type="button"
                        onClick={() => applySuggestionMutation.mutate(sug.id)}
                        className="px-2.5 py-1 rounded-lg bg-forest hover:bg-forest-deep text-white font-bold text-[11px] transition shadow-subtle"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Item to Day Modal */}
      <Modal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        title={`Add Grocery to ${selectedDay ? format(parseISO(selectedDay.date), 'EEEE, MMM d') : 'Day'}`}
      >
        <div className="space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search staples, veggies, fruits (e.g. Milk, Onions)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-sage-light border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          {/* Product selection list */}
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {catalogData?.content?.map((prod: ProductDto) => {
              const isSelected = selectedProductId === prod.id;
              return (
                <div
                  key={prod.id}
                  onClick={() => setSelectedProductId(prod.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-forest/10 border-forest'
                      : 'bg-white border-border hover:bg-sage-light'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-sage-muted flex items-center justify-center shrink-0">
                      {prod.imageUrl ? (
                        <img src={prod.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span>🥦</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-text-primary truncate">{prod.name}</div>
                      <div className="text-[10px] text-text-secondary">
                        ₹{prod.price.toFixed(2)} • {prod.unit}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-forest shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Quantity stepper & Submit */}
          {selectedProductId && (
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-primary">Quantity:</span>
                <QuantityStepper
                  value={addItemQty}
                  min={1}
                  size="sm"
                  onChange={setAddItemQty}
                />
              </div>

              <button
                type="button"
                disabled={addItemMutation.isPending}
                onClick={() => {
                  if (selectedDay) {
                    addItemMutation.mutate({
                      date: selectedDay.date,
                      productId: selectedProductId,
                      quantity: addItemQty,
                    });
                  }
                }}
                className="px-4 py-2 bg-forest hover:bg-forest-deep text-white font-bold text-xs rounded-xl shadow-card transition"
              >
                Add to Plan
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
