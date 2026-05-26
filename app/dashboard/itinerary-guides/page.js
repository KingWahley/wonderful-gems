"use client";

import { useState, useEffect } from "react";
import { fetchMiniGuides, saveMiniGuide, deleteMiniGuide, fetchDestinations, uploadImage } from "@/lib/db";
import MediaSelectorModal from "@/components/dashboard/MediaSelectorModal";
import dynamic from "next/dynamic";
const LocationAutocomplete = dynamic(() => import("@/components/dashboard/LocationAutocomplete"), {
  loading: () => <div className="animate-pulse bg-gray-100 border border-gray-300 h-[38px] rounded-[8px]"></div>,
  ssr: false
});

import { 
  Plus, Edit, Eye, Trash2, Search, X, Loader2, Image as ImageIcon,
  Sparkles, BookOpen, Menu, Bell, ArrowLeft, Upload, Check, Globe, HelpCircle,
  ChevronDown, Calendar, Clock, Compass, MapPin, Sparkle, ArrowRight, Info, Download
} from "lucide-react";

// Initial state for day structures matching DB seeds exactly
const defaultDay = (num = "01") => ({
  dayNum: num,
  city: "",
  title: "",
  color: "yellow",
  essence: "",
  whatToDo: "",
  stayName: "",
  stayTier: "Mid-range",
  stayDesc: "",
  eatDrinkName: "",
  eatDrinkDesc: "",
  transitionTo: "",
  transitionTime: "",
  tip: ""
});

