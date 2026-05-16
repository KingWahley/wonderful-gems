import Link from "next/link";
import { miniGuides } from "@/data/mockData";

export default function MiniGuidesPage() {
  const pocketGuides = miniGuides.filter(g => g.type === "pocket");
  const itineraryGuides = miniGuides.filter(g => g.type === "itinerary");

  return (
    <div className="pt-24 pb-20 bg-cream-100 min-h-screen">
      <div className="bg-charcoal-900 text-white py-20 mb-16 mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold-500 uppercase tracking-widest text-xs font-semibold mb-3 block">Downloads</span>
          <h1 className="text-5xl md:text-6xl font-serif mb-6">Mini Guides</h1>
          <p className="text-cream-100/80 max-w-2xl mx-auto text-lg font-light">
            Bite-sized, highly curated pocket guides and itineraries for the independent traveler.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Pocket Guides */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-10 border-b border-charcoal-900/10 pb-4">
            <h2 className="text-3xl font-serif text-charcoal-900">Pocket Guides</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pocketGuides.map((guide) => (
              <Link key={guide.id} href={`/mini-guides/${guide.slug}`} className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${guide.heroImage})` }}
                  ></div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-xs tracking-widest uppercase font-semibold">{guide.city}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-lg text-charcoal-900 mb-2">{guide.title}</h3>
                  <p className="text-charcoal-800/70 text-sm mb-4 line-clamp-2">{guide.shortDescription}</p>
                  <div className="flex justify-between items-center text-xs text-charcoal-800/50 uppercase tracking-wider">
                    <span>{guide.idealDuration}</span>
                    <span>{guide.budgetLevel}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Itinerary Guides */}
        <div>
          <div className="flex items-center justify-between mb-10 border-b border-charcoal-900/10 pb-4">
            <h2 className="text-3xl font-serif text-charcoal-900">Itinerary Guides</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {itineraryGuides.map((guide) => (
              <Link key={guide.id} href={`/mini-guides/${guide.slug}`} className="group flex flex-col sm:flex-row bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                <div className="sm:w-2/5 relative h-48 sm:h-auto overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${guide.heroImage})` }}
                  ></div>
                </div>
                <div className="sm:w-3/5 p-6 md:p-8 flex flex-col justify-center">
                  <span className="text-gold-600 text-xs tracking-widest uppercase mb-2 block">{guide.destination}</span>
                  <h3 className="font-serif text-2xl text-charcoal-900 mb-3">{guide.title}</h3>
                  <p className="text-charcoal-800/70 text-sm mb-4 line-clamp-2">{guide.excerpt}</p>
                  <div className="mt-auto flex items-center gap-4 text-xs text-charcoal-800/50 uppercase tracking-wider">
                    <span>{guide.numberOfDays} Days</span>
                    <span>•</span>
                    <span>{guide.travelType}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
