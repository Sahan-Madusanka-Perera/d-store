'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/constants';

interface WhatsAppInquiryButtonProps {
  productName: string;
  productPrice: number;
  productCategory: string;
  productDescription?: string;
}

export default function WhatsAppInquiryButton({
  productName,
  productPrice,
  productCategory,
  productDescription,
}: WhatsAppInquiryButtonProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleInquiry = () => {
    const message = `❓ *Product Inquiry — D-Store*

*Product:* ${productName}
*Category:* ${productCategory}
*Price:* ${formatPrice(productPrice)}
${productDescription ? `\n*Description:* ${productDescription.slice(0, 200)}${productDescription.length > 200 ? '...' : ''}` : ''}

Hi! I'd like to know more about this product. Can you help me?`;

    window.open(getWhatsAppUrl(message), '_blank');
  };

  // The emerald treatment this carried put emerald-700 text on the dark theme's #0e0e11
  // at about 3.0:1, under the 4.5:1 floor, and its emerald-200 border had no dark
  // variant at all. This is the secondary action beside Add to Cart, so it takes the
  // palette's own outline weight instead of a hue borrowed from WhatsApp's brand.
  return (
    <Button
      onClick={handleInquiry}
      variant="outline"
      size="lg"
      className="w-full transition-colors"
    >
      <MessageCircle aria-hidden="true" className="mr-2 h-5 w-5" />
      Inquire via WhatsApp
    </Button>
  );
}
