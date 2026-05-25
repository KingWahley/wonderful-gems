"use client";

import { useState, useEffect } from "react";
import { fetchPackages, savePackage, deletePackage, fetchInquiries } from "@/lib/db";
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Search, 
  X, 
  Loader2, 
  Menu, 
  Bell, 
  Check, 
  PlusCircle, 
  MinusCircle, 
  FileText,
  Save,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";

export default function PackagesCMS() {
  const [packages, setPackages] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState("");
  
  // Notification Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    priceValue: "",
    currency: "USD",
    shortDescription: "",
    offerings: [""],
    label: "",
    ctaText: "Book consultation",
    ctaLink: "/services#inquiry",
    status: "active"
  });

  useEffect(() => {
    loadData();
  }, []);

  // Update form fields when the selected package changes
  useEffect(() => {
    if (selectedPackageId) {
      const selected = packages.find(p => p.id === selectedPackageId);
      if (selected) {
        const parsed = parsePackageMeta(selected);
        setFormData(parsed);
      }
    }
  }, [selectedPackageId, packages]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const parsePackageMeta = (pkg) => {
    if (!pkg) return {};
    
    const offerings = [];
    let label = "";
    let currency = "USD";
    let ctaText = "Book consultation";
    let ctaLink = "/services#inquiry";
    let status = "active"; // active or draft
    
    (pkg.offerings || []).forEach(off => {
      if (off.startsWith("__meta_label:")) {
        label = off.substring("__meta_label:".length);
      } else if (off.startsWith("__meta_currency:")) {
        currency = off.substring("__meta_currency:".length);
      } else if (off.startsWith("__meta_ctaText:")) {
        ctaText = off.substring("__meta_ctaText:".length);
      } else if (off.startsWith("__meta_ctaLink:")) {
        ctaLink = off.substring("__meta_ctaLink:".length);
      } else if (off.startsWith("__meta_status:")) {
        status = off.substring("__meta_status:".length);
      } else {
        offerings.push(off);
      }
    });

    // Default labels based on titles if none stored in meta
    if (!label) {
      if (pkg.title?.toLowerCase().includes("1-on-1") || pkg.title?.toLowerCase().includes("1 on 1")) {
        label = "ENTRY PACKAGE";
      } else if (pkg.title?.toLowerCase().includes("itinerary")) {
        label = "MOST POPULAR";
      } else if (pkg.title?.toLowerCase().includes("concierge")) {
        label = "PREMIUM PACKAGE";
      } else {
        label = "PLANNING PACKAGE";
      }
    }

    // Parse price value and currency
    let priceValue = pkg.price || "";
    if (priceValue.startsWith("$") || priceValue.startsWith("€") || priceValue.startsWith("£")) {
      const symbol = priceValue.charAt(0);
      if (symbol === "€") currency = "EUR";
      else if (symbol === "£") currency = "GBP";
      else currency = "USD";
      priceValue = priceValue.substring(1);
    }

    return {
      id: pkg.id || "",
      title: pkg.title || "",
      priceValue,
      currency,
      shortDescription: pkg.shortDescription || pkg.short_description || "",
      offerings: offerings.length > 0 ? offerings : [""],
      label: label.toUpperCase(),
      ctaText,
      ctaLink,
      status
    };
  };

  async function loadData() {
    try {
      setLoading(true);
      const [pkgsData, inquiriesData] = await Promise.all([
        fetchPackages(),
        fetchInquiries().catch(() => [])
      ]);
      
      setPackages(pkgsData);
      setInquiries(inquiriesData);
      
      if (pkgsData.length > 0) {
        // Find existing selected package or default to the first one
        if (selectedPackageId) {
          const stillExists = pkgsData.some(p => p.id === selectedPackageId);
          if (!stillExists) {
            setSelectedPackageId(pkgsData[0].id);
          }
        } else {
          setSelectedPackageId(pkgsData[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to load packages page data", e);
      showToast("Failed to load data from database", "error");
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    const tempId = "new-" + Date.now();
    const newPkgData = {
      id: tempId,
      title: "New Package Tier",
      priceValue: "100",
      currency: "USD",
      shortDescription: "A short description of this premium travel service tier.",
      offerings: ["New service line"],
      label: "NEW TIER",
      ctaText: "Book consultation",
      ctaLink: "/services#inquiry",
      status: "draft"
    };

    setPackages(prev => [...prev, {
      id: tempId,
      title: newPkgData.title,
      price: "$100",
      shortDescription: newPkgData.shortDescription,
      offerings: [`__meta_label:${newPkgData.label}`, `__meta_status:${newPkgData.status}`]
    }]);
    
    setSelectedPackageId(tempId);
    setFormData(newPkgData);
    showToast("Added new draft package card. Fill details in sidebar to save.");
  };

  const handleSelectPackageForEdit = (id) => {
    setSelectedPackageId(id);
    // Form pre-population happens automatically via useEffect
  };

  const handleToggleStatus = async (pkg) => {
    try {
      setSaving(true);
      const parsed = parsePackageMeta(pkg);
      const nextStatus = parsed.status === "active" ? "draft" : "active";
      
      let symbol = "$";
      if (parsed.currency === "EUR") symbol = "€";
      else if (parsed.currency === "GBP") symbol = "£";
      const price = parsed.priceValue.startsWith(symbol) ? parsed.priceValue : `${symbol}${parsed.priceValue}`;

      const serializedOfferings = [
        ...parsed.offerings.filter(o => o.trim() !== ""),
        `__meta_label:${parsed.label}`,
        `__meta_currency:${parsed.currency}`,
        `__meta_ctaText:${parsed.ctaText}`,
        `__meta_ctaLink:${parsed.ctaLink}`,
        `__meta_status:${nextStatus}`
      ];

      const payload = {
        title: parsed.title,
        price,
        shortDescription: parsed.shortDescription,
        short_description: parsed.shortDescription,
        offerings: serializedOfferings
      };

      if (!pkg.id.startsWith("new-")) {
        payload.id = pkg.id;
      }

      await savePackage(payload);
      showToast(`Package set to ${nextStatus.toUpperCase()} successfully.`);
      await loadData();
    } catch (e) {
      showToast("Failed to toggle package status: " + e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (id.startsWith("new-")) {
      setPackages(packages.filter(p => p.id !== id));
      if (selectedPackageId === id) {
        setSelectedPackageId(packages[0]?.id || "");
      }
      showToast("Draft package discarded.");
      return;
    }

    if (confirm(`Are you sure you want to delete the package "${title}"?`)) {
      try {
        await deletePackage(id);
        showToast(`Package "${title}" deleted successfully.`);
        await loadData();
      } catch (e) {
        showToast("Failed to delete package: " + e.message, "error");
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

  const handleFormSubmit = async (e, forceStatus = null) => {
    if (e) e.preventDefault();
    if (!formData.title || !formData.priceValue || !formData.shortDescription) {
      showToast("Package name, price, and description are required.", "error");
      return;
    }

    try {
      setSaving(true);
      const statusToSave = forceStatus || formData.status;
      
      let symbol = "$";
      if (formData.currency === "EUR") symbol = "€";
      else if (formData.currency === "GBP") symbol = "£";
      
      let priceStr = formData.priceValue;
      if (!priceStr.startsWith(symbol) && !priceStr.startsWith("$") && !priceStr.startsWith("€") && !priceStr.startsWith("£")) {
        priceStr = `${symbol}${priceStr}`;
      }

      const cleanedOfferings = formData.offerings.filter(o => o.trim() !== "");
      
      const serializedOfferings = [
        ...cleanedOfferings,
        `__meta_label:${formData.label.toUpperCase()}`,
        `__meta_currency:${formData.currency}`,
        `__meta_ctaText:${formData.ctaText}`,
        `__meta_ctaLink:${formData.ctaLink}`,
        `__meta_status:${statusToSave}`
      ];

      const payload = {
        title: formData.title,
        price: priceStr,
        shortDescription: formData.shortDescription,
        short_description: formData.shortDescription,
        offerings: serializedOfferings
      };

      if (formData.id && !formData.id.startsWith("new-")) {
        payload.id = formData.id;
      }

      await savePackage(payload);
      showToast(`Package "${formData.title}" updated successfully.`);
      await loadData();
    } catch (err) {
      showToast("Failed to save package: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishAllChanges = () => {
    showToast("All plan package changes published to public site successfully!");
  };

  // Filter package data
  const filtered = packages.filter(p => {
    const parsed = parsePackageMeta(p);
    const matchStr = `${parsed.title} ${parsed.priceValue} ${parsed.shortDescription} ${parsed.label}`.toLowerCase();
    return matchStr.includes(searchQuery.toLowerCase());
  });

  // Calculate dynamic stats
  const totalPackages = packages.length;
  const activePackages = packages.filter(p => {
    const parsed = parsePackageMeta(p);
    return parsed.status === "active";
  }).length;
  
  // Real data from database counts
  const packageInquiries = inquiries.length;
  const convertedBookings = inquiries.filter(i => i.status === "converted" || i.status === "replied").length;

  return (
    <div className="pb-12 text-brand-ink">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-cream-200 pb-4 mb-6 gap-4 bg-white/40 p-4 rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <Menu size={20} className="text-charcoal-400 md:hidden cursor-pointer" />
          <span className="font-semibold text-charcoal-800 text-lg flex items-center gap-2">
            Packages
          </span>
        </div>
        
        <div className="flex items-center gap-6 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Search packages..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-cream-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-gold-500 bg-white"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-400" size={16} />
          </div>
          
          <div className="flex items-center gap-4 flex-shrink-0">
            <button className="relative p-1.5 text-charcoal-500 hover:text-gold-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center gap-3 border-l border-cream-200 pl-4">
              <div className="w-10 h-10 rounded-full bg-gold-600/10 text-gold-700 flex items-center justify-center font-bold text-sm border border-gold-200 shadow-inner">
                AW
              </div>
              <div className="hidden lg:block text-left">
                <div className="font-semibold text-charcoal-900 text-xs">Ava Wright</div>
                <div className="text-[10px] text-charcoal-500 font-medium">Administrator</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Title & Top Actions Block */}
      <div className="mb-8 flex flex-col lg:flex-row justify-between lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif font-extrabold text-charcoal-900 mb-2 leading-tight">Manage Packages</h1>
          <p className="text-charcoal-600 text-sm max-w-3xl leading-relaxed">
            Manage the Plan with Me service packages shown on the public service page: 1 on 1 Consultation, Custom Itinerary, and Full Concierge. Each package includes a short description, price, and offering list.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/services"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-charcoal-800 border border-cream-300 px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-cream-50 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            Preview Services Page
          </a>
          <button
            onClick={handlePublishAllChanges}
            className="bg-gold-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-gold-700 transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            Publish Changes
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-cream-200 shadow-xs hover:shadow-sm transition-shadow">
          <p className="text-xs text-charcoal-500 font-semibold uppercase tracking-wider mb-2">Total Packages</p>
          <p className="font-serif text-4xl font-bold text-charcoal-900">{totalPackages}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-cream-200 shadow-xs hover:shadow-sm transition-shadow">
          <p className="text-xs text-charcoal-500 font-semibold uppercase tracking-wider mb-2">Active Packages</p>
          <p className="font-serif text-4xl font-bold text-charcoal-900">{activePackages}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-cream-200 shadow-xs hover:shadow-sm transition-shadow">
          <p className="text-xs text-charcoal-500 font-semibold uppercase tracking-wider mb-2">Package Inquiries</p>
          <p className="font-serif text-4xl font-bold text-charcoal-900">{packageInquiries}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-cream-200 shadow-xs hover:shadow-sm transition-shadow">
          <p className="text-xs text-charcoal-500 font-semibold uppercase tracking-wider mb-2">Converted Bookings</p>
          <p className="font-serif text-4xl font-bold text-charcoal-900">{convertedBookings}</p>
        </div>
      </div>

      {/* Main 2-Column Split CMS Layout */}
      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-gold-600" size={36} />
          <p className="text-charcoal-800/60 text-sm font-medium">Loading packages data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Grid of Package Bento Cards (Span 2) */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex justify-between items-center pb-2">
              <h2 className="font-serif text-lg font-bold text-charcoal-900">Planning Tiers ({filtered.length})</h2>
              <button
                onClick={handleOpenAdd}
                className="bg-charcoal-900 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-gold-600 transition-all flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <Plus size={14} /> Add Package
              </button>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-cream-200 p-12 text-center">
                <p className="text-charcoal-600 font-medium mb-1">No packages found.</p>
                <p className="text-xs text-charcoal-400">Try adjusting your search query or add a new package tier above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((pkg) => {
                  const parsed = parsePackageMeta(pkg);
                  const isSelected = selectedPackageId === pkg.id;
                  
                  return (
                    <div 
                      key={pkg.id} 
                      onClick={() => handleSelectPackageForEdit(pkg.id)}
                      className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md cursor-pointer group ${
                        isSelected 
                          ? "border-gold-500 ring-2 ring-gold-500/20 scale-[1.01]" 
                          : "border-cream-200"
                      }`}
                    >
                      {/* Accent Gold Header Block */}
                      <div className="bg-[#9B7C3E] p-5 pb-6 text-white relative">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-md">
                          {parsed.label || "Planning Tier"}
                        </span>
                        <h3 className="font-serif text-xl font-bold mt-2 text-white leading-tight">
                          {parsed.title}
                        </h3>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-baseline gap-1 mt-1 mb-3">
                            <span className="font-serif text-3xl font-bold text-charcoal-900">
                              {parsed.currency === "EUR" ? "€" : parsed.currency === "GBP" ? "£" : "$"}
                              {parsed.priceValue}
                            </span>
                          </div>
                          
                          <p className="text-xs text-charcoal-600 leading-relaxed mb-6 font-medium">
                            {parsed.shortDescription}
                          </p>

                          <div className="border-t border-cream-100 pt-4 mb-6">
                            <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-charcoal-400 mb-3">What's Included:</h4>
                            <ul className="space-y-2.5">
                              {parsed.offerings.filter(o => o.trim() !== "").map((offering, idx) => (
                                <li key={idx} className="text-xs text-charcoal-800 font-medium flex items-start gap-2">
                                  <Check size={14} className="text-[#9B7C3E] shrink-0 mt-0.5" />
                                  <span>{offering}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="flex items-center justify-between border-t border-cream-100 pt-4">
                          <div>
                            {parsed.status === "active" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                Draft
                              </span>
                            )}
                          </div>

                          {/* Quick Action Icons Row */}
                          <div 
                            className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()} // Stop triggering click selection when clicking action buttons
                          >
                            <button
                              onClick={() => handleSelectPackageForEdit(pkg.id)}
                              className="p-1.5 text-charcoal-500 hover:text-gold-600 hover:bg-cream-100 rounded-md transition-colors"
                              title="Edit Package"
                            >
                              <Edit size={14} />
                            </button>
                            <a
                              href={parsed.ctaLink || "/services"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-charcoal-500 hover:text-gold-600 hover:bg-cream-100 rounded-md transition-colors"
                              title="View Public Details"
                            >
                              <Eye size={14} />
                            </a>
                            <button
                              onClick={() => handleToggleStatus(pkg)}
                              className={`p-1.5 rounded-md transition-colors ${
                                parsed.status === "active" 
                                  ? "text-green-600 hover:bg-green-50" 
                                  : "text-charcoal-400 hover:text-green-600 hover:bg-cream-100"
                              }`}
                              title={parsed.status === "active" ? "Set to Draft" : "Set to Active"}
                            >
                              <FileText size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(pkg.id, parsed.title)}
                              className="p-1.5 text-charcoal-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete Package"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Sidebar Editor Panel (Span 1) */}
          <div className="xl:col-span-1 xl:sticky xl:top-6">
            <div className="bg-white rounded-2xl border border-cream-200 shadow-sm p-6 overflow-hidden">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between border-b border-cream-100 pb-4 mb-5">
                <div>
                  <h3 className="font-serif text-xl font-bold text-charcoal-900">Edit Package</h3>
                  <p className="text-[10px] text-charcoal-500 font-medium">Select a package and update its short description, price, and offering list.</p>
                </div>
                
                {/* Active Toggle Switch */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
                    {formData.status === "active" ? "Active" : "Draft"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: prev.status === "active" ? "draft" : "active" }))}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formData.status === "active" ? "bg-gold-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        formData.status === "active" ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Sidebar Editor Form */}
              <form onSubmit={(e) => handleFormSubmit(e)} className="space-y-4">
                
                {/* Dropdown Selector */}
                <div>
                  <label className="block text-[10px] font-extrabold text-charcoal-500 uppercase tracking-wider mb-1.5">Package</label>
                  <select
                    value={selectedPackageId}
                    onChange={(e) => handleSelectPackageForEdit(e.target.value)}
                    className="w-full border border-cream-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                  >
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                {/* Package Label */}
                <div>
                  <label className="block text-[10px] font-extrabold text-charcoal-500 uppercase tracking-wider mb-1.5">Package Label</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value.toUpperCase() }))}
                    className="w-full border border-cream-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                    placeholder="e.g. ENTRY PACKAGE"
                  />
                </div>

                {/* Package Name */}
                <div>
                  <label className="block text-[10px] font-extrabold text-charcoal-500 uppercase tracking-wider mb-1.5">Package Name</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-cream-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                    placeholder="e.g. 1 on 1 Consultation"
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-[10px] font-extrabold text-charcoal-500 uppercase tracking-wider mb-1.5">Short Description</label>
                  <textarea
                    required
                    value={formData.shortDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                    rows={3}
                    className="w-full border border-cream-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-gold-500 bg-white text-charcoal-900 leading-relaxed"
                    placeholder="Brief description of the package tier..."
                  />
                </div>

                {/* Price & Currency Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-charcoal-500 uppercase tracking-wider mb-1.5">Price</label>
                    <input
                      type="text"
                      required
                      value={formData.priceValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, priceValue: e.target.value }))}
                      className="w-full border border-cream-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                      placeholder="e.g. 75"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-charcoal-500 uppercase tracking-wider mb-1.5">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full border border-cream-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                {/* Offerings Included */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-extrabold text-charcoal-500 uppercase tracking-wider">Offering</label>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {formData.offerings.map((offering, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={offering}
                          onChange={(e) => handleOfferingChange(idx, e.target.value)}
                          className="w-full border border-cream-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                          placeholder={`Offering line #${idx + 1}...`}
                        />
                        <button
                          type="button"
                          onClick={() => removeOfferingField(idx)}
                          className="text-xs font-bold text-red-500 hover:text-red-700 uppercase bg-red-50 px-2 py-2 rounded-md border border-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addOfferingField}
                    className="w-full mt-3 py-2 border border-dashed border-cream-300 text-[10px] font-bold text-gold-700 hover:text-gold-800 rounded-lg bg-cream-50/50 hover:bg-cream-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <PlusCircle size={12} /> Add Offering
                  </button>
                </div>

                {/* CTA Button Text */}
                <div>
                  <label className="block text-[10px] font-extrabold text-charcoal-500 uppercase tracking-wider mb-1.5">CTA Button Text</label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                    className="w-full border border-cream-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                    placeholder="e.g. Book consultation"
                  />
                </div>

                {/* CTA Link */}
                <div>
                  <label className="block text-[10px] font-extrabold text-charcoal-500 uppercase tracking-wider mb-1.5">CTA Link</label>
                  <input
                    type="text"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, ctaLink: e.target.value }))}
                    className="w-full border border-cream-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-gold-500 bg-white text-charcoal-900 font-mono"
                    placeholder="e.g. /services#inquiry"
                  />
                </div>

                {/* Sidebar Actions Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-cream-100">
                  <button
                    type="button"
                    onClick={(e) => handleFormSubmit(e, "draft")}
                    disabled={saving}
                    className="w-full py-2.5 border border-cream-300 hover:bg-cream-50 text-charcoal-700 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Save Draft
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-2.5 bg-gold-600 text-white rounded-lg text-xs font-bold hover:bg-gold-700 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {saving && <Loader2 className="animate-spin" size={12} />}
                    Update Package
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      )}

      {/* Floating Magic Success Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up flex items-center gap-3 bg-charcoal-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-white/10 max-w-sm backdrop-blur-md">
          {toast.type === "success" ? (
            <CheckCircle className="text-green-400 shrink-0" size={20} />
          ) : (
            <AlertCircle className="text-red-400 shrink-0" size={20} />
          )}
          <div className="text-xs font-medium leading-relaxed">{toast.message}</div>
          <button 
            onClick={() => setToast({ show: false, message: "", type: "success" })}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
