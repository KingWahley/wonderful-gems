"use client";

import { useState, useEffect } from "react";
import { fetchTours, saveTour, deleteTour, fetchDestinations, fetchMiniGuides, uploadImage } from "@/lib/db";
import { Plus, Edit2, Trash2, Search, X, Loader2, ArrowLeft, ChevronDown, Bell, Upload, Calendar, Compass, Clock, Tag } from "lucide-react";

const cityMapping = {
  "Japan": ["Kyoto", "Tokyo", "Osaka", "Nara"],
  "Morocco": ["Marrakech", "Fes", "Casablanca", "Chefchaouen"],
  "Portugal": ["Lisbon", "Porto", "Sintra", "Algarve"],
  "Chile": ["Santiago", "Valparaiso", "San Pedro de Atacama"],
  "Mexico": ["Mexico City", "Oaxaca", "Cancun", "Tulum"],
  "Iceland": ["Reykjavík", "Akureyri", "Vik"],
  "Vietnam": ["Hanoi", "Ho Chi Minh City", "Hoi An"],
  "Italy": ["Rome", "Florence", "Venice", "Milan"],
  "Belgium": ["Brussels", "Bruges", "Ghent"],
  "United States": ["New York City", "Los Angeles", "Chicago"],
  "France": ["Paris", "Nice", "Lyon"],
  "Spain": ["Barcelona", "Madrid", "Seville"]
};

const standardCategories = ["Culture", "Food & Drink", "Adventure", "Nature", "Sightseeing", "Active", "History"];

