"use client";

import { useState, useEffect } from "react";
import { fetchMediaAssets, uploadImage, deleteMediaAsset } from "@/lib/db";
import { 
  Plus, Trash2, Search, Loader2, Image as ImageIcon,
  CheckCircle2, AlertCircle, Copy, Check, Filter, UploadCloud, X, Maximize2, ChevronDown
} from "lucide-react";

export default function MediaLibraryPage() {
  const [mediaAssets, setMediaAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDropdownOpen, setBulkDropdownOpen] = useState(false);
  const [previewAsset, setPreviewAsset] = useState(null);

  // Filters
  const [dateFilter, setDateFilter] = useState("all"); // "all", "newest", "oldest"
  const [usageFilter, setUsageFilter] = useState("all"); // "all", "assigned", "unassigned"
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    try {
      setLoading(true);
      const assets = await fetchMediaAssets();
      setMediaAssets(assets);
    } catch (err) {
      console.error("Failed to load media assets", err);
      showToast("error", "Failed to load media library.");
    } finally {
      setLoading(false);
    }
  }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      await uploadImage(file);
      showToast("success", "Image uploaded successfully.");
      await loadMedia(); // Reload to get the new list with metadata
    } catch (error) {
      console.error("Upload failed:", error);
      showToast("error", "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = async (asset) => {
    let message = `Are you sure you want to delete ${asset.name}?`;
    if (asset.usage === "ASSIGNED") {
      message += `\n\n⚠️ IMPORTANT: This image is currently referenced in:`;
      if (asset.usageDetails && asset.usageDetails.length > 0) {
        asset.usageDetails.forEach(detail => {
          message += `\n- ${detail}`;
        });
      } else {
        message += `\n- Unknown page/content`;
      }
      message += `\n\nDeleting it will remove it from these areas. Do you want to proceed?`;
    } else {
      message += ` This action cannot be undone.`;
    }

    if (!confirm(message)) return;
    
    try {
      setDeletingId(asset.id);
      await deleteMediaAsset(asset.name, asset.url);
      setMediaAssets(prev => prev.filter(m => m.id !== asset.id));
      setSelectedIds(prev => prev.filter(id => id !== asset.id));
      showToast("success", "Image deleted successfully.");
    } catch (error) {
      console.error("Delete failed:", error);
      showToast("error", "Failed to delete image.");
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle selection for a single asset card
  const toggleSelect = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Select all assets matching current processed list
  const handleSelectAll = () => {
    setSelectedIds(processedAssets.map(asset => asset.id));
    showToast("success", `Selected all ${processedAssets.length} matching media items.`);
  };

  // Clear current selection
  const handleClearSelection = () => {
    setSelectedIds([]);
    showToast("success", "Cleared selection.");
  };

  // Bulk deletion handler
  const handleBulkDelete = async () => {
    const assetsToDelete = mediaAssets.filter(m => selectedIds.includes(m.id));
    if (assetsToDelete.length === 0) return;

    // Detect if any assigned assets are selected
    const assignedAssets = assetsToDelete.filter(m => m.usage === "ASSIGNED");
    
    let message = `Are you sure you want to delete ${assetsToDelete.length} selected assets?`;
    if (assignedAssets.length > 0) {
      message += `\n\n⚠️ WARNING: ${assignedAssets.length} of these assets are currently used on your pages:\n`;
      assignedAssets.forEach(asset => {
        message += `- ${asset.name} (used in: ${asset.usageDetails?.join(', ') || 'Unknown'})\n`;
      });
      message += `\nDeleting them will remove them from these public areas. Proceed?`;
    } else {
      message += ` This action cannot be undone.`;
    }

    if (!confirm(message)) return;

    try {
      setLoading(true);
      // Delete selected sequentially to prevent Supabase connection issues
      let count = 0;
      for (const asset of assetsToDelete) {
        await deleteMediaAsset(asset.name, asset.url);
        count++;
      }
      showToast("success", `Successfully deleted ${count} assets.`);
      setSelectedIds([]);
      await loadMedia();
    } catch (error) {
      console.error("Bulk deletion failed:", error);
      showToast("error", "Failed to delete one or more selected assets.");
      await loadMedia();
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = (url, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
    showToast("success", "URL copied to clipboard.");
  };

  const handleBulkCopyUrls = () => {
    if (selectedIds.length === 0) return;
    const urls = mediaAssets
      .filter(asset => selectedIds.includes(asset.id))
      .map(asset => asset.url)
      .join("\n");
    navigator.clipboard.writeText(urls);
    showToast("success", `${selectedIds.length} URL(s) copied to clipboard.`);
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  };

  // Filter and Sort Logic
  let processedAssets = mediaAssets.filter(asset => {
    const matchSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchUsage = usageFilter === "all" || asset.usage.toLowerCase() === usageFilter.toLowerCase();
    return matchSearch && matchUsage;
  });

  if (dateFilter === "oldest") {
    processedAssets = [...processedAssets].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } else if (dateFilter === "newest") {
    processedAssets = [...processedAssets].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return (
    <div className="space-y-8 min-h-screen relative pb-16 text-brand-ink">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border animate-in fade-in slide-in-from-bottom-4 ${
          toast.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <div className="text-xs font-semibold tracking-wide uppercase">{toast.message}</div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 pb-6 border-b border-brand-border animate-in fade-in slide-in-from-top-4 duration-300">
        <div>
          <span className="text-[10px] font-bold tracking-[0.3em] text-brand-mustard uppercase block mb-2 font-sans">
            ASSET MANAGEMENT
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-brand-ink leading-tight tracking-tight">
            Media Library
          </h1>
          <p className="text-brand-muted text-sm mt-2 max-w-xl font-light">
            Manage and organize your visual assets for blogs, destinations, and guides.
          </p>
        </div>
        
        <label className="bg-brand-mustard text-white px-6 py-3 rounded-full text-xs font-bold tracking-[0.2em] uppercase hover:bg-brand-ink transition-all flex items-center justify-center gap-2 self-start md:self-auto cursor-pointer shadow-sm duration-300 transform hover:-translate-y-0.5 active:translate-y-0 font-sans whitespace-nowrap">
          {uploadingImage ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <UploadCloud size={14} className="stroke-[3]" />
          )}
          Upload Image
          <input 
            type="file" 
            accept="image/*,video/*,application/pdf"
            onChange={handleImageUpload}
            className="hidden" 
            disabled={uploadingImage}
          />
        </label>
      </div>

      {/* Bulk Action Panel (Conditionally Visible) */}
      {selectedIds.length > 1 && (
        <div className="bg-brand-mustard-soft/60 border border-brand-mustard/20 p-4 px-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-mustard text-white flex items-center justify-center font-bold text-xs shadow-inner">
              {selectedIds.length}
            </div>
            <div>
              <p className="text-xs font-extrabold text-brand-ink uppercase tracking-wider">Bulk Actions Active</p>
              <p className="text-[10px] text-brand-muted mt-0.5">{selectedIds.length} media items selected</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 border border-brand-mustard/30 text-brand-mustard hover:bg-brand-mustard hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer bg-white"
            >
              Select All ({processedAssets.length})
            </button>
            
            {/* Bulk Actions Button Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setBulkDropdownOpen(!bulkDropdownOpen)}
                className="px-4 py-2 border border-brand-border rounded-xl text-xs font-bold text-brand-ink bg-white hover:bg-brand-bg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                Bulk Actions <ChevronDown size={12} />
              </button>
              {bulkDropdownOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-brand-border rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button 
                    onClick={() => { handleBulkCopyUrls(); setBulkDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs text-brand-ink hover:bg-brand-bg transition-colors cursor-pointer"
                  >
                    Copy Selected URLs
                  </button>
                  <button 
                    onClick={() => { handleClearSelection(); setBulkDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs text-brand-ink hover:bg-brand-bg transition-colors cursor-pointer"
                  >
                    Deselect All
                  </button>
                  <hr className="border-brand-border my-1" />
                  <button 
                    onClick={() => { handleBulkDelete(); setBulkDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer font-semibold"
                  >
                    Delete Selected
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.02)] animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-brand-border flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 bg-brand-bg/30">
          
          {/* Search bar */}
          <div className="relative w-full xl:max-w-xs">
            <input 
              type="text" 
              placeholder="Search media library..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-brand-border rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-brand-mustard focus:ring-1 focus:ring-brand-mustard bg-white transition-all text-brand-ink font-sans placeholder:text-brand-muted/70"
            />
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-brand-muted/80" size={15} />
          </div>

          {/* Filtering row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
            
            {/* Segment Tabs for Usage Filtering (Show All, Assigned, Unassigned) */}
            <div className="flex items-center p-1 bg-brand-bg border border-brand-border rounded-xl w-full sm:w-auto shrink-0 justify-between sm:justify-start">
              <button
                onClick={() => setUsageFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  usageFilter === "all" 
                    ? "bg-brand-mustard text-white shadow-xs" 
                    : "text-brand-muted hover:text-brand-ink"
                }`}
              >
                Show All
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${usageFilter === "all" ? "bg-white/20 text-white" : "bg-brand-border/60 text-brand-ink"}`}>
                  {mediaAssets.length}
                </span>
              </button>
              <button
                onClick={() => setUsageFilter("assigned")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  usageFilter === "assigned" 
                    ? "bg-brand-mustard text-white shadow-xs" 
                    : "text-brand-muted hover:text-brand-ink"
                }`}
              >
                Assigned
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${usageFilter === "assigned" ? "bg-white/20 text-white" : "bg-brand-border/60 text-brand-ink"}`}>
                  {mediaAssets.filter(m => m.usage === "ASSIGNED").length}
                </span>
              </button>
              <button
                onClick={() => setUsageFilter("unassigned")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  usageFilter === "unassigned" 
                    ? "bg-brand-mustard text-white shadow-xs" 
                    : "text-brand-muted hover:text-brand-ink"
                }`}
              >
                Unassigned
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${usageFilter === "unassigned" ? "bg-white/20 text-white" : "bg-brand-border/60 text-brand-ink"}`}>
                  {mediaAssets.filter(m => m.usage === "UNASSIGNED").length}
                </span>
              </button>
            </div>

            {/* Date filter dropdown */}
            <div className="flex items-center gap-2 border border-brand-border rounded-xl px-3 py-2 bg-white w-full sm:w-auto shrink-0 select-none">
              <Filter size={14} className="text-brand-muted shrink-0" />
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="text-xs text-brand-ink bg-transparent focus:outline-none cursor-pointer appearance-none outline-none w-full sm:w-auto pr-4"
              >
                <option value="all">Sort by Date (Default)</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

          </div>

        </div>

        {/* Media Grid */}
        <div className="p-6 bg-[#FCFBF8]">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4 font-sans">
              <div className="brand-loader" style={{ '--s': '12px' }} />
              <p className="text-brand-muted text-[11px] font-bold tracking-widest uppercase animate-pulse">Loading Library...</p>
            </div>
          ) : processedAssets.length === 0 ? (
            <div className="py-24 text-center max-w-sm mx-auto">
              <ImageIcon className="text-brand-border mx-auto mb-4" size={40} />
              <p className="text-brand-ink font-serif text-lg mb-1">No media found</p>
              <p className="text-xs text-brand-muted leading-relaxed">
                {searchQuery || usageFilter !== "all" 
                  ? "Try adjusting your search or filters." 
                  : "Upload images, videos or documents to build your library."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {processedAssets.map((asset) => {
                const isSelected = selectedIds.includes(asset.id);
                return (
                  <div 
                    key={asset.id} 
                    onClick={() => setPreviewAsset(asset)}
                    className={`group relative bg-white border rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300 flex flex-col cursor-zoom-in ${
                      isSelected ? "border-brand-mustard ring-2 ring-brand-mustard/20 scale-[1.01]" : "border-brand-border"
                    }`}
                  >
                    
                    {/* Checkbox circle selector overlay (Google Photos style) */}
                    <div 
                      className={`absolute top-2.5 right-2.5 z-30 transition-all duration-200 ${
                        isSelected 
                          ? "opacity-100 scale-100" 
                          : "opacity-0 group-hover:opacity-100 scale-95 hover:scale-105"
                      }`}
                      onClick={(e) => toggleSelect(asset.id, e)}
                    >
                      {isSelected ? (
                        <div className="w-5.5 h-5.5 rounded-full bg-brand-mustard text-white flex items-center justify-center border border-white shadow-md">
                          <Check size={11} className="stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5.5 h-5.5 rounded-full bg-white/70 hover:bg-white border border-brand-border text-transparent shadow-md transition-all" />
                      )}
                    </div>

                    {/* Image Preview */}
                    <div className="aspect-[4/3] bg-brand-bg relative overflow-hidden flex items-center justify-center">
                      {asset.mimetype.startsWith("image/") ? (
                        <img 
                          src={asset.url} 
                          alt={asset.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-brand-muted">
                          <ImageIcon size={32} />
                          <span className="text-[10px] uppercase font-bold tracking-wider">{asset.mimetype.split('/')[1]}</span>
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 left-2 z-10">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-sans font-bold tracking-wider uppercase border shadow-sm backdrop-blur-md ${
                          asset.usage === "ASSIGNED" 
                            ? "bg-brand-ink text-white border-brand-ink/20" 
                            : "bg-brand-bg text-brand-ink border-brand-border"
                        }`}>
                          {asset.usage}
                        </span>
                      </div>
  
                      {/* Hover Overlay Actions (Copy / Single Delete) */}
                      <div 
                        className="absolute inset-0 bg-brand-ink/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-20"
                        onClick={(e) => e.stopPropagation()} // Prevent card selection when clicking buttons
                      >
                        <button
                          onClick={(e) => handleCopyUrl(asset.url, e)}
                          className="w-9 h-9 bg-white text-brand-ink rounded-full flex items-center justify-center hover:bg-brand-mustard hover:text-white transition-colors cursor-pointer shadow-lg"
                          title="Copy URL"
                        >
                          {copiedUrl === asset.url ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewAsset(asset);
                          }}
                          className="w-9 h-9 bg-white text-brand-ink rounded-full flex items-center justify-center hover:bg-brand-mustard hover:text-white transition-colors cursor-pointer shadow-lg"
                          title="Fullscreen Preview"
                        >
                          <Maximize2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(asset)}
                          disabled={deletingId === asset.id}
                          className="w-9 h-9 bg-white text-brand-ink rounded-full flex items-center justify-center hover:bg-brand-coral hover:text-white transition-colors cursor-pointer shadow-lg disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === asset.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </div>
  
                    {/* Meta Details */}
                    <div className="p-4 flex flex-col gap-2">
                      <div className="font-semibold text-xs text-brand-ink truncate font-sans" title={asset.name}>
                        {asset.name}
                      </div>
                      <div className="flex flex-col gap-1 text-[10px] font-medium text-brand-muted font-sans bg-brand-bg/50 p-2 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="opacity-70">Date:</span>
                          <span className="text-brand-ink font-mono">{formatDate(asset.created_at)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="opacity-70">Size:</span>
                          <span className="text-brand-ink font-mono">{formatBytes(asset.size)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
  
        {/* Footer */}
        {!loading && processedAssets.length > 0 && (
          <div className="p-5 border-t border-brand-border bg-brand-bg/10 flex justify-between items-center text-xs text-brand-muted">
            <span>Displaying {processedAssets.length} of {mediaAssets.length} assets</span>
          </div>
        )}
      </div>

      {/* Premium Full Screen Lightbox Preview Modal */}
      {previewAsset && (
        <div 
          className="fixed inset-0 bg-charcoal-900/90 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-all duration-300 animate-in fade-in"
          onClick={() => setPreviewAsset(null)}
        >
          {/* Close button at top right */}
          <button 
            onClick={() => setPreviewAsset(null)}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-lg z-50 border border-white/10"
            title="Close Preview"
          >
            <X size={24} />
          </button>
          
          {/* Main preview container */}
          <div 
            className="relative max-w-5xl w-full max-h-[85vh] flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-brand-border"
            onClick={(e) => e.stopPropagation()} // Prevent clicking dialog body from closing modal
          >
            
            {/* Visual Media Panel */}
            <div className="flex-1 bg-charcoal-900 flex items-center justify-center min-h-[300px] max-h-[50vh] md:max-h-[85vh] relative">
              {previewAsset.mimetype.startsWith("image/") ? (
                <img 
                  src={previewAsset.url} 
                  alt={previewAsset.name} 
                  className="max-w-full max-h-[85vh] object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 text-white/40">
                  <ImageIcon size={64} />
                  <span className="text-xs uppercase font-extrabold tracking-widest">{previewAsset.mimetype}</span>
                </div>
              )}
            </div>
            
            {/* Sidebar Details Panel */}
            <div className="w-full md:w-80 bg-white p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-brand-border shrink-0">
              <div className="space-y-6">
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[8px] font-sans font-bold tracking-wider uppercase border mb-3 ${
                    previewAsset.usage === "ASSIGNED" 
                      ? "bg-brand-ink text-white border-brand-ink/20" 
                      : "bg-brand-bg text-brand-ink border-brand-border"
                  }`}>
                    {previewAsset.usage}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-brand-ink break-all leading-tight" title={previewAsset.name}>
                    {previewAsset.name}
                  </h3>
                </div>

                <div className="space-y-3.5 bg-brand-bg/50 p-4 rounded-xl text-xs font-sans">
                  <div className="flex justify-between items-center pb-2 border-b border-brand-border/60">
                    <span className="text-brand-muted font-medium">Uploaded:</span>
                    <span className="text-brand-ink font-mono font-semibold">{formatDate(previewAsset.created_at)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-brand-border/60">
                    <span className="text-brand-muted font-medium">Size:</span>
                    <span className="text-brand-ink font-mono font-semibold">{formatBytes(previewAsset.size)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-muted font-medium">Format:</span>
                    <span className="text-brand-ink font-mono font-semibold uppercase">{previewAsset.mimetype.split('/')[1] || "unknown"}</span>
                  </div>
                </div>

                {previewAsset.usage === "ASSIGNED" && (
                  <div className="space-y-2 bg-[#FCFBF8] border border-brand-border p-3.5 rounded-xl">
                    <p className="text-[10px] font-extrabold text-brand-mustard uppercase tracking-wider">Used in Pages:</p>
                    <ul className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {previewAsset.usageDetails?.map((detail, idx) => (
                        <li key={idx} className="text-[11px] text-brand-ink font-semibold flex items-start gap-1.5">
                          <Check size={10} className="text-brand-mustard shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-6 border-t border-brand-border mt-6">
                <button
                  onClick={(e) => handleCopyUrl(previewAsset.url, e)}
                  className="w-full py-2.5 bg-brand-mustard text-white rounded-xl text-xs font-bold hover:bg-brand-ink transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy size={12} />
                  Copy URL
                </button>
                <a
                  href={previewAsset.url}
                  download={previewAsset.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 border border-brand-border hover:bg-brand-bg text-brand-muted hover:text-brand-ink rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  Download Asset
                </a>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
