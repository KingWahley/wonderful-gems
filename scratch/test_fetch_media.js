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

// Mimic db.js fetchers
async function fetchDestinations() {
  const response = await supabase.from("destinations").select("*");
  return response.data || [];
}
async function fetchBlogs() {
  const response = await supabase.from("blog_posts").select("*");
  return response.data || [];
}
async function fetchTours() {
  const response = await supabase.from("tours").select("*");
  return response.data || [];
}
async function fetchMiniGuides() {
  const response = await supabase.from("mini_guides").select("*");
  return response.data || [];
}
async function fetchPackages() {
  const response = await supabase.from("packages").select("*");
  return response.data || [];
}
async function fetchTestimonials() {
  const response = await supabase.from("testimonials").select("*");
  return response.data || [];
}

async function testFetchMediaAssets() {
  const bucketName = "wanderful-images";
  const { data: bucketData, error: bucketError } = await supabase.storage.from(bucketName).list();
  if (bucketError) {
    console.error("Bucket list error:", bucketError);
    return;
  }
  
  const validFiles = (bucketData || []).filter(file => file.name !== ".emptyFolderPlaceholder");

  let destinations = [], blogs = [], tours = [], guides = [], packages = [], testimonials = [], settings = [];
  try {
    const results = await Promise.all([
      fetchDestinations().catch(() => []),
      fetchBlogs().catch(() => []),
      fetchTours().catch(() => []),
      fetchMiniGuides().catch(() => []),
      fetchPackages().catch(() => []),
      fetchTestimonials().catch(() => []),
      supabase.from("site_settings").select("*").then(res => res.data || []).catch(() => []),
    ]);
    destinations = results[0];
    blogs = results[1];
    tours = results[2];
    guides = results[3];
    packages = results[4];
    testimonials = results[5];
    settings = results[6];
  } catch (err) {
    console.warn("Could not fetch all content", err);
  }

  const allContentString = JSON.stringify({ destinations, blogs, tours, guides, packages, testimonials, settings });

  const mergedAssetsMap = new Map();

  for (const file of validFiles) {
    const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(file.name);
    const publicUrl = publicData.publicUrl;

    mergedAssetsMap.set(publicUrl, {
      name: file.name,
      id: file.id || file.name,
      updated_at: file.updated_at || file.created_at || new Date().toISOString(),
      created_at: file.created_at || file.updated_at || new Date().toISOString(),
      size: file.metadata?.size || 0,
      mimetype: file.metadata?.mimetype || "unknown",
      url: publicUrl,
      usage: "UNASSIGNED"
    });
  }

  // Update usage for bucket files
  for (const [publicUrl, asset] of mergedAssetsMap.entries()) {
    const isAssigned = allContentString.includes(publicUrl) || allContentString.includes(asset.name);
    if (isAssigned) {
      asset.usage = "ASSIGNED";
    }
  }

  const extractedImages = [];

  function scanValue(val, rowContext) {
    if (!val) return;
    if (typeof val === 'string') {
      const isSupabaseUrl = val.startsWith('http') && val.includes('supabase.co/storage/v1/object/public/');
      const isBase64 = val.startsWith('data:image/');
      if (isSupabaseUrl || isBase64) {
        extractedImages.push({
          url: val,
          isBase64,
          isSupabaseUrl,
          rowContext
        });
      }
    } else if (Array.isArray(val)) {
      for (const item of val) {
        scanValue(item, rowContext);
      }
    } else if (typeof val === 'object') {
      for (const key of Object.keys(val)) {
        scanValue(val[key], rowContext);
      }
    }
  }

  // Scan all tables
  destinations.forEach(row => scanValue(row, row));
  blogs.forEach(row => scanValue(row, row));
  tours.forEach(row => scanValue(row, row));
  guides.forEach(row => scanValue(row, row));
  packages.forEach(row => scanValue(row, row));
  testimonials.forEach(row => scanValue(row, row));
  settings.forEach(row => scanValue(row, row));

  console.log(`Found ${extractedImages.length} extracted images in DB.`);

  for (const img of extractedImages) {
    const { url, isBase64, isSupabaseUrl, rowContext } = img;
    
    if (mergedAssetsMap.has(url)) {
      mergedAssetsMap.get(url).usage = "ASSIGNED";
      continue;
    }

    let name = "";
    let mimetype = "image/jpeg";
    let size = 0;

    if (isSupabaseUrl) {
      name = url.split('/').pop();
      try {
        name = decodeURIComponent(name);
      } catch (e) {}

      const ext = name.split('.').pop().toLowerCase();
      if (ext === 'png') mimetype = 'image/png';
      else if (ext === 'webp') mimetype = 'image/webp';
      else if (ext === 'gif') mimetype = 'image/gif';
      else if (ext === 'svg') mimetype = 'image/svg+xml';
      else if (ext === 'pdf') mimetype = 'application/pdf';
    } else if (isBase64) {
      const mimeMatch = url.match(/^data:([^;]+);base64,/);
      if (mimeMatch) {
        mimetype = mimeMatch[1];
      }
      const ext = mimetype.split('/')[1] || 'png';
      const hash = url.substring(url.indexOf(',') + 1, url.indexOf(',') + 20).replace(/[^a-zA-Z0-9]/g, '');
      name = `uploaded_base64_${hash}.${ext}`;
      
      try {
        size = Math.round((url.length - url.indexOf(',') - 1) * 3 / 4);
      } catch (e) {}
    }

    const rowTime = rowContext?.created_at || rowContext?.updated_at || new Date().toISOString();

    mergedAssetsMap.set(url, {
      name: name,
      id: url,
      updated_at: rowTime,
      created_at: rowTime,
      size: size,
      mimetype: mimetype,
      url: url,
      usage: "ASSIGNED"
    });
  }

  const results = Array.from(mergedAssetsMap.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  console.log("Merged assets count:", results.length);
  console.log("Assets:", results);
}

testFetchMediaAssets();
