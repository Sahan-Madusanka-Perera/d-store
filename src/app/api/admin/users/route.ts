import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET: List all users (admin only)
export async function GET() {
  try {
    await requireAdmin()
    
    const supabase = await createClient()
    
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(profiles)
  } catch (error) {
    return NextResponse.json(
      { error: 'Access denied or database error' },
      { status: 403 }
    )
  }
}

// POST: Update user role (admin only)
export async function POST(request: Request) {
  try {
    await requireAdmin()
    
    const { userId, newRole } = await request.json()
    
    if (!['admin', 'customer'].includes(newRole)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin or customer' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Access denied or update failed' },
      { status: 403 }
    )
  }
}