import { Instagram, Heart, MessageCircle } from "lucide-react";
import Image from "next/image";

// --- STATIC FALLBACK DATA ---
// This data will be shown if you haven't configured the environment variables yet 
// or if the Instagram API fails temporarily.
const INSTAGRAM_HANDLE = "@dstore.lk";
const PROFILE_PIC_URL = "https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=1000&auto=format&fit=crop";
const PROFILE_BIO = "Hobby Store, Figures, Manga, Manhwa, Brand New - Authentic, Custom Orders 📦Sri Lanka 🇱🇰, Island-Wide Free Delivery 🚚💨, Whatsapp: +94723333981";

const METRICS = {
    posts: "584",
    followers: "1,517",
    following: "285"
};

const DUMMY_POSTS = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=1000&auto=format&fit=crop",
        likes: "1.2K",
        comments: 42,
        postUrl: "https://instagram.com/p/dummy1" 
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop",
        likes: "856",
        comments: 24,
        postUrl: "https://instagram.com/p/dummy2" 
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1613376023733-7a6665cb9d46?q=80&w=1000&auto=format&fit=crop",
        likes: "2.4K",
        comments: 156,
        postUrl: "https://instagram.com/p/dummy3" 
    },
    {
        id: 4,
        image: "https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=1000&auto=format&fit=crop",
        likes: "943",
        comments: 18,
        postUrl: "https://instagram.com/p/dummy4" 
    },
    {
        id: 5,
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop",
        likes: "1.8K",
        comments: 67,
        postUrl: "https://instagram.com/p/dummy5" 
    },
    {
        id: 6,
        image: "https://images.unsplash.com/photo-1613376023733-7a6665cb9d46?q=80&w=1000&auto=format&fit=crop",
        likes: "723",
        comments: 31,
        postUrl: "https://instagram.com/p/dummy6" 
    },
    {
        id: 7,
        image: "https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=1000&auto=format&fit=crop",
        likes: "1.5K",
        comments: 89,
        postUrl: "https://instagram.com/p/dummy7" 
    },
    {
        id: 8,
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop",
        likes: "2.1K",
        comments: 112,
        postUrl: "https://instagram.com/p/dummy8" 
    }
];

// Server-side fetching logic
async function getInstagramData() {
    const token = process.env.INSTAGRAM_GRAPH_TOKEN;
    const accountId = process.env.INSTAGRAM_ACCOUNT_ID;

    // If no credentials, gracefully fallback to static data
    if (!token || !accountId) return null;

    try {
        // Fetch User Info + Metrics + 4 Latest Media items via Graph API
        const url = `https://graph.facebook.com/v19.0/${accountId}?fields=username,biography,followers_count,follows_count,media_count,profile_picture_url,media.limit(8){media_url,thumbnail_url,permalink,like_count,comments_count,media_type}&access_token=${token}`;
        
        const res = await fetch(url, {
            // Revalidate cache every 1 hour (3600 seconds) to prevent hitting rate limits
            next: { revalidate: 3600 }
        });

        if (!res.ok) {
            console.error("Instagram fetch failed:", await res.text());
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error("Failed to fetch Instagram API:", error);
        return null;
    }
}

export async function InstagramFeed() {
    // 1. Attempt to fetch live data
    const liveData = await getInstagramData();

    // 2. Map data or use fallback
    const displayHandle = liveData?.username ? `@${liveData.username}` : INSTAGRAM_HANDLE;
    const displayBio = liveData?.biography || PROFILE_BIO;
    const displayPic = liveData?.profile_picture_url || PROFILE_PIC_URL;
    
    // Format numbers compactly (e.g. 1500 -> 1.5K)
    const formatNumber = (num: number) => Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);

    const displayMetrics = liveData ? {
        posts: formatNumber(liveData.media_count || 0),
        followers: formatNumber(liveData.followers_count || 0),
        following: formatNumber(liveData.follows_count || 0)
    } : METRICS;

    // Map the 8 posts
    const displayPosts = liveData?.media?.data ? liveData.media.data.map((item: any) => ({
        id: item.id,
        // Videos provide a thumbnail_url, otherwise use media_url
        image: item.thumbnail_url || item.media_url,
        likes: formatNumber(item.like_count || 0),
        comments: formatNumber(item.comments_count || 0),
        postUrl: item.permalink
    })) : DUMMY_POSTS;

    return (
        <section className="w-full bg-white rounded-[2.5rem] md:rounded-[3rem] border border-gray-200 overflow-hidden shadow-2xl transition-all hover:shadow-3xl">
            <div className="p-8 md:p-12 flex flex-col gap-10">
                {/* Header / Profile Info */}
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 border-b border-gray-100 pb-10">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600 p-1 shrink-0 shadow-lg relative group">
                            <div className="w-full h-full rounded-full bg-white p-1">
                                <div className="w-full h-full rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden relative">
                                    <Image src={displayPic} alt="Instagram Profile" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <a href={`https://instagram.com/${displayHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity">
                                {displayHandle}
                            </a>
                            <p className="text-zinc-500 font-medium mt-1 mb-5 md:text-lg">{displayBio}</p>
                            <div className="flex items-center gap-8 md:gap-12">
                                <div className="flex flex-col items-center"><span className="text-xl md:text-2xl font-black">{displayMetrics.posts}</span><span className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1">Posts</span></div>
                                <div className="flex flex-col items-center"><span className="text-xl md:text-2xl font-black">{displayMetrics.followers}</span><span className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1">Followers</span></div>
                                <div className="flex flex-col items-center"><span className="text-xl md:text-2xl font-black">{displayMetrics.following}</span><span className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1">Following</span></div>
                            </div>
                        </div>
                    </div>
                    <a href={`https://instagram.com/${displayHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center justify-center gap-2 bg-gradient-to-tr from-fuchsia-600 to-orange-500 text-white px-8 py-3.5 rounded-full font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-orange-500/20">
                        <Instagram className="w-5 h-5" />
                        Follow
                    </a>
                </div>

                {/* Posts Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {displayPosts.map((post: any) => (
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
