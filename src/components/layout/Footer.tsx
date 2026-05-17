import Link from "next/link";
import { ConditionalNewsletter } from '@/components/sections/ConditionalNewsletter';
import { Newsletter } from '@/components/sections/Newsletter';
import { InstagramFeed } from '@/components/sections/InstagramFeed';
import { Twitter, Facebook, Instagram, CreditCard } from "lucide-react";
import { ConditionalInstagram } from '@/components/sections/ConditionalInstagram';
import Image from "next/image";

export function Footer() {
    return (
        <>
            <ConditionalNewsletter>
                <div className="w-full flex-col flex relative z-10 pb-16">
                    {/* Instagram Feed — only on homepage & listing pages */}
                    <ConditionalInstagram>
                        <div className="w-full px-4 md:px-8 max-w-7xl mx-auto mt-24 mb-16 sm:mb-24">
                            <InstagramFeed />
                        </div>
                    </ConditionalInstagram>
                    {/* The negative margin makes it overlap the footer which is conceptually directly after this component */}
                    <div className="w-full px-4 md:px-8 max-w-7xl mx-auto relative z-10 -mb-32 sm:-mb-40 md:-mb-48">
                        <Newsletter />
                    </div>
                </div>
            </ConditionalNewsletter>
            <footer className="relative border-t border-gray-200 bg-slate-50 pt-48 sm:pt-56 md:pt-64 pb-12 overflow-hidden">
                
                {/* Background Decorative Elements */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Subtle dot grid pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-60 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>
                    
                    {/* Beautiful soft glowing blobs */}
                    <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-40 right-10 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-indigo-400/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-16">
                        
                        {/* Logo & Brand (Left Side) */}
                        <div className="flex flex-col items-start max-w-md">
                            <div className="relative mb-4 p-2 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm">
                                <Link href="/" className="inline-block">
                                    <Image src="/Logo.Trns.png" alt="D-Store Logo" width={256} height={256} className="h-16 w-auto object-contain" />
                                </Link>
                            </div>
                            <p className="text-sm text-gray-600 mb-6 leading-relaxed font-medium">
                                Premium anime merchandise for the modern otaku. From exclusive action figures to high-quality apparel, we bring your favorite worlds to life.
                            </p>
                            <div className="flex gap-5">
                                {[Twitter, Facebook, Instagram].map((Icon, i) => (
                                    <a key={i} href="#" className="p-2.5 bg-white rounded-full shadow-sm text-gray-400 hover:text-indigo-600 hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-gray-100">
                                        <Icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Information Links (Right Side) */}
                        <div className="flex flex-wrap md:justify-end items-center gap-x-8 gap-y-4">
                            {[
                                "About Us",
                                "Customer Guide",
                                "Delivery",
                                "Privacy Policy"
                            ].map((link, idx) => (
                                <Link key={idx} href="#" className="relative text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors group px-2 py-1">
                                    {link}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full rounded-full"></span>
                                </Link>
                            ))}
                        </div>

                    </div>

                    {/* Bottom Bar */}
                    <div className="w-full border-t border-gray-200/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm font-medium text-gray-400">
                            &copy; {new Date().getFullYear()} D-Store. All rights reserved.
                        </p>
                        <div className="flex gap-4 items-center">
                            <CreditCard className="w-6 h-6 text-gray-300 hover:text-indigo-400 transition-colors cursor-pointer" />
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
