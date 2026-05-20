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
    if (tour.details) {
      try {
        extra = JSON.parse(tour.details);
      } catch (e) {
        // Fallback if details is a plain string
        extra = { rawDetails: tour.details };
      }
    }
    return {
      ...tour,
      ...extra,
      // If duration is missing, fall back to what's in details plain text
      duration: tour.duration || extra.duration || tour.details || "3 Hours"
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
  };
  
  cleaned.details = JSON.stringify(extraFields);
  
  // Clean up fields that are not physical columns in the database table to prevent upsert errors
  delete cleaned.slug;
  delete cleaned.heroImage;
  delete cleaned.shortDescription;
  delete cleaned.availability;
  delete cleaned.included;
  delete cleaned.gallery;

  const response = await supabase
    .from("tours")
    .upsert(cleaned)
    .select()
    .single();
    
  const returnedTour = handleResponse(response);
  let extra = {};
  if (returnedTour.details) {
    try {
      extra = JSON.parse(returnedTour.details);
    } catch (e) {
      extra = { rawDetails: returnedTour.details };
    }
  }
  return {
    ...returnedTour,
    ...extra,
    duration: returnedTour.duration || extra.duration || returnedTour.details || "3 Hours"
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
  const { data, error } = await supabase.storage.from(bucketName).list();
  if (error) {
    console.warn("Failed to fetch media assets:", error);
    return [];
  }
  
  const validFiles = data.filter(file => file.name !== ".emptyFolderPlaceholder");

  let allContentString = "";
  try {
    const [destinations, blogs, tours, guides, packages, testimonials] = await Promise.all([
      fetchDestinations().catch(() => []),
      fetchBlogs().catch(() => []),
      fetchTours().catch(() => []),
      fetchMiniGuides().catch(() => []),
      fetchPackages().catch(() => []),
      fetchTestimonials().catch(() => []),
    ]);
    allContentString = JSON.stringify({ destinations, blogs, tours, guides, packages, testimonials });
  } catch (err) {
    console.warn("Could not fetch all content for usage tracking", err);
  }

  return validFiles.map(file => {
    const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(file.name);
    const publicUrl = publicData.publicUrl;
    
    // Check if URL is referenced anywhere or if the filename itself is referenced
    // (sometimes only the filename is stored if it's a relative path, though uploadImage returns full URL)
    const isAssigned = allContentString.includes(publicUrl) || allContentString.includes(file.name);

    return {
      name: file.name,
      id: file.id,
      updated_at: file.updated_at,
      created_at: file.created_at,
      size: file.metadata?.size || 0,
      mimetype: file.metadata?.mimetype || "unknown",
      url: publicUrl,
      usage: isAssigned ? "ASSIGNED" : "UNASSIGNED"
    };
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function deleteMediaAsset(fileName, bucketName = "wanderful-images") {
  const { error } = await supabase.storage.from(bucketName).remove([fileName]);
  if (error) {
    throw new Error(error.message);
  }
  return true;
}

