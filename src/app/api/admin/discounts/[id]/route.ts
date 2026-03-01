import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await requireAdmin()

        const supabase = await createClient()
        const body = await request.json()

        const { data: discount, error } = await supabase
            .from('quantity_discounts')
            .update(body)
            .eq('id', params.id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(discount)
    } catch (error) {
        console.error('Error updating discount:', error)
        return NextResponse.json(
            { error: 'Failed to update discount' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await requireAdmin()

        const supabase = await createClient()

        const { error } = await supabase
            .from('quantity_discounts')
            .delete()
            .eq('id', params.id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting discount:', error)
        return NextResponse.json(
            { error: 'Failed to delete discount' },
            { status: 500 }
        )
    }
}
