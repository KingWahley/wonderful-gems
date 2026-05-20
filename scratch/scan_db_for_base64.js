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

async function scan() {
  const tables = ['blog_posts', 'mini_guides', 'tours', 'packages', 'destinations', 'site_settings', 'testimonials'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.error(`Error fetching ${table}:`, error);
      continue;
    }
    for (const row of data || []) {
      const str = JSON.stringify(row);
      if (str.includes('data:image')) {
        console.log(`Found base64 in ${table}, row ID: ${row.id || row.key || 'unknown'}`);
        // print keys containing base64
        for (const k of Object.keys(row)) {
          const val = row[k];
          if (typeof val === 'string' && val.startsWith('data:image')) {
            console.log(`  Key: ${k}, Length: ${val.length}, Preview: ${val.substring(0, 50)}...`);
          } else if (typeof val === 'object' && val !== null) {
            const valStr = JSON.stringify(val);
            if (valStr.includes('data:image')) {
              console.log(`  Key (nested object): ${k}`);
            }
          }
        }
      }
    }
  }
}

scan();
