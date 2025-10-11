import { CartItem } from './cart';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  phone: string;
  email: string;
}

export interface Order {
  id: string;
  userId?: string;
  orderNumber: string;
  items: CartItem[];
  
  // Pricing
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  
  // Status
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  
  // Customer info
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  
  // Payment
  paymentMethod: 'payhere' | 'cod'; // Cash on Delivery popular in SL
  paymentId?: string; // PayHere payment reference
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface OrderFilters {
  status?: Order['status'];
  paymentStatus?: Order['paymentStatus'];
  dateRange?: {
    from: string;
    to: string;
  };
}