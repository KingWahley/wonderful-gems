"use client";

import { useState, useEffect } from "react";
import { fetchTours, saveTour, deleteTour, fetchDestinations, fetchMiniGuides, uploadImage } from "@/lib/db";
import { Plus, Edit, Eye, Trash2, Search, X, Loader2, ArrowLeft, ChevronDown, Bell, Upload, Calendar, Compass, Clock, Tag, Download } from "lucide-react";
import dynamic from "next/dynamic";
import ConfirmModal from "@/components/shared/ConfirmModal";
const LocationAutocomplete = dynamic(() => import("@/components/dashboard/LocationAutocomplete"), {
  loading: () => <div className="animate-pulse bg-gray-100 border border-gray-300 h-[38px] rounded-[8px]"></div>,
  ssr: false
});


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

  // Expanded Filter, Sorting & Bulk Selection States
  const [selectedDestination, setSelectedDestination] = useState("All destinations");
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [selectedStatus, setSelectedStatus] = useState("All statuses");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDropdownOpen, setBulkDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Highlighting and Scroll-To logic for searches
  const [highlightedRowId, setHighlightedRowId] = useState(null);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    emoji: "💡",
    variant: "primary",
    confirmLabel: "Confirm",
    onConfirm: () => {}
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDestination, selectedCategory, selectedStatus]);

  // Helper to calculate warm premium HSL backgrounds for country code initials flag
  const getCountryColor = (code) => {
    if (!code) return { backgroundColor: "hsl(35, 45%, 28%)", color: "#FAF8F5" };
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 40) + 20; // 20 to 60 for beautiful warm ochres, golds, terracottas
    const s = 45;
    const l = 28;
    return {
      backgroundColor: `hsl(${h}, ${s}%, ${l}%)`,
      color: '#FAF8F5'
    };
  };

  // Bulk Selection Handlers
  const toggleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (filteredTours) => {
    if (selectedIds.length === filteredTours.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTours.map(t => t.id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) {
      alert("Please select one or more tours first.");
      return;
    }

    if (action === "delete") {
      setConfirmConfig({
        isOpen: true,
        title: "Delete Selected Tours?",
        message: `Are you sure you want to permanently delete the ${selectedIds.length} selected tours? This action is irreversible.`,
        emoji: "🗑️",
        variant: "danger",
        confirmLabel: "Delete",
        onConfirm: async () => {
          try {
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            setLoading(true);
            await Promise.all(selectedIds.map(id => deleteTour(id)));
            setSelectedIds([]);
            await loadData();
          } catch (e) {
            alert("Failed to delete selected tours: " + e.message);
          } finally {
            setLoading(false);
          }
        }
      });
    } else if (action === "publish" || action === "draft" || action === "feature") {
      const displayAction = action === "feature" ? "feature on homepage" : `set to ${action.toUpperCase()}`;
      const titleText = action === "feature" ? "Feature Tours" : action === "publish" ? "Publish Tours" : "Draft Tours";
      const emojiIcon = action === "feature" ? "⭐" : action === "publish" ? "🚀" : "📝";
      
      setConfirmConfig({
        isOpen: true,
        title: `${titleText}?`,
        message: `Are you sure you want to apply ${displayAction} to the ${selectedIds.length} selected tours?`,
        emoji: emojiIcon,
        variant: "primary",
        confirmLabel: "Apply",
        onConfirm: async () => {
          try {
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            setLoading(true);
            await Promise.all(
              selectedIds.map(async (id) => {
                const tour = tours.find(t => t.id === id);
                if (tour) {
                  const payload = {
                    ...tour,
                    status: action === "feature" ? (tour.status || "published") : action,
                    featureOnHomepage: action === "feature" ? "Yes" : (tour.featureOnHomepage || "No")
                  };
                  await saveTour(payload);
                }
              })
            );
            setSelectedIds([]);
            await loadData();
          } catch (e) {
            alert("Failed to update selected tours: " + e.message);
          } finally {
            setLoading(false);
          }
        }
      });
    }
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (tours.length === 0) {
      alert("No tours to export.");
      return;
    }
    const headers = ["Title", "Destination", "City", "Category", "Duration", "Price", "Booking Link", "Status", "Featured"];
    const rows = tours.map(t => {
      return [
        t.title || "",
        t.destination || "",
        t.city || "",
        t.category || "",
        t.duration || "",
        t.price || "",
        t.bookingLink || "",
        t.status || "draft",
        t.featureOnHomepage || "No"
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tours_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
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
    setConfirmConfig({
      isOpen: true,
      title: "Delete Tour?",
      message: `Are you sure you want to permanently delete the tour "${title}"? This action cannot be undone.`,
      emoji: "🗑️",
      variant: "danger",
      confirmLabel: "Delete",
      onConfirm: async () => {
        try {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
          await deleteTour(id);
          setTours(prev => prev.filter(t => t.id !== id));
        } catch (e) {
          alert("Failed to delete tour: " + e.message);
        }
      }
    });
  };

  const handleDestinationChange = (destName, optCode) => {
    const destObj = destinations.find(d => d.country === destName);
    const defaultCity = cityMapping[destName]?.[0] || "";
    setFormData(prev => ({
      ...prev,
      destination: destName,
      countryCode: optCode || (destObj ? destObj.code : ""),
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

    const statusToSave = statusOverride || formData.status || "published";
    const actionText = statusToSave.toLowerCase() === "published" ? "publish this tour" : "save this tour as a draft";
    const emojiIcon = statusToSave.toLowerCase() === "published" ? "🚀" : "📝";

    setConfirmConfig({
      isOpen: true,
      title: statusToSave.toLowerCase() === "published" ? "Publish Tour?" : "Save Draft?",
      message: `Are you sure you want to ${actionText}?`,
      emoji: emojiIcon,
      variant: "primary",
      confirmLabel: statusToSave.toLowerCase() === "published" ? "Publish" : "Save",
      onConfirm: async () => {
        try {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
          setSaving(true);
          const generatedSlug = formData.slug || formData.title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

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
        } catch (error) {
          alert("Failed to save tour: " + error.message);
        } finally {
          setSaving(false);
        }
      }
    });
  };

  const handlePreview = async () => {
    if (!formData.title || !formData.destination || !formData.duration) {
      alert("Title, Destination, and Duration are required.");
      return;
    }

    try {
      setSaving(true);
      const generatedSlug = formData.slug || formData.title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const statusToSave = formData.status || "published";

      const payload = {
        title: formData.title,
        destination: formData.destination,
        countryCode: formData.countryCode.toUpperCase(),
        category: formData.category,
        description: formData.description,
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
      window.open(`/tours/${generatedSlug}`, '_blank');
    } catch (err) {
      alert("Failed to save and preview tour: " + err.message);
    } finally {
      setSaving(false);
    }
  };
  const filtered = tours
    .filter(t => {
      const matchSearch = `${t.title} ${t.destination} ${t.category} ${t.shortDescription} ${t.city || ""}`.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchDestination = true;
      if (selectedDestination !== "All destinations") {
        matchDestination = t.destination === selectedDestination;
      }

      let matchCategory = true;
      if (selectedCategory !== "All categories") {
        matchCategory = t.category === selectedCategory;
      }

      let matchStatus = true;
      if (selectedStatus !== "All statuses") {
        if (selectedStatus.toLowerCase() === "featured") {
          matchStatus = t.featureOnHomepage === "Yes" || t.featureOnHomepage === true;
        } else {
          matchStatus = (t.status || "draft").toLowerCase() === selectedStatus.toLowerCase();
        }
      }

      return matchSearch && matchDestination && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      return new Date(b.created_at || b.id || 0) - new Date(a.created_at || a.id || 0);
    });

  const itemsPerPage = 15;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayedTours = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Highlighting and Scroll-To logic for searches
  useEffect(() => {
    if (typeof window === "undefined" || tours.length === 0) return;
    const searchParams = new URLSearchParams(window.location.search);
    const highlight = searchParams.get("highlight");
    if (!highlight) return;

    // Find the item index in filtered
    const index = filtered.findIndex(t => String(t.id) === String(highlight));
    if (index === -1) return;

    // Determine page (max 15 rows/page)
    const itemPage = Math.ceil((index + 1) / 15);
    setCurrentPage(itemPage);
    setHighlightedRowId(highlight);

    // Perform smooth scroll & flash after a short render delay
    setTimeout(() => {
      const el = document.getElementById(`row-${highlight}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 450);

    // Clean up parameter from URL
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);

    // Remove flash highlight class
    const timer = setTimeout(() => {
      setHighlightedRowId(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [tours, filtered]);

  const pocketGuides = miniGuides.filter(g => g.type === "pocket");
  const itineraryGuides = miniGuides.filter(g => g.type === "itinerary");

  const categories = [...standardCategories];
  if (formData.category && !standardCategories.includes(formData.category)) {
    categories.push(formData.category);
  }

  return (
    <div className="space-y-10 min-h-screen">      {!isFormOpen ? (
        <>
          {/* Editorial Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 pb-6 border-b border-brand-border animate-in fade-in slide-in-from-top-4 duration-300">
            <div>
              <span className="text-[10px] font-bold tracking-[0.3em] text-brand-mustard uppercase block mb-2 font-sans">
                EXPERIENCE CMS
              </span>
              <h1 className="text-4xl md:text-5xl font-serif text-brand-ink leading-tight tracking-tight">
                Tours
              </h1>
              <p className="text-brand-muted text-sm mt-2 max-w-xl font-light">
                Manage curated tours and activities by destination. These appear on the Tours page, destination pages, homepage feature sections and guide-related recommendations.
              </p>
            </div>
            <div className="flex items-center gap-3 font-sans">
              <button 
                onClick={handleExportCSV}
                className="bg-white border border-brand-border text-brand-ink px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider hover:bg-[#FAF8F5] hover:border-brand-mustard transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download size={13} /> Export
              </button>
              <button
                onClick={handleOpenAdd}
                className="bg-[#c7962d] hover:bg-[#b58522] text-white px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus size={14} className="stroke-[3]" /> Add Tour
              </button>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 font-sans">
            {[
              { label: "Total Tours", value: tours.length },
              { label: "Published", value: tours.filter(t => (t.status || "").toLowerCase() === "published").length },
              { label: "Drafts", value: tours.filter(t => (t.status || "").toLowerCase() !== "published").length },
              { label: "Featured", value: tours.filter(t => t.featureOnHomepage === "Yes" || t.featureOnHomepage === true).length }
            ].map((card, idx) => (
              <div key={idx} className="bg-white border border-brand-border/70 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                <span className="text-[10px] font-bold text-brand-muted tracking-wide block mb-1">{card.label}</span>
                <span className="text-3xl font-serif font-bold text-brand-ink">{card.value}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.02)] p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header Row */}
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-brand-border/40 font-sans">
              <h2 className="font-serif font-bold text-lg text-brand-ink">Tours List</h2>
              
              <div className="flex items-center gap-3">
                {selectedIds.length > 1 && (
                  <div className="flex items-center gap-2 border-r border-brand-border/60 pr-3 mr-1 animate-in fade-in duration-200">
                    <span className="text-[11px] text-brand-muted font-sans font-medium">{selectedIds.length} selected</span>
                  </div>
                )}
                
                {/* Bulk Actions Button as requested by layout */}
                {selectedIds.length > 1 && (
                  <div className="relative animate-in fade-in duration-200">
                    <button 
                      onClick={() => setBulkDropdownOpen(!bulkDropdownOpen)}
                      className="px-4 py-2 border border-brand-border rounded-lg text-xs font-bold text-brand-ink hover:bg-brand-bg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      Bulk Actions <ChevronDown size={12} />
                    </button>
                    {bulkDropdownOpen && (
                      <div className="absolute right-0 mt-1 w-40 bg-white border border-brand-border rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                        <button 
                          onClick={() => { handleBulkAction("publish"); setBulkDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs text-brand-ink hover:bg-brand-bg transition-colors cursor-pointer"
                        >
                          Mark as Published
                        </button>
                        <button 
                          onClick={() => { handleBulkAction("draft"); setBulkDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs text-brand-ink hover:bg-brand-bg transition-colors cursor-pointer"
                        >
                          Mark as Draft
                        </button>
                        <button 
                          onClick={() => { handleBulkAction("feature"); setBulkDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs text-brand-ink hover:bg-brand-bg transition-colors cursor-pointer"
                        >
                          Feature on Homepage
                        </button>
                        <hr className="border-brand-border my-1" />
                        <button 
                          onClick={() => { handleBulkAction("delete"); setBulkDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          Delete Selected
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6 font-sans">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
                <input 
                  type="text" 
                  placeholder="Search by tour name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-bg/40 border border-brand-border rounded-lg py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-brand-mustard transition-colors placeholder:text-brand-muted/70 text-brand-ink" 
                />
              </div>

              {/* Destination Dropdown */}
              <div className="relative">
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="w-full bg-brand-bg/40 border border-brand-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-brand-mustard text-brand-ink cursor-pointer appearance-none pr-8"
                >
                  <option value="All destinations">All destinations</option>
                  {Array.from(new Set(tours.map(t => t.destination).filter(Boolean))).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={14} />
              </div>

              {/* Category Dropdown */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-brand-bg/40 border border-brand-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-brand-mustard text-brand-ink cursor-pointer appearance-none pr-8"
                >
                  <option value="All categories">All categories</option>
                  {Array.from(new Set(tours.map(t => t.category).filter(Boolean))).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={14} />
              </div>

              {/* Status Dropdown */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-brand-bg/40 border border-brand-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-brand-mustard text-brand-ink cursor-pointer appearance-none pr-8"
                >
                  <option value="All statuses">All statuses</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Featured">Featured</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={14} />
              </div>
            </div>

            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4 font-sans">
                <div className="brand-loader" style={{ '--s': '12px' }} />
                <p className="text-brand-muted text-[11px] font-bold tracking-widest uppercase animate-pulse">Fetching tours...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-24 text-center max-w-sm mx-auto font-sans">
                <Compass className="text-brand-border mx-auto mb-4" size={40} />
                <p className="text-brand-ink font-serif text-lg mb-1">No tours found</p>
                <p className="text-xs text-brand-muted leading-relaxed">
                  {searchQuery ? "Try refining your search terms or view standard directory." : "Create a fresh tour to populate the database index."}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto font-sans">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brand-bg/40 text-[9px] uppercase tracking-[0.25em] text-brand-muted font-bold border-b border-brand-border">
                      <th className="p-4 w-10">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.length === filtered.length && filtered.length > 0}
                          onChange={() => toggleSelectAll(filtered)}
                          className="rounded border-brand-border text-[#c7962d] focus:ring-[#c7962d] cursor-pointer"
                        />
                      </th>
                      <th className="p-4 font-bold">Tour</th>
                      <th className="p-4 font-bold">Destination</th>
                      <th className="p-4 font-bold">City</th>
                      <th className="p-4 font-bold">Category</th>
                      <th className="p-4 font-bold">Duration</th>
                      <th className="p-4 font-bold">Price</th>
                      <th className="p-4 font-bold">Booking Link</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {displayedTours.map((tour) => {
                      const isDraft = (tour.status || "draft").toLowerCase() === "draft" || (tour.status || "draft").toLowerCase() === "new";
                      return (
                        <tr 
                          id={`row-${tour.id}`}
                          key={tour.id} 
                          className={`transition-colors duration-200 ${
                            String(tour.id) === String(highlightedRowId) ? "animate-row-flash" : ""
                          } ${
                            selectedIds.includes(tour.id)
                              ? "bg-brand-mustard/10"
                              : isDraft
                                ? "bg-brand-mustard-soft/30 hover:bg-brand-mustard-soft/50"
                                : "hover:bg-brand-bg/40 bg-white"
                          }`}
                        >
                          <td className="p-4 align-middle">
                            <input 
                              type="checkbox" 
                              checked={selectedIds.includes(tour.id)}
                              onChange={() => toggleSelectRow(tour.id)}
                              className="rounded border-brand-border text-brand-mustard focus:ring-brand-mustard cursor-pointer"
                            />
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-brand-bg flex-shrink-0 border border-brand-border shadow-2xs group relative">
                                <img src={tour.heroImage || "https://images.unsplash.com/photo-1542044896530-05d85be9b11a?q=80&w=1000&auto=format&fit=crop"} alt={tour.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              </div>
                              <div className="max-w-[280px]">
                                <h3 className="font-serif text-sm font-semibold text-brand-ink leading-snug line-clamp-1">
                                  {tour.title}
                                </h3>
                                <p className="text-[11px] text-brand-muted line-clamp-1 mt-0.5" title={tour.shortDescription || ""}>
                                  {tour.shortDescription || tour.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-xs font-medium text-brand-ink align-middle whitespace-nowrap">
                            {tour.destination}
                          </td>
                          <td className="p-4 text-xs text-brand-muted align-middle whitespace-nowrap">
                            {tour.city || "—"}
                          </td>
                          <td className="p-4 text-xs text-brand-muted align-middle whitespace-nowrap">
                            {tour.category}
                          </td>
                          <td className="p-4 text-xs text-brand-ink font-medium align-middle whitespace-nowrap">
                            {tour.duration || "—"}
                          </td>
                          <td className="p-4 text-xs text-brand-muted align-middle whitespace-nowrap">
                            {tour.price || "—"}
                          </td>
                          <td className="p-4 align-middle whitespace-nowrap">
                            {tour.bookingLink ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 font-sans">
                                Added
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100 font-sans">
                                Missing
                              </span>
                            )}
                          </td>
                          <td className="p-4 align-middle whitespace-nowrap">
                            {(() => {
                              const isFeatured = tour.featureOnHomepage === "Yes" || tour.featureOnHomepage === true;
                              const status = (tour.status || "draft").toLowerCase();
                              if (isFeatured) {
                                return (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider font-sans">
                                    Featured
                                  </span>
                                );
                              }
                              if (status === "published") {
                                return (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-green-50 text-green-700 border border-green-100 uppercase tracking-wider font-sans">
                                    Published
                                  </span>
                                );
                              }
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider font-sans">
                                  Draft
                                </span>
                              );
                            })()}
                          </td>
                          <td className="p-4 text-right align-middle whitespace-nowrap">
                            <div className="flex justify-end items-center gap-1.5">
                              <button 
                                onClick={() => handleOpenEdit(tour)}
                                className="p-1.5 text-brand-muted hover:text-[#c7962d] hover:bg-[#FAF8F5] rounded-md transition-all duration-200 cursor-pointer"
                                title="Edit Tour"
                                type="button"
                              >
                                <Edit size={14} />
                              </button>
                              <a 
                                href={`/tours/${tour.slug || tour.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-brand-muted hover:text-[#c7962d] hover:bg-[#FAF8F5] rounded-md transition-all duration-200 inline-flex items-center justify-center"
                                title="View Live Tour"
                              >
                                <Eye size={14} />
                              </a>
                              <button 
                                onClick={() => handleDelete(tour.id, tour.title)}
                                className="p-1.5 text-brand-muted hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 cursor-pointer"
                                title="Delete Tour"
                                type="button"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between border-t border-brand-border/40 pt-4 mt-4 font-sans text-xs">
                <div className="text-brand-muted font-medium">
                  Showing {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(filtered.length, currentPage * itemsPerPage)} of {filtered.length} entries
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5 font-sans">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="px-3 py-1.5 border border-brand-border rounded-lg text-brand-ink hover:bg-brand-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-semibold cursor-pointer"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                          currentPage === page
                            ? "bg-brand-ink text-white border-brand-ink"
                            : "bg-white text-brand-ink border-brand-border hover:bg-brand-bg"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="px-3 py-1.5 border border-brand-border rounded-lg text-brand-ink hover:bg-brand-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-semibold cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
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
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Destination</label>
                        <LocationAutocomplete
                          value={formData.destination}
                          onChange={(val, code) => handleDestinationChange(val, code)}
                          type="country"
                          placeholder="Type or select a country"
                          className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">City</label>
                        <LocationAutocomplete
                          value={formData.city}
                          onChange={(val) => setFormData(prev => ({ ...prev, city: val }))}
                          type="city"
                          countryContext={formData.destination}
                          placeholder="Type or select a city"
                          className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all font-sans"
                        />
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
                          onClick={handlePreview}
                          disabled={saving}
                          className="w-full bg-brand-mustard text-white text-xs font-bold py-2.5 px-4 rounded-xl uppercase tracking-wider hover:bg-brand-ink transition-colors cursor-pointer shadow-2xs disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {saving && <Loader2 className="animate-spin w-3.5 h-3.5" />}
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
      <ConfirmModal {...confirmConfig} onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))} />
    </div>
  );
}
