import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Cart, CartItem, CartActions, PaymentMethod } from '@/types/cart';
import { Product } from '@/types/product';
import { createClient } from '@/utils/supabase/client';

interface CartStore extends Cart, CartActions { }

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      id: 'guest-cart',
      userId: undefined,
      items: [],
      totalAmount: 0,
      totalItems: 0,
      discountTotal: 0,
      appliedDiscounts: [],
      availableDiscounts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      addItem: (product: import('@/types/product').Product, quantity = 1, options = {}) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(
          item =>
            item.productId === product.id &&
            item.selectedSize === options.size &&
            item.selectedColor === options.color
        );

        let newItems: CartItem[];

        if (existingItemIndex > -1) {
          // Update existing item
          newItems = items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // Add new item
          const newItem: CartItem = {
            id: `${product.id}-${Date.now()}`,
            productId: product.id,
            product,
            quantity,
            selectedSize: options.size,
            selectedColor: options.color,
            priceAtTime: product.price,
            paymentMethod: options.paymentMethod || 'cod', // Default to COD
          };
          newItems = [...items, newItem];
        }

        const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = newItems.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);

        set({
          items: newItems,
          totalItems,
          totalAmount,
          updatedAt: new Date().toISOString(),
        });
        get().evaluateDiscounts();
      },

      removeItem: (itemId) => {
        const { items } = get();
        const newItems = items.filter(item => item.id !== itemId);

        const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = newItems.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);

        set({
          items: newItems,
          totalItems,
          totalAmount,
          updatedAt: new Date().toISOString(),
        });
        get().evaluateDiscounts();
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        const { items } = get();
        const newItems = items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );

        const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = newItems.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);

        set({
          items: newItems,
          totalItems,
          totalAmount,
          updatedAt: new Date().toISOString(),
        });
        get().evaluateDiscounts();
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalAmount: 0,
          discountTotal: 0,
          appliedDiscounts: [],
          updatedAt: new Date().toISOString(),
        });
      },

      getTotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);
      },

      updatePaymentMethod: (itemId: string, paymentMethod: PaymentMethod) => {
        const { items } = get();
        const updatedItems = items.map(item =>
          item.id === itemId ? { ...item, paymentMethod } : item
        );

        set({
          items: updatedItems,
          updatedAt: new Date().toISOString(),
        });
      },

      getTotalByPaymentMethod: (paymentMethod: PaymentMethod) => {
        const { items } = get();
        return items
          .filter(item => item.paymentMethod === paymentMethod)
          .reduce((total, item) => total + (item.priceAtTime * item.quantity), 0);
      },

      fetchAvailableDiscounts: async () => {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('quantity_discounts')
            .select('*')
            .eq('is_active', true)
            .order('min_quantity', { ascending: false }); // Highest quantity threshold first

          if (!error && data) {
            set({ availableDiscounts: data });
            get().evaluateDiscounts();
          }
        } catch (error) {
          console.error("Failed to fetch available discounts:", error);
        }
      },

      evaluateDiscounts: () => {
        const { items, availableDiscounts, totalAmount } = get();

        let newDiscountTotal = 0;
        let newAppliedDiscounts: any[] = [];

        if (items.length === 0 || availableDiscounts.length === 0) {
          set({ discountTotal: 0, appliedDiscounts: [] });
          return;
        }

        // Group items by category to count quantities and sub-totals
        const categoryStats = items.reduce((acc, item) => {
          const cat = item.product.category;
          if (!acc[cat]) acc[cat] = { quantity: 0, totalValue: 0 };
          acc[cat].quantity += item.quantity;
          acc[cat].totalValue += (item.priceAtTime * item.quantity);
          return acc;
        }, {} as Record<string, { quantity: number, totalValue: number }>);

        // For each category that has active items, find the BEST applicable discount
        Object.entries(categoryStats).forEach(([category, stats]) => {
          // Discounts are already ordered by highest min_quantity first
          const applicableDiscount = availableDiscounts.find(
            d => d.category === category && stats.quantity >= d.min_quantity
          );

          if (applicableDiscount) {
            let amountOff = 0;
            let description = '';

            if (applicableDiscount.discount_percentage) {
              amountOff = (stats.totalValue * applicableDiscount.discount_percentage) / 100;
              description = `${applicableDiscount.discount_percentage}% off on ${category}`;
            } else if (applicableDiscount.discount_fixed) {
              amountOff = applicableDiscount.discount_fixed;
              description = `LKR ${applicableDiscount.discount_fixed} off on ${category}`;
            }

            if (amountOff > 0) {
              newDiscountTotal += amountOff;
              newAppliedDiscounts.push({
                discountId: applicableDiscount.id,
                description,
                amountOff
              });
            }
          }
        });

        set({
          discountTotal: newDiscountTotal,
          appliedDiscounts: newAppliedDiscounts
        });
      },
    }),
    {
      name: 'd-store-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);