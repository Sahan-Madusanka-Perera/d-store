'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Card, CardContent } from '@/components/ui/card';
import {
    User as UserIcon,
    Package,
    Heart,
    Settings,
    LogOut
} from 'lucide-react';

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        getUser();
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        // If somehow middleware misses it, fallback to login
        window.location.href = '/login';
        return null;
    }

    const navigations = [
        { name: 'Overview', href: '/profile', icon: UserIcon },
        { name: 'My Orders', href: '/profile/orders', icon: Package },
        { name: 'My Wishlist', href: '/profile/wishlist', icon: Heart },
        { name: 'Settings', href: '/profile/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
                    <p className="text-gray-500 mt-1">Manage your profile and orders</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <Card className="border-0 shadow-sm overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-6 bg-gradient-to-br from-gray-900 to-black text-white">
                                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                                        {user.email?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="font-medium truncate">{user.user_metadata?.full_name || 'User'}</div>
                                    <div className="text-sm text-gray-400 truncate">{user.email}</div>
                                </div>

                                <nav className="flex flex-col p-2">
                                    {navigations.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${isActive
                                                        ? 'bg-primary/5 text-primary font-medium'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                    }`}
                                            >
                                                <item.icon className="h-5 w-5" />
                                                <span>{item.name}</span>
                                            </Link>
                                        );
                                    })}

                                    <div className="my-2 border-t border-gray-100"></div>

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-3 px-4 py-3 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left w-full"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        <span>Sign Out</span>
                                    </button>
                                </nav>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
