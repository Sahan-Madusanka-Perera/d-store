import Link from "next/link";
import { ConditionalNewsletter } from "@/components/ConditionalNewsletter";
import { Twitter, Facebook, Instagram, Github, CreditCard } from "lucide-react";

export function Footer() {
    return (
        <footer className="relative mt-40 sm:mt-48 md:mt-56 border-t border-gray-200 bg-white pt-48 sm:pt-56 md:pt-64 pb-12">
            <div className="absolute -top-32 sm:-top-40 md:-top-48 left-0 right-0 px-4 md:px-8 max-w-7xl mx-auto w-full">
                <ConditionalNewsletter />
            </div>

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
    );
}
