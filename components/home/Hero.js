import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 bg-mustard-500 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Content */}
          <div className="flex flex-col items-start z-10 max-w-xl">
            <span className="text-white uppercase tracking-[0.15em] text-[11px] font-bold mb-5 animate-fade-in-up">
              A TRAVEL JOURNAL
            </span>
            <h1 className="text-6xl md:text-7xl lg:text-[85px] font-serif text-white mb-8 leading-[1.1] tracking-tight animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              The Long Way
            </h1>
            <div className="space-y-6 text-[15px] md:text-base text-white/95 font-light leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <p>
                Bringing you slow, considered travel guides and itineraries to 
                help you plan your next holiday — long essays from places 
                worth going slowly.
              </p>
              <p>
                Based in Lisbon, you can expect stories from across Europe 
                and a few corners further afield.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 mt-10 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <Link href="/destinations" className="inline-flex items-center justify-center px-7 py-3 rounded-full text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-300 border border-white/60 text-white hover:bg-white hover:text-mustard-500">
                BROWSE DESTINATIONS
              </Link>
              <Link href="/plan-with-me" className="text-[11px] font-bold tracking-[0.15em] uppercase text-white hover:text-white/80 transition-colors flex items-center">
                PLAN WITH ME <span className="ml-2 font-serif italic text-sm">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[540px] rounded-[32px] overflow-hidden shadow-2xl animate-fade-in-up mt-10 lg:mt-0" style={{ animationDelay: "0.4s" }}>
            <Image
              src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000&auto=format&fit=crop"
              alt="Person standing on a cliff at sunset"
              fill
              className="object-cover"
              priority
            />
            {/* Subtle inner shadow overlay */}
            <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.1)] rounded-[32px] pointer-events-none"></div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
