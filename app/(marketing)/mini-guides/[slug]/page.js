import { miniGuides } from "@/data/mockData";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function MiniGuideDetails({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const guide = miniGuides.find(g => g.slug === resolvedParams.slug) || miniGuides[0];

  return (
    <div className="bg-cream-100 min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        <Link href="/mini-guides" className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-charcoal-800/60 hover:text-gold-600 transition-colors mb-10 border-b border-transparent hover:border-gold-600 pb-1">
          <ArrowLeft size={16} /> Back to Guides
        </Link>
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gold-500 text-white px-4 py-1 text-xs tracking-widest uppercase mb-6 font-semibold rounded-sm">
            {guide.type === 'pocket' ? 'Pocket Guide' : 'Itinerary Guide'}
          </div>
          <h1 className="text-4xl md:text-6xl font-serif text-charcoal-900 mb-6 leading-tight">
            {guide.title}
          </h1>
          <p className="text-xl text-charcoal-800/70 font-light">
            {guide.shortDescription || guide.excerpt}
          </p>
        </div>

      </div>

      {/* Hero Image */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="aspect-[21/9] w-full relative overflow-hidden rounded-xl shadow-xl">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${guide.heroImage})` }}
          ></div>
        </div>
        
        <div className="bg-white max-w-4xl mx-auto -mt-16 relative z-10 p-8 shadow-lg rounded-xl flex justify-between items-center text-center divide-x divide-cream-200">
          <div className="flex-1 px-4">
            <span className="block text-xs uppercase tracking-widest text-charcoal-800/60 mb-2">Destination</span>
            <span className="font-serif text-lg text-charcoal-900">{guide.destination}</span>
          </div>
          <div className="flex-1 px-4">
            <span className="block text-xs uppercase tracking-widest text-charcoal-800/60 mb-2">Duration</span>
            <span className="font-serif text-lg text-charcoal-900">{guide.idealDuration || `${guide.numberOfDays} Days`}</span>
          </div>
          <div className="flex-1 px-4">
            <span className="block text-xs uppercase tracking-widest text-charcoal-800/60 mb-2">
              {guide.type === 'pocket' ? 'Best Time' : 'Travel Type'}
            </span>
            <span className="font-serif text-lg text-charcoal-900">{guide.bestTime || guide.travelType}</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-lg prose-headings:font-serif prose-headings:font-normal max-w-none text-charcoal-800/80 font-light leading-relaxed">
          <h2 className="text-3xl font-serif text-charcoal-900 mb-6">Overview</h2>
          <p>
            This detailed guide gives you everything you need to know to experience the very best of {guide.destination}. We've handpicked our absolute favorite spots.
          </p>
          
          <h3 className="text-2xl font-serif text-charcoal-900 mt-12 mb-6">Day 1: Arrival & Exploration</h3>
          <p>Start your morning with a pastry at a local favorite before heading out to the main attractions...</p>
          
          <h3 className="text-2xl font-serif text-charcoal-900 mt-12 mb-6">Where to Sleep</h3>
          <ul>
            <li>Luxury: The Grand Hotel</li>
            <li>Boutique: The Hidden Gem Inn</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
