import Link from "next/link";
import { miniGuides } from "@/data/mockData";
import Image from "next/image";

export default function MiniTravelGuides() {
  return (
    <section className="py-20 lg:py-28 bg-cream-100">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-mustard-500">
              <path d="M5.5 0L0 8H4.5L3.5 14L9 6H4.5L5.5 0Z" fill="currentColor"/>
            </svg>
            <span className="text-mustard-500 font-bold tracking-[0.2em] uppercase text-[11px]">
              POCKET GUIDES
            </span>
          </div>
          <h2 className="text-4xl md:text-[46px] font-serif font-bold text-charcoal-900 mb-4 tracking-tight">
            Mini Travel Guides
          </h2>
          <p className="text-charcoal-800/80 font-medium text-[15px] max-w-2xl">
            Where to stay, what to eat, top sights, and day trips — the practical pocket version, 
            <br className="hidden md:block" />
            separate from the long reads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {miniGuides.map((guide) => (
            <article key={guide.id} className="group flex flex-col h-full bg-white rounded-[1.5rem] overflow-hidden shadow-sm border border-gray-100/50 hover:shadow-md transition-shadow duration-300">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image 
                  src={guide.heroImage}
                  alt={guide.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-mustard-500 px-4 py-1.5 rounded-full shadow-sm border border-charcoal-900/10 flex items-center gap-1.5">
                  <svg width="6" height="10" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-charcoal-900 opacity-60">
                    <path d="M5.5 0L0 8H4.5L3.5 14L9 6H4.5L5.5 0Z" fill="currentColor"/>
                  </svg>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-charcoal-900">
                    MINI GUIDE
                  </span>
                </div>
              </div>
              <div className="flex flex-col p-8 md:p-10 flex-grow">
                <div className="flex items-center gap-1 mb-4">
                  <span className="text-[10px] font-bold text-gray-500 tracking-wider">
                    {guide.countryCode}
                  </span>
                  <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-charcoal-900">
                    {guide.destination}
                  </span>
                </div>
                <h3 className="text-2xl md:text-[28px] font-serif font-bold text-charcoal-900 mb-5 leading-snug">
                  <Link href={`/mini-guides/${guide.slug}`}>{guide.title}</Link>
                </h3>
                <p className="text-charcoal-800/80 font-medium text-[14px] leading-relaxed mb-8 flex-grow">
                  {guide.excerpt}
                </p>
                <Link 
                  href={`/mini-guides/${guide.slug}`} 
                  className="text-[13px] font-bold text-coral-500 hover:text-coral-400 transition-colors flex items-center gap-2 mt-auto"
                >
                  Open the guide <span className="font-serif italic text-base leading-none">&rarr;</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
