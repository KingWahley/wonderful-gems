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

async function findImages() {
  const images = new Set();
  
  // 1. blog_posts
  const { data: blogs } = await supabase.from('blog_posts').select('coverImage, hero_image, content');
  (blogs || []).forEach(b => {
    if (b.coverImage) images.add(b.coverImage);
    if (b.hero_image) images.add(b.hero_image);
    // Content body or other fields?
    if (b.content && typeof b.content === 'object') {
      const contentStr = JSON.stringify(b.content);
      // find base64 or urls
      const urls = contentStr.match(/https?:\/\/[^\s"']+/g) || [];
      urls.forEach(u => images.add(u));
      const base64s = contentStr.match(/data:image\/[^\s"']+/g) || [];
      base64s.forEach(b => images.add(b));
    }
  });

  // 2. mini_guides
  const { data: guides } = await supabase.from('mini_guides').select('heroImage, hero_image, details');
  (guides || []).forEach(g => {
    if (g.heroImage) images.add(g.heroImage);
    if (g.hero_image) images.add(g.hero_image);
    if (g.details && typeof g.details === 'object') {
      const detailsStr = JSON.stringify(g.details);
      const urls = detailsStr.match(/https?:\/\/[^\s"']+/g) || [];
      urls.forEach(u => images.add(u));
      const base64s = detailsStr.match(/data:image\/[^\s"']+/g) || [];
      base64s.forEach(b => images.add(b));
    }
  });

  // 3. tours
  const { data: tours } = await supabase.from('tours').select('details');
  (tours || []).forEach(t => {
    if (t.details) {
      try {
        const parsed = JSON.parse(t.details);
        if (parsed.heroImage) images.add(parsed.heroImage);
        if (parsed.gallery) parsed.gallery.forEach(img => images.add(img));
      } catch (e) {
        // match from text
        const urls = t.details.match(/https?:\/\/[^\s"']+/g) || [];
        urls.forEach(u => images.add(u));
        const base64s = t.details.match(/data:image\/[^\s"']+/g) || [];
        base64s.forEach(b => images.add(b));
      }
    }
  });

  // 4. destinations
  const { data: dests } = await supabase.from('destinations').select('coverImage, hero_image, gallery, gallery_json');
  (dests || []).forEach(d => {
    if (d.coverImage) images.add(d.coverImage);
    if (d.hero_image) images.add(d.hero_image);
    if (d.gallery) d.gallery.forEach(img => images.add(img));
    if (d.gallery_json) d.gallery_json.forEach(img => images.add(img));
  });

  // 5. site_settings
  const { data: settings } = await supabase.from('site_settings').select('value');
  (settings || []).forEach(s => {
    if (s.value) {
      const valStr = typeof s.value === 'string' ? s.value : JSON.stringify(s.value);
      const urls = valStr.match(/https?:\/\/[^\s"']+/g) || [];
      urls.forEach(u => images.add(u));
      const base64s = valStr.match(/data:image\/[^\s"']+/g) || [];
      base64s.forEach(b => images.add(b));
    }
  });

  console.log("All unique images referenced in DB:", Array.from(images));
}

findImages();
