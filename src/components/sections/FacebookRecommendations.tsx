import { FacebookReviewSlider } from './FacebookReviewSlider';

// --- STATIC FALLBACK DATA ---
const DUMMY_REVIEWS = [
    {
        id: "1",
        reviewerName: "Kasun Perera",
        reviewText: "Absolutely amazing quality and fast delivery! Got my One Piece figures in perfect condition. Highly recommended for any anime fan in Sri Lanka.",
        date: "2 weeks ago",
        rating: 5
    },
    {
        id: "2",
        reviewerName: "Shenali Silva",
        reviewText: "The best place to buy authentic manga. The packaging is always so secure and the customer service is top notch. Love this store!",
        date: "1 month ago",
        rating: 5
    },
    {
        id: "3",
        reviewerName: "Praveen Fernando",
        reviewText: "Great collection of action figures! Ordered a custom Gundam kit and they delivered it right to my doorstep. 10/10.",
        date: "2 months ago",
        rating: 5
    },
    {
        id: "4",
        reviewerName: "Nimesha Dias",
        reviewText: "I've bought several graphic tees and the print quality is fantastic. Doesn't fade after washing. Really happy with my purchases.",
        date: "3 months ago",
        rating: 5
    },
    {
        id: "5",
        reviewerName: "Thilina Jayasooriya",
        reviewText: "Authentic products and great prices. It's hard to find a reliable hobby store, but D-Store always delivers. Keep up the good work!",
        date: "4 months ago",
        rating: 5
    },
    {
        id: "6",
        reviewerName: "Sanduni Rathnayake",
        reviewText: "Bought a Jujutsu Kaisen box set. Arrived securely packed with bubble wrap. Very satisfied with the service and the owner is very friendly.",
        date: "5 months ago",
        rating: 5
    }
];

const OVERALL_RATING = 4.9;
const TOTAL_REVIEWS = 124;

async function getFacebookReviews() {
    const token = process.env.FACEBOOK_GRAPH_TOKEN || process.env.INSTAGRAM_GRAPH_TOKEN;
    const pageId = process.env.FACEBOOK_PAGE_ID || process.env.INSTAGRAM_ACCOUNT_ID; // Fallback
    const pageUrl = process.env.FACEBOOK_PAGE_ID 
        ? `https://www.facebook.com/profile.php?id=${process.env.FACEBOOK_PAGE_ID}`
        : "https://facebook.com/dstore.lk";

    if (!token || !pageId) return null;

    try {
        const url = `https://graph.facebook.com/v19.0/${pageId}/ratings?fields=reviewer{name},rating,review_text,created_time,recommendation_type&access_token=${token}`;
        
        const res = await fetch(url, {
            next: { revalidate: 3600 }
        });

        if (!res.ok) {
            // Silently fail if it's the expected "nonexisting field" error due to using an IG ID instead of a FB Page ID
            const errorText = await res.text();
            if (!errorText.includes("nonexisting field (ratings)")) {
                console.warn("Facebook API fetch failed:", errorText);
            }
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error("Failed to fetch Facebook API:", error);
        return null;
    }
}

export async function FacebookRecommendations() {
    const liveData = await getFacebookReviews();

    let displayReviews = DUMMY_REVIEWS;

    if (liveData?.data && liveData.data.length > 0) {
        displayReviews = liveData.data.filter((item: any) => item.review_text || item.recommendation_type === 'positive').map((item: any) => {
            
            // Format date nicely
            const dateObj = new Date(item.created_time);
            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            return {
                id: item.created_time + (item.reviewer?.name || "Anonymous"), // Use time + name as pseudo ID
                reviewerName: item.reviewer?.name || "Facebook User",
                reviewText: item.review_text || (item.recommendation_type === 'positive' ? "Recommends this." : "Does not recommend this."),
                date: dateStr,
                rating: item.rating || (item.recommendation_type === 'positive' ? 5 : 1)
            };
        });
    }

    const pageUrl = process.env.FACEBOOK_PAGE_ID 
        ? `https://www.facebook.com/profile.php?id=${process.env.FACEBOOK_PAGE_ID}`
        : "https://facebook.com/dstore.lk";

    return (
        <FacebookReviewSlider 
            reviews={displayReviews} 
            overallRating={OVERALL_RATING} 
            totalReviews={liveData?.data ? displayReviews.length : TOTAL_REVIEWS} 
            pageUrl={pageUrl}
        />
    );
}
