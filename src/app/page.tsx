import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { CategoryGrid } from "@/components/sections/CategoryGrid";
import Navbar from "@/components/Navbar";
import { createClient } from '@/utils/supabase/server'

// Mock Data
const FRESH_DROPS = [
  { id: '1', name: 'Jujutsu Kaisen Vol. 25', price: 'LKR 2,500', rating: 5, image: '' },
  { id: '2', name: 'Luffy Gear 5 T-Shirt', price: 'LKR 4,500', rating: 4.5, image: '' },
  { id: '3', name: 'Zoro Enma Replica', price: 'LKR 12,000', rating: 5, image: '' },
  { id: '4', name: 'Chainsaw Man Pochita Plush', price: 'LKR 3,500', rating: 4.8, image: '' },
];

const TOP_SELLING = [
  { id: '5', name: 'Demon Slayer Artbook', price: 'LKR 8,500', rating: 5, image: '' },
  { id: '6', name: 'Naruto Shippuden Hoodie', price: 'LKR 6,900', rating: 4.7, image: '' },
  { id: '7', name: 'Attack on Titan Vol. 34', price: 'LKR 2,500', rating: 5, image: '' },
  { id: '8', name: 'Gojo Satoru Figure', price: 'LKR 15,000', rating: 4.9, image: '' },
];

export default async function Home() {
  const supabase = await createClient()

  // Fetch Carousel Slides
  const { data: slides } = await supabase
    .from('carousel_slides')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Fallback slides in case of DB error or empty
  const initialSlides = slides && slides.length > 0 ? slides : [
    {
      id: 'fallback-1',
      title: "LEVEL UP YOUR REALITY",
      subtitle: "Premium Anime Merchandise for the Modern Otaku",
      cta_text: "SHOP LATEST",
      link_url: "/products",
      bg_class: "bg-black text-white",
      image_url: null,
      is_active: true,
      sort_order: 1
    },
    {
      id: 'fallback-2',
      title: "GEAR 5 HAS ARRIVED",
      subtitle: "Official One Piece Collection Now Available",
      cta_text: "EXPLORE COLLECTION",
      link_url: "/one-piece",
      bg_class: "bg-[#F0F0F0] text-black",
      image_url: null,
      is_active: true,
      sort_order: 2
    },
    {
      id: 'fallback-3',
      title: "MANGA UNIVERSE",
      subtitle: "Complete Your Library with Exclusive Box Sets",
      cta_text: "BROWSE MANGA",
      link_url: "/manga",
      bg_class: "bg-[#E63946] text-white",
      image_url: null,
      is_active: true,
      sort_order: 3
    }
  ];

  // Fetch Latest Arrivals
  const { data: latestProducts } = await supabase
    .from('products')
    .select('id, name, price, image_url, image_urls')
    .order('created_at', { ascending: false })
    .limit(4);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(price).replace('LKR', 'LKR ');
  };

  const freshDropsData = latestProducts && latestProducts.length > 0
    ? latestProducts.map(p => {
      let image = '';
      if (p.image_urls && Array.isArray(p.image_urls) && p.image_urls.length > 0) {
        image = p.image_urls[0];
      } else if (p.image_url) {
        image = p.image_url;
      }

      return {
        id: p.id.toString(),
        name: p.name,
        price: formatPrice(p.price),
        rating: 5, // Mock rating or compute if available
        image: image
      };
    })
    : FRESH_DROPS;

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroCarousel initialSlides={initialSlides} />
      <ProductShowcase title="NEW ARRIVALS" products={freshDropsData} />
      <CategoryGrid />
      <ProductShowcase title="TOP SELLING" products={TOP_SELLING} centered={true} />
    </div>
  );
}
