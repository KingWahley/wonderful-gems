import Link from "next/link";
import { fetchBlogs, fetchDestinations } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BlogPost({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const { slug } = resolvedParams;

  let post = null;
  let relatedPosts = [];
  let latestPosts = [];
  let uniqueDestinations = [];

  try {
    const [blogData, destData] = await Promise.all([
      fetchBlogs(),
      fetchDestinations()
    ]);

    post = blogData.find((p) => p.slug === slug);
    if (!post) {
      notFound();
    }

    // Find other posts from same destination
    relatedPosts = blogData.filter(
      (p) => p.destination?.toLowerCase() === post.destination?.toLowerCase() && p.id !== post.id
    ).slice(0, 3);

    // Latest posts for sidebar
    latestPosts = blogData.filter(p => p.id !== post.id).slice(0, 5);

    // Get unique destinations from destinations list or posts
    uniqueDestinations = destData.map(d => d.country);
  } catch (err) {
    console.error("Failed to fetch blog post details dynamically", err);
    notFound();
  }

  // Formatting dropcaps helpers
  const renderParagraphWithDropcap = (para, idx) => {
    if (!para || para.trim() === "") return null;
    const trimmed = para.trim();
    const firstLetter = trimmed.charAt(0);
    const restOfPara = trimmed.slice(1);

    return (
      <p key={idx} className="mb-8">
        <span className="float-left text-7xl font-serif text-mustard-500 leading-none pr-4 pt-2 font-bold uppercase">
          {firstLetter}
        </span>
        {restOfPara}
      </p>
    );
  };

  // Split content by double newlines or paragraph breaks to format beautifully
  const paragraphs = post.content ? post.content.split(/\n\s*\n/) : [];

  return (
    <div className="pt-32 pb-24 bg-[#FBF7EE] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="mb-16 mt-4">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] font-bold text-charcoal-700 uppercase">
            <Link href="/destinations" className="hover:text-mustard-500 transition-colors">DESTINATIONS</Link>
            <span className="text-charcoal-300">/</span>
            <Link href={`/destinations/${post.destination?.toLowerCase() || ""}`} className="hover:text-mustard-500 transition-colors">
              <span className="text-[8px] opacity-60 mr-1">{post.countryCode?.toLowerCase() || "📍"}</span>
              {post.destination}
            </Link>
            <span className="text-charcoal-300">/</span>
            <span className="text-charcoal-900">{post.category?.split(" • ")[1] || "TRAVEL"}</span>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#DCAE1D] uppercase block mb-4">
            HELLO FROM
          </span>

          {/* Tags */}
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <span className="border border-charcoal-900/10 bg-[#EFEBE4] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase text-charcoal-900">
              <span className="text-[8px] opacity-60 mr-1">{post.countryCode?.toLowerCase() || "📍"}</span>
              {post.destination}
            </span>
            <span className="bg-[#46B6E6] text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm">
              {post.category?.split(" • ")[1] || "TRAVEL"}
            </span>
            <span className="bg-[#96CBA8] text-[#2D4A38] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm">
              {post.category?.split(" • ")[2] || "JOURNAL"}
            </span>
          </div>

          <h1 className="text-[48px] md:text-[64px] font-serif font-bold text-charcoal-900 leading-[1.05] mb-6 max-w-4xl mx-auto tracking-tight">
            {post.title}
          </h1>
          
          <p className="text-charcoal-700 max-w-2xl mx-auto text-[15px] md:text-[17px] leading-relaxed mb-8 font-medium">
            {post.excerpt || "A deep journey into local stories, neighborhood secrets, and quiet morning paths."}
          </p>

          {/* Read Time & Mini Guide Link */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-8">
            <span className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-charcoal-800 uppercase">
              📖 8 MIN READ
            </span>
            <Link 
              href={`/mini-guides`} 
              className="flex items-center gap-1.5 bg-transparent border border-charcoal-900/80 px-6 py-2 rounded-full text-[10px] font-bold tracking-widest text-charcoal-900 uppercase hover:bg-charcoal-900 hover:text-white transition-colors"
            >
              <span className="text-orange-500 font-sans">⚡</span> COMPANION GUIDE
            </Link>
          </div>

          {/* Social Share Row */}
          <div className="flex items-center gap-3 border border-charcoal-900/80 px-6 py-2 rounded-full w-fit mx-auto bg-white/50 backdrop-blur-sm shadow-sm">
            <span className="text-[9px] font-bold tracking-[0.2em] text-charcoal-500 uppercase">SHARE</span>
            
            <button className="w-8 h-8 rounded-full border border-charcoal-900/10 flex items-center justify-center hover:bg-charcoal-900 hover:text-[#FBF7EE] transition-colors cursor-pointer text-charcoal-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            <button className="w-8 h-8 rounded-full border border-charcoal-900/10 flex items-center justify-center hover:bg-charcoal-900 hover:text-[#FBF7EE] transition-colors cursor-pointer text-charcoal-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </button>
            <button className="w-8 h-8 rounded-full border border-charcoal-900/10 flex items-center justify-center hover:bg-charcoal-900 hover:text-[#FBF7EE] transition-colors cursor-pointer text-charcoal-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Image */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="relative w-full h-[400px] md:h-[600px] rounded-[24px] overflow-hidden bg-cream-200">
          {post.coverImage && (
            <img 
              src={post.coverImage} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-16">
        
        {/* Main Content */}
        <div className="lg:w-[70%]">
          <div className="prose prose-lg max-w-none text-charcoal-800 leading-relaxed font-sans">
            {paragraphs.length > 0 ? (
              paragraphs.map((para, idx) => {
                // If it's a quote in the content
                if (para.startsWith(">")) {
                  return (
                    <div key={idx} className="py-12 border-y border-charcoal-900/10 my-16 text-center">
                      <p className="font-serif text-[28px] md:text-[36px] font-bold text-charcoal-900 leading-tight italic">
                        {para.replace(/^>\s*/, "")}
                      </p>
                    </div>
                  );
                }
                
                // Show callouts occasionally
                const showCallout = idx === 2;
                
                return (
                  <div key={idx}>
                    {idx < 3 ? renderParagraphWithDropcap(para, idx) : <p className="mb-8">{para}</p>}
                    
                    {showCallout && (
                      <div className="border-t border-charcoal-900/10 pt-6 mb-12 mt-12">
                        <span className="text-[10px] font-bold tracking-widest text-mustard-500 uppercase block mb-2">EXPLORE LOCAL GUIDES</span>
                        <p className="text-sm font-bold text-charcoal-900">
                          The Long Way Guide <span className="mx-2 text-coral-500">→</span> Read related guides for hotel lists, neighborhood maps, and booking advice.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p>No content provided for this blog post.</p>
            )}

            {/* Bottom Social Icons */}
            <div className="flex flex-col items-center justify-center border-t border-charcoal-900/10 pt-12 pb-16">
              <span className="text-[10px] font-bold tracking-widest text-mustard-500 uppercase block mb-6">SHARE THIS STORY</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border border-charcoal-900/20 flex items-center justify-center hover:bg-white transition-colors cursor-pointer">
                    <div className="w-2 h-2 bg-charcoal-900/60 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-[30%]">
          <div className="sticky top-32">
            <div className="border border-charcoal-900/10 bg-white rounded-[20px] p-6 shadow-sm">
              <span className="text-[10px] font-bold tracking-widest text-mustard-500 uppercase block mb-6">LATEST POSTS</span>
              
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-3 custom-sidebar-scroll">
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
                  }
                `}</style>
                
                {latestPosts.map((latest) => (
                  <Link href={`/blog/${latest.slug}`} key={latest.id} className="group block border-b border-charcoal-900/5 pb-6 last:border-b-0 last:pb-0">
                    <div className="w-full h-[120px] rounded-[12px] overflow-hidden mb-4 bg-cream-200">
                      {latest.coverImage && (
                        <img 
                          src={latest.coverImage} 
                          alt={latest.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-charcoal-400 block mb-2">
                      {latest.destination}
                    </span>
                    <h4 className="font-serif text-[18px] font-bold text-charcoal-900 leading-tight mb-4 group-hover:text-coral-500 transition-colors">
                      {latest.title}
                    </h4>
                    <div className="inline-block bg-mustard-500 text-charcoal-900 px-5 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase hover:bg-mustard-600 transition-colors">
                      READ MORE
                    </div>
                  </Link>
                ))}
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
                      <img 
                        src={related.coverImage} 
                        alt={related.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
