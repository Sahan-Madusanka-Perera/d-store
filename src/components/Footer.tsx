import Link from "next/link";
import { ConditionalNewsletter } from "@/components/ConditionalNewsletter";
import { Newsletter } from '@/components/sections/Newsletter';
import { InstagramFeed } from '@/components/sections/InstagramFeed';
import { Twitter, Facebook, Instagram, Github, CreditCard } from "lucide-react";

export function Footer() {
    return (
        <>
            <ConditionalNewsletter>
                <div className="w-full flex-col flex relative z-10 pb-16">
                    <div className="w-full px-4 md:px-8 max-w-7xl mx-auto mt-24 mb-16 sm:mb-24">
                        <InstagramFeed />
                    </div>
                    {/* The negative margin makes it overlap the footer which is conceptually directly after this component */}
                    <div className="w-full px-4 md:px-8 max-w-7xl mx-auto relative z-10 -mb-32 sm:-mb-40 md:-mb-48">
                        <Newsletter />
                    </div>
                </div>
            </ConditionalNewsletter>
            <footer className="relative border-t border-gray-200 bg-white pt-48 sm:pt-56 md:pt-64 pb-12">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center">
                <Link href="/" className="inline-block mb-6">
                    <div className="text-3xl font-bold text-black">D-Store</div>
                </Link>
                
                <p className="mt-2 text-center text-sm text-gray-500 max-w-md mb-8">
                    Premium anime merchandise for the modern otaku. From exclusive figures to high-quality apparel.
                </p>

                <div className="flex gap-6 mb-8">
                    {[Twitter, Facebook, Instagram, Github].map((Icon, i) => (
                        <a key={i} href="#" className="text-gray-400 hover:text-black transition-colors">
                            <Icon className="w-5 h-5" />
                        </a>
                    ))}
                </div>

                <div className="w-full border-t border-gray-200 mt-4 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400">
                        &copy; 2026 D-Store. All rights reserved.
                    </p>
                    <div className="flex gap-4 text-sm text-gray-500">
                        <Link href="#" className="hover:text-black transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-black transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-black transition-colors">Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
        </>
    );
}
