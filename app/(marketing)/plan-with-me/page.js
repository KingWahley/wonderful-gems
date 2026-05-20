import { fetchSettings, fetchPackages } from "@/lib/db";

export const revalidate = 0;

export default async function PlanWithMePage() {
  let settings = null;
  let packages = [];

  try {
    const [fetchedSettings, fetchedPackages] = await Promise.all([
      fetchSettings("plan_page"),
      fetchPackages()
    ]);
    settings = fetchedSettings;
    packages = fetchedPackages || [];
  } catch (error) {
    console.error("Error fetching plan-with-me page data:", error);
  }

  // Fallbacks
  const heroBadge = settings?.heroBadge || "✈️ NOW BOOKING";
  const heroTitle = settings?.heroTitle || "Let me plan your next trip";
  const heroSubtitle = settings?.heroSubtitle || "Years of slow travel notes, distilled into a plan for your trip. Pick a package below or send me an inquiry — I usually reply within 48 hours.";
  const faqBadge = settings?.faqBadge || "❓ GOOD QUESTIONS";
  const faqTitle = settings?.faqTitle || "FAQ";
  
  const faqs = settings?.faqs || [
    { q: "Where do you plan trips?", a: "I focus primarily on European destinations (Lisbon, Portugal, Italy, Spain, France) and select international destinations where I have personally traveled and vetted." },
    { q: "How long does it take?", a: "Typically, the first draft is ready in 7-10 business days. We will then refine it together." },
    { q: "Do you only do certain budgets?", a: "No, slow travel is a mindset, not a price point. Whether you are looking for boutique luxury or charming budget-friendly guest houses, the focus is on character, quality, and pace." },
    { q: "How do I pay?", a: "After our initial consultation chat, I'll send a secure payment link. We require 50% upfront to start design, and the remaining 50% upon final delivery of your custom itinerary." }
  ];

  const displayPackages = packages.length > 0 ? packages : [
    {
      title: "1:1 Consultation",
      price: "$95",
      short_description: "A 45-min video call to unstick your trip",
      offerings: [
        "Hop on a video call with me",
        "Bring a half-baked idea, leave with a plan",
        "Personal recs for stays, food & timing",
        "Follow-up notes after the call"
      ]
    },
    {
      title: "Custom Itinerary",
      price: "from $450",
      short_description: "A full day-by-day plan, made for you",
      offerings: [
        "Tailored to your pace, taste & budget",
        "Day-by-day plan with maps & links",
        "Hand-picked stays, restaurants & detours",
        "Two rounds of revisions included"
      ]
    },
    {
      title: "Full Concierge",
      price: "from $1,200",
      short_description: "I plan it AND book it for you",
      offerings: [
        "Everything in Custom Itinerary",
        "I handle flights, stays & reservations",
        "Restaurants & experiences booked",
        "On-call support during your trip"
      ]
    }
  ];

  return (
    <div className="pt-32 pb-24 bg-cream-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-32">
          <div className="flex justify-center items-center gap-2 mb-6">
            <span className="text-[10px] tracking-[0.2em] font-bold text-mustard-500 uppercase">{heroBadge}</span>
          </div>
          <h1 className="text-[44px] md:text-[56px] font-serif font-bold text-charcoal-900 leading-[1.1] mb-6">
            {heroTitle}
          </h1>
          <p className="text-[15px] font-medium text-charcoal-800/80 leading-[1.8] mb-10 max-w-[500px] mx-auto">
            {heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#packages" className="bg-mustard-500 text-white text-[11px] tracking-[0.15em] font-bold uppercase py-3.5 px-8 rounded-full hover:bg-mustard-600 transition-colors w-full sm:w-auto text-center">
              SEE PACKAGES &rarr;
            </a>
            <a href="#inquiry" className="bg-transparent border border-charcoal-900 text-charcoal-900 text-[11px] tracking-[0.15em] font-bold uppercase py-3.5 px-8 rounded-full hover:bg-charcoal-900 hover:text-white transition-colors w-full sm:w-auto text-center">
              SEND AN INQUIRY
            </a>
          </div>
        </div>

        {/* Packages Section */}
        <div id="packages" className="mb-32 scroll-mt-24">
          <div className="text-center mb-12">
            <span className="text-[10px] tracking-[0.2em] font-bold text-mustard-500 uppercase block mb-4">📦 THE PACKAGES</span>
            <h2 className="text-[36px] font-serif font-bold text-charcoal-900">Pick what fits</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
            {displayPackages.map((pkg, index) => {
              let bgClass = "bg-[#96CBA8]";
              let buttonClass = "bg-[#E6B63E] hover:bg-[#D4A532] text-white";
              let isMostBooked = false;

              if (index === 1) {
                bgClass = "bg-[#E6B63E]";
                buttonClass = "bg-white/20 hover:bg-white/30 border border-white/50 text-white";
                isMostBooked = true;
              } else if (index === 2) {
                bgClass = "bg-coral-500";
                buttonClass = "bg-[#E6B63E] hover:bg-[#D4A532] text-white";
              } else if (index > 2) {
                const colorClasses = ["bg-[#96CBA8]", "bg-[#E6B63E]", "bg-coral-500"];
                bgClass = colorClasses[index % 3];
                buttonClass = bgClass === "bg-[#E6B63E]"
                  ? "bg-white/20 hover:bg-white/30 border border-white/50 text-white"
                  : "bg-[#E6B63E] hover:bg-[#D4A532] text-white";
              }

              const offerings = pkg.offerings || [];

              return (
                <div key={pkg.id || index} className={`${bgClass} rounded-[24px] p-8 flex flex-col relative overflow-hidden shadow-sm transition-transform duration-300 hover:-translate-y-1`}>
                  {isMostBooked && (
                    <div className="absolute top-6 right-6 bg-[#80C4E5] text-charcoal-900 text-[9px] tracking-[0.15em] font-bold uppercase py-1.5 px-3 rounded-full flex items-center gap-1.5 shadow-sm">
                      <span>⭐</span> MOST BOOKED
                    </div>
                  )}
                  <div className="text-[32px] mb-4">
                    {index === 0 ? "☕" : index === 1 ? "🗺️" : "✨"}
                  </div>
                  <h3 className="font-serif font-bold text-[22px] text-charcoal-900 mb-1">{pkg.title}</h3>
                  <p className="text-[13px] font-medium text-charcoal-900/90 mb-6">{pkg.shortDescription || pkg.short_description}</p>
                  <div className="font-serif font-bold text-[36px] text-charcoal-900 mb-8">{pkg.price}</div>
                  <ul className="space-y-3 mb-10 flex-grow">
                    {offerings.map((offering, i) => (
                      <li key={i} className="flex gap-2 text-[13px] font-medium text-charcoal-900 leading-tight">
                        <span className="text-charcoal-900/60 font-bold">✓</span> {offering}
                      </li>
                    ))}
                  </ul>
                  <a href="#inquiry" className={`${buttonClass} text-[10px] tracking-[0.15em] font-bold uppercase py-3.5 px-6 rounded-full transition-colors self-start shadow-sm text-center w-full sm:w-auto`}>
                    BOOK {pkg.title.toUpperCase()} &rarr;
                  </a>
                </div>
              );
            })}
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
        <div id="inquiry" className="mb-32 scroll-mt-24">
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
                  {displayPackages.map((pkg, idx) => (
                    <option key={idx}>{pkg.title}</option>
                  ))}
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
                  SEND INQUIRY &rarr;
                </button>
                <p className="text-[9px] text-charcoal-900/40 mt-4 tracking-wide font-medium">By submitting, you agree to be contacted about your inquiry. No spam, ever.</p>
              </div>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-24">
          <div className="text-center mb-10">
            <span className="text-[10px] tracking-[0.2em] font-bold text-coral-500 uppercase block mb-4">{faqBadge}</span>
            <h2 className="text-[32px] font-serif font-bold text-charcoal-900">{faqTitle}</h2>
          </div>
          
          <div className="max-w-[650px] mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-white rounded-[12px] shadow-sm border border-cream-200 cursor-pointer overflow-hidden transition-all duration-300 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between px-6 py-5 focus:outline-none select-none">
                  <h4 className="font-serif font-bold text-[16px] text-charcoal-900 pr-4">{faq.q}</h4>
                  <span className="text-[10px] text-charcoal-900 transition-transform duration-300 group-open:rotate-90 shrink-0">▶</span>
                </summary>
                <div className="px-6 pb-5 text-[13px] font-medium text-charcoal-800/80 leading-relaxed border-t border-cream-100/50 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-[11px] tracking-wide font-bold text-charcoal-900/50 uppercase">
              Just need to read? <a href="/destinations" className="text-coral-500 hover:underline ml-1">Browse destinations &rarr;</a>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
