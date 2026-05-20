import Link from "next/link";
import Image from "next/image";

export default function FeaturedBlogs({ blogs = [] }) {
  if (!blogs || blogs.length === 0) return null;
  // Helper to format category/date exactly like mockup (e.g. CULTURE • KYOTO • APR 2025 -> KYOTO • APRIL 2025)
  const formatCategory = (category, fallback) => {
    if (!category) return fallback || "";
    const parts = category.split("•").map(p => p.trim());
    if (parts.length >= 3) {
      const destination = parts[1];
      let datePart = parts[2];
      
      // Expand month abbreviation
      if (datePart.includes("APR")) datePart = datePart.replace("APR", "APRIL");
      if (datePart.includes("SEP")) datePart = datePart.replace("SEP", "SEPTEMBER");
      if (datePart.includes("MAY")) datePart = datePart.replace("MAY", "MAY");
      if (datePart.includes("JAN")) datePart = datePart.replace("JAN", "JANUARY");
      if (datePart.includes("FEB")) datePart = datePart.replace("FEB", "FEBRUARY");
      if (datePart.includes("MAR")) datePart = datePart.replace("MAR", "MARCH");
      if (datePart.includes("JUN")) datePart = datePart.replace("JUN", "JUNE");
      if (datePart.includes("JUL")) datePart = datePart.replace("JUL", "JULY");
      if (datePart.includes("AUG")) datePart = datePart.replace("AUG", "AUGUST");
      if (datePart.includes("OCT")) datePart = datePart.replace("OCT", "OCTOBER");
      if (datePart.includes("NOV")) datePart = datePart.replace("NOV", "NOVEMBER");
      if (datePart.includes("DEC")) datePart = datePart.replace("DEC", "DECEMBER");
      
      return `${destination} • ${datePart}`;
    }
    return category;
  };

  // Helper to format title beautifully with lowercase prepositions
  const formatTitle = (title) => {
    if (!title) return "";
    return title
      .replace(/\bIn\b/g, 'in')
      .replace(/\bOf\b/g, 'of')
      .replace(/\bAt\b/g, 'at')
      .replace(/\bA\b/g, 'a')
      .replace(/\bThe\b/g, 'the')
      .replace(/\bFor\b/g, 'for')
      .replace(/\bWith\b/g, 'with');
  };

  return (
    <section className="py-20 lg:py-28 bg-cream-100">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-[56px] font-serif text-charcoal-900 mb-4 tracking-tight leading-tight">
            Most <span className="text-mustard-500 uppercase font-sans font-bold">POPULAR</span> Posts
          </h2>
          <p className="text-charcoal-800/70 font-light text-[15px] md:text-base tracking-wide">
            Sit-down stories from places worth going slowly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.slice(0, 3).map((post) => {
            const formattedCategory = formatCategory(post.category, post.date);
            const formattedTitle = formatTitle(post.title);
            
            return (
              <article 
                key={post.id} 
                className="group flex flex-col h-full bg-white rounded-[24px] overflow-hidden border border-[#F0E6D2] shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 ease-out"
              >
                <Link href={`/blog/${post.slug}`} className="block relative aspect-[4/3] w-full overflow-hidden">
                  <Image 
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {post.destination && (
                    <div className="absolute top-6 left-6 bg-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)] z-10">
                      <span className="text-[10px] font-bold text-charcoal-400 lowercase tracking-wider font-sans leading-none">
                        {post.countryCode?.toLowerCase() || 'jp'}
                      </span>
                      <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-charcoal-900 font-sans leading-none">
                        {post.destination}
                      </span>
                    </div>
                  )}
                </Link>
                
                <div className="flex-grow flex flex-col items-center text-center pt-5 pb-5 px-5">
                  {formattedCategory && (
                    <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#64748B] uppercase mb-2 leading-none">
                      {formattedCategory}
                    </span>
                  )}
                  
                  <h3 className="text-lg md:text-[21px] font-serif text-charcoal-900 mb-4 leading-snug font-bold max-w-[92%] hover:text-coral-500 transition-colors">
                    <Link href={`/blog/${post.slug}`}>{formattedTitle}</Link>
                  </h3>
                  
                  <Link 
                    href={`/blog/${post.slug}`} 
                    className="text-[12px] font-sans font-bold text-coral-500 hover:text-coral-600 transition-colors mt-auto flex items-center justify-center gap-1.5 group/link"
                  >
                    Read the story <span className="transition-transform duration-300 group-hover/link:translate-x-1 font-sans text-xs leading-none">&rarr;</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
