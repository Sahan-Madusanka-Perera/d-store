import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles, Shirt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
    {
        href: "/manga",
        title: "Manga Universe",
        description: "Latest volumes & classic series",
        icon: BookOpen,
        gradient: "from-indigo-500 to-blue-600",
        bgGradient: "from-indigo-50/50 to-blue-50/30",
        btnText: "Explore Manga",
    },
    {
        href: "/figures",
        title: "Premium Figures",
        description: "Authentic collectors items",
        icon: Sparkles,
        gradient: "from-violet-500 to-purple-600",
        bgGradient: "from-violet-50/50 to-purple-50/30",
        btnText: "Explore Figures",
    },
    {
        href: "/tshirts",
        title: "Anime Apparel",
        description: "Custom designs & premium quality",
        icon: Shirt,
        gradient: "from-amber-500 to-orange-600",
        bgGradient: "from-amber-50/50 to-orange-50/30",
        btnText: "Explore Apparel",
    },
];

export function Categories() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background pointer-events-none"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
                        <Sparkles className="h-4 w-4 text-accent" />
                        <span className="text-sm font-semibold text-accent">Collections</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Explore Our Universe
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Carefully curated collections that bring your favorite anime worlds to life.
                        Browse through our extensive catalog.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {categories.map((category, index) => (
                        <Link key={index} href={category.href} className="group block h-full">
                            <Card className={`h-full border-border/50 hover:border-primary/30 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden bg-gradient-to-br ${category.bgGradient} backdrop-blur-sm`}>
                                <CardContent className="h-full flex flex-col items-center justify-between p-10 text-center">
                                    <div className="w-full">
                                        <div className="flex justify-center mb-8">
                                            <div className={`p-5 bg-gradient-to-br ${category.gradient} rounded-3xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500 ring-4 ring-white/50`}>
                                                <category.icon className="h-10 w-10 text-white" />
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{category.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed px-4">{category.description}</p>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-black/5 w-full">
                                        <span className="text-primary font-bold group-hover:gap-3 flex items-center justify-center gap-2 transition-all">
                                            {category.btnText}
                                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
