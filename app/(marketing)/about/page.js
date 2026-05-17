import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24 bg-cream-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 lg:mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-[1100px] mx-auto">
          
          {/* Left Column - Image */}
          <div className="relative w-full max-w-[440px] mx-auto lg:mr-auto lg:ml-0">
            <div className="relative aspect-[4/5] w-full rounded-[24px] overflow-hidden shadow-sm">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1000&auto=format&fit=crop')" }}
              ></div>
            </div>
            {/* Floating Pill */}
            <div className="absolute top-12 -right-8 bg-coral-500 text-white text-[10px] tracking-[0.15em] font-bold uppercase py-2.5 px-5 rounded-full shadow-sm flex items-center gap-2 z-10 whitespace-nowrap">
              <span className="text-sm leading-none">👋</span> HI, THAT'S ME
            </div>
          </div>
          
          {/* Right Column - Content */}
          <div className="lg:pr-8">
            <span className="text-[11px] tracking-[0.2em] font-bold text-mustard-500 uppercase block mb-5">
              About
            </span>
            <h1 className="text-[44px] md:text-[56px] font-serif font-bold text-charcoal-900 leading-[1.05] mb-8">
              I write about places<br/>like I'd text a friend.
            </h1>
            
            <div className="space-y-6 text-[15px] font-medium text-charcoal-800/80 leading-[1.8] mb-12">
              <p>
                The Long Way is a journal of slow travel — long essays for when you want to be transported, and short field guides for when you have a flight already booked. ✈️
              </p>
              <p>
                I started writing it because the travel internet got loud, and I missed the kind of writing that took its time. The kind you read with a coffee on a Sunday morning and put down feeling like you've been somewhere.
              </p>
              <p>
                When I recommend a tour, a hotel, or a piece of gear, it's something I've actually used and would tell a friend to use. Some are affiliate links — they cost you nothing and help keep this journal going. 🥂
              </p>
            </div>
            
            {/* Contact Card */}
            <div className="bg-[#96CBA8] border-2 border-charcoal-900 rounded-[20px] px-8 py-6 inline-block w-full sm:w-auto min-w-[320px]">
              <div className="font-serif font-bold text-[24px] text-charcoal-900 mb-1 flex items-center gap-2">
                say hi 👋
              </div>
              <a href="mailto:hello@thelongway.travel" className="font-serif font-bold text-[18px] text-charcoal-900 hover:opacity-80 transition-opacity">
                hello@thelongway.travel
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
