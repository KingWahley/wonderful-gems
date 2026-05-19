"use client";

import { useState, useEffect } from "react";
import { fetchDestinations, saveDestination, deleteDestination, uploadImage } from "@/lib/db";
import { Plus, Edit2, Trash2, Search, X, Loader2, Image as ImageIcon } from "lucide-react";

export default function DestinationsCMS() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  
  // Form State
  const [formData, setFormData] = useState({
    id: "",
    country: "",
    code: "",
    slug: "",
    region: "",
    excerpt: "",
    description: "",
    whyILoveIt: "",
    momentsString: "",
    coverImage: "",
    galleryString: ""
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadDestinations();
  }, []);

  async function loadDestinations() {
    try {
      setLoading(true);
      const data = await fetchDestinations();
      setDestinations(data);
    } catch (e) {
      console.error("Failed to load destinations", e);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setModalMode("add");
    setFormData({
      id: "",
      country: "",
      code: "",
      slug: "",
      region: "Europe",
      excerpt: "",
      description: "",
      whyILoveIt: "",
      momentsString: "",
      coverImage: "",
      galleryString: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dest) => {
    setModalMode("edit");
    setFormData({
      id: dest.id,
      country: dest.country || "",
      code: dest.code || "",
      slug: dest.slug || "",
      region: dest.region || "Europe",
      excerpt: dest.excerpt || "",
      description: dest.description || "",
      whyILoveIt: dest.whyILoveIt || "",
      momentsString: Array.isArray(dest.moments) ? dest.moments.join(", ") : "",
      coverImage: dest.coverImage || "",
      galleryString: Array.isArray(dest.gallery) ? dest.gallery.join(", ") : ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, countryName) => {
    if (confirm(`Are you sure you want to delete ${countryName}?`)) {
      try {
        await deleteDestination(id);
        setDestinations(destinations.filter(d => d.id !== id));
      } catch (e) {
        alert("Failed to delete destination: " + e.message);
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.country || !formData.slug || !formData.code) {
      alert("Country name, country code, and URL slug are required.");
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        country: formData.country,
        code: formData.code.toUpperCase(),
        slug: formData.slug.toLowerCase().replace(/\s+/g, "-"),
        region: formData.region,
        excerpt: formData.excerpt,
        description: formData.description,
        whyILoveIt: formData.whyILoveIt,
        moments: formData.momentsString.split(",").map(s => s.trim()).filter(Boolean),
        coverImage: formData.coverImage || "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2000&auto=format&fit=crop",
        gallery: formData.galleryString.split(",").map(s => s.trim()).filter(Boolean)
      };

      if (formData.id) {
        payload.id = formData.id;
      }

      await saveDestination(payload);
      await loadDestinations();
      setIsModalOpen(false);
    } catch (err) {
      alert("Failed to save destination: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = destinations.filter(d => {
    const matchStr = `${d.country} ${d.slug} ${d.region}`.toLowerCase();
    return matchStr.includes(searchQuery.toLowerCase());
  });

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif text-charcoal-900 mb-2">Destinations</h1>
          <p className="text-charcoal-800/70 text-sm">Manage your luxury travel destinations and content.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-charcoal-900 text-white px-4 py-2.5 rounded-md text-sm hover:bg-gold-600 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={16} /> Add Destination
        </button>
      </div>

      {/* Main List Box */}
      <div className="bg-white rounded-xl shadow-sm border border-cream-200 overflow-hidden">
        <div className="p-4 border-b border-cream-200 flex justify-between items-center bg-cream-100/30">
          <div className="relative w-full max-w-sm">
            <input 
              type="text" 
              placeholder="Search destinations..." 
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
            <p className="text-charcoal-800/60 text-sm font-medium">Loading destinations...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-charcoal-800/60 mb-2 font-medium">No destinations found.</p>
            <p className="text-xs text-charcoal-800/40">Try adjusting your search query or add a new destination.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-100/50 text-xs uppercase tracking-widest text-charcoal-800/60 border-b border-cream-200">
                  <th className="p-4 font-medium">Destination</th>
                  <th className="p-4 font-medium">Region</th>
                  <th className="p-4 font-medium">Blogs</th>
                  <th className="p-4 font-medium">Tours</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {filtered.map((dest) => (
                  <tr key={dest.id} className="hover:bg-cream-100/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream-200 flex-shrink-0 border border-cream-200">
                          <img src={dest.coverImage} alt={dest.country} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-medium text-charcoal-900">{dest.country}</div>
                          <div className="text-xs text-charcoal-800/50">/{dest.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 bg-cream-200 text-charcoal-800 text-xs font-medium rounded-full">
                        {dest.region}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-charcoal-800 font-medium">{dest.blogsCount || 0}</td>
                    <td className="p-4 text-sm text-charcoal-800 font-medium">{dest.toursCount || 0}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(dest)}
                          className="p-2 text-charcoal-400 hover:text-gold-600 hover:bg-cream-100 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(dest.id, dest.country)}
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
          <div>Showing {filtered.length} destinations</div>
        </div>
      </div>

      {/* Upsert Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-charcoal-900/65 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-cream-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-cream-200 flex justify-between items-center bg-cream-100/30">
              <h2 className="font-serif text-xl text-charcoal-900 font-bold">
                {modalMode === "add" ? "Add New Destination" : `Edit ${formData.country}`}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-charcoal-400 hover:text-charcoal-900 hover:bg-cream-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Country Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                    placeholder="e.g. Japan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Country Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                    placeholder="e.g. JP"
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
                    placeholder="e.g. japan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Region</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                  >
                    <option value="Asia">Asia</option>
                    <option value="Europe">Europe</option>
                    <option value="Africa">Africa</option>
                    <option value="North America">North America</option>
                    <option value="South America">South America</option>
                    <option value="Oceania">Oceania</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Cover Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.coverImage}
                      onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Excerpt (Brief intro statement)</label>
                <input
                  type="text"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                  placeholder="e.g. Old capitals, neon avenues, and the ritual of small things."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Full Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                  placeholder="Enter details about this destination..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Why I Love It</label>
                <textarea
                  rows={2}
                  value={formData.whyILoveIt}
                  onChange={(e) => setFormData(prev => ({ ...prev, whyILoveIt: e.target.value }))}
                  className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                  placeholder="e.g. The meticulous attention to detail in everything from food to hospitality is unmatched."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Moments (Comma separated)</label>
                <input
                  type="text"
                  value={formData.momentsString}
                  onChange={(e) => setFormData(prev => ({ ...prev, momentsString: e.target.value }))}
                  className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                  placeholder="e.g. Staying in a ryokan, Cherry blossom viewing, Omakase experience"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Gallery Image URLs (Comma separated)</label>
                <input
                  type="text"
                  value={formData.galleryString}
                  onChange={(e) => setFormData(prev => ({ ...prev, galleryString: e.target.value }))}
                  className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                  placeholder="https://images.unsplash.com/..., https://images.unsplash.com/..."
                />
              </div>

              {formData.coverImage && (
                <div className="border border-cream-200 rounded-xl p-4 flex flex-col items-center gap-2 bg-cream-100/10">
                  <span className="text-xs font-semibold text-charcoal-800/50 uppercase">Preview Cover Image</span>
                  <img src={formData.coverImage} alt="Cover Preview" className="h-40 w-full object-cover rounded-lg border border-cream-200" />
                </div>
              )}

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
                  {modalMode === "add" ? "Create Destination" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
