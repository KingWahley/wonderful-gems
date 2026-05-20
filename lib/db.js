import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to handle response and throw errors if any
const handleResponse = ({ data, error }) => {
  if (error) {
    console.error("Supabase error detail:", error);
    throw new Error(error.message || JSON.stringify(error));
  }
  return data;
};

// --- DESTINATIONS ---
export async function fetchDestinations() {
  const response = await supabase
    .from("destinations")
    .select("*")
    .order("country", { ascending: true });
  return handleResponse(response);
}

export async function saveDestination(destination) {
  const cleaned = { ...destination };
  // If id is not a valid UUID (e.g. empty or legacy short ID), let database handle it
  if (!cleaned.id || typeof cleaned.id !== "string" || cleaned.id.length < 20) {
    delete cleaned.id;
  }
  const response = await supabase
    .from("destinations")
    .upsert(cleaned)
    .select()
    .single();
  return handleResponse(response);
}

export async function deleteDestination(id) {
  const response = await supabase
    .from("destinations")
    .delete()
    .eq("id", id);
  if (response.error) {
    throw new Error(response.error.message);
  }
  return true;
}

// --- BLOG POSTS ---
export async function fetchBlogs() {
  const response = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });
  return handleResponse(response);
}

export async function saveBlog(blog) {
  const cleaned = { ...blog };
  if (!cleaned.id || typeof cleaned.id !== "string" || cleaned.id.length < 20) {
    delete cleaned.id;
    cleaned.created_at = new Date().toISOString();
  }
  const response = await supabase
    .from("blog_posts")
    .upsert(cleaned)
    .select()
    .single();
  return handleResponse(response);
}

export async function deleteBlog(id) {
  const response = await supabase
    .from("blog_posts")
    .delete()
    .eq("id", id);
  if (response.error) {
    throw new Error(response.error.message);
  }
  return true;
}

// --- TOURS ---
export async function fetchTours() {
  const response = await supabase
    .from("tours")
    .select("*")
    .order("title", { ascending: true });
  const data = handleResponse(response);
  return data.map(tour => {
    let extra = {};
    let isJson = false;
    if (tour.details) {
      try {
        extra = JSON.parse(tour.details);
        isJson = true;
      } catch (e) {
        // Fallback if details is a plain string
        extra = { rawDetails: tour.details };
      }
    }
    const cleanDuration = tour.duration || extra.duration || (isJson ? "" : tour.details) || "3 Hours";
    return {
      ...tour,
      ...extra,
      duration: cleanDuration,
      // Overwrite details with duration if it was a JSON string to prevent UI leaks
      details: isJson ? cleanDuration : tour.details
    };
  });
}

export async function saveTour(tour) {
  const cleaned = { ...tour };
  if (!cleaned.id || typeof cleaned.id !== "string" || cleaned.id.length < 20) {
    delete cleaned.id;
  }
  
  // Extract all advanced/custom fields and serialize them into the details TEXT column
  const extraFields = {
    slug: cleaned.slug,
    heroImage: cleaned.heroImage,
    shortDescription: cleaned.shortDescription,
    price: cleaned.price,
    availability: cleaned.availability,
    included: cleaned.included || [],
    gallery: cleaned.gallery || [],
    duration: cleaned.duration || cleaned.details || "3 Hours",
    city: cleaned.city || "",
    bookingLink: cleaned.bookingLink || "",
    partnerNote: cleaned.partnerNote || "",
    imageAltText: cleaned.imageAltText || "",
    pocketGuideId: cleaned.pocketGuideId || "",
    itineraryGuideId: cleaned.itineraryGuideId || "",
    featureOnHomepage: cleaned.featureOnHomepage || "No",
    featureOnDestination: cleaned.featureOnDestination || "Yes",
    sortOrder: cleaned.sortOrder || "",
    seoTitle: cleaned.seoTitle || "",
    metaDescription: cleaned.metaDescription || "",
  };
  
  cleaned.details = JSON.stringify(extraFields);
  
  // Clean up fields that are not physical columns in the database table to prevent upsert errors
  delete cleaned.slug;
  delete cleaned.heroImage;
  delete cleaned.shortDescription;
  delete cleaned.availability;
  delete cleaned.included;
  delete cleaned.gallery;
  delete cleaned.city;
  delete cleaned.bookingLink;
  delete cleaned.partnerNote;
  delete cleaned.imageAltText;
  delete cleaned.pocketGuideId;
  delete cleaned.itineraryGuideId;
  delete cleaned.featureOnHomepage;
  delete cleaned.featureOnDestination;
  delete cleaned.sortOrder;
  delete cleaned.seoTitle;
  delete cleaned.metaDescription;

  const response = await supabase
    .from("tours")
    .upsert(cleaned)
    .select()
    .single();
    
  const returnedTour = handleResponse(response);
  let extra = {};
  let isJson = false;
  if (returnedTour.details) {
    try {
      extra = JSON.parse(returnedTour.details);
      isJson = true;
    } catch (e) {
      extra = { rawDetails: returnedTour.details };
    }
  }
  const cleanDuration = returnedTour.duration || extra.duration || (isJson ? "" : returnedTour.details) || "3 Hours";
  return {
    ...returnedTour,
    ...extra,
    duration: cleanDuration,
    // Overwrite details with duration if it was a JSON string to prevent UI leaks
    details: isJson ? cleanDuration : returnedTour.details
  };
}

