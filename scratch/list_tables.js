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

async function listTables() {
  // We can execute a query to fetch table names from information_schema
  // Since we don't have direct SQL execution client, let's try calling RPC or just query public tables
  // Wait, let's try selecting from pg_tables or information_schema.
  // Actually, we can check if there's any other tables by trying to query them.
  // But wait, we can also query the list of tables by doing a select from schema via RPC if there is one.
  // Is there a public RPC or sql function?
  // Let's check with some common tables.
  const commonTables = ['media', 'media_library', 'media_assets', 'uploads', 'assets', 'images', 'files'];
  for (const t of commonTables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (!error) {
      console.log(`Table exists: ${t}`);
    } else {
      // If error message is not "relation does not exist", it might exist
      if (!error.message.includes('relation') && !error.message.includes('does not exist')) {
        console.log(`Table might exist: ${t} (error: ${error.message})`);
      }
    }
  }
}

listTables();
