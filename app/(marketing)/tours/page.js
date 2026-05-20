import Link from "next/link";
import { fetchTours } from "@/lib/db";

export const revalidate = 0;

export default async function ToursPage() {
  let tours = [];
  try {
    const fetchedTours = await fetchTours() || [];
    tours = fetchedTours.filter(item => (item.status || "published").toLowerCase() === "published");
  } catch (error) {
    console.error("Error fetching tours from Supabase:", error);
  }

  // Group tours by destination
  const destinationsMap = tours.reduce((acc, tour) => {
    if (!acc[tour.destination]) {
      acc[tour.destination] = {
        name: tour.destination,
        code: tour.countryCode || "",
        count: 0,
        tours: []
      };
    }
    acc[tour.destination].count += 1;
    acc[tour.destination].tours.push(tour);
    return acc;
  }, {});

  // Convert to array and preserve original order of appearance
  const uniqueDestinations = Object.values(destinationsMap);

  return (
    <div className="pt-32 pb-24 bg-cream-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-12">
          <div className="text-mustard-500 text-[10px] font-bold uppercase tracking-widest mb-3">
            GETTING OUT THERE ☀️
          </div>
          <h1 className="text-5xl md:text-6xl font-serif text-charcoal-900 mb-6">Tours & activities</h1>
          <p className="text-charcoal-900/90 text-lg font-light max-w-2xl mb-2 leading-relaxed">
            Every guided experience I've actually done and would recommend — sorted by country so you can skip straight to the one you're planning. No accommodation here, just things to do. ✨
          </p>
          <p className="text-charcoal-900/50 text-[11px]">
            To read more long-form — check out the Blog or Destinations page.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-16">
          <button className="bg-white border border-charcoal-900/10 text-charcoal-900 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
            ALL ({tours.length})
          </button>
          {uniqueDestinations.map(dest => (
            <button key={dest.name} className="bg-white border border-charcoal-900/10 text-charcoal-900 hover:border-charcoal-900/30 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm transition-colors">
              {dest.name} ({dest.count})
            </button>
          ))}
        </div>

        {/* Grouped Content */}
        <div className="space-y-12">
          {uniqueDestinations.map(group => (
            <div key={group.name} className="border-t border-charcoal-900/10 pt-4">
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-3xl text-charcoal-900">
                  <span className="font-serif font-bold mr-2">{group.code}</span>
                  <span className="font-serif">{group.name}</span>
                </h2>
                <Link href={`/destinations/${group.name.toLowerCase()}`} className="text-coral-500 text-[10px] font-bold uppercase tracking-widest hover:text-coral-600 transition-colors">
                  Country page &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {group.tours.map(tour => (
                  <div key={tour.id} className="bg-white rounded-[20px] p-7 border border-charcoal-900/5 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
                    
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-charcoal-900/50 font-bold block pt-1">
                          {tour.category}
                        </span>
                        <span className="bg-mustard-500 text-charcoal-900 text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shrink-0">
                          {tour.badge}
                        </span>
                      </div>
                      
                      <h3 className="font-serif text-[22px] leading-tight text-charcoal-900 mb-3">{tour.title}</h3>
                      <p className="text-charcoal-900/70 text-sm font-light leading-relaxed mb-8">
                        {tour.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-end mt-auto">
                      <span className="text-[11px] text-charcoal-900/60 font-light">
                        {tour.details}
                      </span>
                      <Link href={`/tours/${tour.slug || tour.id}`} className="text-coral-500 text-[11px] font-bold uppercase tracking-widest hover:text-coral-600 transition-colors">
                        Book it &rarr;
                      </Link>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
