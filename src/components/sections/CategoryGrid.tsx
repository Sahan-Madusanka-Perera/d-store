import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function CategoryGrid() {
    return (
        <section className="py-20 border-b border-border bg-[#F0F0F0] rounded-[2rem] mx-4 sm:mx-8 lg:mx-12 my-12">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <h2 className="text-heading text-center mb-16">BROWSE BY REALM</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
                    {/* Manga - Large Square */}
                    <Link href="/manga" className="relative group overflow-hidden rounded-[1.5rem] bg-white md:col-span-1 md:row-span-2">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1613376023733-0a73315d9b06?q=80&w=2940&auto=format&fit=crop')] bg-center bg-cover transition-transform duration-700 group-hover:scale-110"></div>
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                        <h3 className="absolute top-8 left-8 text-3xl font-bold bg-white px-4 py-2 rounded-lg">MANGA</h3>
                        <ArrowUpRight className="absolute top-8 right-8 w-8 h-8 text-black bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0" />
                    </Link>

                    {/* Figures - Wide Rectangle */}
                    <Link href="/figures" className="relative group overflow-hidden rounded-[1.5rem] bg-white md:col-span-2">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-blue-100"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-6xl grayscale opacity-20">🎎</span>
                        </div>
                        <h3 className="absolute top-8 left-8 text-3xl font-bold bg-white px-4 py-2 rounded-lg">FIGURES</h3>
                        <ArrowUpRight className="absolute top-8 right-8 w-8 h-8 text-black bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0" />
                    </Link>

                    {/* Apparel - Small Square */}
                    <Link href="/tshirts" className="relative group overflow-hidden rounded-[1.5rem] bg-white">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-orange-100"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-6xl grayscale opacity-20">👕</span>
                        </div>
                        <h3 className="absolute top-8 left-8 text-3xl font-bold bg-white px-4 py-2 rounded-lg">APPAREL</h3>
                        <ArrowUpRight className="absolute top-8 right-8 w-8 h-8 text-black bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0" />
                    </Link>

                    {/* Accessories - Small Square */}
                    <Link href="/accessories" className="relative group overflow-hidden rounded-[1.5rem] bg-white">
                        <div className="absolute inset-0 bg-gradient-to-bl from-pink-100 to-red-100"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-6xl grayscale opacity-20">🎒</span>
                        </div>
                        <h3 className="absolute top-8 left-8 text-3xl font-bold bg-white px-4 py-2 rounded-lg">GEAR</h3>
                        <ArrowUpRight className="absolute top-8 right-8 w-8 h-8 text-black bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
