-- Create the carousel_slides table
create table public.carousel_slides (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  subtitle text not null,
  cta_text text not null,
  link_url text not null,
  bg_class text not null,
  image_url text, -- optional, if null then fallback to generic icon
  is_active boolean default true not null,
  sort_order integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.carousel_slides enable row level security;

-- Create policy to allow public read access
create policy "Allow public read access on carousel_slides" 
  on public.carousel_slides for select 
  using (true);

-- Create policies for admin access (assuming you have an admin role or handle auth in the app layer)
-- For simplicity, since D-Store uses app-level admin checks, we can allow all authenticated users
-- for insert/update/delete, and the app will enforce admin-only access via API routes.
create policy "Allow authenticated users to insert carousel_slides"
  on public.carousel_slides for insert
  to authenticated
  with check (true);

create policy "Allow authenticated users to update carousel_slides"
  on public.carousel_slides for update
  to authenticated
  using (true);

create policy "Allow authenticated users to delete carousel_slides"
  on public.carousel_slides for delete
  to authenticated
  using (true);

-- Insert initial current slides as default data
insert into public.carousel_slides (title, subtitle, cta_text, link_url, bg_class, sort_order)
values 
('LEVEL UP YOUR REALITY', 'Premium Anime Merchandise for the Modern Otaku', 'SHOP LATEST', '/products', 'bg-black text-white', 1),
('GEAR 5 HAS ARRIVED', 'Official One Piece Collection Now Available', 'EXPLORE COLLECTION', '/one-piece', 'bg-[#F0F0F0] text-black', 2),
('MANGA UNIVERSE', 'Complete Your Library with Exclusive Box Sets', 'BROWSE MANGA', '/manga', 'bg-[#E63946] text-white', 3);