export default function ToursCMS() {
  const [tours, setTours] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [miniGuides, setMiniGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    destination: "",
    countryCode: "",
    category: "Culture",
    description: "",
    details: "",
    badge: "TOUR",
    status: "published",
    slug: "",
    heroImage: "",
    shortDescription: "",
    price: "",
    availability: "Flexible departures daily",
    city: "",
    bookingLink: "",
    partnerNote: "",
    imageAltText: "",
    pocketGuideId: "",
    itineraryGuideId: "",
    featureOnHomepage: "No",
    featureOnDestination: "Yes",
    sortOrder: "",
    seoTitle: "",
    metaDescription: "",
    included: [],
    gallery: []
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [toursData, destinationsData, guidesData] = await Promise.all([
        fetchTours(),
        fetchDestinations(),
        fetchMiniGuides().catch(() => [])
      ]);
      setTours(toursData);
      setDestinations(destinationsData);
      setMiniGuides(guidesData);
    } catch (e) {
      console.error("Failed to load tours page data", e);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setModalMode("add");
    const defaultDest = destinations[0]?.country || "Japan";
    const defaultCity = cityMapping[defaultDest]?.[0] || "Kyoto";
    setFormData({
      id: "",
      title: "",
      destination: defaultDest,
      countryCode: destinations[0]?.code || "JP",
      category: "Culture",
      description: "",
      details: "Duration: 2 hours",
      badge: "TOUR",
      status: "draft",
      slug: "",
      heroImage: "",
      shortDescription: "",
      price: "From $45",
      duration: "2 hours",
      availability: "Flexible departures daily",
      city: defaultCity,
      bookingLink: "",
      partnerNote: "",
      imageAltText: "",
      pocketGuideId: "",
      itineraryGuideId: "",
      featureOnHomepage: "No",
      featureOnDestination: "Yes",
      sortOrder: "",
      seoTitle: "",
      metaDescription: "",
      included: [
        "Certified bilingual professional guide",
        "Priority entry tickets (Skip-the-line)",
        "Traditional tea ceremony equipment and materials"
      ],
      gallery: []
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (tour) => {
    setModalMode("edit");
    setFormData({
      id: tour.id,
      title: tour.title || "",
      destination: tour.destination || "",
      countryCode: tour.countryCode || "",
      category: tour.category || "Culture",
      description: tour.description || "",
      details: tour.details || "",
      badge: tour.badge || "TOUR",
      status: tour.status || "published",
      slug: tour.slug || "",
      heroImage: tour.heroImage || "",
      shortDescription: tour.shortDescription || "",
      price: tour.price || "",
      duration: tour.duration || "",
      availability: tour.availability || "Flexible departures daily",
      city: tour.city || "",
      bookingLink: tour.bookingLink || "",
      partnerNote: tour.partnerNote || "",
      imageAltText: tour.imageAltText || "",
      pocketGuideId: tour.pocketGuideId || "",
      itineraryGuideId: tour.itineraryGuideId || "",
      featureOnHomepage: tour.featureOnHomepage || "No",
      featureOnDestination: tour.featureOnDestination || "Yes",
      sortOrder: tour.sortOrder || "",
      seoTitle: tour.seoTitle || "",
      metaDescription: tour.metaDescription || "",
      included: Array.isArray(tour.included) ? tour.included : [],
      gallery: Array.isArray(tour.gallery) ? tour.gallery : []
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (confirm(`Are you sure you want to delete the tour "${title}"?`)) {
      try {
        await deleteTour(id);
        setTours(tours.filter(t => t.id !== id));
      } catch (e) {
        alert("Failed to delete tour: " + e.message);
      }
    }
  };

  const handleDestinationChange = (e) => {
    const destName = e.target.value;
    const destObj = destinations.find(d => d.country === destName);
    const defaultCity = cityMapping[destName]?.[0] || "";
    setFormData(prev => ({
      ...prev,
      destination: destName,
      countryCode: destObj ? destObj.code : "",
      city: defaultCity
    }));
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    if (modalMode === "add") {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      setFormData(prev => ({ ...prev, title, slug }));
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
      setFormData(prev => ({ ...prev, heroImage: publicUrl }));
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
      setFormData(prev => ({ ...prev, heroImage: publicUrl }));
    } catch (error) {
      alert("Failed to drop and upload image: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (statusOverride) => {
    if (!formData.title || !formData.destination || !formData.duration) {
      alert("Title, Destination, and Duration are required.");
      return;
    }

    try {
      setSaving(true);
      const generatedSlug = formData.slug || formData.title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const statusToSave = statusOverride || formData.status || "published";

      const payload = {
        title: formData.title,
        destination: formData.destination,
        countryCode: formData.countryCode.toUpperCase(),
        category: formData.category,
        description: formData.description, // Maps to Full Description
        badge: formData.badge,
        status: statusToSave,
        slug: generatedSlug,
        heroImage: formData.heroImage,
        shortDescription: formData.shortDescription,
        price: formData.price,
        duration: formData.duration,
        availability: formData.availability,
        city: formData.city,
        bookingLink: formData.bookingLink,
        partnerNote: formData.partnerNote,
        imageAltText: formData.imageAltText,
        pocketGuideId: formData.pocketGuideId,
        itineraryGuideId: formData.itineraryGuideId,
        featureOnHomepage: formData.featureOnHomepage,
        featureOnDestination: formData.featureOnDestination,
        sortOrder: formData.sortOrder,
        seoTitle: formData.seoTitle,
        metaDescription: formData.metaDescription,
        included: formData.included.filter(Boolean),
        gallery: formData.gallery.filter(Boolean)
      };

      if (formData.id) {
        payload.id = formData.id;
      }

      await saveTour(payload);
      await loadData();
      setIsFormOpen(false);
    } catch (err) {
      alert("Failed to save tour: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = tours.filter(t => {
    const matchStr = `${t.title} ${t.destination} ${t.category} ${t.badge} ${t.city || ""}`.toLowerCase();
    return matchStr.includes(searchQuery.toLowerCase());
  });

  const pocketGuides = miniGuides.filter(g => g.type === "pocket");
  const itineraryGuides = miniGuides.filter(g => g.type === "itinerary");

  const categories = [...standardCategories];
  if (formData.category && !standardCategories.includes(formData.category)) {
    categories.push(formData.category);
  }

  return (
    <div className="space-y-10 min-h-screen">
      {!isFormOpen ? (
        <>
          {/* Editorial Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 pb-6 border-b border-brand-border animate-in fade-in slide-in-from-top-4 duration-300">
            <div>
              <span className="text-[10px] font-bold tracking-[0.3em] text-brand-mustard uppercase block mb-2 font-sans">
                EXPERIENCE CMS
              </span>
              <h1 className="text-4xl md:text-5xl font-serif text-brand-ink leading-tight tracking-tight">
                Tours & Activities
              </h1>
              <p className="text-brand-muted text-sm mt-2 max-w-xl font-light">
                Manage the curated destination tours, skip-the-line activity recommendations, and partner bookings showcased on destination guides.
              </p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="bg-brand-ink text-white px-6 py-3 rounded-full text-xs font-bold tracking-[0.2em] uppercase hover:bg-brand-mustard transition-all flex items-center justify-center gap-2 self-start md:self-auto cursor-pointer shadow-sm duration-300 transform hover:-translate-y-0.5 active:translate-y-0 font-sans"
            >
              <Plus size={14} className="stroke-[3]" /> Create Tour
            </button>
          </div>

          {/* Main Container */}
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.02)] animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Search Bar */}
            <div className="p-5 border-b border-brand-border flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-brand-bg/30">
              <div className="relative w-full max-w-md">
                <input 
                  type="text" 
                  placeholder="Search experiences by title, destination, category..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-brand-border rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-brand-mustard focus:ring-1 focus:ring-brand-mustard bg-white transition-all text-brand-ink font-sans placeholder:text-brand-muted/70"
                />
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-brand-muted/80" size={15} />
              </div>
              <div className="text-xs text-brand-muted font-sans font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-mustard animate-pulse"></span>
                Total: {tours.length} experiences
              </div>
            </div>

            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-brand-mustard" size={32} />
                <p className="text-brand-muted text-xs font-bold tracking-widest uppercase animate-pulse">Fetching tours...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-24 text-center max-w-sm mx-auto">
                <Compass className="text-brand-border mx-auto mb-4" size={40} />
                <p className="text-brand-ink font-serif text-lg mb-1">No tours found</p>
                <p className="text-xs text-brand-muted leading-relaxed">
                  {searchQuery ? "Try refining your search terms or view standard directory." : "Create a fresh tour to populate the database index."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto font-sans">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brand-bg/40 text-[9px] uppercase tracking-[0.25em] text-brand-muted font-bold border-b border-brand-border">
                      <th className="p-5 font-bold">Tour Details</th>
                      <th className="p-5 font-bold">Destination</th>
                      <th className="p-5 font-bold">Category</th>
                      <th className="p-5 font-bold">Duration / Price</th>
                      <th className="p-5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {filtered.map((tour) => (
                      <tr key={tour.id} className="hover:bg-brand-bg/20 transition-colors duration-200">
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-14 rounded-lg overflow-hidden bg-brand-bg flex-shrink-0 border border-brand-border shadow-2xs group relative">
                              <img src={tour.heroImage || "https://images.unsplash.com/photo-1542044896530-05d85be9b11a?q=80&w=1000&auto=format&fit=crop"} alt={tour.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            </div>
                            <div className="max-w-md">
                              <h3 className="font-serif text-base font-semibold text-brand-ink hover:text-brand-mustard transition-colors duration-200 leading-snug line-clamp-1 flex items-center gap-2">
                                {tour.title}
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-sans font-bold tracking-wider uppercase ${
                                  tour.badge === "TICKET" 
                                    ? "bg-amber-100 text-amber-800" 
                                    : "bg-emerald-100 text-emerald-800"
                                }`}>
                                  {tour.badge || "TOUR"}
                                </span>
                                {(tour.status || "published").toLowerCase() !== "published" && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-sans font-bold tracking-wider uppercase bg-brand-bg text-brand-muted border border-brand-border">
                                    Draft
                                  </span>
                                )}
                              </h3>
                              <div className="text-[10px] font-mono text-brand-muted mt-1 tracking-wide">/{tour.slug || tour.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-5 text-sm text-brand-ink">
                          <span className="inline-flex items-center gap-2 font-medium bg-brand-bg border border-brand-border rounded-full py-1.5 px-3">
                            <span className="text-[8px] bg-brand-mustard text-white px-1.5 py-0.5 rounded font-black tracking-widest font-mono">{tour.countryCode || "TR"}</span>
                            <span className="text-xs text-brand-ink">{tour.destination}{tour.city && ` • ${tour.city}`}</span>
                          </span>
                        </td>
                        <td className="p-5 text-xs text-brand-muted font-bold uppercase tracking-wider">
                          {tour.category}
                        </td>
                        <td className="p-5">
                          <div className="text-xs text-brand-ink font-semibold">{tour.duration || "N/A"}</div>
                          <div className="text-[10px] text-brand-muted font-mono mt-0.5">{tour.price || "N/A"}</div>
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button 
                              onClick={() => handleOpenEdit(tour)}
                              className="p-2 text-brand-muted hover:text-brand-mustard hover:bg-brand-bg/50 rounded-lg transition-all duration-200 cursor-pointer"
                              title="Edit Tour"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button 
                              onClick={() => handleDelete(tour.id, tour.title)}
                              className="p-2 text-brand-muted hover:text-brand-coral hover:bg-brand-danger-bg/50 rounded-lg transition-all duration-200 cursor-pointer"
                              title="Delete Tour"
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
              <span>Displaying {filtered.length} of {tours.length} experiences</span>
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
                <span>Tours</span>
                <span className="text-brand-border">/</span>
                <span className="text-brand-ink">{modalMode === "add" ? "Add Tour" : "Edit Tour"}</span>
              </div>
            </div>
            
            <div className="relative w-full max-w-xs my-2 sm:my-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-muted" size={14} />
              <input 
                type="text" 
                placeholder="Search tours..." 
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

          {/* Form Content */}
          <div className="max-w-7xl mx-auto space-y-8 font-sans">
            
            {/* Title & Actions Bar */}
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 pb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-serif text-brand-ink tracking-tight font-semibold">
                  {modalMode === "add" ? "Add Tour" : "Edit Tour"}
                </h1>
                <p className="text-brand-muted text-xs mt-2 max-w-2xl font-light leading-relaxed">
                  Create a destination-based tour or activity recommendation with title, destination, city, category, description, duration, price, booking link, image, related guide links and publishing status.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 bg-white border border-brand-border rounded-xl text-xs font-bold text-brand-ink hover:bg-brand-bg transition-all cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSave("draft")}
                  disabled={saving}
                  className="px-5 py-2.5 bg-white border border-brand-border rounded-xl text-xs font-bold text-brand-ink hover:bg-brand-bg transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSave("published")}
                  disabled={saving}
                  className="px-5 py-2.5 bg-brand-mustard text-white rounded-xl text-xs font-bold hover:bg-brand-ink transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {saving && <Loader2 className="animate-spin" size={12} />}
                  {modalMode === "add" ? "Publish Tour" : "Save Changes"}
                </button>
              </div>
            </div>

            {/* Split Two-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Form Cards (8 Columns) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* 1. Tour Details Card */}
                <div className="bg-white rounded-3xl border border-brand-border p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-lg font-bold text-brand-ink font-serif">Tour Details</h2>
                    <p className="text-brand-muted text-xs font-light mt-1">Basic information displayed on the Tour page and destination-related sections.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Tour Title</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={handleTitleChange}
                        className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all"
                        placeholder="e.g. Kyoto Tea Ceremony Experience"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Destination</label>
                        <div className="relative">
                          <select
                            value={formData.destination}
                            onChange={handleDestinationChange}
                            required
                            className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink appearance-none transition-all cursor-pointer pr-10"
                          >
                            {destinations.map((d) => (
                              <option key={d.id} value={d.country}>
                                {d.country}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-brand-muted pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">City</label>
                        <div className="relative">
                          <select
                            value={cityMapping[formData.destination]?.includes(formData.city) ? formData.city : "custom"}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "custom") {
                                setFormData(prev => ({ ...prev, city: "" }));
                              } else {
                                setFormData(prev => ({ ...prev, city: val }));
                              }
                            }}
                            className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink appearance-none transition-all cursor-pointer pr-10"
                          >
                            {(cityMapping[formData.destination] || []).map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                            <option value="custom">Other / Custom City...</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-brand-muted pointer-events-none" />
                        </div>
                        
                        {(!cityMapping[formData.destination]?.includes(formData.city)) && (
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            className="mt-2 w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all"
                            placeholder="Enter custom city name"
                            required
                          />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Category</label>
                        <div className="relative">
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink appearance-none transition-all cursor-pointer pr-10"
                          >
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                            <option value="Custom">Custom...</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-brand-muted pointer-events-none" />
                        </div>
                        {formData.category === "Custom" && (
                          <input
                            type="text"
                            value={formData.category === "Custom" ? "" : formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className="mt-2 w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all"
                            placeholder="Enter custom category"
                            required
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Duration</label>
                        <input
                          type="text"
                          required
                          value={formData.duration}
                          onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                          className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all"
                          placeholder="e.g. 2 hours"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Price</label>
                        <input
                          type="text"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                          className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all"
                          placeholder="e.g. From $45"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Short Description</label>
                      <textarea
                        rows={2}
                        value={formData.shortDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                        className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all resize-none"
                        placeholder="Write a short summary for the tour card."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Full Description</label>
                      <textarea
                        rows={5}
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all"
                        placeholder="Add more detail about why this tour or activity is recommended."
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Booking & Media Card */}
                <div className="bg-white rounded-3xl border border-brand-border p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-brand-ink font-serif">Booking & Media</h2>
                    <p className="text-brand-muted text-xs font-light mt-1">Specify partner booking links and choose an evocative thumbnail image.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Booking Link</label>
                      <input
                        type="text"
                        value={formData.bookingLink}
                        onChange={(e) => setFormData(prev => ({ ...prev, bookingLink: e.target.value }))}
                        className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all"
                        placeholder="https://"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Affiliate / Partner Note</label>
                      <input
                        type="text"
                        value={formData.partnerNote}
                        onChange={(e) => setFormData(prev => ({ ...prev, partnerNote: e.target.value }))}
                        className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all"
                        placeholder="Optional internal note about booking partner or affiliate source"
                      />
                    </div>

                    {/* Image Upload Block */}
                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Tour Image</label>
                      <div 
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById("tour-file-input").click()}
                        className="border-2 border-dashed border-brand-mustard/20 bg-[#FCFBF8] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-mustard hover:bg-[#FAF6EC] transition-all group select-none relative h-40 overflow-hidden"
                      >
                        {uploadingImage ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin text-brand-mustard" size={24} />
                            <span className="text-xs font-bold text-brand-mustard tracking-wider uppercase animate-pulse">Uploading Image...</span>
                          </div>
                        ) : formData.heroImage ? (
                          <>
                            <img 
                              src={formData.heroImage} 
                              alt="Tour Cover Preview" 
                              className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-15 transition-opacity" 
                            />
                            <div className="relative z-10 flex flex-col items-center justify-center">
                              <Upload className="text-brand-mustard/60 group-hover:text-brand-mustard transition-colors mb-2" size={24} />
                              <span className="text-xs font-bold text-brand-ink font-serif block mb-1">Change Tour Image</span>
                              <span className="text-[9px] text-brand-muted block max-w-xs leading-normal">
                                Drag & drop or click to browse files
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <Upload className="text-brand-mustard/60 group-hover:text-brand-mustard transition-colors mb-2" size={24} />
                            <span className="text-xs font-bold text-brand-ink font-serif block mb-1">Upload tour image</span>
                            <span className="text-[9px] text-brand-muted block max-w-xs leading-normal">
                              Recommended size: 1600 x 1080px. Max size: 5MB
                            </span>
                            <span className="text-[9px] text-brand-mustard block mt-1 underline">
                              Drag and drop or browse files
                            </span>
                          </>
                        )}
                        <input 
                          id="tour-file-input"
                          type="file" 
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </div>
                      <input
                        type="text"
                        value={formData.heroImage}
                        onChange={(e) => setFormData(prev => ({ ...prev, heroImage: e.target.value }))}
                        className="mt-3 w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all font-sans"
                        placeholder="Or paste an image URL here..."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Image Alt Text</label>
                      <input
                        type="text"
                        value={formData.imageAltText}
                        onChange={(e) => setFormData(prev => ({ ...prev, imageAltText: e.target.value }))}
                        className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all"
                        placeholder="Describe the tour image for accessibility."
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Relationships Card */}
                <div className="bg-white rounded-3xl border border-brand-border p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-brand-ink font-serif">Relationships</h2>
                    <p className="text-brand-muted text-xs font-light mt-1">Connect this tour to relevant guides and homepage sections.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="border border-brand-border/60 rounded-2xl p-6 bg-brand-bg/5 space-y-4">
                      <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block font-sans">
                        Related Guides
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold text-brand-muted uppercase tracking-wider mb-2">Related Pocket Guide</label>
                          <div className="relative">
                            <select
                              value={formData.pocketGuideId}
                              onChange={(e) => setFormData(prev => ({ ...prev, pocketGuideId: e.target.value }))}
                              className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink appearance-none transition-all cursor-pointer pr-8"
                            >
                              <option value="">No guide selected</option>
                              {pocketGuides.map(g => (
                                <option key={g.id} value={g.id}>{g.title}</option>
                              ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-muted pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-brand-muted uppercase tracking-wider mb-2">Related Itinerary Guide</label>
                          <div className="relative">
                            <select
                              value={formData.itineraryGuideId}
                              onChange={(e) => setFormData(prev => ({ ...prev, itineraryGuideId: e.target.value }))}
                              className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink appearance-none transition-all cursor-pointer pr-8"
                            >
                              <option value="">No itinerary selected</option>
                              {itineraryGuides.map(g => (
                                <option key={g.id} value={g.id}>{g.title}</option>
                              ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-muted pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Feature on Homepage</label>
                        <div className="relative">
                          <select
                            value={formData.featureOnHomepage}
                            onChange={(e) => setFormData(prev => ({ ...prev, featureOnHomepage: e.target.value }))}
                            className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink appearance-none transition-all cursor-pointer pr-10"
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-brand-muted pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Feature on Destination Page</label>
                        <div className="relative">
                          <select
                            value={formData.featureOnDestination}
                            onChange={(e) => setFormData(prev => ({ ...prev, featureOnDestination: e.target.value }))}
                            className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink appearance-none transition-all cursor-pointer pr-10"
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-brand-muted pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Publishing & SEO Card */}
                <div className="bg-white rounded-3xl border border-brand-border p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-brand-ink font-serif">Publishing & SEO</h2>
                    <p className="text-brand-muted text-xs font-light mt-1">Adjust search visibility settings and sort priorities.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Status</label>
                        <div className="relative">
                          <select
                            value={formData.status}
                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink appearance-none transition-all cursor-pointer pr-10"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-brand-muted pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Sort Order</label>
                        <input
                          type="number"
                          value={formData.sortOrder}
                          onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: e.target.value }))}
                          className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all"
                          placeholder="e.g. 1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">URL Slug</label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }))}
                        className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all font-mono"
                        placeholder="e.g. kyoto-tea-ceremony-experience"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">SEO Title</label>
                      <input
                        type="text"
                        value={formData.seoTitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                        className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all"
                        placeholder="e.g. Kyoto Tea Ceremony Experience — The Long Way"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Meta Description</label>
                      <textarea
                        rows={3}
                        value={formData.metaDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                        className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all resize-none"
                        placeholder="Write a short search description for this tour."
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Live Card Preview (4 Columns) */}
              <div className="lg:col-span-4 sticky top-6 space-y-6">
                <div className="bg-[#FAF6EC] border border-brand-border rounded-3xl p-6 shadow-sm">
                  
                  {/* Actual Card Render */}
                  <div className="bg-white rounded-2xl overflow-hidden border border-brand-border/60 shadow-sm transition-all duration-300 relative group">
                    
                    {/* Visual Card Cover Image with Overlay */}
                    <div className="h-64 w-full bg-brand-bg relative overflow-hidden">
                      <img 
                        src={formData.heroImage || "https://images.unsplash.com/photo-1542044896530-05d85be9b11a?q=80&w=1000&auto=format&fit=crop"} 
                        alt={formData.title || "Tour Preview Cover"} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                      
                      {/* Badge Tag */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-[#FAF6EC]/90 backdrop-blur-2xs text-[#c7962d] text-[9px] font-bold tracking-widest px-2.5 py-1 rounded border border-[#c7962d]/25 uppercase font-sans">
                          {formData.status === "draft" ? "Draft Preview" : "Published Live"}
                        </span>
                      </div>

                      {/* Overlying title in bottom corner */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white text-xl font-serif leading-tight font-semibold line-clamp-2">
                          {formData.title || "Kyoto Tea Ceremony Experience"}
                        </h3>
                      </div>
                    </div>

                    {/* Excerpt details */}
                    <div className="p-5 space-y-4 font-sans text-brand-ink">
                      
                      {/* Tags */}
                      <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-brand-muted/80 uppercase">
                        <span>{formData.destination || "Japan"}</span>
                        <span>•</span>
                        <span>{formData.city || "Kyoto"}</span>
                        <span>•</span>
                        <span>{formData.category || "Culture"}</span>
                      </div>

                      {/* Short summary description */}
                      <p className="text-xs text-brand-muted leading-relaxed font-light line-clamp-3">
                        {formData.shortDescription || "A calm cultural activity that works well after a temple morning."}
                      </p>

                      {/* Detail Metrics Table */}
                      <div className="border-t border-brand-border/60 pt-3 space-y-2.5 text-xs font-sans">
                        <div className="flex justify-between items-center">
                          <span className="text-brand-muted font-normal flex items-center gap-1.5"><Clock size={12} /> Duration</span>
                          <span className="font-bold text-brand-ink">{formData.duration || "2 hours"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-brand-muted font-normal flex items-center gap-1.5"><Compass size={12} /> Price</span>
                          <span className="font-bold text-brand-ink">{formData.price || "From $45"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-brand-muted font-normal flex items-center gap-1.5"><Tag size={12} /> Booking Link</span>
                          <span className={`font-bold uppercase tracking-wider text-[9px] px-2 py-0.5 rounded-full ${formData.bookingLink ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-brand-bg text-brand-muted border border-brand-border"}`}>
                            {formData.bookingLink ? "Added" : "Not added"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-brand-muted font-normal flex items-center gap-1.5"><Compass size={12} /> Homepage</span>
                          <span className="font-bold text-brand-ink">{formData.featureOnHomepage || "No"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-brand-muted font-normal flex items-center gap-1.5"><Tag size={12} /> Status</span>
                          <span className="font-bold text-brand-ink capitalize">{formData.status || "Draft"}</span>
                        </div>
                      </div>

                      {/* Card Action Controls */}
                      <div className="pt-2 space-y-2">
                        <button 
                          type="button" 
                          onClick={() => handleSave("published")}
                          className="w-full bg-brand-mustard text-white text-xs font-bold py-2.5 px-4 rounded-xl uppercase tracking-wider hover:bg-brand-ink transition-colors cursor-pointer shadow-2xs"
                        >
                          Preview Tour
                        </button>
                        <button 
                          type="button"
                          onClick={() => setIsFormOpen(false)}
                          className="w-full bg-white text-brand-ink border border-brand-border text-xs font-bold py-2.5 px-4 rounded-xl uppercase tracking-wider hover:bg-brand-bg transition-all cursor-pointer shadow-2xs"
                        >
                          Back to Tours
                        </button>
                      </div>

                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
