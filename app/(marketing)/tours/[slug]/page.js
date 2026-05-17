import { tours } from "@/data/mockData";
import { Check } from "lucide-react";

export async function generateStaticParams() {
  return tours.map((tour) => ({
    slug: tour.slug || tour.id,
  }));
}

export default async function TourDetails({ params }) {
  const resolvedParams = await Promise.resolve(params);
  
  // Resilient lookup checking slug first, then fallback to ID, and finally defaulting to the first tour
  const tour = tours.find(t => t.slug === resolvedParams.slug) 
    || tours.find(t => t.id === resolvedParams.slug) 
    || tours[0];

  // Robust fallback values for undefined mock data properties to guarantee zero runtime failures
  const duration = tour.duration || tour.details || "3 Hours";
  const heroImg = tour.heroImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2000&auto=format&fit=crop";
  const shortDesc = tour.shortDescription || tour.description?.slice(0, 120) + "..." || "A curated travel experience guided by local specialists.";
  const price = tour.price || "$85 per person";
  const availability = tour.availability || "Flexible departures daily";
  
  const includedItems = tour.included || [
    "Certified bilingual professional guide",
    "Priority entry tickets (Skip-the-line)",
    "Bottled spring water and traditional snacks",
    "Customizable duration & speed options",
    "Exclusive curated recommendations guide map"
  ];

  const galleryImages = tour.gallery || [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop"
  ];

  return (
    <div className="bg-cream-100 min-h-screen">
      {/* Hero */}
      <div className="relative h-[70vh] min-h-[500px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImg})` }}
        ></div>
        <div className="absolute inset-0 bg-charcoal-900/50"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto mt-16">
          <span className="bg-mustard-500 text-white px-4 py-1 text-xs tracking-widest uppercase mb-6 font-semibold rounded-full shadow-sm">
            {duration} • {tour.destination}
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight tracking-tight">{tour.title}</h1>
          <p className="text-xl text-cream-100/90 font-light max-w-2xl leading-relaxed">{shortDesc}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-serif text-charcoal-900 mb-6">Overview</h2>
            <p className="text-charcoal-800/80 font-light leading-relaxed text-lg mb-12">
              {tour.description || "Embark on an exceptional journey tailored to reveal authentic local life, hidden details, and historical perspectives often missed by generic sightseeing groups."}
            </p>
            
            <h2 className="text-3xl font-serif text-charcoal-900 mb-6">What's Included</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              {includedItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Check className="text-mustard-500 flex-shrink-0" size={20} />
                  <span className="text-charcoal-800/80 font-light">{item}</span>
                </div>
              ))}
            </div>
            
            {/* Gallery Section */}
            <h2 className="text-3xl font-serif text-charcoal-900 mb-6">Gallery</h2>
            <div className="grid grid-cols-2 gap-4">
               {galleryImages.map((img, idx) => (
                 <div key={idx} className="aspect-[4/3] bg-cover bg-center rounded-xl shadow-sm transition-transform duration-500 hover:scale-[1.01]" style={{backgroundImage: `url(${img})`}}></div>
               ))}
               <div className="aspect-[4/3] bg-cover bg-center rounded-xl shadow-sm transition-transform duration-500 hover:scale-[1.01]" style={{backgroundImage: `url(${heroImg})`}}></div>
            </div>
          </div>
          
          {/* Sidebar Booking Box */}
          <div>
            <div className="bg-white p-8 rounded-[24px] shadow-lg sticky top-32 border border-cream-200">
              <div className="text-center mb-8 border-b border-cream-200 pb-6">
                <span className="block text-xs uppercase tracking-widest text-charcoal-800/60 mb-2">Starting From</span>
                <div className="text-4xl font-serif text-charcoal-900 font-bold">{price}</div>
              </div>
              
              <div className="mb-8">
                <span className="block text-xs uppercase tracking-widest text-charcoal-800/60 mb-2">Availability</span>
                <div className="text-charcoal-900 font-semibold">{availability}</div>
              </div>
              
              <button className="bg-mustard-500 hover:bg-mustard-600 text-white rounded-full py-3.5 w-full text-center text-[11px] font-bold tracking-[0.1em] uppercase transition-colors shadow-sm">
                Inquire About This Tour
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