export async function deleteTour(id) {
  const response = await supabase
    .from("tours")
    .delete()
    .eq("id", id);
  if (response.error) {
    throw new Error(response.error.message);
  }
  return true;
}

// --- MINI GUIDES ---
export async function fetchMiniGuides() {
  const response = await supabase
    .from("mini_guides")
    .select("*")
    .order("title", { ascending: true });
  return handleResponse(response);
}

export async function saveMiniGuide(guide) {
  const cleaned = { ...guide };
  if (!cleaned.id || typeof cleaned.id !== "string" || cleaned.id.length < 20) {
    delete cleaned.id;
  }
  const response = await supabase
    .from("mini_guides")
    .upsert(cleaned)
    .select()
    .single();
  return handleResponse(response);
}

export async function deleteMiniGuide(id) {
  const response = await supabase
    .from("mini_guides")
    .delete()
    .eq("id", id);
  if (response.error) {
    throw new Error(response.error.message);
  }
  return true;
}

// --- PACKAGES ---
export async function fetchPackages() {
  const response = await supabase
    .from("packages")
    .select("*")
    .order("price", { ascending: true });
  return handleResponse(response);
}

export async function savePackage(pkg) {
  const cleaned = { ...pkg };
  if (!cleaned.id || typeof cleaned.id !== "string" || cleaned.id.length < 20) {
    delete cleaned.id;
  }
  const response = await supabase
    .from("packages")
    .upsert(cleaned)
    .select()
    .single();
  return handleResponse(response);
}

export async function deletePackage(id) {
  const response = await supabase
    .from("packages")
    .delete()
    .eq("id", id);
  if (response.error) {
    throw new Error(response.error.message);
  }
  return true;
}

// --- TESTIMONIALS ---
export async function fetchTestimonials() {
  const response = await supabase
    .from("testimonials")
    .select("*");
  return handleResponse(response);
}

export async function saveTestimonial(testimonial) {
  const cleaned = { ...testimonial };
  if (!cleaned.id || typeof cleaned.id !== "string" || cleaned.id.length < 20) {
    delete cleaned.id;
  }
  const response = await supabase
    .from("testimonials")
    .upsert(cleaned)
    .select()
    .single();
  return handleResponse(response);
}

export async function deleteTestimonial(id) {
  const response = await supabase
    .from("testimonials")
    .delete()
    .eq("id", id);
  if (response.error) {
    throw new Error(response.error.message);
  }
  return true;
}

