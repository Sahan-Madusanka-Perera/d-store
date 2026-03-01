import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, CreditCard, Clock } from 'lucide-react';
import Link from 'next/link';
import NewsletterSettings from '@/components/profile/NewsletterSettings';

export default async function ProfileDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch real profile data
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Fetch recent orders count
    const { data: orders, error } = await supabase
        .from('orders')
        .select('id, status, total_amount, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

    // If the error exists, it's likely because the orders table hasn't been created yet.
    // We'll handle this gracefully for now.
    const recentOrders = error ? [] : (orders || []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h2>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-gray-500">Account Type</CardTitle>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                            {profile?.role === 'admin' ? 'Administrator' : 'Customer'}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{profile?.full_name || 'Valued User'}</div>
                        <p className="text-sm text-gray-500 mt-1">Joined {new Date(profile?.created_at || user.created_at).toLocaleDateString()}</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
                        <Package className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{recentOrders.length > 0 ? recentOrders.length : 0}</div>
                        <p className="text-sm text-gray-500 mt-1">
                            <Link href="/profile/orders" className="text-primary hover:underline">
                                View all orders
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Email Preferences */}
            <NewsletterSettings />

            {/* Recent Orders Section */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium text-gray-900">Recent Orders</CardTitle>
                        <Link href="/profile/orders" className="text-sm font-medium text-primary hover:text-primary/80">
                            View All
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {error ? (
                        <div className="p-8 text-center">
                            <div className="mx-auto w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                                <Package className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">Database Setup Required</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                Please run the `database/setup-orders.sql` script into the Supabase SQL Editor to enable order tracking.
                            </p>
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <div className="p-8 text-center border-t border-gray-100">
                            <div className="mx-auto w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
                                <Package className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
                            <p className="text-gray-500 mb-4">When you place an order, it will appear here.</p>
                            <Link href="/products" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800">
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-start space-x-4">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <Package className="h-6 w-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Order {typeof order.id === 'string' && order.id.includes('-') ? `#${order.id.split('-')[0]}` : `#${order.id}`}
                                            </p>
                                            <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                                                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(order.created_at).toLocaleDateString()}</span>
                                                <span className="font-semibold text-gray-900">{formatPrice(order.total_amount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <Badge className={`
                        ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' : ''}
                      ${order.status === 'processing' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
                      ${order.status === 'shipped' ? 'bg-purple-100 text-purple-800 hover:bg-purple-100' : ''}
                      ${order.status === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : ''}
                      ${order.status === 'cancelled' ? 'bg-red-100 text-red-800 hover:bg-red-100' : ''}
                      capitalize shadow-none
                    `}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
