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

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTable(tableName) {
  try {
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    if (error) {
      console.error(`Error querying ${tableName}:`, error.message);
    } else {
      console.log(`Columns in ${tableName}:`, Object.keys(data[0] || {}));
      console.log(`Sample row in ${tableName}:`, data[0]);
    }
  } catch (err) {
    console.error(`Exception querying ${tableName}:`, err);
  }
}

async function run() {
  await checkTable('blog_posts');
  await checkTable('mini_guides');
  await checkTable('tours');
  await checkTable('packages');
  await checkTable('destinations');
}

run();

