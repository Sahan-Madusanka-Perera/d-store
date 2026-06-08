import { CustomerReviewSlider } from './FacebookReviewSlider';

const REVIEWS = [
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

export function FacebookRecommendations() {
    return <CustomerReviewSlider reviews={REVIEWS} />;
}
