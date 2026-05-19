-- ==========================================
-- ENTERPRISE SUPABASE CMS SCHEMA & SEED DATA
-- ==========================================

-- Enable the standard uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- DROP TABLES IF THEY EXIST TO ENSURE A CLEAN SLATE
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS mini_guides CASCADE;
DROP TABLE IF EXISTS tours CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS destinations CASCADE;

-- 1. DESTINATIONS TABLE (Dual-compatible Enterprise Schema)
CREATE TABLE destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    country TEXT NOT NULL,
    code TEXT NOT NULL,
    country_code TEXT, -- Enterprise naming
    title TEXT, -- Optional premium page titles
    excerpt TEXT,
    description TEXT,
    description_json JSONB, -- Enterprise flexible content
    "whyILoveIt" TEXT,
    why_i_love_it TEXT, -- Enterprise snake_case
    moments TEXT[],
    "coverImage" TEXT,
    hero_image TEXT, -- Enterprise naming
    gallery TEXT[],
    gallery_json JSONB, -- Enterprise storage format
    "blogsCount" INT DEFAULT 0,
    blogs_count INT DEFAULT 0,
    "toursCount" INT DEFAULT 0,
    tours_count INT DEFAULT 0,
    region TEXT,
    status TEXT DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. BLOG POSTS TABLE (Relational Enterprise Schema)
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    destination TEXT, -- Flat lookup cache
    destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL, -- relational key
    "countryCode" TEXT,
    country_code TEXT,
    category TEXT,
    "coverImage" TEXT,
    hero_image TEXT,
    excerpt TEXT,
    "isFresh" BOOLEAN DEFAULT FALSE,
    is_fresh BOOLEAN DEFAULT FALSE,
    date TEXT,
    content JSONB, -- rich structured editor blocks
    status TEXT DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. TOURS TABLE (Relational Enterprise Schema)
CREATE TABLE tours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "countryCode" TEXT,
    country_code TEXT,
    destination TEXT NOT NULL,
    destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL, -- relational key
    category TEXT,
    title TEXT NOT NULL,
    description TEXT,
    details TEXT,
    badge TEXT,
    price TEXT,
    duration TEXT,
    status TEXT DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. MINI GUIDES TABLE (Relational Enterprise Schema)
CREATE TABLE mini_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT,
    slug TEXT NOT NULL UNIQUE,
    "countryCode" TEXT,
    country_code TEXT,
    destination TEXT NOT NULL,
    destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL, -- relational key
    title TEXT NOT NULL,
    excerpt TEXT,
    "heroImage" TEXT,
    hero_image TEXT,
    details JSONB,
    status TEXT DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. PACKAGES TABLE
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    price TEXT NOT NULL,
    "shortDescription" TEXT,
    short_description TEXT,
    offerings TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 6. TESTIMONIALS TABLE
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    text TEXT NOT NULL,
    destination TEXT,
    destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
    image TEXT,
    rating INT DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ENABLE ROW LEVEL SECURITY (RLS) FOR ALL TABLES
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE mini_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- CREATE PERMISSIVE RLS POLICIES FOR ALL TABLES (READ, INSERT, UPDATE, DELETE)
-- This allows both anonymous client reads/writes and admin updates to operate flawlessly.
CREATE POLICY "Allow public select on destinations" ON destinations FOR SELECT USING (TRUE);
CREATE POLICY "Allow public insert on destinations" ON destinations FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow public update on destinations" ON destinations FOR UPDATE USING (TRUE);
CREATE POLICY "Allow public delete on destinations" ON destinations FOR DELETE USING (TRUE);

CREATE POLICY "Allow public select on blog_posts" ON blog_posts FOR SELECT USING (TRUE);
CREATE POLICY "Allow public insert on blog_posts" ON blog_posts FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow public update on blog_posts" ON blog_posts FOR UPDATE USING (TRUE);
CREATE POLICY "Allow public delete on blog_posts" ON blog_posts FOR DELETE USING (TRUE);

CREATE POLICY "Allow public select on tours" ON tours FOR SELECT USING (TRUE);
CREATE POLICY "Allow public insert on tours" ON tours FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow public update on tours" ON tours FOR UPDATE USING (TRUE);
CREATE POLICY "Allow public delete on tours" ON tours FOR DELETE USING (TRUE);

CREATE POLICY "Allow public select on mini_guides" ON mini_guides FOR SELECT USING (TRUE);
CREATE POLICY "Allow public insert on mini_guides" ON mini_guides FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow public update on mini_guides" ON mini_guides FOR UPDATE USING (TRUE);
CREATE POLICY "Allow public delete on mini_guides" ON mini_guides FOR DELETE USING (TRUE);

CREATE POLICY "Allow public select on packages" ON packages FOR SELECT USING (TRUE);
CREATE POLICY "Allow public insert on packages" ON packages FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow public update on packages" ON packages FOR UPDATE USING (TRUE);
CREATE POLICY "Allow public delete on packages" ON packages FOR DELETE USING (TRUE);

CREATE POLICY "Allow public select on testimonials" ON testimonials FOR SELECT USING (TRUE);
CREATE POLICY "Allow public insert on testimonials" ON testimonials FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow public update on testimonials" ON testimonials FOR UPDATE USING (TRUE);
CREATE POLICY "Allow public delete on testimonials" ON testimonials FOR DELETE USING (TRUE);

-- GRANT TABLE PRIVILEGES TO SUPABASE ROLES
-- This ensures that table-level privileges are active, leaving authorization to RLS policies.
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- SEED DATA INSERTS


