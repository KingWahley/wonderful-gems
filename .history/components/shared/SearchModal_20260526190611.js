"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, X, Globe, BookOpen, Map, Compass } from "lucide-react";
import { supabase } from "@/lib/db";

const flagMap = {
  "japan": "🇯🇵",
  "portugal": "🇵🇹",
  "chile": "🇨🇱",
  "mexico": "🇲🇽",
  "morocco": "🇲🇦",
  "iceland": "🇮🇸",
  "vietnam": "🇻🇳",
  "italy": "🇮🇹",
  "belgium": "🇧🇪"
};

export default function SearchModal({ isOpen, onClose }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigatingRef = useRef(false);

  // Close loader and modal when path changes and user was actively navigating
  useEffect(() => {
    if (navigatingRef.current) {
      setIsNavigating(false);
      navigatingRef.current = false;
      onClose();
    }
  }, [pathname, onClose]);

  const [data, setData] = useState({
    destinations: [],
    blogPosts: [],
    miniGuides: [],
    tours: []
  });
  const [loading, setLoading] = useState(false);

  // Reset search state and load data on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveTab("all");
      setSelectedIndex(0);
      
      const loadSearchData = async () => {
        setLoading(true);
        try {
          const [
            { data: destinations },
            { data: blogPosts },
            { data: miniGuides },
            { data: tours }
          ] = await Promise.all([
            supabase.from("destinations").select("*"),
            supabase.from("blog_posts").select("*"),
            supabase.from("mini_guides").select("*"),
            supabase.from("tours").select("*")
          ]);
          
          setData({
            destinations: destinations || [],
            blogPosts: blogPosts || [],
            miniGuides: miniGuides || [],
            tours: tours || []
          });
        } catch (error) {
          console.error("Error loading search data:", error);
        } finally {
          setLoading(false);
        }
      };

      loadSearchData();

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Combine and format all searchable items
  const getAllSearchableItems = () => {
    const items = [];

    // 1. Destinations
    data.destinations.forEach(dest => {
      items.push({
        id: `dest-${dest.id}`,
        type: "destination",
        title: dest.country,
        subtitle: dest.region || "Destination",
        description: dest.excerpt || dest.description || "",
        url: `/destinations/${dest.slug}`,
        flag: flagMap[dest.slug] || "📍",
        raw: `${dest.country} ${dest.region || ""} ${dest.excerpt || ""} ${dest.description || ""}`.toLowerCase()
      });
    });

    // 2. Blog Posts
    data.blogPosts.forEach(post => {
      items.push({
        id: `blog-${post.id}`,
        type: "blog",
        title: post.title,
        subtitle: `Blog Post • ${post.destination}`,
        description: post.excerpt || "",
        url: `/blog/${post.slug}`,
        flag: "📖",
        raw: `${post.title} ${post.destination} ${post.excerpt || ""} ${post.category || ""}`.toLowerCase()
      });
    });

    // 3. Mini Guides
    data.miniGuides.forEach(guide => {
      items.push({
        id: `guide-${guide.id}`,
        type: "guide",
        title: guide.title,
        subtitle: `Mini Guide • ${guide.destination}`,
        description: guide.excerpt || "",
        url: `/mini-guides/${guide.slug}`,
        flag: "⚡",
        raw: `${guide.title} ${guide.destination} ${guide.excerpt || ""}`.toLowerCase()
      });
    });

    // 4. Tours
    data.tours.forEach(tour => {
      items.push({
        id: `tour-${tour.id}`,
        type: "tour",
        title: tour.title,
        subtitle: `Tour & Activity • ${tour.destination}`,
        description: tour.description || "",
        url: `/tours/${tour.slug || tour.id}`,
        flag: "☀️",
        raw: `${tour.title} ${tour.destination} ${tour.description || ""} ${tour.category || ""}`.toLowerCase()
      });
    });

    return items;
  };

  const allItems = getAllSearchableItems();

  // Filter items based on query and tab selection
  const getFilteredResults = () => {
    if (!query.trim()) return [];
    
    const searchTerms = query.toLowerCase().split(" ").filter(t => t);
    
    let filtered = allItems.filter(item => {
      return searchTerms.every(term => item.raw.includes(term));
    });

    if (activeTab !== "all") {
      filtered = filtered.filter(item => item.type === activeTab);
    }

    return filtered;
  };

  const results = getFilteredResults();

  // Reset selected index when query or tab changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeTab]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || isNavigating) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (results.length > 0 ? (prev + 1) % results.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, isNavigating]);

  // Scroll active result into view
  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  const handleSelect = (item) => {
    setIsNavigating(true);
    navigatingRef.current = true;
    router.push(item.url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-charcoal-900/40 backdrop-blur-md flex items-start justify-center pt-24 px-4 pb-4">
      {/* Backdrop close */}
      <div className="absolute inset-0" onClick={!isNavigating ? onClose : undefined}></div>

      {/* Modal Box */}
      <div className="bg-[#FBF7EE] w-full max-w-2xl rounded-[24px] border border-charcoal-900/10 shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[70vh]">
        {/* Navigation Loading Screen Overlay */}
        {isNavigating && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-md z-[110] flex flex-col items-center justify-center text-center">
            <div className="mb-6">
              <div className="brand-loader mx-auto" style={{ '--s': '14px' }} />
            </div>
            <p className="font-serif text-charcoal-900 text-lg font-bold mb-1">Setting off...</p>
            <p className="text-xs text-charcoal-700/60 font-light">Loading your next destination</p>
          </div>
        )}
        
        {/* Header Search Input */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-charcoal-900/5 bg-[#F7F2E7]">
          <Search size={20} className="text-[#DCAE1D]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search countries, blogs, pocket guides, or activities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-charcoal-900 text-base placeholder:text-charcoal-900/45 w-full font-serif"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-charcoal-900/5 text-charcoal-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        {query.trim().length > 0 && (
          <div className="flex items-center gap-1.5 px-6 py-3 border-b border-charcoal-900/5 bg-[#F5EEDC]/40 overflow-x-auto whitespace-nowrap">
            {[
              { id: "all", label: "All results" },
              { id: "destination", label: "Destinations", icon: Globe },
              { id: "blog", label: "Stories & Blogs", icon: BookOpen },
              { id: "guide", label: "Pocket Guides", icon: Compass },
              { id: "tour", label: "Tours", icon: Map }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${
                    activeTab === tab.id
                      ? "bg-mustard-500 text-white shadow-sm"
                      : "text-charcoal-800 hover:bg-charcoal-900/5"
                  }`}
                >
                  {Icon && <Icon size={12} />}
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Results Body */}
        <div 
          ref={resultsContainerRef} 
          className="flex-1 overflow-y-auto p-4 space-y-1.5"
        >
          {query.trim().length === 0 ? (
            <div className="py-16 text-center">
              <Compass className="mx-auto text-mustard-500 mb-4 animate-spin-slow" size={32} />
              <p className="font-serif text-charcoal-900 text-lg font-bold mb-2">Search The Long Way Home</p>
              <p className="text-xs text-charcoal-700/60 font-light max-w-sm mx-auto leading-relaxed">
                Find itineraries, private tours, curated guides, and stories by searching any country or experience.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-16 text-center">
              <span className="text-4xl block mb-4">🔍</span>
              <p className="font-serif text-charcoal-900 text-lg font-bold mb-2">No matches found</p>
              <p className="text-xs text-charcoal-700/60 font-light max-w-sm mx-auto leading-relaxed">
                We couldn't find any results matching "{query}". Try checking your spelling or search for something else.
              </p>
            </div>
          ) : (
            results.map((item, index) => {
              const isActive = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  data-active={isActive ? "true" : "false"}
                  className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                    isActive 
                      ? "bg-white border-mustard-500 shadow-md translate-x-1" 
                      : "bg-transparent border-transparent hover:bg-white/60 hover:border-charcoal-900/5"
                  }`}
                >
                  {/* Category icon / flag */}
                  <div className="w-10 h-10 rounded-full bg-cream-200 border border-charcoal-900/5 flex items-center justify-center text-lg flex-shrink-0 shadow-inner">
                    {item.flag}
                  </div>

                  {/* Info details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[9px] font-bold tracking-widest text-[#DCAE1D] uppercase truncate">
                        {item.subtitle}
                      </span>
                    </div>
                    <h4 className="font-serif text-base font-bold text-charcoal-900 leading-snug mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-charcoal-700/75 leading-relaxed font-light line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Action arrow */}
                  <div className={`text-coral-500 font-serif text-lg self-center transition-all ${
                    isActive ? "opacity-100 translate-x-1" : "opacity-0"
                  }`}>
                    →
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-6 py-3.5 bg-[#F7F2E7] border-t border-charcoal-900/5 text-[9px] font-bold tracking-widest text-charcoal-900/40 uppercase flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>Esc to Close</span>
        </div>

      </div>
    </div>
  );
}
