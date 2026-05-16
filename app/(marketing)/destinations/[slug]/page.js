import { destinations, blogPosts, tours } from "@/data/mockData";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function DestinationDetails({ params }) {
  // Using Promise.resolve to mock asynchronous param resolution in next13+ (or next15 async params)
  const resolvedParams = await Promise.resolve(params);
  const destination = destinations.find(d => d.slug === resolvedParams.slug) || destinations[0];
  
  const relatedBlogs = blogPosts.filter(b => b.destination === destination.country);
  const relatedTours = tours.filter(t => t.destination === destination.country);

  return (
    <div className="bg-cream-100 min-h-screen">
      {/* Hero */}
      <div className="relative h-[70vh] min-h-[500px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${destination.coverImage})` }}
        ></div>
        <div className="absolute inset-0 bg-charcoal-900/40"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="text-gold-500 uppercase tracking-[0.3em] text-sm mb-6 font-medium">{destination.region}</span>
          <h1 className="text-6xl md:text-8xl font-serif text-white mb-6">{destination.country}</h1>
        </div>
      </div>

      {/* About */}
      <div className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-2xl font-serif text-charcoal-900 mb-12 leading-relaxed">
            "{destination.whyILoveIt}"
          </p>
          <div className="h-px w-24 bg-gold-500 mx-auto mb-12"></div>
          <p className="text-charcoal-800/80 font-light leading-relaxed text-lg">
            {destination.description}
          </p>
        </div>
      </div>

      {/* Favorite Moments */}
      <div className="py-24 bg-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-charcoal-900">Favorite Moments</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {destination.moments.map((moment, idx) => (
              <div key={idx} className="bg-white p-8 text-center shadow-sm">
                <span className="text-gold-500 font-serif text-4xl mb-4 block">0{idx + 1}</span>
                <p className="text-charcoal-900 font-light">{moment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {destination.gallery.map((img, idx) => (
              <div key={idx} className={`relative overflow-hidden ${idx === 0 ? 'md:col-span-2 md:row-span-2 aspect-square md:aspect-auto' : 'aspect-square'}`}>
                <div 
                  className="absolute inset-0 bg-cover bg-center hover:scale-105 transition-transform duration-700"
                  style={{ backgroundImage: `url(${img})` }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
