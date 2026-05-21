"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchDestinations, saveDestination, deleteDestination, uploadImage } from "@/lib/db";
import MediaSelectorModal from "@/components/dashboard/MediaSelectorModal";
import { Plus, Edit2, Trash2, Search, X, Loader2, Image as ImageIcon } from "lucide-react";

export default function DestinationsCMS() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
        <Link
          href="/dashboard/destinations/add"
          className="bg-charcoal-900 text-white px-4 py-2.5 rounded-md text-sm hover:bg-gold-600 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={16} /> Add Destination
        </Link>
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
                        <Link 
                          href={`/dashboard/destinations/edit/${dest.id}`}
                          className="p-2 text-charcoal-400 hover:text-gold-600 hover:bg-cream-100 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </Link>
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
    </div>
  );
}
