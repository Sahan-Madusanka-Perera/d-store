import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface RealmTile {
    href: string;
    title: string;
    tagline: string;
    imageUrl: string;
    /* Tailwind classes controlling the tile's position in the bento grid */
    span: string;
}

const REALMS: RealmTile[] = [
    {
        href: "/manga",
        title: "Manga",
        tagline: "Volumes, box sets & light novels",
        imageUrl:
            "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?q=80&w=2940&auto=format&fit=crop",
        span: "md:col-span-1 md:row-span-2",
    },
    {
        href: "/figures",
        title: "Figures",
        tagline: "Scale figures, Nendoroids & Gunpla",
        imageUrl:
            "https://images.unsplash.com/photo-1769479027867-817973e429af?q=80&w=1720&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        span: "md:col-span-2",
    },
    {
        href: "/tshirts",
        title: "Apparel",
        tagline: "Graphic tees for every fandom",
        imageUrl:
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1600&auto=format&fit=crop",
        span: "",
    },
    {
        href: "/other",
        title: "Other Collectibles",
        tagline: "TCG cards & collectibles",
        imageUrl:
            "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?q=80&w=1600&auto=format&fit=crop",
        span: "",
    },
];

export function CategoryGrid() {
    return (
        <section className="py-20 sm:py-24 bg-muted rounded-[2rem] mx-4 sm:mx-8 lg:mx-12 my-12 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Section header */}
                <div className="text-center mb-14 sm:mb-16">
                    <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground mb-3">
                        Shop by category
                    </p>
                    <h2 className="text-heading text-foreground">Browse by Realm</h2>
                    <p className="mt-4 text-muted-foreground max-w-md mx-auto font-medium">
                        One store, four realms — pick where your collection grows next.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 h-auto md:h-[600px]">
                    {REALMS.map((realm) => (
                        <Link
                            key={realm.href}
                            href={realm.href}
                            className={`group relative overflow-hidden rounded-[1.5rem] bg-card min-h-[220px] ${realm.span}`}
                        >
                            {/* Image */}
                            <div
                                className="absolute inset-0 bg-center bg-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                                style={{ backgroundImage: `url('${realm.imageUrl}')` }}
                            />

                            {/* Scrim — keeps text legible in both themes */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5 transition-opacity duration-500 group-hover:from-black/90" />

                            {/* Content */}
                            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 flex items-end justify-between gap-4">
                                <div className="min-w-0">
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                        {realm.title}
                                    </h3>
                                    <p className="mt-1 text-[13px] sm:text-sm text-white/75 font-medium truncate transition-all duration-300 group-hover:text-white">
                                        {realm.tagline}
                                    </p>
                                </div>
                                <span className="shrink-0 w-11 h-11 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:scale-110">
                                    <ArrowUpRight className="w-5 h-5" strokeWidth={2} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
