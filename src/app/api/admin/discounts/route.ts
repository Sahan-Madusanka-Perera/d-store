import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: discounts, error } = await supabase
            .from('quantity_discounts')
            .select('*')
            .order('min_quantity', { ascending: true })

        if (error) throw error

        return NextResponse.json(discounts)
    } catch (error) {
        console.error('Error fetching discounts:', error)
        return NextResponse.json(
            { error: 'Failed to fetch discounts' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        await requireAdmin()

        const supabase = await createClient()
        const body = await request.json()

        const { data: discount, error } = await supabase
            .from('quantity_discounts')
            .insert([body])
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(discount, { status: 201 })
    } catch (error) {
        console.error('Error creating discount:', error)
        return NextResponse.json(
            { error: 'Failed to create discount' },
            { status: 500 }
        )
    }
}
