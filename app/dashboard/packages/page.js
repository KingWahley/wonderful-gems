"use client";

import { useState, useEffect } from "react";
import { fetchPackages, savePackage, deletePackage } from "@/lib/db";
import { Plus, Edit2, Trash2, Search, X, Loader2, PlusCircle, MinusCircle } from "lucide-react";

export default function PackagesCMS() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  
  // Form State
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    price: "",
    shortDescription: "",
    offerings: [""]
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await fetchPackages();
      setPackages(data);
    } catch (e) {
      console.error("Failed to load packages page data", e);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setModalMode("add");
    setFormData({
      id: "",
      title: "",
      price: "",
      shortDescription: "",
      offerings: [""]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg) => {
    setModalMode("edit");
    setFormData({
      id: pkg.id,
      title: pkg.title || "",
      price: pkg.price || "",
      shortDescription: pkg.shortDescription || "",
      offerings: pkg.offerings && pkg.offerings.length > 0 ? [...pkg.offerings] : [""]
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (confirm(`Are you sure you want to delete the package "${title}"?`)) {
      try {
        await deletePackage(id);
        setPackages(packages.filter(p => p.id !== id));
      } catch (e) {
        alert("Failed to delete package: " + e.message);
      }
    }
  };

  const handleOfferingChange = (index, val) => {
    const updatedOfferings = [...formData.offerings];
    updatedOfferings[index] = val;
    setFormData(prev => ({ ...prev, offerings: updatedOfferings }));
  };

  const addOfferingField = () => {
    setFormData(prev => ({ ...prev, offerings: [...prev.offerings, ""] }));
  };

  const removeOfferingField = (index) => {
    const updated = formData.offerings.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, offerings: updated.length > 0 ? updated : [""] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.shortDescription) {
      alert("Title, price, and short description are required.");
      return;
    }

    try {
      setSaving(true);

      const cleanedOfferings = formData.offerings.filter(o => o.trim() !== "");

      const payload = {
        title: formData.title,
        price: formData.price,
        shortDescription: formData.shortDescription,
        offerings: cleanedOfferings
      };

      if (formData.id) {
        payload.id = formData.id;
      }

      await savePackage(payload);
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      alert("Failed to save package: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = packages.filter(p => {
    const matchStr = `${p.title} ${p.price} ${p.shortDescription}`.toLowerCase();
    return matchStr.includes(searchQuery.toLowerCase());
  });

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif text-charcoal-900 mb-2">Planning Packages</h1>
          <p className="text-charcoal-800/70 text-sm">Manage the premium travel consultancy and custom itinerary planning tiers.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-charcoal-900 text-white px-4 py-2.5 rounded-md text-sm hover:bg-gold-600 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={16} /> Add Package Tier
        </button>
      </div>

      {/* Main List Box */}
      <div className="bg-white rounded-xl shadow-sm border border-cream-200 overflow-hidden">
        <div className="p-4 border-b border-cream-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-cream-100/30">
          <div className="relative w-full max-w-sm">
            <input 
              type="text" 
              placeholder="Search package tiers..." 
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
            <p className="text-charcoal-800/60 text-sm font-medium">Loading planning packages...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-charcoal-800/60 mb-2 font-medium">No packages found.</p>
            <p className="text-xs text-charcoal-800/40">Create a package tier to display it on the concierge planning page.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-100/50 text-xs uppercase tracking-widest text-charcoal-800/60 border-b border-cream-200">
                  <th className="p-4 font-medium">Package Tier Name</th>
                  <th className="p-4 font-medium">Pricing</th>
                  <th className="p-4 font-medium">Short Description</th>
                  <th className="p-4 font-medium">Features / Offerings Count</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {filtered.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-cream-100/30 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-charcoal-900">{pkg.title}</div>
                    </td>
                    <td className="p-4 text-sm text-charcoal-800">
                      <span className="font-mono text-gold-700 font-bold bg-gold-50 px-2 py-1 rounded border border-gold-200">{pkg.price}</span>
                    </td>
                    <td className="p-4 text-xs text-charcoal-800/60 max-w-xs truncate">
                      {pkg.shortDescription}
                    </td>
                    <td className="p-4 text-sm font-mono text-charcoal-800">
                      {pkg.offerings?.length || 0} features
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(pkg)}
                          className="p-2 text-charcoal-400 hover:text-gold-600 hover:bg-cream-100 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(pkg.id, pkg.title)}
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
          <div>Showing {filtered.length} packages</div>
        </div>
      </div>

      {/* Upsert Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-charcoal-900/65 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-cream-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-cream-200 flex justify-between items-center bg-cream-100/30">
              <h2 className="font-serif text-xl text-charcoal-900 font-bold">
                {modalMode === "add" ? "Create Planning Package Tier" : `Edit ${formData.title}`}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-charcoal-400 hover:text-charcoal-900 hover:bg-cream-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Package Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                    placeholder="e.g. 1-on-1 Consultation"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Price Value *</label>
                  <input
                    type="text"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                    placeholder="e.g. $150 or $450+"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Short Description *</label>
                <input
                  type="text"
                  required
                  value={formData.shortDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                  placeholder="Summarize the planning value in one sentence."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider">Features / Offerings Included</label>
                  <button
                    type="button"
                    onClick={addOfferingField}
                    className="text-xs font-semibold text-gold-700 hover:text-gold-800 flex items-center gap-1 transition-all"
                  >
                    <PlusCircle size={14} /> Add offering line
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.offerings.map((offering, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-charcoal-400 font-mono w-4">{idx + 1}.</span>
                      <input
                        type="text"
                        value={offering}
                        onChange={(e) => handleOfferingChange(idx, e.target.value)}
                        className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                        placeholder={`Offering line #${idx + 1}...`}
                      />
                      <button
                        type="button"
                        onClick={() => removeOfferingField(idx)}
                        className="text-charcoal-400 hover:text-red-500 transition-colors"
                        title="Remove offering line"
                      >
                        <MinusCircle size={18} />
                      </button>
                    </div>
                  ))}
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
                  {modalMode === "add" ? "Create Tier" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
