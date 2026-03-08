import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const resolvedParams = await params;
    try {
        await requireAdmin()

        const supabase = await createClient()
        const body = await request.json()

        const { data: discount, error } = await supabase
            .from('publisher_discounts')
            .update(body)
            .eq('id', resolvedParams.id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(discount)
    } catch (error) {
        console.error('Error updating publisher discount:', error)
        return NextResponse.json(
            { error: 'Failed to update publisher discount' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const resolvedParams = await params;
    try {
        await requireAdmin()

        const supabase = await createClient()
        const { error } = await supabase
            .from('publisher_discounts')
            .delete()
            .eq('id', resolvedParams.id)

        if (error) throw error

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Error deleting publisher discount:', error)
        return NextResponse.json(
            { error: 'Failed to delete publisher discount' },
            { status: 500 }
        )
    }
}
