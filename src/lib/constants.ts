// Sri Lankan specific constants
export const SL_PROVINCES = [
  'Western',
  'Central',
  'Southern',
  'Northern', 
  'Eastern',
  'North Western',
  'North Central',
  'Uva',
  'Sabaragamuwa'
] as const;

export const SHIPPING_RATES = {
  COLOMBO: 300, // LKR
  WESTERN_PROVINCE: 400,
  OTHER_PROVINCES: 500,
  FREE_SHIPPING_THRESHOLD: 5000 // Free shipping above 5000 LKR
} as const;

export const PRODUCT_CATEGORIES = {
  MANGA: 'manga',
  FIGURES: 'figures', 
  TSHIRTS: 'tshirts'
} as const;

export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const;

export const PAYMENT_METHODS = {
  PAYHERE: 'payhere',
  COD: 'cod' // Cash on Delivery
} as const;

// PayHere Configuration
export const PAYHERE_CONFIG = {
  SANDBOX_URL: 'https://sandbox.payhere.lk/pay/checkout',
  LIVE_URL: 'https://www.payhere.lk/pay/checkout',
  CURRENCY: 'LKR',
  SANDBOX_MERCHANT_ID: process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID_SANDBOX,
  LIVE_MERCHANT_ID: process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID_LIVE,
  IS_SANDBOX: process.env.NODE_ENV !== 'production'
} as const;