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

// Bank Slip types
export type BankSlipStatus = 'pending' | 'verified' | 'rejected';
export type SlipUploadMethod = 'website' | 'whatsapp';

export interface BankSlip {
  id: string;
  order_id: number;
  slip_url: string;
  uploaded_via: SlipUploadMethod;
  status: BankSlipStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
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
  paymentMethod: 'bank_transfer';
  paymentId?: string;
  
  // Bank slips
  bank_slips?: BankSlip[];
  
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