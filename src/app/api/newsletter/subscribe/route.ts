import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { renderNewsletterHtml, renderNewsletterText } from '@/lib/newsletter-template';
import { buildUnsubscribeUrl } from '@/lib/newsletter-unsubscribe';

/**
 * Public newsletter signup — the storefront footer and the pre-launch splash both post
 * here, and nobody is signed in for either.
 *
 * Reads go through the service-role key for the same reason unsubscribe writes do: RLS
 * scopes newsletter_subscribers SELECT to admins and to the row's own authenticated
 * owner, so an anonymous visitor's "are you already subscribed?" lookup comes back
 * empty every time. Trusting that empty answer meant every repeat address fell through
 * to the INSERT and died on the UNIQUE constraint, surfacing as a 500 — on the splash,
 * where a double tap is the norm. The key is server-only and must never reach the
 * client bundle; nothing here echoes a row back to the caller.
 */

const WELCOME_SUBJECT = 'You’re on the list — D-Store';
const WELCOME_HEADING = 'You’re on the list';
const WELCOME_BODY = `Thanks for signing up. D-Store is Sri Lanka's ultimate hobby store — manga, scale figures and otaku apparel — and we're still stocking the shelves.

You'll be among the first to hear when the doors open, and we'll send word before anything goes live.

Until then, come say hello on Instagram or WhatsApp.`;

function siteOrigin(request: Request): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    new URL(request.url).origin
  ).replace(/\/$/, '');
}

/**
 * Confirmation that the signup landed. Deliberately best-effort: the address is already
 * saved by the time this runs, so a provider outage must not turn a successful
 * subscription into an error the visitor sees. Failures go to the log instead.
 */
async function sendWelcome(email: string, siteUrl: string): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('[NEWSLETTER] RESEND_API_KEY is not set — welcome email skipped.');
    return;
  }

  try {
    const unsubscribeUrl = buildUnsubscribeUrl(email, siteUrl);
    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);

    const { error } = await resend.emails.send({
      from: process.env.NEWSLETTER_FROM || 'D-Store Updates <onboarding@resend.dev>',
      to: [email],
      subject: WELCOME_SUBJECT,
      html: renderNewsletterHtml({ heading: WELCOME_HEADING, body: WELCOME_BODY, siteUrl, unsubscribeUrl }),
      text: renderNewsletterText({ heading: WELCOME_HEADING, body: WELCOME_BODY, siteUrl, unsubscribeUrl }),
      headers: {
        // Same bulk-sender courtesy the campaigns extend; a welcome mail is still
        // marketing, and Gmail expects an unsubscribe path on it.
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });

    if (error) console.error('[NEWSLETTER] Welcome email rejected by Resend:', error);
  } catch (sendError) {
    console.error('[NEWSLETTER] Welcome email failed to dispatch:', sendError);
  }
}

export async function POST(request: Request) {
    try {
        const { email: rawEmail } = await request.json();

        if (!rawEmail || typeof rawEmail !== 'string' || !rawEmail.includes('@')) {
            return NextResponse.json(
                { error: 'Valid email address is required' },
                { status: 400 }
            );
        }

        // Stored lowercase so Foo@x.com and foo@x.com cannot become two rows — the
        // UNIQUE index is case-sensitive, and the unsubscribe HMAC is signed over the
        // lowercased address, so anything else desynchronises the two.
        const email = rawEmail.trim().toLowerCase();

        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceKey) {
            console.error('[NEWSLETTER] SUPABASE_SERVICE_ROLE_KEY is not set — cannot check for an existing subscriber.');
            return NextResponse.json(
                { error: 'Subscriptions are temporarily unavailable. Please try again later.' },
                { status: 503 }
            );
        }

        const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
            auth: { persistSession: false, autoRefreshToken: false },
        });

        // maybeSingle, not single: "no such subscriber" is the ordinary case here, not
        // an error worth throwing over.
        const { data: existingSubscriber, error: lookupError } = await admin
            .from('newsletter_subscribers')
            .select('id, status')
            .eq('email', email)
            .maybeSingle();

        if (lookupError) throw lookupError;

        if (existingSubscriber) {
            if (existingSubscriber.status !== 'subscribed') {
                const { error: updateError } = await admin
                    .from('newsletter_subscribers')
                    .update({ status: 'subscribed' })
                    .eq('email', email);

                if (updateError) throw updateError;

                await sendWelcome(email, siteOrigin(request));
                return NextResponse.json({ message: 'Welcome back! You have been resubscribed.' });
            }

            // Already active — say so rather than letting the UNIQUE index answer with a 500.
            return NextResponse.json({ message: 'You are already subscribed to our newsletter!' });
        }

        const { error: insertError } = await admin
            .from('newsletter_subscribers')
            .insert([{ email }]);

        if (insertError) {
            console.error('Insert error:', insertError);
            throw insertError;
        }

        await sendWelcome(email, siteOrigin(request));

        return NextResponse.json(
            { message: 'Successfully subscribed to the newsletter!' },
            { status: 201 }
        );

    } catch (error: unknown) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred while subscribing.' },
            { status: 500 }
        );
    }
}
