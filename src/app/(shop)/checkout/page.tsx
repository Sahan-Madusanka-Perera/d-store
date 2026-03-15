'use client';

import { useState, useRef } from 'react';
import { useCartStore } from '@/store/cart';
import { SL_PROVINCES, SHIPPING_RATES, BANK_DETAILS, getWhatsAppUrl } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  MessageCircle,
  HelpCircle,
  CheckCircle2,
  Building2,
  CreditCard,
  Package,
  FileImage,
  Send,
  Loader2,
  Copy,
  Check,
  ShoppingBag,
} from 'lucide-react';

type CheckoutStep = 'shipping' | 'payment' | 'confirmation';

export default function CheckoutPage() {
  const { items, totalAmount, discountTotal, clearCart } = useCartStore();
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [slipUploaded, setSlipUploaded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateShipping = () => {
    if (totalAmount >= SHIPPING_RATES.FREE_SHIPPING_THRESHOLD) return 0;
    if (formData.province === 'Western' && formData.city.toLowerCase().includes('colombo')) {
      return SHIPPING_RATES.COLOMBO;
    }
    if (formData.province === 'Western') {
      return SHIPPING_RATES.WESTERN_PROVINCE;
    }
    return SHIPPING_RATES.OTHER_PROVINCES;
  };

  const shippingCost = calculateShipping();
  const finalTotal = totalAmount - discountTotal + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isShippingFormValid = () => {
    return formData.firstName && formData.lastName && formData.email &&
      formData.phone && formData.address && formData.city &&
      formData.province && formData.postalCode;
  };

  // Create the order when moving from shipping to payment step
  const handleProceedToPayment = async () => {
    if (!isShippingFormValid()) {
      toast.error('Please fill in all shipping details');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtTime: item.priceAtTime,
          })),
          shippingAddress: formData,
          shippingCost,
          totalAmount: finalTotal,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      setOrderId(data.orderId);
      setStep('payment');
      toast.success('Order created! Now upload your bank transfer slip.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Allowed: JPEG, PNG, WebP, PDF');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB');
      return;
    }

    setSlipFile(file);
    if (file.type.startsWith('image/')) {
      setSlipPreview(URL.createObjectURL(file));
    } else {
      setSlipPreview(null);
    }
  };

  // Upload the slip
  const handleUploadSlip = async () => {
    if (!slipFile || !orderId) return;

    setIsUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('slip', slipFile);
      formDataUpload.append('uploaded_via', 'website');

      const res = await fetch(`/api/orders/${orderId}/upload-slip`, {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload slip');
      }

      setSlipUploaded(true);
      toast.success('Bank slip uploaded successfully!');

      // Also open WhatsApp with the order details
      const whatsappMsg = buildOrderWhatsAppMessage('slip_uploaded');
      window.open(getWhatsAppUrl(whatsappMsg), '_blank');

      // Move to confirmation
      clearCart();
      setStep('confirmation');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload slip');
    } finally {
      setIsUploading(false);
    }
  };

  // Build a detailed WhatsApp message
  const buildOrderWhatsAppMessage = (type: 'slip_uploaded' | 'send_slip' | 'inquiry') => {
    const itemsList = items.map(item =>
      `• ${item.product.name} x${item.quantity} — ${formatPrice(item.priceAtTime * item.quantity)}`
    ).join('\n');

    const orderRef = orderId ? `Order ID: #${orderId}` : '';

    if (type === 'slip_uploaded') {
      return `🧾 *Bank Slip Uploaded — D-Store Order*

${orderRef}

*Items:*
${itemsList}

*Subtotal:* ${formatPrice(totalAmount)}
*Shipping:* ${shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
*Total:* ${formatPrice(finalTotal)}

*Shipping To:*
${formData.firstName} ${formData.lastName}
${formData.address}, ${formData.city}
${formData.province}, ${formData.postalCode}
Phone: ${formData.phone}

✅ Bank slip has been uploaded on the website. Please verify.`;
    }

    if (type === 'send_slip') {
      return `🧾 *Bank Transfer Slip — D-Store Order*

${orderRef}

*Items:*
${itemsList}

*Total:* ${formatPrice(finalTotal)}

*Customer:* ${formData.firstName} ${formData.lastName}
*Phone:* ${formData.phone}
*Email:* ${formData.email}

📎 I will attach my bank transfer slip in the next message.`;
    }

    // inquiry
    return `❓ *Inquiry About D-Store Order*

${orderRef}

*Items I'm interested in:*
${itemsList}

*Total:* ${formatPrice(finalTotal)}

I have a question about this order. Can you help me?`;
  };

  // Send slip via WhatsApp
  const handleSendSlipViaWhatsApp = () => {
    const whatsappMsg = buildOrderWhatsAppMessage('send_slip');
    window.open(getWhatsAppUrl(whatsappMsg), '_blank');
    clearCart();
    setStep('confirmation');
  };

  // Inquire more
  const handleInquireMore = () => {
    const whatsappMsg = buildOrderWhatsAppMessage('inquiry');
    window.open(getWhatsAppUrl(whatsappMsg), '_blank');
  };

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <div className="text-center py-24">
        <h1 className="text-3xl font-bold text-foreground mb-4">No items to checkout</h1>
        <p className="text-muted-foreground text-lg mb-8">Your cart is empty. Add some items first!</p>
        <Button size="lg" asChild>
          <Link href="/products">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Start Shopping
          </Link>
        </Button>
      </div>
    );
  }

  // Confirmation page
  if (step === 'confirmation') {
    return (
      <div className="py-12 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Order Placed Successfully!</h1>
          <p className="text-muted-foreground text-lg mb-2">
            Your order has been received and is being processed.
          </p>
          {orderId && (
            <p className="text-sm text-muted-foreground mb-8">
              Order ID: <span className="font-mono font-semibold text-foreground">#{orderId}</span>
            </p>
          )}

          <Card className="mb-8 text-left">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Order Created</p>
                  <p className="text-sm text-muted-foreground">Your order details have been saved</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                {slipUploaded ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <MessageCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className="font-semibold">
                    {slipUploaded ? 'Bank Slip Uploaded' : 'Sending Slip via WhatsApp'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {slipUploaded
                      ? 'Your payment slip has been uploaded for verification'
                      : 'Please send your payment slip in the WhatsApp chat'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-muted-foreground">Verification Pending</p>
                  <p className="text-sm text-muted-foreground">We will verify your payment and process the order</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/products">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/profile">
                View My Orders
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-5xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-10">
        <div className="flex items-center justify-center gap-0 mb-6">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${step === 'shipping' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground'}`}>
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">1</span>
            Shipping
          </div>
          <div className="w-8 h-0.5 bg-border" />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${step === 'payment' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground'}`}>
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">2</span>
            Payment
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {step === 'shipping' && (
            <Card className="shadow-lg border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Package className="h-6 w-6" />
                  Shipping Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleProceedToPayment(); }}>
                  {/* Personal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">First Name *</label>
                      <input
                        type="text" name="firstName" required
                        value={formData.firstName} onChange={handleInputChange}
                        className="w-full border border-border/60 rounded-lg px-4 py-2.5 bg-card shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Last Name *</label>
                      <input
                        type="text" name="lastName" required
                        value={formData.lastName} onChange={handleInputChange}
                        className="w-full border border-border/60 rounded-lg px-4 py-2.5 bg-card shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Email *</label>
                      <input
                        type="email" name="email" required
                        value={formData.email} onChange={handleInputChange}
                        className="w-full border border-border/60 rounded-lg px-4 py-2.5 bg-card shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Phone *</label>
                      <input
                        type="tel" name="phone" required placeholder="+94 70 123 4567"
                        value={formData.phone} onChange={handleInputChange}
                        className="w-full border border-border/60 rounded-lg px-4 py-2.5 bg-card shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Address *</label>
                    <input
                      type="text" name="address" required placeholder="Street address, apartment, suite, etc."
                      value={formData.address} onChange={handleInputChange}
                      className="w-full border border-border/60 rounded-lg px-4 py-2.5 bg-card shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">City *</label>
                      <input
                        type="text" name="city" required
                        value={formData.city} onChange={handleInputChange}
                        className="w-full border border-border/60 rounded-lg px-4 py-2.5 bg-card shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Province *</label>
                      <select
                        name="province" required
                        value={formData.province} onChange={handleInputChange}
                        className="w-full border border-border/60 rounded-lg px-4 py-2.5 bg-card shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                      >
                        <option value="">Select Province</option>
                        {SL_PROVINCES.map((province) => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Postal Code *</label>
                      <input
                        type="text" name="postalCode" required
                        value={formData.postalCode} onChange={handleInputChange}
                        className="w-full border border-border/60 rounded-lg px-4 py-2.5 bg-card shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || !isShippingFormValid()}
                    className="w-full shadow-lg hover:shadow-xl text-base font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Order...
                      </>
                    ) : (
                      <>
                        Continue to Payment
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              {/* Bank Details Card */}
              <Card className="shadow-lg border-border/50 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b border-border/30">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Bank Transfer Details
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Transfer <span className="font-bold text-foreground">{formatPrice(finalTotal)}</span> to the following account
                  </p>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {[
                    { label: 'Bank Name', value: BANK_DETAILS.bankName, key: 'bank' },
                    { label: 'Account Name', value: BANK_DETAILS.accountName, key: 'name' },
                    { label: 'Account Number', value: BANK_DETAILS.accountNumber, key: 'number' },
                    { label: 'Branch', value: BANK_DETAILS.branch, key: 'branch' },
                  ].map((detail) => (
                    <div key={detail.key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <span className="block text-xs text-muted-foreground font-medium uppercase tracking-wider">{detail.label}</span>
                        <span className="font-semibold text-foreground">{detail.value}</span>
                      </div>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => handleCopy(detail.value, detail.key)}
                        className="h-8 w-8 p-0"
                      >
                        {copiedField === detail.key ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}

                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-200">
                    <strong>Amount to Transfer:</strong> {formatPrice(finalTotal)}
                    <br />
                    <span className="text-xs mt-1 block">Please include your Order ID <span className="font-mono font-bold">#{orderId}</span> as the transfer reference</span>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Slip */}
              <Card className="shadow-lg border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Bank Transfer Slip
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Upload your payment receipt for quick verification</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    {slipPreview ? (
                      <div className="space-y-3">
                        <div className="relative w-48 h-48 mx-auto rounded-lg overflow-hidden shadow-md">
                          <Image src={slipPreview} alt="Slip preview" fill className="object-contain" />
                        </div>
                        <p className="text-sm text-muted-foreground">{slipFile?.name}</p>
                        <p className="text-xs text-primary font-medium">Click to change file</p>
                      </div>
                    ) : slipFile ? (
                      <div className="space-y-2">
                        <FileImage className="h-12 w-12 text-muted-foreground mx-auto" />
                        <p className="font-medium">{slipFile.name}</p>
                        <p className="text-xs text-primary font-medium">Click to change file</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-12 w-12 text-muted-foreground/40 mx-auto" />
                        <p className="font-medium text-muted-foreground">Click to upload your bank slip</p>
                        <p className="text-xs text-muted-foreground">JPEG, PNG, WebP or PDF — Max 5MB</p>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleUploadSlip}
                    disabled={!slipFile || isUploading}
                    size="lg"
                    className="w-full shadow-md hover:shadow-lg"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Slip & Confirm Order
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Alternative Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="shadow-md border-border/50 hover:shadow-lg transition-shadow cursor-pointer group" onClick={handleSendSlipViaWhatsApp}>
                  <CardContent className="pt-6 text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 group-hover:scale-110 transition-transform">
                      <Send className="h-7 w-7 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-foreground">Send Slip via WhatsApp</h3>
                    <p className="text-sm text-muted-foreground">Send your bank slip privately through WhatsApp</p>
                  </CardContent>
                </Card>

                <Card className="shadow-md border-border/50 hover:shadow-lg transition-shadow cursor-pointer group" onClick={handleInquireMore}>
                  <CardContent className="pt-6 text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform">
                      <HelpCircle className="h-7 w-7 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-foreground">Inquire More</h3>
                    <p className="text-sm text-muted-foreground">Ask questions about your order via WhatsApp</p>
                  </CardContent>
                </Card>
              </div>

              {/* Back Button */}
              <Button variant="ghost" onClick={() => setStep('shipping')} className="text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Shipping
              </Button>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-border/50 sticky top-4">
            <CardHeader className="border-b border-border/30">
              <CardTitle className="text-lg font-bold">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Items */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-border/30 last:border-0">
                    <div className="w-12 h-12 bg-muted/30 rounded-lg flex-shrink-0 shadow-sm overflow-hidden relative">
                      <Image
                        src={item.product.images[0] || '/placeholder.svg'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-foreground truncate">{item.product.name}</div>
                      <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-sm font-bold">{formatPrice(item.priceAtTime * item.quantity)}</div>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-3 border-t border-border/50 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{formatPrice(totalAmount)}</span>
                </div>

                {discountTotal > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount</span>
                    <span className="font-semibold">-{formatPrice(discountTotal)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  {shippingCost === 0 ? (
                    <span className="text-emerald-600 font-semibold">FREE</span>
                  ) : (
                    <span className="font-semibold">{formatPrice(shippingCost)}</span>
                  )}
                </div>

                {totalAmount < SHIPPING_RATES.FREE_SHIPPING_THRESHOLD && (
                  <div className="text-xs text-primary bg-primary/5 border border-primary/20 p-3 rounded-lg font-medium">
                    Add {formatPrice(SHIPPING_RATES.FREE_SHIPPING_THRESHOLD - totalAmount)} more for FREE shipping!
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold border-t border-border/50 pt-3">
                  <span>Total</span>
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Payment Method Badge */}
              <div className="mt-6 pt-4 border-t border-border/50">
                <Badge className="w-full justify-center py-2 bg-blue-500/10 text-blue-600 border-blue-200 font-semibold">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Bank Transfer Only
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
