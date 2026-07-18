import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight } from "lucide-react";

interface Product {
    id: string;
    name: string;
    price: string;
    images: string[];
    rating: number;
}

function RatingStars({ rating }: { rating: number }) {
    const rounded = Math.round(rating || 5);
    return (
        <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                        i < rounded
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted"
                    }`}
                />
            ))}
        </div>
    );
}

export function ProductShowcase({
    title,
    products,
    centered = true,
    eyebrow = "Fresh drops",
    subtitle,
}: {
    title: string;
    products: Product[];
    centered?: boolean;
    eyebrow?: string;
    subtitle?: string;
}) {
    return (
        <section className="py-20 sm:py-24 border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className={`${centered ? "text-center" : "text-left"} mb-12 sm:mb-14`}>
                    {eyebrow && (
                        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground mb-3">
                            {eyebrow}
                        </p>
                    )}
                    <h2 className="text-heading text-foreground">{title}</h2>
                    {subtitle && (
                        <p className={`mt-4 text-muted-foreground font-medium max-w-md ${centered ? "mx-auto" : ""}`}>
                            {subtitle}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
                    {products.map((product) => (
                        <Link
                            href={`/products/${product.id}`}
                            key={product.id}
                            className="group cursor-pointer"
                        >
                            {/* Image */}
                            <div className="aspect-[4/5] bg-muted rounded-2xl overflow-hidden relative border border-border/60 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:border-foreground/15 dark:group-hover:shadow-black/40">
                                {product.images && product.images.length > 0 ? (
                                    product.images.length > 1 ? (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={product.images[1]}
                                                alt={`${product.name} - view 2`}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 50vw, 25vw"
                                            />
                                            <Image
                                                src={product.images[0]}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:-translate-y-full"
                                                sizes="(max-width: 768px) 50vw, 25vw"
                                            />
                                        </div>
                                    ) : (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                        />
                                    )
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20">
                                        📦
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="mt-4 space-y-1.5 px-0.5">
                                <h3 className="font-semibold text-[15px] text-foreground leading-snug line-clamp-2 group-hover:underline decoration-2 underline-offset-4">
                                    {product.name}
                                </h3>
                                <div className="flex items-center gap-1.5">
                                    <RatingStars rating={product.rating} />
                                    <span className="text-xs text-muted-foreground font-medium">
                                        {product.rating ? `${product.rating}/5` : "5/5"}
                                    </span>
                                </div>
                                <p className="font-bold text-lg text-foreground pt-0.5">{product.price}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-14 text-center">
                    <Button
                        variant="outline"
                        className="rounded-full px-10 h-12 border-border font-semibold tracking-wide group"
                        asChild
                    >
                        <Link href="/products">
                            View All
                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
