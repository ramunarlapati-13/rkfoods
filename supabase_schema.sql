-- ==========================================
-- RRR Foods (ఆర్ఆర్ఆర్ ఫుడ్స్) Database Schema
-- ==========================================

-- 1. Profiles Table (Linked to Supabase Auth Users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  email text,
  phone_number text,
  photo_url text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Allow public read access to profiles" on public.profiles
  for select using (true);

create policy "Allow users to update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Trigger to automatically create a profile when a new user signs up in Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, email, phone_number, photo_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    new.phone,
    new.raw_user_meta_data->>'avatar_url',
    'customer'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Products Table
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  sku text not null unique,
  name text not null,
  name_telugu_script text,
  slug text not null unique,
  category text not null check (category in ('pickles', 'sweets', 'meals')),
  diet_type text check (diet_type in ('veg', 'nonveg')),
  description text,
  ingredients text[] default '{}',
  image_url text,
  images text[] default '{}',
  actual_price numeric not null,
  selling_price numeric not null,
  rating numeric default 0,
  review_count integer default 0,
  in_stock boolean default true,
  available_locations text[] default '{}',
  heat_level integer check (heat_level >= 1 and heat_level <= 10),
  featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Products
alter table public.products enable row level security;

-- Products Policies
create policy "Allow public read access to products" on public.products
  for select using (true);

create policy "Allow admin write access to products" on public.products
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );


-- 3. Locations Table
create table if not exists public.locations (
  id uuid default gen_random_uuid() primary key,
  city text not null,
  state text not null,
  pincode text not null unique,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Locations
alter table public.locations enable row level security;

-- Locations Policies
create policy "Allow public read access to locations" on public.locations
  for select using (true);

create policy "Allow admin write access to locations" on public.locations
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );


-- 4. Orders Table
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  items jsonb not null,
  total_amount numeric not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  shipping_address jsonb not null,
  tracking_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Orders
alter table public.orders enable row level security;

-- Orders Policies
create policy "Allow users to read their own orders" on public.orders
  for select using (auth.uid() = user_id);

create policy "Allow authenticated users to create orders" on public.orders
  for insert with check (auth.uid() = user_id);

create policy "Allow admin full access to orders" on public.orders
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );


-- 5. Reviews Table
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products on delete cascade,
  user_id uuid references auth.users on delete set null,
  user_name text not null,
  rating numeric not null check (rating >= 1 and rating <= 5),
  comment text,
  media_urls jsonb default '{"images": [], "videos": [], "audios": []}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Reviews
alter table public.reviews enable row level security;

-- Reviews Policies
create policy "Allow public read access to reviews" on public.reviews
  for select using (true);

create policy "Allow authenticated users to create reviews" on public.reviews
  for insert with check (auth.uid() = user_id);

create policy "Allow users to update/delete their own reviews" on public.reviews
  for all using (auth.uid() = user_id);


