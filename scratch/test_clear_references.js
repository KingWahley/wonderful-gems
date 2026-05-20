const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testClearReferencesDryRun(target) {
  console.log("Dry run for target:", target);
  if (!target) return;

  const matches = (val) => {
    if (typeof val !== 'string') return false;
    return val === target || val.includes(target);
  };

  const cleanObj = (val) => {
    if (!val) return val;
    if (typeof val === 'string') {
      return matches(val) ? null : val;
    }
    if (Array.isArray(val)) {
      return val.filter(item => !matches(item)).map(cleanObj);
    }
    if (typeof val === 'object') {
      const copy = { ...val };
      for (const key of Object.keys(copy)) {
        copy[key] = cleanObj(copy[key]);
      }
      return copy;
    }
    return val;
  };

  // 1. blog_posts
  const { data: blogs } = await supabase.from('blog_posts').select('*');
  for (const blog of blogs || []) {
    let changed = false;
    const updated = { ...blog };
    if (matches(blog.coverImage)) {
      updated.coverImage = null;
      changed = true;
    }
    if (matches(blog.hero_image)) {
      updated.hero_image = null;
      changed = true;
    }
    if (blog.content) {
      const cleanedContent = cleanObj(blog.content);
      if (JSON.stringify(blog.content) !== JSON.stringify(cleanedContent)) {
        updated.content = cleanedContent;
        changed = true;
      }
    }
    if (changed) {
      console.log(`[DRY RUN] Would update blog_post ${blog.id}: coverImage=${updated.coverImage}, hero_image=${updated.hero_image}`);
    }
  }

  // 2. destinations
  const { data: dests } = await supabase.from('destinations').select('*');
  for (const dest of dests || []) {
    let changed = false;
    const updated = { ...dest };
    if (matches(dest.coverImage)) {
      updated.coverImage = null;
      changed = true;
    }
    if (matches(dest.hero_image)) {
      updated.hero_image = null;
      changed = true;
    }
    if (dest.gallery && dest.gallery.some(matches)) {
      updated.gallery = dest.gallery.filter(item => !matches(item));
      changed = true;
    }
    if (dest.gallery_json && dest.gallery_json.some(matches)) {
      updated.gallery_json = dest.gallery_json.filter(item => !matches(item));
      changed = true;
    }
    if (changed) {
      console.log(`[DRY RUN] Would update destination ${dest.id}: coverImage=${updated.coverImage}`);
    }
  }

  // 3. tours
  const { data: tours } = await supabase.from('tours').select('*');
  for (const tour of tours || []) {
    if (tour.details) {
      try {
        const parsed = JSON.parse(tour.details);
        const cleaned = cleanObj(parsed);
        if (JSON.stringify(parsed) !== JSON.stringify(cleaned)) {
          console.log(`[DRY RUN] Would update tour ${tour.id} details JSON`);
        }
      } catch (e) {
        if (matches(tour.details)) {
          console.log(`[DRY RUN] Would set tour ${tour.id} details to null`);
        }
      }
    }
  }

  // 4. mini_guides
  const { data: guides } = await supabase.from('mini_guides').select('*');
  for (const guide of guides || []) {
    let changed = false;
    const updated = { ...guide };
    if (matches(guide.heroImage)) {
      updated.heroImage = null;
      changed = true;
    }
    if (matches(guide.hero_image)) {
      updated.hero_image = null;
      changed = true;
    }
    if (guide.details) {
      const cleanedDetails = cleanObj(guide.details);
      if (JSON.stringify(guide.details) !== JSON.stringify(cleanedDetails)) {
        updated.details = cleanedDetails;
        changed = true;
      }
    }
    if (changed) {
      console.log(`[DRY RUN] Would update mini_guide ${guide.id}`);
    }
  }

  // 5. site_settings
  const { data: settings } = await supabase.from('site_settings').select('*');
  for (const setting of settings || []) {
    if (setting.value) {
      const cleanedVal = cleanObj(setting.value);
      if (JSON.stringify(setting.value) !== JSON.stringify(cleanedVal)) {
        console.log(`[DRY RUN] Would update site_setting ${setting.key}`);
      }
    }
  }

  // 6. testimonials
  const { data: testimonials } = await supabase.from('testimonials').select('*');
  for (const t of testimonials || []) {
    if (matches(t.image)) {
      console.log(`[DRY RUN] Would update testimonial ${t.id} image to null`);
    }
  }
}

// Test with 91bd4944-af4f-4cce-b7e9-dab562ff5bb2_1779278220144.jpg
testClearReferencesDryRun('91bd4944-af4f-4cce-b7e9-dab562ff5bb2_1779278220144.jpg');
