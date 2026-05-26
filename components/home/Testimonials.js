import Link from "next/link";
import Image from "next/image";

export default function MiniTravelGuides({ miniGuides = [], settings = {} }) {
  const isCustomList = settings?.items && settings.items.length > 0;
  const pocketGuides = miniGuides.filter((guide) => guide.type === "pocket");
  const listToRender = isCustomList ? pocketGuides : pocketGuides.slice(0, 3);

  if (listToRender.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-cream-100">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            {settings?.badge ? (
              <span className="text-mustard-500 font-bold tracking-[0.2em] uppercase text-[11px] flex items-center gap-1.5">
                {settings.badge}
              </span>
            ) : (
              <span className="text-mustard-500 font-bold tracking-[0.2em] uppercase text-[11px] flex items-center gap-1.5">
                <span>⚡</span> POCKET GUIDES
              </span>
            )}
          </div>
          <h2 className="text-4xl md:text-[46px] font-serif font-bold text-charcoal-900 mb-4 tracking-tight">
            {settings?.title || "Mini Travel Guides"}
          </h2>
          <p className="text-charcoal-800/80 font-medium text-[15px] max-w-2xl">
            Where to stay, what to eat, top sights, and day trips — the practical pocket version, 
            <br className="hidden md:block" />
            separate from the long reads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listToRender.map((guide) => (
            <div 
              key={guide.id} 
              className="bg-white rounded-[20px] overflow-hidden group flex flex-col border border-charcoal-900/5 shadow-sm hover:shadow-md transition-shadow duration-300 h-full"
            >
              <Link href={`/mini-guides/${guide.slug}`} className="relative h-56 overflow-hidden block bg-cream-200">
                {guide.heroImage && (
                  <Image 
                    src={guide.heroImage}
                    alt={guide.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute top-5 left-5">
                  <span className="bg-mustard-500 text-charcoal-900 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <span>⚡</span> MINI GUIDE
                  </span>
                </div>
              </Link>
              
              <div className="p-8 flex flex-col flex-grow">
                <span className="text-charcoal-900/50 font-bold text-[10px] tracking-[0.2em] uppercase mb-3 block">
                  <span className="font-serif text-charcoal-900 mr-1">{guide.countryCode}</span> {guide.destination}
                </span>
                <h3 className="font-serif text-2xl text-charcoal-900 mb-4 leading-tight font-bold">
                  <Link href={`/mini-guides/${guide.slug}`}>{guide.title}</Link>
                </h3>
                <p className="text-charcoal-900/70 text-sm mb-6 line-clamp-3 leading-relaxed font-light flex-grow">
                  {guide.excerpt}
                </p>
                <div className="mt-auto">
                  <Link 
                    href={`/mini-guides/${guide.slug}`} 
                    className="text-coral-500 text-[11px] font-bold uppercase tracking-widest hover:text-coral-600 transition-colors flex items-center gap-2"
                  >
                    Open the guide <span className="text-lg leading-none">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
