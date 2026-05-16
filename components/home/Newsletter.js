export default function Newsletter() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-gold-600 uppercase tracking-widest text-xs font-semibold mb-3 block">Join The Club</span>
        <h2 className="text-4xl md:text-5xl font-serif text-charcoal-900 mb-6">Wanderlust in Your Inbox</h2>
        <p className="text-charcoal-800/70 mb-10 font-light leading-relaxed max-w-2xl mx-auto">
          Subscribe to our exclusive newsletter to receive curated itineraries, luxury travel inspiration, and first access to our limited-availability tours.
        </p>
        
        <form className="flex flex-col sm:flex-row max-w-xl mx-auto gap-3">
          <input 
            type="email" 
            placeholder="Enter your email address" 
            className="flex-grow border-b border-charcoal-900 py-3 px-2 text-charcoal-900 focus:outline-none focus:border-gold-600 bg-transparent"
            required
          />
          <button type="submit" className="bg-charcoal-900 text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-gold-500 transition-colors sm:w-auto w-full mt-4 sm:mt-0">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
