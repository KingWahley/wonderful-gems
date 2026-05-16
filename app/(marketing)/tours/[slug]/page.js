import { tours } from "@/data/mockData";
import { Check } from "lucide-react";

export default async function TourDetails({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const tour = tours.find(t => t.slug === resolvedParams.slug) || tours[0];

  return (
    <div className="bg-cream-100 min-h-screen">
      {/* Hero */}
      <div className="relative h-[70vh] min-h-[500px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${tour.heroImage})` }}
        ></div>
        <div className="absolute inset-0 bg-charcoal-900/50"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto mt-16">
          <span className="bg-gold-500 text-white px-4 py-1 text-xs tracking-widest uppercase mb-6 font-semibold">
            {tour.duration} • {tour.destination}
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">{tour.title}</h1>
          <p className="text-xl text-cream-100/90 font-light max-w-2xl">{tour.shortDescription}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-serif text-charcoal-900 mb-6">Overview</h2>
            <p className="text-charcoal-800/80 font-light leading-relaxed text-lg mb-12">
              {tour.description}
            </p>
            
            <h2 className="text-3xl font-serif text-charcoal-900 mb-6">What's Included</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              {tour.included.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Check className="text-gold-500 flex-shrink-0" size={20} />
                  <span className="text-charcoal-800/80 font-light">{item}</span>
                </div>
              ))}
            </div>
            
            {/* Gallery placeholder */}
            <div className="grid grid-cols-2 gap-4">
               {tour.gallery.map((img, idx) => (
                 <div key={idx} className="aspect-[4/3] bg-cover bg-center rounded-sm shadow-sm" style={{backgroundImage: `url(${img})`}}></div>
               ))}
               <div className="aspect-[4/3] bg-cover bg-center rounded-sm shadow-sm" style={{backgroundImage: `url(${tour.heroImage})`}}></div>
            </div>
          </div>
          
          {/* Sidebar Booking Box */}
          <div>
            <div className="bg-white p-8 rounded-xl shadow-lg sticky top-32 border border-cream-200">
              <div className="text-center mb-8 border-b border-cream-200 pb-6">
                <span className="block text-xs uppercase tracking-widest text-charcoal-800/60 mb-2">Starting From</span>
                <div className="text-4xl font-serif text-charcoal-900">{tour.price}</div>
              </div>
              
              <div className="mb-8">
                <span className="block text-xs uppercase tracking-widest text-charcoal-800/60 mb-2">Availability</span>
                <div className="text-charcoal-900 font-medium">{tour.availability}</div>
              </div>
              
              <button className="btn-primary w-full text-center">
                Inquire About This Tour
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
