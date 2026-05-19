const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
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
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const cityGuidesData = {
  "lisbon": {
    country: "Portugal",
    flag: "🇵🇹",
    pocketTitle: "LISBON MINI GUIDE • POCKET VERSION",
    itineraryTitle: "7 DAYS IN PORTUGAL • FULL ITINERARY",
    blogCountText: "4 POSTS FROM PORTUGAL",
    excerpt: "A coastal city of inclines, golden hours, and small counters where the woman behind the bar starts your order before you sit down.",
    sights: [
      { num: "01", text: "Alfama at sunrise" },
      { num: "02", text: "Miradouro da Senhora do Monte" },
      { num: "03", text: "Jerónimos Monastery" },
      { num: "04", text: "Belém Tower" },
      { num: "05", text: "Time Out Market" },
      { num: "06", text: "LX Factory" },
      { num: "07", text: "Tram 28 (early morning only)" },
      { num: "08", text: "Castelo de São Jorge" }
    ],
    stay: {
      budget: [
        { name: "Lisbon Destination Hostel", desc: "Inside Rossio station, surprisingly nice." },
        { name: "Home Lisbon Hostel", desc: "Family dinners every night." }
      ],
      mid: [
        { name: "Santiago de Alfama", desc: "19 rooms in a 15th-century palace." },
        { name: "The Lumiares", desc: "Apartment-style, in the heart of Bairro Alto." }
      ],
      splurge: [
        { name: "Memmo Alfama", desc: "The terrace pool at sunset is unbeatable." },
        { name: "Bairro Alto Hotel", desc: "Rooftop with Tagus views." }
      ]
    },
    activities: [
      { num: "01", text: "Sintra day trip with a private driver" },
      { num: "02", text: "Pastel de nata workshop in Belém" },
      { num: "03", text: "Fado night in a small Alfama tasca" },
      { num: "04", text: "Sunset sailing on the Tagus" },
      { num: "05", text: "Tile-painting workshop" }
    ],
    eat: [
      { name: "Pastel de nata", desc: "Manteigaria over Pastéis de Belém. Fight me." },
      { name: "Bacalhau à brás", desc: "Salt cod, eggs, potato — the comfort food." },
      { name: "Bifana", desc: "Marinated pork sandwich, eaten standing up." },
      { name: "Amêijoas à bulhão pato", desc: "Clams in garlic, white wine, coriander." },
      { name: "Vinho verde", desc: "Young, slightly fizzy, drink-it-cold-with-everything wine." }
    ],
    restaurants: {
      budget: [
        { name: "Time Out Market Lisbon", desc: "Dozens of premium food stalls under one historic iron roof." },
        { name: "Taberna do Sal Grosso", desc: "Stunning small-plate traditional taverna. Hard to get in." }
      ],
      mid: [
        { name: "Bairro do Avillez", desc: "A creative culinary playground by Jose Avillez." },
        { name: "Prado", desc: "Farm-to-table farm fresh ingredients and brilliant natural wines." }
      ],
      splurge: [
        { name: "Alma", desc: "Two Michelin stars of masterfully elevated Portuguese classics." },
        { name: "Belcanto", desc: "A cinematic fine dining experience in a beautiful historic convent vault." }
      ]
    },
    dayTrips: [
      { num: "1", name: "Sintra (Pena Palace, Quinta da Regaleira)", solidBg: "bg-[#E9C46A]", emoji: "🚌" },
      { num: "2", name: "Cascais & the Boca do Inferno cliffs", solidBg: "bg-[#46B6E6]", emoji: "🚌" },
      { num: "3", name: "Évora & the bone chapel", solidBg: "bg-[#8FC1A3]", emoji: "🚌" },
      { num: "4", name: "Arrábida natural park", solidBg: "bg-[#E76F51]", emoji: "🚌" }
    ]
  },
  "kyoto": {
    country: "Japan",
    flag: "🇯🇵",
    pocketTitle: "KYOTO MINI GUIDE • POCKET VERSION",
    itineraryTitle: "10 DAYS IN JAPAN • FULL ITINERARY",
    blogCountText: "3 POSTS FROM JAPAN",
    excerpt: "Ancient temples, bamboo paths, and geisha districts layered in silent history and refined cypress rituals.",
    sights: [
      { num: "01", text: "Fushimi Inari shrine path gates" },
      { num: "02", text: "Kinkaku-ji Golden Pavilion views" },
      { num: "03", text: "Gion historic alley evening wanders" },
      { num: "04", text: "Kiyomizu-dera wooden balcony temple" },
      { num: "05", text: "Arashiyama bamboo forest path" },
      { num: "06", text: "Nishiki Market street food crawl" },
      { num: "07", text: "Silent stroll on Philosopher's Path" },
      { num: "08", text: "Ryoan-ji Zen rock garden contemplation" }
    ],
    stay: {
      budget: [
        { name: "Piece Hostel Sanjo", desc: "High design hostel with premium concrete vibes." },
        { name: "Len Kyoto Kawaramachi", desc: "Social cafe & bar lobby near the Kamogawa river." }
      ],
      mid: [
        { name: "Sowaka Kyoto Ryokan", desc: "Perfect wooden architecture blend of history." },
        { name: "Noku Kyoto", desc: "Boutique luxury directly adjacent to the Imperial Palace." }
      ],
      splurge: [
        { name: "Hoshinoya Kyoto", desc: "Accessible only by a quiet wooden boat upriver." },
        { name: "The Ritz-Carlton Kyoto", desc: "Ultimate luxury with pristine river views." }
      ]
    },
    activities: [
      { num: "01", text: "Private tea ceremony with a master" },
      { num: "02", text: "Early morning hike up Fushimi Inari" },
      { num: "03", text: "Traditional Tofu lunch in Arashiyama" },
      { num: "04", text: "Gion night walk with a culture expert" },
      { num: "05", text: "Zen meditation garden breathing class" }
    ],
    eat: [
      { name: "Kaiseki Dinner", desc: "Artistic, multi-course traditional dinner showcasing seasonal ingredients." },
      { name: "Yuba (Tofu Skin)", desc: "Delicate and creamy tofu skin layers prepared in warm savory broths." },
      { name: "Matcha Latte & Sweets", desc: "Whisked stone-ground green tea served with sweet red bean pastries." },
      { name: "Kyoto-style Ramen", desc: "Rich chicken broth ramen with local bamboo shoots and tender pork." },
      { name: "Sake Tasting in Fushimi", desc: "Crisp, sweet, and dry sake flight from local historic canal breweries." }
    ],
    restaurants: {
      budget: [
        { name: "Gyoza Hohei", desc: "Tucked-away counter in Gion known for spectacular ginger gyoza." },
        { name: "Kura Sushi Kawaramachi", desc: "Fast-paced revolving conveyor belt plates with classic favorites." }
      ],
      mid: [
        { name: "Monk Restaurant", desc: "7-course wood-fired tasting menu set next to the Philosopher's Path." },
        { name: "Pontocho Kabuki", desc: "Seasonal riverbank dining overlooks the scenic water channel." }
      ],
      splurge: [
        { name: "Gion Sasaki", desc: "Three Michelin stars of ultra-premium, interactive counter culinary art." },
        { name: "Kikunoi Honten", desc: "Centuries-old absolute masterclass in traditional Kaiseki layout." }
      ]
    },
    dayTrips: [
      { num: "01", name: "Nara Deer Park & giant Todai-ji temple", solidBg: "bg-[#E9C46A]", emoji: "🦌" },
      { num: "02", name: "Osaka Castle & Dotonbori neon food street", solidBg: "bg-[#46B6E6]", emoji: "🏯" },
      { num: "03", name: "Uji matcha tea farms & quiet canals", solidBg: "bg-[#8FC1A3]", emoji: "🍵" },
      { num: "04", name: "Himeji Castle white wood architecture", solidBg: "bg-[#E76F51]", emoji: "🏰" }
    ]
  },
  "marrakech": {
    country: "Morocco",
    flag: "🇲🇦",
    pocketTitle: "MARRAKECH MINI GUIDE • POCKET VERSION",
    itineraryTitle: "5 DAYS IN MARRAKECH • FULL ITINERARY",
    blogCountText: "2 POSTS FROM MOROCCO",
    excerpt: "Spiced souks, hidden riad pools, and sunset mint tea under palatial historic arches.",
    sights: [
      { num: "01", text: "Jemaa el-Fnaa night street stalls" },
      { num: "02", text: "Bahia Palace intricate carved rooms" },
      { num: "03", text: "Jardin Majorelle cobalt blue path" },
      { num: "04", text: "Souk market alleys exploration" },
      { num: "05", text: "Ben Youssef Madrasa central pool" },
      { num: "06", text: "Saadian Tombs marble carvings" },
      { num: "07", text: "Le Jardin Secret peaceful oasis" },
      { num: "08", text: "El Badi Palace towering stork nests" }
    ],
    stay: {
      budget: [
        { name: "Riad Dia Hostels", desc: "Vibrant, highly social backpacker sanctuary near central souks." },
        { name: "Riad Layla Rouge", desc: "Intimate and colorful multi-layered riad with high-view rooftop." }
      ],
      mid: [
        { name: "Riad Yasmine", desc: "Pristine green courtyard pool, famous on Instagram." },
        { name: "Riad Jardin Secret", desc: "Art-filled silent courtyard, highly peaceful." }
      ],
      splurge: [
        { name: "La Mamounia Palace", desc: "Palatial gardens, rich history, and world-class spa." },
        { name: "Royal Mansour Marrakech", desc: "Private multi-story riads for ultimate royal privacy." }
      ]
    },
    activities: [
      { num: "01", text: "Sahara desert sunset camel safari ride" },
      { num: "02", text: "Traditional lamb tagine cooking class" },
      { num: "03", text: "Guided historical medina alley walk" },
      { num: "04", text: "Hot air balloon flight over Atlas hills" },
      { num: "05", text: "Royal Hammam mud scrub & massage bath" }
    ],
    eat: [
      { name: "Lamb Tagine", desc: "Slow-braised lamb shanks with dried prunes, almonds, and warm spices." },
      { name: "Couscous Royale", desc: "Fragrant steamed semolina grains topped with root vegetables and grilled meats." },
      { name: "Fresh Mint Tea", desc: "Bubbling green tea poured with fresh spearmint leaves from high heights." },
      { name: "Pastilla Pie", desc: "Layers of crisp brick pastry stuffed with spiced pigeon, almonds, and sugar dust." },
      { name: "Harira Soup", desc: "Thick tomato, lentil, and chickpea broth flavored with lemon and cilantro." }
    ],
    restaurants: {
      budget: [
        { name: "Stall 117 Barbecue", desc: "Sensational grilled skewers in the heart of Jemaa el-Fnaa night action." },
        { name: "Chez Chegrouni", desc: "Great rooftop view over the main square with budget beef tagines." }
      ],
      mid: [
        { name: "Nomad Marrakech", desc: "Chic modern twists on classic Moroccan cooking with sunset view rooftops." },
        { name: "Le Jardin", desc: "Lush garden dining oasis inside a beautifully restored 16th-century medina riad." }
      ],
      splurge: [
        { name: "La Grande Table Marocaine", desc: "Highly refined fine dining inside the royal walls of Royal Mansour." },
        { name: "Dar Moha Garden", desc: "Sensational palatial setting around a gorgeous pool with modern live lute tunes." }
      ]
    },
    dayTrips: [
      { num: "01", name: "Atlas Mountains & Berber waterfall hike", solidBg: "bg-[#E9C46A]", emoji: "⛰️" },
      { num: "02", name: "Essaouira coastal blue streets & harbor", solidBg: "bg-[#46B6E6]", emoji: "🌊" },
      { num: "03", name: "Ouzoud spectacular cascading waterfalls", solidBg: "bg-[#8FC1A3]", emoji: "💦" },
      { num: "04", name: "Agafay stone desert quad bike safari", solidBg: "bg-[#E76F51]", emoji: "🏍️" }
    ]
  }
};

async function run() {
  try {
    const { data: dbGuides, error: fetchError } = await supabase
      .from('mini_guides')
      .select('id, slug');

    if (fetchError) {
      throw fetchError;
    }

    console.log('Fetched guides from database:', dbGuides);

    for (const guide of dbGuides) {
      const details = cityGuidesData[guide.slug.toLowerCase()];
      if (details) {
        console.log(`Updating details for guide: ${guide.slug}...`);
        const { error: updateError } = await supabase
          .from('mini_guides')
          .update({ details })
          .eq('id', guide.id);
        
        if (updateError) {
          console.error(`Failed to update ${guide.slug}:`, updateError);
        } else {
          console.log(`Successfully updated ${guide.slug}!`);
        }
      }
    }
  } catch (err) {
    console.error('Error migrating data:', err);
  }
}

run();
