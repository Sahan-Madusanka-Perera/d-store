'use client';

import { useCartStore } from '@/store/cart';
import Image from 'next/image';
import Link from 'next/link';
import { SHIPPING_RATES } from '@/lib/constants';
import { ShoppingBag, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Tag } from 'lucide-react';

export default function CartPage() {
  const {
    items,
    totalAmount,
    discountTotal,
    appliedDiscounts,
    removeItem,
    updateQuantity,
    clearCart,
    updatePaymentMethod,
    getTotalByPaymentMethod
  } = useCartStore();

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
  const finalTotal = totalAmount - discountTotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-muted/30 rounded-3xl">
            <ShoppingCart className="h-20 w-20 text-muted-foreground/40" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto">Looks like you haven't added anything to your cart yet.</p>
        <Button size="lg" asChild className="shadow-lg hover:shadow-xl">
          <Link href="/products">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Start Shopping
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>
        <Button
          onClick={clearCart}
          variant="ghost"
          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
        >
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-card border border-border/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6">
              <div className="flex items-start gap-5">
                <div className="relative w-24 h-24 bg-muted/30 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                  <Image
                    src={item.product.images[0] || '/placeholder.svg'}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1.5 text-base">{item.product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 capitalize">{item.product.category}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.selectedSize && (
                      <span className="text-xs bg-muted/50 px-3 py-1.5 rounded-md font-medium">
                        Size: {item.selectedSize}
                      </span>
                    )}
                    {item.selectedColor && (
                      <span className="text-xs bg-muted/50 px-3 py-1.5 rounded-md font-medium">
                        Color: {item.selectedColor}
                      </span>
                    )}
                  </div>

                  {/* Payment Method Selection */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground font-medium">Payment:</span>
                    <select
                      value={item.paymentMethod}
                      onChange={(e) => updatePaymentMethod(item.id, e.target.value as 'cod' | 'bank_transfer')}
                      className="text-sm border border-border/60 rounded-lg px-3 py-2 bg-card shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                    >
                      <option value="cod">Cash on Delivery</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 sm:mt-0">
                  <div className="flex items-center border border-border/60 rounded-lg shadow-sm bg-card overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-4 py-2 hover:bg-muted/50 transition-colors font-medium text-foreground"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 border-x border-border/60 font-semibold min-w-[3rem] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-4 py-2 hover:bg-muted/50 transition-colors font-medium text-foreground"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-left sm:text-right flex-shrink-0">
                    <div className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{formatPrice(item.priceAtTime * item.quantity)}</div>
                    <div className="text-sm text-muted-foreground">{formatPrice(item.priceAtTime)} each</div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-destructive hover:text-destructive/80 p-2 hover:bg-destructive/10 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary - Elegant */}
      <div className="lg:col-span-1">
        <div className="bg-card border border-border/50 rounded-xl shadow-lg p-8 sticky top-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">Order Summary</h2>

          <div className="space-y-4 mb-6">
            {/* Payment Method Breakdown */}
            {getTotalByPaymentMethod('cod') > 0 && (
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2.5 text-sm">
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 font-medium">COD</Badge>
                  <span className="text-muted-foreground">Cash on Delivery</span>
                </span>
                <span className="font-semibold">{formatPrice(getTotalByPaymentMethod('cod'))}</span>
              </div>
            )}

            {getTotalByPaymentMethod('bank_transfer') > 0 && (
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2.5 text-sm">
                  <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 font-medium">Bank</Badge>
                  <span className="text-muted-foreground">Bank Transfer</span>
                </span>
                <span className="font-semibold">{formatPrice(getTotalByPaymentMethod('bank_transfer'))}</span>
              </div>
            )}

            <div className="flex justify-between pt-3 border-t border-border/50">
              <span className="text-muted-foreground">Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
              <span className="font-semibold">{formatPrice(totalAmount)}</span>
            </div>

            {appliedDiscounts.length > 0 && (
              <div className="space-y-2 py-2 border-y border-border/50 bg-green-50/50 -mx-4 px-4 rounded-lg my-3">
                {appliedDiscounts.map((discount, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-1.5 text-green-700 font-medium">
                      <Tag className="w-3.5 h-3.5" />
                      {discount.description}
                    </span>
                    <span className="font-bold text-green-700">-{formatPrice(discount.amountOff)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-semibold pt-1">
                  <span>Discount Included</span>
                  <span className="text-green-700">-{formatPrice(discountTotal)}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              {shippingCost === 0 ? (
                <span className="text-emerald-600 font-semibold">FREE</span>
              ) : (
                <span className="font-semibold">{formatPrice(shippingCost)}</span>
              )}
            </div>

            {totalAmount < SHIPPING_RATES.FREE_SHIPPING_THRESHOLD && (
              <div className="text-sm text-primary bg-primary/5 border border-primary/20 p-4 rounded-lg font-medium">
                Add {formatPrice(SHIPPING_RATES.FREE_SHIPPING_THRESHOLD - totalAmount)} more for FREE shipping!
              </div>
            )}

            <div className="border-t border-border/50 pt-4 mt-2">
              <div className="flex justify-between text-xl font-bold">
                <span className="text-foreground">Total</span>
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>

          <Button size="lg" asChild className="w-full mb-3 shadow-md hover:shadow-lg">
            <Link href="/checkout">
              Proceed to Checkout
            </Link>
          </Button>

          <Button variant="outline" size="lg" asChild className="w-full">
            <Link href="/products">
              Continue Shopping
            </Link>
          </Button>

          {/* Payment Methods */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <h3 className="text-sm font-semibold text-foreground mb-4">We Accept</h3>
            <div className="flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 font-medium px-3 py-1.5">
                PayHere
              </Badge>
              <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 font-medium px-3 py-1.5">
                Cash on Delivery
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
