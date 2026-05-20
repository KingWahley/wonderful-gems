"use client";

import { useState, useEffect } from "react";
import { fetchMiniGuides, saveMiniGuide, deleteMiniGuide, fetchDestinations, uploadImage } from "@/lib/db";
import { 
  Plus, Edit2, Trash2, Search, X, Loader2, Image as ImageIcon,
  Sparkles, BookOpen, Menu, Bell, ArrowLeft, Upload, Check, Globe, HelpCircle,
  ChevronDown, Calendar, Clock, Compass, MapPin, Sparkle
} from "lucide-react";
import MediaSelectorModal from "@/components/dashboard/MediaSelectorModal";

const defaultDetails = {
  pocketTitle: "",
  itineraryTitle: "",
  blogCountText: "",
  city: "Kyoto",
  bestTimeToVisit: "March to May & Oct to Nov",
  idealDuration: "4-5 Days",
  budgetLevel: "Mid-range",
  featuredInDestination: "Yes",
  featured: "no",
  seoTitle: "",
  metaDescription: "",
  sights: [{ num: "01", text: "" }],
  stay: {
    budget: [{ name: "", desc: "" }],
    mid: [{ name: "", desc: "" }],
    splurge: [{ name: "", desc: "" }]
  },
  activities: [{ num: "01", text: "" }],
  eat: [{ name: "", desc: "" }],
  restaurants: {
    budget: [{ name: "", desc: "" }],
    mid: [{ name: "", desc: "" }],
    splurge: [{ name: "", desc: "" }]
  },
  dayTrips: [{ num: "01", name: "" }]
};

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

const mergeWithDefaults = (details) => {
  const d = details || {};
  return {
    ...d,
    pocketTitle: d.pocketTitle || "",
    itineraryTitle: d.itineraryTitle || "",
    blogCountText: d.blogCountText || "",
    city: d.city || "Kyoto",
    bestTimeToVisit: d.bestTimeToVisit || "March to May & Oct to Nov",
    idealDuration: d.idealDuration || "4-5 Days",
    budgetLevel: d.budgetLevel || "Mid-range",
    featuredInDestination: d.featuredInDestination || "Yes",
    featured: d.featured || "no",
    seoTitle: d.seoTitle || "",
    metaDescription: d.metaDescription || "",
    sights: d.sights && d.sights.length > 0 ? d.sights : [{ num: "01", text: "" }],
    stay: {
      budget: d.stay?.budget && d.stay.budget.length > 0 ? d.stay.budget : [{ name: "", desc: "" }],
      mid: d.stay?.mid && d.stay.mid.length > 0 ? d.stay.mid : [{ name: "", desc: "" }],
      splurge: d.stay?.splurge && d.stay.splurge.length > 0 ? d.stay.splurge : [{ name: "", desc: "" }],
    },
    activities: d.activities && d.activities.length > 0 ? d.activities : [{ num: "01", text: "" }],
    eat: d.eat && d.eat.length > 0 ? d.eat : [{ name: "", desc: "" }],
    restaurants: {
      budget: d.restaurants?.budget && d.restaurants.budget.length > 0 ? d.restaurants.budget : [{ name: "", desc: "" }],
      mid: d.restaurants?.mid && d.restaurants.mid.length > 0 ? d.restaurants.mid : [{ name: "", desc: "" }],
      splurge: d.restaurants?.splurge && d.restaurants.splurge.length > 0 ? d.restaurants.splurge : [{ name: "", desc: "" }],
    },
    dayTrips: d.dayTrips && d.dayTrips.length > 0 ? d.dayTrips : [{ num: "01", name: "" }]
  };
};

