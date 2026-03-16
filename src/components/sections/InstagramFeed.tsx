import { Instagram, Heart, MessageCircle, ExternalLink } from "lucide-react";
import Image from "next/image";

// --- SETUP INSTRUCTIONS ---
// 1. Enter your real Instagram handle below (with the @)
const INSTAGRAM_HANDLE = "@dstore.lk";

// 2. Enter your real Instagram profile picture URL below
const PROFILE_PIC_URL = "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop";

// 3. Enter your real Instagram bio/description below
const PROFILE_BIO = "Premium Anime Merchandise & Collectibles";

// 4. Enter your real metrics below
const METRICS = {
    posts: "124",
    followers: "45.2K",
    following: "28"
};

// 5. Replace these DUMMY_POSTS with links to your actual recent posts and their images.
// You can copy image URLs directly from your Instagram posts (Right click -> Copy Image Address)
// and put the link to the actual post in `postUrl`.
const DUMMY_POSTS = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1000&auto=format&fit=crop",
        likes: "1.2K",
        comments: 42,
        postUrl: "https://instagram.com/p/dummy1" // Replace with real post link!
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop",
        likes: "856",
        comments: 24,
        postUrl: "https://instagram.com/p/dummy2" // Replace with real post link!
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1613376023733-7a6665cb9d46?q=80&w=1000&auto=format&fit=crop",
        likes: "2.4K",
        comments: 156,
        postUrl: "https://instagram.com/p/dummy3" // Replace with real post link!
    },
    {
        id: 4,
        image: "https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=1000&auto=format&fit=crop",
        likes: "943",
        comments: 18,
        postUrl: "https://instagram.com/p/dummy4" // Replace with real post link!
    }
];

export function InstagramFeed() {
    return (
        <section className="w-full bg-white rounded-[2.5rem] md:rounded-[3rem] border border-gray-200 overflow-hidden shadow-2xl transition-all hover:shadow-3xl">
             <div className="p-8 md:p-12 flex flex-col gap-10">
                 {/* Header / Profile Info */}
                 <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 border-b border-gray-100 pb-10">
                     <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                         <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600 p-1 shrink-0 shadow-lg relative group">
                             <div className="w-full h-full rounded-full bg-white p-1">
                                 <div className="w-full h-full rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden relative">
                                    <Image src={PROFILE_PIC_URL} alt="Instagram Profile" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                 </div>
                             </div>
                         </div>
                         <div className="flex flex-col items-center md:items-start text-center md:text-left">
                             <a href={`https://instagram.com/${INSTAGRAM_HANDLE.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity">
                                {INSTAGRAM_HANDLE}
                             </a>
                             <p className="text-zinc-500 font-medium mt-1 mb-5 md:text-lg">{PROFILE_BIO}</p>
                             <div className="flex items-center gap-8 md:gap-12">
                                 <div className="flex flex-col items-center"><span className="text-xl md:text-2xl font-black">{METRICS.posts}</span><span className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1">Posts</span></div>
                                 <div className="flex flex-col items-center"><span className="text-xl md:text-2xl font-black">{METRICS.followers}</span><span className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1">Followers</span></div>
                                 <div className="flex flex-col items-center"><span className="text-xl md:text-2xl font-black">{METRICS.following}</span><span className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1">Following</span></div>
                             </div>
                         </div>
                     </div>
                     <a href={`https://instagram.com/${INSTAGRAM_HANDLE.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center justify-center gap-2 bg-gradient-to-tr from-fuchsia-600 to-orange-500 text-white px-8 py-3.5 rounded-full font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-orange-500/20">
                         <Instagram className="w-5 h-5" />
                         Follow
                     </a>
                 </div>

                 {/* Posts Grid */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {DUMMY_POSTS.map(post => (
                         <a href={post.postUrl} target="_blank" rel="noopener noreferrer" key={post.id} className="group relative aspect-square rounded-[1.5rem] overflow-hidden bg-zinc-100 cursor-pointer block">
                             <Image src={post.image} alt="Instagram post" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                             {/* Overlay */}
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 text-white backdrop-blur-sm">
                                 <Instagram className="w-8 h-8 opacity-50 mb-2" />
                                 <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 font-bold"><Heart className="w-5 h-5 fill-white" /> {post.likes}</div>
                                    <div className="flex items-center gap-2 font-bold"><MessageCircle className="w-5 h-5 fill-white" /> {post.comments}</div>
                                 </div>
                             </div>
                         </a>
                     ))}
                 </div>
             </div>
        </section>
    );
}
