import { fetchTours } from "@/lib/db";
import { Check } from "lucide-react";
import { notFound } from "next/navigation";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const toursList = await fetchTours();
    return toursList
      .filter((tour) => (tour.status || "published").toLowerCase() === "published")
      .map((tour) => ({
        slug: tour.slug || tour.id,
      }));
  } catch (e) {
    return [];
  }
}

export default async function TourDetails({ params }) {
  const resolvedParams = await Promise.resolve(params);
  
  let toursList = [];
  try {
    toursList = await fetchTours() || [];
  } catch (error) {
    console.error("Error fetching tour details from Supabase:", error);
  }
  
  const tour = toursList.find(t => t.slug === resolvedParams.slug) 
    || toursList.find(t => t.id === resolvedParams.slug);

  if (!tour || (tour.status || "published").toLowerCase() !== "published") {
    notFound();
  }
  
  const duration = tour.duration || tour.details || "";
  const heroImg = tour.heroImage || "";
  const shortDesc = tour.shortDescription || (tour.description ? (tour.description.slice(0, 120) + "...") : "");
  const price = tour.price || "";
  const availability = tour.availability || "";
  
  const includedItems = tour.included || [];
  const galleryImages = tour.gallery || [];

  return (
    <div className="bg-cream-100 min-h-screen">
      {/* Hero */}
      <div className="relative h-[70vh] min-h-[500px]">
        {heroImg ? (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImg})` }}
          ></div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-charcoal-800 to-charcoal-950"></div>
        )}
        <div className="absolute inset-0 bg-charcoal-900/50"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto mt-16">
          {(duration || tour.destination) && (
            <span className="bg-mustard-500 text-white px-4 py-1 text-xs tracking-widest uppercase mb-6 font-semibold rounded-full shadow-sm">
              {[duration, tour.destination].filter(Boolean).join(" • ")}
            </span>
          )}
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight tracking-tight">{tour.title}</h1>
          {shortDesc && <p className="text-xl text-cream-100/90 font-light max-w-2xl leading-relaxed">{shortDesc}</p>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {tour.description && (
              <>
                <h2 className="text-3xl font-serif text-charcoal-900 mb-6">Overview</h2>
                <p className="text-charcoal-800/80 font-light leading-relaxed text-lg mb-12">
                  {tour.description}
                </p>
              </>
            )}
            
            {includedItems && includedItems.length > 0 && (
              <>
                <h2 className="text-3xl font-serif text-charcoal-900 mb-6">What's Included</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                  {includedItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Check className="text-mustard-500 flex-shrink-0" size={20} />
                      <span className="text-charcoal-800/80 font-light">{item}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {/* Gallery Section */}
            {galleryImages && galleryImages.length > 0 && (
              <>
                <h2 className="text-3xl font-serif text-charcoal-900 mb-6">Gallery</h2>
                <div className="grid grid-cols-2 gap-4">
                   {galleryImages.map((img, idx) => (
                     <div key={idx} className="aspect-[4/3] bg-cover bg-center rounded-xl shadow-sm transition-transform duration-500 hover:scale-[1.01]" style={{backgroundImage: `url(${img})`}}></div>
                   ))}
                   {heroImg && (
                     <div className="aspect-[4/3] bg-cover bg-center rounded-xl shadow-sm transition-transform duration-500 hover:scale-[1.01]" style={{backgroundImage: `url(${heroImg})`}}></div>
                   )}
                </div>
              </>
            )}
          </div>
          
          {/* Sidebar Booking Box */}
          <div>
            <div className="bg-white p-8 rounded-[24px] shadow-lg sticky top-32 border border-cream-200">
              {price && (
                <div className="text-center mb-8 border-b border-cream-200 pb-6">
                  <span className="block text-xs uppercase tracking-widest text-charcoal-800/60 mb-2">Starting From</span>
                  <div className="text-4xl font-serif text-charcoal-900 font-bold">{price}</div>
                </div>
              )}
              
              {availability && (
                <div className="mb-8">
                  <span className="block text-xs uppercase tracking-widest text-charcoal-800/60 mb-2">Availability</span>
                  <div className="text-charcoal-900 font-semibold">{availability}</div>
                </div>
              )}
              
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
