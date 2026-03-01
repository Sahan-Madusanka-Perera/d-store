'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MailPlus, History, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import SubscriberList from './SubscriberList';
import CampaignBuilder from './CampaignBuilder';

export default function NewsletterClient({ initialSubscribers, products, campaigns }: {
    initialSubscribers: any[],
    products: any[],
    campaigns: any[]
}) {
    return (
        <Tabs defaultValue="subscribers" className="space-y-6">
            <TabsList className="bg-white border shadow-sm p-1 rounded-lg">
                <TabsTrigger value="subscribers" className="flex items-center gap-2 data-[state=active]:bg-gray-100">
                    <Users className="w-4 h-4" /> Subscribers
                </TabsTrigger>
                <TabsTrigger value="compose" className="flex items-center gap-2 data-[state=active]:bg-gray-100">
                    <MailPlus className="w-4 h-4" /> Compose Campaign
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2 data-[state=active]:bg-gray-100">
                    <History className="w-4 h-4" /> History
                </TabsTrigger>
            </TabsList>

            <TabsContent value="subscribers" className="space-y-4 outline-none">
                <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Subscribers List</CardTitle>
                                <CardDescription>A list of everyone who has signed up for the newsletter.</CardDescription>
                            </div>
                            <Badge variant="secondary" className="px-3 py-1 text-sm">
                                {initialSubscribers.length} Total
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <SubscriberList subscribers={initialSubscribers} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="compose" className="outline-none">
                <CampaignBuilder products={products} subscribersCount={initialSubscribers.filter(s => s.status === 'subscribed').length} />
            </TabsContent>

            <TabsContent value="history" className="outline-none">
                <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Campaign History</CardTitle>
                        <CardDescription>View previously sent newsletters.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {campaigns.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">No campaigns sent yet</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mt-1">When you send out marketing emails, their history will appear here.</p>
                            </div>
                        ) : (
                            <p>History component goes here...</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
