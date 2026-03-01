import Link from "next/link";
import { ConditionalNewsletter } from "@/components/ConditionalNewsletter";
import { Twitter, Facebook, Instagram, Github, CreditCard } from "lucide-react";

export function Footer() {
    return (
        <footer className="relative mt-20 md:mt-32 bg-[#F0F0F0] pt-40 pb-10">
            {/* Newsletter Pill - Absolute Positioned to overlap */}
            <div className="absolute -top-20 left-0 right-0 px-4 md:px-8 max-w-7xl mx-auto w-full">
                <ConditionalNewsletter />
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-black/10 pb-12">

                    {/* Brand Column */}
                    <div className="md:col-span-4 space-y-6">
                        <Link href="/" className="inline-block">
                            <div className="relative h-10 w-28">
                                <img src="/Logo.Trns.png" alt="D-Store Logo" className="h-full w-full object-contain grayscale brightness-0" />
                            </div>
                        </Link>
                        <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
                            We have products that suit your otaku lifestyle and which you're proud to wear. From hoodies to figures.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Facebook, Instagram].map((Icon, i) => (
                                <a key={i} href="#" className="w-8 h-8 rounded-full bg-white border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
                        <div className="space-y-4">
                            <h4 className="font-bold tracking-widest text-sm uppercase">Company</h4>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li><Link href="#" className="hover:text-black transition-colors">About</Link></li>
                                <li><Link href="#" className="hover:text-black transition-colors">Features</Link></li>
                                <li><Link href="#" className="hover:text-black transition-colors">Works</Link></li>
                                <li><Link href="#" className="hover:text-black transition-colors">Career</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold tracking-widest text-sm uppercase">Help</h4>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li><Link href="#" className="hover:text-black transition-colors">Customer Support</Link></li>
                                <li><Link href="#" className="hover:text-black transition-colors">Delivery Details</Link></li>
                                <li><Link href="#" className="hover:text-black transition-colors">Terms & Conditions</Link></li>
                                <li><Link href="#" className="hover:text-black transition-colors">Privacy Policy</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold tracking-widest text-sm uppercase">FAQ</h4>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li><Link href="#" className="hover:text-black transition-colors">Account</Link></li>
                                <li><Link href="#" className="hover:text-black transition-colors">Manage Deliveries</Link></li>
                                <li><Link href="#" className="hover:text-black transition-colors">Orders</Link></li>
                                <li><Link href="#" className="hover:text-black transition-colors">Payments</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold tracking-widest text-sm uppercase">Resources</h4>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li><Link href="#" className="hover:text-black transition-colors">Free eBooks</Link></li>
                                <li><Link href="#" className="hover:text-black transition-colors">Development Tutorial</Link></li>
                                <li><Link href="#" className="hover:text-black transition-colors">How to - Blog</Link></li>
                                <li><Link href="#" className="hover:text-black transition-colors">Youtube Playlist</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        D-Store © 2026, All Rights Reserved
                    </p>
                    <div className="flex gap-4 opacity-60 grayscale">
                        {/* Placeholder for payment icons */}
                        <div className="h-8 w-12 bg-white rounded border border-black/10 flex items-center justify-center"><CreditCard className="w-5 h-5" /></div>
                        <div className="h-8 w-12 bg-white rounded border border-black/10 flex items-center justify-center"><CreditCard className="w-5 h-5" /></div>
                        <div className="h-8 w-12 bg-white rounded border border-black/10 flex items-center justify-center"><CreditCard className="w-5 h-5" /></div>
                        <div className="h-8 w-12 bg-white rounded border border-black/10 flex items-center justify-center"><CreditCard className="w-5 h-5" /></div>
                        <div className="h-8 w-12 bg-white rounded border border-black/10 flex items-center justify-center"><CreditCard className="w-5 h-5" /></div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
