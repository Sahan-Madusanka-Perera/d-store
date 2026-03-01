import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, Truck, FileText } from 'lucide-react';
import Link from 'next/link';

export default async function OrdersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch orders with their items
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
      *,
      order_items (
        id,
        quantity,
        price_at_time,
        products (
          name,
          image_url
        )
      )
    `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-amber-100 text-amber-800 border-amber-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">Order History</h2>
                <Badge variant="secondary" className="px-3 py-1">
                    {orders?.length || 0} Orders
                </Badge>
            </div>

            {error ? (
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-12 text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                            <FileText className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Supabase Query Error</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-6">
                            An error occurred while fetching your orders:
                        </p>
                        <div className="bg-red-50 text-red-800 p-4 rounded-md text-sm text-left font-mono mb-6 overflow-x-auto">
                            {JSON.stringify(error, null, 2)}
                        </div>
                    </CardContent>
                </Card>
            ) : !orders || orders.length === 0 ? (
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-12 text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
                            <Package className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">
                            You haven't placed any orders yet. Browse our catalog to discover amazing merch!
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors"
                        >
                            Start Shopping
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <Card key={order.id} className="border-0 shadow-sm overflow-hidden">
                            {/* Order Header */}
                            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Order Placed</p>
                                        <p className="text-sm font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total</p>
                                        <p className="text-sm font-medium text-gray-900">{formatPrice(order.total_amount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Ship To</p>
                                        <p className="text-sm font-medium text-primary hover:underline cursor-pointer truncate max-w-[150px]" title={typeof order.shipping_address === 'string' ? order.shipping_address : order.shipping_address?.street || JSON.stringify(order.shipping_address)}>
                                            {typeof order.shipping_address === 'string'
                                                ? order.shipping_address.split(',')[0]
                                                : order.shipping_address?.street?.split(',')[0] || 'Address Provided'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start sm:items-end">
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1 text-right w-full">Order #</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {typeof order.id === 'string' && order.id.includes('-')
                                            ? `...${order.id.split('-')[4]}`
                                            : `#${order.id}`}
                                    </p>
                                </div>
                            </div>

                            {/* Order Status & Items */}
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-2">
                                        {order.status === 'delivered' ? <Package className="h-5 w-5 text-emerald-600" /> : <Truck className="h-5 w-5 text-gray-400" />}
                                        <h4 className="text-lg font-medium text-gray-900">
                                            {order.status === 'delivered' ? 'Delivered' : order.status === 'shipped' ? 'On the way' : 'Preparing for shipment'}
                                        </h4>
                                    </div>
                                    <Badge variant="outline" className={`capitalize ${getStatusColor(order.status)} border shadow-sm`}>
                                        {order.status}
                                    </Badge>
                                </div>

                                <div className="space-y-4 divide-y divide-gray-100">
                                    {order.order_items?.map((item: any) => (
                                        <div key={item.id} className="pt-4 first:pt-0 flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                                    {item.products?.image_url ? (
                                                        <img src={item.products.image_url} alt={item.products.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-gray-400"><Package className="h-8 w-8" /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                                                        {item.products?.name || 'Unknown Product'}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatPrice(item.price_at_time * item.quantity)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer Actions */}
                                <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
                                    <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                        Track Package
                                    </button>
                                    <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                        View Invoice
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
