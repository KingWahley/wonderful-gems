"use client";

import { useState, useEffect } from "react";
import { fetchMiniGuides, saveMiniGuide, deleteMiniGuide, fetchDestinations, uploadImage } from "@/lib/db";
import { Plus, Edit2, Trash2, Search, X, Loader2, Image as ImageIcon } from "lucide-react";

const defaultDetails = {
  pocketTitle: "",
  itineraryTitle: "",
  blogCountText: "",
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

const mergeWithDefaults = (details) => {
  const d = details || {};
  return {
    pocketTitle: d.pocketTitle || "",
    itineraryTitle: d.itineraryTitle || "",
    blogCountText: d.blogCountText || "",
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [activeDetailsTab, setActiveDetailsTab] = useState("sights");
  
  // Form State
  const [formData, setFormData] = useState({
    id: "",
    slug: "",
    destination: "",
    countryCode: "",
    title: "",
    excerpt: "",
    heroImage: "",
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
    setFormData({
      id: "",
      slug: "",
      destination: destinations[0]?.country || "",
      countryCode: destinations[0]?.code || "",
      title: "",
      excerpt: "",
      heroImage: "",
      details: defaultDetails
    });
    setActiveDetailsTab("sights");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (guide) => {
    setModalMode("edit");
    setFormData({
      id: guide.id,
      slug: guide.slug || "",
      destination: guide.destination || "",
      countryCode: guide.countryCode || "",
      title: guide.title || "",
      excerpt: guide.excerpt || "",
      heroImage: guide.heroImage || "",
      details: mergeWithDefaults(guide.details)
    });
    setActiveDetailsTab("sights");
    setIsModalOpen(true);
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
    setFormData(prev => ({
      ...prev,
      destination: destName,
      countryCode: destObj ? destObj.code : ""
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
    e.preventDefault();
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
        details: formData.details
      };

      if (formData.id) {
        payload.id = formData.id;
      }

      await saveMiniGuide(payload);
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      alert("Failed to save pocket guide: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = guides.filter(g => {
    const matchStr = `${g.title} ${g.destination} ${g.excerpt}`.toLowerCase();
    return matchStr.includes(searchQuery.toLowerCase());
  });

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif text-charcoal-900 mb-2">Pocket Guides</h1>
          <p className="text-charcoal-800/70 text-sm">Manage the premium, lightweight country and city guides for swift viewing.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-charcoal-900 text-white px-4 py-2.5 rounded-md text-sm hover:bg-gold-600 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={16} /> Add Pocket Guide
        </button>
      </div>

      {/* Main List Box */}
      <div className="bg-white rounded-xl shadow-sm border border-cream-200 overflow-hidden">
        <div className="p-4 border-b border-cream-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-cream-100/30">
          <div className="relative w-full max-w-sm">
            <input 
              type="text" 
              placeholder="Search pocket guides..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-cream-200 rounded-md py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-gold-500 bg-white"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-400" size={16} />
          </div>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-gold-600" size={36} />
            <p className="text-charcoal-800/60 text-sm font-medium">Loading pocket guides...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-charcoal-800/60 mb-2 font-medium">No pocket guides found.</p>
            <p className="text-xs text-charcoal-800/40">Create a pocket guide to list it here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-100/50 text-xs uppercase tracking-widest text-charcoal-800/60 border-b border-cream-200">
                  <th className="p-4 font-medium">Guide Title</th>
                  <th className="p-4 font-medium">Destination</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {filtered.map((guide) => (
                  <tr key={guide.id} className="hover:bg-cream-100/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded overflow-hidden bg-cream-200 flex-shrink-0 border border-cream-200">
                          <img src={guide.heroImage} alt={guide.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-medium text-charcoal-900">{guide.title}</div>
                          <div className="text-xs text-charcoal-800/50">/{guide.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-charcoal-800">
                      <span className="flex items-center gap-1 font-medium">
                        <span className="text-[10px] bg-cream-200 text-charcoal-900 px-1.5 py-0.5 rounded font-bold">{guide.countryCode}</span>
                        {guide.destination}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(guide)}
                          className="p-2 text-charcoal-400 hover:text-gold-600 hover:bg-cream-100 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(guide.id, guide.title)}
                          className="p-2 text-charcoal-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="p-4 border-t border-cream-200 flex items-center justify-between text-sm text-charcoal-800/60">
          <div>Showing {filtered.length} pocket guides</div>
        </div>
      </div>

      {/* Upsert Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-charcoal-900/65 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-cream-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-cream-200 flex justify-between items-center bg-cream-100/30">
              <h2 className="font-serif text-xl text-charcoal-900 font-bold">
                {modalMode === "add" ? "Create Pocket Guide" : `Edit ${formData.title}`}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-charcoal-400 hover:text-charcoal-900 hover:bg-cream-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
              <div>
                <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Guide Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                  placeholder="e.g. Marrakech Travel Guide"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Destination *</label>
                  <input
                    type="text"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                    className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                    placeholder="e.g. Morocco"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Country Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={formData.countryCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value.toUpperCase() }))}
                    className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900 font-mono"
                    placeholder="e.g. MA"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                    placeholder="e.g. marrakech"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Hero Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.heroImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, heroImage: e.target.value }))}
                    className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                    placeholder="https://..."
                  />
                  <label className="bg-cream-200 hover:bg-cream-300 border border-cream-300 rounded-md px-4 flex items-center justify-center cursor-pointer transition-colors text-charcoal-900" title="Upload local image">
                    {uploadingImage ? <Loader2 className="animate-spin text-charcoal-600" size={18} /> : <ImageIcon size={18} />}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Excerpt (Quick summary)</label>
                <textarea
                  rows={4}
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                  placeholder="Enter a short introduction or excerpt..."
                />
              </div>

              {formData.heroImage && (
                <div className="border border-cream-200 rounded-xl p-4 flex flex-col items-center gap-2 bg-cream-100/10">
                  <span className="text-xs font-semibold text-charcoal-800/50 uppercase">Preview Hero Image</span>
                  <img src={formData.heroImage} alt="Hero Preview" className="h-40 w-full object-cover rounded-lg border border-cream-200" />
                </div>
              )}

              {/* Pocket Guide Details Editor Section */}
              <div className="border border-cream-200 rounded-xl p-6 bg-cream-50/20 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-cream-200 gap-4">
                  <div>
                    <h3 className="font-serif text-lg text-charcoal-900 font-bold">Guide Detail Content</h3>
                    <p className="text-xs text-charcoal-800/50 mt-0.5">Customize sights, hotels, activities, food & tours.</p>
                  </div>
                  
                  {/* Tabs Nav */}
                  <div className="flex overflow-x-auto gap-1 bg-cream-100/60 p-1 rounded-lg self-start">
                    {[
                      { id: "titles", label: "Page Headers" },
                      { id: "sights", label: "Top Sights" },
                      { id: "stay", label: "Where to Stay" },
                      { id: "activities", label: "Activities" },
                      { id: "eat", label: "Eat & Drink" },
                      { id: "restaurants", label: "Restaurants" },
                      { id: "dayTrips", label: "Day Trips" }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveDetailsTab(tab.id)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                          activeDetailsTab === tab.id
                            ? "bg-white text-gold-600 shadow-xs"
                            : "text-charcoal-800/60 hover:text-charcoal-950"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub Tab: Page Headers */}
                {activeDetailsTab === "titles" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Pocket Guide Detail Title (Override)</label>
                        <input
                          type="text"
                          value={formData.details.pocketTitle || ""}
                          onChange={(e) => updateDetailField("pocketTitle", e.target.value)}
                          className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                          placeholder="e.g. The Marrakech Pocket Guide"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Itinerary Guide Title (Override)</label>
                        <input
                          type="text"
                          value={formData.details.itineraryTitle || ""}
                          onChange={(e) => updateDetailField("itineraryTitle", e.target.value)}
                          className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                          placeholder="e.g. Marrakech In 5 Days"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Blog Count/Duration Text</label>
                      <input
                        type="text"
                        value={formData.details.blogCountText || ""}
                        onChange={(e) => updateDetailField("blogCountText", e.target.value)}
                        className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                        placeholder="e.g. 5 STORIES / 4 MIN READ"
                      />
                    </div>
                  </div>
                )}

                {/* Sub Tab: Top Sights */}
                {activeDetailsTab === "sights" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-charcoal-800/60 uppercase">Top Sights List</span>
                      <button
                        type="button"
                        onClick={() => addListItem("sights", { num: "", text: "" })}
                        className="text-xs text-gold-600 hover:text-gold-700 font-semibold flex items-center gap-1 border border-gold-600/25 bg-gold-600/5 px-2.5 py-1 rounded-md transition-colors"
                      >
                        <Plus size={12} /> Add Sight
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {(formData.details.sights || []).map((sight, idx) => (
                        <div key={idx} className="flex gap-2 items-start bg-white p-3 rounded-lg border border-cream-200">
                          <span className="bg-cream-100 text-charcoal-700 font-mono text-xs px-2 py-1.5 rounded font-bold self-center border border-cream-200">
                            {sight.num || String(idx + 1).padStart(2, "0")}
                          </span>
                          <textarea
                            rows={2}
                            value={sight.text || ""}
                            onChange={(e) => updateListField("sights", idx, "text", e.target.value)}
                            className="flex-1 border border-cream-200 rounded-md p-2 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                            placeholder="Describe the top sight..."
                          />
                          <button
                            type="button"
                            onClick={() => removeListItem("sights", idx)}
                            className="p-2 text-charcoal-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors self-center"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub Tab: Where to Stay */}
                {activeDetailsTab === "stay" && (
                  <div className="space-y-6">
                    {["budget", "mid", "splurge"].map(tier => {
                      const label = tier === "budget" ? "Budget (£)" : tier === "mid" ? "Mid-range (££)" : "Splurge (£££)";
                      const list = formData.details.stay?.[tier] || [];
                      return (
                        <div key={tier} className="space-y-3 border-b border-cream-200/50 pb-5 last:border-b-0 last:pb-0">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider">{label}</span>
                            <button
                              type="button"
                              onClick={() => addStayItem(tier)}
                              className="text-xs text-gold-600 hover:text-gold-700 font-semibold flex items-center gap-1 border border-gold-600/25 bg-gold-600/5 px-2.5 py-1 rounded-md transition-colors"
                            >
                              <Plus size={12} /> Add Hotel
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            {list.map((hotel, idx) => (
                              <div key={idx} className="bg-white p-3 rounded-lg border border-cream-200 space-y-2 relative">
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={hotel.name || ""}
                                    onChange={(e) => updateStayField(tier, idx, "name", e.target.value)}
                                    className="flex-1 border border-cream-200 rounded-md p-2 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900 font-semibold"
                                    placeholder="Hotel Name"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeStayItem(tier, idx)}
                                    className="p-2 text-charcoal-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                                <textarea
                                  rows={2}
                                  value={hotel.desc || ""}
                                  onChange={(e) => updateStayField(tier, idx, "desc", e.target.value)}
                                  className="w-full border border-cream-200 rounded-md p-2 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                                  placeholder="Describe the hotel details, location, and why it is great..."
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Sub Tab: Best Activities */}
                {activeDetailsTab === "activities" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-charcoal-800/60 uppercase">Activities List</span>
                      <button
                        type="button"
                        onClick={() => addListItem("activities", { num: "", text: "" })}
                        className="text-xs text-gold-600 hover:text-gold-700 font-semibold flex items-center gap-1 border border-gold-600/25 bg-gold-600/5 px-2.5 py-1 rounded-md transition-colors"
                      >
                        <Plus size={12} /> Add Activity
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {(formData.details.activities || []).map((activity, idx) => (
                        <div key={idx} className="flex gap-2 items-start bg-white p-3 rounded-lg border border-cream-200">
                          <span className="bg-cream-100 text-charcoal-700 font-mono text-xs px-2 py-1.5 rounded font-bold self-center border border-cream-200">
                            {activity.num || String(idx + 1).padStart(2, "0")}
                          </span>
                          <textarea
                            rows={2}
                            value={activity.text || ""}
                            onChange={(e) => updateListField("activities", idx, "text", e.target.value)}
                            className="flex-1 border border-cream-200 rounded-md p-2 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                            placeholder="Describe the activity or tour..."
                          />
                          <button
                            type="button"
                            onClick={() => removeListItem("activities", idx)}
                            className="p-2 text-charcoal-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors self-center"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub Tab: What to Eat & Drink */}
                {activeDetailsTab === "eat" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-charcoal-800/60 uppercase">Eat & Drink Items</span>
                      <button
                        type="button"
                        onClick={() => addListItem("eat", { name: "", desc: "" })}
                        className="text-xs text-gold-600 hover:text-gold-700 font-semibold flex items-center gap-1 border border-gold-600/25 bg-gold-600/5 px-2.5 py-1 rounded-md transition-colors"
                      >
                        <Plus size={12} /> Add Culinary Item
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {(formData.details.eat || []).map((item, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-cream-200 space-y-2 relative">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={item.name || ""}
                              onChange={(e) => updateListField("eat", idx, "name", e.target.value)}
                              className="flex-1 border border-cream-200 rounded-md p-2 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900 font-semibold"
                              placeholder="e.g. Tajine, Mint Tea"
                            />
                            <button
                              type="button"
                              onClick={() => removeListItem("eat", idx)}
                              className="p-2 text-charcoal-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            value={item.desc || ""}
                            onChange={(e) => updateListField("eat", idx, "desc", e.target.value)}
                            className="w-full border border-cream-200 rounded-md p-2 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                            placeholder="Describe what makes this dish or drink special..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub Tab: Best Restaurants */}
                {activeDetailsTab === "restaurants" && (
                  <div className="space-y-6">
                    {["budget", "mid", "splurge"].map(tier => {
                      const label = tier === "budget" ? "Budget (£)" : tier === "mid" ? "Mid-range (££)" : "Splurge (£££)";
                      const list = formData.details.restaurants?.[tier] || [];
                      return (
                        <div key={tier} className="space-y-3 border-b border-cream-200/50 pb-5 last:border-b-0 last:pb-0">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider">{label}</span>
                            <button
                              type="button"
                              onClick={() => addRestaurantItem(tier)}
                              className="text-xs text-gold-600 hover:text-gold-700 font-semibold flex items-center gap-1 border border-gold-600/25 bg-gold-600/5 px-2.5 py-1 rounded-md transition-colors"
                            >
                              <Plus size={12} /> Add Restaurant
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            {list.map((rest, idx) => (
                              <div key={idx} className="bg-white p-3 rounded-lg border border-cream-200 space-y-2 relative">
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={rest.name || ""}
                                    onChange={(e) => updateRestaurantField(tier, idx, "name", e.target.value)}
                                    className="flex-1 border border-cream-200 rounded-md p-2 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900 font-semibold"
                                    placeholder="Restaurant Name"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeRestaurantItem(tier, idx)}
                                    className="p-2 text-charcoal-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                                <textarea
                                  rows={2}
                                  value={rest.desc || ""}
                                  onChange={(e) => updateRestaurantField(tier, idx, "desc", e.target.value)}
                                  className="w-full border border-cream-200 rounded-md p-2 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                                  placeholder="Describe the dining experience, signature dishes, and location..."
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Sub Tab: Best Day Trips */}
                {activeDetailsTab === "dayTrips" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-charcoal-800/60 uppercase">Day Trips List</span>
                      <button
                        type="button"
                        onClick={() => addListItem("dayTrips", { num: "", name: "" })}
                        className="text-xs text-gold-600 hover:text-gold-700 font-semibold flex items-center gap-1 border border-gold-600/25 bg-gold-600/5 px-2.5 py-1 rounded-md transition-colors"
                      >
                        <Plus size={12} /> Add Day Trip
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {(formData.details.dayTrips || []).map((trip, idx) => (
                        <div key={idx} className="flex gap-2 items-start bg-white p-3 rounded-lg border border-cream-200">
                          <span className="bg-cream-100 text-charcoal-700 font-mono text-xs px-2 py-1.5 rounded font-bold self-center border border-cream-200">
                            {trip.num || String(idx + 1).padStart(2, "0")}
                          </span>
                          <input
                            type="text"
                            value={trip.name || ""}
                            onChange={(e) => updateListField("dayTrips", idx, "name", e.target.value)}
                            className="flex-1 border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                            placeholder="e.g. Essaouira Coast, Atlas Mountains"
                          />
                          <button
                            type="button"
                            onClick={() => removeListItem("dayTrips", idx)}
                            className="p-2 text-charcoal-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors self-center"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-cream-200 flex justify-end gap-3 bg-cream-100/30 -mx-6 -mb-6 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-cream-200 rounded-md text-sm hover:bg-cream-100 text-charcoal-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-charcoal-900 text-white rounded-md text-sm hover:bg-gold-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  {modalMode === "add" ? "Create Guide" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
