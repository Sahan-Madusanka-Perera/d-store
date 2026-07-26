import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

/**
 * Newsletter delivery depends on four pieces of configuration that live outside the
 * database, so a misconfigured install looks fine right up until a campaign silently
 * fails to reach anyone. This surfaces the state before the send button is pressed.
 *
 * Server component on purpose: it reads server-only env vars and must never report
 * their values, only whether they are set.
 */

type Level = 'ok' | 'warn' | 'error';

interface Check {
  label: string;
  level: Level;
  detail: string;
}

function runChecks(): Check[] {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL;
  const from = process.env.NEWSLETTER_FROM;
  const usingSandbox = !from || from.includes('onboarding@resend.dev');

  return [
    {
      label: 'Email provider (Resend)',
      level: process.env.RESEND_API_KEY ? 'ok' : 'error',
      detail: process.env.RESEND_API_KEY
        ? 'RESEND_API_KEY is set.'
        : 'RESEND_API_KEY is missing — sending is disabled entirely.',
    },
    {
      label: 'Sender address',
      level: usingSandbox ? 'error' : 'ok',
      detail: usingSandbox
        ? 'Using Resend’s sandbox sender, which only delivers to the address that verified your Resend account. Verify your domain and set NEWSLETTER_FROM before a real campaign.'
        : `Sending as ${from}.`,
    },
    {
      label: 'Public site URL',
      level: process.env.NEXT_PUBLIC_SITE_URL ? 'ok' : siteUrl ? 'warn' : 'error',
      detail: process.env.NEXT_PUBLIC_SITE_URL
        ? `Links and the logo resolve against ${process.env.NEXT_PUBLIC_SITE_URL}.`
        : siteUrl
          ? `NEXT_PUBLIC_SITE_URL is unset; falling back to NEXTAUTH_URL (${siteUrl}).`
          : 'NEXT_PUBLIC_SITE_URL is missing — the logo and every link in the email will be broken.',
    },
    {
      label: 'Unsubscribe',
      level:
        (process.env.NEWSLETTER_SECRET || process.env.NEXTAUTH_SECRET) && process.env.SUPABASE_SERVICE_ROLE_KEY
          ? 'ok'
          : 'error',
      detail: !(process.env.NEWSLETTER_SECRET || process.env.NEXTAUTH_SECRET)
        ? 'NEWSLETTER_SECRET (or NEXTAUTH_SECRET) is missing — links cannot be signed and sending will fail.'
        : !process.env.SUPABASE_SERVICE_ROLE_KEY
          ? 'SUPABASE_SERVICE_ROLE_KEY is missing — unsubscribe links will render an error page. Gmail and Yahoo require a working unsubscribe for bulk senders.'
          : 'Signed links and one-click unsubscribe are working.',
    },
  ];
}

const STYLES: Record<Level, { icon: typeof CheckCircle2; wrap: string; iconClass: string }> = {
  ok: { icon: CheckCircle2, wrap: 'border-emerald-200 bg-emerald-50/60', iconClass: 'text-emerald-600' },
  warn: { icon: AlertTriangle, wrap: 'border-amber-200 bg-amber-50/60', iconClass: 'text-amber-600' },
  error: { icon: XCircle, wrap: 'border-red-200 bg-red-50/60', iconClass: 'text-red-600' },
};

export default function NewsletterReadiness() {
  const checks = runChecks();
  const blocking = checks.filter(c => c.level === 'error').length;

  if (blocking === 0 && checks.every(c => c.level === 'ok')) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
        <p className="text-sm font-medium text-emerald-900">
          Newsletter delivery is fully configured.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Delivery configuration</h2>
        {blocking > 0 && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">
            {blocking} blocking
          </span>
        )}
      </div>

      <ul className="space-y-2.5">
        {checks.map(check => {
          const style = STYLES[check.level];
          const Icon = style.icon;
          return (
            <li key={check.label} className={`flex gap-3 rounded-lg border p-3 ${style.wrap}`}>
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.iconClass}`} />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900">{check.label}</div>
                <p className="mt-0.5 text-sm leading-relaxed text-gray-600">{check.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
