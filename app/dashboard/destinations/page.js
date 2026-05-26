"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  fetchDestinations, deleteDestination, saveDestination, fetchBlogs, fetchTours, fetchMiniGuides 
} from "@/lib/db";
import { 
  Plus, Edit, Eye, Trash2, Search, Loader2, ChevronDown, 
  Inbox, Check, ExternalLink, Archive 
} from "lucide-react";

export default function DestinationsCMS() {
  const [destinations, setDestinations] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [tours, setTours] = useState([]);
  const [guides, setGuides] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All statuses");
  const [selectedSort, setSelectedSort] = useState("Sort by newest");
  
  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDropdownOpen, setBulkDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Highlighting and Scroll-To logic for searches
  const [highlightedRowId, setHighlightedRowId] = useState(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedSort]);

  async function loadData() {
    try {
      setLoading(true);
      // Fetch all related tables to perform dynamic cross-reference counts
      const [destData, blogData, tourData, guideData] = await Promise.all([
        fetchDestinations(),
        fetchBlogs().catch(() => []),
        fetchTours().catch(() => []),
        fetchMiniGuides().catch(() => [])
      ]);
      
      setDestinations(destData || []);
      setBlogs(blogData || []);
      setTours(tourData || []);
      setGuides(guideData || []);
    } catch (e) {
      console.warn("Failed to load destinations dashboard data:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id, countryName) => {
    if (confirm(`Are you sure you want to delete the destination page for ${countryName}?`)) {
      try {
        setDestinations(prev => prev.filter(d => d.id !== id));
        await deleteDestination(id);
      } catch (e) {
        alert("Failed to delete destination: " + e.message);
        loadData(); // Reload on failure
      }
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) {
      alert("Please select one or more destinations first.");
      return;
    }

    if (action === "delete") {
      if (confirm(`Are you sure you want to delete the ${selectedIds.length} selected destinations?`)) {
        try {
          setLoading(true);
          await Promise.all(selectedIds.map(id => deleteDestination(id)));
          setSelectedIds([]);
          await loadData();
          alert("Selected destinations successfully deleted.");
        } catch (e) {
          alert("Failed to delete selected destinations: " + e.message);
        } finally {
          setLoading(false);
        }
      }
    } else if (action === "publish" || action === "draft") {
      const nextStatus = action === "publish" ? "published" : "draft";
      if (confirm(`Change status to ${nextStatus} for ${selectedIds.length} selected destinations?`)) {
        try {
          setLoading(true);
          await Promise.all(
            selectedIds.map(async (id) => {
              const d = destinations.find(dest => dest.id === id);
              if (d) {
                const payload = { ...d, status: nextStatus };
                await saveDestination(payload);
              }
            })
          );
          setSelectedIds([]);
          await loadData();
          alert(`Selected destinations successfully set to ${nextStatus}.`);
        } catch (e) {
          alert("Failed to update selected destinations: " + e.message);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Parsing Utility to split "Why I Love It" into bold title and body dynamically
  const parseWhyILoveIt = (text) => {
    if (!text) return { title: "Why I Love It", body: "No details added yet." };
    
    // Split by colon
    const colonIndex = text.indexOf(":");
    if (colonIndex !== -1) {
      return {
        title: text.substring(0, colonIndex).trim(),
        body: text.substring(colonIndex + 1).trim()
      };
    }
    
    // Split by period/sentence
    const periodIndex = text.indexOf(".");
    if (periodIndex !== -1) {
      return {
        title: text.substring(0, periodIndex).trim(),
        body: text.substring(periodIndex + 1).trim() || text
      };
    }
    
    // Fallback: take first 4 words as title, rest as body
    const words = text.split(" ");
    if (words.length > 4) {
      return {
        title: words.slice(0, 4).join(" "),
        body: words.slice(4).join(" ")
      };
    }
    
    return { title: text, body: "" };
  };

  // Filter & Sort Logic
  const filtered = destinations
    .filter(dest => {
      const matchSearch = (dest.country || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchStatus = true;
      if (selectedStatus !== "All statuses") {
        matchStatus = (dest.status || "").toLowerCase() === selectedStatus.toLowerCase();
      }

      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (selectedSort === "Sort by newest") {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (selectedSort === "Sort by oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      if (selectedSort === "Sort by country") {
        return (a.country || "").localeCompare(b.country || "");
      }
      return 0;
    });

  const itemsPerPage = 15;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayedDestinations = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Highlighting and Scroll-To logic for searches
  useEffect(() => {
    if (typeof window === "undefined" || destinations.length === 0) return;
    const searchParams = new URLSearchParams(window.location.search);
    const highlight = searchParams.get("highlight");
    if (!highlight) return;

    // Find the item index in filtered
    const index = filtered.findIndex(dest => String(dest.id) === String(highlight));
    if (index === -1) return;

    // Determine page (max 15 rows/page)
    const itemPage = Math.ceil((index + 1) / 15);
    setCurrentPage(itemPage);
    setHighlightedRowId(highlight);

    // Perform smooth scroll & flash after a short render delay
    setTimeout(() => {
      const el = document.getElementById(`row-${highlight}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 450);

    // Clean up parameter from URL
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);

    // Remove flash highlight class
    const timer = setTimeout(() => {
      setHighlightedRowId(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [destinations, filtered]);

  // Metric Totals
  const totalCount = destinations.length;
  const publishedCount = destinations.filter(d => (d.status || "").toLowerCase() === "published").length;
  const draftCount = destinations.filter(d => (d.status || "").toLowerCase() === "draft" || (d.status || "").toLowerCase() === "new").length;
  
  // Total linked posts count
  const totalLinkedCount = blogs.length + tours.length + guides.length;

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "published":
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-green-100/70 text-green-700 tracking-wide">Published</span>;
      case "draft":
      case "new":
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-brand-mustard/15 text-[#c7962d] tracking-wide">Draft</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-gray-100 text-gray-700 uppercase">{status}</span>;
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const getAvatarInitials = (name) => {
    if (!name) return "??";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-full pb-16 font-sans">
      
      {/* Top Header Mockup */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-8 gap-4 pb-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-ink mb-1.5 tracking-tight">
            Destinations
          </h1>
          <p className="text-brand-muted text-xs leading-relaxed max-w-3xl">
            Create, edit and manage destination pages. Each destination includes a country, description, "Why I Love It" title and body, memorable moments, image, status and linked content.
          </p>
        </div>
        
        {/* Navigation Action */}
        <Link
          href="/dashboard/destinations/add"
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#c7962d] hover:bg-[#b58522] text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0 w-full sm:w-auto text-center"
        >
          <Plus size={14} className="stroke-[3px]" />
          Add Destination
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Destinations", value: totalCount },
          { label: "Published", value: publishedCount },
          { label: "Drafts", value: draftCount },
          { label: "Linked Posts", value: totalLinkedCount }
        ].map((card, idx) => (
          <div key={idx} className="bg-white border border-brand-border/70 rounded-xl p-5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-brand-muted tracking-widest block mb-1">{card.label}</span>
            <span className="text-3xl font-serif font-bold text-brand-ink">{card.value}</span>
          </div>
        ))}
      </div>

      {/* Destinations List Main Card */}
      <div className="bg-white border border-brand-border/70 rounded-2xl shadow-xs p-6">
        
        {/* Header Row */}
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-brand-border/40">
          <h2 className="font-serif font-bold text-lg text-brand-ink">Destinations List</h2>
          
          {/* Bulk Actions Dropdown */}
          {selectedIds.length > 1 && (
            <div className="relative animate-in fade-in duration-200">
              <button 
                onClick={() => setBulkDropdownOpen(!bulkDropdownOpen)}
                className="px-3 py-1.5 border border-brand-border rounded-lg text-xs font-bold text-brand-ink hover:bg-brand-bg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                Bulk Actions <ChevronDown size={12} />
              </button>
              {bulkDropdownOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-brand-border rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button 
                    onClick={() => { handleBulkAction("publish"); setBulkDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs text-brand-ink hover:bg-brand-bg transition-colors cursor-pointer"
                  >
                    Mark as Published
                  </button>
                  <button 
                    onClick={() => { handleBulkAction("draft"); setBulkDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs text-brand-ink hover:bg-brand-bg transition-colors cursor-pointer"
                  >
                    Mark as Draft
                  </button>
                  <hr className="border-brand-border my-1" />
                  <button 
                    onClick={() => { handleBulkAction("delete"); setBulkDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    Delete Selected
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
            <input 
              type="text" 
              placeholder="Search by country..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF8F5]/40 border border-brand-border rounded-lg py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-[#c7962d] transition-colors placeholder:text-brand-muted/70" 
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-white border border-brand-border rounded-lg py-2 px-3 pr-8 text-xs focus:outline-none focus:border-[#c7962d] appearance-none text-brand-ink cursor-pointer"
            >
              <option value="All statuses">All statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
          </div>

          {/* Sorting Dropdown */}
          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full bg-white border border-brand-border rounded-lg py-2 px-3 pr-8 text-xs focus:outline-none focus:border-[#c7962d] appearance-none text-brand-ink cursor-pointer"
            >
              <option value="Sort by newest">Sort by newest</option>
              <option value="Sort by oldest">Sort by oldest</option>
              <option value="Sort by country">Sort by country</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
          </div>

        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#c7962d] mb-3" size={24} />
            <span className="text-brand-muted text-xs">Loading destinations...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <Inbox size={24} className="text-brand-muted mb-2" />
            <span className="text-brand-muted text-xs font-semibold">No destinations in your directory.</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-luxury">
              <table className="w-full text-left text-xs whitespace-nowrap table-auto border-collapse">
                <thead>
                  <tr className="border-b border-brand-border/40 text-brand-muted font-bold tracking-wider uppercase bg-[#FAF8F5]/30">
                    <th className="p-3 w-8"></th>
                    <th className="p-3 pl-1 pb-3 text-[10px]">Country</th>
                    <th className="p-3 pb-3 text-[10px]">Description</th>
                    <th className="p-3 pb-3 text-[10px]">Why I Love It</th>
                    <th className="p-3 pb-3 text-[10px] text-center">Moments</th>
                    <th className="p-3 pb-3 text-[10px]">Linked Content</th>
                    <th className="p-3 pb-3 text-[10px]">Status</th>
                    <th className="p-3 pb-3 text-right text-[10px] pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/30">
                  {displayedDestinations.map((item) => {
                    // Perform dynamic lookup for linked counts
                    const linkedBlogs = blogs.filter(b => b.destination_id === item.id || (b.destination || "").toLowerCase() === (item.country || "").toLowerCase());
                    const linkedTours = tours.filter(t => t.destination_id === item.id || (t.destination || "").toLowerCase() === (item.country || "").toLowerCase());
                    const linkedGuides = guides.filter(g => g.destination_id === item.id || (g.destination || "").toLowerCase() === (item.country || "").toLowerCase());

                    // Parse Why I Love It into bold title + regular description
                    const whyLove = parseWhyILoveIt(item.why_i_love_it || item.whyILoveIt);
                    
                    // Moments Count from Database Array
                    const momentsCount = Array.isArray(item.moments) ? item.moments.length : 0;

                    const isDraft = (item.status || "").toLowerCase() === "draft" || (item.status || "").toLowerCase() === "new";

                    return (
                      <tr 
                        id={`row-${item.id}`}
                        key={item.id}
                        className={`transition-colors cursor-pointer ${
                          String(item.id) === String(highlightedRowId) ? "animate-row-flash" : ""
                        } ${
                          selectedIds.includes(item.id) 
                            ? "bg-brand-mustard/10" 
                            : isDraft 
                              ? "bg-[#f6ead0]/35 hover:bg-[#f6ead0]/50" 
                              : "hover:bg-[#FAF8F5]/60 bg-white"
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-3 pr-1" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => toggleSelectRow(item.id)}
                            className="rounded border-brand-border text-[#c7962d] focus:ring-[#c7962d] cursor-pointer"
                          />
                        </td>

                        {/* Country Flag & Path */}
                        <td className="p-3 pl-1">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#F5F0E6] text-[#8C764D] border border-[#c7962d]/10 font-bold flex items-center justify-center shrink-0">
                              {getAvatarInitials(item.country_code || item.code || item.country)}
                            </div>
                            <div>
                              <div className="font-bold text-brand-ink text-[13px]">{item.country}</div>
                              <div className="text-brand-muted text-[10.5px] font-medium">/destinations/{item.slug}</div>
                            </div>
                          </div>
                        </td>

                        {/* Description */}
                        <td className="p-3 max-w-[200px] whitespace-normal">
                          <p className="text-brand-ink/80 text-[11.5px] leading-relaxed font-light line-clamp-2">
                            {item.excerpt || item.description || "No description provided."}
                          </p>
                        </td>

                        {/* Why I Love It parsed title + body with character limit truncation */}
                        <td className="p-3 max-w-[220px] whitespace-normal">
                          <div className="text-[11.5px] leading-relaxed font-light">
                            <span className="font-bold text-brand-ink block mb-0.5" title={whyLove.title}>
                              {truncateText(whyLove.title, 40)}
                            </span>
                            <span className="text-brand-muted text-[11px] font-medium block leading-normal line-clamp-2" title={whyLove.body}>
                              {truncateText(whyLove.body, 65)}
                            </span>
                          </div>
                        </td>

                        {/* Memorable Moments Count */}
                        <td className="p-3 text-center text-brand-ink font-bold text-[12px]">
                          {momentsCount}
                        </td>

                        {/* Linked Content List */}
                        <td className="p-3">
                          <div className="text-[11px] text-brand-muted font-bold tracking-tight">
                            {linkedBlogs.length} post{linkedBlogs.length !== 1 ? 's' : ''} &middot; {linkedGuides.length} guide{linkedGuides.length !== 1 ? 's' : ''} &middot; {linkedTours.length} tour{linkedTours.length !== 1 ? 's' : ''}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-3">
                          {getStatusBadge(item.status)}
                        </td>

                        {/* Actions Icons Column */}
                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1 text-brand-muted">
                            
                            {/* Edit Destination */}
                            <Link 
                              href={`/dashboard/destinations/edit/${item.id}`}
                              title="Edit Destination"
                              className="p-1.5 rounded-lg hover:bg-[#FAF8F5] hover:text-[#c7962d] transition-colors inline-block"
                            >
                              <Edit size={15} />
                            </Link>
                            
                            {/* View Public Page */}
                            <a 
                              href={`/destinations/${item.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View public destination page"
                              className="p-1.5 rounded-lg hover:bg-[#FAF8F5] hover:text-[#c7962d] transition-colors inline-block"
                            >
                              <Eye size={15} />
                            </a>

                            {/* Delete Destination */}
                            <button 
                              onClick={() => handleDelete(item.id, item.country)}
                              title="Delete Destination"
                              className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-brand-border/40 pt-4 mt-4 font-sans text-xs">
              <div className="text-brand-muted font-medium">
                Showing {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(filtered.length, currentPage * itemsPerPage)} of {filtered.length} entries
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-3 py-1.5 border border-brand-border rounded-lg text-brand-ink hover:bg-brand-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-semibold cursor-pointer"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                        currentPage === page
                          ? "bg-brand-ink text-white border-brand-ink"
                          : "bg-white text-brand-ink border-brand-border hover:bg-brand-bg"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-3 py-1.5 border border-brand-border rounded-lg text-brand-ink hover:bg-brand-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-semibold cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
