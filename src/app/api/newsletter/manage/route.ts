import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET: Check if the current user is subscribed
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: subscription } = await supabase
            .from('newsletter_subscribers')
            .select('status')
            .eq('email', user.email)
            .maybeSingle();

        return NextResponse.json({
            isSubscribed: subscription?.status === 'subscribed'
        });

    } catch (error: any) {
        console.error('Newsletter status check error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred while checking status.' },
            { status: 500 }
        );
    }
}

// POST: Toggle subscription status
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { subscribe } = await request.json(); // boolean

        // Check if a record already exists
        const { data: existingSubscriber } = await supabase
            .from('newsletter_subscribers')
            .select('id')
            .eq('email', user.email)
            .maybeSingle();

        if (existingSubscriber) {
            // Update existing record
            const { error: updateError } = await supabase
                .from('newsletter_subscribers')
                .update({ status: subscribe ? 'subscribed' : 'unsubscribed' })
                .eq('email', user.email);

            if (updateError) throw updateError;
        } else if (subscribe) {
            // Create a new record if they want to subscribe but aren't in the table yet
            const { error: insertError } = await supabase
                .from('newsletter_subscribers')
                .insert([{ email: user.email, status: 'subscribed' }]);

            if (insertError) throw insertError;
        }

        return NextResponse.json({
            message: subscribe ? 'Successfully subscribed to the newsletter!' : 'You have been unsubscribed.'
        });

    } catch (error: any) {
        console.error('Newsletter toggle error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred while updating status.' },
            { status: 500 }
        );
    }
}
