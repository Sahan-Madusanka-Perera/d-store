'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { readUserFromCookie } from '@/lib/session-cookie'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User as UserIcon, Package, LogOut, Shield } from 'lucide-react'

interface UserProfileProps {
  onLogout?: () => void
}

export default function UserProfile({ onLogout }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  // Start from the auth cookie, which is synchronous and cannot hang. The previous
  // version began at `loading: true` and only cleared it after awaiting
  // supabase.auth.getSession() — and that call hangs under Turbopack, which left the
  // account icon stuck in its grey, non-interactive skeleton with no way to click it.
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      // Seed from the cookie first. This is synchronous and cannot hang, so the trigger
      // reaches its correct state without waiting on supabase-js.
      const cookieUser = readUserFromCookie()
      if (cookieUser && mounted) {
        setUser(prev => prev ?? ({ id: cookieUser.id, email: cookieUser.email } as User))
      }

      // Then upgrade to the real session if it ever arrives. If it hangs, the
      // cookie-seeded state stands and the UI stays interactive.
      const { data: { session } } = await supabase.auth.getSession()

      if (mounted) {
        setUser(session?.user ?? null)
      }

      if (session?.user && mounted) {
        // Fetch admin role in the background
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (mounted && profile?.role === 'admin') {
          setIsAdmin(true)
        }
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
        
        if (session?.user && mounted) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()
          if (mounted) {
            setIsAdmin(profile?.role === 'admin')
          }
        } else if (mounted) {
          setIsAdmin(false)
        }
      }
    )

    return () => {
      mounted = false;
      subscription.unsubscribe();
    }
  }, [supabase.auth])

  const handleLogout = async () => {
    // The server route is what actually ends the session: it clears the auth cookies
    // the middleware reads, and it runs in Node where supabase-js does not hang.
    //
    // Navigation is never gated on the result. The old version awaited the browser
    // client's signOut(), and when that hung the redirect below simply never ran — the
    // button looked dead and the user stayed signed in. The race caps the wait so a
    // slow or failed request still lands you on /login.
    await Promise.race([
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined),
      new Promise(resolve => setTimeout(resolve, 2000)),
    ])

    onLogout?.()
    // Hard navigation, not router.push: it discards every cached server component and
    // client store holding the signed-in user, so nothing survives the sign-out.
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-4 h-8">
        <UserIcon className="h-5 w-5 text-zinc-400" strokeWidth={1.5} />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/login"
          className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="text-sm font-medium bg-black text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors hidden sm:block"
        >
          Sign Up
        </Link>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="flex items-center space-x-2 hover:bg-gray-50 p-1.5 rounded-md transition-colors cursor-pointer border border-transparent hover:border-gray-200">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-black text-white rounded-full flex items-center justify-center text-sm font-medium shadow-sm">
            {user.email?.[0]?.toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[120px] truncate">
            {user.user_metadata?.full_name || user.email?.split('@')[0]}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-2.5">
          <p className="text-sm font-medium leading-none text-foreground">{user.user_metadata?.full_name || 'Account'}</p>
          <p className="text-xs leading-none text-muted-foreground mt-1.5 truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        {isAdmin && (
          <>
            <DropdownMenuItem asChild className="cursor-pointer bg-primary/5 dark:bg-primary/10 text-foreground font-bold hover:bg-primary/10 dark:hover:bg-primary/15 focus:bg-primary/10">
              <Link href="/admin" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/profile" className="flex items-center">
            <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Profile Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/profile/orders" className="flex items-center">
            <Package className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>My Orders</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
          <LogOut className="mr-2 h-4 w-4 text-red-500" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}