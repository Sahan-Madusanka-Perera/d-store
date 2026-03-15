import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const resolvedParams = await params;
        const supabase = await createClient();
        const body = await request.json();
        const { status, slipId, slipStatus, adminNotes } = body;

        // Update order status
        if (status) {
            const allowedStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
            if (!allowedStatuses.includes(status)) {
                return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
            }

            const { data, error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', resolvedParams.id)
                .select('*')
                .single();

            if (error) {
                console.error('Database update error:', error);
                return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
            }

            return NextResponse.json({ message: 'Order status updated successfully', order: data });
        }

        // Update bank slip status
        if (slipId && slipStatus) {
            const allowedSlipStatuses = ['pending', 'verified', 'rejected'];
            if (!allowedSlipStatuses.includes(slipStatus)) {
                return NextResponse.json({ error: 'Invalid slip status' }, { status: 400 });
            }

            const updateData: any = {
                status: slipStatus,
                updated_at: new Date().toISOString(),
            };
            if (adminNotes !== undefined) {
                updateData.admin_notes = adminNotes;
            }

            const { data, error } = await supabase
                .from('bank_slips')
                .update(updateData)
                .eq('id', slipId)
                .eq('order_id', resolvedParams.id)
                .select('*')
                .single();

            if (error) {
                console.error('Slip update error:', error);
                return NextResponse.json({ error: 'Failed to update slip status' }, { status: 500 });
            }

            // If slip is verified, update the order status to confirmed
            if (slipStatus === 'verified') {
                await supabase
                    .from('orders')
                    .update({ status: 'confirmed' })
                    .eq('id', resolvedParams.id);
            }

            return NextResponse.json({ message: 'Slip status updated successfully', slip: data });
        }

        return NextResponse.json({ error: 'No valid update data provided' }, { status: 400 });
    } catch (error: any) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { error: error.message || 'Unauthorized or server error' },
            { status: error.message === 'Unauthorized' ? 401 : 500 }
        );
    }
}
