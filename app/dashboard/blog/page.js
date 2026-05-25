"use client";

import { useState, useEffect } from "react";
import { fetchBlogs, saveBlog, deleteBlog, fetchDestinations, uploadImage, fetchMiniGuides } from "@/lib/db";
import MediaSelectorModal from "@/components/dashboard/MediaSelectorModal";
import { 
  Plus, Edit, Eye, Trash2, Search, X, Loader2, Image as ImageIcon, 
  Sparkles, BookOpen, Menu, Bell, ArrowLeft, Upload, Check, Globe, HelpCircle,
  Download, ChevronDown
} from "lucide-react";

export default function BlogCMS() {
  const [blogs, setBlogs] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [miniGuides, setMiniGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);

  // New list filters and bulk selection states
  const [selectedDestination, setSelectedDestination] = useState("All destinations");
  const [selectedStatus, setSelectedStatus] = useState("All statuses");
  const [selectedSort, setSelectedSort] = useState("Sort by newest");
  const [selectedIds, setSelectedIds] = useState([]);

  // Data-parsing helpers for dynamic fields
  const parseCityRoute = (cityStr) => {
    if (!cityStr) return "—";
    const cities = cityStr.split(/[,·\-\/]/).map(c => c.trim()).filter(Boolean);
    if (cities.length <= 2) {
      return cities.join(" · ");
    }
    return `${cities.slice(0, 2).join(" · ")} & more`;
  };

  const getReadTime = (blog) => {
    if (blog.content) {
      if (typeof blog.content === "object") {
        return blog.content.readTime || "5 min";
      }
      try {
        const parsed = JSON.parse(blog.content);
        return parsed?.readTime || "5 min";
      } catch (e) {}
    }
    return "5 min";
  };

  const getCity = (blog) => {
    // 1. First check if there is real parsed city in the blog.content object
    let cityVal = "";
    if (blog.content) {
      if (typeof blog.content === "object") {
        cityVal = blog.content.city || "";
      } else {
        try {
          const parsed = JSON.parse(blog.content);
          cityVal = parsed?.city || "";
        } catch (e) {}
      }
    }

    // 2. If it's something custom (not "Kyoto" placeholder), or if destination is Japan (where Kyoto is valid), we can use it
    if (cityVal && (cityVal !== "Kyoto" || blog.destination === "Japan")) {
      return cityVal;
    }

    // 3. Fallback: Parse from category or date which contain real seeded routes
    const sourceText = blog.category || blog.date || "";
    if (sourceText.includes("·")) {
      const parts = sourceText.split("·").map(p => p.trim()).filter(Boolean);
      // Filter out month-year format strings
      const cities = parts.filter(p => !/^(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}$/i.test(p));
      if (cities.length > 0) {
        return cities.join(" · ");
      }
    }

    if (sourceText.includes("•")) {
      const parts = sourceText.split("•").map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        // The middle part is typically the city, clean and capitalize nicely
        return parts[1].toLowerCase().replace(/\b[a-z]/g, letter => letter.toUpperCase());
      }
    }

    // Default fallback
    return cityVal || "Kyoto";
  };

  const getDisplayDate = (blog) => {
    // 1. Try to extract from blog.date
    let dateStr = blog.date || "";
    
    // 2. If it's a long route string (contains '·'), the last part is the month and year
    if (dateStr.includes("·")) {
      const parts = dateStr.split("·").map(p => p.trim());
      dateStr = parts[parts.length - 1];
    }
    
    // 3. If it's empty, try to extract from blog.category (e.g. QUICK GUIDE • MARRAKECH • NOV 2024)
    if (!dateStr && blog.category) {
      if (blog.category.includes("•")) {
        const parts = blog.category.split("•").map(p => p.trim());
        dateStr = parts[parts.length - 1];
      }
    }
    
    // 4. Clean and format to "Month Year" titlecase (e.g. "October 2025")
    if (dateStr) {
      return dateStr
        .toLowerCase()
        .replace(/\b[a-z]/g, letter => letter.toUpperCase());
    }
    
    // 5. Fallback to created_at month and year
    if (blog.created_at) {
      return new Date(blog.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    
    return "May 2026";
  };

  const getTags = (blog) => {
    if (blog.content) {
      if (typeof blog.content === "object") {
        return blog.content.tags || "";
      }
      try {
        const parsed = JSON.parse(blog.content);
        return parsed?.tags || "";
      } catch (e) {}
    }
    return "";
  };

  const getCityMiniGuideName = (blog) => {
    let guideId = "";
    if (blog.content) {
      if (typeof blog.content === "object") {
        guideId = blog.content.cityMiniGuide || "";
      } else {
        try {
          const parsed = JSON.parse(blog.content);
          guideId = parsed?.cityMiniGuide || "";
        } catch (e) {}
      }
    }
    
    if (!guideId) return null;
    const guideObj = miniGuides.find(g => g.id === guideId);
    return guideObj ? `${guideObj.title.replace("Travel Guide", "").replace("Mini Guide", "").trim()} Guide` : null;
  };

  const toggleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkArchive = () => {
    if (selectedIds.length === 0) {
      alert("Please select one or more blog posts to set as Draft.");
      return;
    }
    if (confirm(`Change status to Draft for ${selectedIds.length} selected blog posts?`)) {
      setBlogs(prev => prev.map(b => {
        if (selectedIds.includes(b.id)) {
          const payload = { ...b, status: "Draft" };
          saveBlog(payload).catch(err => console.warn("Sync drafts error:", err));
          return payload;
        }
        return b;
      }));
      setSelectedIds([]);
      alert("Selected blog posts successfully updated to Draft.");
    }
  };

  const handleExportCSV = () => {
    if (blogs.length === 0) return;
    const headers = ["Title", "Slug", "Destination", "Country Code", "City/Route", "Read Time", "Status", "Date", "Excerpt"];
    const rows = blogs.map(item => [
      item.title,
      item.slug,
      item.destination,
      item.countryCode || item.country_code,
      getCity(item),
      getReadTime(item),
      item.status,
      item.date || new Date(item.created_at).toLocaleDateString(),
      item.excerpt
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${(val || "").toString().replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `blog_posts_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    slug: "",
    destination: "",
    countryCode: "",
    category: "",
    excerpt: "",
    coverImage: "",
    isFresh: false,
    date: "",
    content: "",
    
    // Custom premium fields from mockup
    city: "Kyoto",
    readTime: "8 min",
    status: "Draft",
    cityMiniGuide: "",
    cityMiniGuideCta: "Open the guide",
    imageAltText: "",
    tags: "slow travel, temples, food",
    seoTitle: "",
    seoDescription: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [blogsData, destinationsData, miniGuidesData] = await Promise.all([
        fetchBlogs(),
        fetchDestinations(),
        fetchMiniGuides()
      ]);
      setBlogs(blogsData);
      setDestinations(destinationsData);
      setMiniGuides(miniGuidesData || []);
    } catch (e) {
      console.error("Failed to load blog page data", e);
    } finally {
      setLoading(false);
    }
  }

  const getCitiesForDestination = (destination) => {
    if (!destination) return ["Select city..."];
    const destLower = destination.toLowerCase();
    if (destLower === "japan") return ["Kyoto", "Tokyo", "Osaka", "Nara", "Hakone"];
    if (destLower === "italy") return ["Rome", "Florence", "Venice", "Milan", "Amalfi Coast"];
    if (destLower === "portugal") return ["Lisbon", "Porto", "Sintra", "Algarve", "Coimbra"];
    if (destLower === "france") return ["Paris", "Nice", "Lyon", "Bordeaux", "Provence"];
    return ["General City", "Kyoto", "Tokyo", "Rome", "Lisbon", "Paris"];
  };

  const handleOpenAdd = () => {
    setModalMode("add");
    
    const firstDest = destinations[0];
    const initialDest = firstDest?.country || "Japan";
    const initialCode = firstDest?.code || firstDest?.country_code || "JP";
    
    setFormData({
      id: "",
      title: "",
      slug: "",
      destination: initialDest,
      countryCode: initialCode,
      category: `TRAVEL • ${initialDest.toUpperCase()} • ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}`,
      excerpt: "",
      coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop",
      isFresh: false,
      date: `${initialDest.toUpperCase()} • ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}`,
      content: "",
      
      city: "Kyoto",
      readTime: "8 min",
      status: "Draft",
      cityMiniGuide: "",
      cityMiniGuideCta: "Open the guide",
      imageAltText: "",
      tags: "slow travel, temples, food",
      seoTitle: "",
      seoDescription: ""
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (blog) => {
    setModalMode("edit");
    
    let city = "Kyoto";
    let readTime = "8 min";
    let status = blog.status || "Draft";
    let cityMiniGuide = "";
    let cityMiniGuideCta = "Open the guide";
    let imageAltText = "";
    let tags = "slow travel, temples, food";
    let seoTitle = "";
    let seoDescription = "";
    let cleanContent = "";

    if (blog.content) {
      if (typeof blog.content === "object") {
        city = blog.content.city || city;
        readTime = blog.content.readTime || readTime;
        cityMiniGuide = blog.content.cityMiniGuide || cityMiniGuide;
        cityMiniGuideCta = blog.content.cityMiniGuideCta || cityMiniGuideCta;
        imageAltText = blog.content.imageAltText || imageAltText;
        tags = blog.content.tags || tags;
        seoTitle = blog.content.seoTitle || seoTitle;
        seoDescription = blog.content.seoDescription || seoDescription;
        cleanContent = blog.content.body || "";
      } else if (typeof blog.content === "string") {
        try {
          const parsed = JSON.parse(blog.content);
          if (parsed && typeof parsed === "object") {
            city = parsed.city || city;
            readTime = parsed.readTime || readTime;
            cityMiniGuide = parsed.cityMiniGuide || cityMiniGuide;
            cityMiniGuideCta = parsed.cityMiniGuideCta || cityMiniGuideCta;
            imageAltText = parsed.imageAltText || imageAltText;
            tags = parsed.tags || tags;
            seoTitle = parsed.seoTitle || seoTitle;
            seoDescription = parsed.seoDescription || seoDescription;
            cleanContent = parsed.body || "";
          }
        } catch (e) {
          cleanContent = blog.content; // Legacy simple string body
        }
      }
    }

    setFormData({
      id: blog.id,
      title: blog.title || "",
      slug: blog.slug || "",
      destination: blog.destination || "",
      countryCode: blog.countryCode || blog.country_code || "",
      category: blog.category || "",
      excerpt: blog.excerpt || "",
      coverImage: blog.coverImage || blog.hero_image || "",
      isFresh: !!(blog.isFresh || blog.is_fresh),
      date: blog.date || "",
      content: cleanContent,
      
      city,
      readTime,
      status,
      cityMiniGuide,
      cityMiniGuideCta,
      imageAltText,
      tags,
      seoTitle,
      seoDescription
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (confirm(`Are you sure you want to delete the blog post "${title}"?`)) {
      try {
        await deleteBlog(id);
        setBlogs(blogs.filter(b => b.id !== id));
      } catch (e) {
        alert("Failed to delete blog post: " + e.message);
      }
    }
  };

  const handleDestinationChange = (e) => {
    const destName = e.target.value;
    const destObj = destinations.find(d => d.country === destName);
    const code = destObj ? (destObj.code || destObj.country_code || "") : "";
    
    setFormData(prev => {
      const cities = getCitiesForDestination(destName);
      const updated = {
        ...prev,
        destination: destName,
        countryCode: code,
        city: cities[0] || "Kyoto"
      };
      
      if (modalMode === "add") {
        updated.category = `TRAVEL • ${destName.toUpperCase()} • ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}`;
        updated.date = `${destName.toUpperCase()} • ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}`;
      }
      return updated;
    });
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    if (modalMode === "add") {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // remove special chars
        .replace(/\s+/g, "-"); // spaces to hyphens
      
      setFormData(prev => ({
        ...prev,
        title,
        slug,
        seoTitle: `${title} — The Long Way`,
        category: prev.category || `TRAVEL • ${prev.destination.toUpperCase()} • ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}`,
        date: prev.date || `${prev.destination.toUpperCase()} • ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}`
      }));
    } else {
      setFormData(prev => ({ ...prev, title }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const publicUrl = await uploadImage(file);
      setFormData(prev => ({ ...prev, coverImage: publicUrl }));
    } catch (error) {
      alert("Failed to upload image: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const publicUrl = await uploadImage(file);
      setFormData(prev => ({ ...prev, coverImage: publicUrl }));
    } catch (error) {
      alert("Failed to drop and upload image: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    handleSubmitDirect(formData);
  };

  const handleSubmitDirect = async (dataToSave) => {
    if (!dataToSave.title || !dataToSave.slug || !dataToSave.destination) {
      alert("Title, slug, and destination are required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: dataToSave.title,
        slug: dataToSave.slug.toLowerCase().replace(/\s+/g, "-"),
        destination: dataToSave.destination,
        countryCode: dataToSave.countryCode.toUpperCase(),
        country_code: dataToSave.countryCode.toUpperCase(),
        category: dataToSave.category || `TRAVEL • ${dataToSave.destination.toUpperCase()}`,
        excerpt: dataToSave.excerpt,
        coverImage: dataToSave.coverImage || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop",
        hero_image: dataToSave.coverImage || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop",
        isFresh: dataToSave.isFresh,
        is_fresh: dataToSave.isFresh,
        date: dataToSave.date,
        status: dataToSave.status || "Draft",
        content: {
          body: dataToSave.content || "",
          city: dataToSave.city || "Kyoto",
          readTime: dataToSave.readTime || "8 min",
          cityMiniGuide: dataToSave.cityMiniGuide || "",
          cityMiniGuideCta: dataToSave.cityMiniGuideCta || "Open the guide",
          imageAltText: dataToSave.imageAltText || "",
          tags: dataToSave.tags || "slow travel, temples, food",
          seoTitle: dataToSave.seoTitle || "",
          seoDescription: dataToSave.seoDescription || ""
        }
      };

      if (dataToSave.id) {
        payload.id = dataToSave.id;
      }

      await saveBlog(payload);
      await loadData();
      setIsFormOpen(false);
    } catch (err) {
      alert("Failed to save blog post: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = blogs
    .filter(b => {
      const matchSearch = 
        (b.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (getCity(b) || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.destination || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchDest = selectedDestination === "All destinations" || b.destination === selectedDestination;
      
      let matchStatus = true;
      if (selectedStatus !== "All statuses") {
        matchStatus = (b.status || "").toLowerCase() === selectedStatus.toLowerCase() ||
          ((selectedStatus === "Review" || selectedStatus === "In Review") && (b.status || "").toLowerCase().includes("review"));
      }

      return matchSearch && matchDest && matchStatus;
    })
    .sort((a, b) => {
      if (selectedSort === "Sort by newest") {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (selectedSort === "Sort by oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      if (selectedSort === "Sort by title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return 0;
    });

  const tagsArray = formData.tags
    ? formData.tags.split(",").map(t => t.trim()).filter(Boolean)
    : ["slow travel", "temples", "food"];

  return (
    <div className="space-y-10 min-h-screen">
      {!isFormOpen ? (
        <>
          {/* Editorial Header */}
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-8 gap-4 pb-2 border-b border-brand-border/40">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-ink mb-1.5 tracking-tight">
                Blog Posts
              </h1>
              <p className="text-brand-muted text-xs leading-relaxed max-w-3xl">
                Manage destination-based journal posts. Each post includes title, destination, city, date, excerpt, read time, city mini guide, cover image, blog content, tags and SEO fields.
              </p>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto self-stretch sm:self-auto">
              <button 
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-brand-border rounded-lg text-xs font-semibold text-brand-ink bg-white hover:bg-brand-bg transition-colors cursor-pointer w-full sm:w-auto shadow-xs"
              >
                Export
              </button>
              <button
                onClick={handleOpenAdd}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#c7962d] hover:bg-[#b58522] text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0 w-full sm:w-auto text-center cursor-pointer"
              >
                <Plus size={14} className="stroke-[3px]" />
                Add New Post
              </button>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Posts", value: blogs.length },
              { label: "Published", value: blogs.filter(b => b.status === "Published").length },
              { label: "Drafts", value: blogs.filter(b => b.status === "Draft").length },
              { label: "In Review", value: blogs.filter(b => (b.status || "").toLowerCase().includes("review")).length }
            ].map((card, idx) => (
              <div key={idx} className="bg-white border border-brand-border/70 rounded-xl p-5 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-brand-muted tracking-widest block mb-1">{card.label}</span>
                <span className="text-3xl font-serif font-bold text-brand-ink">{card.value}</span>
              </div>
            ))}
          </div>

          {/* Blog Posts List Main Card */}
          <div className="bg-white border border-brand-border/70 rounded-2xl shadow-xs p-6">
            
            {/* Table Header Row */}
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-brand-border/40">
              <h2 className="font-serif font-bold text-lg text-brand-ink">Blog Posts List</h2>
              <button 
                onClick={handleBulkArchive}
                className="px-3 py-1.5 border border-brand-border rounded-lg text-xs font-semibold text-brand-ink hover:bg-brand-bg shadow-xs transition-all cursor-pointer"
              >
                Bulk Actions
              </button>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
              
              {/* Search */}
              <div className="relative col-span-1 sm:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
                <input 
                  type="text" 
                  placeholder="Search by title or city..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FAF8F5]/40 border border-brand-border rounded-lg py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-[#c7962d] transition-colors placeholder:text-brand-muted/70 text-brand-ink font-sans" 
                />
              </div>

              {/* Destination Dropdown */}
              <div className="relative">
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded-lg py-2 px-3 pr-8 text-xs focus:outline-none focus:border-[#c7962d] appearance-none text-brand-ink cursor-pointer font-sans"
                >
                  <option value="All destinations">All destinations</option>
                  {Array.from(new Set(blogs.map(b => b.destination).filter(Boolean))).map(dest => (
                    <option key={dest} value={dest}>{dest}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
              </div>

              {/* Status Dropdown */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded-lg py-2 px-3 pr-8 text-xs focus:outline-none focus:border-[#c7962d] appearance-none text-brand-ink cursor-pointer font-sans"
                >
                  <option value="All statuses">All statuses</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Review">Review</option>
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
              </div>

              {/* Sorting Dropdown */}
              <div className="relative">
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded-lg py-2 px-3 pr-8 text-xs focus:outline-none focus:border-[#c7962d] appearance-none text-brand-ink cursor-pointer font-sans"
                >
                  <option value="Sort by newest">Sort by newest</option>
                  <option value="Sort by oldest">Sort by oldest</option>
                  <option value="Sort by title">Sort by title</option>
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
              </div>

            </div>

            {/* Table Content */}
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-brand-mustard" size={32} />
                <p className="text-brand-muted text-xs font-bold tracking-widest uppercase animate-pulse">Gathering stories...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-24 text-center max-w-sm mx-auto">
                <BookOpen className="text-brand-border mx-auto mb-4" size={40} />
                <p className="text-brand-ink font-serif text-lg mb-1">No articles found</p>
                <p className="text-xs text-brand-muted leading-relaxed">
                  {searchQuery ? "Try refining your search terms or view standard directory." : "Draft a fresh travel log or journal entry to populate the database index."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-luxury">
                <table className="w-full text-left text-xs whitespace-nowrap table-auto border-collapse">
                  <thead>
                    <tr className="border-b border-brand-border/40 text-brand-muted font-bold tracking-wider uppercase bg-[#FAF8F5]/30">
                      <th className="p-3 w-8">
                        <input 
                          type="checkbox" 
                          checked={filtered.length > 0 && selectedIds.length === filtered.length}
                          onChange={() => {
                            if (selectedIds.length === filtered.length) {
                              setSelectedIds([]);
                            } else {
                              setSelectedIds(filtered.map(b => b.id));
                            }
                          }}
                          className="w-3.5 h-3.5 rounded border-brand-border text-brand-mustard focus:ring-brand-mustard accent-brand-mustard cursor-pointer"
                        />
                      </th>
                      <th className="p-3 pl-1 pb-3 text-[10px]">POST</th>
                      <th className="p-3 pb-3 text-[10px]">DESTINATION</th>
                      <th className="p-3 pb-3 text-[10px]">CITY / ROUTE</th>
                      <th className="p-3 pb-3 text-[10px]">DATE</th>
                      <th className="p-3 pb-3 text-[10px]">READ TIME</th>
                      <th className="p-3 pb-3 text-[10px]">CITY MINI GUIDE</th>
                      <th className="p-3 pb-3 text-[10px]">TAGS</th>
                      <th className="p-3 pb-3 text-[10px]">STATUS</th>
                      <th className="p-3 pb-3 text-right text-[10px] pr-2">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/40">
                    {filtered.map((blog) => {
                      const isSelected = selectedIds.includes(blog.id);
                      
                      // Country colors for premium initial avatars
                      const getCountryColor = (code) => {
                        const c = (code || "").toUpperCase();
                        if (c === "JP") return "bg-[#8D5B4C]";
                        if (c === "PT") return "bg-[#4E5B49]";
                        if (c === "BE") return "bg-[#8A7968]";
                        if (c === "IT") return "bg-[#65594F]";
                        if (c === "FR") return "bg-[#5A6E72]";
                        return "bg-[#8C7A6B]";
                      };
                      
                      const countryCode = blog.countryCode || blog.country_code || "JP";
                      const countryColor = getCountryColor(countryCode);
                      const countryInitials = countryCode.toUpperCase().slice(0, 2);

                      return (
                        <tr key={blog.id} className={`hover:bg-[#FAF8F5]/30 transition-colors duration-200 ${isSelected ? "bg-brand-mustard/5" : ""}`}>
                          <td className="p-3 pl-3">
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => toggleSelectRow(blog.id)}
                              className="w-3.5 h-3.5 rounded border-brand-border text-brand-mustard focus:ring-brand-mustard accent-brand-mustard cursor-pointer"
                            />
                          </td>
                          <td className="p-3 pl-1">
                            <div className="flex items-center gap-3">
                              {/* Avatar initials with curated palette */}
                              <div className={`w-8 h-8 rounded-full ${countryColor} text-white font-sans font-bold text-xs flex items-center justify-center border border-white/10 shrink-0`}>
                                {countryInitials}
                              </div>
                              <div>
                                <h3 className="font-serif text-sm font-semibold text-brand-ink leading-snug">
                                  {blog.title}
                                </h3>
                                <div className="text-[10px] font-mono text-brand-muted mt-0.5">
                                  /posts/{blog.slug}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-brand-ink font-medium">
                            {blog.destination}
                          </td>
                          <td className="p-3 text-brand-ink">
                            {parseCityRoute(getCity(blog))}
                          </td>
                          <td className="p-3 text-brand-muted">
                            {getDisplayDate(blog)}
                          </td>
                          <td className="p-3 text-brand-muted">
                            {getReadTime(blog)}
                          </td>
                          <td className="p-3">
                            {getCityMiniGuideName(blog) ? (
                              <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 tracking-wide border border-blue-100">
                                {getCityMiniGuideName(blog)}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-semibold rounded-full bg-[#FCF8E3]/80 text-[#C7962D] tracking-wide border border-[#FBEED5]">
                                None
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-brand-muted truncate max-w-[150px]" title={getTags(blog)}>
                            {getTags(blog) || "—"}
                          </td>
                          <td className="p-3">
                            {blog.status === "Published" ? (
                              <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-full bg-green-50 text-green-700 tracking-wide border border-green-200">
                                Published
                              </span>
                            ) : blog.status === "Review" || blog.status === "In Review" ? (
                              <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 tracking-wide border border-blue-200">
                                Review
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-full bg-[#FCF8E3] text-[#C7962D] tracking-wide border border-[#FBEED5]">
                                Draft
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right pr-2">
                            <div className="flex justify-end items-center gap-1.5">
                              <button 
                                onClick={() => handleOpenEdit(blog)}
                                className="p-1.5 text-brand-muted hover:text-brand-mustard hover:bg-brand-bg rounded-md transition-colors cursor-pointer"
                                title="Edit Post"
                              >
                                <Edit size={14} />
                              </button>
                              <a 
                                href={`/blog/${blog.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-brand-muted hover:text-brand-mustard hover:bg-brand-bg rounded-md transition-colors flex items-center justify-center"
                                title="View Live"
                              >
                                <Eye size={14} />
                              </a>
                              <button 
                                onClick={() => handleDelete(blog.id, blog.title)}
                                className="p-1.5 text-brand-muted hover:text-[#B04A3C] hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                title="Delete Post"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Footer */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-brand-border/40 text-xs text-brand-muted">
              <span>Displaying {filtered.length} of {blogs.length} articles</span>
            </div>

          </div>
        </>
      ) : (
        <div className="bg-[#FAF8F5] -mx-6 -my-10 p-8 min-h-screen text-brand-ink">
          
          {/* Header Area */}
          <header className="flex flex-col sm:flex-row items-center justify-between border-b border-brand-border bg-white px-8 py-4 mb-8 -mx-8 -mt-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-2 hover:bg-brand-bg rounded-lg transition-colors flex items-center justify-center cursor-pointer text-brand-muted hover:text-brand-ink"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-muted font-sans">
                <span>Blog Posts</span>
                <span className="text-brand-border">/</span>
                <span className="text-brand-ink">{modalMode === "add" ? "Add New Post" : "Edit Post"}</span>
              </div>
            </div>
            
            <div className="relative w-full max-w-xs my-2 sm:my-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-muted" size={14} />
              <input 
                type="text" 
                placeholder="Search blog posts..." 
                className="w-full border border-brand-border rounded-lg py-1.5 pl-9 pr-3 text-xs bg-brand-bg/10 placeholder:text-brand-muted/70 focus:outline-none focus:border-brand-mustard focus:bg-white transition-all text-brand-ink font-sans"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-brand-muted hover:text-brand-ink hover:bg-brand-bg rounded-full transition-all">
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-brand-mustard rounded-full"></span>
              </button>
              
              <div className="flex items-center gap-3 pl-2 border-l border-brand-border">
                <div className="w-9 h-9 rounded-full bg-brand-mustard-soft text-brand-mustard font-sans font-bold text-xs flex items-center justify-center border border-brand-mustard/15">
                  AW
                </div>
                <div className="hidden sm:block text-left font-sans">
                  <div className="text-xs font-bold text-brand-ink leading-tight">Ava Wright</div>
                  <div className="text-[9px] text-brand-muted uppercase font-semibold tracking-wider">Administrator</div>
                </div>
              </div>
            </div>
          </header>

          {/* Form Actions Section */}
          <form onSubmit={handleSubmit} className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 pb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-serif text-brand-ink tracking-tight font-semibold">
                  {modalMode === "add" ? "Add Blog Post" : "Edit Blog Post"}
                </h1>
                <p className="text-brand-muted text-xs mt-2 max-w-2xl font-light leading-relaxed font-sans">
                  Create a destination-based journal post with title, destination, city, date, excerpt, read time, city mini guide, cover image, content, tags and SEO metadata.
                </p>
              </div>
              <div className="flex items-center gap-3 font-sans">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 bg-white border border-brand-border rounded-xl text-xs font-bold text-brand-ink hover:bg-brand-bg transition-all cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-brand-mustard text-white rounded-xl text-xs font-bold hover:bg-brand-ink transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {saving && <Loader2 className="animate-spin" size={12} />}
                  {formData.status === "Published" ? "Publish Post" : "Save Draft"}
                </button>
              </div>
            </div>

            {/* Grid Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Form Cards */}
              <div className="lg:col-span-8 space-y-6 font-sans">
                
                {/* 1. Post Details Card */}
                <div className="bg-white rounded-3xl border border-brand-border p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-brand-ink font-serif">Post Details</h2>
                    <p className="text-brand-muted text-xs font-light mt-1">Core information used on blog cards, destination pages and the full post page.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Title</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={handleTitleChange}
                        className="w-full border border-brand-border rounded-xl p-3.5 text-xs focus:outline-none focus:border-brand-mustard focus:ring-1 focus:ring-brand-mustard bg-white text-brand-ink transition-all font-sans"
                        placeholder="e.g. Slow Mornings In Kyoto"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Destination</label>
                        <input
                          type="text"
                          list="destinations-list"
                          value={formData.destination}
                          onChange={handleDestinationChange}
                          required
                          placeholder="Type or select a country"
                          className="w-full border border-brand-border rounded-xl p-3.5 text-xs focus:outline-none focus:border-brand-mustard focus:ring-1 focus:ring-brand-mustard bg-white text-brand-ink transition-all font-sans"
                        />
                        <datalist id="destinations-list">
                          {destinations.map((d) => (
                            <option key={d.id} value={d.country} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">City</label>
                        <input
                          type="text"
                          list="cities-list"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Type or select a city"
                          className="w-full border border-brand-border rounded-xl p-3.5 text-xs focus:outline-none focus:border-brand-mustard focus:ring-1 focus:ring-brand-mustard bg-white text-brand-ink transition-all font-sans"
                        />
                        <datalist id="cities-list">
                          {getCitiesForDestination(formData.destination).map((city, idx) => (
                            <option key={idx} value={city} />
                          ))}
                        </datalist>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Date</label>
                        <input
                          type="text"
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full border border-brand-border rounded-xl p-3.5 text-xs focus:outline-none focus:border-brand-mustard focus:ring-1 focus:ring-brand-mustard bg-white text-brand-ink transition-all font-sans"
                          placeholder="e.g. April 2025"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Category / Subtitle</label>
                        <input
                          type="text"
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full border border-brand-border rounded-xl p-3.5 text-xs focus:outline-none focus:border-brand-mustard focus:ring-1 focus:ring-brand-mustard bg-white text-brand-ink transition-all font-sans"
                          placeholder="e.g. CULTURE • KYOTO • APR 2025"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Read Time</label>
                        <input
                          type="text"
                          value={formData.readTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, readTime: e.target.value }))}
                          className="w-full border border-brand-border rounded-xl p-3.5 text-xs focus:outline-none focus:border-brand-mustard focus:ring-1 focus:ring-brand-mustard bg-white text-brand-ink transition-all font-sans"
                          placeholder="e.g. 8 min"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full border border-brand-border rounded-xl p-3.5 text-xs focus:outline-none focus:border-brand-mustard focus:ring-1 focus:ring-brand-mustard bg-white text-brand-ink appearance-none transition-all cursor-pointer font-sans"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Published">Published</option>
                        </select>
                      </div>

                      <div className="flex flex-col justify-end">
                        <label className="flex items-center gap-3 p-3.5 border border-brand-border rounded-xl hover:bg-brand-bg/25 transition-all cursor-pointer bg-white">
                          <input
                            type="checkbox"
                            checked={formData.isFresh}
                            onChange={(e) => setFormData(prev => ({ ...prev, isFresh: e.target.checked }))}
                            className="w-4 h-4 rounded border-brand-border text-brand-mustard focus:ring-brand-mustard focus:ring-offset-0 focus:ring-0 cursor-pointer accent-brand-mustard"
                          />
                          <div className="text-left">
                            <span className="block text-xs font-bold text-brand-ink leading-none">Feature on Homepage</span>
                            <span className="block text-[9px] text-brand-muted mt-1 leading-none">Show in popular posts</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Excerpt</label>
                      <textarea
                        rows={2}
                        value={formData.excerpt}
                        onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                        className="w-full border border-brand-border rounded-xl p-3.5 text-xs focus:outline-none focus:border-brand-mustard focus:ring-1 focus:ring-brand-mustard bg-white text-brand-ink transition-all font-sans resize-none"
                        placeholder="Write a short preview summary for cards and listings..."
                      />
                    </div>
                  </div>
                </div>

                {/* 2. City Mini Guide Card */}
                <div className="bg-white rounded-3xl border border-brand-border p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-brand-ink font-serif">City Mini Guide</h2>
                    <p className="text-brand-muted text-xs font-light mt-1">Attach a city mini guide when the blog post should link readers to a practice guide.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Attach City Mini Guide</label>
                      <select
                        value={formData.cityMiniGuide}
                        onChange={(e) => setFormData(prev => ({ ...prev, cityMiniGuide: e.target.value }))}
                        className="w-full border border-brand-border rounded-xl p-3.5 text-xs focus:outline-none focus:border-brand-mustard focus:ring-1 focus:ring-brand-mustard bg-white text-brand-ink appearance-none transition-all cursor-pointer font-sans"
                      >
                        <option value="">No guide selected</option>
                        {miniGuides.map((guide) => (
                          <option key={guide.id} value={guide.id}>
                            {guide.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Mini Guide CTA Label</label>
                      <input
                        type="text"
                        value={formData.cityMiniGuideCta}
                        onChange={(e) => setFormData(prev => ({ ...prev, cityMiniGuideCta: e.target.value }))}
                        className="w-full border border-brand-border rounded-xl p-3.5 text-xs focus:outline-none focus:border-brand-mustard focus:ring-1 focus:ring-brand-mustard bg-white text-brand-ink transition-all font-sans"
                        placeholder="e.g. Open the guide"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Cover Image Card */}
                <div className="bg-white rounded-3xl border border-brand-border p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-brand-ink font-serif">Cover Image</h2>
                    <p className="text-brand-muted text-xs font-light mt-1">Upload an image from your device or drop a new cover photo directly.</p>
                  </div>

                  {/* Drag-and-drop Area */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div 
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById("file-input").click()}
                      className="flex-1 border-2 border-dashed border-brand-mustard/20 bg-[#FCFBF8] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-mustard hover:bg-[#FAF6EC] transition-all group select-none relative h-48"
                    >
                      {uploadingImage ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="animate-spin text-brand-mustard" size={24} />
                          <span className="text-xs font-bold text-brand-mustard tracking-wider uppercase animate-pulse">Uploading cover...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="text-brand-mustard/60 group-hover:text-brand-mustard transition-colors mb-3" size={28} />
                          <span className="text-xs font-bold text-brand-ink font-serif block mb-1">Upload blog cover image</span>
                          <span className="text-[10px] text-brand-muted block max-w-xs leading-normal">
                            Recommended size: 1600 x 1000px. Used on cards and full article page.
                          </span>
                        </>
                      )}
                      <input 
                        id="file-input"
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </div>
                    <div className="flex flex-col justify-center shrink-0">
                      <div className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 text-center">OR</div>
                      <button
                        type="button"
                        onClick={() => setIsMediaSelectorOpen(true)}
                        className="px-5 py-3 border border-brand-border bg-white rounded-xl text-xs font-bold text-brand-ink hover:border-brand-mustard hover:text-brand-mustard transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <ImageIcon size={16} />
                        Select from Library
                      </button>
                    </div>
                  </div>
                  {formData.coverImage && (
                    <div className="mt-4 border border-brand-border rounded-xl p-2 bg-brand-bg flex items-center gap-4">
                      <img src={formData.coverImage} alt="Cover preview" className="w-16 h-12 object-cover rounded-lg border border-brand-border" />
                      <div className="text-xs text-brand-ink font-medium truncate flex-1">{formData.coverImage}</div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Image Alt Text</label>
                    <input
                      type="text"
                      value={formData.imageAltText}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageAltText: e.target.value }))}
                      className="w-full border border-brand-border rounded-xl p-3.5 text-xs focus:outline-none focus:border-brand-mustard focus:ring-1 focus:ring-brand-mustard bg-white text-brand-ink transition-all font-sans"
                      placeholder="Describe the cover image for accessibility"
                    />
                  </div>
                </div>

                {/* 4. Blog Content Card */}
                <div className="bg-white rounded-3xl border border-brand-border p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-brand-ink font-serif">Blog Content</h2>
                      <p className="text-brand-muted text-xs font-light mt-1">Use this editor for useful long form travel story.</p>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-brand-mustard bg-brand-mustard-soft px-2.5 py-1 rounded-full uppercase tracking-wider">Markdown Active</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Content</label>
                    <textarea
                      rows={12}
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full border border-brand-border rounded-2xl p-4 text-xs focus:outline-none focus:border-brand-mustard focus:ring-1 focus:ring-brand-mustard bg-[#FAF8F5] text-brand-ink transition-all font-serif leading-relaxed"
                      placeholder="Write or paste the full blog post content here. Separate paragraphs with double newlines."
                    />
                  </div>
                </div>

                {/* 5. Tags Card */}
                <div className="bg-white rounded-3xl border border-brand-border p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-brand-ink font-serif">Tags</h2>
                    <p className="text-brand-muted text-xs font-light mt-1">Add keywords separated by commas to help readers search and filter articles.</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Tags</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      className="w-full border border-brand-border rounded-xl p-3.5 text-xs focus:outline-none focus:border-brand-mustard focus:ring-1 focus:ring-brand-mustard bg-white text-brand-ink transition-all font-sans"
                      placeholder="e.g. slow travel, food, temples, itinerary"
                    />
                  </div>
                </div>

                {/* 6. SEO & URL Card */}
                <div className="bg-white rounded-3xl border border-brand-border p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-brand-ink font-serif">SEO & URL</h2>
                    <p className="text-brand-muted text-xs font-light mt-1">Configure search engine titles, descriptions, and the direct web permalink slug.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">SEO Title</label>
                      <input
                        type="text"
                        value={formData.seoTitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                        className="w-full border border-brand-border rounded-xl p-3.5 text-xs focus:outline-none focus:border-brand-mustard focus:ring-1 focus:ring-brand-mustard bg-white text-brand-ink transition-all font-sans"
                        placeholder="e.g. Slow Mornings in Kyoto — The Long Way"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Meta Description</label>
                      <textarea
                        rows={3}
                        value={formData.seoDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                        className="w-full border border-brand-border rounded-xl p-3.5 text-xs focus:outline-none focus:border-brand-mustard focus:ring-1 focus:ring-brand-mustard bg-white text-brand-ink transition-all font-sans resize-none"
                        placeholder="Write a concise search description for this post..."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">URL Slug</label>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono text-brand-muted bg-brand-bg px-3 py-3 border border-brand-border rounded-l-xl select-none">
                          thelongway.com/blog/
                        </span>
                        <input
                          type="text"
                          required
                          value={formData.slug}
                          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                          className="w-full border-t border-b border-r border-brand-border rounded-r-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink font-mono transition-all"
                          placeholder="e.g. slow-mornings-in-kyoto"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Live Sticky Preview */}
              <div className="lg:col-span-4 sticky top-8 font-sans">
                <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
                  
                  {/* Photo Container */}
                  <div className="relative h-64 w-full bg-brand-bg flex-shrink-0 group overflow-hidden">
                    <img 
                      src={formData.coverImage || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop"} 
                      alt="Cover Preview" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-6">
                      <h3 className="text-xl md:text-2xl font-serif text-white tracking-tight leading-tight line-clamp-2">
                        {formData.title || "Slow Mornings in Kyoto"}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Badge & Meta */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold rounded-full uppercase tracking-wider border ${
                        formData.status === "Published"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-brand-mustard-soft text-brand-mustard border-brand-mustard/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${formData.status === "Published" ? "bg-emerald-500" : "bg-brand-mustard animate-pulse"}`}></span>
                        {formData.status || "Draft"} Preview
                      </span>
                      <span className="text-[10px] text-brand-muted tracking-widest font-bold uppercase">
                        THE LONG WAY
                      </span>
                    </div>

                    {/* Meta subtitle */}
                    <div>
                      <div className="text-[10px] font-extrabold tracking-[0.2em] text-brand-mustard uppercase">
                        {(formData.city || "Kyoto")} • {(formData.date || "April 2025")} • {(formData.destination || "Japan")}
                      </div>
                      <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                        {formData.excerpt || "A slow travel story from Japan, ready to connect to a destination page and optional city mini guide."}
                      </p>
                    </div>

                    {/* Highly Stylized Statistics Table */}
                    <div className="border border-brand-border rounded-2xl overflow-hidden bg-brand-bg/5 divide-y divide-brand-border">
                      <div className="grid grid-cols-2 divide-x divide-brand-border">
                        <div className="p-4">
                          <span className="block text-[8px] font-bold text-brand-muted uppercase tracking-widest mb-1">Read Time</span>
                          <span className="text-xs font-bold text-brand-ink">{formData.readTime || "8 min"}</span>
                        </div>
                        <div className="p-4">
                          <span className="block text-[8px] font-bold text-brand-muted uppercase tracking-widest mb-1">City</span>
                          <span className="text-xs font-bold text-brand-ink">{formData.city || "Kyoto"}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-brand-border">
                        <div className="p-4">
                          <span className="block text-[8px] font-bold text-brand-muted uppercase tracking-widest mb-1">Destination</span>
                          <span className="text-xs font-bold text-brand-ink">{formData.destination || "Japan"}</span>
                        </div>
                        <div className="p-4">
                          <span className="block text-[8px] font-bold text-brand-muted uppercase tracking-widest mb-1">Status</span>
                          <span className="text-xs font-bold text-brand-ink">{formData.status || "Draft"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags Pills List */}
                    <div className="space-y-2">
                      <span className="block text-[9px] font-bold text-brand-muted uppercase tracking-widest">Metadata Tags</span>
                      <div className="flex flex-wrap gap-2">
                        {tagsArray.map((tag, idx) => (
                          <span key={idx} className="bg-brand-mustard-soft/60 border border-brand-mustard/10 text-brand-mustard px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons mirroring live page preview links */}
                    <div className="pt-2 space-y-2">
                      <button 
                        type="submit"
                        className="w-full py-3 bg-brand-mustard text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-brand-ink transition-all duration-300 shadow-sm cursor-pointer"
                      >
                        Preview Blog Post
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="w-full py-3 border border-brand-border bg-white text-brand-ink text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-brand-bg transition-all duration-200 cursor-pointer"
                      >
                        Back to Blog Posts
                      </button>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </form>

          {/* Media Selector Modal */}
          <MediaSelectorModal 
            isOpen={isMediaSelectorOpen}
            onClose={() => setIsMediaSelectorOpen(false)}
            onSelect={(url) => setFormData(prev => ({ ...prev, coverImage: url }))}
          />
        </div>
      )}
    </div>
  );
}