const defaultDetails = {
  pocketTitle: "",
  itineraryTitle: "",
  blogCountText: "",
  introText: "",
  introHtml: "",
  routeTitle: "",
  routeFlow: "",
  bestTimeToVisit: "March to May & Oct to Nov",
  idealDuration: "4-5 Days",
  budgetLevel: "Mid-range",
  readTime: "10 Min",
  noOfDays: "7",
  featured: "no",
  seoTitle: "",
  metaDescription: "",
  days: [defaultDay("01")],
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
    introText: d.introText || "",
    introHtml: d.introHtml || "",
    routeTitle: d.routeTitle || "",
    routeFlow: d.routeFlow || "",
    bestTimeToVisit: d.bestTimeToVisit || "March to May & Oct to Nov",
    idealDuration: d.idealDuration || "4-5 Days",
    budgetLevel: d.budgetLevel || "Mid-range",
    readTime: d.readTime || "10 Min",
    noOfDays: d.noOfDays || "7",
    featured: d.featured || "no",
    seoTitle: d.seoTitle || "",
    metaDescription: d.metaDescription || "",
    days: Array.isArray(d.days) && d.days.length > 0
      ? d.days.map((day, idx) => ({
          dayNum: day.dayNum || String(idx + 1).padStart(2, "0"),
          city: day.city || "",
          title: day.title || "",
          color: day.color || "yellow",
          essence: day.essence || "",
          whatToDo: day.whatToDo || "",
          stayName: day.stayName || "",
          stayTier: day.stayTier || "Mid-range",
          stayDesc: day.stayDesc || "",
          eatDrinkName: day.eatDrinkName || "",
          eatDrinkDesc: day.eatDrinkDesc || "",
          transitionTo: day.transitionTo || "",
          transitionTime: day.transitionTime || "",
          tip: day.tip || ""
        }))
      : [defaultDay("01")],
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

export default function ItineraryGuidesCMS() {
  const [guides, setGuides] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  
  // Form State
  const [formData, setFormData] = useState({
    id: "",
    slug: "",
    destination: "",
    countryCode: "",
    title: "",
    excerpt: "",
    heroImage: "",
    status: "draft",
    details: defaultDetails
  });

  const [selectedDestination, setSelectedDestination] = useState("All destinations");
  const [selectedStatus, setSelectedStatus] = useState("All statuses");
  const [selectedSort, setSelectedSort] = useState("Sort by newest");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDropdownOpen, setBulkDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Highlighting and Scroll-To logic for searches
  const [highlightedRowId, setHighlightedRowId] = useState(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDestination, selectedStatus, selectedSort]);

  // Helper to clean and format dates (e.g. October 2025)
  const getDisplayDate = (guide) => {
    let dateStr = guide.details?.date || guide.date || "";
    if (dateStr.includes("·")) {
      const parts = dateStr.split("·").map(p => p.trim());
      dateStr = parts[parts.length - 1];
    } else if (dateStr.includes("•")) {
      const parts = dateStr.split("•").map(p => p.trim());
      dateStr = parts[parts.length - 1];
    }
    
    if (dateStr) {
      return dateStr.toLowerCase().replace(/\b[a-z]/g, letter => letter.toUpperCase());
    }
    if (guide.created_at) {
      return new Date(guide.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return "October 2025";
  };

  // Helper to infer travel type dynamically
  const inferTravelType = (guide) => {
    if (guide.details?.travelType) return guide.details.travelType;
    const dest = (guide.destination || "").toLowerCase();
    const route = (guide.details?.routeFlow || "").toLowerCase();
    if (dest.includes("portugal") || dest.includes("italy") || route.includes("lisbon") || route.includes("rome")) {
      return "Train + Car";
    }
    return "Train";
  };

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

  const toggleSelectAll = (filteredGuides) => {
    if (selectedIds.length === filteredGuides.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredGuides.map(g => g.id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) {
      alert("Please select one or more guides first.");
      return;
    }

    if (action === "delete") {
      if (confirm(`Are you sure you want to delete ${selectedIds.length} selected guides?`)) {
        try {
          setLoading(true);
          await Promise.all(selectedIds.map(id => deleteMiniGuide(id)));
          setSelectedIds([]);
          await loadData();
        } catch (e) {
          alert("Failed to delete selected guides: " + e.message);
        } finally {
          setLoading(false);
        }
      }
    } else if (action === "publish" || action === "draft") {
      if (confirm(`Change status of ${selectedIds.length} selected guides to ${action.toUpperCase()}?`)) {
        try {
          setLoading(true);
          await Promise.all(
            selectedIds.map(async (id) => {
              const guide = guides.find(g => g.id === id);
              if (guide) {
                const payload = {
                  ...guide,
                  status: action
                };
                await saveMiniGuide(payload);
              }
            })
          );
          setSelectedIds([]);
          await loadData();
        } catch (e) {
          alert("Failed to update status: " + e.message);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (guides.length === 0) {
      alert("No itinerary guides to export.");
      return;
    }
    const headers = ["Title", "Slug", "Destination", "Country Code", "Days Count", "Read Time", "Travel Type", "Status"];
    const rows = guides.map(g => {
      const daysCount = g.details?.days?.length || parseInt(g.details?.noOfDays) || 0;
      const travelType = g.details?.travelType || inferTravelType(g);
      return [
        g.title || "",
        g.slug || "",
        g.destination || "",
        g.countryCode || "",
        daysCount,
        g.details?.readTime || "10 Min",
        travelType,
        g.status || "draft"
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `itinerary_guides_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [uploadingImage, setUploadingImage] = useState(false);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);

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
      // Filter only itinerary guides
      const itineraryGuides = guidesData.filter(g => g.type === "itinerary");
      setGuides(itineraryGuides);
      setDestinations(destinationsData);
    } catch (e) {
      console.error("Failed to load itinerary guides page data", e);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setModalMode("add");
    const defaultDest = destinations[0]?.country || "";
    const defaultCode = destinations[0]?.code || destinations[0]?.country_code || "";
    
    setFormData({
      id: "",
      slug: "",
      destination: defaultDest,
      countryCode: defaultCode.toUpperCase(),
      title: "",
      excerpt: "",
      heroImage: "",
      status: "draft",
      details: {
        ...defaultDetails,
        bestTimeToVisit: "March to May & Oct to Nov",
        idealDuration: "4-5 Days",
        budgetLevel: "Mid-range",
        readTime: "10 Min",
        noOfDays: "7"
      }
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (guide) => {
    setModalMode("edit");
    const mergedDetails = mergeWithDefaults(guide.details);
    setFormData({
      id: guide.id,
      slug: guide.slug || "",
      destination: guide.destination || "",
      countryCode: (guide.countryCode || guide.country_code || "").toUpperCase(),
      title: guide.title || "",
      excerpt: guide.excerpt || "",
      heroImage: guide.heroImage || "",
      status: guide.status || "draft",
      details: mergedDetails
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

  const handleDestinationChange = (destName, optCode) => {
    const destObj = destinations.find(d => d.country === destName);
    const countryCode = optCode || (destObj ? (destObj.code || destObj.country_code || "") : "");
    setFormData(prev => ({
      ...prev,
      destination: destName,
      countryCode: countryCode.toUpperCase()
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

  // Day Dynamic Helpers
  const updateDayField = (idx, field, val) => {
    setFormData(prev => {
      const days = [...prev.details.days];
      days[idx] = { ...days[idx], [field]: val };
      return {
        ...prev,
        details: { ...prev.details, days }
      };
    });
  };

  const addDayItem = () => {
    setFormData(prev => {
      const days = [...prev.details.days];
      const nextNum = String(days.length + 1).padStart(2, "0");
      days.push(defaultDay(nextNum));
      return {
        ...prev,
        details: { ...prev.details, days }
      };
    });
  };

  const removeDayItem = (idx) => {
    setFormData(prev => {
      let days = prev.details.days.filter((_, i) => i !== idx);
      // Re-index day numbers sequentially
      days = days.map((day, i) => ({
        ...day,
        dayNum: String(i + 1).padStart(2, "0")
      }));
      return {
        ...prev,
        details: { ...prev.details, days }
      };
    });
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title || !formData.slug || !formData.destination) {
      alert("Title, slug, and destination are required.");
      return;
    }

    try {
      setSaving(true);

      const computedCountry = formData.details.country || formData.destination || "";
      const computedDays = formData.details.days?.length || parseInt(formData.details.noOfDays) || 7;

      const payload = {
        type: "itinerary",
        slug: formData.slug.toLowerCase().trim().replace(/\s+/g, "-"),
        destination: formData.destination,
        countryCode: formData.countryCode.toUpperCase(),
        title: formData.title,
        excerpt: formData.excerpt,
        status: formData.status || "draft",
        heroImage: formData.heroImage || "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=2000&auto=format&fit=crop",
        details: {
          ...formData.details,
          // Automate structural fields matching details.js template exactly
          pocketTitle: formData.details.pocketTitle || `${computedCountry.toUpperCase()} MINI GUIDE • POCKET VERSION`,
          itineraryTitle: formData.details.itineraryTitle || `${computedDays} DAYS IN ${computedCountry.toUpperCase()} • FULL ITINERARY`,
          blogCountText: formData.details.blogCountText || `3 POSTS FROM ${computedCountry.toUpperCase()}`,
          introText: formData.details.introText || "",
          routeTitle: formData.details.routeTitle || `${computedDays}-day route`,
          routeFlow: formData.details.routeFlow || formData.details.days?.map(d => d.city).filter(Boolean).join(", ") || ""
        }
      };

      if (formData.id) {
        payload.id = formData.id;
      }

      await saveMiniGuide(payload);
      await loadData();
      setIsFormOpen(false);
    } catch (err) {
      alert("Failed to save itinerary guide: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = guides
    .filter(g => {
      const matchSearch = `${g.title} ${g.destination} ${g.excerpt} ${g.details?.routeFlow}`.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchDestination = true;
      if (selectedDestination !== "All destinations") {
        matchDestination = g.destination === selectedDestination;
      }

      let matchStatus = true;
      if (selectedStatus !== "All statuses") {
        matchStatus = (g.status || "draft").toLowerCase() === selectedStatus.toLowerCase();
      }

      return matchSearch && matchDestination && matchStatus;
    })
    .sort((a, b) => {
      if (selectedSort === "Sort by newest") {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (selectedSort === "Sort by oldest") {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (selectedSort === "Sort by title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (selectedSort === "Sort by days") {
        const daysA = a.details?.days?.length || parseInt(a.details?.noOfDays) || 0;
        const daysB = b.details?.days?.length || parseInt(b.details?.noOfDays) || 0;
        return daysB - daysA;
      }
      return 0;
    });

  const itemsPerPage = 15;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayedGuides = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Highlighting and Scroll-To logic for searches
  useEffect(() => {
    if (typeof window === "undefined" || guides.length === 0) return;
    const searchParams = new URLSearchParams(window.location.search);
    const highlight = searchParams.get("highlight");
    if (!highlight) return;

    // Find the item index in filtered
    const index = filtered.findIndex(g => String(g.id) === String(highlight));
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
  }, [guides, filtered]);

  return (
    <div className="space-y-10 min-h-screen">
      {!isFormOpen ? (
        <>
          {/* Main Dashboard Archival View */}
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 pb-6 border-b border-brand-border animate-in fade-in slide-in-from-top-4 duration-300">
            <div>
              <span className="text-[10px] font-bold tracking-[0.3em] text-brand-mustard uppercase block mb-2 font-sans">
                ITINERARY ARCHIVE
              </span>
              <h1 className="text-4xl md:text-5xl font-serif text-brand-ink leading-tight tracking-tight">
                Itinerary Guides
              </h1>
              <p className="text-brand-muted text-sm mt-2 max-w-xl font-light">
                Manage route-based mini guides with destination, route, date, title, excerpt, read time, hero image, number of days, route description, day-by-day entries and travel details.
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
                <Plus size={14} className="stroke-[3]" /> Add Itinerary Guide
              </button>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 font-sans">
            {[
              { label: "Total itineraries", value: guides.length },
              { label: "Published", value: guides.filter(g => (g.status || "").toLowerCase() === "published").length },
              { label: "Drafts", value: guides.filter(g => (g.status || "").toLowerCase() !== "published").length },
              { label: "Total Days Planned", value: guides.reduce((acc, g) => acc + (g.details?.days?.length || parseInt(g.details?.noOfDays) || 0), 0) }
            ].map((card, idx) => (
              <div key={idx} className="bg-white border border-brand-border/70 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                <span className="text-[10px] font-bold text-brand-muted tracking-wide block mb-1">{card.label}</span>
                <span className="text-3xl font-serif font-bold text-brand-ink">{card.value}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.02)] p-6">
            {/* Header Row */}
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-brand-border/40 font-sans">
              <h2 className="font-serif font-bold text-lg text-brand-ink">Itinerary Guides List</h2>
              
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
              <div className="relative col-span-1 sm:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
                <input 
                  type="text" 
                  placeholder="Search by title or route..." 
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
                  {Array.from(new Set(guides.map(g => g.destination).filter(Boolean))).map(d => (
                    <option key={d} value={d}>{d}</option>
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
                  <option value="Review">Review</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={14} />
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="w-full bg-brand-bg/40 border border-brand-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-brand-mustard text-brand-ink cursor-pointer appearance-none pr-8"
                >
                  <option value="Sort by newest">Sort by newest</option>
                  <option value="Sort by oldest">Sort by oldest</option>
                  <option value="Sort by title">Sort by title</option>
                  <option value="Sort by days">Sort by days</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={14} />
              </div>
            </div>

            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4 font-sans">
                <div className="brand-loader" style={{ '--s': '12px' }} />
                <p className="text-brand-muted text-[11px] font-bold tracking-widest uppercase animate-pulse">Gathering itineraries...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-24 text-center max-w-sm mx-auto font-sans">
                <BookOpen className="text-brand-border mx-auto mb-4" size={40} />
                <p className="text-brand-ink font-serif text-lg mb-1">No guides found</p>
                <p className="text-xs text-brand-muted leading-relaxed">
                  {searchQuery ? "Try refining your search terms or view standard directory." : "Create a fresh itinerary guide to populate the database index."}
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
                      <th className="p-4 font-bold">Itinerary</th>
                      <th className="p-4 font-bold">Destination</th>
                      <th className="p-4 font-bold">Route</th>
                      <th className="p-4 font-bold">Date</th>
                      <th className="p-4 font-bold">Days</th>
                      <th className="p-4 font-bold">Read Time</th>
                      <th className="p-4 font-bold">Travel Type</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {displayedGuides.map((guide) => {
                      const daysCount = guide.details?.days?.length || parseInt(guide.details?.noOfDays) || 7;
                      const colorStyle = getCountryColor(guide.countryCode || "PT");
                      const isDraft = (guide.status || "draft").toLowerCase() === "draft" || (guide.status || "draft").toLowerCase() === "new";
                      return (
                        <tr 
                          id={`row-${guide.id}`}
                          key={guide.id} 
                          className={`transition-colors duration-200 ${
                            String(guide.id) === String(highlightedRowId) ? "animate-row-flash" : ""
                          } ${
                            selectedIds.includes(guide.id)
                              ? "bg-brand-mustard/10"
                              : isDraft
                                ? "bg-brand-mustard-soft/30 hover:bg-brand-mustard-soft/50"
                                : "hover:bg-brand-bg/40 bg-white"
                          }`}
                        >
                          <td className="p-4 align-middle">
                            <input 
                              type="checkbox" 
                              checked={selectedIds.includes(guide.id)}
                              onChange={() => toggleSelectRow(guide.id)}
                              className="rounded border-brand-border text-brand-mustard focus:ring-brand-mustard cursor-pointer"
                            />
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold tracking-wider text-xs font-serif"
                                style={colorStyle}
                              >
                                {guide.countryCode || "PT"}
                              </div>
                              <div className="max-w-[280px]">
                                <h3 className="font-serif text-sm font-semibold text-brand-ink leading-snug line-clamp-1">
                                  {guide.title}
                                </h3>
                                <p className="text-[11px] text-brand-muted line-clamp-1 mt-0.5" title={guide.excerpt}>
                                  {guide.excerpt}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-xs font-medium text-brand-ink align-middle whitespace-nowrap">
                            {guide.destination}
                          </td>
                          <td className="p-4 text-xs text-brand-muted align-middle max-w-[220px] truncate" title={guide.details?.routeFlow || ""}>
                            {guide.details?.routeFlow || guide.destination}
                          </td>
                          <td className="p-4 text-xs text-brand-muted align-middle whitespace-nowrap">
                            {getDisplayDate(guide)}
                          </td>
                          <td className="p-4 text-xs text-brand-ink font-medium align-middle whitespace-nowrap">
                            {daysCount}
                          </td>
                          <td className="p-4 text-xs text-brand-muted align-middle whitespace-nowrap">
                            {(guide.details?.readTime || "10 Min").toLowerCase()}
                          </td>
                          <td className="p-4 text-xs text-brand-muted align-middle whitespace-nowrap">
                            {inferTravelType(guide)}
                          </td>
                          <td className="p-4 align-middle whitespace-nowrap">
                            {(() => {
                              const status = (guide.status || "draft").toLowerCase();
                              if (status === "published") {
                                return (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
                                    Published
                                  </span>
                                );
                              }
                              if (status === "review") {
                                return (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
                                    Review
                                  </span>
                                );
                              }
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">
                                  Draft
                                </span>
                              );
                            })()}
                          </td>
                          <td className="p-4 text-right align-middle whitespace-nowrap">
                            <div className="flex justify-end items-center gap-1.5">
                              <button 
                                onClick={() => handleOpenEdit(guide)}
                                className="p-1.5 text-brand-muted hover:text-[#c7962d] hover:bg-[#FAF8F5] rounded-md transition-all duration-200 cursor-pointer"
                                title="Edit Guide"
                                type="button"
                              >
                                <Edit size={14} />
                              </button>
                              <a 
                                href={`/mini-guides/${guide.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-brand-muted hover:text-[#c7962d] hover:bg-[#FAF8F5] rounded-md transition-all duration-200 inline-flex items-center justify-center"
                                title="View Live Guide"
                              >
                                <Eye size={14} />
                              </a>
                              <button 
                                onClick={() => handleDelete(guide.id, guide.title)}
                                className="p-1.5 text-brand-muted hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 cursor-pointer"
                                title="Delete Guide"
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
        /* ==================== FORM VIEW (ADD / EDIT) ==================== */
        <div className="bg-[#FAF8F5] -mx-6 -my-10 p-8 min-h-screen text-brand-ink font-sans">
          
          {/* Breadcrumbs Header */}
          <header className="flex flex-col sm:flex-row items-center justify-between border-b border-brand-border bg-white px-8 py-4 mb-8 -mx-8 -mt-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-2 hover:bg-brand-bg rounded-lg transition-colors flex items-center justify-center cursor-pointer text-brand-muted hover:text-brand-ink"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-muted font-sans">
                <span className="uppercase tracking-widest text-[10px] text-brand-muted">Primary Guides</span>
                <span className="text-brand-border">&gt;</span>
                <span className="text-brand-ink uppercase tracking-widest text-[10px] font-bold">
                  {modalMode === "add" ? "ADD ITINERARY GUIDE" : "EDIT ITINERARY GUIDE"}
                </span>
              </div>
            </div>
            
            <div className="relative w-full max-w-xs my-2 sm:my-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-muted" size={14} />
              <input 
                type="text" 
                placeholder="Search itinerary guides..." 
                className="w-full border border-brand-border rounded-lg py-1.5 pl-9 pr-3 text-xs bg-[#fcfbf9] placeholder:text-brand-muted/70 focus:outline-none focus:border-brand-mustard focus:bg-white transition-all text-brand-ink"
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
                  <div className="text-xs font-bold text-brand-ink leading-tight">Ana Wright</div>
                  <div className="text-[9px] text-brand-muted uppercase font-semibold tracking-wider">Administrator</div>
                </div>
              </div>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8 max-w-7xl mx-auto">
            {/* Top Bar Actions */}
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 pb-6">
              <div>
                <h1 className="text-4xl font-serif text-brand-ink tracking-tight font-bold">
                  {modalMode === "add" ? "Add Itinerary Guide" : "Edit Itinerary Guide"}
                </h1>
                <p className="text-brand-muted text-xs mt-2 max-w-2xl font-light leading-relaxed">
                  Build a beautiful, detailed itinerary. Only fields filled out will show on the main page. Fields left blank won't display. Use markdown for text areas.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 bg-white border border-brand-border rounded-xl text-xs font-bold text-brand-ink hover:bg-[#fcfbf9] transition-all cursor-pointer shadow-2xs"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-brand-mustard text-white rounded-xl text-xs font-bold hover:bg-brand-ink transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {saving && <Loader2 className="animate-spin" size={12} />}
                  {(formData.status || "draft").toLowerCase() === "published" ? "Publish Itinerary" : "Save Draft"}
                </button>
              </div>
            </div>

            {/* Main 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Form Cards */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* CARD 1: ITINERARY OVERVIEW */}
                <div className="bg-white rounded-[32px] border border-brand-border p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-brand-ink font-serif">Itinerary Overview</h2>
                    <p className="text-brand-muted text-xs font-light mt-1">Basic details for the itinerary card on the main page and details page hero section.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Destination Selector */}
                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Destination *</label>
                        <LocationAutocomplete
                          value={formData.destination}
                          onChange={(val, code) => handleDestinationChange(val, code)}
                          type="country"
                          placeholder="Type or select a country"
                          className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 font-sans">Country</label>
                        <LocationAutocomplete
                          value={formData.details.country || ""}
                          onChange={(val) => updateDetailField("country", val)}
                          type="country"
                          placeholder="e.g. Spain, Portugal, Italy"
                          className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all font-sans"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Route Summary */}
                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Route</label>
                        <input
                          type="text"
                          value={formData.details.routeFlow || ""}
                          onChange={(e) => updateDetailField("routeFlow", e.target.value)}
                          className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all"
                          placeholder="e.g. Lisbon, Sintra, Porto, Douro Valley"
                        />
                      </div>

                      {/* Title */}
                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Title *</label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={handleTitleChange}
                          className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all"
                          placeholder="e.g. Seven Days in Portugal: A Road Trip Itinerary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Read Time */}
                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Read Time</label>
                        <input
                          type="text"
                          value={formData.details.readTime || ""}
                          onChange={(e) => updateDetailField("readTime", e.target.value)}
                          className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all"
                          placeholder="e.g. 10 Min"
                        />
                      </div>

                      {/* No. of Days */}
                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">No. of Days</label>
                        <input
                          type="text"
                          value={formData.details.noOfDays || ""}
                          onChange={(e) => updateDetailField("noOfDays", e.target.value)}
                          className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all"
                          placeholder="e.g. 7"
                        />
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink cursor-pointer"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                    </div>

                    {/* DYNAMIC HERO SECTION METADATA TAGS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#fcfbf9] rounded-2xl border border-brand-border/60">
                      <div>
                        <label className="block text-[9px] font-bold text-brand-muted uppercase tracking-[0.15em] mb-1.5">Best Time to Visit</label>
                        <input
                          type="text"
                          value={formData.details.bestTimeToVisit || ""}
                          onChange={(e) => updateDetailField("bestTimeToVisit", e.target.value)}
                          className="w-full border border-brand-border rounded-lg p-2 text-xs focus:outline-none focus:border-brand-mustard bg-white"
                          placeholder="e.g. March to May"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-brand-muted uppercase tracking-[0.15em] mb-1.5">Ideal Duration</label>
                        <input
                          type="text"
                          value={formData.details.idealDuration || ""}
                          onChange={(e) => updateDetailField("idealDuration", e.target.value)}
                          className="w-full border border-brand-border rounded-lg p-2 text-xs focus:outline-none focus:border-brand-mustard bg-white"
                          placeholder="e.g. 4-5 Days"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-brand-muted uppercase tracking-[0.15em] mb-1.5">Budget Level</label>
                        <input
                          type="text"
                          value={formData.details.budgetLevel || ""}
                          onChange={(e) => updateDetailField("budgetLevel", e.target.value)}
                          className="w-full border border-brand-border rounded-lg p-2 text-xs focus:outline-none focus:border-brand-mustard bg-white"
                          placeholder="e.g. Mid-range"
                        />
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Excerpt</label>
                      <textarea
                        rows={3}
                        value={formData.excerpt}
                        onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                        className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all resize-none"
                        placeholder="Write a short summary for the itinerary card and listing page."
                      />
                    </div>

                    {/* Intro Text */}
                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Intro Text (Overview Paragraph)</label>
                      <textarea
                        rows={3}
                        value={formData.details.introText || ""}
                        onChange={(e) => updateDetailField("introText", e.target.value)}
                        className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all"
                        placeholder="Write the introduction/overview paragraph displayed in the hero section."
                      />
                    </div>

                    {/* Route Description / HTML overview */}
                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Route Description</label>
                      <textarea
                        rows={4}
                        value={formData.details.introHtml || ""}
                        onChange={(e) => updateDetailField("introHtml", e.target.value)}
                        className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all"
                        placeholder="Describe the route, who it's for, and the best way to travel."
                      />
                    </div>

                    {/* Cover Photo Upload Area */}
                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Hero Image</label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div 
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onClick={() => document.getElementById("file-input").click()}
                          className="flex-1 border-2 border-dashed border-brand-mustard/20 bg-[#FCFBF8] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-mustard hover:bg-[#FAF6EC] transition-all group select-none relative h-40 overflow-hidden"
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
                              <span className="text-xs font-bold text-brand-mustard block mb-1 underline">Upload itinerary hero image</span>
                              <span className="text-[9px] text-brand-muted block max-w-xs leading-normal">
                                Recommended size: 1800 x 1000px. Used on cards and full itinerary page.
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
                        <div className="flex flex-col justify-center shrink-0">
                          <div className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2 text-center">OR</div>
                          <button
                            type="button"
                            onClick={() => setIsMediaSelectorOpen(true)}
                            className="px-5 py-3 border border-brand-border bg-white rounded-xl text-xs font-bold text-brand-ink hover:border-brand-mustard hover:text-brand-mustard transition-all flex items-center justify-center gap-2 shadow-sm"
                          >
                            <ImageIcon size={16} />
                            Select from Library
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={formData.heroImage}
                        onChange={(e) => setFormData(prev => ({ ...prev, heroImage: e.target.value }))}
                        className="mt-2 w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all"
                        placeholder="Or paste direct image cover URL..."
                      />
                    </div>

                    {/* Optional Title Overrides */}
                    <details className="group border border-brand-border/60 rounded-2xl p-4 bg-brand-bg/5">
                      <summary className="list-none flex items-center justify-between font-bold text-[10px] uppercase tracking-wider text-brand-muted cursor-pointer select-none">
                        <span>Custom Text Overrides (Optional)</span>
                        <ChevronDown size={14} className="text-brand-muted transform group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="space-y-4 mt-4 pt-4 border-t border-brand-border/40 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-bold text-brand-muted uppercase tracking-wider mb-2">Pocket Guide Title</label>
                            <input
                              type="text"
                              value={formData.details.pocketTitle || ""}
                              onChange={(e) => updateDetailField("pocketTitle", e.target.value)}
                              className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink"
                              placeholder="e.g. PORTUGAL MINI GUIDE • POCKET VERSION"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-brand-muted uppercase tracking-wider mb-2">Itinerary Title</label>
                            <input
                              type="text"
                              value={formData.details.itineraryTitle || ""}
                              onChange={(e) => updateDetailField("itineraryTitle", e.target.value)}
                              className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink"
                              placeholder="e.g. 7 DAYS IN PORTUGAL • FULL ITINERARY"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-brand-muted uppercase tracking-wider mb-2">Blog Count/Duration Text</label>
                            <input
                              type="text"
                              value={formData.details.blogCountText || ""}
                              onChange={(e) => updateDetailField("blogCountText", e.target.value)}
                              className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink"
                              placeholder="e.g. 3 POSTS FROM PORTUGAL"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-brand-muted uppercase tracking-wider mb-2">Route Title Override</label>
                            <input
                              type="text"
                              value={formData.details.routeTitle || ""}
                              onChange={(e) => updateDetailField("routeTitle", e.target.value)}
                              className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink"
                              placeholder="e.g. 7-day route"
                            />
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>

                {/* CARD 2: DAY-BY-DAY ITINERARY */}
                <div className="bg-white rounded-[32px] border border-brand-border p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-brand-ink font-serif">Day-by-Day Itinerary</h2>
                    <p className="text-brand-muted text-xs font-light mt-1">Describe, step-by-step, the itinerary activities, places to sleep, places to eat, and tips.</p>
                  </div>

                  <div className="space-y-6">
                    {formData.details.days?.map((day, idx) => (
                      <div key={idx} className="bg-[#FAF8F5]/80 p-6 rounded-2xl border border-brand-border relative space-y-4 animate-in fade-in duration-300">
                        {/* Header day count */}
                        <div className="flex justify-between items-center border-b border-brand-border/60 pb-3">
                          <span className="font-serif font-bold text-base text-brand-ink">
                            Day {idx + 1}
                          </span>
                          {formData.details.days.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDayItem(idx)}
                              className="text-xs font-bold text-brand-coral hover:underline cursor-pointer"
                            >
                              Remove Day
                            </button>
                          )}
                        </div>

                        {/* Grid row 1: City & Title */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-bold text-brand-muted uppercase tracking-wider mb-2 font-sans">City</label>
                            <LocationAutocomplete
                              value={day.city || ""}
                              onChange={(val) => updateDayField(idx, "city", val)}
                              type="city"
                              countryContext={formData.destination}
                              placeholder="e.g. Lisbon"
                              className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-brand-muted uppercase tracking-wider mb-2">Title</label>
                            <input
                              type="text"
                              value={day.title || ""}
                              onChange={(e) => updateDayField(idx, "title", e.target.value)}
                              className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white"
                              placeholder="e.g. Arrival, Alfama, & Fado"
                            />
                          </div>
                        </div>

                        {/* Grid row 2: Today in a sentence */}
                        <div>
                          <label className="block text-[9px] font-bold text-brand-muted uppercase tracking-wider mb-2">Today in a Sentence</label>
                          <input
                            type="text"
                            value={day.essence || ""}
                            onChange={(e) => updateDayField(idx, "essence", e.target.value)}
                            className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white"
                            placeholder="e.g. Explore historic Alfama with its winding streets and a view from the castle."
                          />
                        </div>

                        {/* Grid row 3: Color selection */}
                        <div>
                          <label className="block text-[9px] font-bold text-brand-muted uppercase tracking-wider mb-2">Color Accent</label>
                          <select
                            value={day.color || "yellow"}
                            onChange={(e) => updateDayField(idx, "color", e.target.value)}
                            className="border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white cursor-pointer"
                          >
                            <option value="yellow">Yellow Accent</option>
                            <option value="blue">Blue Accent</option>
                            <option value="green">Green Accent</option>
                            <option value="red">Red Accent</option>
                          </select>
                        </div>

                        {/* Grid row 4: What to do */}
                        <div>
                          <label className="block text-[9px] font-bold text-brand-muted uppercase tracking-wider mb-2">What to Do</label>
                          <textarea
                            rows={3}
                            value={day.whatToDo || ""}
                            onChange={(e) => updateDayField(idx, "whatToDo", e.target.value)}
                            className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white"
                            placeholder="List the major sights & activities for today. Use markdown for lists."
                          />
                        </div>

                        {/* Grid row 5: Where to stay & Sleep Details */}
                        <div className="p-4 bg-white/60 rounded-xl border border-brand-border/40 space-y-3">
                          <span className="block text-[9px] font-bold text-brand-muted uppercase tracking-wider">Accommodation</span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                              <label className="block text-[8px] font-semibold text-brand-muted mb-1">Where to Sleep</label>
                              <input
                                type="text"
                                value={day.stayName || ""}
                                onChange={(e) => updateDayField(idx, "stayName", e.target.value)}
                                className="w-full border border-brand-border rounded-lg p-2 text-xs focus:outline-none focus:border-brand-mustard bg-white"
                                placeholder="e.g. Stay in Chiado or Alfama"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-semibold text-brand-muted mb-1">Hotel Tier</label>
                              <select
                                value={day.stayTier || "Mid-range"}
                                onChange={(e) => updateDayField(idx, "stayTier", e.target.value)}
                                className="w-full border border-brand-border rounded-lg p-2 text-xs focus:outline-none focus:border-brand-mustard bg-white cursor-pointer"
                              >
                                <option value="Budget">Budget</option>
                                <option value="Mid-range">Mid-range</option>
                                <option value="Splurge">Splurge</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[8px] font-semibold text-brand-muted mb-1">Hotel Description</label>
                            <textarea
                              rows={2}
                              value={day.stayDesc || ""}
                              onChange={(e) => updateDayField(idx, "stayDesc", e.target.value)}
                              className="w-full border border-brand-border rounded-lg p-2 text-xs focus:outline-none focus:border-brand-mustard bg-white"
                              placeholder="Hotel description..."
                            />
                          </div>
                        </div>

                        {/* Grid row 6: Where to eat & Drink details */}
                        <div className="p-4 bg-white/60 rounded-xl border border-brand-border/40 space-y-3">
                          <span className="block text-[9px] font-bold text-brand-muted uppercase tracking-wider">Culinary Recommendations</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[8px] font-semibold text-brand-muted mb-1">Where to Eat</label>
                              <input
                                type="text"
                                value={day.eatDrinkName || ""}
                                onChange={(e) => updateDayField(idx, "eatDrinkName", e.target.value)}
                                className="w-full border border-brand-border rounded-lg p-2 text-xs focus:outline-none focus:border-brand-mustard bg-white"
                                placeholder="e.g. Ramiro, Time Out Market, or local tavernas"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-semibold text-brand-muted mb-1">Dining Description</label>
                              <textarea
                                rows={2}
                                value={day.eatDrinkDesc || ""}
                                onChange={(e) => updateDayField(idx, "eatDrinkDesc", e.target.value)}
                                className="w-full border border-brand-border rounded-lg p-2 text-xs focus:outline-none focus:border-brand-mustard bg-white"
                                placeholder="Dining description..."
                              />
                            </div>
                          </div>
                        </div>

                        {/* Grid row 7: Transition parameters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-bold text-brand-muted uppercase tracking-wider mb-2">Next Destination (Transition To)</label>
                            <input
                              type="text"
                              value={day.transitionTo || ""}
                              onChange={(e) => updateDayField(idx, "transitionTo", e.target.value)}
                              className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white"
                              placeholder="e.g. Sintra"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-brand-muted uppercase tracking-wider mb-2">Travel Time (Transition Time)</label>
                            <input
                              type="text"
                              value={day.transitionTime || ""}
                              onChange={(e) => updateDayField(idx, "transitionTime", e.target.value)}
                              className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white"
                              placeholder="e.g. 40 mins travel"
                            />
                          </div>
                        </div>

                        {/* Grid row 8: Practical Tip */}
                        <div>
                          <label className="block text-[9px] font-bold text-brand-muted uppercase tracking-wider mb-2">Tip</label>
                          <textarea
                            rows={2}
                            value={day.tip || ""}
                            onChange={(e) => updateDayField(idx, "tip", e.target.value)}
                            className="w-full border border-brand-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-mustard bg-white"
                            placeholder="Add any practical tips for this day."
                          />
                        </div>

                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addDayItem}
                      className="w-full py-4 border border-dashed border-brand-mustard/30 text-brand-mustard bg-[#FAF8F5] rounded-xl text-xs font-bold uppercase tracking-wider hover:border-brand-mustard hover:bg-[#FAF7EF] transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                    >
                      <Plus size={14} className="stroke-[3]" /> Add Day
                    </button>
                  </div>
                </div>

                {/* CARD 3: OPTIONAL ITINERARY CONTENT BLOCKS */}
                <div className="bg-white rounded-[32px] border border-brand-border p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-brand-ink font-serif">Optional Itinerary Content Blocks</h2>
                    <p className="text-brand-muted text-xs font-light mt-1">Provide extra details to help travelers get the best out of their trip.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Subsection 1: Must-See Sights */}
                    <details className="group border border-brand-border/60 rounded-2xl p-5 bg-[#FAF8F5]/30">
                      <summary className="list-none flex items-center justify-between font-bold text-xs uppercase tracking-wider text-brand-ink cursor-pointer select-none">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-mustard"></span>
                          <span>Must-See Sights</span>
                        </div>
                        <ChevronDown size={16} className="text-brand-muted transform group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="space-y-4 mt-4 pt-4 border-t border-brand-border/40 animate-in fade-in duration-300">
                        <p className="text-[11px] text-brand-muted font-light">List essential landmarks and sights.</p>
                        
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
                    </details>

                    {/* Subsection 2: Stay & Boutique Hotels */}
                    <details className="group border border-brand-border/60 rounded-2xl p-5 bg-[#FAF8F5]/30">
                      <summary className="list-none flex items-center justify-between font-bold text-xs uppercase tracking-wider text-brand-ink cursor-pointer select-none">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-mustard"></span>
                          <span>Stay & Boutique Hotels</span>
                        </div>
                        <ChevronDown size={16} className="text-brand-muted transform group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="space-y-4 mt-4 pt-4 border-t border-brand-border/40 animate-in fade-in duration-300">
                        <p className="text-[11px] text-brand-muted font-light">List hotels for different budget tiers.</p>
                        
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
                    </details>

                    {/* Subsection 3: Curated Experiences */}
                    <details className="group border border-brand-border/60 rounded-2xl p-5 bg-[#FAF8F5]/30">
                      <summary className="list-none flex items-center justify-between font-bold text-xs uppercase tracking-wider text-brand-ink cursor-pointer select-none">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-mustard"></span>
                          <span>Curated Experiences</span>
                        </div>
                        <ChevronDown size={16} className="text-brand-muted transform group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="space-y-4 mt-4 pt-4 border-t border-brand-border/40 animate-in fade-in duration-300">
                        <p className="text-[11px] text-brand-muted font-light">List notable activities or custom tours.</p>
                        
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
                    </details>

                    {/* Subsection 4: What to Eat & Drink */}
                    <details className="group border border-brand-border/60 rounded-2xl p-5 bg-[#FAF8F5]/30">
                      <summary className="list-none flex items-center justify-between font-bold text-xs uppercase tracking-wider text-brand-ink cursor-pointer select-none">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-mustard"></span>
                          <span>What to Eat & Drink</span>
                        </div>
                        <ChevronDown size={16} className="text-brand-muted transform group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="space-y-4 mt-4 pt-4 border-t border-brand-border/40 animate-in fade-in duration-300">
                        <p className="text-[11px] text-brand-muted font-light">List local foods and culinary specialties.</p>
                        
                        <div className="space-y-3">
                          {formData.details.eat && formData.details.eat.length > 0 && (
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
                    </details>

                    {/* Subsection 5: Dining & Restaurants */}
                    <details className="group border border-brand-border/60 rounded-2xl p-5 bg-[#FAF8F5]/30">
                      <summary className="list-none flex items-center justify-between font-bold text-xs uppercase tracking-wider text-brand-ink cursor-pointer select-none">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-mustard"></span>
                          <span>Dining & Restaurants</span>
                        </div>
                        <ChevronDown size={16} className="text-brand-muted transform group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="space-y-4 mt-4 pt-4 border-t border-brand-border/40 animate-in fade-in duration-300">
                        <p className="text-[11px] text-brand-muted font-light">List recommended restaurants and local eateries.</p>
                        
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
                    </details>

                    {/* Subsection 6: Day Trips */}
                    <details className="group border border-brand-border/60 rounded-2xl p-5 bg-[#FAF8F5]/30">
                      <summary className="list-none flex items-center justify-between font-bold text-xs uppercase tracking-wider text-brand-ink cursor-pointer select-none">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-mustard"></span>
                          <span>Day Trips</span>
                        </div>
                        <ChevronDown size={16} className="text-brand-muted transform group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="space-y-4 mt-4 pt-4 border-t border-brand-border/40 animate-in fade-in duration-300">
                        <p className="text-[11px] text-brand-muted font-light">List recommended day trips from this city.</p>
                        
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
                    </details>

                  </div>
                </div>



                {/* CARD 4: PUBLISHING & SEO */}
                <div className="bg-white rounded-[32px] border border-brand-border p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-brand-ink font-serif">Publishing & SEO</h2>
                    <p className="text-brand-muted text-xs font-light mt-1">Configure visibility settings and optimize search engine metadata.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Featured on Homepage */}
                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Featured on Homepage</label>
                        <select
                          value={formData.details.featured || "no"}
                          onChange={(e) => updateDetailField("featured", e.target.value)}
                          className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink cursor-pointer"
                        >
                          <option value="no">No</option>
                          <option value="yes">Yes</option>
                        </select>
                      </div>

                      {/* URL Slug */}
                      <div>
                        <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">URL Slug</label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-xs text-brand-muted font-mono select-none">/mini-guides/</span>
                          <input
                            type="text"
                            required
                            value={formData.slug}
                            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/\s+/g, "-") }))}
                            className="w-full border border-brand-border rounded-xl p-3 pl-28 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink font-mono"
                            placeholder="e.g. 7-days-in-portugal-itinerary-guide"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SEO Title */}
                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">SEO Title</label>
                      <input
                        type="text"
                        value={formData.details.seoTitle || ""}
                        onChange={(e) => updateDetailField("seoTitle", e.target.value)}
                        className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all"
                        placeholder="e.g. Seven Days in Portugal — The Long Way Home"
                      />
                    </div>

                    {/* Meta Description */}
                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Meta Description</label>
                      <textarea
                        rows={3}
                        value={formData.details.metaDescription || ""}
                        onChange={(e) => updateDetailField("metaDescription", e.target.value)}
                        className="w-full border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-mustard bg-white text-brand-ink transition-all resize-none"
                        placeholder="Write a short search description for this itinerary guide."
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Mobile-Style Live Sticky Sidebar */}
              <div className="lg:col-span-4 sticky top-8 space-y-6">
                <div className="bg-white rounded-[32px] border border-brand-border overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.03)] bg-gradient-to-b from-white to-[#FAF8F5]">
                  
                  {/* Photo Container */}
                  <div className="relative h-64 w-full bg-brand-bg overflow-hidden">
                    <img 
                      src={formData.heroImage || "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=2000&auto=format&fit=crop"} 
                      alt="Guide Cover Preview" 
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6">
                      <h3 className="text-2xl font-serif text-white font-bold leading-tight tracking-tight">
                        {formData.title || "Seven Days in Portugal"}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Badge & Meta info */}
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF6EC] text-brand-mustard text-[10px] font-bold rounded-full uppercase tracking-wider border border-brand-mustard/15">
                        ITINERARY GUIDE
                      </span>
                      <p className="text-xs text-brand-muted font-medium">
                        {formData.destination || "Portugal"} / {formData.details.routeFlow || "Lisbon • Sintra • Porto • Douro Valley"}
                      </p>
                    </div>

                    <p className="text-[11px] text-brand-muted italic flex items-start gap-1.5 leading-relaxed bg-[#fcfbf9] p-3 rounded-xl border border-brand-border/40">
                      <Info size={14} className="text-brand-mustard flex-shrink-0 mt-0.5" />
                      <span>Auto-saves details as you write. Only dynamic segments will show on live.</span>
                    </p>

                    {/* Horizontal Destination Pills */}
                    {formData.details.days?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 py-1">
                        {Array.from(new Set(formData.details.days.map(d => d.city).filter(Boolean))).map((city, i) => (
                          <span key={i} className="text-[10px] font-semibold bg-[#F5F2EB] text-[#6E5D3C] px-2.5 py-1 rounded-full uppercase tracking-wide border border-brand-border/60">
                            {city}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Aligned Key Value Dot grid */}
                    <div className="pt-4 border-t border-brand-border space-y-3 font-sans text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-brand-muted">No. of Days</span>
                        <span className="font-semibold text-brand-ink">{formData.details.days?.length || formData.details.noOfDays || "7"} days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-brand-muted">Read Time</span>
                        <span className="text-brand-ink">{formData.details.readTime || "10 min"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-brand-muted">Travel Type</span>
                        <span className="text-brand-ink">
                          {Array.from(new Set(formData.details.travelSegments?.map(s => s.type).filter(Boolean))).join(" / ") || "Train / Car"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-brand-muted">Status</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-brand-ink capitalize">
                          <span className={`w-2 h-2 rounded-full ${formData.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                          {formData.status || "Draft"}
                        </span>
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
                        Preview Itinerary
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="w-full py-3 border border-brand-border bg-white text-brand-ink text-[10px] font-bold tracking-widest uppercase rounded-full hover:bg-brand-bg transition-all duration-200 cursor-pointer flex items-center justify-center"
                      >
                        Back to Itinerary Guides
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
        isOpen={isMediaSelectorOpen}
        onClose={() => setIsMediaSelectorOpen(false)}
        onSelect={(url) => setFormData(prev => ({ ...prev, heroImage: url }))}
      />
    </div>
  );
}
