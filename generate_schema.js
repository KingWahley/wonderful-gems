const fs = require('fs');
const path = require('path');

// We will parse mockData.js directly or import it since we know its format.
const mockDataPath = path.join(__dirname, 'data', 'mockData.js');
const mockDataContent = fs.readFileSync(mockDataPath, 'utf8');

// A helper to extract array variable by name using JS execution
function extractArray(varName) {
  const modifiedContent = mockDataContent
    .replace(/export const/g, 'const')
    .concat(`\nmodule.exports = { destinations, blogPosts, freshPosts, tours, miniGuides, packages, testimonials };`);
  
  const tempFile = path.join(__dirname, 'temp_mockData.js');
  fs.writeFileSync(tempFile, modifiedContent);
  const data = require(tempFile);
  fs.unlinkSync(tempFile);
  return data[varName];
}

const rawDestinations = extractArray('destinations');
const rawBlogPosts = extractArray('blogPosts');
const rawFreshPosts = extractArray('freshPosts');
const rawTours = extractArray('tours');
const rawMiniGuides = extractArray('miniGuides');
const rawPackages = extractArray('packages');
const rawTestimonials = extractArray('testimonials');

// UUID Static Mapping Tables to enforce standard production UUIDs
const uuidMap = {
  // Destinations
  dest: {
    '1': 'd1111111-1111-4111-a111-111111111111',
    '2': 'd2222222-2222-4222-a222-222222222222',
    '3': 'd3333333-3333-4333-a333-333333333333',
    '4': 'd4444444-4444-4444-a444-444444444444',
    '5': 'd5555555-5555-4555-a555-555555555555',
    '6': 'd6666666-6666-4666-a666-666666666666',
    '7': 'd7777777-7777-4777-a777-777777777777',
    '8': 'd8888888-8888-4888-a888-888888888888',
    '9': 'd9999999-9999-4999-a999-999999999999',
  },
  // Blog posts
  blog: {
    '1': 'b1111111-1111-4111-b111-111111111111',
    '2': 'b2222222-2222-4222-b222-222222222222',
    '3': 'b3333333-3333-4333-b333-333333333333',
    '4': 'b4444444-4444-4444-b444-444444444444',
    '5': 'b5555555-5555-4555-b555-555555555555',
    '6': 'b6666666-6666-4666-b666-666666666666',
    '7': 'b7777777-7777-4777-b777-777777777777',
    '8': 'b8888888-8888-4888-b888-888888888888',
    '9': 'b9999999-9999-4999-b999-999999999999',
    '10': 'baaaaaaa-aaaa-4aaa-baaa-aaaaaaaaaaaa',
    'fresh_1': 'bf111111-1111-4111-bf11-111111111111',
    'fresh_3': 'bf333333-3333-4333-bf33-333333333333',
  },
  // Tours
  tour: {
    '1': 'c1111111-1111-4111-c111-111111111111',
    '2': 'c2222222-2222-4222-c222-222222222222',
    '3': 'c3333333-3333-4333-c333-333333333333',
    '4': 'c4444444-4444-4444-c444-444444444444',
    '5': 'c5555555-5555-4555-c555-555555555555',
    '6': 'c6666666-6666-4666-c666-666666666666',
    '7': 'c7777777-7777-4777-c777-777777777777',
    '8': 'c8888888-8888-4888-c888-888888888888',
    '9': 'c9999999-9999-4999-c999-999999999999',
    '10': 'caaaaaaa-aaaa-4aaa-caaa-aaaaaaaaaaaa',
    '11': 'cbbbbbbb-bbbb-4bbb-cbbb-bbbbbbbbbbbb',
    '12': 'cccccccc-cccc-4ccc-cccc-cccccccccccc',
    '13': 'cddddddd-dddd-4ddd-cddd-dddddddddddd',
  },
  // Mini guides
  guide: {
    '1': 'a1111111-1111-4111-d111-111111111111',
    '2': 'a2222222-2222-4222-d222-222222222222',
    '3': 'a3333333-3333-4333-d333-333333333333',
    '4': 'a4444444-4444-4444-d444-444444444444',
    '5': 'a5555555-5555-4555-d555-555555555555',
    '6': 'a6666666-6666-4666-d666-666666666666',
  },
  // Packages
  pkg: {
    '1': 'f1111111-1111-4111-e111-111111111111',
    '2': 'f2222222-2222-4222-e222-222222222222',
    '3': 'f3333333-3333-4333-e333-333333333333',
  },
  // Testimonials
  test: {
    '1': 'e1111111-1111-4111-f111-111111111111',
    '2': 'e2222222-2222-4222-f222-222222222222',
  }
};

