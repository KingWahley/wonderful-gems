"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";

export default function FeaturedDestinations({ destinations = [], settings = {} }) {
  const scrollContainerRef = useRef(null);

  if (!destinations || destinations.length === 0) return null;

  const isCustomList = settings?.items && settings.items.length > 0;
  const listToRender = isCustomList ? destinations : destinations.slice(0, 5);

  // Infinite auto-scroll interval every 5 seconds
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || listToRender.length <= 5) return;

    const interval = setInterval(() => {
      const card = container.firstElementChild;
      if (!card) return;

      const cardWidth = card.getBoundingClientRect().width;
      const gap = 20; // gap-5 is 20px
      const step = cardWidth + gap;

      const maxScroll = container.scrollWidth - container.clientWidth;

      // If we are at the end, smoothly wrap back to the beginning
      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [listToRender.length]);

  return (
    <section className="py-20 lg:py-28 bg-mustard-500 overflow-hidden">
      {/* Inline style block to fully guarantee scrollbars are completely hidden */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />
      {/* Reduced padding from px-6 lg:px-12 to px-4 lg:px-6 to let cards span wider */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          {settings?.badge && (
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-white/20 mb-4 bg-white/10">
              <span className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">
                {settings.badge}
              </span>
            </div>
          )}
          <h2 className="text-4xl md:text-[56px] font-serif font-bold text-white mb-4 tracking-tight leading-tight">
            {settings?.title || "Explore by Destination"}
          </h2>
          <p className="text-white/90 font-sans font-medium text-[14px] md:text-[15px] tracking-wide">
            Tap a country to see every post and guide from there.
          </p>
        </div>

        {/* Carousel Flex Container with Snap-X, Gap-5, and Hidden scrollbars */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-5 pb-6 snap-x snap-mandatory scroll-smooth no-scrollbar"
        >
          {listToRender.map((dest) => (
            <div 
              key={dest.id} 
              className="flex-none w-[82vw] sm:w-[45vw] md:w-[29vw] lg:w-[calc((100%-4*20px)/5)] snap-start group flex flex-col items-center"
            >
              <Link href={`/destinations/${dest.slug}`} className="w-full relative block">
                <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden mb-5 border-[1.5px] border-white/40 shadow-xl group-hover:-translate-y-1 transition-transform duration-300">
                  <Image 
                    src={dest.coverImage}
                    alt={dest.country}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-white text-charcoal-900 rounded-full w-8 h-8 flex items-center justify-center text-[9px] font-bold shadow-sm">
                    {dest.code}
                  </div>
                </div>
              </Link>
              
              <h3 className="text-[28px] font-serif font-bold text-white mb-1">
                {dest.country}
              </h3>
              <span className="text-[10px] tracking-[0.15em] uppercase text-white/90 font-bold">
                {dest.blogsCount} {dest.blogsCount === 1 ? 'POST' : 'POSTS'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
