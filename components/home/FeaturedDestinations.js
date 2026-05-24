import Link from "next/link";
import Image from "next/image";

export default function FeaturedDestinations({ destinations = [], settings = {} }) {
  if (!destinations || destinations.length === 0) return null;
  return (
    <section className="py-20 lg:py-28 bg-mustard-500 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-12">
          {settings?.badge && (
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-white/20 mb-4 bg-white/10">
              <span className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">
                {settings.badge}
              </span>
            </div>
          )}
          <h2 className="text-4xl md:text-[56px] font-serif font-bold text-white mb-4 tracking-tight leading-tight">
            {settings?.title || "Explore by Destination"}
          </h2>
          <p className="text-white/90 font-sans font-medium text-[14px] md:text-[15px] tracking-wide">
            Tap a country to see every post and guide from there.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
          {destinations.slice(0, 5).map((dest, index) => (
            <div key={dest.id} className="group flex flex-col items-center">
              <Link href={`/destinations/${dest.slug}`} className="w-full relative block">
                <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden mb-5 border-[1.5px] border-white/40 shadow-xl group-hover:-translate-y-1 transition-transform duration-300">
                  <Image 
                    src={dest.coverImage}
                    alt={dest.country}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-white text-charcoal-900 rounded-full w-8 h-8 flex items-center justify-center text-[9px] font-bold shadow-sm">
                    {dest.code}
                  </div>
                </div>
                
                {/* Left Arrow for first item */}
                {index === 0 && (
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#fdfbf7] rounded-full flex items-center justify-center text-charcoal-900 shadow-md z-10 pointer-events-none mt-[-10px]">
                    <span className="font-serif italic text-sm opacity-60 ml-[-2px]">&larr;</span>
                  </div>
                )}
                
                {/* Right Arrow for last item */}
                {index === 4 && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#fdfbf7] rounded-full flex items-center justify-center text-charcoal-900 shadow-md z-10 pointer-events-none mt-[-10px]">
                    <span className="font-serif italic text-sm opacity-60 mr-[-2px]">&rarr;</span>
                  </div>
                )}
              </Link>
              
              <h3 className="text-[28px] font-serif font-bold text-white mb-1">
                {dest.country}
              </h3>
              <span className="text-[10px] tracking-[0.15em] uppercase text-white/90 font-bold">
                {dest.blogsCount} {dest.blogsCount === 1 ? 'POST' : 'POSTS'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
