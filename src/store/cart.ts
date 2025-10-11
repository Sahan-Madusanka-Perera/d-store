import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Cart, CartItem, CartActions } from '@/types/cart';

interface CartStore extends Cart, CartActions {}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      id: 'guest-cart',
      userId: undefined,
      items: [],
      totalAmount: 0,
      totalItems: 0,
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
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalAmount: 0,
          updatedAt: new Date().toISOString(),
        });
      },

      getTotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);
      },
    }),
    {
      name: 'd-store-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);