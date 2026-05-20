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

async function findRef() {
  const tables = ['blog_posts', 'mini_guides', 'tours', 'packages', 'destinations', 'site_settings', 'testimonials'];
  const target = '91bd4944-af4f-4cce-b7e9-dab562ff5bb2_1779278220144.jpg';
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) continue;
    for (const row of data || []) {
      if (JSON.stringify(row).includes(target)) {
        console.log(`Found reference in ${table}:`, row);
      }
    }
  }
}

findRef();
