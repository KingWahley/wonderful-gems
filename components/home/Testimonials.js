import { testimonials } from "@/data/mockData";
import { Quote } from "lucide-react";

export default function Testimonials() {
  return (
    <section className="py-24 bg-charcoal-900 text-cream-100 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" 
           style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }}></div>
           
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-gold-500 uppercase tracking-widest text-xs font-semibold mb-3 block">Kind Words</span>
          <h2 className="text-4xl md:text-5xl font-serif mb-4">Traveler Experiences</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-charcoal-800 p-10 relative">
              <Quote className="absolute top-6 right-6 text-charcoal-700/50" size={64} />
              <p className="text-lg font-light leading-relaxed mb-8 relative z-10 text-cream-100/90 italic">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-serif text-lg text-white">{testimonial.name}</h4>
                  <p className="text-gold-500 text-sm tracking-wide uppercase">{testimonial.destination}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
