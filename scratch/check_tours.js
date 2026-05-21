const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    process.env[key] = value;
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Fetching raw tours from database...");
  try {
    const { data: tours, error } = await supabase.from('tours').select('*');
    if (error) throw error;
    console.log(`Fetched ${tours.length} tours:`);
    tours.forEach(tour => {
      console.log(`- Title: ${tour.title}`);
      console.log(`  ID: ${tour.id}`);
      console.log(`  Details: ${tour.details}`);
      console.log(`  Duration: ${tour.duration}`);
      console.log(`  Price: ${tour.price}`);
      console.log(`-----------------------------------`);
    });
  } catch (err) {
    console.error("Failed to fetch tours:", err);
  }
}

run();
