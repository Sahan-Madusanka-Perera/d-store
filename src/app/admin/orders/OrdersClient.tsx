'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, Package, ChevronDown, ChevronUp, MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
    const [orders, setOrders] = useState(initialOrders);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [updatingStatusFor, setUpdatingStatusFor] = useState<string | null>(null);

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
            case 'confirmed': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-amber-100 text-amber-800 border-amber-200'; // pending
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setUpdatingStatusFor(orderId);
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update order');
            }

            // Update local state
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            toast.success(`Order status updated to ${newStatus}`);
        } catch (error: any) {
            toast.error(error.message);
            console.error(error);
        } finally {
            setUpdatingStatusFor(null);
        }
    };

    const parseAddress = (addressData: any) => {
        if (!addressData) return 'No Address provided';
        if (typeof addressData === 'string') return addressData;
        const parts = [addressData.address || addressData.street, addressData.city, addressData.province].filter(Boolean);
        return parts.join(', ') || 'Partial Address Included';
    };

    const filteredOrders = orders.filter(order =>
        String(order.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.shipping_address?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-white rounded-2xl overflow-hidden">
                <CardHeader className="bg-gray-50/80 border-b border-gray-100 pb-6 px-8 pt-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl font-black uppercase tracking-tight text-gray-900 flex items-center gap-2">
                                <ShoppingCart className="h-6 w-6 text-black" />
                                Order Registry
                            </CardTitle>
                            <CardDescription className="text-gray-500 font-medium text-base mt-1">
                                Manage customer orders and update fulfillment statuses.
                            </CardDescription>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search short ID or Email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 border-gray-200 focus:border-black focus:ring-1 focus:ring-black bg-white shadow-sm h-11 rounded-xl w-full"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-16 bg-white">
                            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No Orders Found</h3>
                            <p className="text-gray-500 font-medium">Try adjusting your search criteria.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-white">
                                    <TableRow className="border-b-2 border-gray-100 hover:bg-transparent">
                                        <TableHead className="font-bold text-gray-900 uppercase tracking-wider text-xs px-6 py-4">Order Details</TableHead>
                                        <TableHead className="font-bold text-gray-900 uppercase tracking-wider text-xs px-6 py-4">Customer</TableHead>
                                        <TableHead className="font-bold text-gray-900 uppercase tracking-wider text-xs px-6 py-4 text-right">Amount</TableHead>
                                        <TableHead className="font-bold text-gray-900 uppercase tracking-wider text-xs px-6 py-4 text-center">Status</TableHead>
                                        <TableHead className="font-bold text-gray-900 uppercase tracking-wider text-xs px-6 py-4"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map((order) => {
                                        const isExpanded = expandedOrder === order.id;
                                        return (
                                            <React.Fragment key={order.id}>
                                                <TableRow className={`hover:bg-gray-50/50 transition-colors cursor-pointer border-b border-gray-100 ${isExpanded ? 'bg-gray-50/80 border-l-4 border-l-black' : 'border-l-4 border-l-transparent'}`} onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                                                    <TableCell className="px-6 py-5">
                                                        <div className="font-mono text-sm font-bold text-gray-900 mb-1">{`#${order.id}`}</div>
                                                        <div className="text-xs font-medium text-gray-500">{new Date(order.created_at).toISOString().split('T')[0]}</div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5">
                                                        <div className="font-medium text-gray-900 mb-1">{order.shipping_address?.email || 'Unknown User'}</div>
                                                        <div className="text-xs text-gray-500 flex items-center max-w-[200px] truncate" title={parseAddress(order.shipping_address)}>
                                                            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                                            <span className="truncate">{parseAddress(order.shipping_address)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5 text-right font-bold text-gray-900">
                                                        {formatPrice(order.total_amount)}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                                                        <Select
                                                            value={order.status}
                                                            onValueChange={(val) => handleStatusChange(order.id, val)}
                                                            disabled={updatingStatusFor === order.id}
                                                        >
                                                            <SelectTrigger className={`w-36 h-9 mx-auto border shadow-sm font-medium ${getStatusColor(order.status)}`}>
                                                                {updatingStatusFor === order.id ? (
                                                                    <span className="flex items-center justify-center w-full"><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div></span>
                                                                ) : (
                                                                    <SelectValue />
                                                                )}
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-white border-gray-200">
                                                                <SelectItem value="pending" className="cursor-pointer focus:bg-gray-50 font-medium">Pending</SelectItem>
                                                                <SelectItem value="confirmed" className="cursor-pointer focus:bg-gray-50 font-medium">Confirmed</SelectItem>
                                                                <SelectItem value="processing" className="cursor-pointer focus:bg-gray-50 font-medium">Processing</SelectItem>
                                                                <SelectItem value="shipped" className="cursor-pointer focus:bg-gray-50 font-medium">Shipped</SelectItem>
                                                                <SelectItem value="delivered" className="cursor-pointer focus:bg-gray-50 font-medium">Delivered</SelectItem>
                                                                <SelectItem value="cancelled" className="cursor-pointer focus:bg-red-50 text-red-600 font-medium">Cancelled</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5 text-right">
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-gray-200" onClick={(e) => { e.stopPropagation(); setExpandedOrder(isExpanded ? null : order.id); }}>
                                                            {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>

                                                {/* Expandable Order Details Drawer */}
                                                {isExpanded && (
                                                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b-2 border-gray-200 border-l-4 border-l-black">
                                                        <TableCell colSpan={5} className="p-0">
                                                            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">

                                                                {/* Order Items */}
                                                                <div className="lg:col-span-2 space-y-4">
                                                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-200 pb-2">Line Items</h4>
                                                                    <div className="space-y-4">
                                                                        {order.order_items?.map((item: any) => (
                                                                            <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                                                <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 flex items-center justify-center">
                                                                                    {item.products?.image_url ? (
                                                                                        <img src={item.products.image_url} alt={item.products.name} className="w-full h-full object-cover" />
                                                                                    ) : (
                                                                                        <Package className="w-6 h-6 text-gray-300" />
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <h5 className="font-bold text-gray-900 truncate">{item.products?.name || 'Unknown Product'}</h5>
                                                                                    <div className="flex items-center gap-2 mt-1">
                                                                                        <Badge variant="secondary" className="font-mono text-xs bg-gray-100 text-gray-600">Qty: {item.quantity}</Badge>
                                                                                        <span className="text-sm font-medium text-gray-500">@ {formatPrice(item.price_at_time)}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="text-right font-black text-gray-900">
                                                                                    {formatPrice(item.price_at_time * item.quantity)}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {/* Sidebar Info */}
                                                                <div className="space-y-6">
                                                                    <div>
                                                                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-200 pb-2">Shipping Details</h4>
                                                                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                                                            <div>
                                                                                <p className="text-xs text-gray-400 font-bold uppercase">Customer</p>
                                                                                <p className="font-medium text-gray-900 text-sm mt-0.5">{order.shipping_address?.firstName} {order.shipping_address?.lastName}</p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-xs text-gray-400 font-bold uppercase">Phone</p>
                                                                                <p className="font-medium text-gray-900 text-sm mt-0.5">{order.shipping_address?.phone || 'N/A'}</p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-xs text-gray-400 font-bold uppercase">Address</p>
                                                                                <p className="font-medium text-gray-900 text-sm mt-0.5">
                                                                                    {order.shipping_address?.address || order.shipping_address?.street}<br />
                                                                                    {order.shipping_address?.city}, {order.shipping_address?.province}<br />
                                                                                    {order.shipping_address?.postalCode}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div>
                                                                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-200 pb-2">Transaction Setup</h4>
                                                                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                                                            <div className="flex justify-between items-center">
                                                                                <p className="text-xs text-gray-500 font-medium">Method</p>
                                                                                <p className="font-bold text-gray-900 text-sm uppercase">{order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}</p>
                                                                            </div>
                                                                            <div className="flex justify-between items-center">
                                                                                <p className="text-xs text-gray-500 font-medium">Payment Status</p>
                                                                                <Badge variant="outline" className={order.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                                                                                    {order.payment_status}
                                                                                </Badge>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
