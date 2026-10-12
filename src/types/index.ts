export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  displayOrder: number;
}
export type CategoryDto = Category;

export interface Product {
  id: string;
  categoryId?: string;
  categoryName?: string;
  categorySlug?: string;
  name: string;
  description?: string;
  price: number;
  packageSize?: string;
  unit: string;
  imageUrl?: string;
  isAvailable?: boolean;
  stockQuantity?: number;
  isFavorite?: boolean;
  brand?: string;
  shelfLifeDays?: number;
  organic?: boolean;
}
export type ProductDto = Product;

export interface PlannedItem {
  id: string;
  weeklyPlanId?: string;
  product: Product;
  planDate: string;
  quantity: number;
  unitPrice?: number;
  lineTotal?: number;
  notes?: string;
  completed: boolean;
  recurringRuleId?: string;
}

export interface DayPlan {
  date: string;
  dayOfWeek?: string;
  dayName?: string;
  items: PlannedItem[];
  itemCount?: number;
  totalAmount?: number;
  dailyEstimatedTotal?: number;
}

export interface WeeklyPlan {
  id?: string;
  weekStartDate: string;
  weekEndDate: string;
  days: DayPlan[];
  totalItemCount?: number;
  weeklyTotalAmount?: number;
  estimatedWeeklyTotal?: number;
  weeklyBudget: number;
  remainingBudget: number;
  budgetPercentageUsed: number;
}

export interface CartItem {
  id: string;
  product?: Product;
  productId?: string;
  productName?: string;
  imageUrl?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Cart {
  id?: string;
  items: CartItem[];
  totalItemCount?: number;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount?: number;
  total: number;
  appliedCouponCode?: string;
  appliedCoupon?: {
    code: string;
    discountPercentage?: number;
    description?: string;
  };
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_DELIVERY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  packageSize?: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
  couponCode?: string;
  paymentMethod: string;
  paymentStatus?: string;
  shippingAddress?: string;
  deliveryDate: string;
  deliverySlot?: string;
  deliveryReservationId?: string;
  instructions?: string;
  deliveryNotes?: string;
  address?: Address;
  slot?: DeliverySlot;
  items: OrderItem[];
  createdAt: string;
}
export type OrderDto = Order;

export interface DeliverySlot {
  id: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  availableCount?: number;
  available?: boolean;
}
export type DeliverySlotDto = DeliverySlot;

export interface DeliveryReservation {
  id: string;
  slot: DeliverySlot;
  status: string;
  notes?: string;
  createdAt: string;
}
export type ReservationDto = DeliveryReservation;

export interface Suggestion {
  id: string;
  type?: string;
  title: string;
  description: string;
  explanation?: string;
  productId?: string;
  productName?: string;
  actionType?: string;
  dismissed?: boolean;
}
export type SuggestionDto = Suggestion;

export interface DashboardSummary {
  greeting: string;
  userName: string;
  weekStartDate: string;
  weekEndDate: string;
  estimatedWeeklySpending: number;
  plannedItemCount: number;
  scheduledOrdersCount: number;
  confirmedOrdersCount: number;
  weeklyBudget: number;
  remainingBudget: number;
  budgetPercentageUsed: number;
  timeSavedDisplay: string;
  timeSavedFormula: string;
  weeklyPlan: WeeklyPlan;
  upcomingDeliveries: Order[];
  suggestions: Suggestion[];
}
export type DashboardSummaryDto = DashboardSummary;

export interface BudgetSummary {
  weeklyBudget: number;
  monthlyBudget: number;
  plannedSpending?: number;
  committedSpending?: number;
  actualSpending?: number;
  weeklyPlannedSpending?: number;
  weeklyCommittedSpending?: number;
  weeklyActualSpending?: number;
  weeklyRemainingBudget?: number;
  weeklyBudgetUtilization?: number;
  weeklyBudgetAlert?: boolean;
  monthlyActualSpending?: number;
  monthlyRemainingBudget?: number;
  monthlyBudgetUtilization?: number;
  monthlyBudgetAlert?: boolean;
}
export type BudgetSummaryDto = BudgetSummary;

export interface AnalyticsSummary {
  totalDeliveredSpend: number;
  totalCommittedSpend: number;
  totalPlannedSpend: number;
  totalDiscountSavings: number;
  averageOrderValue: number;
  totalOrdersPlaced: number;
  totalPlannedItems: number;
  timeSavedHours: number;
}
export type AnalyticsSummaryDto = AnalyticsSummary;

export interface SpendingDataPoint {
  label?: string;
  weekLabel?: string;
  planned: number;
  actual: number;
  budget?: number;
}
export type SpendingDataPointDto = SpendingDataPoint;

export interface CategorySpending {
  categoryName: string;
  amount: number;
  percentage?: number;
}
export type CategorySpendingDto = CategorySpending;

export interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  default: boolean;
  isDefault?: boolean;
}
export type AddressDto = Address;

export interface UserSettings {
  weeklyBudget: number;
  monthlyBudget: number;
  weekStartDay?: string;
  timezone?: string;
  emailNotifications?: boolean;
  budgetAlerts?: boolean;
}
export type UserSettingsDto = UserSettings;

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  deepLink?: string;
  read: boolean;
  createdAt: string;
}
export type NotificationDto = Notification;

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
  correlationId?: string;
}
