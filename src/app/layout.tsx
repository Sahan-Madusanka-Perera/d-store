import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import { BRAND_TAGLINE } from "@/lib/constants";
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
  title: `D-STORE | ${BRAND_TAGLINE}`,
  description: "Authentic Anime Merchandise, Figures, and Streetwear.",
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
