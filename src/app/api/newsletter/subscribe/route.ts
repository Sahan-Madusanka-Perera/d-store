import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Valid email address is required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Check if already subscribed
        const { data: existingSubscriber } = await supabase
            .from('newsletter_subscribers')
            .select('id, status')
            .eq('email', email)
            .single();

        if (existingSubscriber) {
            if (existingSubscriber.status === 'unsubscribed') {
                // Resubscribe them
                const { error: updateError } = await supabase
                    .from('newsletter_subscribers')
                    .update({ status: 'subscribed' })
                    .eq('email', email);

                if (updateError) throw updateError;

                return NextResponse.json({ message: 'Welcome back! You have been resubscribed.' });
            }
            // Already active
            return NextResponse.json({ message: 'You are already subscribed to our newsletter!' });
        }

        // Insert new subscriber
        const { error: insertError } = await supabase
            .from('newsletter_subscribers')
            .insert([{ email }]);

        if (insertError) {
            console.error('Insert error:', insertError);
            throw insertError;
        }

        return NextResponse.json(
            { message: 'Successfully subscribed to the newsletter!' },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred while subscribing.' },
            { status: 500 }
        );
    }
}
