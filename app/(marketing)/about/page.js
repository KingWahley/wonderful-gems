import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="pt-24 pb-20 bg-cream-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="relative">
            <div className="aspect-[3/4] relative z-10 overflow-hidden shadow-xl rounded-sm">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1000&auto=format&fit=crop')" }}
              ></div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-3/4 aspect-[4/3] z-20 border-8 border-cream-100 shadow-xl overflow-hidden rounded-sm hidden md:block">
               <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516483638261-f4dafaf00bc6?q=80&w=800&auto=format&fit=crop')" }}
              ></div>
            </div>
          </div>
          
          <div>
            <span className="text-gold-600 uppercase tracking-widest text-xs font-semibold mb-3 block">Meet The Founder</span>
            <h1 className="text-5xl md:text-6xl font-serif text-charcoal-900 mb-6">Hello, I'm Elena.</h1>
            <p className="text-charcoal-800/80 mb-6 font-light leading-relaxed text-lg">
              My journey into luxury travel began over a decade ago when I left my corporate career to explore the uncharted corners of the globe. What started as a personal quest for beauty and authenticity quickly evolved into Wanderful Travel.
            </p>
            <p className="text-charcoal-800/80 mb-8 font-light leading-relaxed text-lg">
              I believe that travel is the ultimate luxury, not because of five-star thread counts, but because of the undivided time it gives us to reconnect with ourselves and the world around us. My mission is to curate spaces and experiences that foster this connection.
            </p>
            
            <div className="border-l-2 border-gold-500 pl-6 my-8 italic text-charcoal-900 font-serif text-xl">
              "To travel is to discover that everyone is wrong about other countries."
            </div>
            
            <img src="/signature.png" alt="Elena Signature" className="h-12 opacity-50 hidden" /> {/* Assuming there would be a signature */}
            <span className="font-serif text-2xl text-charcoal-900 italic">Elena Rossi</span>
          </div>
        </div>

        <div className="py-16 border-t border-b border-cream-200 mb-24 text-center max-w-4xl mx-auto">
          <span className="text-gold-600 uppercase tracking-widest text-xs font-semibold mb-3 block">My Philosophy</span>
          <h2 className="text-3xl md:text-4xl font-serif text-charcoal-900 mb-6">Slow Down & Savor</h2>
          <p className="text-charcoal-800/80 font-light leading-relaxed text-lg">
            We reject the idea of rushing through checklists. Instead, we advocate for slow travel—immersing yourself in a destination, understanding its rhythms, and allowing for spontaneity within a thoughtfully crafted framework. Every itinerary we design leaves room for serendipity.
          </p>
        </div>
      </div>
    </div>
  );
}
