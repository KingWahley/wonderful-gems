import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function WhyTravelWithMe() {
  return (
    <section className="py-24 bg-cream-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="relative">
            <div className="aspect-[3/4] relative z-10 overflow-hidden shadow-2xl">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=2000&auto=format&fit=crop')" }}
              ></div>
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-8 -left-8 w-64 h-64 border border-gold-500 z-0 hidden md:block"></div>
            <div className="absolute top-12 -right-12 w-48 h-48 bg-white shadow-xl z-20 p-6 hidden md:flex flex-col justify-center items-center text-center">
              <span className="text-4xl font-serif text-gold-600 mb-2">10+</span>
              <span className="text-xs uppercase tracking-widest text-charcoal-900">Years of Luxury Travel Expertise</span>
            </div>
          </div>

          <div>
            <span className="text-gold-600 uppercase tracking-widest text-xs font-semibold mb-3 block">Expertise</span>
            <h2 className="text-4xl md:text-5xl font-serif text-charcoal-900 mb-6 leading-tight">Why Travel With Us?</h2>
            <p className="text-charcoal-800/80 mb-8 font-light leading-relaxed text-lg">
              We don't just book trips; we curate unforgettable experiences tailored specifically to your unique travel style. With our global network of luxury partners, we unlock doors that remain closed to the ordinary traveler.
            </p>

            <ul className="space-y-6 mb-10">
              {[
                { title: "Personalized Itineraries", desc: "Every detail crafted specifically for your preferences." },
                { title: "VIP Access & Perks", desc: "Room upgrades, late check-outs, and exclusive amenities." },
                { title: "Global Expertise", desc: "First-hand knowledge of the world's most luxurious destinations." },
                { title: "24/7 Concierge Support", desc: "Peace of mind knowing we're always just a message away." }
              ].map((item, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="text-gold-500" size={24} />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl text-charcoal-900 mb-1">{item.title}</h4>
                    <p className="text-charcoal-800/70 font-light">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link href="/plan-with-me" className="btn-primary">
              Start Planning Your Journey
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
