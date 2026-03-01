'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Mail, Loader2 } from 'lucide-react';

export default function NewsletterSettings() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/newsletter/manage');
                if (res.ok) {
                    const data = await res.json();
                    setIsSubscribed(data.isSubscribed);
                }
            } catch (error) {
                console.error("Failed to load newsletter status", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStatus();
    }, []);

    const handleToggle = async (checked: boolean) => {
        setIsUpdating(true);
        // Optimistic UI update
        setIsSubscribed(checked);

        try {
            const res = await fetch('/api/newsletter/manage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscribe: checked })
            });

            if (!res.ok) {
                throw new Error('Failed to update subscription');
            }
        } catch (error) {
            console.error(error);
            // Revert on failure
            setIsSubscribed(!checked);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50 border-b border-gray-100 flex flex-row items-center justify-between py-4">
                <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <CardTitle className="text-lg font-medium text-gray-900">Email Preferences</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-medium text-gray-900">D-Store Newsletter</h4>
                        <p className="text-sm text-gray-500 mt-1 max-w-sm">
                            Receive updates about new anime figures, manga restocks, and exclusive promotions directly to your inbox.
                        </p>
                    </div>

                    <div className="flex items-center justify-center min-w-[60px]">
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
                        ) : (
                            <Switch
                                checked={isSubscribed}
                                onCheckedChange={handleToggle}
                                disabled={isUpdating}
                                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-700"
                            />
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
