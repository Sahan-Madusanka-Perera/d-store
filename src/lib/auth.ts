import { createClient } from '@/utils/supabase/server'

export async function checkUserRole(requiredRole: 'admin' | 'customer' = 'customer') {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { user: null, hasAccess: false, role: null }
  }

  // Get user profile with role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role || 'customer'
  const hasAccess = userRole === requiredRole || (requiredRole === 'customer' && userRole === 'admin')

  return {
    user,
    hasAccess,
    role: userRole
  }
}

export async function requireAdmin() {
  const { user, hasAccess, role } = await checkUserRole('admin')
  
  if (!user || !hasAccess) {
    throw new Error(`Access denied. Required: admin, Current: ${role || 'none'}`)
  }
  
  return user
}