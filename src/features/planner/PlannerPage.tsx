import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plannerApi, CreateRecurringRuleData, RecurrencePreview } from '../../api/plannerApi';
import { catalogApi } from '../../api/catalogApi';
import { useCart } from '../../context/CartContext';
import { QuantityStepper } from '../../components/common/QuantityStepper';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Copy,
  Trash2,
  ShoppingCart,
  Repeat,
  CheckCircle2,
  Circle,
  Search,
  Check,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { format, addDays, subDays, startOfWeek, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { ProductDto } from '../../types';

export const PlannerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToCart } = useCart();

  // Current week start (Monday)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const formattedWeekStart = format(currentWeekStart, 'yyyy-MM-dd');

  // Modal states
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
  const [targetDateForAdd, setTargetDateForAdd] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [addItemQty, setAddItemQty] = useState<number>(1);
  const [addItemNotes, setAddItemNotes] = useState<string>('');

  // Recurrence modal states
  const [showRecurrenceModal, setShowRecurrenceModal] = useState<boolean>(false);
  const [recurrenceProductId, setRecurrenceProductId] = useState<string>('');
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<string>('WEEKLY');
  const [recurrenceDayOfWeek, setRecurrenceDayOfWeek] = useState<string>('MONDAY');
  const [recurrenceQty, setRecurrenceQty] = useState<number>(1);
  const [recurrencePreview, setRecurrencePreview] = useState<RecurrencePreview | null>(null);

  // Fetch weekly plan
  const { data: plan, isLoading } = useQuery({
    queryKey: ['weeklyPlan', formattedWeekStart],
    queryFn: () => plannerApi.getWeeklyPlan(formattedWeekStart),
  });

  // Fetch catalog for modal
  const { data: catalogData } = useQuery({
    queryKey: ['catalogSearch', searchQuery],
    queryFn: () => catalogApi.getProducts({ search: searchQuery, size: 8 }),
    enabled: showAddItemModal || showRecurrenceModal,
  });

  // Navigation handlers
  const handlePrevWeek = () => setCurrentWeekStart((prev) => subDays(prev, 7));
  const handleNextWeek = () => setCurrentWeekStart((prev) => addDays(prev, 7));
  const handleCurrentWeek = () =>
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Mutations
  const toggleCompleteMutation = useMutation({
    mutationFn: (itemId: string) => plannerApi.toggleComplete(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weeklyPlan'] }),
  });

  const updateQtyMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity <= 0) {
        await plannerApi.deletePlannedItem(itemId);
      } else {
        await plannerApi.updatePlannedItem(itemId, { quantity });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weeklyPlan'] }),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => plannerApi.deletePlannedItem(itemId),
    onSuccess: () => {
      toast.success('Item removed from plan');
      queryClient.invalidateQueries({ queryKey: ['weeklyPlan'] });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: (data: { date: string; productId: string; quantity: number; notes?: string }) =>
      plannerApi.addPlannedItem(data.date, {
        productId: data.productId,
        quantity: data.quantity,
        planDate: data.date,
        notes: data.notes,
      }),
    onSuccess: () => {
      toast.success('Item added to meal plan');
      setShowAddItemModal(false);
      setSelectedProductId('');
      setAddItemQty(1);
      setAddItemNotes('');
      queryClient.invalidateQueries({ queryKey: ['weeklyPlan'] });
    },
  });

  const copyWeekMutation = useMutation({
    mutationFn: (targetWeekStart: string) =>
      plannerApi.copyWeek(formattedWeekStart, targetWeekStart),
    onSuccess: () => {
      toast.success('Plan copied to next week!');
      handleNextWeek();
    },
  });

  const clearDayMutation = useMutation({
    mutationFn: (date: string) => plannerApi.clearDay(date),
    onSuccess: () => {
      toast.success('Day plan cleared');
      queryClient.invalidateQueries({ queryKey: ['weeklyPlan'] });
    },
  });

  // Transfer all items of a day to Cart
  const handleTransferDayToCart = async (dayItems: any[]) => {
    if (!dayItems?.length) return;
    try {
      for (const it of dayItems) {
        await addToCart(it.product.id, it.quantity);
      }
      toast.success(`Added ${dayItems.length} items to basket`);
    } catch {
      toast.error('Failed to add some items');
    }
  };

  // Preview recurrence rule
  const handlePreviewRecurrence = async () => {
    if (!recurrenceProductId) {
      toast.error('Please select a product');
      return;
    }
    try {
      const data: CreateRecurringRuleData = {
        productId: recurrenceProductId,
        frequency: recurrenceFrequency,
        targetDayOfWeek: recurrenceDayOfWeek,
        quantity: recurrenceQty,
        startDate: formattedWeekStart,
      };
      const preview = await plannerApi.previewRecurrence(data);
      setRecurrencePreview(preview);
    } catch {
      toast.error('Failed to preview recurrence');
    }
  };

  const handleSaveRecurrence = async () => {
    if (!recurrenceProductId) return;
    try {
      await plannerApi.createRecurringRule({
        productId: recurrenceProductId,
        frequency: recurrenceFrequency,
        targetDayOfWeek: recurrenceDayOfWeek,
        quantity: recurrenceQty,
        startDate: formattedWeekStart,
      });
      toast.success('Recurring rule saved and scheduled!');
      setShowRecurrenceModal(false);
      queryClient.invalidateQueries({ queryKey: ['weeklyPlan'] });
    } catch {
      toast.error('Failed to save recurring rule');
    }
  };

  const openAddModalForDate = (date: string) => {
    setTargetDateForAdd(date);
    setSelectedProductId('');
    setAddItemQty(1);
    setAddItemNotes('');
    setShowAddItemModal(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-5 rounded-2xl border border-border shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest text-lime flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-text-primary">
              Weekly Meal & Grocery Planner
            </h2>
            <p className="text-xs text-text-secondary">
              Plan daily meals, balance your grocery budget, and automate recurring essentials
            </p>
          </div>
        </div>

        {/* Week navigation buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-sage-muted rounded-xl p-1 border border-border">
            <button
              type="button"
              onClick={handlePrevWeek}
              aria-label="Previous week"
              className="p-1.5 rounded-lg text-text-primary hover:bg-card transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCurrentWeek}
              className="px-3 py-1 text-xs font-bold text-forest hover:bg-card rounded-lg transition"
            >
              This Week
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              aria-label="Next week"
              className="p-1.5 rounded-lg text-text-primary hover:bg-card transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const nextWeekStart = format(addDays(currentWeekStart, 7), 'yyyy-MM-dd');
              copyWeekMutation.mutate(nextWeekStart);
            }}
            disabled={copyWeekMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sage-muted hover:bg-sage border border-border text-xs font-bold text-text-primary transition"
          >
            <Copy className="w-3.5 h-3.5 text-forest" />
            <span className="hidden sm:inline">Copy to Next Week</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRecurrenceModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-subtle transition"
          >
            <Repeat className="w-3.5 h-3.5 text-lime" />
            <span>Recurring Rules</span>
          </button>
        </div>
      </div>

      {/* Week Summary Banner */}
      {plan && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-sage-light border border-border p-4 rounded-2xl gap-3">
          <div className="text-xs text-text-secondary">
            Displaying week of <strong className="text-text-primary">{formattedWeekStart}</strong>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-text-secondary">Estimated Total: </span>
              <strong className="text-forest text-sm">₹{plan.estimatedWeeklyTotal?.toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-text-secondary">Budget: </span>
              <strong className="text-text-primary">₹{plan.weeklyBudget?.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          <LoadingSkeleton type="card" count={7} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {plan?.days?.map((day) => {
            const dateObj = parseISO(day.date);
            const isToday = format(new Date(), 'yyyy-MM-dd') === day.date;
            const items = day.items || [];

            return (
              <div
                key={day.date}
                className={`flex flex-col rounded-2xl bg-card border ${
                  isToday ? 'border-lime ring-2 ring-lime/40' : 'border-border'
                } shadow-card overflow-hidden min-h-[460px]`}
              >
                {/* Day Header */}
                <div
                  className={`p-3.5 border-b border-border ${
                    isToday ? 'bg-forest text-white' : 'bg-sage-light text-text-primary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-wider">
                        {format(dateObj, 'EEEE')}
                      </div>
                      <div className="text-[11px] opacity-80">{format(dateObj, 'MMM d')}</div>
                    </div>
                    {isToday && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-lime text-forest-deep font-black">
                        TODAY
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs pt-1 border-t border-black/10">
                    <span className="font-semibold">{items.length} items</span>
                    <span className="font-extrabold">₹{day.dailyEstimatedTotal?.toFixed(0)}</span>
                  </div>
                </div>

                {/* Day Items List */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[360px]">
                  {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                      <p className="text-xs text-text-secondary mb-2">No groceries planned</p>
                      <button
                        type="button"
                        onClick={() => openAddModalForDate(day.date)}
                        className="p-1.5 rounded-lg bg-sage-muted hover:bg-sage text-forest text-xs font-bold inline-flex items-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className={`p-2 rounded-xl border text-xs transition ${
                          item.completed
                            ? 'bg-sage-light border-border opacity-60'
                            : 'bg-white border-border shadow-subtle hover:border-forest/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => toggleCompleteMutation.mutate(item.id)}
                            className="text-forest mt-0.5 shrink-0"
                          >
                            {item.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-state-success" />
                            ) : (
                              <Circle className="w-4 h-4 text-border-dark" />
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <div
                              className={`font-bold truncate text-text-primary ${
                                item.completed ? 'line-through text-text-secondary' : ''
                              }`}
                            >
                              {item.product.name}
                            </div>
                            <div className="text-[10px] text-text-secondary">
                              ₹{item.product.price.toFixed(2)} • {item.product.unit}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteItemMutation.mutate(item.id)}
                            className="text-text-secondary hover:text-state-error p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="mt-2 flex items-center justify-between pt-1 border-t border-border">
                          <span className="font-bold text-forest text-[11px]">
                            ₹{(item.product.price * item.quantity).toFixed(0)}
                          </span>
                          <QuantityStepper
                            value={item.quantity}
                            min={1}
                            size="sm"
                            onChange={(newQty) =>
                              updateQtyMutation.mutate({ itemId: item.id, quantity: newQty })
                            }
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Day Footer Actions */}
                <div className="p-2 border-t border-border bg-sage-light/60 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => openAddModalForDate(day.date)}
                    className="flex-1 py-1.5 rounded-lg bg-forest hover:bg-forest-deep text-white text-[11px] font-bold flex items-center justify-center gap-1 transition shadow-subtle"
                  >
                    <Plus className="w-3 h-3 text-lime" />
                    <span>Add</span>
                  </button>
                  {items.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleTransferDayToCart(items)}
                        title="Add day items to basket"
                        aria-label="Add day items to basket"
                        className="p-1.5 rounded-lg bg-card hover:bg-sage border border-border text-forest text-[11px] transition"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => clearDayMutation.mutate(day.date)}
                        title="Clear day"
                        aria-label="Clear day"
                        className="p-1.5 rounded-lg bg-card hover:bg-rose-50 border border-border text-text-secondary hover:text-state-error text-[11px] transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Item Modal */}
      <Modal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        title={`Plan Grocery for ${targetDateForAdd}`}
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search staples, veggies, dairy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-sage-light border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
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

          <div>
            <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
              Meal Notes (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. For Monday Dinner Paneer Butter Masala"
              value={addItemNotes}
              onChange={(e) => setAddItemNotes(e.target.value)}
              className="w-full px-3 py-1.5 bg-sage-light border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

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
                  addItemMutation.mutate({
                    date: targetDateForAdd,
                    productId: selectedProductId,
                    quantity: addItemQty,
                    notes: addItemNotes,
                  });
                }}
                className="px-4 py-2 bg-forest hover:bg-forest-deep text-white font-bold text-xs rounded-xl shadow-card transition"
              >
                Confirm Plan
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Recurrence Rules Modal */}
      <Modal
        isOpen={showRecurrenceModal}
        onClose={() => {
          setShowRecurrenceModal(false);
          setRecurrencePreview(null);
        }}
        title="Manage Recurring Essentials"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-text-secondary">
            Set up automatic weekly or bi-weekly replenishment for staples like Milk, Bread, and Eggs.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                Frequency
              </label>
              <select
                value={recurrenceFrequency}
                onChange={(e) => setRecurrenceFrequency(e.target.value)}
                className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-forest"
              >
                <option value="DAILY">Every Day</option>
                <option value="WEEKLY">Once a Week</option>
                <option value="BI_WEEKLY">Every 2 Weeks</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                Target Day of Week
              </label>
              <select
                value={recurrenceDayOfWeek}
                onChange={(e) => setRecurrenceDayOfWeek(e.target.value)}
                className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-forest"
              >
                <option value="MONDAY">Monday</option>
                <option value="TUESDAY">Tuesday</option>
                <option value="WEDNESDAY">Wednesday</option>
                <option value="THURSDAY">Thursday</option>
                <option value="FRIDAY">Friday</option>
                <option value="SATURDAY">Saturday</option>
                <option value="SUNDAY">Sunday</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
              Select Product
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1.5 border border-border rounded-xl p-2 bg-sage-light/50">
              {catalogData?.content?.map((prod: ProductDto) => (
                <div
                  key={prod.id}
                  onClick={() => setRecurrenceProductId(prod.id)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs ${
                    recurrenceProductId === prod.id
                      ? 'bg-forest text-white font-bold'
                      : 'hover:bg-sage text-text-primary'
                  }`}
                >
                  <span>{prod.name} ({prod.unit})</span>
                  <span>₹{prod.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">Quantity:</span>
              <QuantityStepper
                value={recurrenceQty}
                min={1}
                size="sm"
                onChange={setRecurrenceQty}
              />
            </div>
            <button
              type="button"
              onClick={handlePreviewRecurrence}
              className="px-3 py-1.5 bg-sage-muted hover:bg-sage border border-border text-forest text-xs font-bold rounded-xl transition"
            >
              Preview Schedule
            </button>
          </div>

          {/* Preview result */}
          {recurrencePreview && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
              <div className="font-bold text-state-success">
                Projected {recurrencePreview.totalOccurrences} deliveries over 4 weeks
              </div>
              <div className="text-text-secondary">
                Estimated 4-week cost: <strong>₹{recurrencePreview.estimatedTotalCost?.toFixed(2)}</strong>
              </div>
              <div className="text-[11px] text-text-secondary">
                Dates: {recurrencePreview.projectedDates?.join(', ')}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-border flex justify-end">
            <button
              type="button"
              onClick={handleSaveRecurrence}
              className="px-5 py-2.5 bg-forest hover:bg-forest-deep text-white text-xs font-bold rounded-xl shadow-card transition"
            >
              Save Recurring Schedule
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
