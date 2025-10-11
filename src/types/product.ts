export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'manga' | 'figures' | 'tshirts';
  images: string[];
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Category-specific fields
  // For manga
  author?: string;
  publisher?: string;
  isbn?: string;
  language?: 'english' | 'japanese' | 'sinhala';
  
  // For figures
  brand?: string;
  series?: string;
  scale?: string;
  height?: string;
  figureMaterial?: string;
  
  // For t-shirts
  sizes?: ('XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL')[];
  colors?: string[];
  fabricMaterial?: string;
  printType?: 'screen-print' | 'digital-print' | 'vinyl';
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