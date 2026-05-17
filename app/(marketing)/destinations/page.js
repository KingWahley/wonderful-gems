import Link from "next/link";
import { destinations } from "@/data/mockData";

export default function DestinationsPage() {
  return (
    <div className="pt-32 pb-24 bg-cream-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 mt-8">
          <div className="flex items-center gap-1.5 mb-4">
            <span className="text-[10px] tracking-[0.2em] font-bold text-mustard-500 uppercase">The Index</span>
            <div className="w-2 h-2 bg-mustard-500"></div>
          </div>
          <h1 className="text-[50px] md:text-[56px] font-serif font-bold text-charcoal-900 leading-none mb-4">
            Destinations
          </h1>
          <p className="text-charcoal-800/80 max-w-xl text-[14px] font-medium leading-relaxed">
            Pick a country to see what I loved about it, my highlights, and every post from there. ✨
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {destinations.map((dest) => (
            <Link key={dest.id} href={`/destinations/${dest.slug}`} className="group block bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100/50">
              
              {/* Image Container */}
              <div className="relative h-[220px] md:h-[240px] w-full overflow-hidden">
                <img 
                  src={dest.coverImage} 
                  alt={dest.country}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Pill */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <span className="text-[9px] font-bold tracking-widest uppercase text-charcoal-900">{dest.code}</span>
                  <span className="text-[9px] font-bold tracking-widest uppercase text-charcoal-900">{dest.country}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8">
                <span className="text-charcoal-400 text-[10px] tracking-[0.2em] uppercase font-bold mb-3 block">
                  {dest.blogsCount} {dest.blogsCount === 1 ? 'POST' : 'POSTS'}
                </span>
                
                <h3 className="font-serif text-[24px] font-bold text-charcoal-900 mb-3">
                  {dest.country}
                </h3>
                
                <p className="text-charcoal-800/70 text-[13px] leading-relaxed mb-6 line-clamp-2">
                  {dest.excerpt}
                </p>
                
                <div className="flex items-center text-coral-500 text-[11px] font-bold uppercase tracking-wider group-hover:text-coral-600 transition-colors">
                  See posts <span className="ml-1 text-lg leading-none">→</span>
                </div>
              </div>

            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
