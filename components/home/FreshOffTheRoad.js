import Link from "next/link";
import { freshPosts } from "@/data/mockData";
import Image from "next/image";

export default function FreshOffTheRoad() {
  return (
    <section className="py-20 lg:py-28 bg-cream-100">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-[56px] font-serif text-charcoal-900 mb-4 tracking-tight leading-tight font-bold">
            Fresh <span className="text-coral-500 uppercase">OFF THE ROAD</span>
          </h2>
          <p className="text-charcoal-800/80 font-medium text-[14px] md:text-[15px] tracking-wide">
            The latest dispatches — start here if you've been before.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {freshPosts.map((post) => (
            <article key={post.id} className="luxury-card group flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              <Link href={`/blog/${post.slug}`} className="block relative aspect-[4/3] w-full overflow-hidden">
                <Image 
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <span className="text-[9px] font-bold text-gray-500">
                    {post.countryCode}
                  </span>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-charcoal-900">
                    {post.destination}
                  </span>
                </div>
              </Link>
              <div className="flex-grow flex flex-col items-center text-center p-8">
                <span className="text-[9px] md:text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-4 leading-relaxed max-w-[90%]">
                  {post.date}
                </span>
                <h3 className="text-[22px] md:text-[26px] font-serif font-bold text-charcoal-900 mb-6 leading-snug">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <Link 
                  href={`/blog/${post.slug}`} 
                  className="text-xs font-bold text-coral-500 hover:text-coral-400 transition-colors mt-auto flex items-center gap-1"
                >
                  Read the story <span className="font-serif italic text-sm">&rarr;</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/blog" className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-[11px] font-bold tracking-[0.15em] uppercase border border-charcoal-900 text-charcoal-900 hover:bg-charcoal-900 hover:text-white transition-colors">
            READ THE JOURNAL
          </Link>
        </div>
      </div>
    </section>
  );
}
