import Link from "next/link";

export default function PlanYourTripCTA({ settings }) {
  if (!settings) return null;

  const { badge, title, description, buttonText } = settings;

  return (
    <section className="py-20 lg:py-24 bg-cream-100">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="relative bg-mustard-500 rounded-3xl p-10 md:p-14 lg:p-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 overflow-hidden">
          
          {/* NOW BOOKING Badge */}
          <div className="absolute top-8 right-8 inline-flex bg-white px-5 py-2 rounded-full border border-charcoal-900 items-center justify-center">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-charcoal-900">
              NOW BOOKING
            </span>
          </div>

          <div className="text-left max-w-2xl relative z-10 pt-8 lg:pt-0">
            {badge && (
              <span className="text-white/90 uppercase tracking-[0.15em] text-[11px] font-bold mb-4 block">
                {badge}
              </span>
            )}
            {title && (
              <h2 className="text-4xl md:text-[52px] font-serif font-bold text-white mb-4 leading-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-white/95 text-[15px] md:text-base font-medium whitespace-pre-line">
                {description}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0 relative z-10 mt-2 lg:mt-0 lg:pt-16">
            <Link href="/plan-with-me" className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white text-charcoal-900 font-bold text-[14px] hover:bg-gray-50 transition-colors animate-all duration-200">
              {buttonText || "See packages"} <span className="ml-2 font-serif text-lg leading-none font-normal">&rarr;</span>
            </Link>
            <Link href="/plan-with-me#inquiry" className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-transparent border border-white text-white font-bold text-[14px] hover:bg-white/10 transition-colors">
              Send an inquiry
            </Link>
          </div>
          
        </div>
      </div>
    </section>
  );
}
