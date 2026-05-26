import Link from "next/link";
import Image from "next/image";
import { fetchBlogs, fetchDestinations, fetchMiniGuides } from "@/lib/db";
import { notFound } from "next/navigation";

export const revalidate = 60;

const renderParagraphWithDropcap = (text, key) => {
  if (!text) return null;
  const firstLetter = text.charAt(0);
  const restText = text.slice(1);
  return (
    <p key={key} className="mb-8 text-[16px] md:text-[18px] leading-relaxed text-[#161616] font-sans font-normal">
      <span className="float-left text-[60px] md:text-[72px] font-serif font-bold text-[#c7962d] leading-[0.8] mr-3 mt-1.5 align-middle select-none">
        {firstLetter}
      </span>
      {restText}
    </p>
  );
};

export default async function BlogPost({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const { slug } = resolvedParams;

  let post = null;
  let relatedPosts = [];
  let latestPosts = [];
  let uniqueDestinations = [];
  let guides = [];

  try {
    const [blogData, destData, guidesData] = await Promise.all([
      fetchBlogs(),
      fetchDestinations(),
      fetchMiniGuides()
    ]);

    post = blogData.find((p) => p.slug === slug);
    if (!post || (post.status || "Draft").toLowerCase() !== "published") {
      notFound();
    }

    guides = guidesData || [];

    // Find other posts from same destination
    relatedPosts = blogData.filter(
      (p) => p.destination?.toLowerCase() === post.destination?.toLowerCase() && p.id !== post.id && (p.status || "Draft").toLowerCase() === "published"
    ).slice(0, 3);

    // Latest posts for sidebar
    latestPosts = blogData.filter(p => p.id !== post.id && (p.status || "Draft").toLowerCase() === "published").slice(0, 5);

    // Get unique destinations from destinations list or posts
    uniqueDestinations = destData.map(d => d.country);
  } catch (err) {
    console.error("Failed to fetch blog post details dynamically", err);
    notFound();
  }

  // Extract and parse content securely to avoid crashing when content is stored as JSONB object or serialized JSON string
  let contentText = "";
  let readTimeText = "8 MIN READ";
  let cityText = "";
  let miniGuideId = null;
  let miniGuideCta = "Open the guide";
  let tagsArray = [];
  let imageAltText = "";

  if (post.content) {
    if (typeof post.content === "object" && post.content !== null) {
      contentText = post.content.body || "";
      cityText = post.content.city || "";
      readTimeText = (post.content.readTime || "8 min").toUpperCase();
      if (!readTimeText.includes("READ")) readTimeText += " READ";
      miniGuideId = post.content.cityMiniGuide || null;
      miniGuideCta = post.content.cityMiniGuideCta || "Open the guide";
      const tagsStr = post.content.tags || "";
      tagsArray = tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(Boolean) : [];
      imageAltText = post.content.imageAltText || "";
    } else if (typeof post.content === "string") {
      try {
        const parsed = JSON.parse(post.content);
        if (parsed && typeof parsed === "object") {
          contentText = parsed.body || "";
          cityText = parsed.city || "";
          readTimeText = (parsed.readTime || "8 min").toUpperCase();
          if (!readTimeText.includes("READ")) readTimeText += " READ";
          miniGuideId = parsed.cityMiniGuide || null;
          miniGuideCta = parsed.cityMiniGuideCta || "Open the guide";
          const tagsStr = parsed.tags || "";
          tagsArray = tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(Boolean) : [];
          imageAltText = parsed.imageAltText || "";
        } else {
          contentText = post.content;
        }
      } catch (e) {
        // Fallback to raw string
        contentText = post.content;
      }
    }
  }

  let companionGuide = null;
  if (miniGuideId && guides.length > 0) {
    companionGuide = guides.find(g => String(g.id) === String(miniGuideId) || g.slug === miniGuideId);
  }

  // Fallbacks and formatted tags
  const resolvedCity = cityText || post.category?.split(" • ")[1] || "KYOTO";
  
  const getFormattedDateLabel = (dateStr) => {
    if (!dateStr) return "APR 2025";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr.toUpperCase();
      const month = d.toLocaleString('default', { month: 'short' }).toUpperCase();
      const year = d.getFullYear();
      return `${month} ${year}`;
    } catch (e) {
      return "APR 2025";
    }
  };
  const dateLabel = getFormattedDateLabel(post.date);

  if (tagsArray.length === 0) {
    const categoryTags = post.category ? post.category.split(" • ").slice(1) : [];
    tagsArray = categoryTags.length > 0 ? categoryTags : ["slow travel", "temples", "food"];
  }

  // Split content by double newlines or paragraph breaks to format beautifully
  const paragraphs = contentText ? contentText.split(/\n\s*\n/) : [];

  return (
    <div className="pt-32 pb-24 bg-[#FBF7EE] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="mb-16 mt-4">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] font-bold text-[#6f6b63] uppercase">
            <Link href="/destinations" className="hover:text-[#c7962d] transition-colors">DESTINATIONS</Link>
            <span className="text-charcoal-300">/</span>
            <Link href={`/destinations/${post.destination?.toLowerCase() || ""}`} className="hover:text-[#c7962d] transition-colors">
              <span className="text-[10px] opacity-80 mr-1">{post.countryCode?.toLowerCase() || "📍"}</span>
              {post.destination}
            </Link>
            <span className="text-charcoal-300">/</span>
            <span className="text-[#161616]">{resolvedCity}</span>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#c7962d] uppercase block mb-4">
            HELLO FROM
          </span>

          {/* Tags */}
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <span className="border border-charcoal-900/10 bg-[#EFEBE4] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase text-charcoal-900">
              <span className="text-[10px] opacity-80 mr-1">{post.countryCode?.toLowerCase() || "📍"}</span>
              {post.destination}
            </span>
            <span className="bg-[#3ca4dc] text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-xs">
              {resolvedCity}
            </span>
            <span className="bg-[#82c09a] text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-xs">
              {dateLabel}
            </span>
          </div>

          <h1 className="text-[40px] md:text-[56px] lg:text-[64px] font-serif font-bold text-[#161616] leading-[1.1] mb-6 max-w-4xl mx-auto tracking-tight">
            {post.title}
          </h1>
          
          <p className="text-[#6f6b63] max-w-2xl mx-auto text-[15px] md:text-[17px] leading-relaxed mb-8 font-medium">
            {post.excerpt || "A deep journey into local stories, neighborhood secrets, and quiet morning paths."}
          </p>

          {/* Read Time & Mini Guide Link */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-8">
            <span className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#161616] uppercase">
              📖 {readTimeText}
            </span>
            {companionGuide && (
              <Link 
                href={`/mini-guides/${companionGuide.slug}`} 
                className="flex items-center gap-1.5 bg-transparent border border-charcoal-900/80 px-6 py-2 rounded-full text-[10px] font-bold tracking-widest text-[#161616] uppercase hover:bg-[#161616] hover:text-white transition-colors"
              >
                <span className="text-orange-500 font-sans">⚡</span> {miniGuideCta.toUpperCase()}
              </Link>
            )}
          </div>

          {/* Social Share Row */}
          <div className="flex items-center gap-3 border border-charcoal-900/80 px-6 py-2 rounded-full w-fit mx-auto bg-white/50 backdrop-blur-xs shadow-xs">
            <span className="text-[9px] font-bold tracking-[0.2em] text-[#6f6b63] uppercase">SHARE</span>
            
            <button className="w-8 h-8 rounded-full border border-charcoal-900/10 flex items-center justify-center hover:bg-[#161616] hover:text-[#FBF7EE] transition-colors cursor-pointer text-[#161616]">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            <button className="w-8 h-8 rounded-full border border-charcoal-900/10 flex items-center justify-center hover:bg-[#161616] hover:text-[#FBF7EE] transition-colors cursor-pointer text-[#161616]">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </button>
            <button className="w-8 h-8 rounded-full border border-charcoal-900/10 flex items-center justify-center hover:bg-[#161616] hover:text-[#FBF7EE] transition-colors cursor-pointer text-[#161616]">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Image */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 animate-in fade-in zoom-in-95 duration-500">
        <div className="relative w-full h-[400px] md:h-[600px] rounded-[2rem] overflow-hidden bg-[#FAF7F1] shadow-lg border border-charcoal-900/5">
          {post.coverImage && (
            <Image 
              src={post.coverImage} 
              alt={imageAltText || post.title}
              fill
              sizes="(max-width: 1200px) 100vw, 1100px"
              priority
              className="object-cover"
            />
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-16">
        
        {/* Main Content */}
        <div className="lg:w-[65%]">
          <div className="prose prose-lg max-w-none text-[#161616] leading-relaxed font-sans">
            {paragraphs.length > 0 ? (
              paragraphs.map((para, idx) => {
                // If it's a quote in the content
                if (para.startsWith(">")) {
                  return (
                    <div key={idx} className="py-12 border-y border-charcoal-900/10 my-16 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <p className="font-serif text-[28px] md:text-[36px] font-bold text-[#161616] leading-tight italic">
                        {para.replace(/^>\s*/, "")}
                      </p>
                    </div>
                  );
                }
                
                return (
                  <div key={idx}>
                    {idx === 0 ? renderParagraphWithDropcap(para, idx) : <p className="mb-8 text-[16px] md:text-[18px] leading-relaxed text-[#161616] font-sans font-normal">{para}</p>}
                  </div>
                );
              })
            ) : (
              <p className="text-[#6f6b63] font-medium">No content provided for this blog post.</p>
            )}

            {companionGuide && (
              <div className="border border-charcoal-900/10 bg-[#FDFBF7] rounded-[20px] p-8 mb-12 mt-12 shadow-xs transition-all hover:border-[#c7962d]/30 hover:shadow-sm duration-300">
                <span className="text-[10px] font-bold tracking-widest text-[#c7962d] uppercase block mb-2">⚡ COMPANION GUIDE ATTACHED</span>
                <h4 className="font-serif text-2xl font-bold text-[#161616] mb-2">
                  Ready to explore {resolvedCity}?
                </h4>
                <p className="text-sm md:text-base text-[#6f6b63] leading-relaxed mb-6 font-sans">
                  Get immediate access to curated hotel recommendations, offline neighborhood maps, walking route itineraries, and booking advice.
                </p>
                <Link 
                  href={`/mini-guides/${companionGuide.slug}`}
                  className="inline-flex items-center gap-2 bg-[#c7962d] text-charcoal-900 hover:bg-[#c7962d]/90 font-bold text-xs uppercase px-6 py-3 rounded-full transition-colors tracking-widest shadow-xs"
                >
                  {miniGuideCta.toUpperCase()} <span className="text-sm">→</span>
                </Link>
              </div>
            )}

            {/* Bottom Social Icons */}
            <div className="flex flex-col items-center justify-center border-t border-charcoal-900/10 pt-12 pb-16">
              <span className="text-[10px] font-bold tracking-widest text-[#c7962d] uppercase block mb-6">SHARE THIS STORY</span>
              <div className="flex gap-4">
                <button className="group w-12 h-12 rounded-full border border-charcoal-900/20 flex items-center justify-center hover:bg-white hover:border-[#c7962d]/50 transition-all cursor-pointer bg-white/30 backdrop-blur-xs shadow-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#161616] group-hover:text-[#c7962d] transition-colors"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </button>
                <button className="group w-12 h-12 rounded-full border border-charcoal-900/20 flex items-center justify-center hover:bg-white hover:border-[#c7962d]/50 transition-all cursor-pointer bg-white/30 backdrop-blur-xs shadow-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#161616] group-hover:text-[#c7962d] transition-colors"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
                </button>
                <button className="group w-12 h-12 rounded-full border border-charcoal-900/20 flex items-center justify-center hover:bg-white hover:border-[#c7962d]/50 transition-all cursor-pointer bg-white/30 backdrop-blur-xs shadow-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#161616] group-hover:text-[#c7962d] transition-colors"><path d="M8 2a6 6 0 0 0-6 6c0 3.3 2 6.2 5 7.4-.1-.6-.2-1.5 0-2.2l1.2-5.2s-.3-.6-.3-1.5c0-1.4.8-2.5 1.9-2.5 1 0 1.4.7 1.4 1.6 0 1-.6 2.4-.9 3.8-.3 1.1.5 2 1.6 2 2 0 3.5-2.1 3.5-5.1 0-2.7-1.9-4.6-4.7-4.6-3.2 0-5.1 2.4-5.1 4.9 0 1 .4 2 1 2.7.1.1.1.2 0 .3l-.4 1.4c-.1.2-.2.3-.4.2-1.5-.7-2.4-2.8-2.4-4.5 0-3.6 2.6-7 7.7-7 4 0 7.2 2.9 7.2 6.8 0 4-2.5 7.3-6 7.3-1.2 0-2.3-.6-2.7-1.4l-.7 2.8c-.3 1-1 2.2-1.5 3 .9.3 1.9.5 3 .5 5.5 0 10-4.5 10-10A10 10 0 0 0 8 2z"/></svg>
                </button>
                <button className="group w-12 h-12 rounded-full border border-charcoal-900/20 flex items-center justify-center hover:bg-white hover:border-[#c7962d]/50 transition-all cursor-pointer bg-white/30 backdrop-blur-xs shadow-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#161616] group-hover:text-[#c7962d] transition-colors"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-[35%]">
          <div className="sticky top-32">
            <div className="border border-charcoal-900/10 bg-[#FDFBF7] rounded-[20px] p-6 shadow-sm">
              <span className="text-[10px] font-bold tracking-widest text-[#c7962d] uppercase block mb-6 font-sans">LATEST POSTS</span>
              
              <div className="space-y-6 max-h-[520px] overflow-y-auto pr-3 custom-sidebar-scroll">
                <style>{`
                  .custom-sidebar-scroll::-webkit-scrollbar {
                    width: 4px;
                  }
                  .custom-sidebar-scroll::-webkit-scrollbar-track {
                    background: rgba(199, 150, 45, 0.05);
                    border-radius: 10px;
                  }
                  .custom-sidebar-scroll::-webkit-scrollbar-thumb {
                    background: rgba(199, 150, 45, 0.3);
                    border-radius: 10px;
                  }
                `}</style>
                
                {latestPosts.map((latest) => {
                  let latestCity = latest.content?.city;
                  if (!latestCity && latest.content) {
                    try {
                      const parsed = JSON.parse(latest.content);
                      latestCity = parsed.city;
                    } catch (e) {}
                  }
                  const displayCity = (latestCity || latest.destination || "TRAVEL").toUpperCase();
                  
                  return (
                    <Link href={`/blog/${latest.slug}`} key={latest.id} className="group block border-b border-charcoal-900/5 pb-6 last:border-b-0 last:pb-0">
                      <div className="w-full h-[140px] rounded-[12px] overflow-hidden mb-4 bg-[#FAF7F1] border border-charcoal-900/5 relative shadow-xs">
                        {latest.coverImage && (
                          <Image 
                            src={latest.coverImage} 
                            alt={latest.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 30vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#6f6b63] block mb-2 font-sans">
                        {displayCity}
                      </span>
                      <h4 className="font-serif text-[18px] font-bold text-[#161616] leading-tight mb-4 group-hover:text-[#d95f43] transition-colors">
                        {latest.title}
                      </h4>
                      <div className="inline-flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase text-[#161616] hover:text-[#c7962d] transition-colors font-sans">
                        READ STORY <span className="text-xs">→</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Related Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 border-t border-charcoal-900/10 pt-16">
        
        {relatedPosts.length > 0 && (
          <div className="mb-16">
            <span className="text-[10px] font-bold tracking-widest text-mustard-500 uppercase block mb-6">MORE FROM {post.destination?.toUpperCase()}</span>
            <h3 className="font-serif text-[32px] font-bold text-charcoal-900 mb-8">Other posts from this country</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link key={related.id} href={`/blog/${related.slug}`} className="group block bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-charcoal-900/5">
                  <div className="relative h-[200px] w-full overflow-hidden bg-cream-200">
                    {related.coverImage && (
                      <Image 
                        src={related.coverImage} 
                        alt={related.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 30vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                      <span className="text-[9px] font-bold tracking-widest uppercase text-charcoal-900">{related.destination}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-[20px] font-bold text-charcoal-900 group-hover:text-coral-500 transition-colors">
                      {related.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Other Countries Pills */}
        <div>
          <span className="text-[10px] font-bold tracking-widest text-mustard-500 uppercase block mb-6">EXPLORE MORE</span>
          <h3 className="font-serif text-[32px] font-bold text-charcoal-900 mb-8">Other countries</h3>
          <div className="flex flex-wrap gap-2">
            {uniqueDestinations.filter(d => d !== post.destination).map((dest, idx) => (
              <Link key={idx} href={`/destinations/${dest.toLowerCase()}`} className="border border-charcoal-900/10 bg-white px-5 py-2 rounded-full text-[10px] font-bold tracking-widest text-charcoal-900 hover:bg-mustard-50 transition-colors uppercase shadow-sm">
                {dest}
              </Link>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