// Maps destination names to their static destination UUID
const destinationNameToId = {
  'japan': uuidMap.dest['1'],
  'portugal': uuidMap.dest['2'],
  'chile': uuidMap.dest['3'],
  'mexico': uuidMap.dest['4'],
  'morocco': uuidMap.dest['5'],
  'iceland': uuidMap.dest['6'],
  'vietnam': uuidMap.dest['7'],
  'italy': uuidMap.dest['8'],
  'belgium': uuidMap.dest['9'],
};

function getDestinationUuid(destName) {
  if (!destName) return null;
  const name = destName.toLowerCase();
  if (destinationNameToId[name]) {
    return destinationNameToId[name];
  }
  // Try partial match
  for (const [key, uuid] of Object.entries(destinationNameToId)) {
    if (name.includes(key) || key.includes(name)) {
      return uuid;
    }
  }
  return null;
}

// Convert all ids to UUIDs
const destinations = rawDestinations.map(d => ({
  ...d,
  id: uuidMap.dest[d.id] || d.id
}));

// Build blog post array
const blogsMap = new Map();
const takenIds = new Set(rawBlogPosts.map(p => p.id));

rawBlogPosts.forEach(p => {
  blogsMap.set(p.slug, {
    ...p,
    id: uuidMap.blog[p.id] || p.id,
    isFresh: false,
    date: null
  });
});

rawFreshPosts.forEach(p => {
  if (blogsMap.has(p.slug)) {
    const existing = blogsMap.get(p.slug);
    blogsMap.set(p.slug, {
      ...existing,
      ...p,
      id: existing.id,
      isFresh: true,
      category: p.date || existing.category
    });
  } else {
    let finalId = p.id;
    if (takenIds.has(finalId)) {
      finalId = `fresh_${p.id}`;
    }
    takenIds.add(finalId);
    blogsMap.set(p.slug, {
      ...p,
      id: uuidMap.blog[finalId] || finalId,
      isFresh: true,
      category: p.date
    });
  }
});

const allBlogs = Array.from(blogsMap.values());

const tours = rawTours.map(t => ({
  ...t,
  id: uuidMap.tour[t.id] || t.id,
  destination_id: getDestinationUuid(t.destination)
}));

const miniGuides = rawMiniGuides.map(mg => ({
  ...mg,
  id: uuidMap.guide[mg.id] || mg.id,
  destination_id: getDestinationUuid(mg.destination)
}));

const packages = rawPackages.map(pkg => ({
  ...pkg,
  id: uuidMap.pkg[pkg.id] || pkg.id
}));

const testimonials = rawTestimonials.map(test => ({
  ...test,
  id: uuidMap.test[test.id] || test.id,
  destination_id: getDestinationUuid(test.destination)
}));

// Helper to escape single quotes in SQL
function escapeSQL(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'string') {
    return `'${val.replace(/'/g, "''")}'`;
  }
  if (typeof val === 'boolean') {
    return val ? 'TRUE' : 'FALSE';
  }
  if (typeof val === 'number') {
    return val;
  }
  if (Array.isArray(val)) {
    return `ARRAY[${val.map(item => escapeSQL(item)).join(', ')}]`;
  }
  return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
}

