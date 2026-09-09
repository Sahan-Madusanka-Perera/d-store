import type { NextConfig } from "next";

/**
 * Response headers.
 *
 * A shop that takes addresses, phone numbers and bank transfer slips should not be
 * framable by another site, should not leak its URLs to third parties on outbound
 * clicks, and should not let a browser second-guess a content type. None of these were
 * set, so the defaults applied — which is to say, none of this was true.
 *
 * Content-Security-Policy is deliberately absent for now. Getting it wrong breaks the
 * site silently in production, and this app inlines styles through Tailwind and loads
 * images from several CDNs, so a correct policy needs to be built and tested against a
 * real deploy rather than guessed at here. The headers below are the ones that are safe
 * to set blind. See the "Before launch" notes in SECURITY.md.
 */
const securityHeaders = [
  // Refuse to be rendered in a frame anywhere. Defeats clickjacking, where an attacker
  // overlays an invisible copy of your checkout on their own page.
  { key: 'X-Frame-Options', value: 'DENY' },

  // Modern equivalent of the above, and the one browsers actually prefer.
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },

  // Stop the browser guessing a response's type from its bytes — the trick that turns
  // an uploaded "image" into executable script.
  { key: 'X-Content-Type-Options', value: 'nosniff' },

  // Send the full URL only to ourselves; other origins see the bare origin. Order
  // confirmation URLs carry order ids, and those should not travel in a Referer header.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

  // Nothing here needs a camera, a microphone or a location. Say so.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },

  // Two years, subdomains included. Netlify and Vercel both serve HTTPS only, so this
  // costs nothing and closes the first-visit downgrade window.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bqeuhcdfjxexaxqpxnny.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