export default function PocketGuidesCMS() {
  const [guides, setGuides] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    id: "",
    slug: "",
    destination: "",
    countryCode: "",
    title: "",
    excerpt: "",
    heroImage: "",
    status: "published",
    details: defaultDetails
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [guidesData, destinationsData] = await Promise.all([
        fetchMiniGuides(),
        fetchDestinations()
      ]);
      // Filter only pocket guides
      const pocketGuides = guidesData.filter(g => g.type === "pocket");
      setGuides(pocketGuides);
      setDestinations(destinationsData);
    } catch (e) {
      console.error("Failed to load pocket guides page data", e);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setModalMode("add");
    const defaultDest = destinations[0]?.country || "Japan";
    setFormData({
      id: "",
      slug: "",
      destination: defaultDest,
      countryCode: destinations[0]?.code || destinations[0]?.country_code || "JP",
      title: "",
      excerpt: "",
      heroImage: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?q=80&w=2000&auto=format&fit=crop",
      status: "published",
      details: {
        ...defaultDetails,
        city: cityMapping[defaultDest]?.[0] || "Kyoto"
      }
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (guide) => {
    setModalMode("edit");
    const details = mergeWithDefaults(guide.details);
    setFormData({
      id: guide.id,
      slug: guide.slug || "",
      destination: guide.destination || "",
      countryCode: guide.countryCode || guide.country_code || "",
      title: guide.title || "",
      excerpt: guide.excerpt || "",
      heroImage: guide.heroImage || guide.coverImage || "",
      status: guide.status || "published",
      details: {
        ...details,
        city: guide.details?.city || guide.title.replace(" Travel Guide", "") || "Kyoto",
        bestTimeToVisit: guide.details?.bestTimeToVisit || "March to May & Oct to Nov",
        idealDuration: guide.details?.idealDuration || "4-5 Days",
        budgetLevel: guide.details?.budgetLevel || "Mid-range",
        featuredInDestination: guide.details?.featuredInDestination || "Yes",
        featured: guide.details?.featured || "no",
        seoTitle: guide.details?.seoTitle || "",
        metaDescription: guide.details?.metaDescription || ""
      }
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (confirm(`Are you sure you want to delete the guide "${title}"?`)) {
      try {
        await deleteMiniGuide(id);
        setGuides(guides.filter(g => g.id !== id));
      } catch (e) {
        alert("Failed to delete guide: " + e.message);
      }
    }
  };

  const handleDestinationChange = (e) => {
    const destName = e.target.value;
    const destObj = destinations.find(d => d.country === destName);
    const countryCode = destObj ? (destObj.code || destObj.country_code || "") : "";
    const defaultCity = cityMapping[destName]?.[0] || "";
    
    setFormData(prev => ({
      ...prev,
      destination: destName,
      countryCode: countryCode.toUpperCase(),
      details: {
        ...prev.details,
        city: defaultCity
      }
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

  // Details State Helpers
  const updateDetailField = (key, value) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [key]: value
      }
    }));
  };

  const updateStayField = (tier, idx, field, val) => {
    setFormData(prev => {
      const stay = { ...prev.details.stay };
      const list = [...(stay[tier] || [])];
      list[idx] = { ...list[idx], [field]: val };
      stay[tier] = list;
      return {
        ...prev,
        details: { ...prev.details, stay }
      };
    });
  };

  const addStayItem = (tier) => {
    setFormData(prev => {
      const stay = { ...prev.details.stay };
      stay[tier] = [...(stay[tier] || []), { name: "", desc: "" }];
      return {
        ...prev,
        details: { ...prev.details, stay }
      };
    });
  };

  const removeStayItem = (tier, idx) => {
    setFormData(prev => {
      const stay = { ...prev.details.stay };
      stay[tier] = (stay[tier] || []).filter((_, i) => i !== idx);
      return {
        ...prev,
        details: { ...prev.details, stay }
      };
    });
  };

  const updateRestaurantField = (tier, idx, field, val) => {
    setFormData(prev => {
      const restaurants = { ...prev.details.restaurants };
      const list = [...(restaurants[tier] || [])];
      list[idx] = { ...list[idx], [field]: val };
      restaurants[tier] = list;
      return {
        ...prev,
        details: { ...prev.details, restaurants }
      };
    });
  };

  const addRestaurantItem = (tier) => {
    setFormData(prev => {
      const restaurants = { ...prev.details.restaurants };
      restaurants[tier] = [...(restaurants[tier] || []), { name: "", desc: "" }];
      return {
        ...prev,
        details: { ...prev.details, restaurants }
      };
    });
  };

  const removeRestaurantItem = (tier, idx) => {
    setFormData(prev => {
      const restaurants = { ...prev.details.restaurants };
      restaurants[tier] = (restaurants[tier] || []).filter((_, i) => i !== idx);
      return {
        ...prev,
        details: { ...prev.details, restaurants }
      };
    });
  };

  const updateListField = (field, idx, key, val) => {
    setFormData(prev => {
      const list = [...(prev.details[field] || [])];
      list[idx] = { ...list[idx], [key]: val };
      return {
        ...prev,
        details: { ...prev.details, [field]: list }
      };
    });
  };

  const addListItem = (field, defaultObj) => {
    setFormData(prev => {
      const list = [...(prev.details[field] || [])];
      const num = String(list.length + 1).padStart(2, "0");
      list.push(defaultObj.num !== undefined ? { ...defaultObj, num } : defaultObj);
      return {
        ...prev,
        details: { ...prev.details, [field]: list }
      };
    });
  };

  const removeListItem = (field, idx) => {
    setFormData(prev => {
      const list = (prev.details[field] || []).filter((_, i) => i !== idx).map((item, i) => {
        if (item.num !== undefined) {
          return { ...item, num: String(i + 1).padStart(2, "0") };
        }
        return item;
      });
      return {
        ...prev,
        details: { ...prev.details, [field]: list }
      };
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title || !formData.slug || !formData.destination) {
      alert("Title, slug, and destination are required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        type: "pocket",
        slug: formData.slug.toLowerCase().replace(/\s+/g, "-"),
        destination: formData.destination,
        countryCode: formData.countryCode.toUpperCase(),
        title: formData.title,
        excerpt: formData.excerpt,
        heroImage: formData.heroImage || "https://images.unsplash.com/photo-1597212618440-806262de4f6b?q=80&w=2000&auto=format&fit=crop",
        details: formData.details,
        status: formData.status || "published"
      };

      if (formData.id) {
        payload.id = formData.id;
      }

      await saveMiniGuide(payload);
      await loadData();
      setIsFormOpen(false);
    } catch (err) {
      alert("Failed to save pocket guide: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Stay Unified Item List Computed
  const stayItems = [];
  ["budget", "mid", "splurge"].forEach(tier => {
    (formData.details.stay?.[tier] || []).forEach((hotel, idx) => {
      stayItems.push({ tier, idx, name: hotel.name, desc: hotel.desc });
    });
  });

  const handleStayItemChange = (tier, idx, field, value) => {
    updateStayField(tier, idx, field, value);
  };

  const handleStayTierChange = (oldTier, idx, newTier) => {
    setFormData(prev => {
      const stay = { ...prev.details.stay };
      const oldList = [...(stay[oldTier] || [])];
      const [removed] = oldList.splice(idx, 1);
      stay[oldTier] = oldList;
      stay[newTier] = [...(stay[newTier] || []), removed || { name: "", desc: "" }];
      return {
        ...prev,
        details: { ...prev.details, stay }
      };
    });
  };

  const handleStayDelete = (tier, idx) => {
    removeStayItem(tier, idx);
  };

  const handleStayAdd = () => {
    addStayItem("mid"); // Default to mid-range
  };

  // Restaurant Unified Item List Computed
  const restaurantItems = [];
  ["budget", "mid", "splurge"].forEach(tier => {
    (formData.details.restaurants?.[tier] || []).forEach((rest, idx) => {
      restaurantItems.push({ tier, idx, name: rest.name, desc: rest.desc });
    });
  });

  const handleRestaurantItemChange = (tier, idx, field, value) => {
    updateRestaurantField(tier, idx, field, value);
  };

  const handleRestaurantTierChange = (oldTier, idx, newTier) => {
    setFormData(prev => {
      const restaurants = { ...prev.details.restaurants };
      const oldList = [...(restaurants[oldTier] || [])];
      const [removed] = oldList.splice(idx, 1);
      restaurants[oldTier] = oldList;
      restaurants[newTier] = [...(restaurants[newTier] || []), removed || { name: "", desc: "" }];
      return {
        ...prev,
        details: { ...prev.details, restaurants }
      };
    });
  };

  const handleRestaurantDelete = (tier, idx) => {
    removeRestaurantItem(tier, idx);
  };

  const handleRestaurantAdd = () => {
    addRestaurantItem("mid"); // Default to mid-range
  };

  const filtered = guides.filter(g => {
    const matchStr = `${g.title} ${g.destination} ${g.excerpt}`.toLowerCase();
    return matchStr.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-10 min-h-screen">
      {!isFormOpen ? (
        <>
          {/* Editorial Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 pb-6 border-b border-brand-border animate-in fade-in slide-in-from-top-4 duration-300">
            <div>
              <span className="text-[10px] font-bold tracking-[0.3em] text-brand-mustard uppercase block mb-2 font-sans">
                GUIDE ARCHIVE
              </span>
              <h1 className="text-4xl md:text-5xl font-serif text-brand-ink leading-tight tracking-tight">
                Pocket Guides
              </h1>
              <p className="text-brand-muted text-sm mt-2 max-w-xl font-light">
                Manage the premium, lightweight country and city guides. These pocket guides contain quick summaries, sights, hotel selections, and activities for swift viewing.
              </p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="bg-brand-ink text-white px-6 py-3 rounded-full text-xs font-bold tracking-[0.2em] uppercase hover:bg-brand-mustard transition-all flex items-center justify-center gap-2 self-start md:self-auto cursor-pointer shadow-sm duration-300 transform hover:-translate-y-0.5 active:translate-y-0 font-sans"
            >
              <Plus size={14} className="stroke-[3]" /> Add Pocket Guide
            </button>
          </div>

          {/* Main Container */}
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.02)] animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Search Bar */}
            <div className="p-5 border-b border-brand-border flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-brand-bg/30">
              <div className="relative w-full max-w-md">
                <input 
                  type="text" 
                  placeholder="Search pocket guides by title, destination or keywords..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-brand-border rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-brand-mustard focus:ring-1 focus:ring-brand-mustard bg-white transition-all text-brand-ink font-sans placeholder:text-brand-muted/70"
                />
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-brand-muted/80" size={15} />
              </div>
              <div className="text-xs text-brand-muted font-sans font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-mustard animate-pulse"></span>
                Total: {guides.length} guides
              </div>
            </div>

            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-brand-mustard" size={32} />
                <p className="text-brand-muted text-xs font-bold tracking-widest uppercase animate-pulse">Gathering guides...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-24 text-center max-w-sm mx-auto">
                <BookOpen className="text-brand-border mx-auto mb-4" size={40} />
                <p className="text-brand-ink font-serif text-lg mb-1">No guides found</p>
                <p className="text-xs text-brand-muted leading-relaxed">
                  {searchQuery ? "Try refining your search terms or view standard directory." : "Create a fresh pocket guide to populate the database index."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto font-sans">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brand-bg/40 text-[9px] uppercase tracking-[0.25em] text-brand-muted font-bold border-b border-brand-border">
                      <th className="p-5 font-bold">Guide Details</th>
                      <th className="p-5 font-bold">Destination</th>
                      <th className="p-5 font-bold">Sights & Hotels Count</th>
                      <th className="p-5 font-bold">Excerpt Summary</th>
                      <th className="p-5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {filtered.map((guide) => {
                      const sightsCount = guide.details?.sights?.length || 0;
                      const hotelsCount = (guide.details?.stay?.budget?.length || 0) + (guide.details?.stay?.mid?.length || 0) + (guide.details?.stay?.splurge?.length || 0);
                      return (
                        <tr key={guide.id} className="hover:bg-brand-bg/20 transition-colors duration-200">
                          <td className="p-5">
                            <div className="flex items-center gap-4">
                              <div className="w-20 h-14 rounded-lg overflow-hidden bg-brand-bg flex-shrink-0 border border-brand-border shadow-2xs group relative">
                                <img src={guide.heroImage || "https://images.unsplash.com/photo-1597212618440-806262de4f6b?q=80&w=2000&auto=format&fit=crop"} alt={guide.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              </div>
                              <div className="max-w-md">
                                <h3 className="font-serif text-base font-semibold text-brand-ink hover:text-brand-mustard transition-colors duration-200 leading-snug line-clamp-1 flex items-center gap-2">
                                  {guide.title}
                                  {(guide.status || "published").toLowerCase() !== "published" && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-sans font-bold tracking-wider uppercase bg-brand-bg text-brand-muted border border-brand-border">
                                      Draft
                                    </span>
                                  )}
                                </h3>
                                <div className="text-[10px] font-mono text-brand-muted mt-1 tracking-wide">/{guide.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-5 text-sm text-brand-ink">
                            <span className="inline-flex items-center gap-2 font-medium bg-brand-bg border border-brand-border rounded-full py-1.5 px-3">
                              <span className="text-[8px] bg-brand-mustard text-white px-1.5 py-0.5 rounded font-black tracking-widest font-mono">{guide.countryCode || "TR"}</span>
                              <span className="text-xs text-brand-ink">{guide.destination}</span>
                            </span>
                          </td>
                          <td className="p-5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-mustard-soft text-brand-mustard text-[9px] font-bold rounded-full uppercase tracking-wider border border-brand-mustard/20">
                              {sightsCount} Sights • {hotelsCount} Hotels
                            </span>
                          </td>
                          <td className="p-5 text-xs text-brand-muted font-sans tracking-wide max-w-xs truncate">
                            {guide.excerpt}
                          </td>
                          <td className="p-5 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button 
                                onClick={() => handleOpenEdit(guide)}
                                className="p-2 text-brand-muted hover:text-brand-mustard hover:bg-brand-bg/50 rounded-lg transition-all duration-200 cursor-pointer"
                                title="Edit Guide"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button 
                                onClick={() => handleDelete(guide.id, guide.title)}
                                className="p-2 text-brand-muted hover:text-brand-coral hover:bg-brand-danger-bg/50 rounded-lg transition-all duration-200 cursor-pointer"
                                title="Delete Guide"
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
            )}
            
            {/* Table Footer */}
            <div className="p-5 border-t border-brand-border bg-brand-bg/10 flex justify-between items-center text-xs text-brand-muted">
              <span>Displaying {filtered.length} of {guides.length} guides</span>
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
                <span>Pocket Guides</span>
                <span className="text-brand-border">/</span>
                <span className="text-brand-ink">{modalMode === "add" ? "Add New Guide" : "Edit Guide"}</span>
              </div>
            </div>
            
            <div className="relative w-full max-w-xs my-2 sm:my-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-muted" size={14} />
              <input 
                type="text" 
                placeholder="Search pocket guides..." 
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
          <form onSubmit={handleSubmit} className="space-y-8 max-w-7xl mx-auto font-sans">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 pb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-serif text-brand-ink tracking-tight font-semibold">
                  {modalMode === "add" ? "Add Pocket Guide" : "Edit Pocket Guide"}
                </h1>
                <p className="text-brand-muted text-xs mt-2 max-w-2xl font-light leading-relaxed font-sans">
                  Create a curated pocket guide for a specific destination. You can choose to add optional guide summary blocks like where to stay, what to eat, etc.
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
                  className="px-5 py-2.5 bg-brand-mustard text-white rounded-xl text-xs font-bold hover:bg-brand-ink transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 font-sans"
                >
                  {saving && <Loader2 className="animate-spin" size={12} />}
                  {(formData.status || "published").toLowerCase() === "published" ? "Publish Guide" : "Save Draft"}
                </button>
              </div>
            </div>

            {/* Grid Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Form Cards */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* 1. Guide Details Card */}
                <div className="bg-white rounded-3xl border border-brand-border p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-brand-ink font-serif">Guide Details</h2>
                    <p className="text-brand-muted text-xs font-light mt-1">Provide essential details about your pocket guide.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Destination</label>
                        <div className="relative">
                          <select
                            value={formData.destination}
                            onChange={handleDestinationChange}
                            required
                            className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink appearance-none transition-all cursor-pointer font-sans pr-10"
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
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">City</label>
                        <div className="relative">
                          <select
                            value={cityMapping[formData.destination]?.includes(formData.details?.city) ? formData.details?.city : "custom"}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "custom") {
                                updateDetailField("city", "");
                              } else {
                                updateDetailField("city", val);
                              }
                            }}
                            className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink appearance-none transition-all cursor-pointer font-sans pr-10"
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
                        
                        {(!cityMapping[formData.destination]?.includes(formData.details?.city)) && (
                          <input
                            type="text"
                            value={formData.details?.city || ""}
                            onChange={(e) => updateDetailField("city", e.target.value)}
                            className="mt-2 w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all font-sans"
                            placeholder="Enter custom city name"
                            required
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Guide Title</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={handleTitleChange}
                        className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all font-sans"
                        placeholder="e.g. Kyoto Travel Guide"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Short Description</label>
                      <textarea
                        rows={3}
                        value={formData.excerpt}
                        onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                        className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all font-sans resize-none"
                        placeholder="Write a short, engaging description for the Kyoto Travel Guide. Keep it concise..."
                      />
                    </div>

                    {/* Featured Image Upload Area */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] font-sans">Featured Image</label>
                        <button
                          type="button"
                          onClick={() => setIsMediaModalOpen(true)}
                          className="text-[10px] font-bold tracking-[0.1em] text-brand-mustard hover:text-brand-ink uppercase font-sans transition-colors cursor-pointer"
                        >
                          Select from Library
                        </button>
                      </div>
                      <div 
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById("file-input").click()}
                        className="border-2 border-dashed border-brand-mustard/20 bg-[#FCFBF8] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-mustard hover:bg-[#FAF6EC] transition-all group select-none relative h-40 animate-in duration-300 overflow-hidden"
                      >
                        {uploadingImage ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin text-brand-mustard" size={24} />
                            <span className="text-xs font-bold text-brand-mustard tracking-wider uppercase animate-pulse">Uploading cover...</span>
                          </div>
                        ) : formData.heroImage ? (
                          <>
                            <img 
                              src={formData.heroImage} 
                              alt="Guide Cover Preview" 
                              className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-10 transition-opacity" 
                            />
                            <div className="relative z-10 flex flex-col items-center justify-center">
                              <Upload className="text-brand-mustard/60 group-hover:text-brand-mustard transition-colors mb-2" size={24} />
                              <span className="text-xs font-bold text-brand-ink font-serif block mb-1">Change Featured Image</span>
                              <span className="text-[9px] text-brand-muted block max-w-xs leading-normal">
                                Drag and drop or click to browse files
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <Upload className="text-brand-mustard/60 group-hover:text-brand-mustard transition-colors mb-2" size={24} />
                            <span className="text-xs font-bold text-brand-ink font-serif block mb-1">Upload guide cover image</span>
                            <span className="text-[9px] text-brand-muted block max-w-xs leading-normal">
                              Recommended size: 1600 x 1080px. Max size: 5MB
                            </span>
                            <span className="text-[9px] text-brand-mustard block mt-1 underline">
                              Drag and drop or browse files
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
                      <input
                        type="text"
                        value={formData.heroImage}
                        onChange={(e) => setFormData(prev => ({ ...prev, heroImage: e.target.value }))}
                        className="mt-2 w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all font-sans"
                        placeholder="Or paste an image URL here..."
                      />
                    </div>

                    {/* Collapsible / Optional Header Overrides */}
                    <details className="group border border-brand-border/60 rounded-2xl p-4 bg-brand-bg/5">
                      <summary className="list-none flex items-center justify-between font-bold text-[10px] uppercase tracking-wider text-brand-muted cursor-pointer font-sans select-none">
                        <span>Custom Text Overrides (Optional)</span>
                        <ChevronDown size={14} className="text-brand-muted transform group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="space-y-4 mt-4 pt-4 border-t border-brand-border/40 font-sans animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-bold text-brand-muted uppercase tracking-wider mb-2">Pocket Guide Title Override</label>
                            <input
                              type="text"
                              value={formData.details.pocketTitle || ""}
                              onChange={(e) => updateDetailField("pocketTitle", e.target.value)}
                              className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all"
                              placeholder="e.g. Kyoto Mini Guide • Pocket Version"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-brand-muted uppercase tracking-wider mb-2">Itinerary Title Override</label>
                            <input
                              type="text"
                              value={formData.details.itineraryTitle || ""}
                              onChange={(e) => updateDetailField("itineraryTitle", e.target.value)}
                              className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all"
                              placeholder="e.g. 10 Days in Japan • Full Itinerary"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-brand-muted uppercase tracking-wider mb-2">Blog Count Override</label>
                          <input
                            type="text"
                            value={formData.details.blogCountText || ""}
                            onChange={(e) => updateDetailField("blogCountText", e.target.value)}
                            className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all"
                            placeholder="e.g. 3 Posts from Japan"
                          />
                        </div>
                      </div>
                    </details>
                  </div>
                </div>

                {/* 2. Guide Summary Fields Card */}
                <div className="bg-white rounded-3xl border border-brand-border p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-brand-ink font-serif">Guide Summary Fields</h2>
                    <p className="text-brand-muted text-xs font-light mt-1">These summary details will be displayed in the overview card of the guide.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Best Time to Visit</label>
                      <textarea
                        rows={2}
                        value={formData.details?.bestTimeToVisit || ""}
                        onChange={(e) => updateDetailField("bestTimeToVisit", e.target.value)}
                        className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all font-sans resize-none"
                        placeholder="e.g. March to May for cherry blossoms, October to November for autumn foliage."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Ideal Duration</label>
                        <input
                          type="text"
                          value={formData.details?.idealDuration || ""}
                          onChange={(e) => updateDetailField("idealDuration", e.target.value)}
                          className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all font-sans"
                          placeholder="e.g. 3-4 days"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Budget Level</label>
                        <div className="relative">
                          <select
                            value={formData.details?.budgetLevel || "Mid-range"}
                            onChange={(e) => updateDetailField("budgetLevel", e.target.value)}
                            className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink appearance-none transition-all cursor-pointer font-sans pr-10"
                          >
                            <option value="Budget">Budget</option>
                            <option value="Mid-range">Mid-range</option>
                            <option value="Luxury">Luxury</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-brand-muted pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Publishing & SEO Card */}
                <div className="bg-white rounded-3xl border border-brand-border p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-brand-ink font-serif">Publishing & SEO</h2>
                    <p className="text-brand-muted text-xs font-light mt-1">Manage the URL and metadata search engine preview for this pocket guide.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Status</label>
                        <div className="relative">
                          <select
                            value={formData.status || "published"}
                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink appearance-none transition-all cursor-pointer font-sans pr-10"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-brand-muted pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Featured in Destination</label>
                        <div className="relative">
                          <select
                            value={formData.details?.featuredInDestination || "No"}
                            onChange={(e) => updateDetailField("featuredInDestination", e.target.value)}
                            className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink appearance-none transition-all cursor-pointer font-sans pr-10"
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-brand-muted pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Feature on Homepage</label>
                        <div className="relative">
                          <select
                            value={formData.details?.featured || "no"}
                            onChange={(e) => updateDetailField("featured", e.target.value)}
                            className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink appearance-none transition-all cursor-pointer font-sans pr-10"
                          >
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-brand-muted pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">URL Slug</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-xs text-brand-muted font-mono select-none">/mini-guides/</span>
                        <input
                          type="text"
                          required
                          value={formData.slug}
                          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/\s+/g, "-") }))}
                          className="w-full border border-brand-border rounded-xl p-3 pl-28 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink font-mono"
                          placeholder="kyoto-travel-guide"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">SEO Title</label>
                      <input
                        type="text"
                        value={formData.details?.seoTitle || ""}
                        onChange={(e) => updateDetailField("seoTitle", e.target.value)}
                        className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink font-sans"
                        placeholder="e.g. Kyoto Travel Guide | The Long Way"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Meta Description</label>
                      <textarea
                        rows={2}
                        value={formData.details?.metaDescription || ""}
                        onChange={(e) => updateDetailField("metaDescription", e.target.value)}
                        className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink font-sans resize-none"
                        placeholder="A curated guide to Kyoto's best sights, boutique hotels, and dining."
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Optional Pocket Guide Content Blocks Card */}
                <div className="bg-white rounded-3xl border border-brand-border p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-8">
                  <div>
                    <h2 className="text-lg font-bold text-brand-ink font-serif">Optional Pocket Guide Content Blocks</h2>
                    <p className="text-brand-muted text-xs font-light mt-1">Provide extra details to help travelers get the best out of their trip.</p>
                  </div>

                  {/* Subsection 1: Where to Stay */}
                  <div className="space-y-4 pt-4 border-t border-brand-border">
                    <div>
                      <h3 className="text-sm font-bold text-brand-ink tracking-wide font-sans">Where to Stay</h3>
                      <p className="text-[11px] text-brand-muted font-light mt-0.5">List hotels for different budget tiers.</p>
                    </div>

                    <div className="space-y-3">
                      {stayItems.length > 0 && (
                        <div className="grid grid-cols-12 gap-3 px-2 text-[9px] font-bold uppercase tracking-wider text-brand-muted">
                          <div className="col-span-3">Hotel Star / Tier</div>
                          <div className="col-span-4">Accommodation Name</div>
                          <div className="col-span-4">Hotel Description</div>
                          <div className="col-span-1"></div>
                        </div>
                      )}

                      {stayItems.map((item, index) => (
                        <div key={`${item.tier}-${item.idx}`} className="grid grid-cols-12 gap-3 items-start bg-[#FCFBF9] p-3 rounded-xl border border-brand-border/80 animate-in fade-in duration-200">
                          <div className="col-span-3">
                            <select
                              value={item.tier}
                              onChange={(e) => handleStayTierChange(item.tier, item.idx, e.target.value)}
                              className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink cursor-pointer font-sans"
                            >
                              <option value="budget">Budget</option>
                              <option value="mid">Mid-range</option>
                              <option value="splurge">Splurge</option>
                            </select>
                          </div>
                          <div className="col-span-4">
                            <input
                              type="text"
                              value={item.name || ""}
                              onChange={(e) => handleStayItemChange(item.tier, item.idx, "name", e.target.value)}
                              className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink font-sans font-medium"
                              placeholder="Accommodation Name"
                            />
                          </div>
                          <div className="col-span-4">
                            <textarea
                              rows={1}
                              value={item.desc || ""}
                              onChange={(e) => handleStayItemChange(item.tier, item.idx, "desc", e.target.value)}
                              className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink font-sans resize-y"
                              placeholder="Hotel Description"
                            />
                          </div>
                          <div className="col-span-1 flex justify-center pt-2">
                            <button
                              type="button"
                              onClick={() => handleStayDelete(item.tier, item.idx)}
                              className="p-1.5 text-brand-muted hover:text-brand-coral hover:bg-brand-danger-bg/50 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {stayItems.length === 0 && (
                        <div className="text-center py-6 border border-dashed border-brand-border rounded-2xl bg-brand-bg/5 text-xs text-brand-muted">
                          No hotels added yet. Click "+ Add Recommendations" to add one.
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleStayAdd}
                      className="w-full py-3 border border-dashed border-brand-mustard/30 text-brand-mustard rounded-xl text-xs font-bold uppercase tracking-wider hover:border-brand-mustard hover:bg-[#FAF7EF] transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans bg-white"
                    >
                      <Plus size={14} className="stroke-[3]" /> Add Recommendations
                    </button>
                  </div>

                  {/* Subsection 2: What to Eat */}
                  <div className="space-y-4 pt-6 border-t border-brand-border">
                    <div>
                      <h3 className="text-sm font-bold text-brand-ink tracking-wide font-sans">What to Eat</h3>
                      <p className="text-[11px] text-brand-muted font-light mt-0.5">List local foods and culinary specialties.</p>
                    </div>

                    <div className="space-y-3">
                      {(formData.details.eat || []).length > 0 && (
                        <div className="grid grid-cols-12 gap-3 px-2 text-[9px] font-bold uppercase tracking-wider text-brand-muted">
                          <div className="col-span-4">Food Name</div>
                          <div className="col-span-7">Food Description</div>
                          <div className="col-span-1"></div>
                        </div>
                      )}

                      {(formData.details.eat || []).map((item, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-3 items-start bg-[#FCFBF9] p-3 rounded-xl border border-brand-border/80 animate-in fade-in duration-200">
                          <div className="col-span-4">
                            <input
                              type="text"
                              value={item.name || ""}
                              onChange={(e) => updateListField("eat", idx, "name", e.target.value)}
                              className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink font-sans font-medium"
                              placeholder="e.g. Tajine, Matcha Latte"
                            />
                          </div>
                          <div className="col-span-7">
                            <textarea
                              rows={1}
                              value={item.desc || ""}
                              onChange={(e) => updateListField("eat", idx, "desc", e.target.value)}
                              className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink font-sans resize-y"
                              placeholder="Food Description"
                            />
                          </div>
                          <div className="col-span-1 flex justify-center pt-2">
                            <button
                              type="button"
                              onClick={() => removeListItem("eat", idx)}
                              className="p-1.5 text-brand-muted hover:text-brand-coral hover:bg-brand-danger-bg/50 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {(formData.details.eat || []).length === 0 && (
                        <div className="text-center py-6 border border-dashed border-brand-border rounded-2xl bg-brand-bg/5 text-xs text-brand-muted">
                          No food entries added yet. Click "+ Add Food Entry" to add one.
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => addListItem("eat", { name: "", desc: "" })}
                      className="w-full py-3 border border-dashed border-brand-mustard/30 text-brand-mustard rounded-xl text-xs font-bold uppercase tracking-wider hover:border-brand-mustard hover:bg-[#FAF7EF] transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans bg-white"
                    >
                      <Plus size={14} className="stroke-[3]" /> Add Food Entry
                    </button>
                  </div>

                  {/* Subsection 3: Top Sights */}
                  <div className="space-y-4 pt-6 border-t border-brand-border">
                    <div>
                      <h3 className="text-sm font-bold text-brand-ink tracking-wide font-sans">Top Sights</h3>
                      <p className="text-[11px] text-brand-muted font-light mt-0.5">List essential landmarks and sights.</p>
                    </div>

                    <div className="space-y-3">
                      {(formData.details.sights || []).map((sight, idx) => (
                        <div key={idx} className="flex gap-3 items-start bg-[#FCFBF9] p-3 rounded-xl border border-brand-border animate-in fade-in duration-200">
                          <span className="bg-white text-brand-mustard font-mono text-xs px-2.5 py-1.5 rounded-lg font-bold border border-brand-border shadow-2xs self-center">
                            {sight.num || String(idx + 1).padStart(2, "0")}
                          </span>
                          <input
                            type="text"
                            value={sight.text || ""}
                            onChange={(e) => updateListField("sights", idx, "text", e.target.value)}
                            className="flex-1 border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink font-sans"
                            placeholder="e.g. Fushimi Inari shrine path gates..."
                          />
                          <button
                            type="button"
                            onClick={() => removeListItem("sights", idx)}
                            className="p-1.5 text-brand-muted hover:text-brand-coral hover:bg-brand-danger-bg/50 rounded-lg transition-all cursor-pointer self-center"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}

                      {(formData.details.sights || []).length === 0 && (
                        <div className="text-center py-6 border border-dashed border-brand-border rounded-2xl bg-brand-bg/5 text-xs text-brand-muted">
                          No sights added yet. Click "+ Add Top Sight" to add one.
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => addListItem("sights", { num: "", text: "" })}
                      className="w-full py-3 border border-dashed border-brand-mustard/30 text-brand-mustard rounded-xl text-xs font-bold uppercase tracking-wider hover:border-brand-mustard hover:bg-[#FAF7EF] transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans bg-white"
                    >
                      <Plus size={14} className="stroke-[3]" /> Add Top Sight
                    </button>
                  </div>

                  {/* Subsection 4: Best Activities & Tours */}
                  <div className="space-y-4 pt-6 border-t border-brand-border">
                    <div>
                      <h3 className="text-sm font-bold text-brand-ink tracking-wide font-sans">Best Activities & Tours</h3>
                      <p className="text-[11px] text-brand-muted font-light mt-0.5">List notable activities or custom tours.</p>
                    </div>

                    <div className="space-y-3">
                      {(formData.details.activities || []).map((activity, idx) => (
                        <div key={idx} className="flex gap-3 items-start bg-[#FCFBF9] p-3 rounded-xl border border-brand-border animate-in fade-in duration-200">
                          <span className="bg-white text-brand-mustard font-mono text-xs px-2.5 py-1.5 rounded-lg font-bold border border-brand-border shadow-2xs self-center">
                            {activity.num || String(idx + 1).padStart(2, "0")}
                          </span>
                          <input
                            type="text"
                            value={activity.text || ""}
                            onChange={(e) => updateListField("activities", idx, "text", e.target.value)}
                            className="flex-1 border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink font-sans"
                            placeholder="e.g. Private tea ceremony with a master..."
                          />
                          <button
                            type="button"
                            onClick={() => removeListItem("activities", idx)}
                            className="p-1.5 text-brand-muted hover:text-brand-coral hover:bg-brand-danger-bg/50 rounded-lg transition-all cursor-pointer self-center"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}

                      {(formData.details.activities || []).length === 0 && (
                        <div className="text-center py-6 border border-dashed border-brand-border rounded-2xl bg-brand-bg/5 text-xs text-brand-muted">
                          No activities added yet. Click "+ Add Activity or Tour" to add one.
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => addListItem("activities", { num: "", text: "" })}
                      className="w-full py-3 border border-dashed border-brand-mustard/30 text-brand-mustard rounded-xl text-xs font-bold uppercase tracking-wider hover:border-brand-mustard hover:bg-[#FAF7EF] transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans bg-white"
                    >
                      <Plus size={14} className="stroke-[3]" /> Add Activity or Tour
                    </button>
                  </div>

                  {/* Subsection 5: Day Trips */}
                  <div className="space-y-4 pt-6 border-t border-brand-border">
                    <div>
                      <h3 className="text-sm font-bold text-brand-ink tracking-wide font-sans">Day Trips</h3>
                      <p className="text-[11px] text-brand-muted font-light mt-0.5">List recommended day trips from this city.</p>
                    </div>

                    <div className="space-y-3">
                      {(formData.details.dayTrips || []).map((trip, idx) => (
                        <div key={idx} className="flex gap-3 items-start bg-[#FCFBF9] p-3 rounded-xl border border-brand-border animate-in fade-in duration-200">
                          <span className="bg-white text-brand-mustard font-mono text-xs px-2.5 py-1.5 rounded-lg font-bold border border-brand-border shadow-2xs self-center">
                            {trip.num || String(idx + 1).padStart(2, "0")}
                          </span>
                          <input
                            type="text"
                            value={trip.name || ""}
                            onChange={(e) => updateListField("dayTrips", idx, "name", e.target.value)}
                            className="flex-1 border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink font-sans"
                            placeholder="e.g. Nara Deer Park & giant Todai-ji temple..."
                          />
                          <button
                            type="button"
                            onClick={() => removeListItem("dayTrips", idx)}
                            className="p-1.5 text-brand-muted hover:text-brand-coral hover:bg-brand-danger-bg/50 rounded-lg transition-all cursor-pointer self-center"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}

                      {(formData.details.dayTrips || []).length === 0 && (
                        <div className="text-center py-6 border border-dashed border-brand-border rounded-2xl bg-brand-bg/5 text-xs text-brand-muted">
                          No day trips added yet. Click "+ Add Day Trip" to add one.
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => addListItem("dayTrips", { num: "", name: "" })}
                      className="w-full py-3 border border-dashed border-brand-mustard/30 text-brand-mustard rounded-xl text-xs font-bold uppercase tracking-wider hover:border-brand-mustard hover:bg-[#FAF7EF] transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans bg-white"
                    >
                      <Plus size={14} className="stroke-[3]" /> Add Day Trip
                    </button>
                  </div>

                  {/* Subsection 6: Best Restaurants (Dining) */}
                  <div className="space-y-4 pt-6 border-t border-brand-border">
                    <div>
                      <h3 className="text-sm font-bold text-brand-ink tracking-wide font-sans">Best Restaurants</h3>
                      <p className="text-[11px] text-brand-muted font-light mt-0.5">List recommended restaurants and local eateries.</p>
                    </div>

                    <div className="space-y-3">
                      {restaurantItems.length > 0 && (
                        <div className="grid grid-cols-12 gap-3 px-2 text-[9px] font-bold uppercase tracking-wider text-brand-muted">
                          <div className="col-span-3">Price Tier</div>
                          <div className="col-span-4">Restaurant Name</div>
                          <div className="col-span-4">Description</div>
                          <div className="col-span-1"></div>
                        </div>
                      )}

                      {restaurantItems.map((item, index) => (
                        <div key={`${item.tier}-${item.idx}`} className="grid grid-cols-12 gap-3 items-start bg-[#FCFBF9] p-3 rounded-xl border border-brand-border/80 animate-in fade-in duration-200">
                          <div className="col-span-3">
                            <select
                              value={item.tier}
                              onChange={(e) => handleRestaurantTierChange(item.tier, item.idx, e.target.value)}
                              className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink cursor-pointer font-sans"
                            >
                              <option value="budget">Local Gems</option>
                              <option value="mid">Mid-range</option>
                              <option value="splurge">Fine Dining</option>
                            </select>
                          </div>
                          <div className="col-span-4">
                            <input
                              type="text"
                              value={item.name || ""}
                              onChange={(e) => handleRestaurantItemChange(item.tier, item.idx, "name", e.target.value)}
                              className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink font-sans font-medium"
                              placeholder="Restaurant Name"
                            />
                          </div>
                          <div className="col-span-4">
                            <textarea
                              rows={1}
                              value={item.desc || ""}
                              onChange={(e) => handleRestaurantItemChange(item.tier, item.idx, "desc", e.target.value)}
                              className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink font-sans resize-y"
                              placeholder="Restaurant Description"
                            />
                          </div>
                          <div className="col-span-1 flex justify-center pt-2">
                            <button
                              type="button"
                              onClick={() => handleRestaurantDelete(item.tier, item.idx)}
                              className="p-1.5 text-brand-muted hover:text-brand-coral hover:bg-brand-danger-bg/50 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {restaurantItems.length === 0 && (
                        <div className="text-center py-6 border border-dashed border-brand-border rounded-2xl bg-brand-bg/5 text-xs text-brand-muted">
                          No restaurants added yet. Click "+ Add Restaurant" to add one.
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleRestaurantAdd}
                      className="w-full py-3 border border-dashed border-brand-mustard/30 text-brand-mustard rounded-xl text-xs font-bold uppercase tracking-wider hover:border-brand-mustard hover:bg-[#FAF7EF] transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans bg-white"
                    >
                      <Plus size={14} className="stroke-[3]" /> Add Restaurant
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Sticky Preview */}
              <div className="lg:col-span-4 sticky top-8 font-sans">
                <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
                  
                  {/* Photo Container */}
                  <div className="relative h-64 w-full bg-brand-bg flex-shrink-0 group overflow-hidden">
                    <img 
                      src={formData.heroImage || "https://images.unsplash.com/photo-1597212618440-806262de4f6b?q=80&w=2000&auto=format&fit=crop"} 
                      alt="Guide Cover Preview" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
                      <h3 className="text-2xl font-serif text-white tracking-tight leading-tight">
                        {formData.title || "Kyoto Travel Guide"}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Badge & Meta */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-mustard-soft text-brand-mustard text-[9px] font-bold rounded-full uppercase tracking-wider border border-brand-mustard/20">
                        Pocket Preview
                      </span>
                      <span className="text-[10px] text-brand-muted tracking-widest font-bold uppercase">
                        THE LONG WAY
                      </span>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <p className="text-xs text-brand-muted leading-relaxed font-light line-clamp-3">
                        {formData.excerpt || "Write a short, engaging description for the Kyoto Travel Guide. Keep it concise, highlighting unique local experiences..."}
                      </p>
                    </div>

                    {/* Meta details list */}
                    <div className="space-y-3 pt-4 border-t border-brand-border">
                      <div className="flex items-start gap-2.5 text-xs text-brand-ink">
                        <Calendar size={14} className="text-brand-mustard mt-0.5" />
                        <div>
                          <span className="font-bold text-brand-muted block text-[9px] uppercase tracking-wider leading-none mb-1">Best Time to Visit</span>
                          <span className="font-medium text-brand-ink">{formData.details?.bestTimeToVisit || "March to May & Oct to Nov"}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-brand-ink">
                        <Clock size={14} className="text-brand-mustard mt-0.5" />
                        <div>
                          <span className="font-bold text-brand-muted block text-[9px] uppercase tracking-wider leading-none mb-1">Ideal Duration</span>
                          <span className="font-medium text-brand-ink">{formData.details?.idealDuration || "4-5 Days"}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-brand-ink">
                        <Compass size={14} className="text-brand-mustard mt-0.5" />
                        <div>
                          <span className="font-bold text-brand-muted block text-[9px] uppercase tracking-wider leading-none mb-1">Budget Level</span>
                          <span className="font-medium text-brand-ink">{formData.details?.budgetLevel || "Mid-range"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons mirroring live page preview links */}
                    <div className="pt-2 space-y-2.5">
                      <button 
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 bg-brand-mustard text-white text-[10px] font-bold tracking-widest uppercase rounded-full hover:bg-brand-ink transition-all duration-300 shadow-sm cursor-pointer border-0 flex items-center justify-center gap-2"
                      >
                        {saving && <Loader2 className="animate-spin" size={12} />}
                        Access Pocket Guide
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="w-full py-3 border border-brand-border bg-white text-brand-ink text-[10px] font-bold tracking-widest uppercase rounded-full hover:bg-brand-bg transition-all duration-200 cursor-pointer flex items-center justify-center"
                      >
                        See all Pocket Guides
                      </button>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </form>

        </div>
      )}

      {/* Media Selector Modal */}
      <MediaSelectorModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url) => setFormData(prev => ({ ...prev, heroImage: url }))}
      />
    </div>
  );
}
