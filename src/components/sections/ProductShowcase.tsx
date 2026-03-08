import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface Product {
    id: string;
    name: string;
    price: string;
    image: string;
    rating: number;
}

export function ProductShowcase({
    title,
    products,
    centered = true
}: {
    title: string;
    products: Product[];
    centered?: boolean;
}) {
    return (
        <section className="py-20 border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className={`${centered ? 'text-center' : 'text-left'} text-heading mb-12`}>{title}</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                    {products.map((product) => (
                        <Link href={`/products/${product.id}`} key={product.id} className="group cursor-pointer space-y-4">
                            {/* Image Container */}
                            <div className="aspect-[4/5] bg-[#F0EEED] rounded-[1rem] overflow-hidden relative">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20 group-hover:scale-110 transition-transform duration-500">
                                        📦
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg truncate group-hover:underline decoration-2 underline-offset-4">{product.name}</h3>
                                <div className="flex items-center gap-2">
                                    <div className="flex text-yellow-400 text-sm">
                                        {"★".repeat(Math.round(product.rating || 5))}
                                        <span className="text-gray-300">{"★".repeat(5 - Math.round(product.rating || 5))}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{product.rating ? `${product.rating}/5` : '5/5'}</span>
                                </div>
                                <p className="font-bold text-xl">{product.price}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Button variant="outline" className="rounded-full px-12 h-12 border-border" asChild>
                        <Link href="/products">View All</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
