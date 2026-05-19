import Link from "next/link";
import Image from "next/image";

export default function FeaturedBlogs({ blogs = [] }) {
  return (
    <section className="py-20 lg:py-28 bg-cream-100">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-[56px] font-serif text-charcoal-900 mb-4 tracking-tight leading-tight">
            Most <span className="text-mustard-500 uppercase font-sans font-bold">POPULAR</span> Posts
          </h2>
          <p className="text-charcoal-800/70 font-light text-[15px] md:text-base tracking-wide">
            Sit-down stories from places worth going slowly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.slice(0, 3).map((post) => (
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
                <span className="text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-4">
                  {post.date}
                </span>
                <h3 className="text-2xl font-serif text-charcoal-900 mb-6 leading-snug font-bold">
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
      </div>
    </section>
  );
}
