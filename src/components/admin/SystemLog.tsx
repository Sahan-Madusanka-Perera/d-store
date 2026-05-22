'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, AlertTriangle, Package, Clock, Eye } from 'lucide-react'

interface Order {
  id: string
  status: string
  total_amount: number
  payment_method: string
  created_at: string
  city: string
  user_id: string
  user_profiles?: {
    full_name: string
    email: string
  }
}

interface LowStockProduct {
  id: number
  name: string
  stock: number
  category: string
}

interface SystemLogProps {
  initialOrders: Order[]
  initialLowStock: LowStockProduct[]
}

function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
  }).format(price)
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
}

export default function SystemLog({ initialOrders, initialLowStock }: SystemLogProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [lowStock, setLowStock] = useState<LowStockProduct[]>(initialLowStock)
  const [flashId, setFlashId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to new orders in real-time
    const ordersChannel = supabase
      .channel('system-log-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the full order with user info
            const { data: newOrder } = await supabase
              .from('orders')
              .select('*, user_profiles(full_name, email)')
              .eq('id', payload.new.id)
              .single()

            if (newOrder) {
              setOrders(prev => [newOrder, ...prev].slice(0, 5))
              setFlashId(newOrder.id)
              setTimeout(() => setFlashId(null), 3000)
            }
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev =>
              prev.map(order =>
                order.id === payload.new.id
                  ? { ...order, ...payload.new }
                  : order
              )
            )
            setFlashId(payload.new.id as string)
            setTimeout(() => setFlashId(null), 3000)
          }
        }
      )
      .subscribe()

    // Subscribe to product stock changes in real-time
    const productsChannel = supabase
      .channel('system-log-products')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
        },
        async () => {
          // Re-fetch low stock products when any product is updated
          const { data: freshLowStock } = await supabase
            .from('products')
            .select('id, name, stock, category')
            .lt('stock', 10)
            .order('stock', { ascending: true })
            .limit(5)

          if (freshLowStock) {
            setLowStock(freshLowStock)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(productsChannel)
    }
  }, [])

  // Merge orders + low stock into a unified timeline, interleaving low stock alerts
  const hasOrders = orders.length > 0
  const hasLowStock = lowStock.length > 0

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
      {/* Low Stock Alerts — always show at top if any */}
      {hasLowStock && (
        <div className="space-y-2">
          {lowStock.map((product) => {
            const isCritical = product.stock === 0
            const isWarning = product.stock > 0 && product.stock <= 3
            // Color tiers: red = out of stock, orange = warning (1-3), amber = low (4-9)
            const borderColor = isCritical ? 'border-l-red-600' : isWarning ? 'border-l-orange-500' : 'border-l-amber-400'
            const bgColor = isCritical ? 'bg-red-50/50' : isWarning ? 'bg-orange-50/40' : 'bg-amber-50/30'
            const iconColor = isCritical ? 'text-red-600' : isWarning ? 'text-orange-500' : 'text-amber-500'
            const titleColor = isCritical ? 'text-red-700' : isWarning ? 'text-orange-700' : 'text-amber-700'
            const subtitleColor = isCritical ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-amber-600'
            const badgeClasses = isCritical
              ? 'bg-red-600 text-white border-red-600'
              : isWarning
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            const badgeText = isCritical ? 'OUT OF STOCK' : `${product.stock} left`
            const alertLabel = isCritical ? 'CRITICAL: OUT OF STOCK' : isWarning ? 'WARNING: LOW STOCK' : 'ALERT: LOW STOCK'

            return (
              <div
                key={`stock-${product.id}`}
                className={`flex items-center justify-between p-3 border-l-4 ${borderColor} border border-gray-100 rounded-lg ${bgColor} transition-all duration-500 ${
                  flashId === `stock-${product.id}` ? 'ring-2 ring-red-400 scale-[1.02]' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <AlertTriangle className={`h-4 w-4 ${iconColor} shrink-0 ${isCritical ? 'animate-pulse' : ''}`} />
                  <div className="min-w-0">
                    <div className={`font-bold text-sm ${titleColor}`}>{alertLabel}</div>
                    <div className={`text-xs ${subtitleColor} font-mono mt-0.5 truncate`}>
                      {product.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <a
                    href={`/products/${product.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-black bg-white hover:bg-gray-100 border border-gray-200 rounded-md px-2 py-1 transition-colors"
                  >
                    <Eye className="h-3 w-3" />
                    View
                  </a>
                  <Badge className={`font-mono text-xs px-2 py-0.5 ${badgeClasses}`}>
                    {badgeText}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Recent Orders */}
      {hasOrders ? (
        <div className="space-y-2">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-gray-100 transition-all duration-500 ${
                flashId === order.id ? 'ring-2 ring-black/20 scale-[1.02] bg-green-50/50' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <ShoppingCart className="h-4 w-4 text-gray-500 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-sm flex items-center gap-2">
                    ORDER
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 h-4 font-mono ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}
                    >
                      {order.status?.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 font-mono mt-0.5 truncate">
                    {order.user_profiles?.full_name || order.user_profiles?.email || order.city || 'Customer'}{' '}
                    <span className="text-gray-400">•</span>{' '}
                    <span className="text-gray-400">{formatTimeAgo(order.created_at)}</span>
                  </div>
                </div>
              </div>
              <Badge className="bg-black text-white hover:bg-gray-900 font-mono shrink-0 ml-2">
                {formatPrice(order.total_amount)}
              </Badge>
            </div>
          ))}
        </div>
      ) : !hasLowStock ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <Clock className="h-8 w-8 mb-2" />
          <p className="text-sm font-medium">No recent activity</p>
          <p className="text-xs mt-1">New orders and alerts will appear here live</p>
        </div>
      ) : null}
    </div>
  )
}
