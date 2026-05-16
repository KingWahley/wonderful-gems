import Link from "next/link";
import { destinations } from "@/data/mockData";
import { ArrowRight } from "lucide-react";

export default function FeaturedDestinations() {
  return (
    <section className="py-24 bg-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div className="max-w-2xl">
            <span className="text-gold-600 uppercase tracking-widest text-xs font-semibold mb-3 block">Discover</span>
            <h2 className="text-4xl md:text-5xl font-serif text-charcoal-900 mb-4">Featured Destinations</h2>
            <p className="text-charcoal-800/70">Explore our handpicked selection of the world's most captivating locations, where luxury meets authentic cultural experiences.</p>
          </div>
          <Link href="/destinations" className="hidden md:flex items-center gap-2 text-sm tracking-widest uppercase text-charcoal-900 hover:text-gold-600 transition-colors border-b border-charcoal-900 hover:border-gold-600 pb-1">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.slice(0, 3).map((dest) => (
            <Link key={dest.id} href={`/destinations/${dest.slug}`} className="group block h-full">
              <div className="relative h-[450px] w-full overflow-hidden mb-6">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${dest.coverImage})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-charcoal-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="text-white/80 text-xs tracking-widest uppercase mb-2 block">{dest.region}</span>
                  <h3 className="text-white font-serif text-3xl mb-2">{dest.country}</h3>
                </div>
              </div>
              <div>
                <p className="text-charcoal-800/80 line-clamp-2 mb-4 font-light leading-relaxed">
                  {dest.description}
                </p>
                <span className="text-gold-600 text-sm tracking-wide uppercase flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
                  Explore {dest.country} <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-12 text-center md:hidden">
          <Link href="/destinations" className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-charcoal-900 border-b border-charcoal-900 pb-1">
            View All Destinations <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
