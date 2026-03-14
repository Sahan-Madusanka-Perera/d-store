import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';

interface WishlistItem {
  id: string;
  product_id: number;
  added_at: string;
  notify_on_available: boolean;
  products: {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    status: string;
    image_url: string | null;
    image_urls: string[] | null;
    author: string | null;
    brand: string | null;
    publisher: string | null;
    series: string | null;
    character_names: string[] | null;
  };
}

interface WishlistStore {
  items: WishlistItem[];
  productIds: Set<number>;
  isLoading: boolean;
  isAuthenticated: boolean | null;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: number) => Promise<boolean>;
  removeFromWishlist: (productId: number) => Promise<boolean>;
  isInWishlist: (productId: number) => boolean;
  checkAuth: () => Promise<boolean>;
}

export const useWishlistStore = create<WishlistStore>()((set, get) => ({
  items: [],
  productIds: new Set<number>(),
  isLoading: false,
  isAuthenticated: null,

  checkAuth: async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isAuth = !!user;
    set({ isAuthenticated: isAuth });
    return isAuth;
  },

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/wishlist');
      if (res.status === 401) {
        set({ items: [], productIds: new Set(), isAuthenticated: false, isLoading: false });
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch wishlist');

      const data = await res.json();
      const items: WishlistItem[] = data.wishlistItems || [];
      const productIds = new Set<number>(items.map(item => item.product_id));

      set({ items, productIds, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      set({ isLoading: false });
    }
  },

  addToWishlist: async (productId: number) => {
    // Optimistic update
    const prev = get().productIds;
    set({ productIds: new Set([...prev, productId]) });

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });

      if (res.status === 401) {
        // Revert
        set({ productIds: prev, isAuthenticated: false });
        return false;
      }

      if (!res.ok && res.status !== 409) {
        // Revert on real error (409 = already exists, which is fine)
        set({ productIds: prev });
        return false;
      }

      // Refresh full list
      get().fetchWishlist();
      return true;
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      set({ productIds: prev });
      return false;
    }
  },

  removeFromWishlist: async (productId: number) => {
    // Optimistic update
    const prev = get().productIds;
    const prevItems = get().items;
    const newIds = new Set(prev);
    newIds.delete(productId);
    set({
      productIds: newIds,
      items: prevItems.filter(item => item.product_id !== productId),
    });

    try {
      const res = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });

      if (!res.ok) {
        // Revert
        set({ productIds: prev, items: prevItems });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      set({ productIds: prev, items: prevItems });
      return false;
    }
  },

  isInWishlist: (productId: number) => {
    return get().productIds.has(productId);
  },
}));
