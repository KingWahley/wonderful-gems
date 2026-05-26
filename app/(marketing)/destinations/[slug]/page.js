import { fetchDestinations, fetchBlogs, fetchMiniGuides } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 60;

const flagMap = {
  "japan": "🇯🇵",
  "portugal": "🇵🇹",
  "chile": "🇨🇱",
  "mexico": "🇲🇽",
  "morocco": "🇲🇦",
  "iceland": "🇮🇸",
  "vietnam": "🇻🇳",
  "italy": "🇮🇹",
  "belgium": "🇧🇪"
};

export default async function DestinationDetails({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const { slug } = resolvedParams;

  let destination = null;
  let relatedBlogs = [];
  let otherCountries = [];
  let companionGuide = null;

  try {
    const [destData, blogData, guidesData] = await Promise.all([
      fetchDestinations(),
      fetchBlogs(),
      fetchMiniGuides()
    ]);

    destination = destData.find(d => d.slug === slug);

    if (destination) {
      relatedBlogs = blogData.filter(
        b => b.destination.toLowerCase() === destination.country.toLowerCase() && (b.status || "Draft").toLowerCase() === "published"
      );
      companionGuide = guidesData.find(
        g => g.destination.toLowerCase() === destination.country.toLowerCase() && (g.status || "published").toLowerCase() === "published"
      );
    }

    otherCountries = destData.filter(d => d.slug !== (destination?.slug || ""));
  } catch (err) {
    console.error("Failed to load destination details frontend", err);
  }

  if (!destination) {
    return (
      <div className="pt-32 pb-24 bg-[#FBF7EE] min-h-screen flex items-center justify-center">
        <p className="text-charcoal-800 font-serif">Destination not found.</p>
      </div>
    );
  }

  const currentFlag = flagMap[destination.slug] || "📍";
  const hasWhyILoveIt = !!destination.whyILoveIt;
  const hasMoments = !!(destination.moments && destination.moments.length > 0);

  return (
    <div className="pt-32 pb-24 bg-[#FBF7EE] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] font-bold text-charcoal-700 uppercase">
            <Link href="/destinations" className="hover:text-mustard-500 transition-colors">DESTINATIONS</Link>
            <span className="text-charcoal-300">/</span>
            <span className="text-charcoal-900">{destination.country}</span>
          </div>
        </div>

        {/* Hero Splitted Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#DCAE1D] uppercase block mb-3">
              COUNTRY GUIDE
            </span>
            <h1 className="text-[52px] md:text-[68px] font-serif font-bold text-charcoal-900 leading-[1.05] mb-6 tracking-tight flex items-baseline gap-3">
              <span className="text-[36px] font-sans font-semibold text-charcoal-400 uppercase tracking-normal">
                {destination.code}
              </span>
              {destination.country}
            </h1>
            {destination.excerpt && (
              <p className="text-charcoal-700 text-[16px] md:text-[18px] leading-relaxed mb-6 font-medium max-w-lg">
                {destination.excerpt}
              </p>
            )}
            <span className="text-coral-500 font-serif text-[22px] font-bold block mb-4 italic">
              {relatedBlogs.length} posts from {destination.country}
            </span>
          </div>

          <div className="relative w-full h-[320px] md:h-[420px] rounded-[24px] overflow-hidden shadow-md bg-cream-200">
            {destination.coverImage && (
              <Image 
                src={destination.coverImage} 
                alt={destination.country}
                fill
                sizes="(max-width: 1200px) 100vw, 800px"
                className="object-cover"
              />
            )}
          </div>
        </div>

        <div className="h-px bg-charcoal-900/10 w-full mb-16"></div>

        {/* Highlight Grid Blocks */}
        {(hasWhyILoveIt || hasMoments) && (
          <div className={`grid grid-cols-1 ${hasWhyILoveIt && hasMoments ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-6 mb-16`}>
            
            {/* Why I Love It Card */}
            {hasWhyILoveIt && (
              <div className="bg-[#46B6E6] text-white rounded-[24px] p-8 md:p-12 shadow-sm flex flex-col justify-between min-h-[340px]">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-white/80 uppercase block mb-4">
                    WHY I LOVE IT 🧡
                  </span>
                  <h2 className="font-serif text-[28px] md:text-[34px] font-bold leading-tight mb-4 tracking-tight">
                    What keeps pulling me back to {destination.country}
                  </h2>
                </div>
                <p className="text-white/90 text-sm md:text-[15px] leading-relaxed font-medium">
                  {destination.whyILoveIt}
                </p>
              </div>
            )}

            {/* The moments I'd repeat tomorrow Card */}
            {hasMoments && (
              <div className="bg-[#E9C46A] text-charcoal-900 rounded-[24px] p-8 md:p-12 shadow-sm min-h-[340px]">
                <span className="text-[10px] font-bold tracking-[0.2em] text-charcoal-800/60 uppercase block mb-4">
                  📍 FAVORITES
                </span>
                <h2 className="font-serif text-[28px] md:text-[34px] font-bold leading-tight mb-6 tracking-tight">
                  The moments I'd repeat tomorrow
                </h2>
                <div className="space-y-4">
                  {destination.moments.map((moment, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full border border-charcoal-900/80 bg-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 shadow-sm">
                        {idx + 1}
                      </div>
                      <p className="text-xs md:text-sm font-bold text-charcoal-900/90 leading-snug">
                        {moment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Jump To block */}
        <div className="flex items-center gap-3 mb-20 bg-white/40 border border-charcoal-900/5 px-6 py-3 rounded-full w-fit">
          <span className="text-[9px] font-bold tracking-[0.2em] text-charcoal-500 uppercase mr-1">JUMP TO:</span>
          <a href="#blog-posts" className="px-4 py-1.5 border border-charcoal-900/10 bg-[#EFEBE4] text-[9px] font-bold tracking-widest uppercase rounded-full hover:bg-charcoal-900 hover:text-white hover:border-charcoal-900 transition-all shadow-sm">
            BLOG POSTS
          </a>
          {companionGuide && (
            <a href="#mini-guides" className="px-4 py-1.5 border border-charcoal-900/10 bg-[#EFEBE4] text-[9px] font-bold tracking-widest uppercase rounded-full hover:bg-charcoal-900 hover:text-white hover:border-charcoal-900 transition-all shadow-sm">
              MINI GUIDES
            </a>
          )}
        </div>

        {/* Related Blog Posts */}
        <div id="blog-posts" className="mb-24 scroll-mt-24">
          <span className="text-[10px] font-bold tracking-widest text-[#DCAE1D] uppercase block mb-3">
            📖 BLOG POSTS
          </span>
          <h2 className="font-serif text-[32px] md:text-[38px] font-bold text-charcoal-900 mb-8 tracking-tight">
            Blog posts from {destination.country}
          </h2>

          {relatedBlogs.length === 0 ? (
            <div className="p-12 text-center text-charcoal-800/60 text-sm font-medium bg-white rounded-[24px] border border-charcoal-900/10">
              No blog stories published from this destination yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedBlogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`} className="group block bg-white rounded-[24px] overflow-hidden border border-charcoal-900/10 hover:shadow-md transition-shadow">
                  <div className="relative h-[220px] md:h-[260px] w-full overflow-hidden bg-cream-200">
                    {blog.coverImage && (
                      <Image 
                        src={blog.coverImage} 
                        alt={blog.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 40vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-[9px] font-bold tracking-widest uppercase text-charcoal-900 shadow-sm flex items-center gap-1.5 border border-charcoal-900/5">
                      <span>{currentFlag}</span> {destination.country.toUpperCase()}
                    </div>
                  </div>
                  <div className="p-6 md:p-8 bg-white">
                    <span className="text-[9px] font-bold tracking-[0.2em] text-[#DCAE1D] uppercase block mb-2">
                      {blog.category?.split(" • ")[1] || "TRAVEL"} • {blog.category?.split(" • ")[2] || "2025"}
                    </span>
                    <h3 className="font-serif text-[22px] md:text-[26px] font-bold text-charcoal-900 mb-4 group-hover:text-coral-500 transition-colors leading-tight">
                      {blog.title}
                    </h3>
                    <span className="text-coral-500 font-serif font-bold text-sm inline-flex items-center gap-1">
                      Read the story <span className="transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Mini Guides Section */}
        {companionGuide && (
          <div id="mini-guides" className="mb-24 scroll-mt-24">
            <span className="text-[10px] font-bold tracking-widest text-[#DCAE1D] uppercase block mb-3">
              ⚡ COMPANION GUIDE
            </span>
            <h2 className="font-serif text-[32px] md:text-[38px] font-bold text-charcoal-900 mb-8 tracking-tight">
              Mini guides for {destination.country}
            </h2>

            <div className="bg-white rounded-[24px] border border-charcoal-900/10 overflow-hidden shadow-sm flex flex-col md:flex-row">
              
              {/* Left Block */}
              <div className="bg-[#E9C46A] p-8 md:p-12 md:w-[60%] flex flex-col justify-between min-h-[320px]">
                <div>
                  <span className="text-[9px] font-bold tracking-widest text-charcoal-800/60 uppercase block mb-4">
                    ⚡ COMPANION GUIDE
                  </span>
                  <h3 className="font-serif text-[32px] md:text-[38px] font-bold text-charcoal-900 leading-tight mb-4 tracking-tight">
                    {companionGuide.title}
                  </h3>
                  <p className="text-charcoal-800 text-sm md:text-[15px] leading-relaxed mb-8 max-w-lg font-medium">
                    {companionGuide.excerpt || `${destination.country} rewards a slower pace. This companion guide pulls together where to stay, what to eat, and core active activities.`}
                  </p>
                </div>
                <Link 
                  href={`/mini-guides/${companionGuide.slug}`} 
                  className="inline-flex items-center gap-1.5 text-charcoal-900 font-bold text-sm uppercase tracking-widest hover:text-black transition-colors"
                >
                  Open the guide <span className="text-coral-500 text-lg">→</span>
                </Link>
              </div>

              {/* Right Block */}
              <div className="bg-[#F6E3B3] p-8 md:p-12 md:w-[40%] flex flex-col justify-center border-t md:border-t-0 md:border-l border-charcoal-900/5">
                <span className="font-serif italic text-coral-500 text-[26px] block mb-6 font-bold">inside →</span>
                <ul className="space-y-3.5 text-charcoal-900 font-bold text-[11px] tracking-widest uppercase">
                  <li className="flex items-center gap-2">
                    <span className="text-[#DCAE1D] text-xs">◆</span> TOP SIGHTS
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#DCAE1D] text-xs">◆</span> WHERE TO STAY ($, $$, $$$)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#DCAE1D] text-xs">◆</span> WHAT TO EAT & DRINK
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#DCAE1D] text-xs">◆</span> BEST RESTAURANTS
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#DCAE1D] text-xs">◆</span> TOURS & ACTIVITIES
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#DCAE1D] text-xs">◆</span> BEST DAY TRIPS
                  </li>
                </ul>
              </div>

            </div>
          </div>
        )}

        {/* Other Countries Selection */}
        <div>
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#DCAE1D] uppercase block mb-3">
            SOMEWHERE ELSE?
          </span>
          <h3 className="font-serif text-[28px] md:text-[34px] font-bold text-charcoal-900 mb-8 tracking-tight">
            Other countries
          </h3>

          <div className="flex flex-wrap gap-3">
            {otherCountries.map((country) => (
              <Link 
                key={country.id} 
                href={`/destinations/${country.slug}`}
                className="px-4 py-2 border border-charcoal-900/10 bg-[#EFEBE4] text-[10px] font-bold tracking-widest uppercase rounded-full hover:bg-charcoal-900 hover:text-white hover:border-charcoal-900 transition-all shadow-sm flex items-center gap-1.5 text-charcoal-800"
              >
                <span>{flagMap[country.slug] || "📍"}</span>
                {country.country}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
