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

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEFAULT_SETTINGS = {
  home_hero: {
    badge: "JOURNAL & FIELD GUIDES",
    title: "A journal of slow travel.",
    subtitle1: "Long essays for when you want to be transported, and short pocket guides for when you have a flight already booked.",
    subtitle2: "Every recommendation is something I've actually done, eaten, or slept in. No AI fluff, no paid PR. Just the places that made me take the long way home.",
    coverImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000&auto=format&fit=crop"
  },
  home_cta: {
    badge: "PLAN YOUR TRIP",
    title: "Let's build your perfect slow travel itinerary.",
    description: "Skip the endless scrolling and cookie-cutter travel blogs. Tell me where you are going, what you love, and how you want to travel — I'll construct a premium custom itinerary just for you.",
    buttonText: "PLAN WITH ME"
  },
  about_page: {
    badge: "ABOUT",
    title: "I write about places like I'd text a friend.",
    introText: "The Long Way is a journal of slow travel — long essays for when you want to be transported, and short field guides for when you have a flight already booked. ✈️",
    middleText: "I started writing it because the travel internet got loud, and I missed the kind of writing that took its time. The kind you read with a coffee on a Sunday morning and put down feeling like you've been somewhere.",
    footerText: "When I recommend a tour, a hotel, or a piece of gear, it's something I've used and would tell a friend to use. Some are affiliate links — they cost you nothing and keep this journal going. 🥂",
    coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1000&auto=format&fit=crop",
    floatingPill: "👋 HI, THAT'S ME",
    contactTitle: "say hi 👋",
    contactEmail: "hello@thelongway.travel"
  },
  plan_page: {
    heroBadge: "PLAN WITH ME",
    heroTitle: "Your custom slow travel itinerary.",
    heroSubtitle: "Let's skip the 20 hours of spreadsheet research. I'll design a cohesive, custom-tailored slow travel plan designed exactly for your style, pace, and curiosity.",
    faqBadge: "CURIOUS?",
    faqTitle: "Common questions",
    faqs: [
      { q: "How does the custom planning process work?", a: "First, you fill out a short brief about your style, pace, and interests. Then we have a quick chat to align, after which I design your custom interactive day-by-day pocket guide complete with stay and dining recommendations." },
      { q: "What if I need to make changes?", a: "Each itinerary package includes up to two full rounds of revisions. We'll tweak neighborhood bases, pacing, or activities until it feels exactly like your dream trip." },
      { q: "Do you book flights and hotels directly?", a: "I provide direct, curated booking links for everything (hotels, train tickets, unique tours) so you remain in full control of your bookings, points, and cancellation policies." }
    ]
  }
};

async function seed() {
  console.log("Seeding site settings defaults into Supabase...");
  
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    console.log(`Upserting setting key: "${key}"...`);
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      });
      
    if (error) {
      console.error(`Failed to upsert "${key}":`, error.message);
      console.log(`Note: If this is a 'relation \"public.site_settings\" does not exist' error, you must run the SQL snippet in your Supabase dashboard first!`);
    } else {
      console.log(`Successfully upserted "${key}"!`);
    }
  }
  
  console.log("Done!");
}

seed();
