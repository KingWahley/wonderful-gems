const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
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

console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseAnonKey ? supabaseAnonKey.length : 0);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  try {
    const { data: blogData } = await supabase.from('blog_posts').select('id, slug, title, destination');
    console.log('--- BLOG POSTS ---');
    console.log(blogData);
    
    const { data: destData } = await supabase.from('destinations').select('id, slug, country');
    console.log('--- DESTINATIONS ---');
    console.log(destData);
    
    const { data: guideData } = await supabase.from('mini_guides').select('id, slug, title, destination, details');
    console.log('--- MINI GUIDES ---');
    guideData.forEach(g => {
      console.log(`Guide: ${g.slug}, Destination: ${g.destination}`);
      console.log(`Has details? ${!!g.details}`);
      if (g.details) {
        console.log(`- pocketTitle: ${g.details.pocketTitle}`);
        console.log(`- itineraryTitle: ${g.details.itineraryTitle}`);
        console.log(`- sights count: ${g.details.sights ? g.details.sights.length : 0}`);
        console.log(`- days count: ${g.details.days ? g.details.days.length : 0}`);
      }
    });

    const { data: settingsData, error: settingsError } = await supabase.from('site_settings').select('*');
    if (settingsError) {
      console.log('--- SITE SETTINGS ERROR ---', settingsError.message);
    } else {
      console.log('--- SITE SETTINGS ---');
      console.log(settingsData);
    }
  } catch (err) {
    console.error('Catch error:', err);
  }
}

run();
