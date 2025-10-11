import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/types/product';

// Sample products data (replace with database queries)
const sampleProducts: Product[] = [
  {
    id: 'manga-1',
    name: 'One Piece Volume 105',
    description: 'The latest adventure of the Straw Hat Pirates continues as they face new challenges in the New World.',
    price: 1650,
    category: 'manga',
    images: ['/placeholder.svg'],
    stock: 15,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    author: 'Eiichiro Oda',
    publisher: 'Viz Media',
    language: 'english',
    isbn: '978-1-4215-9876-5'
  },
  {
    id: 'figure-1',
    name: 'Monkey D. Luffy Gear 5 Figure',
    description: 'Premium quality figure of Luffy in his legendary Gear 5 transformation. Highly detailed with dynamic pose.',
    price: 12500,
    category: 'figures',
    images: ['/placeholder.svg'],
    stock: 3,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    brand: 'Banpresto',
    series: 'One Piece',
    scale: '1/8',
    height: '23cm',
    figureMaterial: 'PVC, ABS'
  },
  {
    id: 'tshirt-1',
    name: 'One Piece Straw Hat Crew Tee',
    description: 'High-quality cotton t-shirt featuring the iconic Straw Hat Pirates logo. Perfect for any One Piece fan.',
    price: 2800,
    category: 'tshirts',
    images: ['/placeholder.svg'],
    stock: 25,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Navy Blue', 'White'],
    fabricMaterial: '100% Cotton',
    printType: 'screen-print'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filteredProducts = sampleProducts;

    // Filter by category
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(
        product => product.category === category
      );
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        product => 
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.author?.toLowerCase().includes(searchLower) ||
          product.brand?.toLowerCase().includes(searchLower) ||
          product.series?.toLowerCase().includes(searchLower)
      );
    }

    // Filter only active products
    filteredProducts = filteredProducts.filter(product => product.isActive);

    // Pagination
    const total = filteredProducts.length;
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    return NextResponse.json({
      products: paginatedProducts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Admin only - Create new product
    const productData = await request.json();
    
    // TODO: Validate admin authentication
    // TODO: Validate product data
    // TODO: Save to database
    
    console.log('Creating new product:', productData);
    
    return NextResponse.json(
      { message: 'Product creation coming soon' },
      { status: 501 }
    );
    
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}