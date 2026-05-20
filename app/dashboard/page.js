"use client";

import { useState, useEffect } from "react";
import { fetchDestinations, fetchBlogs, fetchTours, fetchMiniGuides, fetchPackages } from "@/lib/db";
import { MapPin, FileText, Compass, BookOpen, Layers, PlusCircle, ArrowUpRight, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    destinations: 0,
    blogs: 0,
    tours: 0,
    guides: 0,
    packages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [d, b, t, g, p] = await Promise.all([
          fetchDestinations(),
          fetchBlogs(),
          fetchTours(),
          fetchMiniGuides(),
          fetchPackages()
        ]);
        setStats({
          destinations: d.length,
          blogs: b.filter(item => (item.status || "Draft").toLowerCase() === "published").length,
          tours: t.filter(item => (item.status || "published").toLowerCase() === "published").length,
          guides: g.filter(item => (item.status || "published").toLowerCase() === "published").length,
          packages: p.length
        });
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statsItems = [
    { title: "Destinations", value: stats.destinations, icon: <MapPin size={22} className="text-gold-600" />, href: "/dashboard/destinations" },
    { title: "Published Blogs", value: stats.blogs, icon: <FileText size={22} className="text-gold-600" />, href: "/dashboard/blog" },
    { title: "Active Tours", value: stats.tours, icon: <Compass size={22} className="text-gold-600" />, href: "/dashboard/tours" },
    { title: "Mini Guides", value: stats.guides, icon: <BookOpen size={22} className="text-gold-600" />, href: "/dashboard/pocket-guides" },
    { title: "Planning Packages", value: stats.packages, icon: <Layers size={22} className="text-gold-600" />, href: "/dashboard/packages" }
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif text-charcoal-900 mb-2">Dashboard Overview</h1>
          <p className="text-charcoal-800/70 text-sm">Welcome back, Elena. Here's a live summary of your publication activity today.</p>
        </div>
        <Link 
          href="/" 
          target="_blank"
          className="bg-charcoal-900 text-white px-4 py-2.5 rounded-md text-sm hover:bg-gold-600 transition-all flex items-center justify-center gap-2 font-medium self-start sm:self-auto"
        >
          View Live Site <ArrowUpRight size={15} />
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-gold-600" size={36} />
          <p className="text-charcoal-800/60 text-sm font-medium">Gathering publication metrics...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            {statsItems.map((stat, idx) => (
              <Link 
                href={stat.href} 
                key={idx} 
                className="bg-white p-6 rounded-xl shadow-xs border border-cream-200 hover:border-gold-500 hover:shadow-sm transition-all group"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="p-2 bg-cream-100 rounded-lg">{stat.icon}</div>
                  <ArrowRight size={14} className="text-charcoal-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="text-3xl font-serif text-charcoal-900 mb-1">{stat.value}</div>
                <div className="text-xs text-charcoal-800/60 uppercase tracking-widest font-medium">{stat.title}</div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-xs border border-cream-200 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-cream-200">
                <h2 className="font-serif text-xl text-charcoal-900 font-bold">Quick Administration Actions</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4 flex-1">
                <Link href="/dashboard/blog" className="p-4 border border-cream-200 rounded-lg text-left hover:border-gold-500 hover:bg-cream-100/30 transition-all group flex flex-col justify-between">
                  <div>
                    <FileText className="text-charcoal-400 group-hover:text-gold-500 mb-3" size={24} />
                    <div className="text-charcoal-900 font-medium mb-1">Write Blog Post</div>
                    <div className="text-xs text-charcoal-800/60">Publish news, travel journals, and stories.</div>
                  </div>
                  <div className="text-xs font-semibold text-gold-700 mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-all">Go to Blogs &rarr;</div>
                </Link>
                <Link href="/dashboard/destinations" className="p-4 border border-cream-200 rounded-lg text-left hover:border-gold-500 hover:bg-cream-100/30 transition-all group flex flex-col justify-between">
                  <div>
                    <MapPin className="text-charcoal-400 group-hover:text-gold-500 mb-3" size={24} />
                    <div className="text-charcoal-900 font-medium mb-1">Add Destination</div>
                    <div className="text-xs text-charcoal-800/60">Introduce new countries and galleries.</div>
                  </div>
                  <div className="text-xs font-semibold text-gold-700 mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-all">Go to Destinations &rarr;</div>
                </Link>
                <Link href="/dashboard/tours" className="p-4 border border-cream-200 rounded-lg text-left hover:border-gold-500 hover:bg-cream-100/30 transition-all group flex flex-col justify-between">
                  <div>
                    <Compass className="text-charcoal-400 group-hover:text-gold-500 mb-3" size={24} />
                    <div className="text-charcoal-900 font-medium mb-1">Create Tour</div>
                    <div className="text-xs text-charcoal-800/60">Offer guided experiences or fast-track passes.</div>
                  </div>
                  <div className="text-xs font-semibold text-gold-700 mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-all">Go to Tours &rarr;</div>
                </Link>
                <Link href="/dashboard/pocket-guides" className="p-4 border border-cream-200 rounded-lg text-left hover:border-gold-500 hover:bg-cream-100/30 transition-all group flex flex-col justify-between">
                  <div>
                    <BookOpen className="text-charcoal-400 group-hover:text-gold-500 mb-3" size={24} />
                    <div className="text-charcoal-900 font-medium mb-1">New Pocket Guide</div>
                    <div className="text-xs text-charcoal-800/60">Create compact guide assets for swift view.</div>
                  </div>
                  <div className="text-xs font-semibold text-gold-700 mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-all">Go to Guides &rarr;</div>
                </Link>
              </div>
            </div>

            {/* Publication Activity Status */}
            <div className="bg-white rounded-xl shadow-xs border border-cream-200 overflow-hidden flex flex-col justify-between">
              <div>
                <div className="p-6 border-b border-cream-200 flex justify-between items-center">
                  <h2 className="font-serif text-xl text-charcoal-900 font-bold">Activity Guidelines</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="p-4 rounded-lg bg-cream-100/40 border border-cream-200/50">
                    <h3 className="font-serif text-charcoal-900 font-medium mb-1">1. Keep High Resolution Cover Images</h3>
                    <p className="text-xs text-charcoal-800/60 leading-relaxed">
                      For Destinations, Blogs, and Mini Guides, premium typography layouts render best when paired with high-quality, atmospheric photography.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-cream-100/40 border border-cream-200/50">
                    <h3 className="font-serif text-charcoal-900 font-medium mb-1">2. Connect Destinations to Content</h3>
                    <p className="text-xs text-charcoal-800/60 leading-relaxed">
                      Ensure your Tours and Mini Guides are tagged with destinations currently listed. The frontend automatically counts and bundles them for premium display under each country section!
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-cream-100/20 border-t border-cream-200 flex justify-between items-center text-xs text-charcoal-800/50 font-medium">
                <span>Database Sync Active</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> Online</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
