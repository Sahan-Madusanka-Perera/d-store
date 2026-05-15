'use client';

import { useEffect, useState } from 'react';
import { useWishlistStore } from '@/store/wishlist';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface WishlistButtonProps {
  productId: string | number;
  variant?: 'icon' | 'full';
  className?: string;
}

export default function WishlistButton({ productId, variant = 'icon', className = '' }: WishlistButtonProps) {
  const router = useRouter();
  const numericId = typeof productId === 'string' ? parseInt(productId, 10) : productId;

  const isInWishlist = useWishlistStore(state => state.isInWishlist(numericId));
  const addToWishlist = useWishlistStore(state => state.addToWishlist);
  const removeFromWishlist = useWishlistStore(state => state.removeFromWishlist);
  const fetchWishlist = useWishlistStore(state => state.fetchWishlist);
  const checkAuth = useWishlistStore(state => state.checkAuth);
  const isAuthenticated = useWishlistStore(state => state.isAuthenticated);

  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch wishlist on mount if not already loaded
  useEffect(() => {
    if (isAuthenticated === null) {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check auth first
    const isAuth = await checkAuth();
    if (!isAuth) {
      toast.info('Please log in to add items to your wishlist', {
        action: {
          label: 'Log In',
          onClick: () => router.push('/login'),
        },
      });
      return;
    }

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    if (isInWishlist) {
      const success = await removeFromWishlist(numericId);
      if (success) {
        toast.success('Removed from wishlist');
      } else {
        toast.error('Failed to remove from wishlist');
      }
    } else {
      const success = await addToWishlist(numericId);
      if (success) {
        toast.success('Added to wishlist!', {
          description: 'You can view your wishlist in your profile',
          action: {
            label: 'View Wishlist',
            onClick: () => router.push('/profile/wishlist'),
          },
        });
      } else {
        toast.error('Failed to add to wishlist');
      }
    }
  };

  if (variant === 'icon') {
    return (
      <Button
        size="icon"
        variant="secondary"
        className={`h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-md border-0 transition-all duration-300 ${isAnimating ? 'scale-125' : ''} ${className}`}
        onClick={handleToggle}
        title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          className={`h-4 w-4 transition-all duration-300 ${
            isInWishlist
              ? 'text-rose-500 fill-rose-500'
              : 'text-foreground'
          }`}
        />
      </Button>
    );
  }

  // Full variant — for product detail page
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`hover:bg-primary/5 w-fit transition-all duration-300 ${isAnimating ? 'scale-105' : ''} ${className}`}
      onClick={handleToggle}
    >
      <Heart
        className={`h-4 w-4 mr-2 transition-all duration-300 ${
          isInWishlist
            ? 'text-rose-500 fill-rose-500'
            : 'text-rose-500 fill-rose-500/10'
        }`}
      />
      {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
    </Button>
  );
}
