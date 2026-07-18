import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { WHATSAPP_NUMBER } from '@/lib/constants';

const CATEGORY_LABELS: Record<string, string> = {
  book: 'Book',
  figure: 'Figure',
};

function buildWhatsAppUrl(data: {
  customer_name: string;
  customer_phone: string;
  product_name: string;
  category: string;
  sub_category: string;
  publisher_manufacturer?: string;
  order_description?: string;
  reference_image_url?: string;
}) {
  const lines = [
    `🛒 *New Custom Order Request*`,
    ``,
    `👤 *Name:* ${data.customer_name}`,
    `📱 *Phone:* ${data.customer_phone}`,
    ``,
    `📦 *Product:* ${data.product_name}`,
    `🏷️ *Category:* ${CATEGORY_LABELS[data.category] || data.category} — ${data.sub_category}`,
  ];

  if (data.publisher_manufacturer) {
    lines.push(`🏭 *Publisher/Manufacturer:* ${data.publisher_manufacturer}`);
  }
  if (data.order_description) {
    lines.push(``, `📝 *Additional Details:*`, data.order_description);
  }
  if (data.reference_image_url) {
    lines.push(``, `🔗 *Reference Image:* ${data.reference_image_url}`);
  }

  lines.push(``, `— Sent via D-Store Custom Orders`);

  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${text}`;
}

// POST — Public: submit a custom order
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const customer_name = (formData.get('customer_name') as string) || '';
    const customer_phone = (formData.get('customer_phone') as string) || '';
    const customer_email = (formData.get('customer_email') as string) || '';
    const product_name = (formData.get('product_name') as string) || '';
    const category = (formData.get('category') as string) || '';
    const sub_category = (formData.get('sub_category') as string) || '';
    const publisher_manufacturer = (formData.get('publisher_manufacturer') as string) || '';
    const order_description = (formData.get('order_description') as string) || '';
    const image = formData.get('reference_image') as File | null;

    // Validation
    if (!customer_name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!customer_phone.trim()) {
      return NextResponse.json({ error: 'WhatsApp number is required' }, { status: 400 });
    }
    if (!product_name.trim()) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }
    if (!category.trim()) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }
    if (!sub_category.trim()) {
      return NextResponse.json({ error: 'Sub-category is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Upload reference image, if provided
    let reference_image_url: string | null = null;
    if (image && image.size > 0) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(image.type)) {
        return NextResponse.json(
          { error: 'Invalid image type. Allowed: JPEG, PNG, WebP' },
          { status: 400 }
        );
      }
      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image too large. Maximum size is 5MB' }, { status: 400 });
      }

      const fileExt = image.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('custom-order-references')
        .upload(fileName, buffer, {
          contentType: image.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Reference image upload error:', uploadError);
        return NextResponse.json({ error: 'Failed to upload reference image' }, { status: 500 });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('custom-order-references')
        .getPublicUrl(uploadData.path);
      reference_image_url = publicUrl;
    }

    const { data: order, error } = await supabase
      .from('custom_orders')
      .insert({
        customer_name: customer_name.trim(),
        customer_phone: customer_phone.trim(),
        customer_email: customer_email.trim() || null,
        product_name: product_name.trim(),
        category: category.trim(),
        sub_category: sub_category.trim(),
        publisher_manufacturer: publisher_manufacturer.trim() || null,
        order_description: order_description.trim() || null,
        reference_image_url,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error) {
      console.error('Custom order creation error:', error);
      return NextResponse.json({ error: 'Failed to submit custom order' }, { status: 500 });
    }

    // Build WhatsApp URL for the customer to send
    const whatsappUrl = WHATSAPP_NUMBER
      ? buildWhatsAppUrl({
          customer_name,
          customer_phone,
          product_name,
          category,
          sub_category,
          publisher_manufacturer,
          order_description,
          reference_image_url: reference_image_url || undefined,
        })
      : null;

    return NextResponse.json({
      message: 'Custom order submitted successfully',
      order,
      whatsappUrl,
    });
  } catch (error: any) {
    console.error('Error creating custom order:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// GET — Admin only: fetch all custom orders
export async function GET() {
  try {
    const supabase = await createClient();

    // Check if user is admin (RLS will also enforce this)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: orders, error } = await supabase
      .from('custom_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching custom orders:', error);
      return NextResponse.json({ error: 'Failed to fetch custom orders' }, { status: 500 });
    }

    return NextResponse.json(orders || []);
  } catch (error: any) {
    console.error('Error fetching custom orders:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// PATCH — Admin only: update custom order status/notes
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, admin_notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;

    const { data: order, error } = await supabase
      .from('custom_orders')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating custom order:', error);
      return NextResponse.json({ error: 'Failed to update custom order' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Custom order updated', order });
  } catch (error: any) {
    console.error('Error updating custom order:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
