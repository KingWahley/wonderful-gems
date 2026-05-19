import Link from "next/link";
import Image from "next/image";

export default function FreshOffTheRoad({ miniGuides = [] }) {
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

  // Filter to show ONLY itineraries (type === 'itinerary')
  const itineraries = miniGuides.filter((guide) => guide.type === "itinerary");

  return (
    <section className="py-20 lg:py-28 bg-cream-100">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-[56px] font-serif text-charcoal-900 mb-4 tracking-tight leading-tight font-bold">
            Fresh <span className="text-coral-500 uppercase">OFF THE ROAD</span>
          </h2>
          <p className="text-charcoal-800/80 font-medium text-[14px] md:text-[15px] tracking-wide">
            Detailed, slow-travel itineraries to guide your next great journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {itineraries.map((guide) => {
            // Use itineraryTitle for itineraries (fallback to custom template tag)
            const itineraryTag = guide.details?.itineraryTitle || `${guide.destination?.toUpperCase()} ITINERARY`;
            const formattedTitle = formatTitle(guide.title);

            return (
              <article 
                key={guide.id} 
                className="group flex flex-col h-full bg-white rounded-[24px] overflow-hidden border border-[#F0E6D2] shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 ease-out"
              >
                <Link href={`/mini-guides/${guide.slug}`} className="block relative aspect-[4/3] w-full overflow-hidden">
                  <Image 
                    src={guide.heroImage || guide.hero_image}
                    alt={guide.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {guide.destination && (
                    <div className="absolute top-6 left-6 bg-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)] z-10">
                      <span className="text-[10px] font-bold text-charcoal-400 lowercase tracking-wider font-sans leading-none">
                        {guide.countryCode?.toLowerCase() || guide.country_code?.toLowerCase() || 'jp'}
                      </span>
                      <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-charcoal-900 font-sans leading-none">
                        {guide.destination}
                      </span>
                    </div>
                  )}
                </Link>
                
                <div className="flex-grow flex flex-col items-center text-center pt-5 pb-5 px-5">
                  {itineraryTag && (
                    <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#64748B] uppercase mb-2 leading-none">
                      {itineraryTag}
                    </span>
                  )}
                  
                  <h3 className="text-lg md:text-[21px] font-serif text-charcoal-900 mb-4 leading-snug font-bold max-w-[92%] hover:text-coral-500 transition-colors">
                    <Link href={`/mini-guides/${guide.slug}`}>{formattedTitle}</Link>
                  </h3>
                  
                  <Link 
                    href={`/mini-guides/${guide.slug}`} 
                    className="text-[12px] font-sans font-bold text-coral-500 hover:text-coral-600 transition-colors mt-auto flex items-center justify-center gap-1.5 group/link"
                  >
                    Open the itinerary <span className="transition-transform duration-300 group-hover/link:translate-x-1 font-sans text-xs leading-none">&rarr;</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Link href="/mini-guides" className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-[11px] font-bold tracking-[0.15em] uppercase border border-charcoal-900 text-charcoal-900 hover:bg-charcoal-900 hover:text-white transition-colors">
            EXPLORE ITINERARIES
          </Link>
        </div>
      </div>
    </section>
  );
}