// Helper to escape values specifically for Postgres JSONB columns
function escapeJSONB(val) {
  if (val === null || val === undefined) return 'NULL';
  return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
}

let sql = `-- ==========================================
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

`;

// Seed destinations
sql += `\n-- Seeding destinations\n`;
destinations.forEach(d => {
  sql += `INSERT INTO destinations (id, slug, country, code, country_code, title, excerpt, description, description_json, "whyILoveIt", why_i_love_it, moments, "coverImage", hero_image, gallery, gallery_json, "blogsCount", blogs_count, "toursCount", tours_count, region)
VALUES (
  ${escapeSQL(d.id)}, 
  ${escapeSQL(d.slug)}, 
  ${escapeSQL(d.country)}, 
  ${escapeSQL(d.code)}, 
  ${escapeSQL(d.code)}, 
  ${escapeSQL(d.country)}, 
  ${escapeSQL(d.excerpt)}, 
  ${escapeSQL(d.description)}, 
  ${escapeJSONB(d.description)}, 
  ${escapeSQL(d.whyILoveIt)}, 
  ${escapeSQL(d.whyILoveIt)}, 
  ${escapeSQL(d.moments)}, 
  ${escapeSQL(d.coverImage)}, 
  ${escapeSQL(d.coverImage)}, 
  ${escapeSQL(d.gallery)}, 
  ${escapeJSONB(d.gallery)}, 
  ${escapeSQL(d.blogsCount)}, 
  ${escapeSQL(d.blogsCount)}, 
  ${escapeSQL(d.toursCount)}, 
  ${escapeSQL(d.toursCount)}, 
  ${escapeSQL(d.region)}
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, country = EXCLUDED.country, code = EXCLUDED.code, country_code = EXCLUDED.country_code, title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, description = EXCLUDED.description, description_json = EXCLUDED.description_json, "whyILoveIt" = EXCLUDED."whyILoveIt", why_i_love_it = EXCLUDED.why_i_love_it, moments = EXCLUDED.moments, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, gallery = EXCLUDED.gallery, gallery_json = EXCLUDED.gallery_json, "blogsCount" = EXCLUDED."blogsCount", blogs_count = EXCLUDED.blogs_count, "toursCount" = EXCLUDED."toursCount", tours_count = EXCLUDED.tours_count, region = EXCLUDED.region;
`;
});

// Seed blog_posts
sql += `\n-- Seeding blog_posts\n`;
allBlogs.forEach(b => {
  const destId = getDestinationUuid(b.destination);
  sql += `INSERT INTO blog_posts (id, slug, title, destination, destination_id, "countryCode", country_code, category, "coverImage", hero_image, excerpt, "isFresh", is_fresh, date)
VALUES (
  ${escapeSQL(b.id)}, 
  ${escapeSQL(b.slug)}, 
  ${escapeSQL(b.title)}, 
  ${escapeSQL(b.destination)}, 
  ${destId ? escapeSQL(destId) : 'NULL'}, 
  ${escapeSQL(b.countryCode)}, 
  ${escapeSQL(b.countryCode)}, 
  ${escapeSQL(b.category)}, 
  ${escapeSQL(b.coverImage)}, 
  ${escapeSQL(b.coverImage)}, 
  ${escapeSQL(b.excerpt)}, 
  ${escapeSQL(b.isFresh)}, 
  ${escapeSQL(b.isFresh)}, 
  ${escapeSQL(b.date || null)}
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, title = EXCLUDED.title, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, category = EXCLUDED.category, "coverImage" = EXCLUDED."coverImage", hero_image = EXCLUDED.hero_image, excerpt = EXCLUDED.excerpt, "isFresh" = EXCLUDED."isFresh", is_fresh = EXCLUDED.is_fresh, date = EXCLUDED.date;
`;
});

