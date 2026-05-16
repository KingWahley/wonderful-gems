import Link from "next/link";
import { blogPosts } from "@/data/mockData";
import { ArrowRight, Clock } from "lucide-react";

export default function FeaturedBlogs() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-gold-600 uppercase tracking-widest text-xs font-semibold mb-3 block">Journal</span>
          <h2 className="text-4xl md:text-5xl font-serif text-charcoal-900 mb-4">Travel Stories</h2>
          <p className="text-charcoal-800/70 max-w-2xl mx-auto">Immerse yourself in our latest editorial pieces, featuring in-depth guides, personal narratives, and luxury travel insights.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {blogPosts.slice(0, 3).map((post) => (
            <article key={post.id} className="group flex flex-col h-full">
              <Link href={`/blog/${post.slug}`} className="block overflow-hidden mb-6 relative aspect-[4/3]">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${post.coverImage})` }}
                ></div>
              </Link>
              <div className="flex-grow flex flex-col">
                <div className="flex items-center gap-4 text-xs text-charcoal-800/60 uppercase tracking-widest mb-3">
                  <span>{post.destination}</span>
                  <span className="w-1 h-1 rounded-full bg-gold-500"></span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                </div>
                <h3 className="text-2xl font-serif text-charcoal-900 mb-3 group-hover:text-gold-600 transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="text-charcoal-800/70 mb-6 font-light leading-relaxed flex-grow">
                  {post.excerpt}
                </p>
                <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-charcoal-900 border-b border-transparent group-hover:border-charcoal-900 pb-1 self-start transition-all duration-300">
                  Read Story
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/blog" className="btn-secondary">
            View All Stories
          </Link>
        </div>
      </div>
    </section>
  );
}
