'use client';

import { useEffect, useState } from 'react';
import { useWishlistStore } from '@/store/wishlist';
import { useCartStore } from '@/store/cart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2, Clock, Zap, Bell, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

export default function WishlistPage() {
    const { items, isLoading, fetchWishlist, removeFromWishlist } = useWishlistStore();
    const addCartItem = useCartStore(state => state.addItem);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getStatusBadge = (status: string, stock: number) => {
        switch (status) {
            case 'coming_soon':
                return (
                    <Badge className="bg-blue-100 text-blue-800 border-0">
                        <Clock className="h-3 w-3 mr-1" />
                        Coming Soon
                    </Badge>
                );
            case 'pre_order':
                return (
                    <Badge className="bg-violet-100 text-violet-800 border-0">
                        <Zap className="h-3 w-3 mr-1" />
                        Pre-order
                    </Badge>
                );
            case 'out_of_stock':
                return (
                    <Badge className="bg-red-100 text-red-800 border-0">
                        Out of Stock
                    </Badge>
                );
            default:
                return stock > 0 ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-0">
                        In Stock
                    </Badge>
                ) : (
                    <Badge className="bg-red-100 text-red-800 border-0">
                        Out of Stock
                    </Badge>
                );
        }
    };

    const handleAddToCart = (product: any) => {
        const cartProduct = {
            id: product.id.toString(),
            name: product.name,
            description: product.description || '',
            price: product.price,
            category: product.category as 'manga' | 'figures' | 'tshirts',
            images: product.image_urls || (product.image_url ? [product.image_url] : ['/placeholder.svg']),
            stock: product.stock,
            status: product.status,
            isActive: true,
            createdAt: '',
            updatedAt: '',
        };
        addCartItem(cartProduct, 1);
        toast.success(`Added ${product.name} to cart!`, {
            action: {
                label: 'View Cart',
                onClick: () => (window.location.href = '/cart'),
            },
        });
    };

    const handleRemove = async (productId: number, productName: string) => {
        const success = await removeFromWishlist(productId);
        if (success) {
            toast.success(`Removed ${productName} from wishlist`);
        } else {
            toast.error('Failed to remove from wishlist');
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">My Wishlist</h2>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">My Wishlist</h2>
                {items.length > 0 && (
                    <Badge variant="outline" className="text-sm">
                        {items.length} {items.length === 1 ? 'item' : 'items'}
                    </Badge>
                )}
            </div>

            {items.length === 0 ? (
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-12 text-center">
                        <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center mb-6">
                            <Heart className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-6">
                            Save items you love to your wishlist so you can easily find them later, track availability, and get notified about status changes.
                        </p>
                        <Link href="/products">
                            <Button className="bg-black hover:bg-gray-800 text-white">
                                <Package className="h-4 w-4 mr-2" />
                                Start Browsing
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => {
                        const product = item.products;
                        if (!product) return null;

                        const imageUrl = product.image_urls?.[0] || product.image_url || '/placeholder.svg';
                        const status = product.status || (product.stock === 0 ? 'out_of_stock' : 'available');

                        return (
                            <Card key={item.id} className="border-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                                <div className="flex">
                                    {/* Product Image */}
                                    <Link href={`/products/${product.id}`} className="relative w-32 h-40 flex-shrink-0 bg-gray-100 overflow-hidden">
                                        <Image
                                            src={imageUrl}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </Link>

                                    {/* Product Info */}
                                    <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <Link href={`/products/${product.id}`}>
                                                    <h3 className="font-semibold text-gray-900 hover:text-primary transition-colors text-sm line-clamp-2">
                                                        {product.name}
                                                    </h3>
                                                </Link>
                                                <button
                                                    onClick={() => handleRemove(product.id, product.name)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                                                    title="Remove from wishlist"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-2 mb-2">
                                                {getStatusBadge(status, product.stock)}
                                                <Badge variant="outline" className="text-[11px] capitalize">
                                                    {product.category}
                                                </Badge>
                                            </div>

                                            <p className="text-lg font-bold text-gray-900">
                                                {formatPrice(product.price)}
                                            </p>
                                        </div>

                                        {/* Action Button */}
                                        <div className="mt-3">
                                            {status === 'available' && product.stock > 0 ? (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAddToCart(product)}
                                                    className="w-full h-8 text-xs"
                                                >
                                                    <ShoppingCart className="h-3 w-3 mr-1" />
                                                    Add to Cart
                                                </Button>
                                            ) : status === 'pre_order' ? (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAddToCart(product)}
                                                    className="w-full h-8 text-xs bg-violet-600 hover:bg-violet-700"
                                                >
                                                    <Zap className="h-3 w-3 mr-1" />
                                                    Pre-order Now
                                                </Button>
                                            ) : status === 'coming_soon' ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled
                                                    className="w-full h-8 text-xs"
                                                >
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    Coming Soon
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled
                                                    className="w-full h-8 text-xs"
                                                >
                                                    <Bell className="h-3 w-3 mr-1" />
                                                    Out of Stock
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Added date */}
                                <div className="px-4 pb-3 pt-0">
                                    <p className="text-[11px] text-gray-400">
                                        Added {new Date(item.added_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
