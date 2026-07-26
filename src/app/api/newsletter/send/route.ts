import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { renderNewsletterHtml, renderNewsletterText } from '@/lib/newsletter-template';
import { buildUnsubscribeUrl } from '@/lib/newsletter-unsubscribe';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Ensure user is an admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
        }

        const { subject, heading, body, products, testOnly } = await request.json();

        if (!subject || !heading || !body) {
            return NextResponse.json({ error: 'Missing required campaign fields' }, { status: 400 });
        }

        // A test send goes to the signed-in admin alone and is never recorded as a
        // campaign, so the real thing can be proofed in a live inbox first.
        const isTest = testOnly === true;

        let recipients: string[];
        if (isTest) {
            if (!user.email) {
                return NextResponse.json({ error: 'Your admin account has no email address to test with.' }, { status: 400 });
            }
            recipients = [user.email];
        } else {
            const { data: subscribers } = await supabase
                .from('newsletter_subscribers')
                .select('email')
                .eq('status', 'subscribed');

            if (!subscribers || subscribers.length === 0) {
                return NextResponse.json({ error: 'No active subscribers found' }, { status: 400 });
            }
            recipients = subscribers.map(s => s.email);
        }

        const siteUrl = (
            process.env.NEXT_PUBLIC_SITE_URL ||
            process.env.NEXTAUTH_URL ||
            new URL(request.url).origin
        ).replace(/\/$/, '');

        // Stored in campaign history as a representative copy. The real sends below are
        // rendered per recipient so each carries its own signed unsubscribe link.
        const htmlContent = renderNewsletterHtml({ heading, body, products, siteUrl });

        // =========================================================================================
        // RESEND INTEGRATION
        // =========================================================================================
        const resendApiKey = process.env.RESEND_API_KEY;

        if (!resendApiKey) {
            console.error('[NEWSLETTER] Missing RESEND_API_KEY environment variable. Cannot send real emails.');
            return NextResponse.json({
                error: 'Server misconfiguration: Email dispatch is not enabled (missing provider keys).'
            }, { status: 500 });
        }

        const { Resend } = await import('resend');
        const resend = new Resend(resendApiKey);

        const fromAddress = process.env.NEWSLETTER_FROM || 'D-Store Updates <onboarding@resend.dev>';

        // One message per subscriber. Putting every address in a single `to` array
        // disclosed the whole mailing list to every recipient, and it left no way to give
        // each person their own unsubscribe link.
        let messages;
        try {
            messages = recipients.map(email => {
                const unsubscribeUrl = buildUnsubscribeUrl(email, siteUrl);
                return {
                    from: fromAddress,
                    to: [email],
                    subject: isTest ? `[TEST] ${subject}` : subject,
                    html: renderNewsletterHtml({ heading, body, products, siteUrl, unsubscribeUrl }),
                    text: renderNewsletterText({ heading, body, products, siteUrl, unsubscribeUrl }),
                    headers: {
                        // Gmail and Yahoo require these for bulk senders; without them
                        // campaigns get throttled or filtered regardless of content.
                        'List-Unsubscribe': `<${unsubscribeUrl}>`,
                        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
                    },
                };
            });
        } catch (signingError) {
            console.error('[NEWSLETTER] Could not sign unsubscribe links:', signingError);
            return NextResponse.json({
                error: 'Server misconfiguration: NEWSLETTER_SECRET (or NEXTAUTH_SECRET) is required to sign unsubscribe links.'
            }, { status: 500 });
        }

        console.log(`[NEWSLETTER] Dispatching ${isTest ? "TEST of " : ""}campaign "${subject}" to ${messages.length} recipient(s) via Resend...`);

        // Resend caps batch calls at 100 messages.
        const BATCH_SIZE = 100;
        try {
            for (let i = 0; i < messages.length; i += BATCH_SIZE) {
                const chunk = messages.slice(i, i + BATCH_SIZE);
                const { error: resendError } = await resend.batch.send(chunk);

                if (resendError) {
                    console.error('[NEWSLETTER] Resend API Error:', resendError);
                    throw new Error(resendError.message);
                }
            }
            console.log(`[NEWSLETTER] Dispatch complete: ${messages.length} messages.`);
        } catch (dispatchError) {
            console.error('[NEWSLETTER] Failed to dispatch via Resend:', dispatchError);
            return NextResponse.json({
                error: 'Failed to deliver emails through the provider. Please check server logs.'
            }, { status: 502 });
        }


        if (isTest) {
            return NextResponse.json(
                { message: `Test email sent to ${recipients[0]}. Check your inbox before sending for real.` },
                { status: 200 }
            );
        }

        // Record the campaign in history
        const { error: insertError } = await supabase
            .from('newsletter_campaigns')
            .insert([{
                subject: subject,
                content: htmlContent,
                sent_by: user.id,
                recipient_count: recipients.length
            }]);

        if (insertError) {
            console.error('Campaign history insert error:', insertError);
            throw insertError;
        }

        return NextResponse.json(
            { message: `Campaign sent to ${recipients.length} subscriber${recipients.length === 1 ? '' : 's'}.` },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Newsletter send error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred while sending the campaign.' },
            { status: 500 }
        );
    }
}