// --- IMAGE UPLOADS ---
export async function uploadImage(file, bucketName = "wanderful-images") {
  try {
    const fileExt = file.name.split(".").pop();
    // Safe modern naming using crypto.randomUUID()
    const randomName = typeof crypto !== "undefined" && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15);
    const fileName = `${randomName}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (error) {
      console.warn("Supabase Storage upload failed, falling back to Base64 data URL:", error.message);
      return await convertFileToBase64(file);
    }

    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.warn("Exception during Supabase Storage upload, falling back to Base64 data URL:", err);
    return await convertFileToBase64(file);
  }
}

function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

// --- SITE SETTINGS ---

export async function fetchSettings(key) {
  try {
    const response = await supabase
      .from("site_settings")
      .select("*")
      .eq("key", key)
      .maybeSingle();

    if (response.error) {
      console.warn(`Supabase site_settings read error for key "${key}":`, response.error.message);
      return null;
    }

    if (response.data) {
      return response.data.value;
    }
  } catch (err) {
    console.warn(`Exception reading site_settings for key "${key}":`, err);
  }
  
  return null;
}

export async function saveSettings(key, value) {
  try {
    const response = await supabase
      .from("site_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() })
      .select()
      .single();
    return handleResponse(response);
  } catch (err) {
    console.error("Exception in saveSettings:", err);
    throw err;
  }
}

// --- MEDIA LIBRARY ---

export async function fetchMediaAssets() {
  const bucketName = "wanderful-images";
  let bucketFiles = [];
  try {
    const { data, error } = await supabase.storage.from(bucketName).list();
    if (error) {
      console.warn("Failed to fetch media assets from storage:", error);
    } else {
      bucketFiles = data.filter(file => file.name !== ".emptyFolderPlaceholder");
    }
  } catch (err) {
    console.warn("Error listing storage files:", err);
  }

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
    console.warn("Could not fetch all content for usage tracking", err);
  }

  const mergedAssetsMap = new Map();

  // Populate map with storage bucket files first
  for (const file of bucketFiles) {
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
      usage: "UNASSIGNED",
      usageDetails: []
    });
  }

  // Helper to apply usage info
  const addUsage = (urlOrName, description) => {
    for (const [publicUrl, asset] of mergedAssetsMap.entries()) {
      if (
        publicUrl === urlOrName || 
        asset.name === urlOrName || 
        (typeof urlOrName === 'string' && (publicUrl.includes(urlOrName) || urlOrName.includes(asset.name)))
      ) {
        asset.usage = "ASSIGNED";
        if (!asset.usageDetails.includes(description)) {
          asset.usageDetails.push(description);
        }
      }
    }
  };

  const extractedImages = [];

  function scanValue(val, description, rowContext) {
    if (!val) return;
    if (typeof val === 'string') {
      const isSupabaseUrl = val.startsWith('http') && val.includes('supabase.co/storage/v1/object/public/');
      const isBase64 = val.startsWith('data:image/');
      if (isSupabaseUrl || isBase64) {
        extractedImages.push({
          url: val,
          isBase64,
          isSupabaseUrl,
          description,
          rowContext
        });
      }
    } else if (Array.isArray(val)) {
      for (const item of val) {
        scanValue(item, description, rowContext);
      }
    } else if (typeof val === 'object') {
      for (const key of Object.keys(val)) {
        scanValue(val[key], description, rowContext);
      }
    }
  }

  // Scan destinations
  destinations.forEach(row => {
    const desc = `Destination: ${row.name || 'Untitled'}`;
    scanValue(row.coverImage, desc, row);
    scanValue(row.hero_image, desc, row);
    scanValue(row.gallery, desc, row);
    scanValue(row.gallery_json, desc, row);
  });

  // Scan blogs
  blogs.forEach(row => {
    const desc = `Blog Post: ${row.title || 'Untitled'}`;
    scanValue(row.coverImage, desc, row);
    scanValue(row.hero_image, desc, row);
    scanValue(row.content, desc, row);
  });

  // Scan tours
  tours.forEach(row => {
    let title = row.name || 'Untitled Tour';
    if (row.details) {
      try {
        const parsed = JSON.parse(row.details);
        if (parsed.title) title = parsed.title;
        scanValue(parsed, `Tour: ${title}`, row);
      } catch (e) {
        scanValue(row.details, `Tour: ${title}`, row);
      }
    }
  });

  // Scan guides
  guides.forEach(row => {
    const desc = `Mini Guide: ${row.title || 'Untitled'}`;
    scanValue(row.heroImage, desc, row);
    scanValue(row.hero_image, desc, row);
    scanValue(row.details, desc, row);
  });

  // Scan packages
  packages.forEach(row => {
    const desc = `Package: ${row.title || row.name || 'Untitled'}`;
    scanValue(row.shortDescription, desc, row);
    scanValue(row.offerings, desc, row);
  });

  // Scan testimonials
  testimonials.forEach(row => {
    const desc = `Testimonial: ${row.name || 'Anonymous'}`;
    scanValue(row.image, desc, row);
  });

  // Scan settings
  const settingLabelMap = {
    home_hero: "Homepage Hero Banner",
    home_cta: "Homepage CTA Section",
    about_page: "About Page Content",
    plan_page: "Plan Page Content"
  };
  settings.forEach(row => {
    const desc = `Settings: ${settingLabelMap[row.key] || row.key}`;
    scanValue(row.value, desc, row);
  });

  // First apply usage details to the storage bucket files
  for (const img of extractedImages) {
    addUsage(img.url, img.description);
  }

  // Now add any database-only images that are not in storage bucket list
  for (const img of extractedImages) {
    const { url, isBase64, isSupabaseUrl, description, rowContext } = img;
    
    if (mergedAssetsMap.has(url)) {
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
      usage: "ASSIGNED",
      usageDetails: [description]
    });
  }

  return Array.from(mergedAssetsMap.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function deleteMediaAsset(fileName, publicUrl = null, bucketName = "wanderful-images") {
  if (publicUrl && !publicUrl.startsWith('data:')) {
    try {
      const { error } = await supabase.storage.from(bucketName).remove([fileName]);
      if (error) {
        console.warn("Storage removal warning:", error.message);
      }
    } catch (err) {
      console.warn("Exception removing from storage:", err);
    }
  } else if (!publicUrl && fileName && !fileName.startsWith('data:')) {
    try {
      const { error } = await supabase.storage.from(bucketName).remove([fileName]);
      if (error) {
        console.warn("Storage removal warning (fallback):", error.message);
      }
    } catch (err) {
      console.warn("Exception removing from storage (fallback):", err);
    }
  }

  // Clean up database references
  const target = publicUrl || fileName;
  await clearImageReferencesInDB(target);
  return true;
}

async function clearImageReferencesInDB(target) {
  if (!target) return;

  const matches = (val) => {
    if (typeof val !== 'string') return false;
    return val === target || val.includes(target);
  };

  const cleanObj = (val) => {
    if (!val) return val;
    if (typeof val === 'string') {
      return matches(val) ? null : val;
    }
    if (Array.isArray(val)) {
      return val.filter(item => !matches(item)).map(cleanObj);
    }
    if (typeof val === 'object') {
      const copy = { ...val };
      for (const key of Object.keys(copy)) {
        copy[key] = cleanObj(copy[key]);
      }
      return copy;
    }
    return val;
  };

  try {
    // 1. blog_posts
    const { data: blogs } = await supabase.from('blog_posts').select('*');
    for (const blog of blogs || []) {
      let changed = false;
      const updated = { ...blog };
      if (matches(blog.coverImage)) {
        updated.coverImage = null;
        changed = true;
      }
      if (matches(blog.hero_image)) {
        updated.hero_image = null;
        changed = true;
      }
      if (blog.content) {
        const cleanedContent = cleanObj(blog.content);
        if (JSON.stringify(blog.content) !== JSON.stringify(cleanedContent)) {
          updated.content = cleanedContent;
          changed = true;
        }
      }
      if (changed) {
        await supabase.from('blog_posts').update(updated).eq('id', blog.id);
      }
    }

    // 2. destinations
    const { data: dests } = await supabase.from('destinations').select('*');
    for (const dest of dests || []) {
      let changed = false;
      const updated = { ...dest };
      if (matches(dest.coverImage)) {
        updated.coverImage = null;
        changed = true;
      }
      if (matches(dest.hero_image)) {
        updated.hero_image = null;
        changed = true;
      }
      if (dest.gallery && dest.gallery.some(matches)) {
        updated.gallery = dest.gallery.filter(item => !matches(item));
        changed = true;
      }
      if (dest.gallery_json && dest.gallery_json.some(matches)) {
        updated.gallery_json = dest.gallery_json.filter(item => !matches(item));
        changed = true;
      }
      if (changed) {
        await supabase.from('destinations').update(updated).eq('id', dest.id);
      }
    }

    // 3. tours
    const { data: tours } = await supabase.from('tours').select('*');
    for (const tour of tours || []) {
      if (tour.details) {
        try {
          const parsed = JSON.parse(tour.details);
          const cleaned = cleanObj(parsed);
          if (JSON.stringify(parsed) !== JSON.stringify(cleaned)) {
            await supabase.from('tours').update({ details: JSON.stringify(cleaned) }).eq('id', tour.id);
          }
        } catch (e) {
          if (matches(tour.details)) {
            await supabase.from('tours').update({ details: null }).eq('id', tour.id);
          }
        }
      }
    }

    // 4. mini_guides
    const { data: guides } = await supabase.from('mini_guides').select('*');
    for (const guide of guides || []) {
      let changed = false;
      const updated = { ...guide };
      if (matches(guide.heroImage)) {
        updated.heroImage = null;
        changed = true;
      }
      if (matches(guide.hero_image)) {
        updated.hero_image = null;
        changed = true;
      }
      if (guide.details) {
        const cleanedDetails = cleanObj(guide.details);
        if (JSON.stringify(guide.details) !== JSON.stringify(cleanedDetails)) {
          updated.details = cleanedDetails;
          changed = true;
        }
      }
      if (changed) {
        await supabase.from('mini_guides').update(updated).eq('id', guide.id);
      }
    }

    // 5. site_settings
    const { data: settings } = await supabase.from('site_settings').select('*');
    for (const setting of settings || []) {
      if (setting.value) {
        const cleanedVal = cleanObj(setting.value);
        if (JSON.stringify(setting.value) !== JSON.stringify(cleanedVal)) {
          await supabase.from('site_settings').update({ value: cleanedVal }).eq('key', setting.key);
        }
      }
    }

    // 6. testimonials
    const { data: testimonials } = await supabase.from('testimonials').select('*');
    for (const t of testimonials || []) {
      if (matches(t.image)) {
        await supabase.from('testimonials').update({ image: null }).eq('id', t.id);
      }
    }

  } catch (err) {
    console.error("Error clearing database image references:", err);
  }
}


