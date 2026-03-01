'use client';

import { Package, ShoppingCart, Mail, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

export default function DashboardActions() {
    const handleDeployNewProduct = () => {
        // Trigger Radix UI Tab change from 'overview' to 'products'
        const productsTabTrigger = document.querySelector<HTMLButtonElement>('[data-state="inactive"][value="products"]');
        if (productsTabTrigger) {
            productsTabTrigger.click();
            // Automatically click 'Add Product' too
            setTimeout(() => {
                const addProductBtn = document.querySelector<HTMLButtonElement>('button:has(.lucide-plus)');
                if (addProductBtn && addProductBtn.textContent?.includes('Add Product')) {
                    addProductBtn.click();
                }
            }, 100);
        } else {
            console.warn('Products tab trigger not found');
        }
    };

    const handleProcessOrders = (e: React.MouseEvent) => {
        e.preventDefault();
        toast.info("Process Orders module is not yet implemented.");
    };

    return (
        <div className="space-y-3">
            <Button
                onClick={handleDeployNewProduct}
                className="w-full bg-black text-white hover:bg-gray-900 border border-transparent hover:border-gray-700 h-12 shadow-md"
            >
                <Package className="h-4 w-4 mr-2" />
                Deploy New Product
            </Button>

            {/* Enabled Process Orders */}
            <Button className="w-full bg-white text-black hover:bg-gray-50 border-2 border-black h-12 shadow-sm" asChild>
                <Link href="/admin/orders">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Process Orders
                </Link>
            </Button>

            <Button className="w-full bg-white text-black hover:bg-gray-50 border border-gray-200 h-12 shadow-sm" asChild>
                <Link href="/admin/newsletter">
                    <Mail className="h-4 w-4 mr-2" />
                    Manage Newsletter
                </Link>
            </Button>

            <Button className="w-full bg-white text-black hover:bg-gray-50 border border-gray-200 h-12 shadow-sm" asChild>
                <Link href="/admin/discounts">
                    <Tag className="h-4 w-4 mr-2" />
                    Manage Discounts
                </Link>
            </Button>
        </div>
    );
}
