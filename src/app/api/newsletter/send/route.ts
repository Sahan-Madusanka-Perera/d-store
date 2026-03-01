import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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

        const { subject, heading, body, products } = await request.json();

        if (!subject || !heading || !body) {
            return NextResponse.json({ error: 'Missing required campaign fields' }, { status: 400 });
        }

        // Get all active subscribers
        const { data: subscribers } = await supabase
            .from('newsletter_subscribers')
            .select('email')
            .eq('status', 'subscribed');

        if (!subscribers || subscribers.length === 0) {
            return NextResponse.json({ error: 'No active subscribers found' }, { status: 400 });
        }

        // Generate the raw HTML representation of the email
        // This is a simplified version of the React component's preview, converted to literal HTML string for email clients
        const htmlContent = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #111; padding: 32px; text-align: center; border-bottom: 1px solid #333;">
                    <h1 style="color: #60a5fa; margin: 0; font-size: 28px; text-transform: uppercase;">D-STORE</h1>
                    <p style="color: #9ca3af; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Premium Otaku Lifestyle</p>
                </div>
                <div style="padding: 32px;">
                    <h2 style="font-size: 24px; margin-top: 0;">${heading}</h2>
                    <p style="color: #d1d5db; line-height: 1.6; white-space: pre-wrap;">${body}</p>
                    ${products && products.length > 0 ? `
                        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #333;">
                            <h3 style="color: #9ca3af; font-size: 14px; text-transform: uppercase; text-align: center; margin-bottom: 24px;">Featured Gear</h3>
                            ${products.map((p: any) => `
                                <div style="display: flex; gap: 16px; background-color: #111; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                                    ${p.image_url ? `<img src="${p.image_url}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;" alt="${p.name}"/>` : ''}
                                    <div>
                                        <h4 style="margin: 0 0 4px 0; font-size: 16px;">${p.name}</h4>
                                        <p style="color: #c084fc; font-weight: bold; margin: 0;">LKR ${p.price.toLocaleString()}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div style="padding: 24px; text-align: center; background-color: #111; border-top: 1px solid #333;">
                    <p style="color: #6b7280; font-size: 12px;">You are receiving this because you subscribed to D-Store updates.</p>
                </div>
            </div>
        `;

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

        // When testing Resend on a free plan, you can only send TO the email address 
        // that verified the domain. In production with a custom domain, you can send to anyone.
        const recipientEmails = subscribers.map(s => s.email);

        console.log(`[NEWSLETTER] Dispatching campaign "${subject}" to ${recipientEmails.length} recipients via Resend...`);

        try {
            const { data: resendData, error: resendError } = await resend.emails.send({
                from: 'D-Store Updates <onboarding@resend.dev>', // Update this to your verified domain later (e.g., updates@d-store.com)
                to: recipientEmails,
                subject: subject,
                html: htmlContent,
            });

            if (resendError) {
                console.error('[NEWSLETTER] Resend API Error:', resendError);
                throw new Error(resendError.message);
            }

            console.log('[NEWSLETTER] Resend Dispatch Success:', resendData);
        } catch (dispatchError) {
            console.error('[NEWSLETTER] Failed to dispatch via Resend:', dispatchError);
            return NextResponse.json({
                error: 'Failed to deliver emails through the provider. Please check server logs.'
            }, { status: 502 });
        }


        // Record the campaign in history
        const { error: insertError } = await supabase
            .from('newsletter_campaigns')
            .insert([{
                subject: subject,
                content: htmlContent,
                sent_by: user.id,
                recipient_count: subscribers.length
            }]);

        if (insertError) {
            console.error('Campaign history insert error:', insertError);
            throw insertError;
        }

        return NextResponse.json(
            { message: `Campaign successfully sent to ${subscribers.length} subscribers!` },
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
