export const dynamic = "force-dynamic";

import { fetchMiniGuides, fetchBlogs, fetchDestinations, fetchTours } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Star, Sparkle, Utensils } from "lucide-react";

// Robust dynamic guide dataset mapping for cities mentioned in database
const cityGuidesData = {
  "lisbon": {
    country: "Portugal",
    flag: "🇵🇹",
    pocketTitle: "LISBON MINI GUIDE • POCKET VERSION",
    itineraryTitle: "7 DAYS IN PORTUGAL • FULL ITINERARY",
    blogCountText: "4 POSTS FROM PORTUGAL",
    excerpt: "A coastal city of inclines, golden hours, and small counters where the woman behind the bar starts your order before you sit down.",
    sights: [
      { num: "01", text: "Alfama at sunrise", color: "text-[#DCAE1D]" },
      { num: "02", text: "Miradouro da Senhora do Monte", color: "text-[#46B6E6]" },
      { num: "03", text: "Jerónimos Monastery", color: "text-[#8FC1A3]" },
      { num: "04", text: "Belém Tower", color: "text-[#E76F51]" },
      { num: "05", text: "Time Out Market", color: "text-[#DCAE1D]" },
      { num: "06", text: "LX Factory", color: "text-[#46B6E6]" },
      { num: "07", text: "Tram 28 (early morning only)", color: "text-[#8FC1A3]" },
      { num: "08", text: "Castelo de São Jorge", color: "text-[#E76F51]" }
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
      { num: "01", text: "Fushimi Inari shrine path gates", color: "text-[#DCAE1D]" },
      { num: "02", text: "Kinkaku-ji Golden Pavilion views", color: "text-[#46B6E6]" },
      { num: "03", text: "Gion historic alley evening wanders", color: "text-[#8FC1A3]" },
      { num: "04", text: "Kiyomizu-dera wooden balcony temple", color: "text-[#E76F51]" },
      { num: "05", text: "Arashiyama bamboo forest path", color: "text-[#DCAE1D]" },
      { num: "06", text: "Nishiki Market street food crawl", color: "text-[#46B6E6]" },
      { num: "07", text: "Silent stroll on Philosopher's Path", color: "text-[#8FC1A3]" },
      { num: "08", text: "Ryoan-ji Zen rock garden contemplation", color: "text-[#E76F51]" }
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
      { num: "01", text: "Private tea ceremony with a master", bg: "bg-[#E9C46A]", textCol: "text-charcoal-900" },
      { num: "02", text: "Early morning hike up Fushimi Inari", bg: "bg-[#46B6E6]", textCol: "text-white" },
      { num: "03", text: "Traditional Tofu lunch in Arashiyama", bg: "bg-[#8FC1A3]", textCol: "text-white" },
      { num: "04", text: "Gion night walk with a culture expert", bg: "bg-[#E76F51]", textCol: "text-white" },
      { num: "05", text: "Zen meditation garden breathing class", bg: "bg-[#E9C46A]", textCol: "text-charcoal-900" }
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
      { num: "01", name: "Nara Deer Park & giant Todai-ji temple", bg: "bg-[#E9C46A]/20 border-[#E9C46A]/40", badgeCol: "bg-[#E9C46A] text-charcoal-900" },
      { num: "02", name: "Osaka Castle & Dotonbori neon food street", bg: "bg-[#46B6E6]/20 border-[#46B6E6]/40", badgeCol: "bg-[#46B6E6] text-white" },
      { num: "03", name: "Uji matcha tea farms & quiet canals", bg: "bg-[#8FC1A3]/20 border-[#8FC1A3]/40", badgeCol: "bg-[#8FC1A3] text-white" },
      { num: "04", name: "Himeji Castle white wood architecture", bg: "bg-[#E76F51]/20 border-[#E76F51]/40", badgeCol: "bg-[#E76F51] text-white" }
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
      { num: "01", text: "Jemaa el-Fnaa night street stalls", color: "text-[#DCAE1D]" },
      { num: "02", text: "Bahia Palace intricate carved rooms", color: "text-[#46B6E6]" },
      { num: "03", text: "Jardin Majorelle cobalt blue path", color: "text-[#8FC1A3]" },
      { num: "04", text: "Souk market alleys exploration", color: "text-[#E76F51]" },
      { num: "05", text: "Ben Youssef Madrasa central pool", color: "text-[#DCAE1D]" },
      { num: "06", text: "Saadian Tombs marble carvings", color: "text-[#46B6E6]" },
      { num: "07", text: "Le Jardin Secret peaceful oasis", color: "text-[#8FC1A3]" },
      { num: "08", text: "El Badi Palace towering stork nests", color: "text-[#E76F51]" }
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
      { num: "01", text: "Sahara desert sunset camel safari ride", bg: "bg-[#E9C46A]", textCol: "text-charcoal-900" },
      { num: "02", text: "Traditional lamb tagine cooking class", bg: "bg-[#46B6E6]", textCol: "text-white" },
      { num: "03", text: "Guided historical medina alley walk", bg: "bg-[#8FC1A3]", textCol: "text-white" },
      { num: "04", text: "Hot air balloon flight over Atlas hills", bg: "bg-[#E76F51]", textCol: "text-white" },
      { num: "05", text: "Royal Hammam mud scrub & massage bath", bg: "bg-[#E9C46A]", textCol: "text-charcoal-900" }
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
      { num: "01", name: "Atlas Mountains & Berber waterfall hike", bg: "bg-[#E9C46A]/20 border-[#E9C46A]/40", badgeCol: "bg-[#E9C46A] text-charcoal-900" },
      { num: "02", name: "Essaouira coastal blue streets & harbor", bg: "bg-[#46B6E6]/20 border-[#46B6E6]/40", badgeCol: "bg-[#46B6E6] text-white" },
      { num: "03", name: "Ouzoud spectacular cascading waterfalls", bg: "bg-[#8FC1A3]/20 border-[#8FC1A3]/40", badgeCol: "bg-[#8FC1A3] text-white" },
      { num: "04", name: "Agafay stone desert quad bike safari", bg: "bg-[#E76F51]/20 border-[#E76F51]/40", badgeCol: "bg-[#E76F51] text-white" }
    ]
  }
};

