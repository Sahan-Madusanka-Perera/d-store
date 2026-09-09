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

// Customer-facing names for the stored category values.
// The database keeps the short keys ('other'); only the labels below are shown.
export const CATEGORY_LABELS: Record<string, string> = {
  manga: 'Manga',
  figures: 'Figures',
  tshirts: 'Apparel',
  other: 'Other Collectibles'
};

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

export const BRAND_NAME = 'D-Store';
export const BRAND_TAGLINE = 'The Ultimate Hobby Store';

// Public profiles. Defined once so the splash and the footer can't drift apart.
// Facebook is deliberately www. rather than web. — the web. subdomain forces the
// desktop layout, which is rough on the phones most visitors arrive on.
export const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/dstore.lk/' },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=100086961261023' },
] as const;

// Stock at or below this is flagged in the admin dashboard. Single source so the
// summary card and the "low stock" query can't drift apart.
export const LOW_STOCK_THRESHOLD = 10;

export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const;

/**
 * Custom order lifecycle. STATUS_CONFIG in CustomOrderManager renders these, and
 * PATCH /api/custom-orders validates against them — one list so a value can never be
 * offered in the dropdown and then rejected by the API.
 */
export const CUSTOM_ORDER_STATUSES = ['pending', 'contacted', 'fulfilled', 'cancelled'] as const;
export type CustomOrderStatus = (typeof CUSTOM_ORDER_STATUSES)[number];

export const PAYMENT_METHODS = {
  BANK_TRANSFER: 'bank_transfer'
} as const;

// ⚠️ FILL IN YOUR WHATSAPP NUMBER HERE (international format without +)
// Example for Sri Lanka: '94771234567'
export const WHATSAPP_NUMBER = '94769465982';

/**
 * Where customers send their bank transfer.
 *
 * The account number was hardcoded as the literal string 'XXXX XXXX XXXX' and rendered
 * on the checkout page as the account to pay into. Bank transfer is the only payment
 * method the shop accepts, so shipping that placeholder means every order arrives with
 * no way to pay for it — and the customer has no way to know the number is fake.
 *
 * It now comes from the environment, so a missing value is visible at build time and at
 * a glance on the page (see `bankDetailsConfigured`) rather than looking like data.
 * Set NEXT_PUBLIC_BANK_ACCOUNT_NUMBER before the first real order.
 *
 * NEXT_PUBLIC_ is correct here: these details are printed on the checkout page for the
 * customer to copy. They are not a secret — a bank account number is what you give
 * someone so they can pay you.
 */
export const BANK_DETAILS = {
  bankName: process.env.NEXT_PUBLIC_BANK_NAME || 'Seylan Bank',
  accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || 'B H S M Perera',
  accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || '',
  branch: process.env.NEXT_PUBLIC_BANK_BRANCH || 'Mount Lavinia',
} as const;

/**
 * False until a real account number is configured. The checkout uses this to show a
 * "contact us to pay" fallback instead of an account nobody can transfer to.
 */
export const bankDetailsConfigured: boolean =
  BANK_DETAILS.accountNumber.replace(/[^0-9]/g, '').length >= 6;

// Helper to generate WhatsApp URLs
export function getWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}