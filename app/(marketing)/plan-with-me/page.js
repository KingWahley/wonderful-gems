import { packages } from "@/data/mockData";
import { Check } from "lucide-react";

export default function PlanWithMePage() {
  return (
    <div className="pt-24 pb-20 bg-cream-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="text-center mb-20">
          <span className="text-gold-600 uppercase tracking-widest text-xs font-semibold mb-3 block">Services</span>
          <h1 className="text-5xl md:text-6xl font-serif text-charcoal-900 mb-6">Plan With Me</h1>
          <p className="text-charcoal-800/70 max-w-2xl mx-auto text-lg font-light">
            Whether you need expert advice for a trip you're planning yourself, or you want a completely hands-off VIP experience, we have a service tailored for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {packages.map((pkg, idx) => (
            <div key={pkg.id} className={`bg-white rounded-xl shadow-sm p-10 flex flex-col relative overflow-hidden transition-transform duration-500 hover:-translate-y-2 ${idx === 1 ? 'border-2 border-gold-500' : ''}`}>
              {idx === 1 && (
                <div className="absolute top-0 left-0 w-full bg-gold-500 text-white text-center py-1 text-xs tracking-widest uppercase font-semibold">
                  Most Popular
                </div>
              )}
              <h2 className="text-2xl font-serif text-charcoal-900 mb-2 mt-4">{pkg.title}</h2>
              <div className="text-3xl font-serif text-charcoal-900 mb-4">{pkg.price}</div>
              <p className="text-charcoal-800/70 text-sm mb-8 font-light leading-relaxed flex-grow">
                {pkg.shortDescription}
              </p>
              
              <ul className="space-y-4 mb-10">
                {pkg.offerings.map((offering, i) => (
                  <li key={i} className="flex gap-3 text-sm text-charcoal-800/80 items-start">
                    <Check size={18} className="text-gold-500 flex-shrink-0 mt-0.5" />
                    <span>{offering}</span>
                  </li>
                ))}
              </ul>
              
              <button className={`w-full py-4 text-sm tracking-widest uppercase transition-colors ${idx === 1 ? 'bg-charcoal-900 text-white hover:bg-gold-500' : 'border border-charcoal-900 text-charcoal-900 hover:bg-charcoal-900 hover:text-white'}`}>
                Inquire Now
              </button>
            </div>
          ))}
        </div>

        {/* Inquiry Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-16 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif text-charcoal-900 mb-4">Start Your Journey</h2>
            <p className="text-charcoal-800/70 font-light">Fill out the form below and we'll be in touch within 48 hours to discuss your next adventure.</p>
          </div>
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal-800/60 mb-2">Name</label>
                <input type="text" className="w-full border-b border-cream-200 py-3 focus:outline-none focus:border-gold-500 bg-transparent transition-colors" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal-800/60 mb-2">Email</label>
                <input type="email" className="w-full border-b border-cream-200 py-3 focus:outline-none focus:border-gold-500 bg-transparent transition-colors" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal-800/60 mb-2">Destination</label>
                <input type="text" className="w-full border-b border-cream-200 py-3 focus:outline-none focus:border-gold-500 bg-transparent transition-colors" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal-800/60 mb-2">Travel Dates (Approx)</label>
                <input type="text" className="w-full border-b border-cream-200 py-3 focus:outline-none focus:border-gold-500 bg-transparent transition-colors" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal-800/60 mb-2">Message & Details</label>
              <textarea rows="4" className="w-full border-b border-cream-200 py-3 focus:outline-none focus:border-gold-500 bg-transparent transition-colors resize-none"></textarea>
            </div>
            
            <div className="pt-4">
              <button type="submit" className="btn-primary w-full md:w-auto">Submit Inquiry</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
