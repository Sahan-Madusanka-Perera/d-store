import Image from 'next/image';
import type { Metadata } from 'next';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';
import ComingSoonSignup from '@/components/sections/ComingSoonSignup';
import { BRAND_TAGLINE, SOCIAL_LINKS, getWhatsAppUrl } from '@/lib/constants';

/**
 * Pre-launch splash. Everything except the admin panel and sign-in redirects here
 * while COMING_SOON is set — see src/middleware.ts.
 *
 * Light surface on purpose: the logo is black artwork with a cyan glow, so on a dark
 * background the sword and the wordmark disappear and only the glow survives. The
 * page instead borrows that cyan for a bloom behind the mark and a single hairline,
 * keeping the same monochrome-plus-one-accent identity as the site and the newsletter.
 */

export const metadata: Metadata = {
  title: `D-STORE | Opening Soon`,
  description: `${BRAND_TAGLINE}. Manga, figures and otaku apparel, landing in Sri Lanka soon.`,
  robots: { index: false, follow: false },
};

const SOCIAL_ICONS: Record<string, typeof Instagram> = {
  Instagram,
  Facebook,
};

export default function ComingSoonPage() {
  const whatsappUrl = getWhatsAppUrl(
    "Hi D-Store! I saw you're opening soon — I'd like to know more.",
  );

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-12">
      {/* Brand hairline, the same cyan the newsletter masthead uses */}
      <div className="fixed inset-x-0 top-0 z-10 h-[3px] bg-[#4FC3F7]" aria-hidden="true" />

      <div className="flex w-full max-w-xl flex-col items-center text-center">
        {/* Mark, sitting in a bloom that picks up the glow in the artwork itself.
            The bloom must not go behind the parent's own background layer, so it
            stacks at z-0 with the logo above it rather than at a negative z-index. */}
        <div className="relative mb-6 animate-rise-in">
          <div
            aria-hidden="true"
            className="animate-bloom pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4FC3F7] blur-3xl"
          />
          <Image
            src="/Logo.Trns.png"
            alt="D-Store"
            width={200}
            height={200}
            priority
            className="relative h-36 w-36 object-contain sm:h-44 sm:w-44"
          />
        </div>

        <h1
          className="animate-rise-in text-foreground"
          style={{
            animationDelay: '90ms',
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.6rem, 10vw, 5rem)',
            lineHeight: 0.92,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            textWrap: 'balance',
          }}
        >
          Opening Soon
        </h1>

        <p
          className="animate-rise-in mt-5 max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          style={{ animationDelay: '170ms' }}
        >
          Manga, scale figures and apparel worth queuing for. Sri Lanka&rsquo;s ultimate
          hobby store opens shortly &mdash; we&rsquo;re still stocking the shelves.
        </p>

        <div className="animate-rise-in mt-8 flex w-full justify-center" style={{ animationDelay: '250ms' }}>
          <ComingSoonSignup />
        </div>

        <div
          className="animate-rise-in mt-8 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: '330ms' }}
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-foreground/15 px-5 py-3 text-[13px] font-bold uppercase tracking-[0.1em] text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
          >
            <MessageCircle className="h-4 w-4" />
            Message us
          </a>

          {SOCIAL_LINKS.map(({ href, label }) => {
            const Icon = SOCIAL_ICONS[label];
            return (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="inline-flex h-12 w-12 items-center justify-center border border-foreground/15 text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
            >
              <Icon className="h-4 w-4" />
            </a>
            );
          })}
        </div>

        <p
          className="animate-rise-in mt-8 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/60"
          style={{ animationDelay: '410ms' }}
        >
          D-Store &middot; Sri Lanka
        </p>
      </div>
    </main>
  );
}
