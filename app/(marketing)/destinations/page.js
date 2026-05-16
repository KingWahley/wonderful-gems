import Link from "next/link";
import { destinations } from "@/data/mockData";
import { Search } from "lucide-react";

export default function DestinationsPage() {
  return (
    <div className="pt-24 pb-20 bg-cream-100 min-h-screen">
      {/* Page Header */}
      <div className="bg-charcoal-900 text-white py-20 mb-16 mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-serif mb-6">Destinations</h1>
          <p className="text-cream-100/80 max-w-2xl mx-auto text-lg font-light">
            Explore our curated collection of the world's most extraordinary locations, from the Amalfi Coast to the temples of Kyoto.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <button className="px-6 py-2 bg-charcoal-900 text-white text-sm tracking-widest uppercase whitespace-nowrap">All</button>
            <button className="px-6 py-2 border border-charcoal-900 text-charcoal-900 hover:bg-charcoal-900 hover:text-white transition-colors text-sm tracking-widest uppercase whitespace-nowrap">Europe</button>
            <button className="px-6 py-2 border border-charcoal-900 text-charcoal-900 hover:bg-charcoal-900 hover:text-white transition-colors text-sm tracking-widest uppercase whitespace-nowrap">Asia</button>
            <button className="px-6 py-2 border border-charcoal-900 text-charcoal-900 hover:bg-charcoal-900 hover:text-white transition-colors text-sm tracking-widest uppercase whitespace-nowrap">Americas</button>
          </div>
          
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search destinations..." 
              className="w-full border-b border-charcoal-900 py-2 pl-8 focus:outline-none bg-transparent"
            />
            <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 text-charcoal-900/50" size={18} />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((dest) => (
            <Link key={dest.id} href={`/destinations/${dest.slug}`} className="group block">
              <div className="relative h-[500px] w-full overflow-hidden mb-6 rounded-sm">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                  style={{ backgroundImage: `url(${dest.coverImage})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-charcoal-900/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <span className="text-gold-500 text-xs tracking-widest uppercase mb-2 block">{dest.region}</span>
                  <h3 className="text-white font-serif text-4xl mb-4">{dest.country}</h3>
                  <div className="flex gap-4 text-cream-100/70 text-sm tracking-wide uppercase">
                    <span>{dest.blogsCount} Stories</span>
                    <span>•</span>
                    <span>{dest.toursCount} Tours</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
