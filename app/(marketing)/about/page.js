import { fetchSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const about = await fetchSettings("about_page");

  if (!about) {
    return (
      <div className="pt-32 pb-24 bg-cream-100 min-h-screen flex items-center justify-center">
        <p className="text-charcoal-500 italic">About page details are not configured yet in settings.</p>
      </div>
    );
  }

  const {
    coverImage,
    floatingPill,
    badge,
    title,
    introText,
    middleText,
    footerText,
    contactTitle,
    contactEmail
  } = about;

  return (
    <div className="pt-32 pb-24 bg-cream-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 lg:mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-[1100px] mx-auto">
          
          {/* Left Column - Image */}
          <div className="relative w-full max-w-[440px] mx-auto lg:mr-auto lg:ml-0">
            {coverImage && (
              <div className="relative aspect-[4/5] w-full rounded-[24px] overflow-hidden shadow-sm">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${coverImage}')` }}
                ></div>
              </div>
            )}
            {/* Floating Pill */}
            {floatingPill && (
              <div className="absolute top-12 -right-8 bg-coral-500 text-white text-[10px] tracking-[0.15em] font-bold uppercase py-2.5 px-5 rounded-full shadow-sm flex items-center gap-2 z-10 whitespace-nowrap">
                <span className="text-sm leading-none">👋</span> {floatingPill}
              </div>
            )}
          </div>
          
          {/* Right Column - Content */}
          <div className="lg:pr-8">
            {badge && (
              <span className="text-[11px] tracking-[0.2em] font-bold text-mustard-500 uppercase block mb-5">
                {badge}
              </span>
            )}
            {title && (
              <h1 
                className="text-[44px] md:text-[56px] font-serif font-bold text-charcoal-900 leading-[1.05] mb-8"
                dangerouslySetInnerHTML={{ __html: title.replace(/\n/g, "<br/>") }}
              />
            )}
            
            <div className="space-y-6 text-[15px] font-medium text-charcoal-800/80 leading-[1.8] mb-12">
              {introText && <p>{introText}</p>}
              {middleText && <p>{middleText}</p>}
              {footerText && <p>{footerText}</p>}
            </div>
            
            {/* Contact Card */}
            {contactEmail && (
              <div className="bg-[#96CBA8] border-2 border-charcoal-900 rounded-[20px] px-8 py-6 inline-block w-full sm:w-auto min-w-[320px]">
                <div className="font-serif font-bold text-[24px] text-charcoal-900 mb-1 flex items-center gap-2">
                  {contactTitle || "say hi 👋"}
                </div>
                <a href={`mailto:${contactEmail}`} className="font-serif font-bold text-[18px] text-charcoal-900 hover:opacity-80 transition-opacity">
                  {contactEmail}
                </a>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

