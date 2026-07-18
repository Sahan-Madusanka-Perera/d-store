'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  MessageCircle, Clock, CheckCircle, XCircle, Phone,
  Mail, ExternalLink, ChevronDown, ChevronUp, StickyNote,
  Loader2, Filter, Search, Factory, Tag
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CustomOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  product_name: string;
  category: string;
  sub_category: string;
  publisher_manufacturer: string | null;
  reference_image_url: string | null;
  order_description: string | null;
  budget_range: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: <Clock className="w-3 h-3" /> },
  contacted: { label: 'Contacted', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: <MessageCircle className="w-3 h-3" /> },
  fulfilled: { label: 'Fulfilled', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: <CheckCircle className="w-3 h-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: <XCircle className="w-3 h-3" /> },
};

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

export default function CustomOrderManager({ initialOrders }: { initialOrders: CustomOrder[] }) {
  const [orders, setOrders] = useState<CustomOrder[]>(initialOrders);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = searchQuery === '' ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery) ||
      order.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.order_description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/custom-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });

      if (!res.ok) {
        toast.error('Failed to update status');
        return;
      }

      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: newStatus, updated_at: new Date().toISOString() } : o
      ));
      toast.success(`Status updated to "${newStatus}"`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/custom-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, admin_notes: notesValue }),
      });

      if (!res.ok) {
        toast.error('Failed to save notes');
        return;
      }

      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, admin_notes: notesValue, updated_at: new Date().toISOString() } : o
      ));
      setEditingNotesId(null);
      toast.success('Notes saved');
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setUpdatingId(null);
    }
  };

  const openWhatsApp = (phone: string, name: string) => {
    const text = encodeURIComponent(`Hi ${name}, regarding your custom order request on D-Store — `);
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    // If starts with 0, assume Sri Lanka (+94)
    const intlPhone = cleanPhone.startsWith('0') ? `94${cleanPhone.slice(1)}` : cleanPhone;
    window.open(`https://wa.me/${intlPhone}?text=${text}`, '_blank');
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Status summary chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
            filterStatus === 'all'
              ? 'bg-black text-white border-black'
              : 'bg-transparent text-muted-foreground border-border hover:border-foreground/30'
          }`}
        >
          All ({orders.length})
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
              filterStatus === key
                ? `${config.color} border-current`
                : 'bg-transparent text-muted-foreground border-border hover:border-foreground/30'
            }`}
          >
            {config.icon}
            {config.label} ({statusCounts[key] || 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, or product..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 rounded-xl bg-secondary/50"
        />
      </div>

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Filter className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">No custom orders found</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            {filterStatus !== 'all' ? 'Try changing the filter' : 'Custom orders will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const isExpanded = expandedId === order.id;

            return (
              <Card key={order.id} className="rounded-xl border-border/60 overflow-hidden transition-all duration-200 hover:border-border">
                {/* Main row */}
                <div
                  className="p-4 flex items-start gap-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  {/* Status dot */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${statusInfo.color} border`}>
                    {statusInfo.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm">{order.product_name}</h4>
                      <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider ${statusInfo.color} border`}>
                        {statusInfo.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full capitalize">
                        {order.category} · {order.sub_category}
                      </span>
                      {order.budget_range && (
                        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                          {order.budget_range}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {order.customer_name}{order.publisher_manufacturer ? ` · ${order.publisher_manufacturer}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-2">{formatDate(order.created_at)}</p>
                  </div>

                  {/* Expand arrow */}
                  <div className="shrink-0 text-muted-foreground">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <CardContent className="px-4 pb-4 pt-0 border-t border-border/40 mt-0 space-y-4">
                    {/* Contact info */}
                    <div className="flex flex-wrap gap-3 pt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); openWhatsApp(order.customer_phone, order.customer_name); }}
                        className="h-9 rounded-lg text-xs font-bold gap-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </Button>
                      <a
                        href={`tel:${order.customer_phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 h-9 px-3 rounded-lg text-xs font-bold border border-border/60 hover:bg-muted/50 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {order.customer_phone}
                      </a>
                      {order.customer_email && (
                        <a
                          href={`mailto:${order.customer_email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 h-9 px-3 rounded-lg text-xs font-bold border border-border/60 hover:bg-muted/50 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {order.customer_email}
                        </a>
                      )}
                      {order.publisher_manufacturer && (
                        <span className="inline-flex items-center gap-2 h-9 px-3 rounded-lg text-xs font-bold border border-border/60">
                          <Factory className="w-3.5 h-3.5" />
                          {order.publisher_manufacturer}
                        </span>
                      )}
                      {order.reference_image_url && (
                        <a
                          href={order.reference_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 h-9 px-3 rounded-lg text-xs font-bold border border-border/60 hover:bg-muted/50 transition-colors text-blue-600"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Reference Image
                        </a>
                      )}
                    </div>

                    {/* Reference image preview */}
                    {order.reference_image_url && (
                      <a href={order.reference_image_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={order.reference_image_url}
                          alt={`Reference for ${order.product_name}`}
                          className="w-24 h-24 rounded-lg object-cover border border-border/60"
                        />
                      </a>
                    )}

                    {/* Category / Type */}
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/40 flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <p className="text-sm capitalize">{order.category} — {order.sub_category}</p>
                    </div>

                    {/* Additional details */}
                    {order.order_description && (
                      <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Additional Details</p>
                        <p className="text-sm whitespace-pre-wrap">{order.order_description}</p>
                      </div>
                    )}

                    {/* Status change */}
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0">Status:</p>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                        disabled={updatingId === order.id}
                      >
                        <SelectTrigger className="h-9 w-44 rounded-lg text-xs font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
                          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key} className="text-xs font-bold rounded-md">
                              <span className="flex items-center gap-2">
                                {config.icon}
                                {config.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {updatingId === order.id && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                    </div>

                    {/* Admin notes */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <StickyNote className="w-3 h-3" />
                          Admin Notes
                        </p>
                        {editingNotesId !== order.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingNotesId(order.id);
                              setNotesValue(order.admin_notes || '');
                            }}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                      {editingNotesId === order.id ? (
                        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                          <Textarea
                            value={notesValue}
                            onChange={(e) => setNotesValue(e.target.value)}
                            placeholder="Add notes about this order..."
                            rows={3}
                            className="rounded-lg text-sm bg-secondary/50"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs"
                              onClick={() => setEditingNotesId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 text-xs bg-black text-white hover:bg-gray-900"
                              onClick={() => handleSaveNotes(order.id)}
                              disabled={updatingId === order.id}
                            >
                              {updatingId === order.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                              Save Notes
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          {order.admin_notes || 'No notes yet'}
                        </p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
