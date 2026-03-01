// Shared database product interface for all pages
export interface DatabaseProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: 'manga' | 'figures' | 'tshirts';
  stock: number;
  created_at: string;
  updated_at: string;
  author?: string;
  brand?: string;
  sizes?: ('XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL')[];
  colors?: string[];
  image_url?: string;
  image_urls?: string[];
}

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  cta_text: string;
  link_url: string;
  bg_class: string;
  bg_color?: string | null;
  image_alignment?: 'left' | 'right';
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface QuantityDiscount {
  id: string;
  category: 'manga' | 'figures' | 'tshirts';
  min_quantity: number;
  discount_percentage?: number;
  discount_fixed?: number;
  is_active: boolean;
  created_at: string;
}