# D-Store SL 🇱🇰

A modern ecommerce platform built specifically for Sri Lankan otaku culture, specializing in manga imports, anime figures, and custom graphic t-shirts.

## 🎯 Features

- **Manga Collection**: Latest volumes and popular series
- **Anime Figures**: Premium collectibles from top brands
- **Custom T-Shirts**: High-quality graphic tees with anime designs
- **PayHere Integration**: Secure payment processing for Sri Lanka
- **Cash on Delivery**: Popular local payment option
- **Island-wide Shipping**: Delivery across all provinces
- **Mobile Responsive**: Optimized for all devices

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Payment**: PayHere Gateway
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account
- PayHere merchant account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd d-store-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   - Supabase credentials
   - PayHere merchant details
   - SMTP settings (optional)

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (shop)/            # Shop route group
│   │   ├── cart/          # Shopping cart
│   │   ├── checkout/      # Checkout process
│   │   ├── figures/       # Anime figures category
│   │   ├── manga/         # Manga category
│   │   ├── products/      # All products
│   │   └── tshirts/       # T-shirts category
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── success/           # Payment success
│   └── cancel/            # Payment cancel
├── components/            # Reusable components
├── lib/                   # Utilities and configurations
├── store/                 # Zustand state management
├── styles/                # Global styles
└── types/                 # TypeScript type definitions
```

## 🔧 Configuration

### PayHere Setup

1. Register at [PayHere](https://www.payhere.lk/)
2. Get your Merchant ID and Secret
3. Configure sandbox/live environment
4. Set up notification URLs

### Supabase Setup

1. Create a new project at [Supabase](https://supabase.com/)
2. Set up your database schema
3. Configure authentication (optional)
4. Get your project URL and API keys

## 🏗️ Database Schema (Recommended)

```sql
-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('manga', 'figures', 'tshirts')),
  images TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  -- Category specific fields
  author TEXT,
  publisher TEXT,
  brand TEXT,
  series TEXT,
  sizes TEXT[],
  colors TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_method TEXT DEFAULT 'payhere',
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table  
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_time DECIMAL(10,2) NOT NULL,
  selected_size TEXT,
  selected_color TEXT
);
```

## 🚦 Development Workflow

1. **Start development server**: `npm run dev`
2. **Build for production**: `npm run build`
3. **Start production server**: `npm start`
4. **Lint code**: `npm run lint`

## 🌐 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main

### Manual Deployment

1. Build the project: `npm run build`
2. Deploy the `.next` folder to your hosting provider
3. Ensure environment variables are set

## 📦 Environment Variables

See `.env.example` for required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_PAYHERE_MERCHANT_ID_SANDBOX`
- `PAYHERE_MERCHANT_SECRET`
- And more...

## 🛒 Sri Lankan E-commerce Features

- **LKR Currency**: All prices in Sri Lankan Rupees
- **Province-based Shipping**: Rates for all 9 provinces
- **PayHere Integration**: Most popular payment gateway in SL
- **Cash on Delivery**: Trusted payment method
- **Mobile-first Design**: Optimized for smartphone usage
- **Sinhala Unicode Support**: Ready for localization

## 🎨 Customization

- **Tailwind Config**: Modify `tailwind.config.js`
- **Components**: Add new components in `src/components/`
- **Styles**: Global styles in `src/styles/globals.css`
- **Constants**: Sri Lankan specific data in `src/lib/constants.ts`

## 📧 Support

For questions and support:
- Create an issue in the repository
- Contact: your-email@example.com

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for Sri Lankan otaku community
