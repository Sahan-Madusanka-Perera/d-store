// Legacy client for backward compatibility
// Use utils/supabase/client.ts for new components
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Re-export the new clients for convenience
export { createClient as createBrowserClient } from '../utils/supabase/client'
export { createClient as createServerClient } from '../utils/supabase/server'