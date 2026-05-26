"use client";

import { useState, useEffect, useRef } from "react";
import { fetchDestinations, fetchBlogs, fetchTours, fetchMiniGuides, fetchPackages, fetchInquiries } from "@/lib/db";
import { 
  Menu, Search, Bell, ArrowRight, FileText, Mail, Plus, Check, MapPin, 
  ChevronRight, AlignJustify, Map, Calendar, Layers, LayoutList, Book,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    destinations: 0,
    blogs: 0,
    tours: 0,
    guides: 0,
    packages: 0,
    inquiries: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Search registry states
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [routingLoading, setRoutingLoading] = useState(false);
  const searchContainerRef = useRef(null);

  // Reset routing loader on mount/focus (handles browser back actions gracefully)
  useEffect(() => {
    setRoutingLoading(false);
  }, []);

  // Click outside listener for search suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter search database dynamically with a premium loading experience
  useEffect(() => {
    if (!dashboardSearchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    const timer = setTimeout(() => {
      const query = dashboardSearchQuery.toLowerCase();
      const filtered = searchData.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.category.toLowerCase().includes(query)
      );
      setSearchResults(filtered.slice(0, 8));
      setSearchLoading(false);
    }, 280); // Luxury debounce to simulate a live directory indexing lookup

    return () => clearTimeout(timer);
  }, [dashboardSearchQuery, searchData]);

  useEffect(() => {
    async function loadStats() {
      try {
        const [d, b, t, g, p, inq] = await Promise.all([
          fetchDestinations().catch(() => []),
          fetchBlogs().catch(() => []),
          fetchTours().catch(() => []),
          fetchMiniGuides().catch(() => []),
          fetchPackages().catch(() => []),
          fetchInquiries().catch(() => [])
        ]);
        
        setStats({
          destinations: d.length,
          blogs: b.length,
          tours: t.length,
          guides: g.length,
          packages: p.length,
          inquiries: inq.filter(item => item.status === 'new').length
        });

        setRecentInquiries(inq.slice(0, 4));

        // Compile recent activity from various tables
        const recentArr = [];
        b.forEach(item => recentArr.push({ 
          title: item.title || "Untitled Blog", 
          desc: `Blog Post`, 
          badge: (item.status || "Draft").toLowerCase() === "published" ? "Published" : "Draft", 
          badgeColor: (item.status || "Draft").toLowerCase() === "published" ? "bg-[#e7f5e9] text-[#1f7a3f]" : "bg-[#fff4d6] text-[#8a5b00]",
          date: new Date(item.created_at || Date.now())
        }));
        d.forEach(item => recentArr.push({
          title: item.name || item.country || "Untitled Destination",
          desc: `Destination`,
          badge: "Published",
          badgeColor: "bg-[#e7f5e9] text-[#1f7a3f]",
          date: new Date(item.created_at || Date.now())
        }));
        t.forEach(item => recentArr.push({
          title: item.name || "Untitled Tour",
          desc: `Tour`,
          badge: "Published",
          badgeColor: "bg-[#e7f5e9] text-[#1f7a3f]",
          date: new Date(item.created_at || Date.now())
        }));
        g.forEach(item => recentArr.push({
          title: item.title || "Untitled Guide",
          desc: `Mini Guide`,
          badge: "Published",
          badgeColor: "bg-[#e7f5e9] text-[#1f7a3f]",
          date: new Date(item.created_at || Date.now())
        }));
        
        recentArr.sort((a, b) => b.date - a.date);
        setRecentActivity(recentArr.slice(0, 4));

        // Build premium global search registry
        const searchArr = [
          { name: "Dashboard Overview", category: "Navigation Link", url: "/dashboard" },
          { name: "Homepage Manager", category: "Navigation Link", url: "/dashboard/homepage" },
          { name: "Destinations CMS", category: "Navigation Link", url: "/dashboard/destinations" },
          { name: "Blog Posts CMS", category: "Navigation Link", url: "/dashboard/blog" },
          { name: "Pocket Guides CMS", category: "Navigation Link", url: "/dashboard/pocket-guides" },
          { name: "Itinerary Guides CMS", category: "Navigation Link", url: "/dashboard/itinerary-guides" },
          { name: "Tours CMS", category: "Navigation Link", url: "/dashboard/tours" },
          { name: "Packages CMS", category: "Navigation Link", url: "/dashboard/packages" },
          { name: "Inquiries CMS", category: "Navigation Link", url: "/dashboard/inquiries" },
          { name: "Bookings CMS", category: "Navigation Link", url: "/dashboard/bookings" },
          { name: "Media Library CMS", category: "Navigation Link", url: "/dashboard/media-library" },
        ];
        
        b.forEach(item => searchArr.push({
          name: item.title || "Untitled Blog",
          category: "Blog Post",
          url: `/dashboard/blog?highlight=${item.id}`
        }));
        
        d.forEach(item => searchArr.push({
          name: item.country || "Untitled Destination",
          category: "Destination",
          url: `/dashboard/destinations?highlight=${item.id}`
        }));
        
        t.forEach(item => searchArr.push({
          name: item.title || "Untitled Tour",
          category: "Tour",
          url: `/dashboard/tours?highlight=${item.id}`
        }));
        
        g.forEach(item => {
          if (item.type === "pocket") {
            searchArr.push({
              name: item.title || "Untitled Guide",
              category: "Pocket Guide",
              url: `/dashboard/pocket-guides?highlight=${item.id}`
            });
          } else {
            searchArr.push({
              name: item.title || "Untitled Guide",
              category: "Itinerary Guide",
              url: `/dashboard/itinerary-guides?highlight=${item.id}`
            });
          }
        });
        
        setSearchData(searchArr);
        
      } catch (err) {
        console.warn("Failed to load dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    { title: "Destinations", value: stats.destinations, subtext: "Total published", icon: <ChevronRight size={18} /> },
    { title: "Blog Posts", value: stats.blogs, subtext: "Total stories", icon: <LayoutList size={18} /> },
    { title: "Mini Guides", value: stats.guides, subtext: "Pocket & Itineraries", icon: <Menu size={18} /> },
    { title: "New Inquiries", value: stats.inquiries, subtext: stats.inquiries > 0 ? "Awaiting response" : "Up to date", icon: <Mail size={18} /> },
    { title: "Tours", value: stats.tours, subtext: "Active offerings", icon: <Map size={18} /> },
    { title: "Packages", value: stats.packages, subtext: "Active packages", icon: <Plus size={18} /> },
    { title: "Bookings", value: "-", subtext: "Feature coming soon", icon: <Calendar size={18} /> },
    { title: "Published Pages", value: stats.destinations + stats.blogs + stats.guides + stats.tours, subtext: "Total across sections", icon: <Check size={18} /> }
  ];

  const modules = [
    { title: "Destinations", desc: "Country, description, why I love it and moments.", link: "/dashboard/destinations" },
    { title: "Blog Posts", desc: "Destination-based essays with city, date, tags and SEO.", link: "/dashboard/blog" },
    { title: "Pocket Guides", desc: "Quick destination guides with practical travel notes.", link: "/dashboard/pocket-guides" },
    { title: "Itinerary Guides", desc: "Route-based mini guides with day-by-day planning.", link: "/dashboard/itinerary-guides" },
    { title: "Tours", desc: "Curated tours organized by destination.", link: "/dashboard/tours" },
    { title: "Packages", desc: "Consultation, custom itinerary and concierge offers.", link: "/dashboard/packages" }
  ];

  const workflow = [
    { step: 1, title: "Create destination", desc: "Add country, destination description, why I love it and memorable moments." },
    { step: 2, title: "Attach content", desc: "Connect blog posts, pocket guides, itinerary guides and tours to the destination." },
    { step: 3, title: "Publish and promote", desc: "Feature selected destinations, guides and tours on the homepage or related pages." },
    { step: 4, title: "Convert inquiries", desc: "Move Plan with Me inquiries into bookings for consultations, itineraries or concierge planning." }
  ];

  return (
    <div className="w-full pb-10">
      {routingLoading && (
        <div className="fixed inset-0 bg-[#FAF8F5]/85 backdrop-blur-xs flex flex-col items-center justify-center z-[9999] animate-in fade-in duration-300 font-sans">
          <div className="brand-loader mb-5" style={{ '--s': '15px' }} />
          <span className="text-brand-ink font-serif font-bold text-sm tracking-wide">Navigating to content...</span>
          <span className="text-brand-muted text-[10px] mt-1.5 font-medium tracking-tight">ta</span>
        </div>
      )}
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between mb-10 pb-5 border-b border-brand-border">
        <div className="flex items-center gap-4">
          <Menu className="text-brand-ink md:hidden cursor-pointer" size={24} />
          <h1 className="text-lg md:text-xl font-bold text-brand-ink flex items-center gap-3">
            Dashboard Overview
          </h1>
        </div>
        <div ref={searchContainerRef} className="flex-1 max-w-xl mx-8 relative hidden lg:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
          <input 
            type="text" 
            value={dashboardSearchQuery}
            onChange={(e) => {
              setDashboardSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            placeholder="Search posts, guides, destinations..." 
            className="w-full bg-white border border-brand-border rounded-lg py-2.5 py-2.5 pl-11 pr-10 text-sm focus:outline-none focus:border-brand-mustard transition-colors shadow-sm" 
          />
          {searchLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="brand-loader" style={{ '--s': '7px' }} />
            </div>
          )}

          {showSearchDropdown && dashboardSearchQuery.trim() !== "" && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-brand-border rounded-xl shadow-lg z-50 overflow-hidden font-sans text-xs animate-in fade-in zoom-in-95 duration-100">
              {searchLoading ? (
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <div className="brand-loader mb-4 mx-auto" style={{ '--s': '10px' }} />
                  <span className="text-brand-muted text-[11px] font-medium">Searching directory...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="p-2 border-b border-brand-border/40 bg-brand-bg/10 text-brand-muted text-[10px] uppercase font-bold tracking-wider">
                    Search Results ({searchResults.length})
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-brand-border/40">
                    {searchResults.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setRoutingLoading(true);
                          router.push(item.url);
                          setShowSearchDropdown(false);
                          setDashboardSearchQuery("");
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#FAF8F5]/80 transition-colors flex items-center justify-between cursor-pointer group"
                      >
                        <div>
                          <div className="font-semibold text-brand-ink group-hover:text-[#c7962d] transition-colors">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-brand-muted mt-0.5 font-mono">
                            {item.url}
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#f6ead0]/30 text-[#8C764D] uppercase tracking-wider shrink-0 ml-2">
                          {item.category}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <span className="text-brand-muted font-bold text-[11px] mb-1">No matching items found</span>
                  <span className="text-brand-muted/70 text-[10px]">Try typing destinations, guides, or blog titles</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <div className="relative cursor-pointer">
            <Bell size={20} className="text-brand-mustard" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-mustard rounded-full"></span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f6ead0] text-[#c7962d] flex items-center justify-center font-bold text-sm shrink-0">
              AW
            </div>
            <div className="hidden md:block text-sm">
              <div className="font-bold text-brand-ink leading-tight">Ava Wright</div>
              <div className="text-brand-muted text-xs">Administrator</div>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-[2.75rem] font-serif text-brand-ink mb-3 font-bold tracking-tight">Welcome back</h2>
          <p className="text-brand-muted text-sm leading-relaxed max-w-xl">
            Manage The Long Way's editorial travel content, destination pages, mini guides, tours, packages, inquiries and bookings from one CMS dashboard.
          </p>
        </div>
        <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
          <Link href="/" target="_blank" className="w-full md:w-auto px-6 py-2.5 bg-white border border-brand-border rounded-lg text-sm font-bold text-brand-ink hover:bg-gray-50 transition-colors shadow-sm text-center">
            View Website
          </Link>
          <Link href="/dashboard/destinations" className="w-full md:w-auto px-6 py-2.5 bg-[#c7962d] text-white rounded-lg text-sm font-bold hover:bg-[#b58522] transition-colors shadow-sm text-center">
            + Create Content
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 font-sans">
          <div className="brand-loader mb-3" style={{ '--s': '12px' }} />
          <span className="text-brand-muted text-[11px] font-medium tracking-tight">Loading metrics...</span>
        </div>
      ) : (
        <>
          {/* Hero & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className="lg:col-span-2 relative rounded-2xl overflow-hidden min-h-[340px] flex flex-col justify-end p-8 md:p-10 text-white shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop" 
                alt="Hero Background" 
                className="absolute inset-0 w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10"></div>
              <div className="relative z-10 max-w-xl">
                <div className="text-[11px] font-bold tracking-[0.15em] uppercase mb-4 text-white/90">Editorial CMS</div>
                <h3 className="text-3xl md:text-[2.5rem] font-serif mb-5 leading-tight font-bold">Keep every destination, guide, itinerary and service page organized.</h3>
                <p className="text-sm text-white/90 leading-relaxed font-medium">
                  Track what is published, what needs editing and which inquiries need a response before they turn cold.
                </p>
              </div>
            </div>
            
            <div className="bg-[#faf7f1] border border-brand-border rounded-2xl p-6 flex flex-col shadow-sm">
              <h3 className="font-bold text-[1.05rem] text-brand-ink mb-1">Quick Actions</h3>
              <p className="text-[13px] text-brand-muted mb-6">Create the most common content types directly from the dashboard.</p>
              <div className="flex flex-col gap-2.5 flex-1 justify-between">
                <Link href="/dashboard/destinations" className="flex items-center justify-between p-3.5 bg-white border border-brand-border rounded-xl text-sm font-semibold text-brand-ink hover:border-[#c7962d] transition-colors text-left group shadow-sm">
                  Add Destination
                  <ArrowRight size={16} className="text-[#c7962d] opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
                <Link href="/dashboard/blog" className="flex items-center justify-between p-3.5 bg-white border border-brand-border rounded-xl text-sm font-semibold text-brand-ink hover:border-[#c7962d] transition-colors text-left group shadow-sm">
                  Add Blog Post
                  <ArrowRight size={16} className="text-[#c7962d] opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
                <Link href="/dashboard/pocket-guides" className="flex items-center justify-between p-3.5 bg-white border border-brand-border rounded-xl text-sm font-semibold text-brand-ink hover:border-[#c7962d] transition-colors text-left group shadow-sm">
                  Add Pocket Guide
                  <ArrowRight size={16} className="text-[#c7962d] opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
                <Link href="/dashboard/itinerary-guides" className="flex items-center justify-between p-3.5 bg-white border border-brand-border rounded-xl text-sm font-semibold text-brand-ink hover:border-[#c7962d] transition-colors text-left group shadow-sm">
                  Add Itinerary Guide
                  <ArrowRight size={16} className="text-[#c7962d] opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
                <button className="flex items-center justify-between p-3.5 bg-white border border-brand-border rounded-xl text-sm font-semibold text-brand-ink hover:border-[#c7962d] transition-colors text-left group shadow-sm">
                  Review New Inquiry
                  <ArrowRight size={16} className="text-[#c7962d] opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
            {statCards.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-brand-border flex flex-col justify-between h-[155px] shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start">
                  <div className="text-[13px] text-brand-muted font-medium">{stat.title}</div>
                  <div className="w-[34px] h-[34px] rounded-full bg-[#f6ead0] flex items-center justify-center text-[#c7962d] group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                </div>
                <div>
                  <div className="text-[2.5rem] font-serif text-brand-ink mb-1.5 font-bold leading-none">{stat.value}</div>
                  <div className="text-[11px] font-bold text-[#1f7a3f]">{stat.subtext}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity & Modules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-10 mb-12">
            {/* Recent Content Activity */}
            <div>
              <div className="flex justify-between items-center mb-5 px-1">
                <h3 className="font-bold text-[1.1rem] text-brand-ink">Recent Content Activity</h3>
                <button className="text-[13px] font-bold text-[#c7962d] hover:text-[#b58522]">View all</button>
              </div>
              <div className="flex flex-col gap-3.5">
                {recentActivity.length > 0 ? recentActivity.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-brand-border shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-[#a68a56] shrink-0 overflow-hidden relative">
                         <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
                      </div>
                      <div>
                        <div className="font-bold text-brand-ink text-[13px] mb-1 truncate max-w-[200px] sm:max-w-[300px]">{item.title}</div>
                        <div className="text-[12px] text-brand-muted">{item.desc}</div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 ${item.badgeColor}`}>
                      {item.badge}
                    </div>
                  </div>
                )) : (
                  <div className="p-6 bg-white rounded-2xl border border-brand-border shadow-sm text-center text-brand-muted text-sm">
                    No recent activity
                  </div>
                )}
              </div>
            </div>

            {/* CMS Modules */}
            <div>
              <div className="flex justify-between items-center mb-5 px-1">
                <h3 className="font-bold text-[1.1rem] text-brand-ink">CMS Modules</h3>
                <button className="text-[13px] font-bold text-[#c7962d] hover:text-[#b58522]">Open sitemap</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {modules.map((mod, i) => (
                  <Link href={mod.link} key={i} className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow h-full min-h-[140px] group">
                    <div>
                      <div className="font-bold text-brand-ink text-[13px] mb-2">{mod.title}</div>
                      <div className="text-[12px] text-brand-muted leading-relaxed mb-4">{mod.desc}</div>
                    </div>
                    <div className="text-[12px] font-bold text-[#c7962d] text-left flex items-center gap-1.5 w-fit mt-auto">
                      Manage <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Inquiries & Workflow */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-10">
            {/* New Inquiries */}
            <div>
              <div className="flex justify-between items-center mb-5 px-1">
                <h3 className="font-bold text-[1.1rem] text-brand-ink">Recent Inquiries</h3>
                <Link href="/dashboard/inquiries" className="text-[13px] font-bold text-[#c7962d] hover:text-[#b58522]">Manage inquiries</Link>
              </div>
              <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-brand-border bg-brand-bg/10">
                        <th className="p-4 pt-5 pb-3 font-bold text-brand-muted uppercase tracking-wider">Name</th>
                        <th className="p-4 pt-5 pb-3 font-bold text-brand-muted uppercase tracking-wider">Request Type</th>
                        <th className="p-4 pt-5 pb-3 font-bold text-brand-muted uppercase tracking-wider">Destination</th>
                        <th className="p-4 pt-5 pb-3 font-bold text-brand-muted uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/50">
                      {recentInquiries.length > 0 ? (
                        recentInquiries.map((inq) => (
                          <tr key={inq.id} className="hover:bg-brand-bg/10 transition-colors">
                            <td className="p-4 font-semibold text-brand-ink">
                              <div>{inq.name}</div>
                              <div className="text-[10px] text-brand-muted font-normal">{inq.email}</div>
                            </td>
                            <td className="p-4 text-brand-ink">{inq.package || "Custom"}</td>
                            <td className="p-4 text-brand-ink">{inq.destinations || "Not specified"}</td>
                            <td className="p-4">
                              {inq.status === 'new' ? (
                                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-brand-mustard/15 text-[#c7962d]">New</span>
                              ) : inq.status === 'read' ? (
                                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800">Read</span>
                              ) : (
                                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-green-100 text-green-800">Replied</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="p-8 py-10 text-center text-brand-muted text-[13px]">
                            No inquiries yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Editorial Workflow */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-5 px-1">
                <h3 className="font-bold text-[1.1rem] text-brand-ink">Editorial Workflow</h3>
                <button className="text-[13px] font-bold text-[#c7962d] hover:text-[#b58522]">View queue</button>
              </div>
              <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-8 flex-1">
                <div className="flex flex-col gap-7">
                  {workflow.map((item, i) => (
                    <div key={i} className="flex items-start gap-5">
                      <div className="w-[34px] h-[34px] rounded-full bg-[#f6ead0] text-[#c7962d] font-bold flex items-center justify-center shrink-0 text-sm">
                        {item.step}
                      </div>
                      <div className="mt-0.5">
                        <div className="font-bold text-brand-ink text-[13px] mb-1.5">{item.title}</div>
                        <div className="text-[13px] text-brand-muted leading-relaxed max-w-[90%]">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