-- Seeding destinations
INSERT INTO destinations (id, slug, country, code, country_code, title, excerpt, description, description_json, "whyILoveIt", why_i_love_it, moments, "coverImage", hero_image, gallery, gallery_json, "blogsCount", blogs_count, "toursCount", tours_count, region)
VALUES (
  'd1111111-1111-4111-a111-111111111111', 
  'japan', 
  'Japan', 
  'JP', 
  'JP', 
  'Japan', 
  'Old capitals, neon avenues, and the ritual of small things.', 
  'Discover a land where ancient traditions harmoniously coexist with cutting-edge technology.', 
  '"Discover a land where ancient traditions harmoniously coexist with cutting-edge technology."', 
  'The meticulous attention to detail in everything from food to hospitality is unmatched.', 
  'The meticulous attention to detail in everything from food to hospitality is unmatched.', 
  ARRAY['Cherry blossom viewing in Kyoto', 'Staying in a luxury ryokan', 'Omakase sushi experience in Tokyo'], 
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop', 
  ARRAY['https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?q=80&w=1000&auto=format&fit=crop'], 
  '["https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1000&auto=format&fit=crop","https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=1000&auto=format&fit=crop","https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?q=80&w=1000&auto=format&fit=crop"]', 
  2, 
  2, 
  4, 
  4, 
  'Asia'
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, country = EXCLUDED.country, code = EXCLUDED.code, country_code = EXCLUDED.country_code, title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, description = EXCLUDED.description, description_json = EXCLUDED.description_json, "whyILoveIt" = EXCLUDED."whyILoveIt", why_i_love_it = EXCLUDED.why_i_love_it, moments = EXCLUDED.moments, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, gallery = EXCLUDED.gallery, gallery_json = EXCLUDED.gallery_json, "blogsCount" = EXCLUDED."blogsCount", blogs_count = EXCLUDED.blogs_count, "toursCount" = EXCLUDED."toursCount", tours_count = EXCLUDED.tours_count, region = EXCLUDED.region;
INSERT INTO destinations (id, slug, country, code, country_code, title, excerpt, description, description_json, "whyILoveIt", why_i_love_it, moments, "coverImage", hero_image, gallery, gallery_json, "blogsCount", blogs_count, "toursCount", tours_count, region)
VALUES (
  'd2222222-2222-4222-a222-222222222222', 
  'portugal', 
  'Portugal', 
  'PT', 
  'PT', 
  'Portugal', 
  'Tiled facades, Atlantic light, and the long way home.', 
  'Experience the sun-drenched coastlines, historic tiles, and the melancholic beauty of Fado.', 
  '"Experience the sun-drenched coastlines, historic tiles, and the melancholic beauty of Fado."', 
  'The pace of life here makes it impossible not to slow down and savor every moment.', 
  'The pace of life here makes it impossible not to slow down and savor every moment.', 
  ARRAY['Sunset over the Douro River', 'Wandering the steep streets of Alfama', 'Surfing in the Algarve'], 
  'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=2000&auto=format&fit=crop', 
  ARRAY['https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=1000&auto=format&fit=crop'], 
  '["https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?q=80&w=1000&auto=format&fit=crop","https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=1000&auto=format&fit=crop","https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=1000&auto=format&fit=crop"]', 
  2, 
  2, 
  3, 
  3, 
  'Europe'
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, country = EXCLUDED.country, code = EXCLUDED.code, country_code = EXCLUDED.country_code, title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, description = EXCLUDED.description, description_json = EXCLUDED.description_json, "whyILoveIt" = EXCLUDED."whyILoveIt", why_i_love_it = EXCLUDED.why_i_love_it, moments = EXCLUDED.moments, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, gallery = EXCLUDED.gallery, gallery_json = EXCLUDED.gallery_json, "blogsCount" = EXCLUDED."blogsCount", blogs_count = EXCLUDED.blogs_count, "toursCount" = EXCLUDED."toursCount", tours_count = EXCLUDED.tours_count, region = EXCLUDED.region;
INSERT INTO destinations (id, slug, country, code, country_code, title, excerpt, description, description_json, "whyILoveIt", why_i_love_it, moments, "coverImage", hero_image, gallery, gallery_json, "blogsCount", blogs_count, "toursCount", tours_count, region)
VALUES (
  'd3333333-3333-4333-a333-333333333333', 
  'chile', 
  'Chile', 
  'CL', 
  'CL', 
  'Chile', 
  'Wind, weather, and the silence at the bottom of the world.', 
  'A narrow strip of land offering some of the most dramatic and extreme landscapes on earth.', 
  '"A narrow strip of land offering some of the most dramatic and extreme landscapes on earth."', 
  'It feels like exploring the very edge of the world, untouched and immensely powerful.', 
  'It feels like exploring the very edge of the world, untouched and immensely powerful.', 
  ARRAY['Hiking in Torres del Paine', 'Stargazing in the Atacama Desert', 'Wine tasting in Valle Central'], 
  'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2000&auto=format&fit=crop', 
  ARRAY['https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=1000&auto=format&fit=crop'], 
  '["https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=1000&auto=format&fit=crop","https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?q=80&w=1000&auto=format&fit=crop","https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=1000&auto=format&fit=crop"]', 
  1, 
  1, 
  1, 
  1, 
  'South America'
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, country = EXCLUDED.country, code = EXCLUDED.code, country_code = EXCLUDED.country_code, title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, description = EXCLUDED.description, description_json = EXCLUDED.description_json, "whyILoveIt" = EXCLUDED."whyILoveIt", why_i_love_it = EXCLUDED.why_i_love_it, moments = EXCLUDED.moments, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, gallery = EXCLUDED.gallery, gallery_json = EXCLUDED.gallery_json, "blogsCount" = EXCLUDED."blogsCount", blogs_count = EXCLUDED.blogs_count, "toursCount" = EXCLUDED."toursCount", tours_count = EXCLUDED.tours_count, region = EXCLUDED.region;
INSERT INTO destinations (id, slug, country, code, country_code, title, excerpt, description, description_json, "whyILoveIt", why_i_love_it, moments, "coverImage", hero_image, gallery, gallery_json, "blogsCount", blogs_count, "toursCount", tours_count, region)
VALUES (
  'd4444444-4444-4444-a444-444444444444', 
  'mexico', 
  'Mexico', 
  'MX', 
  'MX', 
  'Mexico', 
  'Color, mezcal, and the slowest mornings I''ve had in years.', 
  'Vibrant colors, ancient ruins, and a culinary scene that will leave you wanting more.', 
  '"Vibrant colors, ancient ruins, and a culinary scene that will leave you wanting more."', 
  'The warmth of the people and the incredible depth of the culture are endlessly inspiring.', 
  'The warmth of the people and the incredible depth of the culture are endlessly inspiring.', 
  ARRAY['Exploring cenotes in Tulum', 'Street tacos in Mexico City', 'Discovering Oaxacan artisans'], 
  'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=2000&auto=format&fit=crop', 
  ARRAY['https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=1000&auto=format&fit=crop'], 
  '["https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1000&auto=format&fit=crop","https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?q=80&w=1000&auto=format&fit=crop","https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=1000&auto=format&fit=crop"]', 
  1, 
  1, 
  2, 
  2, 
  'North America'
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, country = EXCLUDED.country, code = EXCLUDED.code, country_code = EXCLUDED.country_code, title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, description = EXCLUDED.description, description_json = EXCLUDED.description_json, "whyILoveIt" = EXCLUDED."whyILoveIt", why_i_love_it = EXCLUDED.why_i_love_it, moments = EXCLUDED.moments, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, gallery = EXCLUDED.gallery, gallery_json = EXCLUDED.gallery_json, "blogsCount" = EXCLUDED."blogsCount", blogs_count = EXCLUDED.blogs_count, "toursCount" = EXCLUDED."toursCount", tours_count = EXCLUDED.tours_count, region = EXCLUDED.region;
INSERT INTO destinations (id, slug, country, code, country_code, title, excerpt, description, description_json, "whyILoveIt", why_i_love_it, moments, "coverImage", hero_image, gallery, gallery_json, "blogsCount", blogs_count, "toursCount", tours_count, region)
VALUES (
  'd5555555-5555-4555-a555-555555555555', 
  'morocco', 
  'Morocco', 
  'MA', 
  'MA', 
  'Morocco', 
  'Riads, rooftops, and the sport of the souks.', 
  'A sensory overload of spices, intricate architecture, and desert landscapes.', 
  '"A sensory overload of spices, intricate architecture, and desert landscapes."', 
  'The riads feel like hidden oases amidst the vibrant chaos of the medinas.', 
  'The riads feel like hidden oases amidst the vibrant chaos of the medinas.', 
  ARRAY['Mint tea on a rooftop', 'Getting lost in the medina', 'Sleeping in the Sahara'], 
  'https://images.unsplash.com/photo-1597212618440-806262de4f6b?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1597212618440-806262de4f6b?q=80&w=2000&auto=format&fit=crop', 
  ARRAY['https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1000&auto=format&fit=crop'], 
  '["https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1000&auto=format&fit=crop"]', 
  1, 
  1, 
  1, 
  1, 
  'Africa'
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, country = EXCLUDED.country, code = EXCLUDED.code, country_code = EXCLUDED.country_code, title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, description = EXCLUDED.description, description_json = EXCLUDED.description_json, "whyILoveIt" = EXCLUDED."whyILoveIt", why_i_love_it = EXCLUDED.why_i_love_it, moments = EXCLUDED.moments, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, gallery = EXCLUDED.gallery, gallery_json = EXCLUDED.gallery_json, "blogsCount" = EXCLUDED."blogsCount", blogs_count = EXCLUDED.blogs_count, "toursCount" = EXCLUDED."toursCount", tours_count = EXCLUDED.tours_count, region = EXCLUDED.region;
INSERT INTO destinations (id, slug, country, code, country_code, title, excerpt, description, description_json, "whyILoveIt", why_i_love_it, moments, "coverImage", hero_image, gallery, gallery_json, "blogsCount", blogs_count, "toursCount", tours_count, region)
VALUES (
  'd6666666-6666-4666-a666-666666666666', 
  'iceland', 
  'Iceland', 
  'IS', 
  'IS', 
  'Iceland', 
  'Off-season roads, golden hours that last all day.', 
  'A land of fire and ice with otherworldly landscapes.', 
  '"A land of fire and ice with otherworldly landscapes."', 
  'The pure, unadulterated power of nature on display everywhere you look.', 
  'The pure, unadulterated power of nature on display everywhere you look.', 
  ARRAY['Watching geysers erupt', 'Bathing in hot springs', 'Chasing waterfalls'], 
  'https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=2000&auto=format&fit=crop', 
  ARRAY['https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1000&auto=format&fit=crop'], 
  '["https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1000&auto=format&fit=crop"]', 
  1, 
  1, 
  1, 
  1, 
  'Europe'
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, country = EXCLUDED.country, code = EXCLUDED.code, country_code = EXCLUDED.country_code, title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, description = EXCLUDED.description, description_json = EXCLUDED.description_json, "whyILoveIt" = EXCLUDED."whyILoveIt", why_i_love_it = EXCLUDED.why_i_love_it, moments = EXCLUDED.moments, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, gallery = EXCLUDED.gallery, gallery_json = EXCLUDED.gallery_json, "blogsCount" = EXCLUDED."blogsCount", blogs_count = EXCLUDED.blogs_count, "toursCount" = EXCLUDED."toursCount", tours_count = EXCLUDED.tours_count, region = EXCLUDED.region;
INSERT INTO destinations (id, slug, country, code, country_code, title, excerpt, description, description_json, "whyILoveIt", why_i_love_it, moments, "coverImage", hero_image, gallery, gallery_json, "blogsCount", blogs_count, "toursCount", tours_count, region)
VALUES (
  'd7777777-7777-4777-a777-777777777777', 
  'vietnam', 
  'Vietnam', 
  'VN', 
  'VN', 
  'Vietnam', 
  'Phở, scooters, and the city after dark.', 
  'A country of staggering natural beauty and cultural complexities.', 
  '"A country of staggering natural beauty and cultural complexities."', 
  'The street food scene is the best way to understand the heart of the country.', 
  'The street food scene is the best way to understand the heart of the country.', 
  ARRAY['Cruising Halong Bay', 'Eating street food in Hanoi', 'Exploring Hoi An''s old town'], 
  'https://images.unsplash.com/photo-1557750255-c76072a7aad1?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1557750255-c76072a7aad1?q=80&w=2000&auto=format&fit=crop', 
  ARRAY['https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1000&auto=format&fit=crop'], 
  '["https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1000&auto=format&fit=crop"]', 
  1, 
  1, 
  1, 
  1, 
  'Asia'
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, country = EXCLUDED.country, code = EXCLUDED.code, country_code = EXCLUDED.country_code, title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, description = EXCLUDED.description, description_json = EXCLUDED.description_json, "whyILoveIt" = EXCLUDED."whyILoveIt", why_i_love_it = EXCLUDED.why_i_love_it, moments = EXCLUDED.moments, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, gallery = EXCLUDED.gallery, gallery_json = EXCLUDED.gallery_json, "blogsCount" = EXCLUDED."blogsCount", blogs_count = EXCLUDED.blogs_count, "toursCount" = EXCLUDED."toursCount", tours_count = EXCLUDED.tours_count, region = EXCLUDED.region;
INSERT INTO destinations (id, slug, country, code, country_code, title, excerpt, description, description_json, "whyILoveIt", why_i_love_it, moments, "coverImage", hero_image, gallery, gallery_json, "blogsCount", blogs_count, "toursCount", tours_count, region)
VALUES (
  'd8888888-8888-4888-a888-888888888888', 
  'italy', 
  'Italy', 
  'IT', 
  'IT', 
  'Italy', 
  'Lemon groves, hairpin roads, and afternoons on small boats.', 
  'The birthplace of the Renaissance and some of the world''s best food.', 
  '"The birthplace of the Renaissance and some of the world''s best food."', 
  'La dolce vita isn''t just a saying; it''s a way of life here.', 
  'La dolce vita isn''t just a saying; it''s a way of life here.', 
  ARRAY['Pasta making in Tuscany', 'Boating in Capri', 'Watching the sunset in Positano'], 
  'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=2000&auto=format&fit=crop', 
  ARRAY['https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1000&auto=format&fit=crop'], 
  '["https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1000&auto=format&fit=crop"]', 
  2, 
  2, 
  2, 
  2, 
  'Europe'
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, country = EXCLUDED.country, code = EXCLUDED.code, country_code = EXCLUDED.country_code, title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, description = EXCLUDED.description, description_json = EXCLUDED.description_json, "whyILoveIt" = EXCLUDED."whyILoveIt", why_i_love_it = EXCLUDED.why_i_love_it, moments = EXCLUDED.moments, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, gallery = EXCLUDED.gallery, gallery_json = EXCLUDED.gallery_json, "blogsCount" = EXCLUDED."blogsCount", blogs_count = EXCLUDED.blogs_count, "toursCount" = EXCLUDED."toursCount", tours_count = EXCLUDED.tours_count, region = EXCLUDED.region;
INSERT INTO destinations (id, slug, country, code, country_code, title, excerpt, description, description_json, "whyILoveIt", why_i_love_it, moments, "coverImage", hero_image, gallery, gallery_json, "blogsCount", blogs_count, "toursCount", tours_count, region)
VALUES (
  'd9999999-9999-4999-a999-999999999999', 
  'belgium', 
  'Belgium', 
  'BE', 
  'BE', 
  'Belgium', 
  'Beer halls, gabled squares, and the slow art of waffle perfection.', 
  'Discover the heart of Europe, full of medieval towns, incredible chocolate, and world-class beer.', 
  '"Discover the heart of Europe, full of medieval towns, incredible chocolate, and world-class beer."', 
  'A tiny country packed with deep history, stunning architecture, and unparalleled gastronomy.', 
  'A tiny country packed with deep history, stunning architecture, and unparalleled gastronomy.', 
  ARRAY['Eating waffles in Bruges', 'Exploring grand architecture in Brussels', 'Tasting local Trappist beers'], 
  'https://images.unsplash.com/photo-1549877452-9c387954fbc2?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1549877452-9c387954fbc2?q=80&w=2000&auto=format&fit=crop', 
  ARRAY['https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=1000&auto=format&fit=crop'], 
  '["https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=1000&auto=format&fit=crop","https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?q=80&w=1000&auto=format&fit=crop","https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=1000&auto=format&fit=crop"]', 
  1, 
  1, 
  2, 
  2, 
  'Europe'
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, country = EXCLUDED.country, code = EXCLUDED.code, country_code = EXCLUDED.country_code, title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, description = EXCLUDED.description, description_json = EXCLUDED.description_json, "whyILoveIt" = EXCLUDED."whyILoveIt", why_i_love_it = EXCLUDED.why_i_love_it, moments = EXCLUDED.moments, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, gallery = EXCLUDED.gallery, gallery_json = EXCLUDED.gallery_json, "blogsCount" = EXCLUDED."blogsCount", blogs_count = EXCLUDED.blogs_count, "toursCount" = EXCLUDED."toursCount", tours_count = EXCLUDED.tours_count, region = EXCLUDED.region;

-- Seeding blog_posts
INSERT INTO blog_posts (id, slug, title, destination, destination_id, "countryCode", country_code, category, "coverImage", hero_image, excerpt, "isFresh", is_fresh, date)
VALUES (
  'b1111111-1111-4111-b111-111111111111', 
  'slow-mornings-in-kyoto', 
  'Slow Mornings In Kyoto', 
  'Japan', 
  'd1111111-1111-4111-a111-111111111111', 
  'JP', 
  'JP', 
  'CULTURE • KYOTO • APR 2025', 
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop', 
  'Escape the crowds and discover the serene, lesser-known spiritual sanctuaries of Kyoto.', 
  FALSE, 
  FALSE, 
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, title = EXCLUDED.title, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, category = EXCLUDED.category, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, excerpt = EXCLUDED.excerpt, "isFresh" = EXCLUDED."isFresh", is_fresh = EXCLUDED.is_fresh, date = EXCLUDED.date;
INSERT INTO blog_posts (id, slug, title, destination, destination_id, "countryCode", country_code, category, "coverImage", hero_image, excerpt, "isFresh", is_fresh, date)
VALUES (
  'b2222222-2222-4222-b222-222222222222', 
  'day-in-tokyo', 
  'How to Spend a Day In Tokyo', 
  'Japan', 
  'd1111111-1111-4111-a111-111111111111', 
  'JP', 
  'JP', 
  'ITINERARY • TOKYO • MAY 2025', 
  'https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?q=80&w=2000&auto=format&fit=crop', 
  'The best places to eat, shop, and explore in 24 hours.', 
  FALSE, 
  FALSE, 
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, title = EXCLUDED.title, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, category = EXCLUDED.category, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, excerpt = EXCLUDED.excerpt, "isFresh" = EXCLUDED."isFresh", is_fresh = EXCLUDED.is_fresh, date = EXCLUDED.date;
INSERT INTO blog_posts (id, slug, title, destination, destination_id, "countryCode", country_code, category, "coverImage", hero_image, excerpt, "isFresh", is_fresh, date)
VALUES (
  'b3333333-3333-4333-b333-333333333333', 
  'lisbon-hour-before-dinner', 
  'Lisbon, in the Hour Before Dinner', 
  'Portugal', 
  'd2222222-2222-4222-a222-222222222222', 
  'PT', 
  'PT', 
  'TRAVEL DIARY • LISBON • SEP 2024', 
  'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=2000&auto=format&fit=crop', 
  'Wandering the steep streets of Alfama as the sun sets.', 
  FALSE, 
  FALSE, 
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, title = EXCLUDED.title, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, category = EXCLUDED.category, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, excerpt = EXCLUDED.excerpt, "isFresh" = EXCLUDED."isFresh", is_fresh = EXCLUDED.is_fresh, date = EXCLUDED.date;
INSERT INTO blog_posts (id, slug, title, destination, destination_id, "countryCode", country_code, category, "coverImage", hero_image, excerpt, "isFresh", is_fresh, date)
VALUES (
  'b4444444-4444-4444-b444-444444444444', 
  'five-days-edge-of-patagonia', 
  'Five Days at the Edge of Patagonia', 
  'Chile', 
  'd3333333-3333-4333-a333-333333333333', 
  'CL', 
  'CL', 
  'ADVENTURE • PATAGONIA • FEB 2025', 
  'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2000&auto=format&fit=crop', 
  'An insider''s guide to the top luxury atolls in the Maldives.', 
  FALSE, 
  FALSE, 
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, title = EXCLUDED.title, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, category = EXCLUDED.category, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, excerpt = EXCLUDED.excerpt, "isFresh" = EXCLUDED."isFresh", is_fresh = EXCLUDED.is_fresh, date = EXCLUDED.date;
INSERT INTO blog_posts (id, slug, title, destination, destination_id, "countryCode", country_code, category, "coverImage", hero_image, excerpt, "isFresh", is_fresh, date)
VALUES (
  'b5555555-5555-4555-b555-555555555555', 
  'week-of-color-oaxaca', 
  'A Week of Color in Oaxaca', 
  'Mexico', 
  'd4444444-4444-4444-a444-444444444444', 
  'MX', 
  'MX', 
  'FOOD & CULTURE • OAXACA • JAN 2025', 
  'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=2000&auto=format&fit=crop', 
  'Color, mezcal, and the slowest mornings I''ve had in years.', 
  FALSE, 
  FALSE, 
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, title = EXCLUDED.title, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, category = EXCLUDED.category, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, excerpt = EXCLUDED.excerpt, "isFresh" = EXCLUDED."isFresh", is_fresh = EXCLUDED.is_fresh, date = EXCLUDED.date;
INSERT INTO blog_posts (id, slug, title, destination, destination_id, "countryCode", country_code, category, "coverImage", hero_image, excerpt, "isFresh", is_fresh, date)
VALUES (
  'b6666666-6666-4666-b666-666666666666', 
  'three-days-in-red-city', 
  'Three Days in the Red City', 
  'Morocco', 
  'd5555555-5555-4555-a555-555555555555', 
  'MA', 
  'MA', 
  'QUICK GUIDE • MARRAKECH • NOV 2024', 
  'https://images.unsplash.com/photo-1597212618440-806262de4f6b?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1597212618440-806262de4f6b?q=80&w=2000&auto=format&fit=crop', 
  'Riads, rooftops, and the sport of the souks.', 
  FALSE, 
  FALSE, 
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, title = EXCLUDED.title, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, category = EXCLUDED.category, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, excerpt = EXCLUDED.excerpt, "isFresh" = EXCLUDED."isFresh", is_fresh = EXCLUDED.is_fresh, date = EXCLUDED.date;
INSERT INTO blog_posts (id, slug, title, destination, destination_id, "countryCode", country_code, category, "coverImage", hero_image, excerpt, "isFresh", is_fresh, date)
VALUES (
  'b7777777-7777-4777-b777-777777777777', 
  'iceland-off-season', 
  'Iceland in the Off-Season', 
  'Iceland', 
  'd6666666-6666-4666-a666-666666666666', 
  'IS', 
  'IS', 
  'ROAD TRIP • REYKJAVIK • OCT 2024', 
  'https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=2000&auto=format&fit=crop', 
  'Off-season roads, golden hours that last all day.', 
  FALSE, 
  FALSE, 
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, title = EXCLUDED.title, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, category = EXCLUDED.category, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, excerpt = EXCLUDED.excerpt, "isFresh" = EXCLUDED."isFresh", is_fresh = EXCLUDED.is_fresh, date = EXCLUDED.date;
INSERT INTO blog_posts (id, slug, title, destination, destination_id, "countryCode", country_code, category, "coverImage", hero_image, excerpt, "isFresh", is_fresh, date)
VALUES (
  'b8888888-8888-4888-b888-888888888888', 
  'hanoi-after-dark', 
  'Hanoi After Dark', 
  'Vietnam', 
  'd7777777-7777-4777-a777-777777777777', 
  'VN', 
  'VN', 
  'STREET PHOTOGRAPHY • HANOI • AUG 2024', 
  'https://images.unsplash.com/photo-1557750255-c76072a7aad1?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1557750255-c76072a7aad1?q=80&w=2000&auto=format&fit=crop', 
  'Phở, scooters, and the city after dark.', 
  FALSE, 
  FALSE, 
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, title = EXCLUDED.title, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, category = EXCLUDED.category, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, excerpt = EXCLUDED.excerpt, "isFresh" = EXCLUDED."isFresh", is_fresh = EXCLUDED.is_fresh, date = EXCLUDED.date;
INSERT INTO blog_posts (id, slug, title, destination, destination_id, "countryCode", country_code, category, "coverImage", hero_image, excerpt, "isFresh", is_fresh, date)
VALUES (
  'b9999999-9999-4999-b999-999999999999', 
  'boat-lemon-grove-amalfi', 
  'A Boat, a Lemon Grove, and Amalfi', 
  'Italy', 
  'd8888888-8888-4888-a888-888888888888', 
  'IT', 
  'IT', 
  'TRAVEL DIARY • AMALFI • JUL 2024', 
  'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=2000&auto=format&fit=crop', 
  'Lemon groves, hairpin roads, and afternoons on small boats.', 
  FALSE, 
  FALSE, 
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, title = EXCLUDED.title, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, category = EXCLUDED.category, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, excerpt = EXCLUDED.excerpt, "isFresh" = EXCLUDED."isFresh", is_fresh = EXCLUDED.is_fresh, date = EXCLUDED.date;
INSERT INTO blog_posts (id, slug, title, destination, destination_id, "countryCode", country_code, category, "coverImage", hero_image, excerpt, "isFresh", is_fresh, date)
VALUES (
  'baaaaaaa-aaaa-4aaa-baaa-aaaaaaaaaaaa', 
  'four-days-in-belgium', 
  'How to Spend 4 Days in Belgium', 
  'Belgium', 
  'd9999999-9999-4999-a999-999999999999', 
  'BE', 
  'BE', 
  'BRUSSELS · BRUGES · GHENT · SEPTEMBER 2025', 
  'https://images.unsplash.com/photo-1549877452-9c387954fbc2?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1549877452-9c387954fbc2?q=80&w=2000&auto=format&fit=crop', 
  'The perfect short break exploring the architectural wonders and culinary delights of Flanders.', 
  TRUE, 
  TRUE, 
  'BRUSSELS · BRUGES · GHENT · SEPTEMBER 2025'
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, title = EXCLUDED.title, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, category = EXCLUDED.category, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, excerpt = EXCLUDED.excerpt, "isFresh" = EXCLUDED."isFresh", is_fresh = EXCLUDED.is_fresh, date = EXCLUDED.date;
INSERT INTO blog_posts (id, slug, title, destination, destination_id, "countryCode", country_code, category, "coverImage", hero_image, excerpt, "isFresh", is_fresh, date)
VALUES (
  'bf111111-1111-4111-bf11-111111111111', 
  'seven-days-in-portugal', 
  'Seven Days in Portugal: A Long-Read Itinerary', 
  'Portugal', 
  'd2222222-2222-4222-a222-222222222222', 
  'PT', 
  'PT', 
  'LISBON · SINTRA · ÉVORA · PORTO · DOURO VALLEY · OCTOBER 2025', 
  'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=2000&auto=format&fit=crop', 
  'A comprehensive journey from the historic streets of Lisbon to the terraced vineyards of the Douro Valley.', 
  TRUE, 
  TRUE, 
  'LISBON · SINTRA · ÉVORA · PORTO · DOURO VALLEY · OCTOBER 2025'
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, title = EXCLUDED.title, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, category = EXCLUDED.category, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, excerpt = EXCLUDED.excerpt, "isFresh" = EXCLUDED."isFresh", is_fresh = EXCLUDED.is_fresh, date = EXCLUDED.date;
INSERT INTO blog_posts (id, slug, title, destination, destination_id, "countryCode", country_code, category, "coverImage", hero_image, excerpt, "isFresh", is_fresh, date)
VALUES (
  'bf333333-3333-4333-bf33-333333333333', 
  'two-weeks-in-italy', 
  'How to Spend 2 Weeks in Italy', 
  'Italy', 
  'd8888888-8888-4888-a888-888888888888', 
  'IT', 
  'IT', 
  'ROME · FLORENCE · TUSCANY · CINQUE TERRE · AMALFI · MAY 2025', 
  'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=2000&auto=format&fit=crop', 
  'An epic 14-day route capturing the essence of Italy, from ancient ruins to cinematic coastlines.', 
  TRUE, 
  TRUE, 
  'ROME · FLORENCE · TUSCANY · CINQUE TERRE · AMALFI · MAY 2025'
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, title = EXCLUDED.title, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, category = EXCLUDED.category, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, excerpt = EXCLUDED.excerpt, "isFresh" = EXCLUDED."isFresh", is_fresh = EXCLUDED.is_fresh, date = EXCLUDED.date;

-- Seeding tours
INSERT INTO tours (id, "countryCode", country_code, destination, destination_id, category, title, description, details, badge)
VALUES (
  'c1111111-1111-4111-c111-111111111111', 
  'JP', 
  'JP', 
  'Japan', 
  'd1111111-1111-4111-a111-111111111111', 
  'CULTURE', 
  'Private Tea Ceremony in Gion', 
  'Tea ceremony with a master in a 200-year old machiya. The real deal, no corner cutting.', 
  'Duration: 2 hours | Kyoto', 
  'TOUR'
)
ON CONFLICT (id) DO UPDATE SET
  "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, category = EXCLUDED.category, title = EXCLUDED.title, description = EXCLUDED.description, details = EXCLUDED.details, badge = EXCLUDED.badge;
INSERT INTO tours (id, "countryCode", country_code, destination, destination_id, category, title, description, details, badge)
VALUES (
  'c2222222-2222-4222-c222-222222222222', 
  'JP', 
  'JP', 
  'Japan', 
  'd1111111-1111-4111-a111-111111111111', 
  'TICKETS', 
  'Shibuya Sky — Skip the Line', 
  'Best views over Tokyo. Go at sunset. Worth the hype.', 
  'Duration: Open (good for 2 hours) | Tokyo', 
  'TICKET'
)
ON CONFLICT (id) DO UPDATE SET
  "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, category = EXCLUDED.category, title = EXCLUDED.title, description = EXCLUDED.description, details = EXCLUDED.details, badge = EXCLUDED.badge;
INSERT INTO tours (id, "countryCode", country_code, destination, destination_id, category, title, description, details, badge)
VALUES (
  'c3333333-3333-4333-c333-333333333333', 
  'PT', 
  'PT', 
  'Portugal', 
  'd2222222-2222-4222-a222-222222222222', 
  'CULTURE', 
  'Sintra Day Trip with a Local', 
  'Skip the tourist buses and see Sintra''s castles and the coast with a local guide.', 
  'Duration: 8 hours (Full Day) | Lisbon', 
  'TOUR'
)
ON CONFLICT (id) DO UPDATE SET
  "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, category = EXCLUDED.category, title = EXCLUDED.title, description = EXCLUDED.description, details = EXCLUDED.details, badge = EXCLUDED.badge;
INSERT INTO tours (id, "countryCode", country_code, destination, destination_id, category, title, description, details, badge)
VALUES (
  'c4444444-4444-4444-c444-444444444444', 
  'PT', 
  'PT', 
  'Portugal', 
  'd2222222-2222-4222-a222-222222222222', 
  'COACH TOUR • AVOID IF POSSIBLE', 
  'Sintra Day Tour from Lisbon', 
  'Not my favorite style (a big bus and rushed), but the most economical way to see Sintra.', 
  'Duration: 8 hours | Portugal - Group Tour', 
  'TOUR'
)
ON CONFLICT (id) DO UPDATE SET
  "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, category = EXCLUDED.category, title = EXCLUDED.title, description = EXCLUDED.description, details = EXCLUDED.details, badge = EXCLUDED.badge;
INSERT INTO tours (id, "countryCode", country_code, destination, destination_id, category, title, description, details, badge)
VALUES (
  'c5555555-5555-4555-c555-555555555555', 
  'PT', 
  'PT', 
  'Portugal', 
  'd2222222-2222-4222-a222-222222222222', 
  'WINE TASTING', 
  'Douro Valley Wine Tour', 
  'The top terraces, a river boat trip, and lunch with a local family. Book this way ahead.', 
  'Duration: Full Day | Leaving from Porto', 
  'TOUR'
)
ON CONFLICT (id) DO UPDATE SET
  "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, category = EXCLUDED.category, title = EXCLUDED.title, description = EXCLUDED.description, details = EXCLUDED.details, badge = EXCLUDED.badge;
INSERT INTO tours (id, "countryCode", country_code, destination, destination_id, category, title, description, details, badge)
VALUES (
  'c6666666-6666-4666-c666-666666666666', 
  'CL', 
  'CL', 
  'Chile', 
  'd3333333-3333-4333-a333-333333333333', 
  'HIKING', 
  'Cascada Expediciones — Guided W Trek', 
  'For those who want the classic W Trek but with all logistics handled. Top class guides.', 
  'Duration: 5 days | Torres del Paine', 
  'TOUR'
)
ON CONFLICT (id) DO UPDATE SET
  "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, category = EXCLUDED.category, title = EXCLUDED.title, description = EXCLUDED.description, details = EXCLUDED.details, badge = EXCLUDED.badge;
INSERT INTO tours (id, "countryCode", country_code, destination, destination_id, category, title, description, details, badge)
VALUES (
  'c7777777-7777-4777-c777-777777777777', 
  'MX', 
  'MX', 
  'Mexico', 
  'd4444444-4444-4444-a444-444444444444', 
  'FOOD & DRINK', 
  'Mezcal Palenque Day Trip', 
  'Visit working mezcal farms outside of Oaxaca City. Drink responsibly, hire a driver.', 
  'Duration: Full Day | Oaxaca', 
  'TOUR'
)
ON CONFLICT (id) DO UPDATE SET
  "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, category = EXCLUDED.category, title = EXCLUDED.title, description = EXCLUDED.description, details = EXCLUDED.details, badge = EXCLUDED.badge;
INSERT INTO tours (id, "countryCode", country_code, destination, destination_id, category, title, description, details, badge)
VALUES (
  'c8888888-8888-4888-c888-888888888888', 
  'MA', 
  'MA', 
  'Morocco', 
  'd5555555-5555-4555-a555-555555555555', 
  'DAY TRIP', 
  'Atlas Mountains Day Trip', 
  'A break from the Medina. Hike between Berber villages and drink mint tea.', 
  'Duration: Full Day | Marrakech', 
  'TOUR'
)
ON CONFLICT (id) DO UPDATE SET
  "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, category = EXCLUDED.category, title = EXCLUDED.title, description = EXCLUDED.description, details = EXCLUDED.details, badge = EXCLUDED.badge;
INSERT INTO tours (id, "countryCode", country_code, destination, destination_id, category, title, description, details, badge)
VALUES (
  'c9999999-9999-4999-c999-999999999999', 
  'IS', 
  'IS', 
  'Iceland', 
  'd6666666-6666-4666-a666-666666666666', 
  'ADVENTURE', 
  'Sólheimajökull Glacier Walk', 
  'You cannot do this without a guide and gear. The ice is incredible.', 
  'Duration: 3 hours | South Coast', 
  'TOUR'
)
ON CONFLICT (id) DO UPDATE SET
  "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, category = EXCLUDED.category, title = EXCLUDED.title, description = EXCLUDED.description, details = EXCLUDED.details, badge = EXCLUDED.badge;
INSERT INTO tours (id, "countryCode", country_code, destination, destination_id, category, title, description, details, badge)
VALUES (
  'caaaaaaa-aaaa-4aaa-caaa-aaaaaaaaaaaa', 
  'VN', 
  'VN', 
  'Vietnam', 
  'd7777777-7777-4777-a777-777777777777', 
  'FOOD & DRINK', 
  'Hanoi Street Food Walking Tour', 
  'The best way to learn the ropes of eating on tiny plastic stools. Highly recommended.', 
  'Duration: 3 hours | Old Quarter', 
  'TOUR'
)
ON CONFLICT (id) DO UPDATE SET
  "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, category = EXCLUDED.category, title = EXCLUDED.title, description = EXCLUDED.description, details = EXCLUDED.details, badge = EXCLUDED.badge;
INSERT INTO tours (id, "countryCode", country_code, destination, destination_id, category, title, description, details, badge)
VALUES (
  'cbbbbbbb-bbbb-4bbb-cbbb-bbbbbbbbbbbb', 
  'IT', 
  'IT', 
  'Italy', 
  'd8888888-8888-4888-a888-888888888888', 
  'LUXURY', 
  'Private Gozzo Boat — Half Day', 
  'Cruising the Amalfi Coast on a traditional wooden boat. Worth every penny.', 
  'Duration: 4 hours | Positano', 
  'TOUR'
)
ON CONFLICT (id) DO UPDATE SET
  "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, category = EXCLUDED.category, title = EXCLUDED.title, description = EXCLUDED.description, details = EXCLUDED.details, badge = EXCLUDED.badge;
INSERT INTO tours (id, "countryCode", country_code, destination, destination_id, category, title, description, details, badge)
VALUES (
  'cccccccc-cccc-4ccc-cccc-cccccccccccc', 
  'IT', 
  'IT', 
  'Italy', 
  'd8888888-8888-4888-a888-888888888888', 
  'TICKETS', 
  'Florence Uffizi Skip-the-Line', 
  'Worth booking. The lines in summer are brutal.', 
  'Duration: Open | Florence', 
  'TICKET'
)
ON CONFLICT (id) DO UPDATE SET
  "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, category = EXCLUDED.category, title = EXCLUDED.title, description = EXCLUDED.description, details = EXCLUDED.details, badge = EXCLUDED.badge;
INSERT INTO tours (id, "countryCode", country_code, destination, destination_id, category, title, description, details, badge)
VALUES (
  'cddddddd-dddd-4ddd-cddd-dddddddddddd', 
  'BE', 
  'BE', 
  'Belgium', 
  'd9999999-9999-4999-a999-999999999999', 
  'FOOD & DRINK', 
  'Brussels Beer & Chocolate Walking Tour', 
  'The two best things about Belgium.', 
  'Duration: 3.5 hours | Brussels', 
  'TOUR'
)
ON CONFLICT (id) DO UPDATE SET
  "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, category = EXCLUDED.category, title = EXCLUDED.title, description = EXCLUDED.description, details = EXCLUDED.details, badge = EXCLUDED.badge;

-- Seeding mini_guides
INSERT INTO mini_guides (id, type, slug, "countryCode", country_code, destination, destination_id, title, excerpt, "heroImage", hero_image, details)
VALUES (
  'a1111111-1111-4111-d111-111111111111', 
  'pocket', 
  'marrakech', 
  'MA', 
  'MA', 
  'Morocco', 
  'd5555555-5555-4555-a555-555555555555', 
  'Marrakech Travel Guide', 
  'Marrakech is one of those places that exceeds every expectation and then some. Colourful, vibrant, full-on — the kind of trip you start planning your return to before it''s even over. This pocket...', 
  'https://images.unsplash.com/photo-1597212618440-806262de4f6b?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1597212618440-806262de4f6b?q=80&w=2000&auto=format&fit=crop',
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type, slug = EXCLUDED.slug, "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, "heroImage" = EXCLUDED."heroImage", hero_image = EXCLUDED.hero_image, details = EXCLUDED.details;
INSERT INTO mini_guides (id, type, slug, "countryCode", country_code, destination, destination_id, title, excerpt, "heroImage", hero_image, details)
VALUES (
  'a2222222-2222-4222-d222-222222222222', 
  'pocket', 
  'kyoto', 
  'JP', 
  'JP', 
  'Japan', 
  'd1111111-1111-4111-a111-111111111111', 
  'Kyoto Travel Guide', 
  'Kyoto rewards a slower pace. This guide pulls together the temples worth seeing, where to stay across price points, and the small counters and rituals that turn a trip here into something...', 
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop',
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type, slug = EXCLUDED.slug, "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, "heroImage" = EXCLUDED."heroImage", hero_image = EXCLUDED.hero_image, details = EXCLUDED.details;
INSERT INTO mini_guides (id, type, slug, "countryCode", country_code, destination, destination_id, title, excerpt, "heroImage", hero_image, details)
VALUES (
  'a3333333-3333-4333-d333-333333333333', 
  'pocket', 
  'lisbon', 
  'PT', 
  'PT', 
  'Portugal', 
  'd2222222-2222-4222-a222-222222222222', 
  'Lisbon Travel Guide', 
  'Lisbon is a city of inclines, golden hours, and small counters where the woman behind the bar starts your order before you sit down. This guide is the pocket version: where to stay, what t...', 
  'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=2000&auto=format&fit=crop',
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type, slug = EXCLUDED.slug, "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, "heroImage" = EXCLUDED."heroImage", hero_image = EXCLUDED.hero_image, details = EXCLUDED.details;
INSERT INTO mini_guides (id, type, slug, "countryCode", country_code, destination, destination_id, title, excerpt, "heroImage", hero_image, details)
VALUES (
  'a4444444-4444-4444-d444-444444444444', 
  'itinerary', 
  'four-days-in-belgium', 
  'BE', 
  'BE', 
  'Belgium', 
  'd9999999-9999-4999-a999-999999999999', 
  'How to Spend 4 Days in Belgium', 
  'BRUSSELS • BRUGES • GHENT • SEPTEMBER 2025', 
  'https://images.unsplash.com/photo-1549877452-9c387954fbc2?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1549877452-9c387954fbc2?q=80&w=2000&auto=format&fit=crop',
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type, slug = EXCLUDED.slug, "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, "heroImage" = EXCLUDED."heroImage", hero_image = EXCLUDED.hero_image, details = EXCLUDED.details;
INSERT INTO mini_guides (id, type, slug, "countryCode", country_code, destination, destination_id, title, excerpt, "heroImage", hero_image, details)
VALUES (
  'a5555555-5555-4555-d555-555555555555', 
  'itinerary', 
  'two-weeks-in-italy', 
  'IT', 
  'IT', 
  'Italy', 
  'd8888888-8888-4888-a888-888888888888', 
  'How to Spend 2 Weeks in Italy', 
  'ROME • FLORENCE • TUSCANY • CINQUE TERRE • AMALFI • MAY 2025', 
  'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=2000&auto=format&fit=crop',
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type, slug = EXCLUDED.slug, "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, "heroImage" = EXCLUDED."heroImage", hero_image = EXCLUDED.hero_image, details = EXCLUDED.details;
INSERT INTO mini_guides (id, type, slug, "countryCode", country_code, destination, destination_id, title, excerpt, "heroImage", hero_image, details)
VALUES (
  'a6666666-6666-4666-d666-666666666666', 
  'itinerary', 
  'seven-days-in-portugal', 
  'PT', 
  'PT', 
  'Portugal', 
  'd2222222-2222-4222-a222-222222222222', 
  'Seven Days in Portugal: A Long-Read Itinerary', 
  'LISBON • SINTRA • ÉVORA • PORTO • DOURO VALLEY • OCTOBER 2025', 
  'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=2000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=2000&auto=format&fit=crop',
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type, slug = EXCLUDED.slug, "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, "heroImage" = EXCLUDED."heroImage", hero_image = EXCLUDED.hero_image, details = EXCLUDED.details;

-- Seeding packages
INSERT INTO packages (id, title, price, "shortDescription", short_description, offerings)
VALUES (
  'f1111111-1111-4111-e111-111111111111', 
  '1-on-1 Consultation', 
  '$150', 
  'A 60-minute strategy call to brainstorm ideas, review your current plans, and provide expert advice.', 
  'A 60-minute strategy call to brainstorm ideas, review your current plans, and provide expert advice.', 
  ARRAY['60-minute video call', 'Destination recommendations', 'Hotel & activity suggestions', 'Follow-up email with summary notes']
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, price = EXCLUDED.price, "shortDescription" = EXCLUDED."shortDescription", short_description = EXCLUDED.short_description, offerings = EXCLUDED.offerings;
INSERT INTO packages (id, title, price, "shortDescription", short_description, offerings)
VALUES (
  'f2222222-2222-4222-e222-222222222222', 
  'Custom Itinerary', 
  '$450+', 
  'A fully personalized day-by-day itinerary designed entirely around your travel style and preferences.', 
  'A fully personalized day-by-day itinerary designed entirely around your travel style and preferences.', 
  ARRAY['Everything in Consultation', 'Detailed day-by-day plan', 'Curated hotel & dining lists', 'Interactive digital itinerary map', 'Direct booking links provided']
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, price = EXCLUDED.price, "shortDescription" = EXCLUDED."shortDescription", short_description = EXCLUDED.short_description, offerings = EXCLUDED.offerings;
INSERT INTO packages (id, title, price, "shortDescription", short_description, offerings)
VALUES (
  'f3333333-3333-4333-e333-333333333333', 
  'Full Concierge', 
  '$1,200+', 
  'The ultimate luxury service. We handle every single detail, from flights and VIP transfers to exclusive reservations.', 
  'The ultimate luxury service. We handle every single detail, from flights and VIP transfers to exclusive reservations.', 
  ARRAY['Everything in Custom Itinerary', 'All bookings managed for you', 'VIP perks & upgrades (when available)', '24/7 support during travel', 'Restaurant & spa reservations']
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, price = EXCLUDED.price, "shortDescription" = EXCLUDED."shortDescription", short_description = EXCLUDED.short_description, offerings = EXCLUDED.offerings;

-- Seeding testimonials
INSERT INTO testimonials (id, name, text, destination, destination_id, image)
VALUES (
  'e1111111-1111-4111-f111-111111111111', 
  'Sarah & Mark T.', 
  'Our honeymoon in the Maldives was absolutely flawless. The attention to detail and VIP treatment at every step made it a once-in-a-lifetime experience. We''ll never plan a trip without this service again.', 
  'Maldives', 
  NULL, 
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=500&auto=format&fit=crop'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, text = EXCLUDED.text, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, image = EXCLUDED.image;
INSERT INTO testimonials (id, name, text, destination, destination_id, image)
VALUES (
  'e2222222-2222-4222-f222-222222222222', 
  'James L.', 
  'The Kyoto itinerary was a masterpiece. Having access to private temples and reservations at incredible sushi counters that I could never have booked myself was incredible.', 
  'Japan', 
  'd1111111-1111-4111-a111-111111111111', 
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=500&auto=format&fit=crop'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, text = EXCLUDED.text, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, image = EXCLUDED.image;
