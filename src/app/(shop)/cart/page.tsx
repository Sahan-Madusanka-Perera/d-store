'use client';

import { useCartStore } from '@/store/cart';
import Image from 'next/image';
import Link from 'next/link';
import { SHIPPING_RATES } from '@/lib/constants';

export default function CartPage() {
  const { items, totalAmount, removeItem, updateQuantity, clearCart } = useCartStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateShipping = () => {
    if (totalAmount >= SHIPPING_RATES.FREE_SHIPPING_THRESHOLD) return 0;
    return SHIPPING_RATES.OTHER_PROVINCES; // Default shipping rate
  };

  const shippingCost = calculateShipping();
  const finalTotal = totalAmount + shippingCost;

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
        <Link 
          href="/products"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            {items.map((item) => (
              <div key={item.id} className="flex items-center p-6 border-b last:border-b-0">
                <div className="relative w-20 h-20 bg-gray-100 rounded-lg mr-4">
                  <Image
                    src={item.product.images[0] || '/placeholder.svg'}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{item.product.category}</p>
                  
                  {item.selectedSize && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded mr-2">
                      Size: {item.selectedSize}
                    </span>
                  )}
                  {item.selectedColor && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      Color: {item.selectedColor}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 border-x">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold">{formatPrice(item.priceAtTime * item.quantity)}</div>
                    <div className="text-sm text-gray-500">{formatPrice(item.priceAtTime)} each</div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} items)</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Shipping</span>
                {shippingCost === 0 ? (
                  <span className="text-green-600 font-medium">FREE</span>
                ) : (
                  <span>{formatPrice(shippingCost)}</span>
                )}
              </div>
              
              {totalAmount < SHIPPING_RATES.FREE_SHIPPING_THRESHOLD && (
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  Add {formatPrice(SHIPPING_RATES.FREE_SHIPPING_THRESHOLD - totalAmount)} more for FREE shipping!
                </div>
              )}
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block mb-3"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/products"
              className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center block"
            >
              Continue Shopping
            </Link>

            {/* Payment Methods */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-900 mb-3">We Accept</h3>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium">
                  PayHere
                </div>
                <div className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium">
                  Cash on Delivery
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
