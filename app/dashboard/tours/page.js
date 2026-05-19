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
    badge: "TOUR"
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

  const handleOpenAdd = () => {
    setModalMode("add");
    setFormData({
      id: "",
      title: "",
      destination: destinations[0]?.country || "",
      countryCode: destinations[0]?.code || "",
      category: "CULTURE",
      description: "",
      details: "",
      badge: "TOUR"
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
      badge: tour.badge || "TOUR"
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

      const payload = {
        title: formData.title,
        destination: formData.destination,
        countryCode: formData.countryCode.toUpperCase(),
        category: formData.category,
        description: formData.description,
        details: formData.details,
        badge: formData.badge
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
