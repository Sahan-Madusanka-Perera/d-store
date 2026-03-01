import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/utils/supabase/server';
import NewsletterClient from './NewsletterClient';

export default async function NewsletterAdminPage() {
    await requireAdmin();
    const supabase = await createClient();

    // Fetch subscribers
    const { data: subscribers } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

    // Fetch products for the campaign builder
    const { data: products } = await supabase
        .from('products')
        .select('id, name, price, image_url, category, stock')
        .order('name');

    // Fetch previous campaigns
    const { data: campaigns } = await supabase
        .from('newsletter_campaigns')
        .select('*')
        .order('sent_at', { ascending: false });

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Newsletter Management</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your subscribers, compose beautiful marketing emails, and track your campaigns.
                    </p>
                </div>

                <NewsletterClient
                    initialSubscribers={subscribers || []}
                    products={products || []}
                    campaigns={campaigns || []}
                />
            </div>
        </div>
    );
}
