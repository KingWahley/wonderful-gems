export const revalidate = 60;

import { fetchMiniGuides, fetchBlogs, fetchDestinations, fetchTours } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, Sparkle, Utensils, Share2, Mail, Copy } from "lucide-react";

// Local SVG implementations of social brand icons since this custom lucide-react lacks them
const Twitter = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Facebook = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Linkedin = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Data for mini guides is completely dynamic and loaded from the Supabase database.

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
    tours = (toursData || []).filter(item => (item.status || "published").toLowerCase() === "published");
    blogs = (blogsData || []).filter(item => (item.status || "Draft").toLowerCase() === "published");
  } catch (err) {
    console.error("Failed to load mini guide detail data dynamically", err);
  }

  const guide = guides.find(g => g.slug === slug || (g.id && String(g.id) === String(slug)));
  if (!guide || (guide.status || "published").toLowerCase() !== "published") {
    notFound();
  }

  // Resolve flags, or default to generic marker
  const flags = { JP: "🇯🇵", PT: "🇵🇹", CL: "🇨🇱", MX: "🇲🇽", MA: "🇲🇦", IS: "🇮🇸", VN: "🇻🇳", IT: "🇮🇹", BE: "🇧🇪", US: "🇺🇸", FR: "🇫🇷", ES: "🇪🇸" };
  const currentFlag = flags[guide.countryCode] || "📍";

  // Find destination matching this guide
  const destination = destinations.find(
    (d) => d.code === guide.countryCode || d.country.toLowerCase() === guide.destination.toLowerCase()
  );

  const details = {
    country: guide.destination,
    flag: currentFlag,
    pocketTitle: guide.details?.pocketTitle || "",
    itineraryTitle: guide.details?.itineraryTitle || "",
    blogCountText: guide.details?.blogCountText || "",
    bestTimeToVisit: guide.details?.bestTimeToVisit || "",
    idealDuration: guide.details?.idealDuration || "",
    budgetLevel: guide.details?.budgetLevel || "",
    excerpt: guide.excerpt || guide.details?.excerpt || destination?.excerpt || "",
    sights: (guide.details?.sights || destination?.moments?.map((m, idx) => ({
      num: String(idx + 1).padStart(2, "0"),
      text: m
    })) || []).map((s, idx) => ({
      ...s,
      color: s.color || ["text-[#DCAE1D]", "text-[#46B6E6]", "text-[#8FC1A3]", "text-[#E76F51]"][idx % 4]
    })),
    stay: {
      budget: guide.details?.stay?.budget || [],
      mid: guide.details?.stay?.mid || [],
      splurge: guide.details?.stay?.splurge || []
    },
    activities: (guide.details?.activities || tours
      .filter(t => t.countryCode === guide.countryCode || t.destination.toLowerCase() === guide.destination.toLowerCase())
      .map((t, idx) => ({
        num: String(idx + 1).padStart(2, "0"),
        text: t.title
      })) || []).map((a, idx) => ({
        ...a,
        num: a.num || String(idx + 1).padStart(2, "0")
      })),
    eat: guide.details?.eat || [],
    restaurants: {
      budget: guide.details?.restaurants?.budget || [],
      mid: guide.details?.restaurants?.mid || [],
      splurge: guide.details?.restaurants?.splurge || []
    },
    dayTrips: (guide.details?.dayTrips || destinations
      .filter(d => d.region === destination?.region && d.id !== destination?.id)
      .slice(0, 4)
      .map((d, idx) => ({
        num: String(idx + 1).padStart(2, "0"),
        name: `${d.country} (${d.excerpt?.split(",")[0] || d.country})`
      })) || []).map((dt, idx) => ({
        ...dt,
        bg: dt.bg || ["bg-[#E9C46A]/20 border-[#E9C46A]/40", "bg-[#46B6E6]/20 border-[#46B6E6]/40", "bg-[#8FC1A3]/20 border-[#8FC1A3]/40", "bg-[#E76F51]/20 border-[#E76F51]/40"][idx % 4],
        badgeCol: dt.badgeCol || ["bg-[#E9C46A] text-charcoal-900", "bg-[#46B6E6] text-white", "bg-[#8FC1A3] text-white", "bg-[#E76F51] text-white"][idx % 4],
        solidBg: dt.solidBg || ["bg-[#E9C46A]", "bg-[#46B6E6]", "bg-[#8FC1A3]", "bg-[#E76F51]"][idx % 4],
        emoji: dt.emoji || "🚌"
      })),
    days: guide.details?.days || [],
    noOfDays: guide.details?.noOfDays || guide.details?.days?.length || "",
    introText: guide.details?.introText || "",
    introHtml: guide.details?.introHtml || "",
    routeTitle: guide.details?.routeTitle || "",
    routeFlow: guide.details?.routeFlow || ""
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
        <div className="mb-12">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] font-bold text-charcoal-700 uppercase">
            <Link href="/mini-guides" className="hover:text-[#DCAE1D] transition-colors">DESTINATIONS</Link>
            <span className="text-charcoal-300">/</span>
            <span className="text-charcoal-500">{guide.countryCode || "BE"} {details.country.toUpperCase()}</span>
            <span className="text-charcoal-300">/</span>
            <span className="text-charcoal-900">
              {details.routeFlow ? details.routeFlow.toUpperCase().replace(/->/g, " • ").replace(/→/g, " • ") : guide.title.split(" ").slice(0, 3).join(" • ").toUpperCase()}
            </span>
          </div>
        </div>

        {/* Title Block Header */}
        {guide.type === "itinerary" ? (
          <div className="max-w-4xl mx-auto text-center mb-16 flex flex-col items-center">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#DCAE1D] uppercase block mb-6">
              HELLO FROM
            </span>

            {/* Styled Pill Badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <span className="bg-transparent border border-charcoal-900/10 text-charcoal-800 text-[10px] font-bold tracking-widest uppercase px-5 py-2.5 rounded-full shadow-sm">
                {guide.countryCode || "BE"} {details.country.toUpperCase()}
              </span>
              {details.routeFlow && (
                <span className="bg-[#46B6E6] text-charcoal-900 text-[10px] font-bold tracking-widest uppercase px-5 py-2.5 rounded-full shadow-sm">
                  {details.routeFlow.toUpperCase().replace(/->/g, " • ").replace(/→/g, " • ")}
                </span>
              )}
              {details.bestTimeToVisit && (
                <span className="bg-[#8FC1A3] text-charcoal-900 text-[10px] font-bold tracking-widest uppercase px-5 py-2.5 rounded-full shadow-sm">
                  {details.bestTimeToVisit.toUpperCase()}
                </span>
              )}
            </div>

            <h1 className="text-[44px] md:text-[56px] font-serif font-bold text-charcoal-900 leading-[1.1] mb-6 tracking-tight max-w-3xl">
              {guide.title}
            </h1>
            
            {details.excerpt && (
              <p className="text-charcoal-700 text-base md:text-lg leading-relaxed mb-8 max-w-2xl font-light">
                {details.excerpt}
              </p>
            )}

            <div className="flex items-center gap-2 text-[10px] tracking-[0.25em] font-bold text-charcoal-500 uppercase mb-8">
              <span>📖 {Math.max(8, details.days.length * 3)} MIN READ</span>
            </div>

            {/* Premium Outline Share Bar */}
            <div className="border-2 border-charcoal-900 rounded-full px-6 py-2 flex items-center gap-4 bg-white shadow-sm">
              <span className="text-[9px] font-sans font-bold tracking-[0.2em] text-charcoal-600 uppercase pr-4 border-r border-charcoal-900/10">
                SHARE
              </span>
              <div className="flex items-center gap-2.5">
                <button className="w-8 h-8 rounded-full border border-charcoal-900/15 flex items-center justify-center text-charcoal-600 hover:bg-charcoal-900 hover:text-white transition-all shadow-sm">
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button className="w-8 h-8 rounded-full border border-charcoal-900/15 flex items-center justify-center text-charcoal-600 hover:bg-charcoal-900 hover:text-white transition-all shadow-sm">
                  <Twitter className="w-3.5 h-3.5" />
                </button>
                <button className="w-8 h-8 rounded-full border border-charcoal-900/15 flex items-center justify-center text-charcoal-600 hover:bg-charcoal-900 hover:text-white transition-all shadow-sm">
                  <Facebook className="w-3.5 h-3.5" />
                </button>
                <button className="w-8 h-8 rounded-full border border-charcoal-900/15 flex items-center justify-center text-charcoal-600 hover:bg-charcoal-900 hover:text-white transition-all shadow-sm">
                  <Linkedin className="w-3.5 h-3.5" />
                </button>
                <button className="w-8 h-8 rounded-full border border-charcoal-900/15 flex items-center justify-center text-charcoal-600 hover:bg-charcoal-900 hover:text-white transition-all shadow-sm">
                  <Mail className="w-3.5 h-3.5" />
                </button>
                <button className="w-8 h-8 rounded-full border border-charcoal-900/15 flex items-center justify-center text-charcoal-600 hover:bg-charcoal-900 hover:text-white transition-all shadow-sm">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mb-12">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#DCAE1D] uppercase block mb-3">
              📍 PREMIUM POCKET GUIDE
            </span>
            <h1 className="text-[52px] md:text-[68px] font-serif font-bold text-charcoal-900 leading-[1.05] mb-6 tracking-tight">
              {guide.title}
            </h1>
            {details.excerpt && (
              <p className="text-charcoal-700 text-base md:text-lg leading-relaxed mb-8 max-w-2xl font-light">
                {details.excerpt}
              </p>
            )}

            {/* Styled Pill Badges */}
            <div className="flex flex-wrap gap-2.5">
              {details.bestTimeToVisit && (
                <span className="bg-[#E9C46A] text-charcoal-900 text-[9px] font-bold tracking-widest uppercase px-4 py-2 rounded-full shadow-sm">
                  Best Time to Visit: {details.bestTimeToVisit}
                </span>
              )}
              {details.idealDuration && (
                <span className="bg-[#46B6E6] text-white text-[9px] font-bold tracking-widest uppercase px-4 py-2 rounded-full shadow-sm">
                  Ideal Duration: {details.idealDuration}
                </span>
              )}
              {details.budgetLevel && (
                <span className="bg-[#8FC1A3] text-white text-[9px] font-bold tracking-widest uppercase px-4 py-2 rounded-full shadow-sm">
                  Budget Level: {details.budgetLevel}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Layout: Main content (70%) + Sticky Sidebar (30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-16">
          {/* Left Column */}
          <div className="lg:col-span-7 w-full">
            {/* Main Visual Image */}
            {guide.type === "itinerary" ? (
              <div className="border-[3px] border-charcoal-900 rounded-[32px] p-5 bg-[#FAF6EE] shadow-lg mb-16">
                <div className="rounded-[20px] overflow-hidden border-[2px] border-charcoal-900/60 aspect-[16/10] relative">
                  <img 
                    src={guide.heroImage} 
                    alt={guide.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
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
            )}
            {guide.type !== "itinerary" ? (
              <>
                {/* Section Index Anchor Jumps */}
                {((details.sights && details.sights.length > 0) ||
                  (details.stay && (details.stay.budget?.length > 0 || details.stay.mid?.length > 0 || details.stay.splurge?.length > 0)) ||
                  (details.activities && details.activities.length > 0) ||
                  (details.eat && details.eat.length > 0) ||
                  (details.restaurants && (details.restaurants.budget?.length > 0 || details.restaurants.mid?.length > 0 || details.restaurants.splurge?.length > 0)) ||
                  (details.dayTrips && details.dayTrips.length > 0)) && (
                  <div className="bg-[#E9C46A] border-2 border-charcoal-900 rounded-[32px] mb-16 max-w-4xl relative">
                    <div className="bg-white border-2 border-charcoal-900 rounded-[32px] p-8 md:p-10 transform -translate-x-2 -translate-y-2 transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1">
                      <span className="text-[10px] md:text-[11px] font-bold tracking-[0.25em] text-[#DCAE1D] uppercase block mb-3">
                        IN THIS GUIDE
                      </span>
                      <h2 className="font-serif text-[32px] md:text-[38px] font-bold text-charcoal-900 mb-8 leading-none">
                        Jump to a section
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {details.sights && details.sights.length > 0 && (
                          <a href="#top-sights" className="flex items-center gap-4 pb-4 border-b border-dashed border-charcoal-900/10 hover:text-[#DCAE1D] transition-colors group">
                            <span className="font-serif text-[18px] font-bold text-[#E9C46A] w-6">01</span>
                            <span className="text-[20px] leading-none">📍</span>
                            <span className="font-serif text-[17px] font-bold text-charcoal-900 group-hover:text-[#DCAE1D] transition-colors">Top sights</span>
                          </a>
                        )}
                        {details.stay && (details.stay.budget?.length > 0 || details.stay.mid?.length > 0 || details.stay.splurge?.length > 0) && (
                          <a href="#where-to-stay" className="flex items-center gap-4 pb-4 border-b border-dashed border-charcoal-900/10 hover:text-[#DCAE1D] transition-colors group">
                            <span className="font-serif text-[18px] font-bold text-[#E9C46A] w-6">02</span>
                            <span className="text-[20px] leading-none">🛌</span>
                            <span className="font-serif text-[17px] font-bold text-charcoal-900 group-hover:text-[#DCAE1D] transition-colors">Where to stay</span>
                          </a>
                        )}
                        {details.activities && details.activities.length > 0 && (
                          <a href="#activities" className="flex items-center gap-4 pb-4 border-b border-dashed border-charcoal-900/10 hover:text-[#DCAE1D] transition-colors group">
                            <span className="font-serif text-[18px] font-bold text-[#E9C46A] w-6">03</span>
                            <span className="text-[20px] leading-none">🎟️</span>
                            <span className="font-serif text-[17px] font-bold text-charcoal-900 group-hover:text-[#DCAE1D] transition-colors">Best activities & tours</span>
                          </a>
                        )}
                        {details.eat && details.eat.length > 0 && (
                          <a href="#eat-drink" className="flex items-center gap-4 pb-4 border-b border-dashed border-charcoal-900/10 hover:text-[#DCAE1D] transition-colors group">
                            <span className="font-serif text-[18px] font-bold text-[#E9C46A] w-6">04</span>
                            <span className="text-[20px] leading-none">🍜</span>
                            <span className="font-serif text-[17px] font-bold text-charcoal-900 group-hover:text-[#DCAE1D] transition-colors">What to eat & drink</span>
                          </a>
                        )}
                        {details.restaurants && (details.restaurants.budget?.length > 0 || details.restaurants.mid?.length > 0 || details.restaurants.splurge?.length > 0) && (
                          <a href="#restaurants" className="flex items-center gap-4 pb-4 border-b border-dashed border-charcoal-900/10 hover:text-[#DCAE1D] transition-colors group">
                            <span className="font-serif text-[18px] font-bold text-[#E9C46A] w-6">05</span>
                            <span className="text-[20px] leading-none">🍽️</span>
                            <span className="font-serif text-[17px] font-bold text-charcoal-900 group-hover:text-[#DCAE1D] transition-colors">Best restaurants</span>
                          </a>
                        )}
                        {details.dayTrips && details.dayTrips.length > 0 && (
                          <a href="#day-trips" className="flex items-center gap-4 pb-4 border-b border-dashed border-charcoal-900/10 hover:text-[#DCAE1D] transition-colors group">
                            <span className="font-serif text-[18px] font-bold text-[#E9C46A] w-6">06</span>
                            <span className="text-[20px] leading-none">🚆</span>
                            <span className="font-serif text-[17px] font-bold text-charcoal-900 group-hover:text-[#DCAE1D] transition-colors">Best day trips</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

        {/* 1. Top Sights in City */}
        {details.sights && details.sights.length > 0 && (
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
        )}


            {/* 2. Where to Stay in City */}
            {details.stay && (details.stay.budget?.length > 0 || details.stay.mid?.length > 0 || details.stay.splurge?.length > 0) && (
              <div id="where-to-stay" className="mb-20 scroll-mt-24">
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#DCAE1D] uppercase block mb-2 font-sans">
                  ACCOMMODATION
                </span>
                <h2 className="font-serif text-[38px] md:text-[46px] font-bold text-charcoal-900 mb-4 tracking-tight leading-tight">
                  Where to stay in {guide.title.split(" ")[0]}
                </h2>
                <p className="text-charcoal-500/80 text-sm md:text-base leading-relaxed mb-10 max-w-xl font-normal font-sans">
                Picks across three price tiers. All hand-chosen — none of these are generic chains.
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
                      {details.stay.budget.length === 0 && (
                        <span className="text-xs text-charcoal-400 italic">No budget stays listed yet.</span>
                      )}
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
                      {details.stay.mid.length === 0 && (
                        <span className="text-xs text-charcoal-400 italic">No mid-range stays listed yet.</span>
                      )}
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
                      {details.stay.splurge.length === 0 && (
                        <span className="text-xs text-charcoal-400 italic">No splurge stays listed yet.</span>
                      )}
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
            )}

            {/* 3. Best Activities & Tours in City */}
            {details.activities && details.activities.length > 0 && (
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
            )}

            {/* 4. What to Eat & Drink in City */}
            {details.eat && details.eat.length > 0 && (
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
            )}

            {/* 5. Best Restaurants in City */}
            {details.restaurants && (details.restaurants.budget?.length > 0 || details.restaurants.mid?.length > 0 || details.restaurants.splurge?.length > 0) && (
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
                      {details.restaurants.budget.length === 0 && (
                        <span className="text-xs text-charcoal-400 italic">No budget restaurants listed yet.</span>
                      )}
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
                      {details.restaurants.mid.length === 0 && (
                        <span className="text-xs text-charcoal-400 italic">No mid-range restaurants listed yet.</span>
                      )}
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
                      {details.restaurants.splurge.length === 0 && (
                        <span className="text-xs text-charcoal-400 italic">No fine dining restaurants listed yet.</span>
                      )}
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
            )}

            {/* 6. Best Day Trips from City */}
            {details.dayTrips && details.dayTrips.length > 0 && (
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
            )}
              </>
            ) : (
              <div className="space-y-16">
                {/* Bold Blue Route Overview Card */}
                <div className="bg-[#46B6E6] border-2 border-charcoal-900 rounded-[32px] p-8 md:p-10 shadow-[6px_6px_0px_0px_#2B2A27] text-white relative overflow-hidden group">
                  <div className="relative z-10">
                    <span className="text-[10px] md:text-[11px] font-bold tracking-[0.25em] text-white/95 uppercase block mb-3">
                      🗺️ THE ROUTE FLOW
                    </span>
                    <h2 className="font-serif text-[36px] md:text-[44px] font-bold text-white mb-4 leading-none tracking-tight">
                      {details.routeTitle || `${details.noOfDays || details.days.length}-day route`}
                    </h2>
                    <p className="text-white/90 text-sm md:text-base leading-relaxed mb-8 max-w-2xl font-light">
                      {details.introText}
                    </p>
                    
                    {details.introHtml && (
                      <div 
                        className="text-white/85 text-sm md:text-base leading-relaxed max-w-2xl font-light prose prose-invert prose-p:mb-4"
                        dangerouslySetInnerHTML={{ __html: details.introHtml }}
                      />
                    )}
                    
                    {/* Dynamic White Pills connected by arrows */}
                    {details.routeFlow && (
                      <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-[24px] p-6">
                        {details.routeFlow.split(/[\s,]*[-=]>[\s,]*|[\s,]*[→]+[\s,]*|,\s*/).map((city, cIdx) => (
                          <div key={cIdx} className="flex items-center gap-3">
                            {cIdx > 0 && <span className="text-white font-bold text-lg select-none">→</span>}
                            <span className="bg-white text-charcoal-900 px-5 py-2.5 rounded-full font-sans text-xs font-bold uppercase shadow-sm tracking-widest border border-charcoal-900/5 transition-transform duration-300 hover:scale-105">
                              {city.trim()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Horizontal Day Navigation Bar */}
                {details.days.length > 0 && (
                  <div className="bg-white border-2 border-charcoal-900 rounded-2xl p-3 shadow-[3px_3px_0px_0px_#2B2A27] sticky top-28 z-40 overflow-x-auto flex items-center gap-4 scrollbar-none custom-horizontal-nav">
                    <style>{`
                      .custom-horizontal-nav::-webkit-scrollbar {
                        display: none;
                      }
                    `}</style>
                    <span className="text-[9px] font-bold tracking-widest text-[#DCAE1D] uppercase pl-2 flex-shrink-0">
                      🧭 JUMP TO:
                    </span>
                    <div className="flex items-center gap-2">
                      {details.days.map((day, idx) => {
                        const colorMap = {
                          yellow: "bg-[#E9C46A]",
                          blue: "bg-[#46B6E6]",
                          green: "bg-[#8FC1A3]",
                          red: "bg-[#E76F51]"
                        };
                        const dotColor = colorMap[day.color] || colorMap.yellow;
                        return (
                          <a 
                            key={idx}
                            href={`#day-${day.dayNum}`} 
                            className="flex items-center gap-2 px-3.5 py-1.5 hover:bg-cream-50 rounded-full border border-transparent hover:border-charcoal-900/10 transition-all font-sans text-[10px] font-bold uppercase text-charcoal-800 tracking-wider flex-shrink-0"
                          >
                            <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                            <span>Day {day.dayNum}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Day-by-Day Premium Timeline Cards */}
                <div className="space-y-16 py-4">
                  {details.days.map((day, idx) => {
                    const colorMap = {
                      yellow: {
                        headerBg: "bg-[#E9C46A]",
                        badgeBg: "bg-[#E9C46A] text-charcoal-900",
                        dotBg: "bg-[#E9C46A] border-[#DCAE1D]"
                      },
                      blue: {
                        headerBg: "bg-[#46B6E6]",
                        badgeBg: "bg-[#46B6E6] text-white",
                        dotBg: "bg-[#46B6E6] border-[#3ca4cf]"
                      },
                      green: {
                        headerBg: "bg-[#8FC1A3]",
                        badgeBg: "bg-[#8FC1A3] text-white",
                        dotBg: "bg-[#8FC1A3] border-[#7cb191]"
                      },
                      red: {
                        headerBg: "bg-[#E76F51]",
                        badgeBg: "bg-[#E76F51] text-white",
                        dotBg: "bg-[#E76F51] border-[#d85c3e]"
                      }
                    };

                    const c = colorMap[day.color] || colorMap.yellow;
                    const thingsToDo = day.whatToDo ? day.whatToDo.split('\n').filter(Boolean) : [];

                    return (
                      <div key={idx} className="relative group">
                        
                        {/* Day Card container */}
                        <div 
                          id={`day-${day.dayNum}`} 
                          className="bg-white border-2 border-charcoal-900 rounded-[32px] overflow-hidden shadow-[6px_6px_0px_0px_#2B2A27] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#2B2A27]"
                        >
                          {/* Full-width Colored Header */}
                          <div className={`px-8 py-7 relative ${c.headerBg} flex items-center justify-between text-white border-b-2 border-charcoal-900`}>
                            <div className="relative z-10 max-w-[70%]">
                              <span className="text-[10px] md:text-[11px] font-bold tracking-[0.25em] text-white/90 uppercase block mb-1">
                                DAY {day.dayNum} {day.city && `— ${day.city.toUpperCase()}`}
                              </span>
                              <h3 className="font-serif text-2xl md:text-3xl font-bold leading-tight">
                                {day.title}
                              </h3>
                            </div>
                            {/* Massive Faint Day Number on right */}
                            <div className="absolute right-8 top-1/2 -translate-y-1/2 select-none pointer-events-none text-white/20 text-7xl md:text-9xl font-serif font-black italic tracking-tighter">
                              {day.dayNum}
                            </div>
                          </div>
                          
                          {/* Card Inner Grid Content */}
                          <div className="p-8 md:p-10">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
                              
                              {/* Left Column (Experiences) */}
                              <div className="lg:col-span-7 space-y-8">
                                {/* Essence Sentence */}
                                {day.essence && (
                                  <div>
                                    <span className="text-[9px] font-bold tracking-widest text-charcoal-400 uppercase block mb-2">
                                      TODAY, IN A SENTENCE
                                    </span>
                                    <p className="font-serif italic text-lg md:text-xl text-[#E76F51] leading-relaxed font-bold">
                                      "{day.essence}"
                                    </p>
                                  </div>
                                )}

                                {/* Experiences and Moments */}
                                {thingsToDo.length > 0 && (
                                  <div className="space-y-6">
                                    <span className="text-[9px] font-bold tracking-[0.2em] text-[#DCAE1D] uppercase block mb-4">
                                      📌 EXPERIENCES &amp; MOMENTS
                                    </span>
                                    <div className="space-y-5">
                                      {thingsToDo.map((todo, tIdx) => (
                                        <div key={tIdx} className="flex gap-4 items-start group/item">
                                          <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-serif font-bold text-xs shadow-sm border border-charcoal-900/10 ${c.badgeBg}`}>
                                            {tIdx + 1}
                                          </div>
                                          <p className="text-sm md:text-base text-charcoal-700 leading-relaxed font-light mt-0.5">
                                            {todo}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Right Column (Stay, Dine, Tips Box) */}
                              <div className="lg:col-span-5">
                                <div className="bg-cream-50/40 border border-charcoal-900/10 rounded-[24px] p-6 space-y-6">
                                  
                                  {/* Stay box */}
                                  {day.stayName && (
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between gap-3 mb-1">
                                        <span className="text-[9px] font-bold tracking-widest text-[#46B6E6] uppercase flex items-center gap-1.5">
                                          🛌 WHERE TO STAY
                                        </span>
                                        {day.stayTier && (
                                          <span className="bg-[#46B6E6]/10 text-[#46B6E6] border border-[#46B6E6]/25 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                            {day.stayTier}
                                          </span>
                                        )}
                                      </div>
                                      <h4 className="font-serif text-base font-bold text-charcoal-900 leading-snug">
                                        {day.stayName}
                                      </h4>
                                      <p className="text-xs text-charcoal-600 font-light leading-relaxed">
                                        {day.stayDesc}
                                      </p>
                                    </div>
                                  )}

                                  {/* Eat Drink box */}
                                  {day.eatDrinkName && (
                                    <div className="space-y-2 pt-6 border-t border-charcoal-900/5">
                                      <span className="text-[9px] font-bold tracking-widest text-[#E76F51] uppercase flex items-center gap-1.5 mb-1">
                                        🍴 DRINK &amp; DINE
                                      </span>
                                      <h4 className="font-serif text-base font-bold text-charcoal-900 leading-snug">
                                        {day.eatDrinkName}
                                      </h4>
                                      <p className="text-xs text-charcoal-600 font-light leading-relaxed">
                                        {day.eatDrinkDesc}
                                      </p>
                                    </div>
                                  )}

                                  {/* Tip box */}
                                  {day.tip && (
                                    <div className="space-y-2 pt-6 border-t border-charcoal-900/5 bg-[#E9C46A]/5 -mx-6 px-6 py-4 rounded-b-[24px]">
                                      <span className="text-[9px] font-bold tracking-widest text-[#DCAE1D] uppercase flex items-center gap-1.5">
                                        💡 PRO TRAVEL TIP
                                      </span>
                                      <p className="text-xs text-charcoal-700 italic font-light leading-relaxed">
                                        {day.tip}
                                      </p>
                                    </div>
                                  )}

                                </div>
                              </div>

                            </div>
                          </div>
                        </div>

                        {/* Transit Connector UI */}
                        {day.transitionTo && (
                          <div className="my-16 flex flex-col items-center">
                            {/* Cities row with connecting line */}
                            <div className="w-full flex items-center justify-between gap-6 relative">
                              {/* Starting City Label */}
                              <div className="text-right w-1/3">
                                <span className="text-[11px] font-bold tracking-[0.2em] text-charcoal-400 uppercase block mb-1">
                                  DEPART FROM
                                </span>
                                <span className="font-serif text-lg font-bold text-charcoal-900 block truncate">
                                  {day.city || guide.title.split(" ")[0]}
                                </span>
                              </div>

                              {/* Connected Dashed Line with Center Icon */}
                              <div className="flex-1 relative flex items-center justify-center">
                                <div className="absolute inset-x-0 h-0.5 border-t-2 border-dashed border-charcoal-900/20" />
                                <div className="relative z-10 w-10 h-10 rounded-full bg-white border-2 border-[#46B6E6] shadow-sm flex items-center justify-center text-[#46B6E6] text-lg font-bold">
                                  🚂
                                </div>
                              </div>

                              {/* Destination City Label */}
                              <div className="text-left w-1/3">
                                <span className="text-[11px] font-bold tracking-[0.2em] text-charcoal-400 uppercase block mb-1">
                                  ARRIVE AT
                                </span>
                                <span className="font-serif text-lg font-bold text-charcoal-900 block truncate">
                                  {day.transitionTo}
                                </span>
                              </div>
                            </div>

                            {/* Transit details row */}
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                              <span className="bg-[#E9C46A] border border-charcoal-900 text-charcoal-900 text-[9px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-sm">
                                🎫 TRANSIT GUIDE
                              </span>
                              {day.transitionTime && (
                                <span className="text-xs text-charcoal-500 font-light">
                                  Duration: <span className="font-bold text-charcoal-900">{day.transitionTime}</span>
                                </span>
                              )}
                              <span className="text-[11px] font-sans font-bold text-[#46B6E6] hover:underline cursor-pointer">
                                (view route map)
                              </span>
                            </div>
                          </div>
                        )}

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
          <div className="border-2 border-charcoal-900 bg-white rounded-[24px] p-6 shadow-[3px_3px_0px_0px_#2B2A27]">
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
                  border-radius: 10px;
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
