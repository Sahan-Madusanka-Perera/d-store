'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { Product } from '@/types/product'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Plus, Minus, Tag } from 'lucide-react'
import { toast } from 'sonner'

interface AddToCartButtonProps {
  product: Product
  selectedSize?: string
  selectedColor?: string
}

export default function AddToCartButton({ product, selectedSize, selectedColor }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore(state => state.addItem)
  const items = useCartStore(state => state.items)
  const availableDiscounts = useCartStore(state => state.availableDiscounts)

  const handleAddToCart = () => {
    // Current category quantity in cart before adding
    const currentCategoryQty = items
      .filter(item => item.product.category === product.category)
      .reduce((sum, item) => sum + item.quantity, 0)

    // Add item to cart
    addItem(product, quantity, { size: selectedSize, color: selectedColor })

    const totalCategoryQty = currentCategoryQty + quantity;

    toast.success(`Added ${quantity} ${product.name} to cart!`, {
      description: selectedSize || selectedColor ?
        `Size: ${selectedSize || 'Any'}, Color: ${selectedColor || 'Any'}` :
        undefined
    })

    // Check discounts for this category
    const categoryDiscounts = availableDiscounts
      .filter(d => d.category === product.category)
      .sort((a, b) => a.min_quantity - b.min_quantity);

    if (categoryDiscounts.length > 0) {
      // Find the next threshold the user hasn't reached yet
      const nextDiscount = categoryDiscounts.find(d => d.min_quantity > totalCategoryQty);
      // Find the threshold they just met
      const achievedDiscount = categoryDiscounts.reverse().find(d => totalCategoryQty >= d.min_quantity);

      if (achievedDiscount && currentCategoryQty < achievedDiscount.min_quantity) {
        // They just crossed a threshold!
        const value = achievedDiscount.discount_percentage ? `${achievedDiscount.discount_percentage}%` : `LKR ${achievedDiscount.discount_fixed}`;
        toast.success(`🎉 You've unlocked ${value} OFF on ${product.category}!`, {
          icon: <Tag className="w-5 h-5 text-green-500" />,
          duration: 5000,
        })
      } else if (nextDiscount) {
        // They are close to a threshold
        const needed = nextDiscount.min_quantity - totalCategoryQty;
        const value = nextDiscount.discount_percentage ? `${nextDiscount.discount_percentage}%` : `LKR ${nextDiscount.discount_fixed}`;
        toast.info(`Add ${needed} more ${product.category} to unlock ${value} OFF!`, {
          icon: <Tag className="w-5 h-5 text-blue-500" />,
        })
      }
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full">
      {/* Quantity Selector */}
      <div className="flex items-center border rounded-xl bg-white shadow-sm h-14 w-full sm:w-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
          className="h-full w-14 rounded-r-none hover:bg-gray-100"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="flex items-center justify-center h-full px-6 border-x bg-gray-50/50 min-w-[70px]">
          <span className="font-bold text-lg">{quantity}</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
          disabled={quantity >= product.stock}
          className="h-full w-14 rounded-l-none hover:bg-gray-100"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={product.stock === 0}
        className="flex-1 h-14 text-base font-black uppercase tracking-wide rounded-xl bg-black text-white hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 active:scale-[0.98]"
      >
        <ShoppingCart className="w-5 h-5 mr-3" />
        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </Button>
    </div>
  )
}