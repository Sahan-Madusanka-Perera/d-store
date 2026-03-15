import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/utils/supabase/server';
import OrdersClient from './OrdersClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function AdminOrdersPage() {
    await requireAdmin();
    const supabase = await createClient();

    // Fetch all orders with user info and item details
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                id,
                quantity,
                price_at_time,
                products ( name, image_url )
            ),
            bank_slips (
                id,
                slip_url,
                uploaded_via,
                status,
                admin_notes,
                created_at
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching orders:', JSON.stringify(error, null, 2));
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-black">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-black text-white border-b border-white/10 shadow-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="text-gray-400 hover:text-white transition-colors mr-2">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-black uppercase tracking-tighter">
                                    Process Orders
                                </h1>
                                <p className="text-xs text-gray-400 font-mono tracking-widest uppercase mt-0.5">Fulfillment Center</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <OrdersClient initialOrders={orders || []} />
            </div>
        </div>
    );
}
