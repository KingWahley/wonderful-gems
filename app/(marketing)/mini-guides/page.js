import Link from "next/link";
import { miniGuides } from "@/data/mockData";

export default function MiniGuidesPage() {
  const pocketGuides = miniGuides.filter(g => g.type === "pocket");
  const itineraryGuides = miniGuides.filter(g => g.type === "itinerary");

  return (
    <div className="pt-32 pb-24 bg-cream-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Pocket Guides */}
        <div className="mb-24">
          <div className="mb-12">
            <div className="text-mustard-500 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <span>⚡</span> POCKET GUIDES
            </div>
            <h1 className="text-5xl md:text-6xl font-serif text-charcoal-900 mb-6">Mini Travel Guides</h1>
            <p className="text-charcoal-900/80 text-lg md:text-xl font-light max-w-3xl">
              Where to stay, what to eat, top sights, day trips — the practical pocket version of every destination, separate from the long reads.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pocketGuides.map((guide) => (
              <div key={guide.id} className="bg-white rounded-[20px] overflow-hidden group flex flex-col border border-charcoal-900/5 shadow-sm">
                <div className="relative h-56 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${guide.heroImage})` }}
                  ></div>
                  <div className="absolute top-5 left-5">
                    <span className="bg-mustard-500 text-charcoal-900 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <span>⚡</span> MINI GUIDE
                    </span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <span className="text-charcoal-900/50 font-bold text-[10px] tracking-[0.2em] uppercase mb-3 block">
                    <span className="font-serif text-charcoal-900 mr-1">{guide.countryCode}</span> {guide.destination}
                  </span>
                  <h3 className="font-serif text-2xl text-charcoal-900 mb-4">{guide.title}</h3>
                  <p className="text-charcoal-900/70 text-sm mb-6 line-clamp-3 leading-relaxed font-light">{guide.excerpt}</p>
                  <div className="mt-auto">
                    <Link href={`/mini-guides/${guide.slug}`} className="text-coral-500 text-[11px] font-bold uppercase tracking-widest hover:text-coral-600 transition-colors flex items-center gap-2">
                      Open the guide <span className="text-lg leading-none">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Itinerary Guides */}
        <div>
          <div className="mb-12">
            <div className="text-mustard-500 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <span>🗓️</span> ITINERARY MINI GUIDES
            </div>
            <h2 className="text-5xl md:text-6xl font-serif text-charcoal-900 mb-6">Day-by-day itineraries</h2>
            <p className="text-charcoal-900/80 text-lg md:text-xl font-light max-w-3xl">
              Step-by-step routes you can copy — where to stay each night and how to move between bases.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {itineraryGuides.map((guide) => (
              <div key={guide.id} className="bg-white rounded-[20px] overflow-hidden group flex flex-col border border-charcoal-900/5 shadow-sm">
                <div className="relative h-56 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${guide.heroImage})` }}
                  ></div>
                  <div className="absolute top-5 left-5">
                    <span className="bg-white text-charcoal-900 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                      <span className="font-serif mr-0.5">{guide.countryCode}</span> {guide.destination}
                    </span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <span className="text-charcoal-900/50 font-bold text-[10px] tracking-[0.2em] uppercase mb-4 block leading-relaxed">
                    {guide.excerpt}
                  </span>
                  <h3 className="font-serif text-2xl text-charcoal-900 mb-6">{guide.title}</h3>
                  <div className="mt-auto">
                    <Link href={`/mini-guides/${guide.slug}`} className="text-coral-500 text-[11px] font-bold uppercase tracking-widest hover:text-coral-600 transition-colors flex items-center gap-2">
                      Read the story <span className="text-lg leading-none">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

