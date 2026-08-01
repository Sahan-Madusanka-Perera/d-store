import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Where the unsubscribe link lands after /api/newsletter/unsubscribe has done the work.
 * A real page rather than a string of HTML from the route, so it inherits the site's
 * Oswald/Inter and theme instead of the system-font stack the email is forced into.
 */

export const metadata = {
  title: 'Newsletter | D-Store',
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams?: Promise<{ status?: string; email?: string }>;
}

export default async function UnsubscribePage(props: PageProps) {
  const params = props.searchParams ? await props.searchParams : {};
  const succeeded = params.status === 'ok';
  const unavailable = params.status === 'unavailable';
  const email = typeof params.email === 'string' ? params.email : '';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-md text-center">
        <Image
          src="/Logo.Trns.png"
          alt="D-Store"
          width={140}
          height={140}
          priority
          className="logo-neon mx-auto mb-8 h-32 w-32 object-contain"
        />

        <div
          className={`mx-auto mb-7 flex h-14 w-14 items-center justify-center rounded-full ${
            succeeded ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
          }`}
        >
          {succeeded ? <CheckCircle2 className="h-7 w-7" /> : <AlertCircle className="h-7 w-7" />}
        </div>

        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-foreground text-balance">
          {succeeded ? "You're unsubscribed" : unavailable ? 'Something went wrong' : 'Link not valid'}
        </h1>

        <p className="mt-4 text-muted-foreground leading-relaxed font-medium text-pretty">
          {succeeded ? (
            <>
              {email ? (
                <>
                  We&rsquo;ve removed <span className="font-semibold text-foreground break-all">{email}</span> from
                  the D-Store newsletter.
                </>
              ) : (
                <>We&rsquo;ve removed you from the D-Store newsletter.</>
              )}{' '}
              You won&rsquo;t receive any more campaign emails. Order confirmations are unaffected.
            </>
          ) : unavailable ? (
            <>
              We couldn&rsquo;t process the request just now. Reply to the email and we&rsquo;ll remove you
              manually.
            </>
          ) : (
            <>
              This unsubscribe link is invalid or incomplete. Reply to the email and we&rsquo;ll remove you
              manually.
            </>
          )}
        </p>

        <div className="mt-10 flex flex-col gap-3">
          <Link
            href="/products"
            className="inline-flex items-center justify-center bg-foreground px-8 py-4 text-[13px] font-bold uppercase tracking-[0.12em] text-background transition-opacity hover:opacity-90"
          >
            Browse the store
          </Link>
          {succeeded && (
            <Link
              href="/profile"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline transition-colors"
            >
              Changed your mind? Re-subscribe from your profile
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
