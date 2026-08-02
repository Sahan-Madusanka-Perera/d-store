import Image from 'next/image';
import type { Metadata } from 'next';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';
import ComingSoonBackdrop from '@/components/sections/ComingSoonBackdrop';
import ComingSoonSignup from '@/components/sections/ComingSoonSignup';
import { BRAND_TAGLINE, SOCIAL_LINKS, getWhatsAppUrl } from '@/lib/constants';

/**
 * Pre-launch splash. Everything except the admin panel and sign-in redirects here
 * while COMING_SOON is set — see src/middleware.ts.
 *
 * Dark surface, fixed, regardless of the visitor's theme: a looping AMV plays behind
 * everything (ComingSoonBackdrop), and copy over footage only has one safe direction.
 * That means no `foreground`/`background` tokens anywhere on this page — those invert
 * with the theme, and in light mode they would paint black text onto the video. Colours
 * here are literal white-on-black instead, with the cyan the newsletter masthead uses
 * as the single accent.
 *
 * Legibility is bought twice over: the backdrop dims and softens the footage, and the
 * copy column sits on its own blurred scrim below. Both are needed — the footage has
 * white flash frames that a single flat overlay cannot cover without killing the video.
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

// Lifts the copy off the brightest frames without reading as a drop shadow.
const HALO = { textShadow: '0 1px 20px rgba(0,0,0,0.6)' };

export default function ComingSoonPage() {
  const whatsappUrl = getWhatsAppUrl(
    "Hi D-Store! I saw you're opening soon — I'd like to know more.",
  );

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-6 py-12">
      <ComingSoonBackdrop />

      {/* Brand hairline, the same cyan the newsletter masthead uses */}
      <div className="fixed inset-x-0 top-0 z-20 h-[3px] bg-[#4FC3F7]" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-xl">
        {/* The copy's own pool of shade. Sized off the column rather than the viewport
            so it covers the text on every screen, and blurred so it has no visible
            edge — it reads as the footage falling away, not as a panel. Sits before
            the content in flow order, so no z-index is needed to keep it behind. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-12 -inset-y-16 rounded-[45%] bg-black/60 blur-3xl"
        />

        <div className="relative flex flex-col items-center text-center">
          {/* Mark, lit twice over: a wide cyan bloom for ambience, picking up the sword
              inside the artwork and the hairline above, and the mark's own warm halo
              (.logo-neon) for the ring. Cool ambience under a warm sign is how real
              neon reads, and it keeps both of the logo's colours in play.
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
              className="logo-neon relative h-36 w-36 object-contain sm:h-44 sm:w-44"
            />
          </div>

          <h1
            className="animate-rise-in text-white"
            style={{
              ...HALO,
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
            className="animate-rise-in mt-5 max-w-md text-pretty text-base leading-relaxed text-white/80 sm:text-lg"
            style={{ ...HALO, animationDelay: '170ms' }}
          >
            Manga, figures and apparel worth queuing for.
            <br />
            Sri Lanka&rsquo;s ultimate
            hobby store opens shortly! We&rsquo;re still stocking the shelves.
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
              className="inline-flex items-center gap-2 border border-white/30 bg-black/25 px-5 py-3 text-[13px] font-bold uppercase tracking-[0.1em] text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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
                  className="inline-flex h-12 w-12 items-center justify-center border border-white/30 bg-black/25 text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>

          <p
            className="animate-rise-in mt-8 text-xs font-medium uppercase tracking-[0.2em] text-white/65"
            style={{ ...HALO, animationDelay: '410ms' }}
          >
            D-Store &middot; Sri Lanka
          </p>
        </div>
      </div>
    </main>
  );
}
