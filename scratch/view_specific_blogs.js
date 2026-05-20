const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
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

async function run() {
  const ids = ["b1111111-1111-4111-b111-111111111111", "3b9b87fe-5f0f-454b-b894-4c2035e8a432"];
  const { data, error } = await supabase.from('blog_posts').select('*').in('id', ids);
  if (error) {
    console.error('Error fetching blogs:', error);
    return;
  }
  console.log(JSON.stringify(data, null, 2));
}

run();
