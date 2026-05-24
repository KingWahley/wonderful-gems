"use client";

import { useState, useEffect } from "react";
import { 
  fetchSettings, 
  saveSettings, 
  uploadImage,
  fetchDestinations,
  fetchBlogs,
  fetchTours,
  fetchMiniGuides
} from "@/lib/db";
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  Save,
  ExternalLink,
  User,
  HelpCircle,
  Sparkles,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import Link from "next/link";
import MediaSelectorModal from "@/components/dashboard/MediaSelectorModal";

export default function HomepageManager() {
  const [activeTab, setActiveTab] = useState("homepage_sections");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState(null);

  // Content Libraries for Selection
  const [dbDestinations, setDbDestinations] = useState([]);
  const [dbBlogs, setDbBlogs] = useState([]);
  const [dbTours, setDbTours] = useState([]);
  const [dbGuides, setDbGuides] = useState([]);


  // Settings States
  const [aboutPage, setAboutPage] = useState({
    badge: "", title: "", introText: "", middleText: "", footerText: "", coverImage: "", floatingPill: "", contactTitle: "", contactEmail: ""
  });
  
  const [planPage, setPlanPage] = useState({
    heroBadge: "", heroTitle: "", heroSubtitle: "", faqBadge: "", faqTitle: "", faqs: []
  });

  // Form State
  const [formData, setFormData] = useState({
    home_hero: { enabled: true, badge: "", title: "", subtitle1: "", subtitle2: "", coverImage: "" },
    home_latest_posts: { enabled: true, badge: "", title: "", items: [] }, // items: array of blog IDs
    home_destinations: { enabled: true, badge: "", title: "", items: [] }, // items: array of destination IDs
    home_mini_guides: { enabled: true, badge: "", title: "", items: [] }, // items: array of guide IDs
    home_pocket_guides: { enabled: true, badge: "", title: "", items: [] }, // items: array of guide IDs
    home_cta: { enabled: true, badge: "", title: "", description: "", buttonText: "", buttonLink: "", coverImage: "" },
    home_tours: { enabled: true, badge: "", title: "", items: [] }, // items: array of tour IDs
    home_footer: { enabled: true, brandText: "", copyright: "", linkUrl: "" },
    home_seo: { title: "", description: "", socialImage: "", siteLogo: "" }
  });

  // Select Dropdown States for adding items
  const [selectedBlog, setSelectedBlog] = useState("");
  const [selectedDest, setSelectedDest] = useState("");
  const [selectedGuide, setSelectedGuide] = useState("");
  const [selectedTour, setSelectedTour] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch all possible settings keys

        const [about, plan] = await Promise.all([
          fetchSettings("about_page"),
          fetchSettings("plan_page")
        ]);
        if (about) setAboutPage(about);
        if (plan) setPlanPage({ ...plan, faqs: plan.faqs || [] });

        const keys = Object.keys(formData);
        const settingsPromises = keys.map(k => fetchSettings(k));
        
        // Fetch DB lists
        const dbPromises = [
          fetchDestinations().catch(() => []),
          fetchBlogs().catch(() => []),
          fetchTours().catch(() => []),
          fetchMiniGuides().catch(() => [])
        ];

        const results = await Promise.all([...settingsPromises, ...dbPromises]);
        
        const newFormData = { ...formData };
        for (let i = 0; i < keys.length; i++) {
          if (results[i]) {
            newFormData[keys[i]] = { ...newFormData[keys[i]], ...results[i] };
          }
        }
        
        const fetchedDestinations = results[keys.length] || [];
        const fetchedBlogs = results[keys.length + 1] || [];
        const fetchedTours = results[keys.length + 2] || [];
        const fetchedGuides = results[keys.length + 3] || [];

        // Pre-fill existing featured items from database flags if they aren't already saved in settings
        if (!newFormData.home_latest_posts.items || newFormData.home_latest_posts.items.length === 0) {
          const featuredBlogs = fetchedBlogs.filter(b => b.isFresh || b.is_fresh).slice(0, 3).map(b => b.id);
          newFormData.home_latest_posts.items = featuredBlogs;
        }

        // Pre-fill destinations if empty
        if (!newFormData.home_destinations.items || newFormData.home_destinations.items.length === 0) {
           // If we don't have explicit feature flags, maybe grab the first 4 or all? 
           // We will just use the ones marked featureOnHomepage or just grab first 4 as fallback
          const featuredDests = fetchedDestinations.filter(d => d.featureOnHomepage === "Yes" || d.featureOnHomepage === "yes").map(d => d.id);
          newFormData.home_destinations.items = featuredDests.length > 0 ? featuredDests.slice(0, 5) : fetchedDestinations.slice(0, 5).map(d => d.id);
        }

        if (!newFormData.home_tours.items || newFormData.home_tours.items.length === 0) {
          const featuredTours = fetchedTours.filter(t => t.featureOnHomepage === "Yes" || t.featureOnHomepage === "yes").map(t => t.id);
          newFormData.home_tours.items = featuredTours;
        }

        if (!newFormData.home_mini_guides.items || newFormData.home_mini_guides.items.length === 0) {
          const featuredGuides = fetchedGuides.filter(g => g.details?.featured === "yes" || g.details?.featured === "Yes").map(g => g.id);
          newFormData.home_mini_guides.items = featuredGuides;
        }

        if (!newFormData.home_pocket_guides.items || newFormData.home_pocket_guides.items.length === 0) {
          const featuredGuides = fetchedGuides.filter(g => g.details?.featured === "yes" || g.details?.featured === "Yes").map(g => g.id);
          newFormData.home_pocket_guides.items = featuredGuides;
        }
        
        setFormData(newFormData);
        setDbDestinations(fetchedDestinations);
        setDbBlogs(fetchedBlogs);
        setDbTours(fetchedTours);
        setDbGuides(fetchedGuides);
        
      } catch (err) {
        console.error("Failed to load homepage data", err);
        showToast("error", "Error loading data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const keys = Object.keys(formData);
      for (const k of keys) {
        await saveSettings(k, formData[k]);
      }

      await saveSettings("about_page", aboutPage);
      await saveSettings("plan_page", planPage);

      showToast("success", "Homepage configurations saved successfully!");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (sectionKey, field, value) => {
    setFormData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value
      }
    }));
  };

  const addItemToSection = (sectionKey, idValue) => {
    if (!idValue) return;
    setFormData(prev => {
      const currentItems = prev[sectionKey].items || [];
      if (currentItems.includes(idValue)) return prev; // Prevent duplicates
      return {
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          items: [...currentItems, idValue]
        }
      };
    });
  };

  const removeItemFromSection = (sectionKey, idx) => {
    setFormData(prev => {
      const currentItems = [...(prev[sectionKey].items || [])];
      currentItems.splice(idx, 1);
      return {
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          items: currentItems
        }
      };
    });
  };

  const handleImageUpload = async (e, sectionKey, fieldKey) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);

    if (sectionKey === "about_page") {
      try {
        const url = await uploadImage(file);
        setAboutPage(prev => ({ ...prev, [fieldKey]: url }));
        showToast("success", "Image uploaded successfully!");
      } catch (err) {
        console.warn("Upload failed, using local preview", err);
        const localUrl = URL.createObjectURL(file);
        setAboutPage(prev => ({ ...prev, [fieldKey]: localUrl }));
        showToast("warning", "Storage upload failed. Local preview used.");
      } finally {
        setImageUploading(false);
      }
      return;
    }

    try {
      const url = await uploadImage(file);
      updateSection(sectionKey, fieldKey, url);
      showToast("success", "Image uploaded successfully!");
    } catch (err) {
      console.warn("Upload failed, using local preview", err);
      const localUrl = URL.createObjectURL(file);
      updateSection(sectionKey, fieldKey, localUrl);
      showToast("warning", "Storage upload failed. Local preview used.");
    } finally {
      setImageUploading(false);
    }
  };


  const handleFaqChange = (index, field, val) => {
    const updatedFaqs = [...planPage.faqs];
    updatedFaqs[index] = { ...updatedFaqs[index], [field]: val };
    setPlanPage(prev => ({ ...prev, faqs: updatedFaqs }));
  };

  const addFaq = () => {
    setPlanPage(prev => ({
      ...prev,
      faqs: [...prev.faqs, { q: "", a: "" }]
    }));
  };

  const removeFaq = (index) => {
    const updatedFaqs = planPage.faqs.filter((_, idx) => idx !== index);
    setPlanPage(prev => ({ ...prev, faqs: updatedFaqs }));
  };

  const moveFaq = (index, direction) => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === planPage.faqs.length - 1) return;
    
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updatedFaqs = [...planPage.faqs];
    const temp = updatedFaqs[index];
    updatedFaqs[index] = updatedFaqs[targetIdx];
    updatedFaqs[targetIdx] = temp;
    
    setPlanPage(prev => ({ ...prev, faqs: updatedFaqs }));
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <div 
      onClick={onChange}
      className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${checked ? 'bg-[#c7962d]' : 'bg-gray-300'}`}
    >
      <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}></div>
    </div>
  );

  return (
    <div className="relative pb-24">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border animate-fade-in ${
          toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
          : toast.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-800"
          : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <div className="text-xs font-semibold tracking-wide uppercase">{toast.message}</div>
        </div>
      )}

      {saving && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl flex flex-col items-center">
            <Loader2 className="animate-spin text-[#c7962d] mb-4" size={40} />
            <h3 className="font-serif text-lg text-gray-900 font-bold mb-1">Publishing Changes</h3>
            <p className="text-xs text-gray-500">Syncing settings to Supabase...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2 font-bold tracking-tight">Homepage Manager</h1>
          <p className="text-gray-500 text-sm">Manage the sections, featured content, and metadata displayed on the main landing page.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/" target="_blank" className="flex-1 sm:flex-none bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
            View Website <ExternalLink size={14} />
          </Link>
          <button onClick={handleSaveAll} className="flex-1 sm:flex-none bg-[#c7962d] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#b58522] transition-colors shadow-sm">
            Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-8">
        <button 
          onClick={() => setActiveTab("homepage_sections")}
          className={`pb-3 text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === "homepage_sections" ? "text-[#c7962d] border-b-2 border-[#c7962d]" : "text-gray-400 hover:text-gray-600"}`}
        >
          Homepage Sections
        </button>
        <button 
          onClick={() => setActiveTab("general_site_info")}
          className={`pb-3 text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === "general_site_info" ? "text-[#c7962d] border-b-2 border-[#c7962d]" : "text-gray-400 hover:text-gray-600"}`}
        >
          General Site Info
        </button>
        <button 
          onClick={() => setActiveTab("about_page")}
          className={`pb-3 text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === "about_page" ? "text-[#c7962d] border-b-2 border-[#c7962d]" : "text-gray-400 hover:text-gray-600"}`}
        >
          About Page
        </button>
        <button 
          onClick={() => setActiveTab("plan_page")}
          className={`pb-3 text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === "plan_page" ? "text-[#c7962d] border-b-2 border-[#c7962d]" : "text-gray-400 hover:text-gray-600"}`}
        >
          Plan & FAQs
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="animate-spin text-[#c7962d]" size={40} />
        </div>
      ) : (
        <div className="max-w-4xl space-y-6">
          
          {activeTab === "homepage_sections" && (
            <>
              {/* Home Hero */}
              <div className="bg-[#faf7f1] border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="font-bold text-gray-900 text-lg">Home Hero Section</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Enable</span>
                    <ToggleSwitch 
                      checked={formData.home_hero.enabled} 
                      onChange={() => updateSection("home_hero", "enabled", !formData.home_hero.enabled)} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Section Badge</label>
                      <input type="text" value={formData.home_hero.badge} onChange={e => updateSection("home_hero", "badge", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none" placeholder="A TRAVEL JOURNAL" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Title</label>
                      <input type="text" value={formData.home_hero.title} onChange={e => updateSection("home_hero", "title", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none" placeholder="The Long Way" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Description</label>
                      <textarea rows="2" value={formData.home_hero.subtitle1} onChange={e => updateSection("home_hero", "subtitle1", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none resize-none" placeholder="First paragraph..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Subtitle (Optional)</label>
                      <textarea rows="2" value={formData.home_hero.subtitle2} onChange={e => updateSection("home_hero", "subtitle2", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none resize-none" placeholder="Second paragraph..." />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Cover Image</label>
                    <div className="bg-black/5 rounded-xl aspect-[4/3] flex flex-col items-center justify-center border border-dashed border-gray-300 relative overflow-hidden mb-3">
                      {formData.home_hero.coverImage ? (
                        <img src={formData.home_hero.coverImage} className="absolute inset-0 w-full h-full object-cover" alt="Hero preview" />
                      ) : (
                        <ImageIcon size={32} className="text-gray-400 mb-2" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setMediaTarget({ tab: "home_hero", field: "coverImage" }); setIsMediaModalOpen(true); }} className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-1.5">
                        <ImageIcon size={14} /> Library
                      </button>
                      <label className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-1.5 cursor-pointer">
                        {imageUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "home_hero", "coverImage")} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Latest Travel Stories */}
              <div className="bg-[#faf7f1] border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="font-bold text-gray-900 text-lg">Latest Travel Stories</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Enable</span>
                    <ToggleSwitch checked={formData.home_latest_posts.enabled} onChange={() => updateSection("home_latest_posts", "enabled", !formData.home_latest_posts.enabled)} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Section Badge</label>
                    <input type="text" value={formData.home_latest_posts.badge} onChange={e => updateSection("home_latest_posts", "badge", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none" placeholder="LATEST STORIES" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Section Title</label>
                    <input type="text" value={formData.home_latest_posts.title} onChange={e => updateSection("home_latest_posts", "title", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none" placeholder="Read my journal" />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-3">Featured Blog Posts</label>
                  <div className="space-y-2 mb-4">
                    {formData.home_latest_posts.items.map((id, idx) => {
                      const post = dbBlogs.find(b => b.id === id);
                      return (
                        <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">{idx + 1}</div>
                            <span className="text-sm font-semibold text-gray-800">{post ? post.title : "Unknown Post"}</span>
                          </div>
                          <button onClick={() => removeItemFromSection("home_latest_posts", idx)} className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 px-2.5 py-1.5 rounded-md">Remove</button>
                        </div>
                      );
                    })}
                    {formData.home_latest_posts.items.length === 0 && (
                      <div className="text-sm text-gray-400 text-center py-4">No stories selected.</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <select value={selectedBlog} onChange={e => setSelectedBlog(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c7962d]">
                      <option value="">Select a blog post...</option>
                      {dbBlogs.filter(b => !formData.home_latest_posts.items.includes(b.id)).map(b => (
                        <option key={b.id} value={b.id}>{b.title}</option>
                      ))}
                    </select>
                    <button onClick={() => { addItemToSection("home_latest_posts", selectedBlog); setSelectedBlog(""); }} className="bg-[#f6ead0] text-[#c7962d] font-bold px-4 py-2 rounded-lg text-sm hover:bg-[#e8d5b0]">
                      Add Featured Story
                    </button>
                  </div>
                </div>
              </div>

              {/* Explore By Destination */}
              <div className="bg-[#faf7f1] border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="font-bold text-gray-900 text-lg">Explore By Destination</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Enable</span>
                    <ToggleSwitch checked={formData.home_destinations.enabled} onChange={() => updateSection("home_destinations", "enabled", !formData.home_destinations.enabled)} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Section Badge</label>
                    <input type="text" value={formData.home_destinations.badge} onChange={e => updateSection("home_destinations", "badge", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none" placeholder="EXPLORE BY DESTINATION" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Section Title</label>
                    <input type="text" value={formData.home_destinations.title} onChange={e => updateSection("home_destinations", "title", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none" placeholder="Click any country to see..." />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-3">Featured Destinations</label>
                  <div className="space-y-2 mb-4">
                    {formData.home_destinations.items.map((id, idx) => {
                      const dest = dbDestinations.find(d => d.id === id);
                      return (
                        <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">{idx + 1}</div>
                            <span className="text-sm font-semibold text-gray-800">{dest ? (dest.name || dest.country) : "Unknown Dest"}</span>
                          </div>
                          <button onClick={() => removeItemFromSection("home_destinations", idx)} className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 px-2.5 py-1.5 rounded-md">Remove</button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <select value={selectedDest} onChange={e => setSelectedDest(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c7962d]">
                      <option value="">Select destination...</option>
                      {dbDestinations.filter(d => !formData.home_destinations.items.includes(d.id)).map(d => (
                        <option key={d.id} value={d.id}>{d.name || d.country}</option>
                      ))}
                    </select>
                    <button onClick={() => { addItemToSection("home_destinations", selectedDest); setSelectedDest(""); }} className="bg-[#f6ead0] text-[#c7962d] font-bold px-4 py-2 rounded-lg text-sm hover:bg-[#e8d5b0]">
                      Add Featured Destination
                    </button>
                  </div>
                </div>
              </div>

              {/* Fresh Off the Boat (Mini Guides) */}
              <div className="bg-[#faf7f1] border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="font-bold text-gray-900 text-lg">Fresh Off the Boat (Guides)</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Enable</span>
                    <ToggleSwitch checked={formData.home_mini_guides.enabled} onChange={() => updateSection("home_mini_guides", "enabled", !formData.home_mini_guides.enabled)} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Section Badge</label>
                    <input type="text" value={formData.home_mini_guides.badge} onChange={e => updateSection("home_mini_guides", "badge", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none" placeholder="FRESH OFF THE BOAT" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Section Title</label>
                    <input type="text" value={formData.home_mini_guides.title} onChange={e => updateSection("home_mini_guides", "title", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none" placeholder="Download a pocket guide..." />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-3">Featured Guides</label>
                  <div className="space-y-2 mb-4">
                    {formData.home_mini_guides.items.map((id, idx) => {
                      const guide = dbGuides.find(g => g.id === id);
                      return (
                        <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">{idx + 1}</div>
                            <span className="text-sm font-semibold text-gray-800">{guide ? guide.title : "Unknown Guide"}</span>
                          </div>
                          <button onClick={() => removeItemFromSection("home_mini_guides", idx)} className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 px-2.5 py-1.5 rounded-md">Remove</button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <select value={selectedGuide} onChange={e => setSelectedGuide(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c7962d]">
                      <option value="">Select guide...</option>
                      {dbGuides.filter(g => !formData.home_mini_guides.items.includes(g.id) && g.type === "itinerary").map(g => (
                        <option key={g.id} value={g.id}>{g.title}</option>
                      ))}
                    </select>
                    <button onClick={() => { addItemToSection("home_mini_guides", selectedGuide); setSelectedGuide(""); }} className="bg-[#f6ead0] text-[#c7962d] font-bold px-4 py-2 rounded-lg text-sm hover:bg-[#e8d5b0]">
                      Add Featured Guide
                    </button>
                  </div>
                </div>
              </div>

              {/* Pocket Guides */}
              <div className="bg-[#faf7f1] border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="font-bold text-gray-900 text-lg">Pocket Guides</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Enable</span>
                    <ToggleSwitch checked={formData.home_pocket_guides.enabled} onChange={() => updateSection("home_pocket_guides", "enabled", !formData.home_pocket_guides.enabled)} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Section Badge</label>
                    <input type="text" value={formData.home_pocket_guides.badge} onChange={e => updateSection("home_pocket_guides", "badge", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none" placeholder="⚡ POCKET GUIDES" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Section Title</label>
                    <input type="text" value={formData.home_pocket_guides.title} onChange={e => updateSection("home_pocket_guides", "title", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none" placeholder="Mini Travel Guides" />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-3">Featured Pocket Guides</label>
                  <div className="space-y-2 mb-4">
                    {formData.home_pocket_guides.items.map((id, idx) => {
                      const guide = dbGuides.find(g => g.id === id);
                      return (
                        <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">{idx + 1}</div>
                            <span className="text-sm font-semibold text-gray-800">{guide ? guide.title : "Unknown Guide"}</span>
                          </div>
                          <button onClick={() => removeItemFromSection("home_pocket_guides", idx)} className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 px-2.5 py-1.5 rounded-md">Remove</button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <select value={selectedGuide} onChange={e => setSelectedGuide(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c7962d]">
                      <option value="">Select pocket guide...</option>
                      {dbGuides.filter(g => !formData.home_pocket_guides.items.includes(g.id) && g.type === "pocket").map(g => (
                        <option key={g.id} value={g.id}>{g.title}</option>
                      ))}
                    </select>
                    <button onClick={() => { addItemToSection("home_pocket_guides", selectedGuide); setSelectedGuide(""); }} className="bg-[#f6ead0] text-[#c7962d] font-bold px-4 py-2 rounded-lg text-sm hover:bg-[#e8d5b0]">
                      Add Featured Pocket Guide
                    </button>
                  </div>
                </div>
              </div>

              {/* Plan with Me CTA */}
              <div className="bg-[#faf7f1] border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="font-bold text-gray-900 text-lg">Plan with Me CTA</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Enable</span>
                    <ToggleSwitch checked={formData.home_cta.enabled} onChange={() => updateSection("home_cta", "enabled", !formData.home_cta.enabled)} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Section Badge</label>
                      <input type="text" value={formData.home_cta.badge} onChange={e => updateSection("home_cta", "badge", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none" placeholder="PLAN WITH ME" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Title</label>
                      <input type="text" value={formData.home_cta.title} onChange={e => updateSection("home_cta", "title", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none" placeholder="Let's build your perfect..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Description</label>
                      <textarea rows="2" value={formData.home_cta.description} onChange={e => updateSection("home_cta", "description", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none resize-none" placeholder="CTA description..." />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Button Text</label>
                        <input type="text" value={formData.home_cta.buttonText} onChange={e => updateSection("home_cta", "buttonText", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none" placeholder="Plan with Me" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Button Link</label>
                        <input type="text" value={formData.home_cta.buttonLink} onChange={e => updateSection("home_cta", "buttonLink", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none" placeholder="/plan-with-me" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Background Image</label>
                    <div className="bg-black/5 rounded-xl aspect-square flex flex-col items-center justify-center border border-dashed border-gray-300 relative overflow-hidden mb-3">
                      {formData.home_cta.coverImage ? (
                        <img src={formData.home_cta.coverImage} className="absolute inset-0 w-full h-full object-cover" alt="CTA preview" />
                      ) : (
                        <ImageIcon size={32} className="text-gray-400 mb-2" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => { setMediaTarget({ tab: "home_cta", field: "coverImage" }); setIsMediaModalOpen(true); }} className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-1.5 min-w-[80px]">
                        <ImageIcon size={14} /> Library
                      </button>
                      <label className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-1.5 cursor-pointer min-w-[80px]">
                        {imageUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "home_cta", "coverImage")} />
                      </label>
                      {formData.home_cta.coverImage && (
                        <button type="button" onClick={() => updateSection("home_cta", "coverImage", "")} className="flex-1 bg-white border border-gray-200 text-red-600 rounded-lg px-3 py-2 text-xs font-bold hover:bg-red-50 flex items-center justify-center gap-1.5 min-w-[80px]">
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* More Travel Guides (Tours) */}
              <div className="bg-[#faf7f1] border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="font-bold text-gray-900 text-lg">More Travel Guides (Tours/Services)</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Enable</span>
                    <ToggleSwitch checked={formData.home_tours.enabled} onChange={() => updateSection("home_tours", "enabled", !formData.home_tours.enabled)} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Section Badge</label>
                    <input type="text" value={formData.home_tours.badge} onChange={e => updateSection("home_tours", "badge", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none" placeholder="MORE TRAVEL GUIDES" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Section Title</label>
                    <input type="text" value={formData.home_tours.title} onChange={e => updateSection("home_tours", "title", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none" placeholder="Discover tours..." />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-3">Featured Services</label>
                  <div className="space-y-2 mb-4">
                    {formData.home_tours.items.map((id, idx) => {
                      const tour = dbTours.find(t => t.id === id);
                      return (
                        <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">{idx + 1}</div>
                            <span className="text-sm font-semibold text-gray-800">{tour ? tour.name : "Unknown Service"}</span>
                          </div>
                          <button onClick={() => removeItemFromSection("home_tours", idx)} className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 px-2.5 py-1.5 rounded-md">Remove</button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <select value={selectedTour} onChange={e => setSelectedTour(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c7962d]">
                      <option value="">Select service/tour...</option>
                      {dbTours.filter(t => !formData.home_tours.items.includes(t.id)).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <button onClick={() => { addItemToSection("home_tours", selectedTour); setSelectedTour(""); }} className="bg-[#f6ead0] text-[#c7962d] font-bold px-4 py-2 rounded-lg text-sm hover:bg-[#e8d5b0]">
                      Add Featured Service
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-[#faf7f1] border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="font-bold text-gray-900 text-lg">Footer</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Enable</span>
                    <ToggleSwitch checked={formData.home_footer.enabled} onChange={() => updateSection("home_footer", "enabled", !formData.home_footer.enabled)} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Footer Brand Text</label>
                    <input type="text" value={formData.home_footer.brandText} onChange={e => updateSection("home_footer", "brandText", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none" placeholder="The Long Way" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Copyright</label>
                    <input type="text" value={formData.home_footer.copyright} onChange={e => updateSection("home_footer", "copyright", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none" placeholder="© 2024 The Long Way." />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Footer Link URL</label>
                  <input type="text" value={formData.home_footer.linkUrl} onChange={e => updateSection("home_footer", "linkUrl", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none" placeholder="/privacy-policy" />
                </div>
              </div>

            </>
          )}


          {/* ABOUT PAGE TAB */}
          {/* ABOUT PAGE TAB */}
            {activeTab === "about_page" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl text-charcoal-900 mb-1 flex items-center gap-2 font-bold">
                    About Elena & Journal
                    <Sparkles size={16} className="text-brand-mustard" />
                  </h2>
                  <p className="text-xs text-charcoal-800/60">Configure the complete static copies, floating portrait pills, about page layouts, and contact card email.</p>
                </div>
                
                <hr className="border-cream-200" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">Page Category Badge</label>
                    <input 
                      type="text" 
                      value={aboutPage.badge}
                      onChange={e => setAboutPage(prev => ({ ...prev, badge: e.target.value }))}
                      placeholder="e.g. ABOUT"
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">Floating Portrait Pill Text</label>
                    <input 
                      type="text" 
                      value={aboutPage.floatingPill}
                      onChange={e => setAboutPage(prev => ({ ...prev, floatingPill: e.target.value }))}
                      placeholder="e.g. 👋 HI, THAT'S ME"
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">About Main Title (Supports multi-line with Enter)</label>
                  <textarea 
                    rows="2"
                    value={aboutPage.title}
                    onChange={e => setAboutPage(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. I write about places&#10;like I'd text a friend."
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard resize-none"
                  />
                  <p className="text-[10px] text-charcoal-800/40 mt-1">Pressing Enter inserts a line break that shows on the public About page.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">Intro Paragraph</label>
                    <textarea 
                      rows="3"
                      value={aboutPage.introText}
                      onChange={e => setAboutPage(prev => ({ ...prev, introText: e.target.value }))}
                      placeholder="First paragraph copy..."
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">Middle Paragraph</label>
                    <textarea 
                      rows="3"
                      value={aboutPage.middleText}
                      onChange={e => setAboutPage(prev => ({ ...prev, middleText: e.target.value }))}
                      placeholder="Second paragraph copy..."
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">Footer Paragraph</label>
                    <textarea 
                      rows="3"
                      value={aboutPage.footerText}
                      onChange={e => setAboutPage(prev => ({ ...prev, footerText: e.target.value }))}
                      placeholder="Third/disclaimer paragraph copy..."
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">Contact Card Title</label>
                    <input 
                      type="text" 
                      value={aboutPage.contactTitle}
                      onChange={e => setAboutPage(prev => ({ ...prev, contactTitle: e.target.value }))}
                      placeholder="e.g. say hi 👋"
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">Contact Email Address</label>
                    <input 
                      type="email" 
                      value={aboutPage.contactEmail}
                      onChange={e => setAboutPage(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="hello@thelongway.travel"
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">Portrait Image URL</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="text" 
                      value={aboutPage.coverImage}
                      onChange={e => setAboutPage(prev => ({ ...prev, coverImage: e.target.value }))}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="flex-1 bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard" 
                    />
                    
                    <button
                      type="button"
                      onClick={() => {
                        setMediaTarget({ tab: "about_page", field: "coverImage" });
                        setIsMediaModalOpen(true);
                      }}
                      className="bg-brand-bg text-brand-ink px-4 py-3 border border-brand-border rounded-lg text-xs font-semibold tracking-wide uppercase hover:bg-cream-100 transition-colors flex items-center gap-2 cursor-pointer shrink-0"
                    >
                      <ImageIcon size={14} /> Library
                    </button>
                    
                    <label className="bg-charcoal-900 text-white px-4 py-3 rounded-lg text-xs font-semibold tracking-wide uppercase hover:bg-brand-mustard transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0">
                      {imageUploading ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Upload size={14} />
                      )}
                      Upload
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => handleImageUpload(e, "about_page", "coverImage")}
                        className="hidden" 
                      />
                    </label>
                  </div>
                  
                  {aboutPage.coverImage && (
                    <div className="mt-4 relative max-w-[280px] aspect-[4/5] rounded-xl overflow-hidden border border-brand-border shadow-xs">
                      <img 
                        src={aboutPage.coverImage} 
                        alt="About portrait preview" 
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-cream-200 flex justify-end">
                  <button
                    onClick={() => handleSaveAll()}
                    className="bg-charcoal-900 text-white px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-brand-mustard transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Save size={14} /> Save About Page Config
                  </button>
                </div>
              </div>
            )}

            
          
          {/* PLAN PAGE & FAQS TAB */}
          {/* PLAN PAGE & FAQS TAB */}
            {activeTab === "plan_page" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl text-charcoal-900 mb-1 flex items-center gap-2 font-bold">
                    Plan Customization & FAQs
                    <Sparkles size={16} className="text-brand-mustard" />
                  </h2>
                  <p className="text-xs text-charcoal-800/60">Configure the Plan with Me intro, the FAQ section title, and edit, reorder, or delete direct accordion questions.</p>
                </div>
                
                <hr className="border-cream-200" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">Hero Section Badge</label>
                    <input 
                      type="text" 
                      value={planPage.heroBadge}
                      onChange={e => setPlanPage(prev => ({ ...prev, heroBadge: e.target.value }))}
                      placeholder="e.g. PLAN WITH ME"
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">Hero Section Title</label>
                    <input 
                      type="text" 
                      value={planPage.heroTitle}
                      onChange={e => setPlanPage(prev => ({ ...prev, heroTitle: e.target.value }))}
                      placeholder="e.g. Your custom slow travel itinerary."
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">Hero Subtitle copy</label>
                  <textarea 
                    rows="3"
                    value={planPage.heroSubtitle}
                    onChange={e => setPlanPage(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                    placeholder="Short summary detailing custom itineraries features..."
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-cream-100">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">FAQ Badge Title</label>
                    <input 
                      type="text" 
                      value={planPage.faqBadge}
                      onChange={e => setPlanPage(prev => ({ ...prev, faqBadge: e.target.value }))}
                      placeholder="e.g. CURIOUS?"
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">FAQ Section Title</label>
                    <input 
                      type="text" 
                      value={planPage.faqTitle}
                      onChange={e => setPlanPage(prev => ({ ...prev, faqTitle: e.target.value }))}
                      placeholder="e.g. Common questions"
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard" 
                    />
                  </div>
                </div>

                {/* FAQ List Dynamic Editor */}
                <div className="pt-6 border-t border-cream-200">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-serif text-lg text-charcoal-900 font-bold">Frequently Asked Questions ({planPage.faqs.length})</h3>
                      <p className="text-[11px] text-charcoal-800/50">These questions appear in the accordion at the bottom of the plan with me booking form.</p>
                    </div>
                  </div>

                  {planPage.faqs.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-brand-border rounded-xl bg-brand-bg/50">
                      <HelpCircle className="mx-auto text-charcoal-300 mb-2" size={32} />
                      <p className="text-xs text-charcoal-800/50 font-medium mb-4">No FAQ items defined yet.</p>
                      <button
                        onClick={addFaq}
                        className="mx-auto bg-brand-mustard text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-charcoal-900 transition-all cursor-pointer shadow-xs"
                      >
                        <Plus size={14} /> Add First FAQ
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {planPage.faqs.map((faq, idx) => (
                        <div 
                          key={idx} 
                          className="bg-brand-bg/30 border border-brand-border rounded-xl p-4 md:p-5 flex gap-4 items-start"
                        >
                          <div className="flex flex-col gap-1 shrink-0 pt-2">
                            <button 
                              onClick={() => moveFaq(idx, "up")}
                              disabled={idx === 0}
                              className={`p-1 rounded hover:bg-cream-200 text-charcoal-500 hover:text-charcoal-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer`}
                              title="Move Up"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <span className="text-[10px] text-center font-bold text-charcoal-800/40 select-none">{idx + 1}</span>
                            <button 
                              onClick={() => moveFaq(idx, "down")}
                              disabled={idx === planPage.faqs.length - 1}
                              className={`p-1 rounded hover:bg-cream-200 text-charcoal-500 hover:text-charcoal-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer`}
                              title="Move Down"
                            >
                              <ArrowDown size={14} />
                            </button>
                          </div>

                          <div className="flex-grow space-y-3">
                            <input 
                              type="text" 
                              value={faq.q}
                              onChange={e => handleFaqChange(idx, "q", e.target.value)}
                              placeholder={`Question ${idx + 1}...`}
                              className="w-full bg-white border border-brand-border rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-mustard text-charcoal-900" 
                            />
                            <textarea 
                              rows="2"
                              value={faq.a}
                              onChange={e => handleFaqChange(idx, "a", e.target.value)}
                              placeholder={`Provide clear, informative answer to Question ${idx + 1}...`}
                              className="w-full bg-white border border-brand-border rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-brand-mustard resize-none text-charcoal-800" 
                            />
                          </div>

                          <button 
                            onClick={() => removeFaq(idx)}
                            className="p-2.5 rounded-lg text-brand-danger bg-brand-danger-bg hover:opacity-85 transition-opacity cursor-pointer self-start mt-2"
                            title="Delete FAQ Item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {planPage.faqs.length > 0 && (
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={addFaq}
                        className="bg-brand-mustard text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-charcoal-900 transition-all cursor-pointer shadow-xs"
                      >
                        <Plus size={14} /> Add Another FAQ
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-cream-200 flex justify-end">
                  <button
                    onClick={() => handleSaveAll()}
                    className="bg-charcoal-900 text-white px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-brand-mustard transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Save size={14} /> Save FAQ & Plan Config
                  </button>
                </div>
              </div>
            )}

          

          {activeTab === "general_site_info" && (
            <div className="bg-[#faf7f1] border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 text-lg mb-5">Homepage SEO</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Meta Title</label>
                  <input type="text" value={formData.home_seo.title} onChange={e => updateSection("home_seo", "title", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none" placeholder="The Long Way | Slow Travel" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Meta Description</label>
                  <textarea rows="3" value={formData.home_seo.description} onChange={e => updateSection("home_seo", "description", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none resize-none" placeholder="Learn how to travel slower..." />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Twitter / Social Image URL</label>
                  <div className="flex gap-2">
                    <input type="text" value={formData.home_seo.socialImage} onChange={e => updateSection("home_seo", "socialImage", e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none" placeholder="https://..." />
                    <button type="button" onClick={() => { setMediaTarget({ tab: "home_seo", field: "socialImage" }); setIsMediaModalOpen(true); }} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-1.5">
                      <ImageIcon size={14} /> Library
                    </button>
                    <label className="bg-[#f6ead0] text-[#c7962d] font-bold px-4 py-2 rounded-lg text-sm hover:bg-[#e8d5b0] flex items-center gap-2 cursor-pointer">
                      {imageUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "home_seo", "socialImage")} />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Site Logo</label>
                  <div className="flex gap-2">
                    <input type="text" value={formData.home_seo?.siteLogo || ""} onChange={e => updateSection("home_seo", "siteLogo", e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#c7962d] outline-none" placeholder="https://..." />
                    <button type="button" onClick={() => { setMediaTarget({ tab: "home_seo", field: "siteLogo" }); setIsMediaModalOpen(true); }} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-1.5">
                      <ImageIcon size={14} /> Library
                    </button>
                    <label className="bg-[#f6ead0] text-[#c7962d] font-bold px-4 py-2 rounded-lg text-sm hover:bg-[#e8d5b0] flex items-center gap-2 cursor-pointer">
                      {imageUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "home_seo", "siteLogo")} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Media Selector Modal */}
      <MediaSelectorModal
        isOpen={isMediaModalOpen}
        onClose={() => {
          setIsMediaModalOpen(false);
          setMediaTarget(null);
        }}
        onSelect={(url) => {

          if (mediaTarget) {
            if (mediaTarget.tab === "about_page") {
              setAboutPage(prev => ({ ...prev, [mediaTarget.field]: url }));
            }

            updateSection(mediaTarget.tab, mediaTarget.field, url);
          }
          setIsMediaModalOpen(false);
          setMediaTarget(null);
        }}
      />
    </div>
  );
}
