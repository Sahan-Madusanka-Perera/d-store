import { Product } from './product';
import type { QuantityDiscount } from './database';

export type PaymentMethod = 'cod' | 'bank_transfer';

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  priceAtTime: number; // Price when added to cart
  paymentMethod: PaymentMethod; // Payment method for this specific item
}

export interface Cart {
  id: string;
  userId?: string; // null for guest carts
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  discountTotal: number;
  appliedDiscounts: Array<{
    discountId: string;
    description: string;
    amountOff: number;
  }>;
  availableDiscounts: QuantityDiscount[]; // Fetched from DB to evaluate against cart
  createdAt: string;
  updatedAt: string;
}

export interface CartActions {
  addItem: (product: Product, quantity?: number, options?: { size?: string; color?: string; paymentMethod?: PaymentMethod }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updatePaymentMethod: (itemId: string, paymentMethod: PaymentMethod) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalByPaymentMethod: (paymentMethod: PaymentMethod) => number;
  fetchAvailableDiscounts: () => Promise<void>;
  evaluateDiscounts: () => void;
}