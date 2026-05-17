export default function PlanWithMePage() {
  return (
    <div className="pt-32 pb-24 bg-cream-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-32">
          <div className="flex justify-center items-center gap-2 mb-6">
            <span className="text-[10px] tracking-[0.2em] font-bold text-mustard-500 uppercase">✈️ NOW BOOKING</span>
          </div>
          <h1 className="text-[44px] md:text-[56px] font-serif font-bold text-charcoal-900 leading-[1.1] mb-6">
            Let me plan your <span className="text-coral-500 relative inline-block">
              next trip
              <svg className="absolute w-full h-[10px] -bottom-1 left-0 text-mustard-500" viewBox="0 0 100 12" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2,8 Q25,2 50,6 T98,6" />
              </svg>
            </span>
          </h1>
          <p className="text-[15px] font-medium text-charcoal-800/80 leading-[1.8] mb-10 max-w-[500px] mx-auto">
            Years of slow travel notes, distilled into a plan for your trip. Pick a package below or send me an inquiry — I usually reply within 48 hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="bg-mustard-500 text-white text-[11px] tracking-[0.15em] font-bold uppercase py-3.5 px-8 rounded-full hover:bg-mustard-600 transition-colors w-full sm:w-auto">
              SEE PACKAGES →
            </button>
            <button className="bg-transparent border border-charcoal-900 text-charcoal-900 text-[11px] tracking-[0.15em] font-bold uppercase py-3.5 px-8 rounded-full hover:bg-charcoal-900 hover:text-white transition-colors w-full sm:w-auto">
              SEND AN INQUIRY
            </button>
          </div>
        </div>

        {/* Packages Section */}
        <div className="mb-32">
          <div className="text-center mb-12">
            <span className="text-[10px] tracking-[0.2em] font-bold text-mustard-500 uppercase block mb-4">📦 THE PACKAGES</span>
            <h2 className="text-[36px] font-serif font-bold text-charcoal-900">Pick what fits</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
            {/* Card 1 */}
            <div className="bg-[#96CBA8] rounded-[24px] p-8 flex flex-col relative overflow-hidden shadow-sm">
              <div className="text-[32px] mb-4">☕</div>
              <h3 className="font-serif font-bold text-[22px] text-charcoal-900 mb-1">1:1 Consultation</h3>
              <p className="text-[13px] font-medium text-charcoal-900 mb-6">A 45-min call to unstick your trip</p>
              <div className="font-serif font-bold text-[36px] text-charcoal-900 mb-8">$95</div>
              <ul className="space-y-3 mb-10 flex-grow">
                <li className="flex gap-2 text-[13px] font-medium text-charcoal-900 leading-tight"><span className="text-charcoal-900/60 font-bold">✓</span> Hop on a video call with me</li>
                <li className="flex gap-2 text-[13px] font-medium text-charcoal-900 leading-tight"><span className="text-charcoal-900/60 font-bold">✓</span> Bring a half-baked idea, leave with a plan</li>
                <li className="flex gap-2 text-[13px] font-medium text-charcoal-900 leading-tight"><span className="text-charcoal-900/60 font-bold">✓</span> Personal recs for stays, food & timing</li>
                <li className="flex gap-2 text-[13px] font-medium text-charcoal-900 leading-tight"><span className="text-charcoal-900/60 font-bold">✓</span> Follow-up notes after the call</li>
              </ul>
              <button className="bg-[#E6B63E] hover:bg-[#D4A532] text-white text-[10px] tracking-[0.15em] font-bold uppercase py-3.5 px-6 rounded-full transition-colors self-start shadow-sm">
                BOOK 1:1 CONSULTATION →
              </button>
            </div>

            {/* Card 2 */}
            <div className="bg-[#E6B63E] rounded-[24px] p-8 flex flex-col relative overflow-hidden shadow-sm">
              <div className="absolute top-6 right-6 bg-[#80C4E5] text-charcoal-900 text-[9px] tracking-[0.15em] font-bold uppercase py-1.5 px-3 rounded-full flex items-center gap-1.5 shadow-sm">
                <span>⭐</span> MOST BOOKED
              </div>
              <div className="text-[32px] mb-4">🗺️</div>
              <h3 className="font-serif font-bold text-[22px] text-charcoal-900 mb-1">Custom Itinerary</h3>
              <p className="text-[13px] font-medium text-charcoal-900 mb-6">A full day-by-day plan, made for you</p>
              <div className="font-serif font-bold text-[36px] text-charcoal-900 mb-8">from $450</div>
              <ul className="space-y-3 mb-10 flex-grow">
                <li className="flex gap-2 text-[13px] font-medium text-charcoal-900 leading-tight"><span className="text-charcoal-900/60 font-bold">✓</span> Tailored to your pace, taste & budget</li>
                <li className="flex gap-2 text-[13px] font-medium text-charcoal-900 leading-tight"><span className="text-charcoal-900/60 font-bold">✓</span> Day-by-day plan with maps & links</li>
                <li className="flex gap-2 text-[13px] font-medium text-charcoal-900 leading-tight"><span className="text-charcoal-900/60 font-bold">✓</span> Hand-picked stays, restaurants & detours</li>
                <li className="flex gap-2 text-[13px] font-medium text-charcoal-900 leading-tight"><span className="text-charcoal-900/60 font-bold">✓</span> Two rounds of revisions included</li>
              </ul>
              <button className="bg-white/20 hover:bg-white/30 border border-white/50 text-white text-[10px] tracking-[0.15em] font-bold uppercase py-3.5 px-6 rounded-full transition-colors self-start shadow-sm">
                BOOK CUSTOM ITINERARY →
              </button>
            </div>

            {/* Card 3 */}
            <div className="bg-coral-500 rounded-[24px] p-8 flex flex-col relative overflow-hidden shadow-sm">
              <div className="text-[32px] mb-4">✨</div>
              <h3 className="font-serif font-bold text-[22px] text-charcoal-900 mb-1">Full Concierge</h3>
              <p className="text-[13px] font-medium text-charcoal-900 mb-6">I plan it AND book it for you</p>
              <div className="font-serif font-bold text-[36px] text-charcoal-900 mb-8">from $1,200</div>
              <ul className="space-y-3 mb-10 flex-grow">
                <li className="flex gap-2 text-[13px] font-medium text-charcoal-900 leading-tight"><span className="text-charcoal-900/60 font-bold">✓</span> Everything in Custom Itinerary</li>
                <li className="flex gap-2 text-[13px] font-medium text-charcoal-900 leading-tight"><span className="text-charcoal-900/60 font-bold">✓</span> I handle flights, stays & reservations</li>
                <li className="flex gap-2 text-[13px] font-medium text-charcoal-900 leading-tight"><span className="text-charcoal-900/60 font-bold">✓</span> Restaurants & experiences booked</li>
                <li className="flex gap-2 text-[13px] font-medium text-charcoal-900 leading-tight"><span className="text-charcoal-900/60 font-bold">✓</span> On-call support during your trip</li>
              </ul>
              <button className="bg-[#E6B63E] hover:bg-[#D4A532] text-white text-[10px] tracking-[0.15em] font-bold uppercase py-3.5 px-6 rounded-full transition-colors self-start shadow-sm">
                BOOK FULL CONCIERGE →
              </button>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-32">
          <div className="text-center mb-12">
            <span className="text-[10px] tracking-[0.2em] font-bold text-mustard-500 uppercase block mb-4">⚙️ HOW IT WORKS</span>
            <h2 className="text-[36px] font-serif font-bold text-charcoal-900 mb-12">Easy, four-step process</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1000px] mx-auto">
            {[
              { num: "1", title: "Send an inquiry", desc: "Tell me where, when, and what you're dreaming of." },
              { num: "2", title: "We chat", desc: "A quick call so I really get what you want." },
              { num: "3", title: "I build the plan", desc: "First draft within a week, then we refine it." },
              { num: "4", title: "You go!", desc: "Off you go — I'm on-call if anything wobbles." }
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-[20px] p-6 shadow-sm border border-cream-200">
                <div className="text-coral-500 font-serif font-bold text-[28px] mb-2">{step.num}</div>
                <h4 className="font-serif font-bold text-[18px] text-charcoal-900 mb-2">{step.title}</h4>
                <p className="text-[13px] font-medium text-charcoal-800/80 leading-[1.6]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="mb-32">
          <div className="bg-white rounded-[32px] shadow-sm p-10 md:p-14 max-w-[700px] mx-auto border border-cream-200">
            <div className="mb-8">
              <span className="text-[10px] tracking-[0.2em] font-bold text-mustard-500 uppercase block mb-3">✍️ SEND AN INQUIRY</span>
              <h2 className="text-[32px] font-serif font-bold text-charcoal-900 mb-2 leading-tight">Tell me about your trip</h2>
              <p className="text-[13px] font-medium text-charcoal-800/70">Quick form — I read every one personally and reply within 48 hours.</p>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-charcoal-900 mb-2 tracking-wide">Your name <span className="text-coral-500">*</span></label>
                  <input type="text" className="w-full bg-[#FBF7EE] border border-charcoal-900/10 rounded-[12px] px-4 py-3.5 text-[14px] focus:outline-none focus:border-mustard-500 focus:ring-1 focus:ring-mustard-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-charcoal-900 mb-2 tracking-wide">Email <span className="text-coral-500">*</span></label>
                  <input type="email" className="w-full bg-[#FBF7EE] border border-charcoal-900/10 rounded-[12px] px-4 py-3.5 text-[14px] focus:outline-none focus:border-mustard-500 focus:ring-1 focus:ring-mustard-500" />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-charcoal-900 mb-2 tracking-wide">Package</label>
                <select className="w-full bg-[#FBF7EE] border border-charcoal-900/10 rounded-[12px] px-4 py-3.5 text-[14px] focus:outline-none focus:border-mustard-500 focus:ring-1 focus:ring-mustard-500 appearance-none text-charcoal-900">
                  <option>Custom Itinerary</option>
                  <option>1:1 Consultation</option>
                  <option>Full Concierge</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-charcoal-900 mb-2 tracking-wide">Destination(s)</label>
                  <input type="text" placeholder="e.g. Japan, Portugal..." className="w-full bg-[#FBF7EE] border border-charcoal-900/10 rounded-[12px] px-4 py-3.5 text-[14px] placeholder:text-charcoal-900/40 focus:outline-none focus:border-mustard-500 focus:ring-1 focus:ring-mustard-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-charcoal-900 mb-2 tracking-wide">Approx. dates</label>
                  <input type="text" placeholder="e.g. Sept 2026, 10 days" className="w-full bg-[#FBF7EE] border border-charcoal-900/10 rounded-[12px] px-4 py-3.5 text-[14px] placeholder:text-charcoal-900/40 focus:outline-none focus:border-mustard-500 focus:ring-1 focus:ring-mustard-500" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-charcoal-900 mb-2 tracking-wide">Rough budget (optional)</label>
                <input type="text" placeholder="$ per person" className="w-full bg-[#FBF7EE] border border-charcoal-900/10 rounded-[12px] px-4 py-3.5 text-[14px] placeholder:text-charcoal-900/40 focus:outline-none focus:border-mustard-500 focus:ring-1 focus:ring-mustard-500" />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-charcoal-900 mb-2 tracking-wide">Tell me what you're dreaming of</label>
                <textarea rows="4" placeholder="Slow mornings? Markets? Off-the-beaten-path? Tell me everything." className="w-full bg-[#FBF7EE] border border-charcoal-900/10 rounded-[12px] px-4 py-3.5 text-[14px] placeholder:text-charcoal-900/40 focus:outline-none focus:border-mustard-500 focus:ring-1 focus:ring-mustard-500 resize-none"></textarea>
              </div>
              
              <div className="pt-2">
                <button type="button" className="bg-[#E6B63E] hover:bg-[#D4A532] text-white text-[11px] tracking-[0.2em] font-bold uppercase py-4 px-8 rounded-full transition-colors w-full sm:w-auto shadow-sm">
                  SEND INQUIRY →
                </button>
                <p className="text-[9px] text-charcoal-900/40 mt-4 tracking-wide font-medium">By submitting, you agree to be contacted about your inquiry. No spam, ever.</p>
              </div>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-24">
          <div className="text-center mb-10">
            <span className="text-[10px] tracking-[0.2em] font-bold text-coral-500 uppercase block mb-4">❓ GOOD QUESTIONS</span>
            <h2 className="text-[32px] font-serif font-bold text-charcoal-900">FAQ</h2>
          </div>
          
          <div className="max-w-[600px] mx-auto space-y-3">
            {[
              "Where do you plan trips?",
              "How long does it take?",
              "Do you only do certain budgets?",
              "How do I pay?"
            ].map((q, i) => (
              <div key={i} className="bg-white rounded-[12px] px-6 py-5 shadow-sm border border-cream-200 flex items-center gap-4 cursor-pointer hover:border-cream-300 transition-colors">
                <span className="text-[8px] text-charcoal-900">▶</span>
                <h4 className="font-serif font-bold text-[16px] text-charcoal-900">{q}</h4>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-[11px] tracking-wide font-bold text-charcoal-900/50 uppercase">
              Just need to read? <a href="/destinations" className="text-coral-500 hover:underline ml-1">Browse destinations →</a>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
