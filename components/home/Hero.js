import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-charcoal-900/40 backdrop-blur-[2px]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center mt-16">
        <span className="text-gold-500 uppercase tracking-[0.3em] text-sm mb-6 font-medium animate-fade-in-up">
          Wanderful Travel
        </span>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Curated Luxury <br className="hidden md:block" />
          <span className="italic font-light">Experiences</span>
        </h1>
        <p className="text-lg md:text-xl text-cream-100/90 mb-10 max-w-2xl font-light animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          Discover the world's most breathtaking destinations through an editorial lens. 
          Expertly crafted itineraries for the modern explorer.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <Link href="/destinations" className="bg-white text-charcoal-900 px-8 py-4 text-sm tracking-widest uppercase hover:bg-gold-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
            Explore Destinations
            <ArrowRight size={16} />
          </Link>
          <Link href="/plan-with-me" className="border border-white text-white px-8 py-4 text-sm tracking-widest uppercase hover:bg-white hover:text-charcoal-900 transition-all duration-300 flex items-center justify-center">
            Plan With Me
          </Link>
        </div>
      </div>
    </div>
  );
}
