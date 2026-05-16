import { blogPosts } from "@/data/mockData";
import Link from "next/link";
import { Clock, Mail } from "lucide-react";

const Twitter = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>;
const Facebook = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;

export default async function BlogDetails({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const post = blogPosts.find(p => p.slug === resolvedParams.slug) || blogPosts[0];

  return (
    <div className="bg-cream-100 min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 text-xs text-charcoal-800/60 uppercase tracking-widest mb-6">
            <Link href={`/destinations/${post.destination.toLowerCase()}`} className="hover:text-gold-600 transition-colors">{post.destination}</Link>
            <span className="w-1 h-1 rounded-full bg-gold-500"></span>
            <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
            <span className="w-1 h-1 rounded-full bg-gold-500"></span>
            <span>{post.date}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif text-charcoal-900 mb-8 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm font-light text-charcoal-800/80">
            <span>By <span className="font-medium text-charcoal-900">{post.author}</span></span>
          </div>
        </div>

      </div>

      {/* Hero Image */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="aspect-video w-full relative overflow-hidden rounded-sm shadow-xl">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${post.coverImage})` }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-lg prose-headings:font-serif prose-headings:font-normal prose-a:text-gold-600 max-w-none text-charcoal-800/80 font-light leading-relaxed mb-16">
          <p className="text-2xl font-serif text-charcoal-900 leading-relaxed mb-8">
            {post.excerpt}
          </p>
          <p>
            {post.content}
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <blockquote className="border-l-2 border-gold-500 pl-6 my-10 italic text-charcoal-900 font-serif text-2xl">
            "The journey not the arrival matters. Every step of this itinerary was designed to create lasting memories."
          </blockquote>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>

        {/* Share & Tags */}
        <div className="border-t border-b border-cream-200 py-8 flex flex-col md:flex-row justify-between items-center gap-6 mb-20">
          <div className="flex gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="px-4 py-1 border border-charcoal-900/20 text-xs tracking-widest uppercase text-charcoal-800/70">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 text-charcoal-800/60">
            <span className="text-xs tracking-widest uppercase mr-2">Share:</span>
            <button className="hover:text-gold-600 transition-colors"><Facebook size={18} /></button>
            <button className="hover:text-gold-600 transition-colors"><Twitter size={18} /></button>
            <button className="hover:text-gold-600 transition-colors"><Mail size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
