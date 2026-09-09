import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/constants";
import { SITE_URL, DEFAULT_OG_IMAGE, OG_LOCALE } from "@/lib/seo";
import { Toaster } from "@/components/ui/sonner";
import { ConditionalFooter } from '@/components/layout/ConditionalFooter';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/theme-provider';

const oswald = Oswald({
  variable: "--font-heading",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Without metadataBase, every relative Open Graph and canonical URL Next emits stays
  // relative — which crawlers and link unfurlers both ignore. It has to be absolute.
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${BRAND_NAME} | ${BRAND_TAGLINE}`,
    // Product and category pages set only their own name; this appends the brand, so
    // every tab and every search result carries it without repeating it in each file.
    template: `%s | ${BRAND_NAME}`,
  },

  // Written for a search result, not for a brochure: says what is sold, to whom, and
  // where, because "anime figures sri lanka" is the query that has to match.
  description:
    "Sri Lanka's hobby store for authentic anime merchandise — scale figures, manga, " +
    "graphic tees and collectibles. Island-wide delivery, bank transfer accepted.",

  keywords: [
    'anime figures sri lanka', 'manga sri lanka', 'anime merchandise colombo',
    'buy manga online sri lanka', 'anime store sri lanka', 'otaku sri lanka',
    'scale figures', 'graphic tshirts sri lanka',
  ],

  applicationName: BRAND_NAME,
  authors: [{ name: BRAND_NAME, url: SITE_URL }],
  creator: BRAND_NAME,
  publisher: BRAND_NAME,

  // Duplicate URLs are the commonest own goal for a small shop: the same page reachable
  // with and without a trailing slash, with tracking parameters, or on www and apex.
  // A self-referencing canonical tells Google which one is the real address.
  alternates: { canonical: '/' },

  openGraph: {
    type: 'website',
    siteName: BRAND_NAME,
    locale: OG_LOCALE,
    url: SITE_URL,
    title: `${BRAND_NAME} | ${BRAND_TAGLINE}`,
    description:
      "Sri Lanka's hobby store for authentic anime merchandise — scale figures, manga, " +
      "graphic tees and collectibles.",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: BRAND_NAME }],
  },

  twitter: {
    card: 'summary_large_image',
    title: `${BRAND_NAME} | ${BRAND_TAGLINE}`,
    description: "Sri Lanka's hobby store for anime figures, manga and apparel.",
    images: [DEFAULT_OG_IMAGE],
  },

  robots: {
    // Explicit rather than inherited, so the intent is visible in the HTML. The
    // pre-launch gate is handled in robots.ts, which is the file crawlers read first.
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${oswald.variable} ${inter.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          {/* <Footer /> is constructed here, in a Server Component, and handed to
              ConditionalFooter as children — see that file for why it must not be
              imported there instead. */}
          <ConditionalFooter>
            <Footer />
          </ConditionalFooter>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
