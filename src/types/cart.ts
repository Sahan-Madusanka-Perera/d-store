import { Product } from './product';
import type { QuantityDiscount, PublisherDiscount } from './database';

export type PaymentMethod = 'bank_transfer';

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  priceAtTime: number; // Price when added to cart
  paymentMethod: PaymentMethod; // Always bank_transfer
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
  availablePublisherDiscounts: PublisherDiscount[]; // Fetched from DB
  createdAt: string;
  updatedAt: string;
}

export interface CartActions {
  addItem: (product: Product, quantity?: number, options?: { size?: string; color?: string }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  fetchAvailableDiscounts: () => Promise<void>;
  evaluateDiscounts: () => void;
}