import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin()

        const { id } = await params
        const supabase = await createClient()
        const body = await request.json()

        const { data: slide, error } = await supabase
            .from('carousel_slides')
            .update(body)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(slide)
    } catch (error) {
        console.error('Error updating carousel slide:', error)
        return NextResponse.json(
            { error: 'Failed to update slide' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin()

        const { id } = await params
        const supabase = await createClient()

        const { error } = await supabase
            .from('carousel_slides')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting carousel slide:', error)
        return NextResponse.json(
            { error: 'Failed to delete slide' },
            { status: 500 }
        )
    }
}
