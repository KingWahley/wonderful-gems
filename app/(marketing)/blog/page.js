import Link from "next/link";
import { blogPosts } from "@/data/mockData";

export default function BlogPage() {
  // Group posts by destination
  const destinationsList = [
    { name: "Japan", code: "JP" },
    { name: "Portugal", code: "PT" },
    { name: "Chile", code: "CL" },
    { name: "Mexico", code: "MX" },
    { name: "Morocco", code: "MA" },
    { name: "Iceland", code: "IS" },
    { name: "Vietnam", code: "VN" },
    { name: "Italy", code: "IT" },
    { name: "Belgium", code: "BE" }
  ];

  const pills = [
    { label: "All", count: 10 },
    ...destinationsList.map(d => {
      const count = blogPosts.filter(p => p.destination === d.name).length;
      return { label: d.name, count };
    })
  ];

  return (
    <div className="pt-24 pb-24 bg-cream-100 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 mt-8">
          <div className="flex items-center gap-1.5 mb-4">
            <span className="text-[10px] tracking-[0.2em] font-bold text-mustard-500 uppercase">The Journal</span>
            <div className="w-2 h-2 bg-mustard-500"></div>
          </div>
          <h1 className="text-[50px] md:text-[56px] font-serif font-bold text-charcoal-900 leading-none mb-4">
            All posts
          </h1>
          <p className="text-charcoal-800/80 max-w-xl text-[14px] font-medium leading-relaxed mb-8">
            Get inspired and start dreaming. Every place I've documented, all the tips I've shared. ✨
          </p>

          {/* Pills */}
          <div className="flex flex-wrap gap-2">
            {pills.map((pill, idx) => (
              <button key={idx} className="border border-charcoal-900/10 bg-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest text-charcoal-900 hover:bg-cream-200 transition-colors uppercase shadow-sm">
                {pill.label} ({pill.count})
              </button>
            ))}
          </div>
        </div>

        {/* Content sections grouped by destination */}
        <div className="space-y-16 mt-16">
          {destinationsList.map((dest) => {
            const posts = blogPosts.filter(p => p.destination === dest.name);
            if (posts.length === 0) return null;

            return (
              <div key={dest.code}>
                <div className="flex items-baseline justify-between border-b border-charcoal-900/10 pb-3 mb-6">
                  <h2 className="flex items-baseline gap-2 text-charcoal-900">
                    <span className="text-sm font-sans font-bold uppercase">{dest.code}</span>
                    <span className="font-serif text-[28px] font-bold">{dest.name}</span>
                  </h2>
                  <Link href={`/destinations/${dest.name.toLowerCase()}`} className="text-[10px] font-bold text-coral-500 uppercase tracking-widest hover:text-coral-600 transition-colors">
                    View {posts.length} {posts.length === 1 ? 'post' : 'posts'} <span className="ml-0.5 text-sm leading-none">→</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="group block bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-charcoal-900/5 flex flex-col h-full">
                      
                      {/* Image Container */}
                      <div className="relative h-[200px] md:h-[220px] w-full overflow-hidden shrink-0">
                        <img 
                          src={post.coverImage} 
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Pill */}
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center shadow-sm">
                          <span className="text-[9px] font-bold tracking-widest uppercase text-charcoal-900">{post.destination}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-grow">
                        <span className="text-charcoal-400 text-[9px] tracking-[0.2em] uppercase font-bold mb-3 block">
                          {post.category}
                        </span>
                        
                        <h3 className="font-serif text-[22px] font-bold text-charcoal-900 mb-6 leading-tight flex-grow">
                          {post.title}
                        </h3>
                        
                        <div className="flex items-center text-coral-500 text-[10px] font-bold uppercase tracking-wider group-hover:text-coral-600 transition-colors mt-auto">
                          Read the story <span className="ml-1 text-lg leading-none">→</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
