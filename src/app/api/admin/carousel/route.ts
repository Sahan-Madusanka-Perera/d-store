import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: slides, error } = await supabase
            .from('carousel_slides')
            .select('*')
            .order('sort_order', { ascending: true })

        if (error) throw error

        return NextResponse.json(slides)
    } catch (error) {
        console.error('Error fetching carousel slides:', error)
        return NextResponse.json(
            { error: 'Failed to fetch slides' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        await requireAdmin()

        const supabase = await createClient()
        const body = await request.json()

        // Automatically set sort_order if not provided
        if (typeof body.sort_order === 'undefined') {
            const { data: latest } = await supabase
                .from('carousel_slides')
                .select('sort_order')
                .order('sort_order', { ascending: false })
                .limit(1)
                .single()

            body.sort_order = latest ? latest.sort_order + 1 : 1;
        }

        const { data: slide, error } = await supabase
            .from('carousel_slides')
            .insert([body])
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(slide, { status: 201 })
    } catch (error) {
        console.error('Error creating carousel slide:', error)
        return NextResponse.json(
            { error: 'Failed to create slide' },
            { status: 500 }
        )
    }
}
