import { PAYHERE_CONFIG } from './constants';
import { Order } from '@/types/order';
import { createHash } from 'node:crypto';

export interface PayHerePayment {
  sandbox: boolean;
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: string;
  currency: string;
  hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export class PayHereService {
  private static instance: PayHereService;
  private merchantId: string;
  private merchantSecret: string;

  private constructor() {
    this.merchantId = PAYHERE_CONFIG.IS_SANDBOX 
      ? PAYHERE_CONFIG.SANDBOX_MERCHANT_ID || ''
      : PAYHERE_CONFIG.LIVE_MERCHANT_ID || '';
    
    this.merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || '';
  }

  static getInstance(): PayHereService {
    if (!PayHereService.instance) {
      PayHereService.instance = new PayHereService();
    }
    return PayHereService.instance;
  }

  // Generate MD5 hash for PayHere
  private generateHash(
    merchantId: string,
    orderId: string,
    amount: string,
    currency: string,
    merchantSecret: string
  ): string {
    const hashString = `${merchantId}${orderId}${amount}${currency}${merchantSecret}`.toUpperCase();
    return createHash('md5').update(hashString).digest('hex').toUpperCase();
  }

  // Create PayHere payment object
  createPayment(order: Order, baseUrl: string): PayHerePayment {
    const amount = order.total.toFixed(2);
    const hash = this.generateHash(
      this.merchantId,
      order.orderNumber,
      amount,
      PAYHERE_CONFIG.CURRENCY,
      this.merchantSecret
    );

    return {
      sandbox: PAYHERE_CONFIG.IS_SANDBOX,
      merchant_id: this.merchantId,
      return_url: `${baseUrl}/success?order=${order.orderNumber}`,
      cancel_url: `${baseUrl}/cancel?order=${order.orderNumber}`,
      notify_url: `${baseUrl}/api/payhere/notify`,
      order_id: order.orderNumber,
      items: order.items.map(item => item.product.name).join(', '),
      amount: amount,
      currency: PAYHERE_CONFIG.CURRENCY,
      hash: hash,
      first_name: order.shippingAddress.firstName,
      last_name: order.shippingAddress.lastName,
      email: order.shippingAddress.email,
      phone: order.shippingAddress.phone,
      address: order.shippingAddress.address,
      city: order.shippingAddress.city,
      country: 'Sri Lanka',
    };
  }

  // Verify payment notification from PayHere
  verifyPayment(
    merchantId: string,
    orderId: string,
    paymentId: string,
    amount: string,
    currency: string,
    statusCode: string,
    hash: string
  ): boolean {
    const localHash = this.generateHash(
      merchantId,
      orderId,
      amount,
      currency,
      this.merchantSecret
    );
    
    return localHash === hash && statusCode === '2'; // Status 2 = Success
  }
}

export const payhere = PayHereService.getInstance();