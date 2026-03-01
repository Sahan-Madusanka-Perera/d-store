'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cart';
import { SL_PROVINCES, SHIPPING_RATES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CheckoutPage() {
  const { items, totalAmount, getTotalByPaymentMethod } = useCartStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    paymentMethod: 'payhere'
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateShipping = () => {
    if (totalAmount >= SHIPPING_RATES.FREE_SHIPPING_THRESHOLD) return 0;
    if (formData.province === 'Western' && formData.city.toLowerCase().includes('colombo')) {
      return SHIPPING_RATES.COLOMBO;
    }
    if (formData.province === 'Western') {
      return SHIPPING_RATES.WESTERN_PROVINCE;
    }
    return SHIPPING_RATES.OTHER_PROVINCES;
  };

  const shippingCost = calculateShipping();
  const finalTotal = totalAmount + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle checkout logic here
    alert('Checkout functionality coming soon!');
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <h1 className="text-3xl font-bold text-foreground mb-4">No items to checkout</h1>
        <p className="text-muted-foreground text-lg">Your cart is empty. Add some items first!</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-foreground mb-2">Checkout</h1>
        <p className="text-muted-foreground">Complete your order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form - Elegant */}
        <div className="bg-card border border-border/50 rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full border border-border/60 rounded-lg px-4 py-2.5 bg-card shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full border border-border/60 rounded-lg px-4 py-2.5 bg-card shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-border/60 rounded-lg px-4 py-2.5 bg-card shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+94 70 123 4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border border-border/60 rounded-lg px-4 py-2.5 bg-card shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address - Elegant */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Shipping Address</h2>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="Street address, apartment, suite, etc."
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full border border-border/60 rounded-lg px-4 py-2.5 bg-card shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full border border-border/60 rounded-lg px-4 py-2.5 bg-card shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Province *
                  </label>
                  <select
                    name="province"
                    required
                    value={formData.province}
                    onChange={handleInputChange}
                    className="w-full border border-border/60 rounded-lg px-4 py-2.5 bg-card shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                  >
                    <option value="">Select Province</option>
                    {SL_PROVINCES.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full border border-border/60 rounded-lg px-4 py-2.5 bg-card shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method - Elegant */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Payment Method</h2>
              <div className="space-y-4">
                <label className="flex items-start p-5 border-2 border-border/60 rounded-xl cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="payhere"
                    checked={formData.paymentMethod === 'payhere'}
                    onChange={handleInputChange}
                    className="mt-1 mr-4 w-4 h-4 text-primary focus:ring-primary/20"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-foreground mb-1">PayHere Online Payment</div>
                    <div className="text-sm text-muted-foreground">Pay securely with credit/debit cards or digital wallets</div>
                  </div>
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 font-semibold">Recommended</Badge>
                </label>
                
                <label className="flex items-start p-5 border-2 border-border/60 rounded-xl cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                    className="mt-1 mr-4 w-4 h-4 text-primary focus:ring-primary/20"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-foreground mb-1">Cash on Delivery (COD)</div>
                    <div className="text-sm text-muted-foreground">Pay when you receive your order</div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 font-semibold">Popular</Badge>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full shadow-lg hover:shadow-xl text-base font-semibold"
            >
              Place Order - {formatPrice(finalTotal)}
            </Button>
          </form>
        </div>

        {/* Order Summary - Elegant */}
        <div className="bg-card border border-border/50 rounded-xl shadow-lg p-8 h-fit sticky top-4">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Order Summary</h2>
          
          {/* Items */}
          <div className="space-y-4 mb-6 max-h-80 overflow-y-auto scrollbar-hide">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-border/30 last:border-0">
                <div className="w-14 h-14 bg-muted/30 rounded-lg flex-shrink-0 shadow-sm"></div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground truncate">{item.product.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                    <span>Qty: {item.quantity}</span>
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      {item.paymentMethod === 'cod' ? 'COD' : 'Bank'}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm font-bold">{formatPrice(item.priceAtTime * item.quantity)}</div>
              </div>
            ))}
          </div>
          
          {/* Pricing - Elegant */}
          <div className="border-t border-border/50 pt-5 space-y-3">
            {/* Payment Method Breakdown */}
            {getTotalByPaymentMethod('cod') > 0 && (
              <div className="flex justify-between text-sm items-center">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-xs">COD</Badge>
                  Cash on Delivery
                </span>
                <span className="font-semibold">{formatPrice(getTotalByPaymentMethod('cod'))}</span>
              </div>
            )}
            
            {getTotalByPaymentMethod('bank_transfer') > 0 && (
              <div className="flex justify-between text-sm items-center">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 text-xs">Bank</Badge>
                  Bank Transfer
                </span>
                <span className="font-semibold">{formatPrice(getTotalByPaymentMethod('bank_transfer'))}</span>
              </div>
            )}
            
            <div className="flex justify-between border-t border-border/30 pt-3">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              {shippingCost === 0 ? (
                <span className="text-emerald-600 font-semibold">FREE</span>
              ) : (
                <span className="font-semibold">{formatPrice(shippingCost)}</span>
              )}
            </div>
            {totalAmount < SHIPPING_RATES.FREE_SHIPPING_THRESHOLD && (
              <div className="text-xs text-primary bg-primary/5 border border-primary/20 p-3 rounded-lg font-medium">
                Add {formatPrice(SHIPPING_RATES.FREE_SHIPPING_THRESHOLD - totalAmount)} more for FREE shipping!
              </div>
            )}
            <div className="flex justify-between text-xl font-bold border-t border-border/50 pt-4 mt-2">
              <span className="text-foreground">Total</span>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
