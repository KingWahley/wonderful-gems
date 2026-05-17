import Image from "next/image";
import Link from "next/link";
import { blogPosts, destinations } from "@/data/mockData";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const post = blogPosts.find((p) => p.slug === resolvedParams.slug);

  if (!post) {
    notFound();
  }

  // Find other posts from same destination
  const relatedPosts = blogPosts.filter(
    (p) => p.destination === post.destination && p.id !== post.id
  ).slice(0, 3);

  // Latest posts for sidebar
  const latestPosts = blogPosts.filter(p => p.id !== post.id).slice(0, 2);

  // Get all unique destinations
  const uniqueDestinations = [...new Set(blogPosts.map(p => p.destination))];

  return (
    <div className="pt-32 pb-24 bg-[#FBF7EE] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="mb-16 mt-4">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] font-bold text-charcoal-700 uppercase">
            <Link href="/destinations" className="hover:text-mustard-500 transition-colors">DESTINATIONS</Link>
            <span className="text-charcoal-300">/</span>
            <Link href={`/destinations/${post.destination.toLowerCase()}`} className="hover:text-mustard-500 transition-colors">
              <span className="text-[8px] opacity-60 mr-1">{post.countryCode.toLowerCase()}</span>
              {post.destination}
            </Link>
            <span className="text-charcoal-300">/</span>
            <span className="text-charcoal-900">{post.category.split(" • ")[1] || "KYOTO"}</span>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#DCAE1D] uppercase block mb-4">
            HELLO FROM
          </span>

          {/* Tags */}
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <span className="border border-charcoal-900/10 bg-[#EFEBE4] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase text-charcoal-900">
              <span className="text-[8px] opacity-60 mr-1">{post.countryCode.toLowerCase()}</span>
              {post.destination}
            </span>
            <span className="bg-[#46B6E6] text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm">
              {post.category.split(" • ")[1] || "KYOTO"}
            </span>
            <span className="bg-[#96CBA8] text-[#2D4A38] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm">
              {post.category.split(" • ")[2] || "APRIL 2025"}
            </span>
          </div>

          <h1 className="text-[48px] md:text-[64px] font-serif font-bold text-charcoal-900 leading-[1.05] mb-6 max-w-4xl mx-auto tracking-tight">
            {post.title}
          </h1>
          
          <p className="text-charcoal-700 max-w-2xl mx-auto text-[15px] md:text-[17px] leading-relaxed mb-8 font-medium">
            Lanterns, temple bells, and the quiet ritual of the early hours in Japan's old capital.
          </p>

          {/* Read Time & Mini Guide Link */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-8">
            <span className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-charcoal-800 uppercase">
              📖 9 MIN READ
            </span>
            <Link 
              href={`/mini-guides`} 
              className="flex items-center gap-1.5 bg-transparent border border-charcoal-900/80 px-6 py-2 rounded-full text-[10px] font-bold tracking-widest text-charcoal-900 uppercase hover:bg-charcoal-900 hover:text-white transition-colors"
            >
              <span className="text-orange-500 font-sans">⚡</span> MINI GUIDE TO {post.category.split(" • ")[1] || "KYOTO"}
            </Link>
          </div>

          {/* Social Share Row */}
          <div className="flex items-center gap-3 border border-charcoal-900/80 px-6 py-2 rounded-full w-fit mx-auto bg-white/50 backdrop-blur-sm shadow-sm">
            <span className="text-[9px] font-bold tracking-[0.2em] text-charcoal-500 uppercase">SHARE</span>
            
            {/* Share Nodes */}
            <button className="w-8 h-8 rounded-full border border-charcoal-900/10 flex items-center justify-center hover:bg-charcoal-900 hover:text-[#FBF7EE] transition-colors cursor-pointer text-charcoal-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            
            {/* Twitter */}
            <button className="w-8 h-8 rounded-full border border-charcoal-900/10 flex items-center justify-center hover:bg-charcoal-900 hover:text-[#FBF7EE] transition-colors cursor-pointer text-charcoal-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </button>
            
            {/* Facebook */}
            <button className="w-8 h-8 rounded-full border border-charcoal-900/10 flex items-center justify-center hover:bg-charcoal-900 hover:text-[#FBF7EE] transition-colors cursor-pointer text-charcoal-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </button>
            
            {/* LinkedIn */}
            <button className="w-8 h-8 rounded-full border border-charcoal-900/10 flex items-center justify-center hover:bg-charcoal-900 hover:text-[#FBF7EE] transition-colors cursor-pointer text-charcoal-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </button>
            
            {/* Mail */}
            <button className="w-8 h-8 rounded-full border border-charcoal-900/10 flex items-center justify-center hover:bg-charcoal-900 hover:text-[#FBF7EE] transition-colors cursor-pointer text-charcoal-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </button>
            
            {/* Copy Link */}
            <button className="w-8 h-8 rounded-full border border-charcoal-900/10 flex items-center justify-center hover:bg-charcoal-900 hover:text-[#FBF7EE] transition-colors cursor-pointer text-charcoal-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Image */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="relative w-full h-[400px] md:h-[600px] rounded-[24px] overflow-hidden">
          <img 
            src={post.coverImage} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-16">
        
        {/* Main Content */}
        <div className="lg:w-[70%]">
          <div className="prose prose-lg max-w-none text-charcoal-800 leading-relaxed">
            
            <p className="mb-8">
              <span className="float-left text-7xl font-serif text-mustard-500 leading-none pr-4 pt-2 font-bold">T</span>
              here is a rhythm to waking up early in Kyoto that feels less like an alarm clock and more like a gentle suggestion. When the light first hits the paper screens, it diffuses into a soft, milky glow that tells you the city is beginning to stir. I’ve always believed that you don't really know a place until you’ve seen it before 7:00 AM.
            </p>

            <p className="mb-8">
              <span className="float-left text-7xl font-serif text-mustard-500 leading-none pr-4 pt-2 font-bold">I</span>
              n the Higashiyama district, the wooden facades of machiya houses are still dark, save for a few lanterns left burning from the night before. The stone-paved streets, usually teeming with visitors and the occasional geisha dodging cameras, are empty. It’s just you, the cool morning air, and the sound of a broom sweeping the entrance of a shop nearby.
            </p>

            <p className="mb-12">
              <span className="float-left text-7xl font-serif text-mustard-500 leading-none pr-4 pt-2 font-bold">M</span>
              y morning started at a small, unassuming kissaten—an old-school Japanese coffee shop. The owner, an older gentleman in a crisp white shirt and a bowtie, was meticulously pouring water over coffee grounds. There was no rush, no espresso machines screaming in the background. Just the slow drip, drip, drip of patience turning into perfection.
            </p>

            {/* In-content callout */}
            <div className="border-t border-charcoal-900/10 pt-6 mb-12">
              <span className="text-[10px] font-bold tracking-widest text-mustard-500 uppercase block mb-2">WHERE TO STAY IN KYOTO</span>
              <p className="text-sm font-bold text-charcoal-900">
                The Long Way Guide <span className="mx-2 text-coral-500">→</span> Click here to read the full breakdown of our 12 favorite ryokans and boutique hotels.
              </p>
            </div>

            <p className="mb-8">
              <span className="float-left text-7xl font-serif text-mustard-500 leading-none pr-4 pt-2 font-bold">B</span>
              y the time I reached the Philosopher's Path, the sun had fully risen, casting long shadows across the canal. A few locals were walking their dogs, but otherwise, the path was quiet. The cherry blossoms were long gone, replaced by the deep, verdant green of summer, which I’ve always found to be Kyoto’s most underrated season.
            </p>

            {/* In-content callout 2 */}
            <div className="border-t border-charcoal-900/10 pt-6 mb-12 mt-12">
              <span className="text-[10px] font-bold tracking-widest text-mustard-500 uppercase block mb-2">A TASTE OF MATCHA</span>
              <p className="text-sm font-bold text-charcoal-900">
                The Long Way Guide <span className="mx-2 text-coral-500">→</span> Where to find the best ceremonial grade matcha without the tourist crowds.
              </p>
            </div>

            <p className="mb-16">
              <span className="float-left text-7xl font-serif text-mustard-500 leading-none pr-4 pt-2 font-bold">T</span>
              he beauty of these slow mornings is the permission they give you to simply exist. You aren't rushing to beat a line at a famous temple or trying to secure a reservation. You are just there, breathing the same air as a city that has seen centuries of mornings just like this one.
            </p>

            {/* Large Quote */}
            <div className="py-12 border-y border-charcoal-900/10 my-16 text-center">
              <p className="font-serif text-[28px] md:text-[36px] font-bold text-charcoal-900 leading-tight">
                "When we travel slowly, we allow the destination to seep into us. Kyoto demands this kind of reverence."
              </p>
            </div>

            <p className="mb-8">
              <span className="float-left text-7xl font-serif text-mustard-500 leading-none pr-4 pt-2 font-bold">W</span>
              hen I finally returned to my hotel, the lobby was bustling. Breakfast was being served, maps were being unfolded, and the energy of a new day had officially begun. But I already had my perfect day. I had lived a whole lifetime of peace before most people had even opened their eyes.
            </p>
            
            <p className="mb-16">
              <span className="float-left text-7xl font-serif text-mustard-500 leading-none pr-4 pt-2 font-bold">K</span>
              yoto is a city that rewards the early riser. It is a place that holds its secrets tightly, only revealing them to those willing to seek them out in the quiet hours. So set your alarm, step out into the cool morning air, and let the city whisper its stories to you.
            </p>

            {/* Practical Version Box */}
            <div className="bg-[#F2EFE8] rounded-[20px] p-8 md:p-12 border border-charcoal-900/5 text-center mb-16">
              <span className="text-[10px] font-bold tracking-widest text-mustard-500 uppercase block mb-4">A QUICK GUIDE</span>
              <h3 className="font-serif text-[28px] font-bold text-charcoal-900 mb-4">Want the practical version?</h3>
              <p className="text-charcoal-800/80 mb-8 max-w-lg mx-auto">
                This narrative is meant to be evocative. For a point-by-point itinerary, hotel recommendations, and logistics, check out our companion guide.
              </p>
              <Link href={`/mini-guides`} className="inline-block bg-mustard-500 text-charcoal-900 px-8 py-3 rounded-full text-[12px] font-bold tracking-widest uppercase hover:bg-mustard-600 transition-colors">
                View The {post.destination} Mini Guide
              </Link>
            </div>

            {/* Bottom Social Icons */}
            <div className="flex flex-col items-center justify-center border-t border-charcoal-900/10 pt-12 pb-16">
              <span className="text-[10px] font-bold tracking-widest text-mustard-500 uppercase block mb-6">SHARE THIS STORY</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border border-charcoal-900/20 flex items-center justify-center hover:bg-white transition-colors cursor-pointer">
                    <div className="w-4 h-4 bg-charcoal-900/40 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-[30%]">
          <div className="sticky top-32">
            <div className="border border-charcoal-900/10 bg-white rounded-[20px] p-6">
              <span className="text-[10px] font-bold tracking-widest text-mustard-500 uppercase block mb-6">LATEST POSTS</span>
              
              <div className="space-y-6">
                {latestPosts.map((latest) => (
                  <Link href={`/blog/${latest.slug}`} key={latest.id} className="group block">
                    <div className="w-full h-[120px] rounded-[12px] overflow-hidden mb-4">
                      <img 
                        src={latest.coverImage} 
                        alt={latest.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-charcoal-400 block mb-2">
                      {latest.destination}
                    </span>
                    <h4 className="font-serif text-[18px] font-bold text-charcoal-900 leading-tight mb-4 group-hover:text-coral-500 transition-colors">
                      {latest.title}
                    </h4>
                    <div className="inline-block bg-mustard-500 text-charcoal-900 px-5 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase hover:bg-mustard-600 transition-colors">
                      READ MORE
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Related Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 border-t border-charcoal-900/10 pt-16">
        
        {/* Other posts from this country */}
        {relatedPosts.length > 0 && (
          <div className="mb-16">
            <span className="text-[10px] font-bold tracking-widest text-mustard-500 uppercase block mb-6">MORE FROM {post.destination.toUpperCase()}</span>
            <h3 className="font-serif text-[32px] font-bold text-charcoal-900 mb-8">Other posts from this country</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link key={related.id} href={`/blog/${related.slug}`} className="group block bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-charcoal-900/5">
                  <div className="relative h-[200px] w-full overflow-hidden">
                    <img 
                      src={related.coverImage} 
                      alt={related.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                      <span className="text-[9px] font-bold tracking-widest uppercase text-charcoal-900">{related.destination}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-[20px] font-bold text-charcoal-900 group-hover:text-coral-500 transition-colors">
                      {related.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Other Countries Pills */}
        <div>
          <span className="text-[10px] font-bold tracking-widest text-mustard-500 uppercase block mb-6">EXPLORE MORE</span>
          <h3 className="font-serif text-[32px] font-bold text-charcoal-900 mb-8">Other countries</h3>
          <div className="flex flex-wrap gap-2">
            {uniqueDestinations.filter(d => d !== post.destination).map((dest, idx) => (
              <Link key={idx} href={`/destinations/${dest.toLowerCase()}`} className="border border-charcoal-900/10 bg-white px-5 py-2 rounded-full text-[10px] font-bold tracking-widest text-charcoal-900 hover:bg-mustard-50 transition-colors uppercase shadow-sm">
                {dest}
              </Link>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
