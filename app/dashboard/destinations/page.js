import { destinations } from "@/data/mockData";
import { Plus, Edit2, Trash2, Search } from "lucide-react";

export default function DestinationsCMS() {
  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif text-charcoal-900 mb-2">Destinations</h1>
          <p className="text-charcoal-800/70 text-sm">Manage your luxury travel destinations and content.</p>
        </div>
        <button className="bg-gold-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gold-500 transition-colors flex items-center gap-2">
          <Plus size={16} /> Add Destination
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-cream-200 overflow-hidden">
        <div className="p-4 border-b border-cream-200 flex justify-between items-center bg-cream-100/30">
          <div className="relative w-full max-w-sm">
            <input 
              type="text" 
              placeholder="Search destinations..." 
              className="w-full border border-cream-200 rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-gold-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-400" size={16} />
          </div>
        </div>

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
              {destinations.map((dest) => (
                <tr key={dest.id} className="hover:bg-cream-100/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-cream-200 flex-shrink-0">
                        <img src={dest.coverImage} alt={dest.country} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-medium text-charcoal-900">{dest.country}</div>
                        <div className="text-xs text-charcoal-800/50">/{dest.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-block px-2 py-1 bg-cream-200 text-charcoal-800 text-xs rounded-md">
                      {dest.region}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-charcoal-800">{dest.blogsCount}</td>
                  <td className="p-4 text-sm text-charcoal-800">{dest.toursCount}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-charcoal-400 hover:text-gold-600 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-charcoal-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-cream-200 flex items-center justify-between text-sm text-charcoal-800/60">
          <div>Showing {destinations.length} destinations</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-cream-200 rounded-md hover:bg-cream-100 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-cream-200 rounded-md hover:bg-cream-100">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
