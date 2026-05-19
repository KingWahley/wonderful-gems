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
  return handleResponse(response);
}

export async function saveTour(tour) {
  const cleaned = { ...tour };
  if (!cleaned.id || typeof cleaned.id !== "string" || cleaned.id.length < 20) {
    delete cleaned.id;
  }
  const response = await supabase
    .from("tours")
    .upsert(cleaned)
    .select()
    .single();
  return handleResponse(response);
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
    console.error("Error uploading to Supabase Storage:", error);
    throw error;
  }

  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return data.publicUrl;
}
