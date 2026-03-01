import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, Heart, BookOpen, Shirt, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center justify-center">
      {/* Sophisticated Animated Background */}
      <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-3xl float-animation opacity-60"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-br from-accent/15 to-primary/10 rounded-full blur-3xl float-animation opacity-60" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-primary/10 to-accent/15 rounded-full blur-3xl float-animation opacity-50" style={{ animationDelay: '2s' }}></div>

        {/* Elegant Geometric Patterns */}
        <div className="absolute top-20 right-20 w-32 h-32 border border-primary/10 rotate-45 animate-spin" style={{ animationDuration: '30s' }}></div>
        <div className="absolute bottom-32 left-16 w-24 h-24 border border-accent/10 rotate-12 animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }}></div>
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 fade-in-up z-10">
            {/* Hero Badge - Refined */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-background/60 backdrop-blur-md border border-primary/10 rounded-full shadow-sm hover:border-primary/20 transition-colors">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Sri Lanka's Premier Otaku Haven
              </span>
              <Sparkles className="w-4 h-4 text-accent" />
            </div>

            {/* Main Title - Elegant */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
                <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                  DISCOVER THE
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent pb-2">
                  OTAKU UNIVERSE
                </span>
              </h1>

              <p className="text-xl text-muted-foreground/90 max-w-lg leading-relaxed font-medium">
                Your gateway to authentic Japanese pop culture in Sri Lanka. Premium manga, figures, and exclusive merchandise.
              </p>
            </div>

            {/* CTA Buttons - Elegant */}
            <div className="flex flex-col sm:flex-row gap-5">
              <Button size="lg" className="h-14 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold shadow-lg hover:shadow-primary/25 transition-all duration-300 px-10 rounded-xl text-base" asChild>
                <Link href="/products" className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Shop Now
                  <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="h-14 border-2 hover:bg-primary/5 hover:border-primary/30 rounded-xl px-10 shadow-sm hover:shadow-md transition-all duration-300 text-base font-semibold bg-background/50 backdrop-blur-sm">
                <Link href="/figures" className="flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-accent group-hover:scale-110 transition-transform duration-300" />
                  Premium Figures
                </Link>
              </Button>
            </div>

            {/* Stats - Refined */}
            <div className="grid grid-cols-3 gap-8 pt-6 border-t border-border/40">
              <div className="space-y-1">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">2K+</div>
                <div className="text-sm text-muted-foreground font-medium">Authentic Products</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">30K+</div>
                <div className="text-sm text-muted-foreground font-medium">Otaku Community</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Island</div>
                <div className="text-sm text-muted-foreground font-medium">Wide Delivery</div>
              </div>
            </div>
          </div>

          {/* Hero Visual - Elegant */}
          <div className="relative hidden lg:block perspective-1000">
            <div className="relative aspect-square max-w-lg mx-auto transform transition-transform duration-700 hover:rotate-y-12 hover:rotate-x-6 preserve-3d">
              {/* Main Hero Card - Refined */}
              <div className="absolute inset-4 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-2xl p-8 transform rotate-6 hover:rotate-3 transition-all duration-500 z-10 glass-card">
                 {/* Inner Content */}
                <div className="h-full w-full rounded-2xl overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 z-0"></div>
                     <div className="w-full h-full bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 flex items-center justify-center relative z-10">
                        <span className="text-9xl animate-float drop-shadow-2xl filter">🎎</span>
                     </div>
                </div>

                 {/* Card Details Overlay */}
                 <div className="absolute bottom-8 left-8 right-8 bg-white/90 dark:bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg">Demon Slayer</h3>
                            <p className="text-xs text-muted-foreground">Limited Artfx J Figure</p>
                        </div>
                        <div className="text-right">
                             <p className="font-bold text-primary">LKR 28,500</p>
                             <div className="flex text-amber-400 text-xs">
                                 {[1,2,3,4,5].map(i => <Sparkles key={i} className="w-3 h-3 fill-current" />)}
                             </div>
                        </div>
                    </div>
                 </div>
              </div>
              
              {/* Decorative Elements behind card */}
               <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-[2.5rem] blur-2xl opacity-20 transform rotate-12 scale-95 -z-10 animate-pulse"></div>


              {/* Floating Icons - Subtle */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-background/80 backdrop-blur-xl border border-white/40 rounded-3xl flex items-center justify-center shadow-xl float-animation z-20">
                <BookOpen className="h-10 w-10 text-primary drop-shadow-md" />
              </div>
              <div className="absolute -bottom-8 -right-4 w-24 h-24 bg-background/80 backdrop-blur-xl border border-white/40 rounded-3xl flex items-center justify-center shadow-xl float-animation z-20" style={{ animationDelay: '0.5s' }}>
                <Shirt className="h-10 w-10 text-accent drop-shadow-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
