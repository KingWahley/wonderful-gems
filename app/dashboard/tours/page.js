"use client";

import { useState, useEffect } from "react";
import { fetchTours, saveTour, deleteTour, fetchDestinations } from "@/lib/db";
import { Plus, Edit2, Trash2, Search, X, Loader2 } from "lucide-react";

export default function ToursCMS() {
  const [tours, setTours] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  
  // Form State
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    destination: "",
    countryCode: "",
    category: "CULTURE",
    description: "",
    details: "",
    badge: "TOUR",
    slug: "",
    heroImage: "",
    shortDescription: "",
    price: "",
    availability: "",
    included: [],
    gallery: []
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [toursData, destinationsData] = await Promise.all([
        fetchTours(),
        fetchDestinations()
      ]);
      setTours(toursData);
      setDestinations(destinationsData);
    } catch (e) {
      console.error("Failed to load tours page data", e);
    } finally {
      setLoading(false);
    }
  }

  // List Manipulation Helpers
  const updateListField = (field, idx, val) => {
    setFormData(prev => {
      const arr = [...(prev[field] || [])];
      arr[idx] = val;
      return { ...prev, [field]: arr };
    });
  };

  const addListItem = (field, defaultVal = "") => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), defaultVal]
    }));
  };

  const removeListItem = (field, idx) => {
    setFormData(prev => {
      const arr = [...(prev[field] || [])];
      arr.splice(idx, 1);
      return { ...prev, [field]: arr };
    });
  };

  const handleOpenAdd = () => {
    setModalMode("add");
    setFormData({
      id: "",
      title: "",
      destination: destinations[0]?.country || "",
      countryCode: destinations[0]?.code || "",
      category: "CULTURE",
      description: "",
      details: "Duration: 3 hours",
      badge: "TOUR",
      slug: "",
      heroImage: "",
      shortDescription: "",
      price: "$85 per person",
      availability: "Flexible departures daily",
      included: [
        "Certified bilingual professional guide",
        "Priority entry tickets (Skip-the-line)",
        "Bottled spring water and traditional snacks"
      ],
      gallery: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tour) => {
    setModalMode("edit");
    setFormData({
      id: tour.id,
      title: tour.title || "",
      destination: tour.destination || "",
      countryCode: tour.countryCode || "",
      category: tour.category || "",
      description: tour.description || "",
      details: tour.details || "",
      badge: tour.badge || "TOUR",
      slug: tour.slug || "",
      heroImage: tour.heroImage || "",
      shortDescription: tour.shortDescription || "",
      price: tour.price || "",
      availability: tour.availability || "",
      included: Array.isArray(tour.included) ? tour.included : [],
      gallery: Array.isArray(tour.gallery) ? tour.gallery : []
    });
    setIsModalOpen(true);
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
    setFormData(prev => ({
      ...prev,
      destination: destName,
      countryCode: destObj ? destObj.code : ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.destination || !formData.details) {
      alert("Title, destination, and details are required.");
      return;
    }

    try {
      setSaving(true);

      const generatedSlug = formData.slug || formData.title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

      const payload = {
        title: formData.title,
        destination: formData.destination,
        countryCode: formData.countryCode.toUpperCase(),
        category: formData.category,
        description: formData.description,
        details: formData.details,
        badge: formData.badge,
        slug: generatedSlug,
        heroImage: formData.heroImage,
        shortDescription: formData.shortDescription,
        price: formData.price,
        availability: formData.availability,
        included: formData.included.filter(Boolean),
        gallery: formData.gallery.filter(Boolean)
      };

      if (formData.id) {
        payload.id = formData.id;
      }

      await saveTour(payload);
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      alert("Failed to save tour: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = tours.filter(t => {
    const matchStr = `${t.title} ${t.destination} ${t.category} ${t.badge}`.toLowerCase();
    return matchStr.includes(searchQuery.toLowerCase());
  });

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif text-charcoal-900 mb-2">Tours & Experiences</h1>
          <p className="text-charcoal-800/70 text-sm">Manage the premium tours, activities, and skip-the-line tickets you offer.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-charcoal-900 text-white px-4 py-2.5 rounded-md text-sm hover:bg-gold-600 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={16} /> Create Tour
        </button>
      </div>

      {/* Main List Box */}
      <div className="bg-white rounded-xl shadow-sm border border-cream-200 overflow-hidden">
        <div className="p-4 border-b border-cream-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-cream-100/30">
          <div className="relative w-full max-w-sm">
            <input 
              type="text" 
              placeholder="Search tours..." 
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
            <p className="text-charcoal-800/60 text-sm font-medium">Loading tours...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-charcoal-800/60 mb-2 font-medium">No tours found.</p>
            <p className="text-xs text-charcoal-800/40">Create an experience to showcase it on the tours page.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-100/50 text-xs uppercase tracking-widest text-charcoal-800/60 border-b border-cream-200">
                  <th className="p-4 font-medium">Tour / Activity Name</th>
                  <th className="p-4 font-medium">Destination</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Details (Duration & Location)</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {filtered.map((tour) => (
                  <tr key={tour.id} className="hover:bg-cream-100/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-charcoal-900 flex items-center gap-2">
                          {tour.title}
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            tour.badge === "TICKET" 
                              ? "bg-amber-100 text-amber-800" 
                              : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {tour.badge || "TOUR"}
                          </span>
                        </div>
                        <div className="text-xs text-charcoal-800/60 line-clamp-1 mt-0.5">{tour.description}</div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-charcoal-800">
                      <span className="flex items-center gap-1 font-medium">
                        <span className="text-[10px] bg-cream-200 text-charcoal-900 px-1.5 py-0.5 rounded font-bold">{tour.countryCode}</span>
                        {tour.destination}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-semibold text-charcoal-800/70">{tour.category}</td>
                    <td className="p-4 text-xs font-mono text-charcoal-800/70">{tour.details}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(tour)}
                          className="p-2 text-charcoal-400 hover:text-gold-600 hover:bg-cream-100 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(tour.id, tour.title)}
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
          <div>Showing {filtered.length} experiences</div>
        </div>
      </div>

      {/* Upsert Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-charcoal-900/65 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-cream-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-cream-200 flex justify-between items-center bg-cream-100/30">
              <h2 className="font-serif text-xl text-charcoal-900 font-bold">
                {modalMode === "add" ? "Create New Tour" : `Edit Tour: ${formData.title}`}
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
                <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Tour Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                  placeholder="e.g. Private Tea Ceremony in Gion"
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
                  <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Type / Badge</label>
                  <select
                    value={formData.badge}
                    onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                    className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                  >
                    <option value="TOUR">TOUR (Guided Experience)</option>
                    <option value="TICKET">TICKET (Admission Pass)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Category (e.g. CULTURE, FOOD & DRINK)</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                    placeholder="e.g. FOOD & DRINK"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Details (e.g. Duration: 2 hours | Kyoto) *</label>
                  <input
                    type="text"
                    required
                    value={formData.details}
                    onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                    className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                    placeholder="e.g. Duration: 3 hours | Old Quarter"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                  placeholder="Enter details about this experience..."
                />
              </div>

              {/* Advanced Public Detail Settings */}
              <div className="pt-6 border-t border-cream-200 space-y-6">
                <h3 className="font-serif text-base text-charcoal-900 font-bold">
                  ✨ Public Detail Page Details
                </h3>
                <p className="text-xs text-charcoal-500 font-light -mt-2">
                  These premium settings are serialized inside the `details` field and render directly on the public tour page.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Tour URL Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }))}
                      className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900 font-mono"
                      placeholder="e.g. scenic-boat-tour"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Hero Image URL</label>
                    <input
                      type="text"
                      value={formData.heroImage}
                      onChange={(e) => setFormData(prev => ({ ...prev, heroImage: e.target.value }))}
                      className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                      placeholder="e.g. https://images.unsplash.com/photo-..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Price (Display Text)</label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                      placeholder="e.g. $85 per person"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Availability Status</label>
                    <input
                      type="text"
                      value={formData.availability}
                      onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                      className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                      placeholder="e.g. Flexible departures daily"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Short Description (Sub-heading Overview)</label>
                  <textarea
                    rows={2}
                    value={formData.shortDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                    className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                    placeholder="Enter short punchy overview paragraph..."
                  />
                </div>

                {/* Included List */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider">What's Included</label>
                    <button
                      type="button"
                      onClick={() => addListItem("included", "")}
                      className="text-xs text-gold-600 hover:text-gold-700 font-bold flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Inclusion
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(formData.included || []).map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={item || ""}
                          onChange={(e) => updateListField("included", idx, e.target.value)}
                          className="flex-1 border border-cream-200 rounded-md p-2 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                          placeholder="e.g. Certified bilingual guide"
                        />
                        <button
                          type="button"
                          onClick={() => removeListItem("included", idx)}
                          className="p-1.5 text-charcoal-400 hover:text-red-500 rounded-md transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {(formData.included || []).length === 0 && (
                      <div className="text-center py-4 border border-dashed border-cream-200 rounded-lg text-xs text-charcoal-400 bg-cream-50/50">
                        No inclusions added. Public fallbacks will be used.
                      </div>
                    )}
                  </div>
                </div>

                {/* Gallery List */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider">Gallery Images (URLs)</label>
                    <button
                      type="button"
                      onClick={() => addListItem("gallery", "")}
                      className="text-xs text-gold-600 hover:text-gold-700 font-bold flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Image URL
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(formData.gallery || []).map((imgUrl, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={imgUrl || ""}
                          onChange={(e) => updateListField("gallery", idx, e.target.value)}
                          className="flex-1 border border-cream-200 rounded-md p-2 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900 font-mono text-xs"
                          placeholder="e.g. https://images.unsplash.com/photo-..."
                        />
                        <button
                          type="button"
                          onClick={() => removeListItem("gallery", idx)}
                          className="p-1.5 text-charcoal-400 hover:text-red-500 rounded-md transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {(formData.gallery || []).length === 0 && (
                      <div className="text-center py-4 border border-dashed border-cream-200 rounded-lg text-xs text-charcoal-400 bg-cream-50/50">
                        No gallery images added. Public fallbacks will be used.
                      </div>
                    )}
                  </div>
                </div>
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
                  {modalMode === "add" ? "Create Tour" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
