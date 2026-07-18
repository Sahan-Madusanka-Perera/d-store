'use client';

import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, Send, Loader2, MessageCircle, Package, ImagePlus, X } from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/constants';

const CATEGORIES = [
  { value: 'book', label: 'Book' },
  { value: 'figure', label: 'Figure' },
];

const SUB_CATEGORIES: Record<string, string[]> = {
  book: ['Manga', 'Manhwa', 'Comic', 'Light Novel', 'Other'],
  figure: ['Anime Figure', 'Action Figure', 'Gundam Kit', 'Other'],
};

const EMPTY_FORM = {
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  product_name: '',
  category: '',
  sub_category: '',
  publisher_manufacturer: '',
  order_description: '',
};

function directWhatsAppUrl() {
  return getWhatsAppUrl(
    "Hi! I'm looking for a specific book/figure that's not in your catalog — could you help me source it?"
  );
}

export default function CustomOrderForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value, sub_category: '' }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    clearImage();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    if (!formData.sub_category) {
      toast.error('Please select a type');
      return;
    }

    setLoading(true);

    try {
      const body = new FormData();
      Object.entries(formData).forEach(([key, value]) => body.append(key, value));
      if (imageFile) body.append('reference_image', imageFile);

      const res = await fetch('/api/custom-orders', {
        method: 'POST',
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to submit order');
        return;
      }

      toast.success('Custom order submitted!', {
        description: 'We\'ll get back to you soon via WhatsApp.',
        duration: 5000,
      });

      // Open WhatsApp in new tab if URL is available
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer');
      }

      resetForm();
      setOpen(false);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Inline style objects — guarantees solid backgrounds regardless of Tailwind CSS variable resolution
  const solidBg: React.CSSProperties = {
    backgroundColor: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
  };
  const mutedBg: React.CSSProperties = {
    backgroundColor: 'hsl(var(--muted))',
  };
  const inputStyle: React.CSSProperties = {
    backgroundColor: 'hsl(var(--card))',
    color: 'hsl(var(--foreground))',
  };

  const subCategoryOptions = formData.category ? SUB_CATEGORIES[formData.category] : [];

  return (
    <section
      className="relative w-full py-16 sm:py-24 px-4 border-t border-border overflow-hidden"
      style={mutedBg}
    >
      {/* Decorative backdrop */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:22px_22px] opacity-50 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_40%,transparent_100%)]" />
        <div className="absolute -top-24 left-1/4 w-80 h-80 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 w-80 h-80 bg-purple-400/10 dark:bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-6 shadow-md">
          <Search className="w-8 h-8" />
        </div>
        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground mb-3">
          Custom orders
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 text-foreground">
          Looking for something specific?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto font-medium">
          Can't find that rare figure or exclusive manga volume in our catalog?
          Submit a custom order and our team will source it for you.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={() => setOpen(true)}
            size="lg"
            className="h-14 px-8 text-base font-bold tracking-wide rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Request Custom Order
            <Package className="ml-2 w-5 h-5" />
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-14 px-8 text-base font-bold tracking-wide rounded-full border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <a href={directWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
              Chat on WhatsApp
              <MessageCircle className="ml-2 w-5 h-5" />
            </a>
          </Button>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto border border-border shadow-2xl rounded-2xl p-0"
          style={solidBg}
        >
          {/* Header */}
          <div
            className="px-6 pt-6 pb-4 border-b border-border rounded-t-2xl"
            style={mutedBg}
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tight uppercase flex items-center gap-3 text-foreground">
                <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                Custom Request
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
                Tell us what you want and we'll source it. We'll contact you via WhatsApp to confirm pricing and details.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="px-6 py-5 space-y-4"
            style={solidBg}
          >
            {/* Product Name */}
            <div className="space-y-1.5">
              <Label htmlFor="custom-order-product-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Product Name *
              </Label>
              <Input
                id="custom-order-product-name"
                placeholder="e.g. Naruto Shippuden Vol. 42"
                value={formData.product_name}
                onChange={(e) => handleChange('product_name', e.target.value)}
                required
                className="h-10 rounded-lg border-border"
                style={inputStyle}
              />
            </div>

            {/* Category & Sub-category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Category *
                </Label>
                <Select value={formData.category} onValueChange={handleCategoryChange} required>
                  <SelectTrigger className="h-10 rounded-lg border-border" style={inputStyle}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Type *
                </Label>
                <Select
                  value={formData.sub_category}
                  onValueChange={(value) => handleChange('sub_category', value)}
                  disabled={!formData.category}
                  required
                >
                  <SelectTrigger className="h-10 rounded-lg border-border" style={inputStyle}>
                    <SelectValue placeholder={formData.category ? 'Select type' : 'Pick a category first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategoryOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Publisher / Manufacturer */}
            <div className="space-y-1.5">
              <Label htmlFor="custom-order-publisher" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Publisher / Manufacturer <span className="normal-case font-normal opacity-60">(optional)</span>
              </Label>
              <Input
                id="custom-order-publisher"
                placeholder="e.g. Viz Media, Banpresto"
                value={formData.publisher_manufacturer}
                onChange={(e) => handleChange('publisher_manufacturer', e.target.value)}
                className="h-10 rounded-lg border-border"
                style={inputStyle}
              />
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="custom-order-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Your Name *
                </Label>
                <Input
                  id="custom-order-name"
                  placeholder="Enter your name"
                  value={formData.customer_name}
                  onChange={(e) => handleChange('customer_name', e.target.value)}
                  required
                  className="h-10 rounded-lg border-border"
                  style={inputStyle}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="custom-order-phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  WhatsApp Number *
                </Label>
                <Input
                  id="custom-order-phone"
                  placeholder="07X XXX XXXX"
                  value={formData.customer_phone}
                  onChange={(e) => handleChange('customer_phone', e.target.value)}
                  required
                  type="tel"
                  className="h-10 rounded-lg border-border"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="custom-order-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email <span className="normal-case font-normal opacity-60">(optional)</span>
              </Label>
              <Input
                id="custom-order-email"
                placeholder="your@email.com"
                value={formData.customer_email}
                onChange={(e) => handleChange('customer_email', e.target.value)}
                type="email"
                className="h-10 rounded-lg border-border"
                style={inputStyle}
              />
            </div>

            {/* Reference Image */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Reference Image <span className="normal-case font-normal opacity-60">(optional)</span>
              </Label>
              {imagePreview ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Reference preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
                    aria-label="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <ImagePlus className="w-5 h-5" />
                  <span className="text-xs font-semibold">Click to upload an image</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* Additional Details */}
            <div className="space-y-1.5">
              <Label htmlFor="custom-order-description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Additional Details <span className="normal-case font-normal opacity-60">(optional)</span>
              </Label>
              <Textarea
                id="custom-order-description"
                placeholder="Any extra details — edition, size, color, etc."
                value={formData.order_description}
                onChange={(e) => handleChange('order_description', e.target.value)}
                rows={3}
                className="rounded-lg border-border resize-none"
                style={inputStyle}
              />
            </div>

            {/* WhatsApp note */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-emerald-500/25 bg-emerald-500/10">
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium leading-relaxed text-emerald-800 dark:text-emerald-300">
                After submitting, you'll be taken to WhatsApp to send us the request directly — fastest way to reach us.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 h-11 rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" />Submit Request</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
