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
  BANK_TRANSFER: 'bank_transfer'
} as const;

// ⚠️ FILL IN YOUR WHATSAPP NUMBER HERE (international format without +)
// Example for Sri Lanka: '94771234567'
export const WHATSAPP_NUMBER = '94769465982';

// ⚠️ FILL IN YOUR BANK ACCOUNT DETAILS HERE
export const BANK_DETAILS = {
  bankName: 'Seylan Bank',
  accountName: 'B H S M Perera',
  accountNumber: 'XXXX XXXX XXXX',
  branch: 'Mount Lavinia',
} as const;

// Helper to generate WhatsApp URLs
export function getWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}