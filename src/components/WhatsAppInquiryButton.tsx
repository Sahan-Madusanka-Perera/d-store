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

  return (
    <Button
      onClick={handleInquiry}
      variant="outline"
      size="lg"
      className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md"
    >
      <MessageCircle className="mr-2 h-5 w-5" />
      Inquire via WhatsApp
    </Button>
  );
}
