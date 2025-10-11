import { NextRequest, NextResponse } from 'next/server';
import { payhere } from '@/lib/payhere';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract PayHere notification data
    const merchantId = formData.get('merchant_id') as string;
    const orderId = formData.get('order_id') as string;
    const paymentId = formData.get('payment_id') as string;
    const amount = formData.get('payhere_amount') as string;
    const currency = formData.get('payhere_currency') as string;
    const statusCode = formData.get('status_code') as string;
    const hash = formData.get('md5sig') as string;

    // Verify the payment
    const isValid = payhere.verifyPayment(
      merchantId,
      orderId,
      paymentId,
      amount,
      currency,
      statusCode,
      hash
    );

    if (!isValid) {
      console.error('Invalid PayHere notification signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Update order status in database
    if (statusCode === '2') {
      // Payment successful
      console.log(`Payment successful for order: ${orderId}, payment: ${paymentId}`);
      
      // TODO: Update order status to 'paid' in database
      // TODO: Send confirmation email to customer
      // TODO: Update inventory
      
    } else if (statusCode === '0') {
      // Payment pending
      console.log(`Payment pending for order: ${orderId}`);
      
    } else {
      // Payment failed
      console.log(`Payment failed for order: ${orderId}, status: ${statusCode}`);
      
      // TODO: Update order status to 'failed' in database
      // TODO: Send failure notification
    }

    return NextResponse.json({ status: 'OK' });
    
  } catch (error) {
    console.error('PayHere notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}