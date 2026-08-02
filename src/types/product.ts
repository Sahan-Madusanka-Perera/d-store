export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'manga' | 'figures' | 'tshirts' | 'other';
  images: string[];
  stock: number;
  status?: 'available' | 'coming_soon' | 'pre_order' | 'out_of_stock';
  /** Hidden from logged-out visitors — see src/lib/product-visibility.ts */
  membersOnly?: boolean;
  /** Opted in to the bundle rule — see src/lib/bundle-discount.ts */
  discountEligible?: boolean;
  /** Reference price struck through above `price`. Only rendered when above it. */
  compareAtPrice?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Tagging & Ratings
  tags?: string[];
  series?: string;
  characterNames?: string[];
  externalRating?: number;
  externalRatingCount?: number;

  // Category-specific fields
  // For manga
  author?: string;
  publisher?: string;
  isbn?: string;
  language?: 'english' | 'japanese' | 'sinhala';

  // For figures
  brand?: string;
  scale?: string;
  height?: string;
  figureMaterial?: string;

  // For t-shirts
  sizes?: ('XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL')[];
  colors?: string[];
  fabricMaterial?: string;
  printType?: 'screen-print' | 'digital-print' | 'vinyl';
  specifications?: Record<string, any>;
}

export interface ProductFilters {
  category?: Product['category'];
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  search?: string;
}