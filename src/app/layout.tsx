import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/Footer";

const oswald = Oswald({
  variable: "--font-heading",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "D-STORE | Premium Otaku Lifestyle",
  description: "Authentic Anime Merchandise, Figures, and Streetwear.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${oswald.variable} ${inter.variable} antialiased`}
      >
        {children}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
