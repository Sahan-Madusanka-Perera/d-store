import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

/**
 * Bulk-sets the members-only flag on products.
 * One request per batch rather than one per product, so flipping 50 listings is a
 * single round trip. RLS still gates the write to admins; requireAdmin fails fast
 * with a clear error instead of letting the policy return a silent empty update.
 */
export async function PATCH(request: Request) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { ids, membersOnly } = body as { ids?: unknown; membersOnly?: unknown }

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids must be a non-empty array' }, { status: 400 })
    }
    if (typeof membersOnly !== 'boolean') {
      return NextResponse.json({ error: 'membersOnly must be a boolean' }, { status: 400 })
    }

    const numericIds = ids.map(Number)
    if (numericIds.some(id => !Number.isInteger(id))) {
      return NextResponse.json({ error: 'ids must be integers' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .update({ members_only: membersOnly })
      .in('id', numericIds)
      .select('id, members_only')

    if (error) throw error

    return NextResponse.json({ updated: data?.length ?? 0, products: data ?? [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const isAuth = message.startsWith('Access denied')
    console.error('Error updating product visibility:', error)
    return NextResponse.json(
      { error: isAuth ? message : 'Failed to update product visibility' },
      { status: isAuth ? 403 : 500 }
    )
  }
}
