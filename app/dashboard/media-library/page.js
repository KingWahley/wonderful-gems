"use client";

import { useState, useEffect } from "react";
import { fetchMediaAssets, uploadImage, deleteMediaAsset } from "@/lib/db";
import { 
  Plus, Trash2, Search, Loader2, Image as ImageIcon,
  CheckCircle2, AlertCircle, Copy, Check, Filter, UploadCloud
} from "lucide-react";

export default function MediaLibraryPage() {
  const [mediaAssets, setMediaAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);
  
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
      showToast("success", "Image deleted successfully.");
    } catch (error) {
      console.error("Delete failed:", error);
      showToast("error", "Failed to delete image.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
    showToast("success", "URL copied to clipboard.");
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
    processedAssets = processedAssets.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } else if (dateFilter === "newest") {
    processedAssets = processedAssets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return (
    <div className="space-y-8 min-h-screen relative pb-16">
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

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.02)] animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-brand-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-bg/30">
          
          <div className="relative w-full md:max-w-md">
            <input 
              type="text" 
              placeholder="Search media library..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-brand-border rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-brand-mustard focus:ring-1 focus:ring-brand-mustard bg-white transition-all text-brand-ink font-sans placeholder:text-brand-muted/70"
            />
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-brand-muted/80" size={15} />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 border border-brand-border rounded-xl px-3 py-2 bg-white w-full sm:w-auto">
              <Filter size={14} className="text-brand-muted" />
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="text-xs text-brand-ink bg-transparent focus:outline-none cursor-pointer appearance-none outline-none w-full sm:w-auto"
              >
                <option value="all">Filter by Date (All)</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            <div className="flex items-center gap-2 border border-brand-border rounded-xl px-3 py-2 bg-white w-full sm:w-auto">
              <Filter size={14} className="text-brand-muted" />
              <select 
                value={usageFilter}
                onChange={(e) => setUsageFilter(e.target.value)}
                className="text-xs text-brand-ink bg-transparent focus:outline-none cursor-pointer appearance-none outline-none w-full sm:w-auto"
              >
                <option value="all">Filter by Assigned</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
          </div>

        </div>

        {/* Media Grid */}
        <div className="p-6 bg-[#FCFBF8]">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-brand-mustard" size={32} />
              <p className="text-brand-muted text-xs font-bold tracking-widest uppercase animate-pulse">Loading Library...</p>
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
              {processedAssets.map((asset) => (
                <div key={asset.id} className="group relative bg-white border border-brand-border rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col">
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

                    {/* Hover Overlay Actions */}
                    <div className="absolute inset-0 bg-brand-ink/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-20">
                      <button
                        onClick={() => handleCopyUrl(asset.url)}
                        className="w-9 h-9 bg-white text-brand-ink rounded-full flex items-center justify-center hover:bg-brand-mustard hover:text-white transition-colors cursor-pointer shadow-lg"
                        title="Copy URL"
                      >
                        {copiedUrl === asset.url ? <Check size={16} /> : <Copy size={16} />}
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
              ))}
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
    </div>
  );
}
