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
  console.log('1. Deleting dummy/empty Kyoto seed post b1111111-1111-4111-b111-111111111111...');
  const { error: deleteError } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', 'b1111111-1111-4111-b111-111111111111');
  if (deleteError) {
    console.error('Delete error:', deleteError);
  } else {
    console.log('Dummy post deleted.');
  }

  console.log('2. Updating real Kyoto blog post 3b9b87fe-5f0f-454b-b894-4c2035e8a432...');
  const { data: updateData, error: updateError } = await supabase
    .from('blog_posts')
    .update({
      slug: 'slow-mornings-in-kyoto',
      category: 'CULTURE • KYOTO • APR 2025',
      date: 'April 2025'
    })
    .eq('id', '3b9b87fe-5f0f-454b-b894-4c2035e8a432')
    .select();

  if (updateError) {
    console.error('Update error:', updateError);
  } else {
    console.log('Kyoto post updated successfully:', updateData);
  }

  console.log('3. Fixing mismatched Tokyo post b2222222-2222-4222-b222-222222222222...');
  const { data: updateData2, error: updateError2 } = await supabase
    .from('blog_posts')
    .update({
      title: 'How to Spend a Day In Tokyo',
      category: 'ITINERARY • TOKYO • MAY 2025',
      date: 'May 2025'
    })
    .eq('id', 'b2222222-2222-4222-b222-222222222222')
    .select();

  if (updateError2) {
    console.error('Tokyo update error:', updateError2);
  } else {
    console.log('Tokyo post updated successfully:', updateData2);
  }
}

run();
