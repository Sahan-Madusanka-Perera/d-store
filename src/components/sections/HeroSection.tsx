import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
    const brands = ["SHONEN JUMP", "BANDAI", "GOOD SMILE", "VIZ MEDIA", "TOEI ANIMATION", "MAPPA"];

    return (
        <section className="relative w-full pt-20 border-b border-border">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-4 sm:px-6 lg:px-8 pb-12 items-center">

                    {/* Left Content */}
                    <div className="space-y-8 py-10">
                        <h1 className="text-display leading-[0.9]">
                            FIND GEAR <br />
                            THAT DEFINES <br />
                            YOUR SAGA
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-md">
                            Browse through our diverse range of meticulously curated garments, figures, and manga designed to bring out your inner protagonist.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button asChild size="lg" className="rounded-full px-12 h-14 text-base bg-black text-white hover:bg-black/90 tracking-wide">
                                <Link href="/products">SHOP NOW</Link>
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border/50 max-w-lg">
                            <div>
                                <p className="text-3xl font-bold">200+</p>
                                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">International Brands</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">2,000+</p>
                                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">High-Quality Products</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">30k+</p>
                                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Happy Customers</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="relative h-[600px] w-full hidden lg:block bg-[#F2F0F1] rounded-2xl overflow-hidden">
                        {/* Placeholder for Hero Image - Ideally a cutout of a character or model */}
                        <div className="absolute inset-0 flex items-center justify-center text-border">
                            <span className="text-9xl rotate-[-15deg] font-black opacity-10">D-STORE</span>
                        </div>
                        {/* Styling elements */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/0 to-transparent"></div>

                        {/* Star decorations */}
                        <div className="absolute top-10 right-10 text-4xl animate-pulse">✦</div>
                        <div className="absolute bottom-20 left-10 text-6xl animate-pulse" style={{ animationDelay: "1s" }}>✦</div>
                    </div>
                </div>
            </div>

            {/* Brand Strip */}
            <div className="bg-black py-10 w-full overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 relative flex overflow-hidden">
                    <div className="flex gap-20 animate-ticker whitespace-nowrap w-max">
                        {brands.concat(brands).map((brand, i) => (
                            <span key={i} className="text-white text-3xl font-black uppercase tracking-widest opacity-80 shrink-0">
                                {brand}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