export default async function MiniGuideDetails({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  let guides = [];
  let destinations = [];
  let tours = [];
  let blogs = [];
  
  try {
    const [guidesData, destData, toursData, blogsData] = await Promise.all([
      fetchMiniGuides(),
      fetchDestinations(),
      fetchTours(),
      fetchBlogs()
    ]);
    guides = guidesData;
    destinations = destData;
    tours = toursData;
    blogs = blogsData;
  } catch (err) {
    console.error("Failed to load mini guide detail data dynamically", err);
  }

  const guide = guides.find(g => g.slug === slug);
  if (!guide) {
    return (
      <div className="pt-32 pb-24 bg-[#FBF7EE] min-h-screen flex flex-col items-center justify-center text-charcoal-900">
        <h1 className="text-3xl font-serif mb-4">Guide Not Found</h1>
        <p className="text-sm text-charcoal-500 mb-8">We couldn't find the mini guide you're looking for.</p>
        <Link href="/mini-guides" className="text-coral-500 text-sm font-bold uppercase tracking-widest hover:text-coral-600 flex items-center gap-2">
          Back to Mini Guides
        </Link>
      </div>
    );
  }

  const citySlug = guide.slug.toLowerCase();
  
  // Resolve rich custom data mapping, or default to dynamically generated details if not in cityGuidesData
  const flags = { JP: "🇯🇵", PT: "🇵🇹", CL: "🇨🇱", MX: "🇲🇽", MA: "🇲🇦", IS: "🇮🇸", VN: "🇻🇳", IT: "🇮🇹", BE: "🇧🇪", US: "🇺🇸", FR: "🇫🇷", ES: "🇪🇸" };
  const currentFlag = flags[guide.countryCode] || "📍";

  // Let's build details dynamically with robust fallbacks
  const customDetails = cityGuidesData[citySlug];
  
  // Find destination matching this guide
  const destination = destinations.find(
    (d) => d.code === guide.countryCode || d.country.toLowerCase() === guide.destination.toLowerCase()
  );

  const details = {
    country: guide.destination,
    flag: currentFlag,
    pocketTitle: guide.details?.pocketTitle || customDetails?.pocketTitle || `${guide.destination.toUpperCase()} MINI GUIDE • POCKET VERSION`,
    itineraryTitle: guide.details?.itineraryTitle || customDetails?.itineraryTitle || `RECOMMENDED ITINERARY`,
    blogCountText: guide.details?.blogCountText || customDetails?.blogCountText || `${blogs.filter(b => b.destination.toLowerCase() === guide.destination.toLowerCase()).length} POSTS FROM ${guide.destination.toUpperCase()}`,
    bestTimeToVisit: guide.details?.bestTimeToVisit || customDetails?.bestTimeToVisit || "March to May & Oct to Nov",
    idealDuration: guide.details?.idealDuration || customDetails?.idealDuration || "4-5 Days",
    budgetLevel: guide.details?.budgetLevel || customDetails?.budgetLevel || "Mid-range",
    excerpt: guide.excerpt || guide.details?.excerpt || customDetails?.excerpt || destination?.excerpt || "A carefully curated pocket guide.",
    sights: (guide.details?.sights || customDetails?.sights || destination?.moments?.map((m, idx) => ({
      num: String(idx + 1).padStart(2, "0"),
      text: m
    })) || [
      { num: "01", text: "Main historic center alleys walk" },
      { num: "02", text: "Top viewpoint sunset watch" },
      { num: "03", text: "Local morning market tour" }
    ]).map((s, idx) => ({
      ...s,
      color: s.color || ["text-[#DCAE1D]", "text-[#46B6E6]", "text-[#8FC1A3]", "text-[#E76F51]"][idx % 4]
    })),
    stay: guide.details?.stay || customDetails?.stay || {
      budget: [
        { name: "Top-rated boutique hostel", desc: "Clean, highly social, and in a central neighborhood." }
      ],
      mid: [
        { name: "Comfort boutique hotel", desc: "Local style with great amenities and breakfast." }
      ],
      splurge: [
        { name: "Luxury historic hotel", desc: "Pristine service and beautiful views." }
      ]
    },
    activities: (guide.details?.activities || customDetails?.activities || tours
      .filter(t => t.countryCode === guide.countryCode || t.destination.toLowerCase() === guide.destination.toLowerCase())
      .map((t, idx) => ({
        num: String(idx + 1).padStart(2, "0"),
        text: t.title
      })) || [
        { num: "01", text: "Guided walking food tasting crawl" },
        { num: "02", text: "Sunset coastal/scenic boat ride" }
      ]).map((a, idx) => ({
        ...a,
        num: a.num || String(idx + 1).padStart(2, "0")
      })),
    eat: guide.details?.eat || customDetails?.eat || [
      { name: "Local signature dish", desc: "A must-try classic found across the destination." },
      { name: "Traditional dessert", desc: "Perfect sweet bite from local bakeries." }
    ],
    restaurants: guide.details?.restaurants || customDetails?.restaurants || {
      budget: [
        { name: "Popular street vendor / small tavern", desc: "Stunning flavors, very friendly, very low price." }
      ],
      mid: [
        { name: "Scenic local bistro", desc: "Beautiful food prepared with regional ingredients." }
      ],
      splurge: [
        { name: "Michelin-recommended fine dining", desc: "Elevated classic flavors in a lovely historic venue." }
      ]
    },
    dayTrips: (guide.details?.dayTrips || customDetails?.dayTrips || destinations
      .filter(d => d.region === destination?.region && d.id !== destination?.id)
      .slice(0, 4)
      .map((d, idx) => ({
        num: String(idx + 1).padStart(2, "0"),
        name: `${d.country} (${d.excerpt?.split(",")[0] || d.country})`
      })) || [
        { num: "01", name: "Nearby historic countryside town" }
      ]).map((dt, idx) => ({
        ...dt,
        bg: dt.bg || ["bg-[#E9C46A]/20 border-[#E9C46A]/40", "bg-[#46B6E6]/20 border-[#46B6E6]/40", "bg-[#8FC1A3]/20 border-[#8FC1A3]/40", "bg-[#E76F51]/20 border-[#E76F51]/40"][idx % 4],
        badgeCol: dt.badgeCol || ["bg-[#E9C46A] text-charcoal-900", "bg-[#46B6E6] text-white", "bg-[#8FC1A3] text-white", "bg-[#E76F51] text-white"][idx % 4],
        solidBg: dt.solidBg || ["bg-[#E9C46A]", "bg-[#46B6E6]", "bg-[#8FC1A3]", "bg-[#E76F51]"][idx % 4],
        emoji: dt.emoji || "🚌"
      })),
    days: guide.details?.days || customDetails?.days || [],
    introText: guide.details?.introText || customDetails?.introText || `A custom day-by-day itinerary.`,
    introHtml: guide.details?.introHtml || customDetails?.introHtml || "",
    routeTitle: guide.details?.routeTitle || customDetails?.routeTitle || "ROUTE FLOW",
    routeFlow: guide.details?.routeFlow || customDetails?.routeFlow || ""
  };

  // Combine all blogs and itineraries, filtering out duplicate slugs
  const uniqueBlogs = [];
  const seenSlugs = new Set();
  for (const post of blogs) {
    if (!seenSlugs.has(post.slug)) {
      seenSlugs.add(post.slug);
      uniqueBlogs.push(post);
    }
  }

  // Related dispatches from the same country
  const destinationBlogs = uniqueBlogs.filter(
    (b) => b.destination.toLowerCase() === guide.destination.toLowerCase()
  );
  // Other dispatches to ensure rich scrollable options
  const otherBlogs = uniqueBlogs.filter(
    (b) => b.destination.toLowerCase() !== guide.destination.toLowerCase()
  );
  const allBlogsPreview = [...destinationBlogs, ...otherBlogs];
  
  return (
    <div className="bg-[#FBF7EE] min-h-screen pt-32 pb-24 text-charcoal-900">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] font-bold text-charcoal-700 uppercase">
            <Link href="/mini-guides" className="hover:text-[#DCAE1D] transition-colors">MINI GUIDES</Link>
            <span className="text-charcoal-300">/</span>
            <Link href={`/destinations/${destination?.slug || guide.slug.split("-")[0]}`} className="hover:text-[#DCAE1D] transition-colors">{details.country.toUpperCase()}</Link>
            <span className="text-charcoal-300">/</span>
            <span className="text-charcoal-900">{guide.title.split(" ")[0].toUpperCase()}</span>
          </div>
        </div>

        {/* Title Block Header */}
        <div className="max-w-4xl mb-12">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#DCAE1D] uppercase block mb-3">
            📍 PREMIUM POCKET GUIDE
          </span>
          <h1 className="text-[52px] md:text-[68px] font-serif font-bold text-charcoal-900 leading-[1.05] mb-6 tracking-tight">
            {guide.title}
          </h1>
          <p className="text-charcoal-700 text-base md:text-lg leading-relaxed mb-8 max-w-2xl font-light">
            {details.excerpt}
          </p>

          {/* Styled Pill Badges */}
          <div className="flex flex-wrap gap-2.5">
            <span className="bg-[#E9C46A] text-charcoal-900 text-[9px] font-bold tracking-widest uppercase px-4 py-2 rounded-full shadow-sm">
              Best Time to Visit: {details.bestTimeToVisit}
            </span>
            <span className="bg-[#46B6E6] text-white text-[9px] font-bold tracking-widest uppercase px-4 py-2 rounded-full shadow-sm">
              Ideal Duration: {details.idealDuration}
            </span>
            <span className="bg-[#8FC1A3] text-white text-[9px] font-bold tracking-widest uppercase px-4 py-2 rounded-full shadow-sm">
              Budget Level: {details.budgetLevel}
            </span>
          </div>
        </div>

        {/* Layout: Main content (70%) + Sticky Sidebar (30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-16">
          {/* Left Column */}
          <div className="lg:col-span-7 w-full">
            {/* Main Visual Image */}
            <div className="relative h-[360px] md:h-[480px] rounded-[24px] overflow-hidden shadow-md mb-16">
              <img 
                src={guide.heroImage} 
                alt={guide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[9px] font-bold tracking-widest uppercase text-charcoal-900 shadow-sm border border-charcoal-900/5">
                {currentFlag} {guide.destination.toUpperCase()}
              </div>
            </div>
            {guide.type !== "itinerary" ? (
              <>
                {/* Section Index Anchor Jumps */}
                <div className="bg-[#E9C46A] border-2 border-charcoal-900 rounded-[32px] mb-16 max-w-4xl relative">
          <div className="bg-white border-2 border-charcoal-900 rounded-[32px] p-8 md:p-10 transform -translate-x-2 -translate-y-2 transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1">
            <span className="text-[10px] md:text-[11px] font-bold tracking-[0.25em] text-[#DCAE1D] uppercase block mb-3">
              IN THIS GUIDE
            </span>
            <h2 className="font-serif text-[32px] md:text-[38px] font-bold text-charcoal-900 mb-8 leading-none">
              Jump to a section
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <a href="#top-sights" className="flex items-center gap-4 pb-4 border-b border-dashed border-charcoal-900/10 hover:text-[#DCAE1D] transition-colors group">
                <span className="font-serif text-[18px] font-bold text-[#E9C46A] w-6">01</span>
                <span className="text-[20px] leading-none">📍</span>
                <span className="font-serif text-[17px] font-bold text-charcoal-900 group-hover:text-[#DCAE1D] transition-colors">Top sights</span>
              </a>
              <a href="#where-to-stay" className="flex items-center gap-4 pb-4 border-b border-dashed border-charcoal-900/10 hover:text-[#DCAE1D] transition-colors group">
                <span className="font-serif text-[18px] font-bold text-[#E9C46A] w-6">02</span>
                <span className="text-[20px] leading-none">🛌</span>
                <span className="font-serif text-[17px] font-bold text-charcoal-900 group-hover:text-[#DCAE1D] transition-colors">Where to stay</span>
              </a>
              <a href="#activities" className="flex items-center gap-4 pb-4 border-b border-dashed border-charcoal-900/10 hover:text-[#DCAE1D] transition-colors group">
                <span className="font-serif text-[18px] font-bold text-[#E9C46A] w-6">03</span>
                <span className="text-[20px] leading-none">🎟️</span>
                <span className="font-serif text-[17px] font-bold text-charcoal-900 group-hover:text-[#DCAE1D] transition-colors">Best activities & tours</span>
              </a>
              <a href="#eat-drink" className="flex items-center gap-4 pb-4 border-b border-dashed border-charcoal-900/10 hover:text-[#DCAE1D] transition-colors group">
                <span className="font-serif text-[18px] font-bold text-[#E9C46A] w-6">04</span>
                <span className="text-[20px] leading-none">🍜</span>
                <span className="font-serif text-[17px] font-bold text-charcoal-900 group-hover:text-[#DCAE1D] transition-colors">What to eat & drink</span>
              </a>
              <a href="#restaurants" className="flex items-center gap-4 pb-4 border-b border-dashed border-charcoal-900/10 hover:text-[#DCAE1D] transition-colors group">
                <span className="font-serif text-[18px] font-bold text-[#E9C46A] w-6">05</span>
                <span className="text-[20px] leading-none">🍽️</span>
                <span className="font-serif text-[17px] font-bold text-charcoal-900 group-hover:text-[#DCAE1D] transition-colors">Best restaurants</span>
              </a>
              <a href="#day-trips" className="flex items-center gap-4 pb-4 border-b border-dashed border-charcoal-900/10 hover:text-[#DCAE1D] transition-colors group">
                <span className="font-serif text-[18px] font-bold text-[#E9C46A] w-6">06</span>
                <span className="text-[20px] leading-none">🚆</span>
                <span className="font-serif text-[17px] font-bold text-charcoal-900 group-hover:text-[#DCAE1D] transition-colors">Best day trips</span>
              </a>
            </div>
          </div>
        </div>

        {/* 1. Top Sights in City */}
        <div id="top-sights" className="mb-20 scroll-mt-24">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#DCAE1D] uppercase block mb-2 font-sans">
            MUST-SEE
          </span>
          <h2 className="font-serif text-[38px] md:text-[46px] font-bold text-charcoal-900 mb-4 tracking-tight leading-tight">
            Top sights in {guide.title.split(" ")[0]}
          </h2>
          <p className="text-charcoal-500/80 text-sm md:text-base leading-relaxed mb-10 max-w-xl font-normal font-sans">
            The non-negotiables. Build your itinerary around these.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-8">
            {details.sights.map((sight, idx) => {
              const pillColors = ["bg-[#E9C46A]", "bg-[#46B6E6]", "bg-[#8FC1A3]", "bg-[#E76F51]"];
              const colorClass = pillColors[idx % pillColors.length];
              return (
                <div 
                  key={sight.num}
                  className="bg-white rounded-2xl border border-charcoal-900/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all duration-300 flex items-stretch overflow-hidden group cursor-default"
                >
                  <div className={`w-14 md:w-16 flex-shrink-0 flex items-center justify-center font-serif font-bold text-lg md:text-xl text-charcoal-900 border-r-2 border-charcoal-900 ${colorClass}`}>
                    {sight.num}
                  </div>
                  <div className="px-6 py-4 flex-1 flex items-center justify-start">
                    <span className="font-serif text-[15px] md:text-[17px] font-bold text-charcoal-900 group-hover:text-[#DCAE1D] transition-colors leading-snug">
                      {sight.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dotted border Photo Badge for Top Sights */}
          <div className="flex justify-center mt-12 mb-16">
            <div className="bg-white border-2 border-dashed border-charcoal-300 p-4 rounded-[20px] text-center w-[120px] shadow-sm flex flex-col justify-center items-center">
              <span className="font-serif text-[18px] font-bold text-charcoal-400 leading-none">photo</span>
              <span className="text-[7px] font-bold tracking-widest text-charcoal-400 uppercase mt-1 leading-none">TOP SIGHTS</span>
            </div>
          </div>

          <div className="border-b border-charcoal-900/10 mb-12" />
        </div>


            {/* 2. Where to Stay in City */}
            <div id="where-to-stay" className="mb-20 scroll-mt-24">
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#DCAE1D] uppercase block mb-2 font-sans">
                ACCOMMODATION
              </span>
              <h2 className="font-serif text-[38px] md:text-[46px] font-bold text-charcoal-900 mb-4 tracking-tight leading-tight">
                Where to stay
              </h2>
              <p className="text-charcoal-500/80 text-sm md:text-base leading-relaxed mb-10 max-w-xl font-normal font-sans">
                The neighborhoods and specific stays that put you in the heart of the action.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Budget Column */}
                <div className="bg-white border-2 border-charcoal-900 rounded-[28px] shadow-[4px_4px_0px_0px_#2B2A27] flex flex-col overflow-hidden">
                  <div className="bg-[#E9C46A] border-b-2 border-charcoal-900 p-5 text-center">
                    <span className="text-[10px] font-bold tracking-[0.25em] text-charcoal-900 uppercase">BUDGET</span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-start space-y-6">
                    {details.stay.budget.map((hotel, idx) => (
                      <div key={idx} className="flex flex-col">
                        {idx > 0 && <div className="border-t border-cream-200/60 my-4" />}
                        <span className="text-[15px] font-bold text-charcoal-900 uppercase tracking-wide leading-tight">{hotel.name}</span>
                        <span className="text-xs text-charcoal-500/80 mt-1 font-light leading-relaxed">{hotel.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mid-range Column */}
                <div className="bg-white border-2 border-charcoal-900 rounded-[28px] shadow-[4px_4px_0px_0px_#2B2A27] flex flex-col overflow-hidden">
                  <div className="bg-[#46B6E6] border-b-2 border-charcoal-900 p-5 text-center">
                    <span className="text-[10px] font-bold tracking-[0.25em] text-white uppercase">MID-RANGE</span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-start space-y-6">
                    {details.stay.mid.map((hotel, idx) => (
                      <div key={idx} className="flex flex-col">
                        {idx > 0 && <div className="border-t border-cream-200/60 my-4" />}
                        <span className="text-[15px] font-bold text-charcoal-900 uppercase tracking-wide leading-tight">{hotel.name}</span>
                        <span className="text-xs text-charcoal-500/80 mt-1 font-light leading-relaxed">{hotel.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Splurge Column */}
                <div className="bg-white border-2 border-charcoal-900 rounded-[28px] shadow-[4px_4px_0px_0px_#2B2A27] flex flex-col overflow-hidden">
                  <div className="bg-[#E76F51] border-b-2 border-charcoal-900 p-5 text-center">
                    <span className="text-[10px] font-bold tracking-[0.25em] text-white uppercase">SPLURGE</span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-start space-y-6">
                    {details.stay.splurge.map((hotel, idx) => (
                      <div key={idx} className="flex flex-col">
                        {idx > 0 && <div className="border-t border-cream-200/60 my-4" />}
                        <span className="text-[15px] font-bold text-charcoal-900 uppercase tracking-wide leading-tight">{hotel.name}</span>
                        <span className="text-xs text-charcoal-500/80 mt-1 font-light leading-relaxed">{hotel.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dotted border Photo Badge */}
              <div className="flex justify-center mt-12 mb-16">
                <div className="bg-white border-2 border-dashed border-charcoal-300 p-4 rounded-[20px] text-center w-[120px] shadow-sm flex flex-col justify-center items-center">
                  <span className="font-serif text-[18px] font-bold text-charcoal-400 leading-none">photo</span>
                  <span className="text-[7px] font-bold tracking-widest text-charcoal-400 uppercase mt-1 leading-none">WHERE TO STAY</span>
                </div>
              </div>

              <div className="border-b border-charcoal-900/10 mb-12" />
            </div>

            {/* 3. Best Activities & Tours in City */}
            <div id="activities" className="mb-20 scroll-mt-24">
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#DCAE1D] uppercase block mb-2 font-sans">
                THINGS TO DO
              </span>
              <h2 className="font-serif text-[38px] md:text-[46px] font-bold text-charcoal-900 mb-4 tracking-tight leading-tight">
                Best activities & tours
              </h2>
              <p className="text-charcoal-500/80 text-sm md:text-base leading-relaxed mb-10 max-w-xl font-normal font-sans">
                Beyond the sights — the experiences worth booking ahead of time.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {details.activities.map((act, idx) => {
                  const pillColors = ["bg-[#E9C46A]", "bg-[#46B6E6]", "bg-[#8FC1A3]", "bg-[#E76F51]"];
                  const colorClass = pillColors[idx % pillColors.length];
                  const displayNum = act.num.startsWith("#") ? act.num : `#${parseInt(act.num, 10)}`;
                  return (
                    <div 
                      key={act.num}
                      className={`${colorClass} p-8 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between min-h-[160px] relative overflow-hidden group cursor-default`}
                    >
                      <div className="absolute top-6 right-6">
                        <Sparkle size={28} className="text-charcoal-900/15 fill-charcoal-900/15 transition-transform duration-500 group-hover:rotate-45" />
                      </div>
                      <div>
                        <span className="font-serif font-bold text-xl md:text-2xl text-charcoal-900/40 block mb-3">
                          {displayNum}
                        </span>
                        <h3 className="font-serif font-bold text-lg md:text-[20px] text-charcoal-900 leading-snug max-w-[90%]">
                          {act.text}
                        </h3>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dotted border Photo Badge for Activities */}
              <div className="flex justify-center mt-12 mb-16">
                <div className="bg-white border-2 border-dashed border-charcoal-300 p-4 rounded-[20px] text-center w-[120px] shadow-sm flex flex-col justify-center items-center">
                  <span className="font-serif text-[18px] font-bold text-charcoal-400 leading-none">photo</span>
                  <span className="text-[7px] font-bold tracking-[0.2em] text-charcoal-400 uppercase mt-1 leading-none">THINGS TO DO</span>
                </div>
              </div>

              <div className="border-b border-charcoal-900/10 mb-12" />
            </div>

            {/* 4. What to Eat & Drink in City */}
            <div id="eat-drink" className="mb-20 scroll-mt-24">
              <span className="text-[10px] font-bold tracking-widest text-[#DCAE1D] uppercase block mb-3">
                FOOD
              </span>
              <h2 className="font-serif text-[36px] md:text-[42px] font-bold text-charcoal-900 mb-4 tracking-tight">
                What to eat &amp; drink
              </h2>
              <p className="text-charcoal-700 text-sm md:text-base leading-relaxed mb-10 max-w-2xl font-light">
                The flavours that define this place — order these without overthinking.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {details.eat.map((dish, idx) => {
                  const iconBgs = [
                    "bg-[#E9C46A] text-white",
                    "bg-[#46B6E6] text-white",
                    "bg-[#8FC1A3] text-white",
                    "bg-[#E76F51] text-white",
                    "bg-[#E9C46A] text-white"
                  ];
                  return (
                    <div key={idx} className="bg-white rounded-[20px] border border-charcoal-900/8 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className={`w-12 h-12 rounded-full ${iconBgs[idx % iconBgs.length]} flex items-center justify-center flex-shrink-0`}>
                        <Utensils className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <h4 className="font-serif text-[17px] font-bold text-charcoal-900 mb-1 leading-tight">
                          {dish.name}
                        </h4>
                        <p className="text-[13px] text-charcoal-600 leading-relaxed font-light">
                          {dish.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Photo Badge */}
              <div className="flex justify-center mt-12 mb-16">
                <div className="bg-white border-2 border-dashed border-charcoal-300 p-4 rounded-[20px] text-center w-[120px] shadow-sm flex flex-col justify-center items-center">
                  <span className="font-serif text-[18px] font-bold text-charcoal-400 leading-none">photo</span>
                  <span className="text-[7px] font-bold tracking-[0.2em] text-charcoal-400 uppercase mt-1 leading-none">WHAT TO EAT</span>
                </div>
              </div>

              <div className="border-b border-charcoal-900/10 mb-12" />
            </div>

            {/* 5. Best Restaurants in City */}
            <div id="restaurants" className="mb-20 scroll-mt-24">
              <span className="text-[10px] font-bold tracking-widest text-[#DCAE1D] uppercase block mb-3">
                WHERE TO EAT
              </span>
              <h2 className="font-serif text-[36px] md:text-[42px] font-bold text-charcoal-900 mb-4 tracking-tight">
                Best restaurants
              </h2>
              <p className="text-charcoal-700 text-sm md:text-base leading-relaxed mb-10 max-w-2xl font-light">
                From street side gems to refined dining rooms.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Budget Column */}
                <div className="bg-white border-2 border-charcoal-900 rounded-[28px] shadow-[4px_4px_0px_0px_#2B2A27] flex flex-col overflow-hidden">
                  <div className="bg-[#E9C46A] border-b-2 border-charcoal-900 p-5 text-center">
                    <span className="text-[10px] font-bold tracking-[0.25em] text-charcoal-900 uppercase">LOCAL GEMS</span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-start space-y-6">
                    {details.restaurants.budget.map((rest, idx) => (
                      <div key={idx} className="flex flex-col">
                        {idx > 0 && <div className="border-t border-cream-200/60 my-4" />}
                        <span className="text-[15px] font-bold text-charcoal-900 uppercase tracking-wide leading-tight">{rest.name}</span>
                        <span className="text-xs text-charcoal-500/80 mt-1 font-light leading-relaxed">{rest.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mid-range Column */}
                <div className="bg-white border-2 border-charcoal-900 rounded-[28px] shadow-[4px_4px_0px_0px_#2B2A27] flex flex-col overflow-hidden">
                  <div className="bg-[#46B6E6] border-b-2 border-charcoal-900 p-5 text-center">
                    <span className="text-[10px] font-bold tracking-[0.25em] text-white uppercase">MID-RANGE</span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-start space-y-6">
                    {details.restaurants.mid.map((rest, idx) => (
                      <div key={idx} className="flex flex-col">
                        {idx > 0 && <div className="border-t border-cream-200/60 my-4" />}
                        <span className="text-[15px] font-bold text-charcoal-900 uppercase tracking-wide leading-tight">{rest.name}</span>
                        <span className="text-xs text-charcoal-500/80 mt-1 font-light leading-relaxed">{rest.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Splurge Column */}
                <div className="bg-white border-2 border-charcoal-900 rounded-[28px] shadow-[4px_4px_0px_0px_#2B2A27] flex flex-col overflow-hidden">
                  <div className="bg-[#E76F51] border-b-2 border-charcoal-900 p-5 text-center">
                    <span className="text-[10px] font-bold tracking-[0.25em] text-white uppercase">FINE DINING</span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-start space-y-6">
                    {details.restaurants.splurge.map((rest, idx) => (
                      <div key={idx} className="flex flex-col">
                        {idx > 0 && <div className="border-t border-cream-200/60 my-4" />}
                        <span className="text-[15px] font-bold text-charcoal-900 uppercase tracking-wide leading-tight">{rest.name}</span>
                        <span className="text-xs text-charcoal-500/80 mt-1 font-light leading-relaxed">{rest.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dotted border Photo Badge */}
              <div className="flex justify-center mt-12 mb-16">
                <div className="bg-white border-2 border-dashed border-charcoal-300 p-4 rounded-[20px] text-center w-[120px] shadow-sm flex flex-col justify-center items-center">
                  <span className="font-serif text-[18px] font-bold text-charcoal-400 leading-none">photo</span>
                  <span className="text-[7px] font-bold tracking-widest text-charcoal-400 uppercase mt-1 leading-none">DINING RITUALS</span>
                </div>
              </div>

              <div className="border-b border-charcoal-900/10 mb-12" />
            </div>

            {/* 6. Best Day Trips from City */}
            <div id="day-trips" className="mb-24 scroll-mt-24">
              <span className="text-[10px] font-bold tracking-widest text-[#DCAE1D] uppercase block mb-3">
                FURTHER AFIELD
              </span>
              <h2 className="font-serif text-[36px] md:text-[42px] font-bold text-charcoal-900 mb-4 tracking-tight">
                Best day trips from {guide.title.split(" ")[0]}
              </h2>
              <p className="text-charcoal-700 text-sm md:text-base leading-relaxed mb-10 max-w-2xl font-light">
                Worth the early start — each is reachable as a single-day excursion.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {details.dayTrips.map((trip) => (
                  <div
                    key={trip.num}
                    className="flex rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 bg-white border border-charcoal-900/8"
                  >
                    {/* Solid colored left panel */}
                    <div className={`${trip.solidBg} flex items-center justify-center w-[72px] flex-shrink-0`}>
                      <span className="text-[28px]">{trip.emoji}</span>
                    </div>
                    {/* White content area */}
                    <div className="flex-1 px-5 py-4">
                      <span className="text-[9px] font-bold tracking-widest text-[#DCAE1D] uppercase block mb-1.5">
                        DAY TRIP {trip.num}
                      </span>
                      <span className="font-serif text-[16px] font-bold text-charcoal-900 leading-snug">
                        {trip.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Photo Badge */}
              <div className="flex justify-center mt-12 mb-16">
                <div className="bg-white border-2 border-dashed border-charcoal-300 p-4 rounded-[20px] text-center w-[120px] shadow-sm flex flex-col justify-center items-center">
                  <span className="font-serif text-[18px] font-bold text-charcoal-400 leading-none">photo</span>
                  <span className="text-[7px] font-bold tracking-[0.2em] text-charcoal-400 uppercase mt-1 leading-none">DAY TRIPS</span>
                </div>
              </div>
            </div>
              </>
            ) : (
              <div className="space-y-16">
                {/* Intro Overview Card */}
                <div className="bg-white border-2 border-charcoal-900 rounded-[32px] p-8 md:p-10 shadow-[4px_4px_0px_0px_#2B2A27]">
                  <span className="text-[10px] md:text-[11px] font-bold tracking-[0.25em] text-[#DCAE1D] uppercase block mb-3">
                    THE OVERVIEW
                  </span>
                  <h2 className="font-serif text-[32px] md:text-[38px] font-bold text-charcoal-900 mb-6 leading-tight">
                    {details.itineraryTitle}
                  </h2>
                  <p className="text-charcoal-700 text-sm md:text-base leading-relaxed mb-6 font-light">
                    {details.introText}
                  </p>
                  {details.introHtml && (
                    <div 
                      className="text-charcoal-600 text-xs md:text-sm leading-relaxed border-t border-dashed border-charcoal-900/10 pt-6 font-light"
                      dangerouslySetInnerHTML={{ __html: details.introHtml }}
                    />
                  )}
                  
                  {/* Route Flow Bar */}
                  {details.routeFlow && (
                    <div className="mt-8 bg-cream-50/55 border border-charcoal-900/10 rounded-[20px] p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="text-[9px] font-bold tracking-widest text-charcoal-500 uppercase block mb-1">
                          {details.routeTitle || "THE ROUTE"}
                        </span>
                        <span className="font-serif text-lg font-bold text-charcoal-900">
                          {details.routeFlow}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="bg-[#46B6E6] text-white text-[9px] font-bold tracking-widest uppercase px-4 py-2 rounded-full shadow-sm">
                          🗺️ FULL ROUTE MAP
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Day-by-Day Timeline */}
                <div className="relative border-l-2 border-charcoal-900/15 pl-6 md:pl-10 ml-4 md:ml-6 space-y-16 py-4">
                  {details.days.map((day, idx) => {
                    const colorMap = {
                      yellow: {
                        bulletBg: "bg-[#E9C46A] border-[#DCAE1D]",
                        cardBg: "bg-white",
                        headerBg: "bg-[#E9C46A]/10 text-charcoal-900 border-[#E9C46A]/20",
                        badgeBg: "bg-[#E9C46A] text-charcoal-900"
                      },
                      blue: {
                        bulletBg: "bg-[#46B6E6] border-[#3ca4cf]",
                        cardBg: "bg-white",
                        headerBg: "bg-[#46B6E6]/10 text-charcoal-900 border-[#46B6E6]/20",
                        badgeBg: "bg-[#46B6E6] text-white"
                      },
                      green: {
                        bulletBg: "bg-[#8FC1A3] border-[#7cb191]",
                        cardBg: "bg-white",
                        headerBg: "bg-[#8FC1A3]/10 text-charcoal-900 border-[#8FC1A3]/20",
                        badgeBg: "bg-[#8FC1A3] text-white"
                      },
                      red: {
                        bulletBg: "bg-[#E76F51] border-[#d85c3e]",
                        cardBg: "bg-white",
                        headerBg: "bg-[#E76F51]/10 text-charcoal-900 border-[#E76F51]/20",
                        badgeBg: "bg-[#E76F51] text-white"
                      }
                    };

                    const c = colorMap[day.color] || colorMap.yellow;
                    const thingsToDo = day.whatToDo ? day.whatToDo.split('\n').filter(Boolean) : [];

                    return (
                      <div key={idx} className="relative group">
                        {/* Timeline Bullet Dot */}
                        <div className={`absolute -left-[35px] md:-left-[51px] top-1.5 w-6 h-6 rounded-full border-4 border-[#FBF7EE] ${c.bulletBg} shadow-sm z-10 flex items-center justify-center transition-transform group-hover:scale-110`} />

                        {/* Day Title Block */}
                        <div className="mb-4">
                          <span className="text-[10px] font-bold tracking-widest text-[#DCAE1D] uppercase block mb-1">
                            DAY {day.dayNum}
                          </span>
                          <h3 className="font-serif text-[28px] md:text-[34px] font-bold text-charcoal-900 tracking-tight leading-tight">
                            {day.title}
                          </h3>
                        </div>

                        {/* The Main Day Card */}
                        <div className="bg-white border-2 border-charcoal-900 rounded-[28px] p-6 md:p-8 shadow-[4px_4px_0px_0px_#2B2A27] space-y-8">
                          
                          {/* Essence paragraph */}
                          {day.essence && (
                            <div className="text-charcoal-700 italic text-sm md:text-base leading-relaxed border-l-4 border-[#DCAE1D] pl-4 py-1 font-light bg-cream-50/20 rounded-r-xl">
                              "{day.essence}"
                            </div>
                          )}

                          {/* What to do list */}
                          {thingsToDo.length > 0 && (
                            <div>
                              <span className="text-[9px] font-bold tracking-[0.2em] text-[#DCAE1D] uppercase block mb-4">
                                TODAY'S MOMENTS &amp; EXPERIENCES
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {thingsToDo.map((todo, tIdx) => (
                                  <div key={tIdx} className="flex gap-3 items-start bg-cream-50/20 border border-charcoal-900/5 rounded-xl p-4">
                                    <span className="text-[#DCAE1D] mt-0.5 text-base flex-shrink-0">✨</span>
                                    <span className="text-xs md:text-sm text-charcoal-700 leading-relaxed font-light">
                                      {todo}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Accommodation & Dining Section */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-dashed border-charcoal-900/10">
                            {/* Stay Card */}
                            {day.stayName && (
                              <div className="bg-cream-50/30 border border-charcoal-900/10 rounded-2xl p-5 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between gap-3 mb-3">
                                    <span className="text-[9px] font-bold tracking-widest text-[#46B6E6] uppercase block">
                                      🛌 WHERE TO STAY
                                    </span>
                                    {day.stayTier && (
                                      <span className="bg-[#46B6E6]/10 text-[#46B6E6] border border-[#46B6E6]/25 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                        {day.stayTier}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="font-serif text-[16px] font-bold text-charcoal-900 mb-1 leading-snug">
                                    {day.stayName}
                                  </h4>
                                  <p className="text-[12px] text-charcoal-600 font-light leading-relaxed">
                                    {day.stayDesc}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Eat & Drink Card */}
                            {day.eatDrinkName && (
                              <div className="bg-cream-50/30 border border-charcoal-900/10 rounded-2xl p-5 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between gap-3 mb-3">
                                    <span className="text-[9px] font-bold tracking-widest text-[#E76F51] uppercase block">
                                      🍴 DRINK &amp; DINE
                                    </span>
                                  </div>
                                  <h4 className="font-serif text-[16px] font-bold text-charcoal-900 mb-1 leading-snug">
                                    {day.eatDrinkName}
                                  </h4>
                                  <p className="text-[12px] text-charcoal-600 font-light leading-relaxed">
                                    {day.eatDrinkDesc}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Transit/Transition info */}
                          {(day.transitionTo || day.transitionTime) && (
                            <div className="bg-charcoal-900 text-white rounded-2xl px-5 py-3.5 flex items-center justify-between text-xs md:text-sm font-sans tracking-wide">
                              <div className="flex items-center gap-2.5">
                                <span className="text-base">🧳</span>
                                <span className="font-light text-white/70">
                                  Next destination: <span className="font-bold text-white">{day.transitionTo}</span>
                                </span>
                              </div>
                              {day.transitionTime && (
                                <span className="bg-white/10 text-white border border-white/20 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                                  ⏱️ {day.transitionTime}
                                </span>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

        {/* Bottom CTA Callout banner row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            href="/blog" 
            className="bg-[#46B6E6] text-white hover:bg-[#3ca4cf] p-10 rounded-[24px] shadow-sm flex flex-col justify-between group min-h-[180px] transition-colors"
          >
            <span className="text-[9px] font-bold tracking-[0.2em] text-white/70 uppercase">EXPLORE STORIES</span>
            <h3 className="font-serif text-2xl md:text-3xl font-bold leading-tight max-w-sm mt-4">
              Read the best blog posts from {details.country} <span className="inline-block transition-transform group-hover:translate-x-1 ml-1">→</span>
            </h3>
          </Link>

          <Link 
            href="/plan-with-me" 
            className="bg-[#E9C46A] text-charcoal-900 hover:bg-[#dbb558] p-10 rounded-[24px] shadow-sm flex flex-col justify-between group min-h-[180px] transition-colors"
          >
            <span className="text-[9px] font-bold tracking-[0.2em] text-charcoal-950/60 uppercase">CUSTOM PLANNING</span>
            <h3 className="font-serif text-2xl md:text-3xl font-bold leading-tight max-w-sm mt-4">
              Let me plan your {guide.title.split(" ")[0]} itinerary <span className="inline-block transition-transform group-hover:translate-x-1 ml-1">→</span>
            </h3>
          </Link>
        </div>

      </div>

      {/* Right Column / Sidebar */}
      <div className="lg:col-span-3 w-full">
        <div className="sticky top-32">
          <div className="border border-charcoal-900/10 bg-white rounded-[20px] p-6 shadow-sm">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#DCAE1D] uppercase block mb-6">
              📖 RELATED DISPATCHES
            </span>
            
            {/* Custom styled scroll container */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-3 custom-sidebar-scroll">
              <style>{`
                .custom-sidebar-scroll::-webkit-scrollbar {
                  width: 4px;
                }
                .custom-sidebar-scroll::-webkit-scrollbar-track {
                  background: rgba(220, 174, 29, 0.05);
                  border-radius: 10px;
                }
                .custom-sidebar-scroll::-webkit-scrollbar-thumb {
                  background: rgba(220, 174, 29, 0.3);
                  border-radius: 10px;
                  transition: background 0.2s;
                }
                .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
                  background: rgba(220, 174, 29, 0.6);
                }
              `}</style>
              
              {allBlogsPreview.map((blog) => (
                <Link 
                  href={`/blog/${blog.slug}`} 
                  key={blog.slug} 
                  className="group flex gap-4 bg-white border border-charcoal-900/5 p-4 rounded-[16px] shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative bg-cream-200">
                    <img 
                      src={blog.coverImage} 
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col justify-between py-0.5 flex-1 min-w-0">
                    <div>
                      <span className="text-[8px] font-bold tracking-widest text-[#DCAE1D] uppercase block mb-1">
                        {blog.countryCode || "TR"} • {blog.category?.split(" • ")[0] || "STORY"}
                      </span>
                      <h4 className="font-serif text-sm font-bold text-charcoal-900 group-hover:text-coral-500 transition-colors leading-snug line-clamp-2">
                        {blog.title}
                      </h4>
                    </div>
                    <span className="text-[9px] font-bold tracking-widest uppercase text-coral-500 flex items-center gap-0.5 mt-1">
                      READ ARTICLE <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>
  );
}