// Seed tours
sql += `\n-- Seeding tours\n`;
tours.forEach(t => {
  sql += `INSERT INTO tours (id, "countryCode", country_code, destination, destination_id, category, title, description, details, badge)
VALUES (
  ${escapeSQL(t.id)}, 
  ${escapeSQL(t.countryCode)}, 
  ${escapeSQL(t.countryCode)}, 
  ${escapeSQL(t.destination)}, 
  ${t.destination_id ? escapeSQL(t.destination_id) : 'NULL'}, 
  ${escapeSQL(t.category)}, 
  ${escapeSQL(t.title)}, 
  ${escapeSQL(t.description)}, 
  ${escapeSQL(t.details)}, 
  ${escapeSQL(t.badge)}
)
ON CONFLICT (id) DO UPDATE SET
  "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, category = EXCLUDED.category, title = EXCLUDED.title, description = EXCLUDED.description, details = EXCLUDED.details, badge = EXCLUDED.badge;
`;
});

// Seed mini_guides
sql += `\n-- Seeding mini_guides\n`;
miniGuides.forEach(mg => {
  sql += `INSERT INTO mini_guides (id, type, slug, "countryCode", country_code, destination, destination_id, title, excerpt, "heroImage", hero_image, details)
VALUES (
  ${escapeSQL(mg.id)}, 
  ${escapeSQL(mg.type)}, 
  ${escapeSQL(mg.slug)}, 
  ${escapeSQL(mg.countryCode)}, 
  ${escapeSQL(mg.countryCode)}, 
  ${escapeSQL(mg.destination)}, 
  ${mg.destination_id ? escapeSQL(mg.destination_id) : 'NULL'}, 
  ${escapeSQL(mg.title)}, 
  ${escapeSQL(mg.excerpt)}, 
  ${escapeSQL(mg.heroImage)}, 
  ${escapeSQL(mg.heroImage)},
  ${mg.details ? escapeSQL(JSON.stringify(mg.details)) : 'NULL'}
)
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type, slug = EXCLUDED.slug, "countryCode" = EXCLUDED."countryCode", country_code = EXCLUDED.country_code, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, "heroImage" = EXCLUDED."heroImage", hero_image = EXCLUDED.hero_image, details = EXCLUDED.details;
`;
});

// Seed packages
sql += `\n-- Seeding packages\n`;
packages.forEach(pkg => {
  sql += `INSERT INTO packages (id, title, price, "shortDescription", short_description, offerings)
VALUES (
  ${escapeSQL(pkg.id)}, 
  ${escapeSQL(pkg.title)}, 
  ${escapeSQL(pkg.price)}, 
  ${escapeSQL(pkg.shortDescription)}, 
  ${escapeSQL(pkg.shortDescription)}, 
  ${escapeSQL(pkg.offerings)}
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, price = EXCLUDED.price, "shortDescription" = EXCLUDED."shortDescription", short_description = EXCLUDED.short_description, offerings = EXCLUDED.offerings;
`;
});

// Seed testimonials
sql += `\n-- Seeding testimonials\n`;
testimonials.forEach(test => {
  sql += `INSERT INTO testimonials (id, name, text, destination, destination_id, image)
VALUES (
  ${escapeSQL(test.id)}, 
  ${escapeSQL(test.name)}, 
  ${escapeSQL(test.text)}, 
  ${escapeSQL(test.destination)}, 
  ${test.destination_id ? escapeSQL(test.destination_id) : 'NULL'}, 
  ${escapeSQL(test.image)}
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, text = EXCLUDED.text, destination = EXCLUDED.destination, destination_id = EXCLUDED.destination_id, image = EXCLUDED.image;
`;
});

const outputPath = path.join(__dirname, 'supabase_schema.sql');
fs.writeFileSync(outputPath, sql);
console.log('Successfully generated enterprise supabase_schema.sql!');
