import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireAdmin();
        const supabase = await createClient();
        const { status } = await request.json();

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const allowedStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!allowedStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', params.id)
            .select('*')
            .single();

        if (error) {
            console.error('Database update error:', error);
            return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Order status updated successfully', order: data });
    } catch (error: any) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { error: error.message || 'Unauthorized or server error' },
            { status: error.message === 'Unauthorized' ? 401 : 500 }
        );
    }
}
