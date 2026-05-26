import Link from "next/link";
import Image from "next/image";

export default function FeaturedTours({ tours = [], settings = {} }) {
  if (!tours || tours.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            {settings?.badge ? (
              <span className="text-mustard-500 font-bold tracking-[0.2em] uppercase text-[11px] flex items-center gap-1.5 font-sans">
                {settings.badge}
              </span>
            ) : (
              <span className="text-mustard-500 font-bold tracking-[0.2em] uppercase text-[11px] flex items-center gap-1.5 font-sans">
                <span>🌟</span> HANDPICKED EXPERIENCES
              </span>
            )}
          </div>
          <h2 className="text-4xl md:text-[46px] font-serif font-bold text-charcoal-900 mb-4 tracking-tight">
            {settings?.title || "Featured Tours & Activities"}
          </h2>
          <p className="text-charcoal-800/80 font-medium text-[15px] max-w-2xl leading-relaxed">
            Every guided activity is personally vetted, slow-paced, and rich in local character — 
            directly bookable and designed for curious minds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => {
            const hasBookingLink = tour.bookingLink && tour.bookingLink.trim() !== "";
            const tourUrl = hasBookingLink ? tour.bookingLink : "/tours";
            const isExternal = hasBookingLink;
            const linkProps = isExternal 
              ? { href: tourUrl, target: "_blank", rel: "noopener noreferrer" } 
              : { href: tourUrl };
            const LinkComponent = isExternal ? "a" : Link;

            return (
              <div 
                key={tour.id} 
                className="bg-cream-100 rounded-[24px] overflow-hidden group flex flex-col border border-[#F0E6D2] shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 ease-out h-full"
              >
                <LinkComponent {...linkProps} className="relative aspect-[4/3] w-full overflow-hidden block bg-cream-200">
                  {tour.heroImage ? (
                    <Image 
                      src={tour.heroImage}
                      alt={tour.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-cream-200">
                      <span className="text-charcoal-400 font-sans text-xs">No preview image</span>
                    </div>
                  )}
                  <div className="absolute top-5 left-5 z-10">
                    <span className="bg-mustard-500 text-charcoal-900 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full flex items-center gap-1">
                      {tour.badge || "TOUR"}
                    </span>
                  </div>
                  {tour.destination && (
                    <div className="absolute bottom-5 left-5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)] z-10">
                      <span className="text-[9px] font-bold text-charcoal-400 lowercase tracking-wider font-sans leading-none">
                        {tour.countryCode?.toLowerCase() || "jp"}
                      </span>
                      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-charcoal-900 font-sans leading-none">
                        {tour.destination}
                      </span>
                    </div>
                  )}
                </LinkComponent>
                
                <div className="p-8 flex flex-col flex-grow">
                  <span className="text-charcoal-900/50 font-bold text-[10px] tracking-[0.2em] uppercase mb-2 block">
                    {tour.category || "EXPERIENCE"}
                  </span>
                  <h3 className="font-serif text-2xl text-charcoal-900 mb-4 leading-tight font-bold group-hover:text-coral-500 transition-colors">
                    <LinkComponent {...linkProps}>{tour.title}</LinkComponent>
                  </h3>
                  <p className="text-charcoal-900/70 text-sm mb-6 line-clamp-3 leading-relaxed font-light flex-grow">
                    {tour.description || tour.shortDescription}
                  </p>
                  <div className="mt-auto pt-4 border-t border-charcoal-900/5 flex justify-between items-center text-xs text-charcoal-900/60">
                    <span className="font-sans font-medium">{tour.duration || "Full Day"}</span>
                    <span className="font-sans font-bold text-charcoal-900">{tour.price || ""}</span>
                  </div>
                  <div className="mt-4 pt-2">
                    <LinkComponent 
                      {...linkProps}
                      className="text-coral-500 text-[11px] font-bold uppercase tracking-widest hover:text-coral-600 transition-colors flex items-center gap-2"
                    >
                      {hasBookingLink ? "Book Experience" : "View Tours"} <span className="text-lg leading-none">&rarr;</span>
                    </LinkComponent>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
