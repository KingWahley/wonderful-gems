"use client";

import { useState, useEffect } from "react";
import { fetchInquiries, updateInquiryStatus, deleteInquiry } from "@/lib/db";
import { 
  Search, Mail, Calendar, MessageSquare, Trash2, CheckCircle2, 
  Eye, RefreshCw, X, AlertCircle, Inbox, User, MapPin, DollarSign,
  Send, Loader2
} from "lucide-react";

export default function InquiriesDashboard() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, new, read, replied
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  async function loadInquiries() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchInquiries();
      setInquiries(data || []);
    } catch (err) {
      console.warn("Failed to load inquiries:", err);
      // Give a helpful hint about running the SQL migration if table not found or error is empty
      if (
        !err.message || 
        err.message === "{}" || 
        err.message.includes("relation") || 
        err.message.includes("does not exist") || 
        err.message.includes("42P01")
      ) {
        setError("Database tables are not set up yet. Please execute the SQL queries in 'supabase_tables.sql' in your Supabase SQL Editor first!");
      } else {
        setError("Failed to fetch inquiries: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    setStatusUpdating(true);
    try {
      const updated = await updateInquiryStatus(id, newStatus);
      setInquiries(prev => prev.map(item => item.id === id ? updated : item));
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry(updated);
      }
    } catch (err) {
      console.warn("Failed to update inquiry status:", err);
      alert("Error updating status: " + err.message);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;

    try {
      await deleteInquiry(id);
      setInquiries(prev => prev.filter(item => item.id !== id));
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry(null);
      }
    } catch (err) {
      console.warn("Failed to delete inquiry:", err);
      alert("Error deleting inquiry: " + err.message);
    }
  };

  // Filters
  const filteredInquiries = inquiries.filter(item => {
    const matchesSearch = 
      (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.package || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.destinations || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.message || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && item.status === activeTab;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "new":
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-brand-mustard/15 text-[#c7962d]">New</span>;
      case "read":
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">Read</span>;
      case "replied":
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">Replied</span>;
      default:
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="w-full pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-5 border-b border-brand-border gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-brand-ink flex items-center gap-3">
            <MessageSquare size={22} className="text-[#c7962d]" /> 
            Trip Inquiries
          </h1>
          <p className="text-brand-muted text-xs mt-1">Manage luxury travel inquiries submitted from the Plan With Me page.</p>
        </div>
        <button 
          onClick={loadInquiries} 
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-brand-border text-xs font-bold text-brand-ink rounded-lg hover:bg-brand-bg transition-all shadow-sm shrink-0 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl mb-8 flex items-start gap-4 shadow-sm">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-bold text-red-900 text-sm mb-1">Database Sync Needed</h3>
            <p className="text-red-700 text-xs leading-relaxed mb-4">{error}</p>
            <div className="bg-red-950 text-red-200 p-4 rounded-lg font-mono text-[11px] overflow-x-auto select-all leading-relaxed whitespace-pre-wrap max-w-2xl">
{`CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  package TEXT,
  destinations TEXT,
  dates TEXT,
  budget TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) for traveler privacy
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for safe reruns
DROP POLICY IF EXISTS "Allow public insert to inquiries" ON inquiries;
DROP POLICY IF EXISTS "Allow admin full access to inquiries" ON inquiries;
DROP POLICY IF EXISTS "Allow local dev read/write to inquiries" ON inquiries;

-- Allow travelers to submit their inquiries
CREATE POLICY "Allow public insert to inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

-- Allow admins full access
CREATE POLICY "Allow admin full access to inquiries" ON inquiries
  FOR ALL TO authenticated USING (true);

-- Explicitly grant permissions to public (required for Stitch database proxies and any connection role)
GRANT ALL ON inquiries TO public;

-- (DEVELOPMENT ONLY): If you don't have Auth set up in your CMS layout yet,
-- uncomment this policy to view/manage inquiries locally using the anon key:
-- CREATE POLICY "Allow local dev read/write to inquiries" ON inquiries FOR ALL TO anon USING (true);`}
            </div>
            <p className="text-red-600/80 text-[10px] mt-2">Copy this SQL and paste it into your Supabase SQL Editor, then refresh this page.</p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Main List */}
        <div className="xl:col-span-2 space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-brand-border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Search */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={15} />
              <input 
                type="text" 
                placeholder="Search inquiries..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-brand-bg/50 border border-brand-border rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-[#c7962d] transition-colors" 
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex border border-brand-border rounded-lg p-0.5 bg-brand-bg/50 w-full md:w-auto">
              {[
                { id: "all", label: "All" },
                { id: "new", label: "New" },
                { id: "read", label: "Read" },
                { id: "replied", label: "Replied" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-grow md:flex-grow-0 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeTab === tab.id 
                      ? "bg-white text-brand-ink font-bold shadow-xs border border-brand-border/10" 
                      : "text-brand-muted hover:text-brand-ink"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* List/Table */}
          {loading ? (
            <div className="bg-white border border-brand-border rounded-2xl p-16 flex flex-col items-center justify-center shadow-sm">
              <Loader2 className="animate-spin text-[#c7962d] mb-4" size={32} />
              <span className="text-brand-muted text-xs">Loading inquiries...</span>
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="bg-white border border-brand-border rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-12 h-12 bg-brand-bg rounded-full flex items-center justify-center text-brand-muted mb-4">
                <Inbox size={20} />
              </div>
              <h3 className="font-bold text-brand-ink text-sm mb-1">No inquiries found</h3>
              <p className="text-brand-muted text-xs max-w-xs leading-relaxed">
                {searchTerm ? "Try searching for a different term or clearing your filters." : "Trip submissions will appear here once travelers fill out the form."}
              </p>
            </div>
          ) : (
            <div className="bg-white border border-brand-border rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto scrollbar-luxury">
                <table className="w-full text-left text-xs whitespace-nowrap table-auto">
                  <thead>
                    <tr className="border-b border-brand-border bg-brand-bg/10">
                      <th className="p-4 pt-5 pb-3 font-bold text-brand-muted uppercase tracking-wider">Client</th>
                      <th className="p-4 pt-5 pb-3 font-bold text-brand-muted uppercase tracking-wider">Package</th>
                      <th className="p-4 pt-5 pb-3 font-bold text-brand-muted uppercase tracking-wider">Destinations</th>
                      <th className="p-4 pt-5 pb-3 font-bold text-brand-muted uppercase tracking-wider">Status</th>
                      <th className="p-4 pt-5 pb-3 font-bold text-brand-muted uppercase tracking-wider">Date</th>
                      <th className="p-4 pt-5 pb-3 font-bold text-brand-muted uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/40">
                    {filteredInquiries.map((item) => (
                      <tr 
                        key={item.id} 
                        onClick={() => setSelectedInquiry(item)}
                        className={`hover:bg-brand-bg/25 transition-colors cursor-pointer ${
                          selectedInquiry?.id === item.id ? "bg-brand-bg/40 font-medium" : ""
                        } ${item.status === 'new' ? 'bg-brand-mustard/5 font-semibold' : ''}`}
                      >
                        <td className="p-4">
                          <div className="font-bold text-brand-ink text-[13px]">{item.name}</div>
                          <div className="text-brand-muted text-[11px]">{item.email}</div>
                        </td>
                        <td className="p-4 text-brand-ink">{item.package || "Custom Plan"}</td>
                        <td className="p-4 text-brand-ink truncate max-w-[150px]" title={item.destinations}>{item.destinations || "Not specified"}</td>
                        <td className="p-4">{getStatusBadge(item.status)}</td>
                        <td className="p-4 text-brand-muted text-[11px]">
                          {new Date(item.created_at).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => setSelectedInquiry(item)}
                              title="View Details"
                              className="p-2 hover:bg-brand-bg hover:text-[#c7962d] text-brand-muted rounded-lg transition-colors"
                            >
                              <Eye size={14} />
                            </button>
                            {item.status === 'new' && (
                              <button 
                                onClick={() => handleUpdateStatus(item.id, 'read')}
                                title="Mark as Read"
                                className="p-2 hover:bg-brand-bg hover:text-blue-600 text-brand-muted rounded-lg transition-colors"
                              >
                                <CheckCircle2 size={14} />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(item.id)}
                              title="Delete Inquiry"
                              className="p-2 hover:bg-red-50 hover:text-red-600 text-brand-muted rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Details Drawer / Card */}
        <div className="xl:col-span-1">
          {selectedInquiry ? (
            <div className="bg-white border border-brand-border rounded-2xl shadow-sm p-6 space-y-6 sticky top-6">
              <div className="flex justify-between items-start pb-4 border-b border-brand-border">
                <div>
                  <h3 className="font-bold text-[15px] text-brand-ink font-serif truncate max-w-[200px]">
                    {selectedInquiry.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-brand-muted truncate max-w-[150px]">{selectedInquiry.email}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedInquiry(null)}
                  className="p-1.5 hover:bg-brand-bg text-brand-muted hover:text-brand-ink rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-brand-bg/40 p-3 rounded-xl border border-brand-border/20">
                  <div className="text-brand-muted text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                    <Inbox size={10} className="text-[#c7962d]" /> Package
                  </div>
                  <div className="font-bold text-brand-ink truncate">{selectedInquiry.package || "Custom Plan"}</div>
                </div>
                <div className="bg-brand-bg/40 p-3 rounded-xl border border-brand-border/20">
                  <div className="text-brand-muted text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                    <MapPin size={10} className="text-brand-mustard" /> Destination
                  </div>
                  <div className="font-bold text-brand-ink truncate" title={selectedInquiry.destinations}>
                    {selectedInquiry.destinations || "Not specified"}
                  </div>
                </div>
                <div className="bg-brand-bg/40 p-3 rounded-xl border border-brand-border/20">
                  <div className="text-brand-muted text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                    <Calendar size={10} className="text-blue-500" /> Approx. Dates
                  </div>
                  <div className="font-bold text-brand-ink truncate" title={selectedInquiry.dates}>
                    {selectedInquiry.dates || "Not specified"}
                  </div>
                </div>
                <div className="bg-brand-bg/40 p-3 rounded-xl border border-brand-border/20">
                  <div className="text-brand-muted text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                    <DollarSign size={10} className="text-green-600" /> Budget
                  </div>
                  <div className="font-bold text-brand-ink truncate">{selectedInquiry.budget || "Not specified"}</div>
                </div>
              </div>

              {/* Travelers Request Message */}
              <div className="space-y-2">
                <div className="text-brand-muted font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare size={10} /> Dream Travel Details:
                </div>
                <div className="bg-brand-bg/30 border border-brand-border/30 rounded-xl p-4 text-[13px] text-brand-ink leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto font-light">
                  {selectedInquiry.message || <span className="italic text-brand-muted">No details provided.</span>}
                </div>
              </div>

              {/* Status Manager */}
              <div className="pt-4 border-t border-brand-border space-y-3">
                <div className="text-brand-muted font-bold text-[10px] uppercase tracking-wider">
                  Update Status:
                </div>
                <div className="flex gap-2">
                  <button 
                    disabled={statusUpdating || selectedInquiry.status === "new"}
                    onClick={() => handleUpdateStatus(selectedInquiry.id, "new")}
                    className="flex-1 bg-brand-bg/40 hover:bg-[#c7962d]/10 border border-brand-border hover:border-[#c7962d]/30 text-brand-ink font-bold py-2 rounded-lg text-xs transition-colors disabled:opacity-40"
                  >
                    Mark New
                  </button>
                  <button 
                    disabled={statusUpdating || selectedInquiry.status === "read"}
                    onClick={() => handleUpdateStatus(selectedInquiry.id, "read")}
                    className="flex-1 bg-brand-bg/40 hover:bg-blue-50 border border-brand-border hover:border-blue-200 text-brand-ink font-bold py-2 rounded-lg text-xs transition-colors disabled:opacity-40"
                  >
                    Mark Read
                  </button>
                  <button 
                    disabled={statusUpdating || selectedInquiry.status === "replied"}
                    onClick={() => handleUpdateStatus(selectedInquiry.id, "replied")}
                    className="flex-1 bg-brand-bg/40 hover:bg-green-50 border border-brand-border hover:border-green-200 text-brand-ink font-bold py-2 rounded-lg text-xs transition-colors disabled:opacity-40"
                  >
                    Replied
                  </button>
                </div>
              </div>

              {/* Reply Hook */}
              <div className="pt-2">
                <a 
                  href={`mailto:${selectedInquiry.email}?subject=Re: Your travel inquiry to ${selectedInquiry.destinations || "Wanderlust"}&body=Hi ${selectedInquiry.name},%0D%0A%0D%0AThanks so much for reaching out about your trip!`}
                  onClick={() => handleUpdateStatus(selectedInquiry.id, 'replied')}
                  className="w-full bg-[#c7962d] hover:bg-[#b58522] text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors text-center"
                >
                  <Send size={13} />
                  Reply via Email &rarr;
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-brand-bg/25 border border-brand-border border-dashed rounded-2xl p-10 text-center sticky top-6 shadow-sm">
              <Mail className="text-brand-muted mx-auto mb-3" size={24} />
              <h4 className="font-bold text-brand-ink text-xs mb-1">Select an Inquiry</h4>
              <p className="text-brand-muted text-[11px] max-w-xs mx-auto leading-relaxed">
                Click any inquiry in the list to view their budget, message, approx. dates, destinations, and reply instantly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
