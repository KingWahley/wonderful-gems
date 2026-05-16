import Link from "next/link";
import { tours } from "@/data/mockData";
import { Clock, MapPin, Check } from "lucide-react";

export default function ToursPage() {
  return (
    <div className="pt-24 pb-20 bg-cream-100 min-h-screen">
      <div className="bg-charcoal-900 text-white py-20 mb-16 mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold-500 uppercase tracking-widest text-xs font-semibold mb-3 block">Experiences</span>
          <h1 className="text-5xl md:text-6xl font-serif mb-6">Tours & Activities</h1>
          <p className="text-cream-100/80 max-w-2xl mx-auto text-lg font-light">
            Exclusive, privately guided journeys that immerse you in the authentic culture, cuisine, and beauty of our favorite destinations.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {tours.map((tour) => (
            <div key={tour.id} className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col lg:flex-row group">
              <div className="lg:w-2/5 relative h-80 lg:h-auto overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${tour.heroImage})` }}
                ></div>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 text-xs tracking-widest uppercase font-semibold text-charcoal-900">
                  {tour.destination}
                </div>
              </div>
              <div className="lg:w-3/5 p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex gap-6 mb-4 text-xs tracking-widest uppercase text-charcoal-800/60">
                  <span className="flex items-center gap-1"><Clock size={14} /> {tour.duration}</span>
                  <span className="flex items-center gap-1"><MapPin size={14} /> {tour.destination}</span>
                </div>
                <h2 className="text-3xl font-serif text-charcoal-900 mb-4 group-hover:text-gold-600 transition-colors">
                  {tour.title}
                </h2>
                <p className="text-charcoal-800/70 mb-6 font-light leading-relaxed">
                  {tour.description}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {tour.included.slice(0, 4).map((inc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-charcoal-800/80">
                      <Check size={16} className="text-gold-500" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-cream-200">
                  <div className="text-2xl font-serif text-charcoal-900 mb-4 sm:mb-0">
                    {tour.price}
                  </div>
                  <Link href={`/tours/${tour.slug}`} className="btn-primary w-full sm:w-auto text-center">
                    View Itinerary
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
