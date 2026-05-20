"use client";

import { useState, useEffect } from "react";
import { fetchBlogs, saveBlog, deleteBlog, fetchDestinations, uploadImage, fetchMiniGuides } from "@/lib/db";
import MediaSelectorModal from "@/components/dashboard/MediaSelectorModal";
import { 
  Plus, Edit2, Trash2, Search, X, Loader2, Image as ImageIcon, 
  Sparkles, BookOpen, Menu, Bell, ArrowLeft, Upload, Check, Globe, HelpCircle 
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

  const filtered = blogs.filter(b => {
    const matchStr = `${b.title} ${b.destination} ${b.category} ${b.excerpt}`.toLowerCase();
    return matchStr.includes(searchQuery.toLowerCase());
  });

  const tagsArray = formData.tags
    ? formData.tags.split(",").map(t => t.trim()).filter(Boolean)
    : ["slow travel", "temples", "food"];

  return (
    <div className="space-y-10 min-h-screen">
      {!isFormOpen ? (
        <>
          {/* Editorial Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 pb-6 border-b border-brand-border animate-in fade-in slide-in-from-top-4 duration-300">
            <div>
              <span className="text-[10px] font-bold tracking-[0.3em] text-brand-mustard uppercase block mb-2 font-sans">
                JOURNAL ARCHIVE
              </span>
              <h1 className="text-4xl md:text-5xl font-serif text-brand-ink leading-tight tracking-tight">
                Blog & Editorial
              </h1>
              <p className="text-brand-muted text-sm mt-2 max-w-xl font-light">
                Draft, edit, and feature premium stories from the road. The homepage features standard logs as well as highlighted "Fresh Off The Road" features.
              </p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="bg-brand-ink text-white px-6 py-3 rounded-full text-xs font-bold tracking-[0.2em] uppercase hover:bg-brand-mustard transition-all flex items-center justify-center gap-2 self-start md:self-auto cursor-pointer shadow-sm duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={14} className="stroke-[3]" /> Write Blog Post
            </button>
          </div>

          {/* Main Container */}
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.02)] animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Search Bar */}
            <div className="p-5 border-b border-brand-border flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-brand-bg/30">
              <div className="relative w-full max-w-md">
                <input 
                  type="text" 
                  placeholder="Search blog posts by title, location or keywords..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-brand-border rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-brand-mustard focus:ring-1 focus:ring-brand-mustard bg-white transition-all text-brand-ink font-sans placeholder:text-brand-muted/70"
                />
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-brand-muted/80" size={15} />
              </div>
              <div className="text-xs text-brand-muted font-sans font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-mustard animate-pulse"></span>
                Total: {blogs.length} articles
              </div>
            </div>

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
              <div className="overflow-x-auto font-sans">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brand-bg/40 text-[9px] uppercase tracking-[0.25em] text-brand-muted font-bold border-b border-brand-border">
                      <th className="p-5 font-bold">Article Details</th>
                      <th className="p-5 font-bold">Destination</th>
                      <th className="p-5 font-bold">Homepage Placement</th>
                      <th className="p-5 font-bold">Publication Subtitle</th>
                      <th className="p-5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {filtered.map((blog) => (
                      <tr key={blog.id} className="hover:bg-brand-bg/20 transition-colors duration-200">
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-14 rounded-lg overflow-hidden bg-brand-bg flex-shrink-0 border border-brand-border shadow-2xs group relative">
                              <img src={blog.coverImage || blog.hero_image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            </div>
                            <div className="max-w-md">
                              <h3 className="font-serif text-base font-semibold text-brand-ink hover:text-brand-mustard transition-colors duration-200 leading-snug line-clamp-1 flex items-center gap-2">
                                {blog.title}
                                {blog.status !== "Published" && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-sans font-bold tracking-wider uppercase bg-brand-bg text-brand-muted border border-brand-border">
                                    Draft
                                  </span>
                                )}
                              </h3>
                              <div className="text-[10px] font-mono text-brand-muted mt-1 tracking-wide">/{blog.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-5 text-sm text-brand-ink">
                          <span className="inline-flex items-center gap-2 font-medium bg-brand-bg border border-brand-border rounded-full py-1.5 px-3">
                            <span className="text-[8px] bg-brand-mustard text-white px-1.5 py-0.5 rounded font-black tracking-widest font-mono">{blog.countryCode || blog.country_code || "TR"}</span>
                            <span className="text-xs text-brand-ink">{blog.destination}</span>
                          </span>
                        </td>
                        <td className="p-5">
                          {(blog.isFresh || blog.is_fresh) ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-mustard-soft text-brand-mustard text-[9px] font-bold rounded-full uppercase tracking-wider border border-brand-mustard/20">
                              <Sparkles size={10} className="fill-brand-mustard/10 animate-pulse" /> Fresh Off Road
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-bg text-brand-muted text-[9px] font-bold rounded-full uppercase tracking-wider border border-brand-border">
                              Standard Entry
                            </span>
                          )}
                        </td>
                        <td className="p-5 text-xs text-brand-muted font-sans tracking-wide">
                          {blog.category || blog.date}
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button 
                              onClick={() => handleOpenEdit(blog)}
                              className="p-2 text-brand-muted hover:text-brand-mustard hover:bg-brand-bg/50 rounded-lg transition-all duration-200 cursor-pointer"
                              title="Edit Article"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button 
                              onClick={() => handleDelete(blog.id, blog.title)}
                              className="p-2 text-brand-muted hover:text-brand-coral hover:bg-brand-danger-bg/50 rounded-lg transition-all duration-200 cursor-pointer"
                              title="Delete Article"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Table Footer */}
            <div className="p-5 border-t border-brand-border bg-brand-bg/10 flex justify-between items-center text-xs text-brand-muted">
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
                        <select
                          value={formData.destination}
                          onChange={handleDestinationChange}
                          required
                          className="w-full border border-brand-border rounded-xl p-3.5 text-xs focus:outline-none focus:border-brand-mustard focus:ring-1 focus:ring-brand-mustard bg-white text-brand-ink appearance-none transition-all cursor-pointer font-sans"
                        >
                          {destinations.map((d) => (
                            <option key={d.id} value={d.country}>
                              {d.country}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">City</label>
                        <select
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full border border-brand-border rounded-xl p-3.5 text-xs focus:outline-none focus:border-brand-mustard focus:ring-1 focus:ring-brand-mustard bg-white text-brand-ink appearance-none transition-all cursor-pointer font-sans"
                        >
                          {getCitiesForDestination(formData.destination).map((city, idx) => (
                            <option key={idx} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
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
