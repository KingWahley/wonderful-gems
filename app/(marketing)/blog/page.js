import Link from "next/link";
import { blogPosts } from "@/data/mockData";
import { Search, Clock } from "lucide-react";

export default function BlogPage() {
  return (
    <div className="pt-24 pb-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="text-center mb-16">
          <span className="text-gold-600 uppercase tracking-widest text-xs font-semibold mb-3 block">Journal</span>
          <h1 className="text-5xl md:text-6xl font-serif text-charcoal-900 mb-6">Travel Stories</h1>
          <p className="text-charcoal-800/70 max-w-2xl mx-auto text-lg font-light">
            In-depth guides, personal narratives, and expert advice for the discerning traveler.
          </p>
        </div>

        {/* Featured Post (First one) */}
        {blogPosts.length > 0 && (
          <div className="mb-20">
            <Link href={`/blog/${blogPosts[0].slug}`} className="group grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
              <div className="relative aspect-video lg:aspect-square overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                  style={{ backgroundImage: `url(${blogPosts[0].coverImage})` }}
                ></div>
              </div>
              <div className="bg-cream-100 p-10 lg:p-20 flex flex-col justify-center h-full">
                <div className="flex items-center gap-4 text-xs text-charcoal-800/60 uppercase tracking-widest mb-4">
                  <span className="text-gold-600 font-semibold">Featured</span>
                  <span>•</span>
                  <span>{blogPosts[0].destination}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {blogPosts[0].readTime}</span>
                </div>
                <h2 className="text-4xl font-serif text-charcoal-900 mb-6 leading-tight group-hover:text-gold-600 transition-colors">
                  {blogPosts[0].title}
                </h2>
                <p className="text-charcoal-800/70 mb-8 text-lg font-light leading-relaxed">
                  {blogPosts[0].excerpt}
                </p>
                <span className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-charcoal-900 border-b border-charcoal-900 pb-1 self-start transition-all duration-300">
                  Read Full Story
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 pt-10 border-t border-cream-200">
          <div className="flex gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 text-sm tracking-widest uppercase">
            <span className="text-charcoal-900 font-semibold">All Stories</span>
            <span className="text-charcoal-400 hover:text-charcoal-900 cursor-pointer transition-colors">Itineraries</span>
            <span className="text-charcoal-400 hover:text-charcoal-900 cursor-pointer transition-colors">Guides</span>
            <span className="text-charcoal-400 hover:text-charcoal-900 cursor-pointer transition-colors">Hotels</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {blogPosts.slice(1).map((post) => (
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
      </div>
    </div>
  );
}
