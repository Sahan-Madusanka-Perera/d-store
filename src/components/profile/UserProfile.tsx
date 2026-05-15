'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User as UserIcon, Package, LogOut } from 'lucide-react'

interface UserProfileProps {
  onLogout?: () => void
}

export default function UserProfile({ onLogout }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout?.()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse hidden sm:block"></div>
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
      <DropdownMenuContent align="end" className="w-56 bg-white">
        <div className="px-2 py-2.5">
          <p className="text-sm font-medium leading-none text-gray-900">{user.user_metadata?.full_name || 'Account'}</p>
          <p className="text-xs leading-none text-gray-500 mt-1.5 truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/profile" className="flex items-center">
            <UserIcon className="mr-2 h-4 w-4 text-gray-500" />
            <span>Profile Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/profile/orders" className="flex items-center">
            <Package className="mr-2 h-4 w-4 text-gray-500" />
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