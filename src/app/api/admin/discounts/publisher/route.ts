import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: discounts, error } = await supabase
            .from('publisher_discounts')
            .select('*')
            .order('publisher', { ascending: true })

        if (error) throw error

        return NextResponse.json(discounts)
    } catch (error) {
        console.error('Error fetching publisher discounts:', error)
        return NextResponse.json(
            { error: 'Failed to fetch publisher discounts' },
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
            .from('publisher_discounts')
            .insert([body])
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(discount, { status: 201 })
    } catch (error) {
        console.error('Error creating publisher discount:', error)
        return NextResponse.json(
            { error: 'Failed to create publisher discount' },
            { status: 500 }
        )
    }
}