-- 6. B2B Sessions (Unique Project ID Lock)
create table if not exists public.b2b_sessions (
  project_id text primary key,
  status text not null check (status in ('Pending', 'Active')),
  signed_name text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on B2B Sessions
alter table public.b2b_sessions enable row level security;

-- B2B Sessions Policies (Dashboard clients update statuses directly)
create policy "Allow B2B read access to everyone" on public.b2b_sessions
  for select using (true);

create policy "Allow B2B updates" on public.b2b_sessions
  for update using (true);

create policy "Allow B2B creation" on public.b2b_sessions
  for insert with check (true);


-- 7. B2B Project Logs Table
create table if not exists public.project_logs (
  id uuid default gen_random_uuid() primary key,
  project_id text references public.b2b_sessions(project_id) on delete cascade,
  log_message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Project Logs
alter table public.project_logs enable row level security;

create policy "Allow B2B log read access" on public.project_logs
  for select using (true);


-- ==========================================
-- SEED DATA
-- ==========================================

-- Seed Products
insert into public.products (sku, name, name_telugu_script, slug, category, diet_type, description, ingredients, image_url, images, actual_price, selling_price, rating, review_count, in_stock, available_locations, heat_level, featured)
values
  ('RKF260601', 'Avakaya – Mango Pickle', 'అవకాయ', 'avakaya-mango-pickle', 'pickles', 'veg', 'Crisp, raw green mango chunks marinated in a fiery blend of coarse mustard powder, sun-dried red chili, and cold-pressed sesame oil. The quintessential Telugu pickle, perfected over generations.', '{Raw green mango, Mustard powder, Red chili powder, Rock salt, Cold-pressed sesame oil, Fenugreek}', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80', '{https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80}', 299, 249, 4.8, 312, true, '{Hyderabad, Vijayawada, Visakhapatnam, Chennai, Bangalore}', 8, true),
  ('RKF260602', 'Nimma – Lemon Pickle', 'నిమ్మ', 'nimma-lemon-pickle', 'pickles', 'veg', 'Thin-skinned yellow lemons cured in rock salt, fenugreek, and bold chili powder. Robust sour, salty and tangy — a classic Telugu pantry staple.', '{Yellow lemons, Rock salt, Fenugreek, Red chili powder, Sesame oil}', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&q=80', '{https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&q=80}', 249, 199, 4.6, 198, true, '{Hyderabad, Vijayawada, Visakhapatnam}', 6, true),
  ('RKF260603', 'Magaya – Dried Mango Pickle', 'మగాయ', 'magaya-dried-mango-pickle', 'pickles', 'veg', 'Sun-dried, peeled mango strips seasoned with mustard and fenugreek. Rich, concentrated sourness with every bite — a unique dried-mango experience.', '{Sun-dried mango, Mustard seeds, Fenugreek, Chili powder, Salt, Sesame oil}', 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=600&q=80', '{https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=600&q=80}', 279, 229, 4.5, 145, true, '{Hyderabad, Vijayawada}', 5, false),
  ('RKF260604', 'Karivepaku – Curry Leaf Pickle', 'కరివేపాకు', 'karivepaku-curry-leaf-pickle', 'pickles', 'veg', 'Intensely savory, herbaceous paste of fresh curry leaves, tamarind pulp, garlic cloves, and toasted spices. Unlike anything you''ve tasted before.', '{Fresh curry leaves, Tamarind pulp, Garlic, Mustard seeds, Dried chili, Sesame oil}', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80', '{https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80}', 249, 199, 4.7, 89, true, '{Hyderabad, Vijayawada, Chennai}', 7, false),
  ('RKF260605', 'Gongura Pickle', 'కూవేవాకు', 'gongura-sorrel-pickle', 'pickles', 'veg', 'Highly acidic, tangy sorrel leaves cooked with garlic and dried red chilies. A beloved rural Telugu classic that defines Andhra cuisine.', '{Sorrel (gongura) leaves, Garlic, Dried red chilies, Mustard seeds, Oil, Salt}', 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=600&q=80', '{https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=600&q=80}', 269, 219, 4.9, 421, true, '{Hyderabad, Vijayawada, Visakhapatnam, Chennai, Bangalore, Mumbai}', 9, true),
  ('RKF260606', 'Atreyapuram Pootharekulu', 'ఆత్రేయపురం పూతరేకులు', 'atreyapuram-pootharekulu', 'sweets', null, 'Wafer-thin, translucent sheets of rice starch folded with pure ghee, sugar, cardamom, and chopped dry fruits. The crown jewel of Andhra sweets.', '{Rice starch, Pure ghee, Sugar, Cardamom, Cashews, Almonds, Dry fruits}', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', '{https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80}', 599, 499, 4.9, 267, true, '{Hyderabad, Vijayawada, Visakhapatnam, Chennai, Bangalore, Mumbai, Delhi}', 3, true),
  ('RKF260607', 'Nethi Ariselu', 'నేతి అరిసెలు', 'nethi-ariselu', 'sweets', null, 'Deep-fried golden discs of wet rice flour and jaggery, saturated with pure desi ghee and topped with toasted sesame seeds. A traditional Sankranti delicacy.', '{Wet rice flour, Jaggery, Pure desi ghee, Sesame seeds, Cardamom}', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80', '{https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80}', 449, 379, 4.7, 134, true, '{Hyderabad, Vijayawada, Visakhapatnam}', 6, false),
  ('RKF260608', 'Bandar Laddu', 'బందరు లడ్డు', 'bandar-laddu', 'sweets', null, 'Velvety, smooth gram flour spheres slow-roasted in ghee and cardamom, containing a whole chewy raisin inside. The legendary sweet of Machilipatnam.', '{Gram flour (besan), Pure ghee, Sugar syrup, Cardamom, Raisins, Cashews}', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80', '{https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80}', 499, 419, 4.8, 389, true, '{Hyderabad, Vijayawada, Visakhapatnam, Chennai, Bangalore, Mumbai, Delhi}', 8, true)
on conflict (sku) do nothing;

-- Seed Locations
insert into public.locations (city, state, pincode, active)
values
  ('Hyderabad', 'Telangana', '500001', true),
  ('Vijayawada', 'Andhra Pradesh', '520001', true),
  ('Visakhapatnam', 'Andhra Pradesh', '530001', true),
  ('Chennai', 'Tamil Nadu', '600001', true),
  ('Bangalore', 'Karnataka', '560001', true),
  ('Mumbai', 'Maharashtra', '400001', true),
  ('Delhi', 'Delhi', '110001', false)
on conflict (pincode) do nothing;

-- Seed B2B Client session
insert into public.b2b_sessions (project_id, status)
values ('VSVBQUBB', 'Pending')
on conflict (project_id) do nothing;

-- Seed Project Execution Logs
insert into public.project_logs (project_id, log_message)
values
  ('VSVBQUBB', 'Project initialized. Initial server setup completed.'),
  ('VSVBQUBB', 'Visual Identity & Styling applied with traditional Telugu color palette (#8B261E and #E5A93C).'),
  ('VSVBQUBB', 'Seed products imported successfully into local variables.'),
  ('VSVBQUBB', 'Awaiting client approval of Master Services & User Agreement to enable full dashboard access.')
on conflict do nothing;
