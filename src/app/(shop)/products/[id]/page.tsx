'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart';
import { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Sample products data (in real app, this would come from API/database)
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Naruto Volume 1',
    description: 'The first volume of the legendary ninja manga series that started it all. Follow young Naruto Uzumaki as he begins his journey to become the strongest ninja and leader of his village. This volume introduces the world of Hidden Leaf Village and the beginning of an epic adventure.',
    price: 1500,
    category: 'manga',
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    stock: 10,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    author: 'Masashi Kishimoto',
    publisher: 'Viz Media',
    language: 'english',
    isbn: '978-1-4215-9876-5'
  },
  {
    id: '2',
    name: 'Luffy Gear 5 Figure',
    description: 'Premium quality Monkey D. Luffy Gear 5 transformation figure featuring the legendary Sun God Nika form. This highly detailed collectible captures Luffy in his most powerful transformation with dynamic pose and premium paint application.',
    price: 12500,
    category: 'figures',
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
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
    id: '3',
    name: 'One Piece Straw Hat Crew Tee',
    description: 'Show your love for the Straw Hat Pirates with this premium quality cotton t-shirt. Features the iconic Jolly Roger design with high-quality screen printing that won&apos;t fade or crack. Perfect for any One Piece fan.',
    price: 2800,
    category: 'tshirts',
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    stock: 25,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Navy Blue', 'White'],
    fabricMaterial: '100% Cotton',
    printType: 'screen-print'
  },
  {
    id: '4',
    name: 'Attack on Titan Final Volume',
    description: 'The epic conclusion to Hajime Isayama&apos;s masterpiece. Witness the final battle between humanity and titans in this emotional and action-packed finale that will leave you breathless.',
    price: 1800,
    category: 'manga',
    images: ['/placeholder.svg', '/placeholder.svg'],
    stock: 8,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    author: 'Hajime Isayama',
    publisher: 'Kodansha',
    language: 'english',
    isbn: '978-1-6327-1234-7'
  }
];

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    // Simulate API call
    const foundProduct = sampleProducts.find(p => p.id === id);
    setProduct(foundProduct || null);
    setLoading(false);
    
    // Set default selections for t-shirts
    if (foundProduct?.category === 'tshirts') {
      if (foundProduct.sizes && foundProduct.sizes.length > 0) {
        setSelectedSize(foundProduct.sizes[0]);
      }
      if (foundProduct.colors && foundProduct.colors.length > 0) {
        setSelectedColor(foundProduct.colors[0]);
      }
    }
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const options: { size?: string; color?: string } = {};
    if (selectedSize) options.size = selectedSize;
    if (selectedColor) options.color = selectedColor;
    
    addItem(product, quantity, options);
    
    // Show success message (you could use a toast library here)
    alert(`Added ${quantity} ${product.name} to cart!`);
  };

  const canAddToCart = () => {
    if (!product || product.stock === 0) return false;
    
    // For t-shirts, require size and color selection
    if (product.category === 'tshirts') {
      return selectedSize && selectedColor;
    }
    
    return true;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-8">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Link 
          href="/products"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
          <li className="text-gray-400">/</li>
          <li><Link href="/products" className="hover:text-blue-600">Products</Link></li>
          <li className="text-gray-400">/</li>
          <li><Link href={`/${product.category}`} className="hover:text-blue-600 capitalize">{product.category}</Link></li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 truncate">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="relative aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
            <Image
              src={product.images[selectedImage] || '/placeholder.svg'}
              alt={product.name}
              fill
              className="object-cover"
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">Out of Stock</span>
              </div>
            )}
          </div>
          
          {/* Image Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex space-x-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-blue-600' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-6">
            <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm mb-3 capitalize">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-2xl font-bold text-blue-600 mb-4">{formatPrice(product.price)}</p>
            <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>
          </div>

          {/* Category-specific Information */}
          {product.category === 'manga' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Manga Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.author && <div><span className="text-gray-600">Author:</span> {product.author}</div>}
                {product.publisher && <div><span className="text-gray-600">Publisher:</span> {product.publisher}</div>}
                {product.language && <div><span className="text-gray-600">Language:</span> {product.language}</div>}
                {product.isbn && <div><span className="text-gray-600">ISBN:</span> {product.isbn}</div>}
              </div>
            </div>
          )}

          {product.category === 'figures' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Figure Specifications</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.brand && <div><span className="text-gray-600">Brand:</span> {product.brand}</div>}
                {product.series && <div><span className="text-gray-600">Series:</span> {product.series}</div>}
                {product.scale && <div><span className="text-gray-600">Scale:</span> {product.scale}</div>}
                {product.height && <div><span className="text-gray-600">Height:</span> {product.height}</div>}
                {product.figureMaterial && <div><span className="text-gray-600">Material:</span> {product.figureMaterial}</div>}
              </div>
            </div>
          )}

          {/* T-shirt Options */}
          {product.category === 'tshirts' && (
            <div className="mb-6 space-y-4">
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size *</label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-md ${
                          selectedSize === size
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border rounded-md ${
                          selectedColor === color
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">T-Shirt Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {product.fabricMaterial && <div><span className="text-gray-600">Material:</span> {product.fabricMaterial}</div>}
                  {product.printType && <div><span className="text-gray-600">Print Type:</span> {product.printType}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-600">
                {product.stock} available
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            
            {product.category === 'tshirts' && (!selectedSize || !selectedColor) && (
              <p className="text-sm text-gray-600 text-center">
                Please select size and color to add to cart
              </p>
            )}

            <div className="flex space-x-4">
              <Link
                href="/cart"
                className="flex-1 bg-gray-100 text-gray-900 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors text-center"
              >
                View Cart
              </Link>
              <Link
                href="/products"
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Shipping Information</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Free shipping on orders above LKR 5,000</li>
              <li>• Island-wide delivery available</li>
              <li>• Express delivery within Colombo (1-2 days)</li>
              <li>• Standard delivery (3-5 days)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
