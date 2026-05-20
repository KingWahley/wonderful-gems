"use client";

import { useState, useEffect } from "react";
import { fetchMediaAssets } from "@/lib/db";
import { X, Search, Loader2 } from "lucide-react";

export default function MediaSelectorModal({ isOpen, onClose, onSelect }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen]);

  async function loadAssets() {
    try {
      setLoading(true);
      const data = await fetchMediaAssets();
      setAssets(data);
    } catch (error) {
      console.error("Failed to load assets", error);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  // For the selector, we probably only want images for now, or all files depending on usage.
  // The user mainly mentioned "source or pictures when creating a post".
  // Let's show all, but images get previews.
  const filtered = assets.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E0D8] flex justify-between items-center bg-[#FAF8F5]">
          <div>
            <h2 className="text-xl font-bold font-serif text-[#3A2D27]">Select Media</h2>
            <p className="text-xs text-[#8C8374] mt-1">Choose an image from your library.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white border border-[#E5E0D8] rounded-full text-[#8C8374] hover:text-[#3A2D27] hover:bg-gray-50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8C8374]" size={16} />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-[#E5E0D8] rounded-xl py-2 pl-11 pr-4 text-sm bg-[#FAF8F5] placeholder:text-[#8C8374] focus:outline-none focus:border-[#D2A04E] focus:ring-1 focus:ring-[#D2A04E] transition-all text-[#3A2D27] font-sans"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 py-24">
              <Loader2 className="animate-spin text-[#D2A04E]" size={32} />
              <p className="text-[#8C8374] text-xs font-bold tracking-widest uppercase">Loading assets...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-24 text-center">
              <p className="text-[#3A2D27] font-serif text-lg mb-1">No assets found</p>
              <p className="text-xs text-[#8C8374]">Please upload files from the Media Library page.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map(asset => (
                <div 
                  key={asset.name} 
                  onClick={() => {
                    onSelect(asset.url);
                    onClose();
                  }}
                  className="relative group rounded-xl border border-[#E5E0D8] bg-white overflow-hidden cursor-pointer hover:border-[#D2A04E] hover:ring-2 hover:ring-[#D2A04E]/20 transition-all shadow-sm"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                    {asset.mimetype?.includes('image') ? (
                      <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <span className="text-lg font-bold text-gray-400">{asset.name.split('.').pop().toUpperCase()}</span>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-bold text-xs text-[#3A2D27] truncate">{asset.name.replace(/^[a-z0-9-]+_\d+\./i, '...')}</div>
                    <div className="text-[10px] text-[#8C8374] mt-1">{(asset.size / 1024 / 1024).toFixed(1)} MB</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
