"use client";

import { useState, useEffect } from "react";
import { fetchInquiries, updateInquiry, deleteInquiry, saveInquiry } from "@/lib/db";
import { 
  Search, Mail, Calendar, MessageSquare, Trash2, CheckCircle2, 
  Eye, RefreshCw, X, AlertCircle, Inbox, User, MapPin, DollarSign,
  Send, Loader2, Plus, Archive, ChevronDown, Check, UserCheck, 
  Download, FileText, Activity
} from "lucide-react";

export default function InquiriesDashboard() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mockup Filter Dropdowns
  const [selectedPackage, setSelectedPackage] = useState("All packages");
  const [selectedStatus, setSelectedStatus] = useState("All statuses");
  const [selectedSort, setSelectedSort] = useState("Sort by newest");
  
  // Selected Detail Panel State (Hidden by default until click)
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  
  // Add Manual Inquiry Drawer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInquiryData, setNewInquiryData] = useState({
    name: "",
    email: "",
    package: "Custom Itinerary",
    destinations: "",
    dates: "",
    budget: "",
    travellers: "2 adults",
    message: ""
  });
  const [addingInquiry, setAddingInquiry] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDropdownOpen, setBulkDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedPackage, selectedStatus]);

  async function loadInquiries() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchInquiries();
      
      const enriched = (data || []).map(item => ({
        ...item,
        travellers: item.travellers || "2 adults",
        notes: item.notes || "",
        assigned_to: item.assigned_to || "Ava Wright",
        priority: item.priority || "Normal",
        next_action: item.next_action || "Send reply"
      }));
      setInquiries(enriched);
    } catch (err) {
      console.warn("Failed to load inquiries from Supabase:", err);
      setError("Failed to fetch inquiries. Please check your connection or execute 'supabase_tables.sql' in your Supabase SQL Editor first!");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInquiries();
  }, []);

  // Generic Field Updater (saves to state and tries to persist to Supabase safely)
  const handleUpdateField = async (id, fieldName, fieldValue) => {
    setInquiries(prev => prev.map(item => item.id === id ? { ...item, [fieldName]: fieldValue } : item));
    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry(prev => ({ ...prev, [fieldName]: fieldValue }));
    }

    try {
      await updateInquiry(id, { [fieldName]: fieldValue });
    } catch (err) {
      console.warn(`Local update successful. Supabase sync bypassed (expected if columns aren't created yet):`, err.message);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setStatusUpdating(true);
    await handleUpdateField(id, "status", newStatus);
    setStatusUpdating(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;

    try {
      // Clear locally first
      setInquiries(prev => prev.filter(item => item.id !== id));
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry(null);
      }
      await deleteInquiry(id);
    } catch (err) {
      console.warn("Deleted locally. Supabase bypass: ", err.message);
    }
  };

  // Create Manual Inquiry Submission
  const handleAddManualInquiry = async (e) => {
    e.preventDefault();
    if (!newInquiryData.name || !newInquiryData.email) return;

    setAddingInquiry(true);
    const newEntry = {
      ...newInquiryData,
      status: "new",
      notes: "Manual entry added by Ava Wright.",
      assigned_to: "Ava Wright",
      priority: "Normal",
      next_action: "Send reply",
      created_at: new Date().toISOString()
    };

    try {
      // Try to write to DB
      const result = await saveInquiry(newEntry);
      const enrichResult = {
        ...result,
        travellers: result.travellers || "2 adults",
        notes: result.notes || "Manual entry added by Ava Wright.",
        assigned_to: result.assigned_to || "Ava Wright",
        priority: result.priority || "Normal",
        next_action: result.next_action || "Send reply"
      };
      setInquiries(prev => [enrichResult, ...prev]);
      setSelectedInquiry(enrichResult);
    } catch (err) {
      console.warn("Saving locally only due to DB constraints:", err.message);
      const tempId = "manual-" + Date.now();
      const localEntry = { id: tempId, ...newEntry };
      setInquiries(prev => [localEntry, ...prev]);
      setSelectedInquiry(localEntry);
    } finally {
      setAddingInquiry(false);
      setShowAddModal(false);
      setNewInquiryData({
        name: "",
        email: "",
        package: "Custom Itinerary",
        destinations: "",
        dates: "",
        budget: "",
        travellers: "2 adults",
        message: ""
      });
    }
  };

  // Export CSV Tool
  const handleExportCSV = () => {
    if (inquiries.length === 0) return;
    const headers = ["Name", "Email", "Package Interest", "Destination", "Travel Dates", "Budget", "Travellers", "Status", "Received"];
    const rows = inquiries.map(item => [
      item.name,
      item.email,
      item.package,
      item.destinations,
      item.dates,
      item.budget,
      item.travellers,
      item.status,
      new Date(item.created_at).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${(val || "").toString().replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inquiries_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk Actions
  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) {
      alert("Please select one or more inquiries first.");
      return;
    }

    if (action === "delete") {
      if (confirm(`Are you sure you want to delete the ${selectedIds.length} selected inquiries?`)) {
        try {
          setLoading(true);
          await Promise.all(selectedIds.map(id => deleteInquiry(id)));
          setSelectedIds([]);
          await loadInquiries();
          alert("Selected inquiries successfully deleted.");
        } catch (e) {
          alert("Failed to delete selected inquiries: " + e.message);
        } finally {
          setLoading(false);
        }
      }
    } else if (action === "publish" || action === "draft") {
      const nextStatus = action === "publish" ? "read" : "new";
      const nextStatusLabel = action === "publish" ? "Read" : "Unread";
      if (confirm(`Mark ${selectedIds.length} selected inquiries as ${nextStatusLabel}?`)) {
        try {
          setLoading(true);
          await Promise.all(
            selectedIds.map(async (id) => {
              await updateInquiry(id, { status: nextStatus });
            })
          );
          setSelectedIds([]);
          await loadInquiries();
          alert(`Selected inquiries successfully marked as ${nextStatusLabel}.`);
        } catch (e) {
          alert("Failed to update selected inquiries: " + e.message);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Human Readable Received Dates
  const getRelativeDateString = (isoString) => {
    if (!isoString) return "Today";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (24 * 3600 * 1000));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    
    return date.toLocaleDateString("en-US", { 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Metric Live Calculations
  const countNew = inquiries.filter(item => item.status === "new").length;
  const countNeedResponse = inquiries.filter(item => item.status === "new" || item.status === "follow-up").length;
  const countReplied = inquiries.filter(item => item.status === "replied").length;
  const countConverted = inquiries.filter(item => item.status === "converted" || item.status === "archive").length;

  // Filter & Sort Logic
  const filteredInquiries = inquiries
    .filter(item => {
      const matchesSearch = 
        (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.destinations || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPackage = selectedPackage === "All packages" || item.package === selectedPackage;
      
      let matchesStatus = true;
      if (selectedStatus !== "All statuses") {
        matchesStatus = item.status === selectedStatus.toLowerCase();
      }

      return matchesSearch && matchesPackage && matchesStatus;
    })
    .sort((a, b) => {
      if (selectedSort === "Sort by newest") {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (selectedSort === "Sort by oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      if (selectedSort === "Sort by budget") {
        const valA = parseInt((a.budget || "").replace(/[^0-9]/g, "")) || 0;
        const valB = parseInt((b.budget || "").replace(/[^0-9]/g, "")) || 0;
        return valB - valA;
      }
    });

  const itemsPerPage = 15;
  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
  const displayedInquiries = filteredInquiries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "new":
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-brand-mustard/15 text-[#c7962d] tracking-wide">New</span>;
      case "replied":
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-blue-100/70 text-blue-700 tracking-wide">Replied</span>;
      case "read":
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-blue-100/70 text-blue-700 tracking-wide">Read</span>;
      case "converted":
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-green-100/70 text-green-700 tracking-wide">Converted</span>;
      case "follow-up":
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-red-100/70 text-red-700 tracking-wide">Follow-up</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-gray-100 text-gray-700 uppercase">{status}</span>;
    }
  };

  const getAvatarInitials = (name) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-full pb-16 font-sans">
      {/* Top Header Mockup */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-8 gap-4 pb-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-ink mb-1.5 tracking-tight">
            Inquiries
          </h1>
          <p className="text-brand-muted text-xs leading-relaxed max-w-3xl">
            Manage Plan with Me contact form entries, including package interest, destination, travel dates, budget, message, response status, internal notes and conversion to bookings.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button 
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-white border border-brand-border text-xs font-semibold text-brand-ink rounded-lg hover:bg-brand-bg transition-all shadow-xs"
          >
            <Download size={13} />
            Export CSV
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#c7962d] hover:bg-[#b58522] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Plus size={14} className="stroke-[3px]" />
            Add Manual Inquiry
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "New Inquiries", value: countNew },
          { label: "Need Response", value: countNeedResponse },
          { label: "Replied", value: countReplied },
          { label: "Converted", value: countConverted }
        ].map((card, idx) => (
          <div key={idx} className="bg-white border border-brand-border/70 rounded-xl p-5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-brand-muted tracking-widest block mb-1">{card.label}</span>
            <span className="text-3xl font-serif font-bold text-brand-ink">{card.value}</span>
          </div>
        ))}
      </div>

      {/* Two Column Layout (Collapses automatically when no message is selected!) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Left Column (Grid + Workflow) */}
        <div className={`${selectedInquiry ? "xl:col-span-2" : "xl:col-span-3"} space-y-8 transition-all duration-300`}>
          
          {/* Main Table Card */}
          <div className="bg-white border border-brand-border/70 rounded-2xl shadow-xs p-6">
            
            {/* Table Header Row */}
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-brand-border/40">
              <h2 className="font-serif font-bold text-lg text-brand-ink">Contact Form Entries</h2>
              
              {/* Bulk Actions Button Dropdown */}
              {selectedIds.length > 1 && (
                <div className="relative animate-in fade-in duration-200">
                  <button 
                    onClick={() => setBulkDropdownOpen(!bulkDropdownOpen)}
                    className="px-3 py-1.5 border border-brand-border rounded-lg text-xs font-bold text-brand-ink hover:bg-brand-bg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    Bulk Actions <ChevronDown size={12} />
                  </button>
                  {bulkDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-40 bg-white border border-brand-border rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <button 
                        onClick={() => { handleBulkAction("publish"); setBulkDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-brand-ink hover:bg-brand-bg transition-colors cursor-pointer"
                      >
                        Mark as Read
                      </button>
                      <button 
                        onClick={() => { handleBulkAction("draft"); setBulkDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-brand-ink hover:bg-brand-bg transition-colors cursor-pointer"
                      >
                        Mark as Unread
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

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
              
              {/* Search */}
              <div className="relative sm:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
                <input 
                  type="text" 
                  placeholder="Search name, email or destination..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#FAF8F5]/40 border border-brand-border rounded-lg py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-[#c7962d] transition-colors placeholder:text-brand-muted/70" 
                />
              </div>

              {/* Package Dropdown */}
              <div className="relative">
                <select
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded-lg py-2 px-3 pr-8 text-xs focus:outline-none focus:border-[#c7962d] appearance-none text-brand-ink cursor-pointer"
                >
                  <option value="All packages">All packages</option>
                  <option value="Custom Itinerary">Custom Itinerary</option>
                  <option value="1 on 1 Consultation">1 on 1 Consultation</option>
                  <option value="Full Concierge">Full Concierge</option>
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
              </div>

              {/* Status Dropdown */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded-lg py-2 px-3 pr-8 text-xs focus:outline-none focus:border-[#c7962d] appearance-none text-brand-ink cursor-pointer"
                >
                  <option value="All statuses">All statuses</option>
                  <option value="New">New</option>
                  <option value="Replied">Replied</option>
                  <option value="Converted">Converted</option>
                  <option value="Follow-up">Follow-up</option>
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
              </div>

              {/* Sorting Dropdown */}
              <div className="relative">
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded-lg py-2 px-3 pr-8 text-xs focus:outline-none focus:border-[#c7962d] appearance-none text-brand-ink cursor-pointer"
                >
                  <option value="Sort by newest">Sort by newest</option>
                  <option value="Sort by oldest">Sort by oldest</option>
                  <option value="Sort by budget">Sort by budget</option>
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
              </div>

            </div>

            {/* Inquiries Table */}
            {loading && inquiries.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center font-sans">
                <div className="brand-loader mb-4" style={{ '--s': '12px' }} />
                <span className="text-brand-muted text-[11px] font-medium tracking-tight">Loading travelers...</span>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-center">
                <Inbox size={24} className="text-brand-muted mb-2" />
                <span className="text-brand-muted text-xs font-semibold">No entries match your filter.</span>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto scrollbar-luxury">
                  <table className="w-full text-left text-xs whitespace-nowrap table-auto border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border/40 text-brand-muted font-bold tracking-wider uppercase bg-[#FAF8F5]/30">
                        <th className="p-3 w-8"></th>
                        <th className="p-3 pl-1 pb-3 text-[10px]">Contact</th>
                        <th className="p-3 pb-3 text-[10px]">Package Interest</th>
                        <th className="p-3 pb-3 text-[10px]">Destination</th>
                        <th className="p-3 pb-3 text-[10px]">Travel Dates</th>
                        <th className="p-3 pb-3 text-[10px]">Budget</th>
                        <th className="p-3 pb-3 text-[10px]">Status</th>
                        <th className="p-3 pb-3 text-[10px]">Received</th>
                        <th className="p-3 pb-3 text-right text-[10px] pr-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/30">
                      {displayedInquiries.map((item) => (
                        <tr 
                          key={item.id}
                          onClick={() => setSelectedInquiry(item)}
                          className={`hover:bg-[#FAF8F5]/60 transition-colors cursor-pointer ${
                            selectedInquiry?.id === item.id ? "bg-[#F5F0E6]/30 font-medium" : ""
                          }`}
                        >
                          {/* Checkbox select */}
                          <td className="p-3 pr-1" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="checkbox"
                              checked={selectedIds.includes(item.id)}
                              onChange={() => toggleSelectRow(item.id)}
                              className="rounded border-brand-border text-[#c7962d] focus:ring-[#c7962d] cursor-pointer"
                            />
                          </td>
                          
                          {/* Contact details */}
                          <td className="p-3 pl-1 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#F5F0E6] text-[#8C764D] border border-[#c7962d]/10 font-bold flex items-center justify-center shrink-0">
                              {getAvatarInitials(item.name)}
                            </div>
                            <div>
                              <div className="font-bold text-brand-ink text-[13px]">{item.name}</div>
                              <div className="text-brand-muted text-[10.5px] font-medium">{item.email}</div>
                            </div>
                          </td>

                          <td className="p-3 text-brand-ink">{item.package || "Custom Plan"}</td>
                          <td className="p-3 text-brand-ink font-semibold">{item.destinations || "—"}</td>
                          <td className="p-3 text-brand-ink">{item.dates || "—"}</td>
                          <td className="p-3 text-brand-ink font-semibold">{item.budget || "—"}</td>
                          <td className="p-3">{getStatusBadge(item.status)}</td>
                          
                          <td className="p-3 text-brand-muted text-[11px]">
                            {getRelativeDateString(item.created_at)}
                          </td>

                          {/* Uniform Lucide Actions Bar */}
                          <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1 text-brand-muted">
                              
                              {/* Open Eye Icon */}
                              <button 
                                onClick={() => setSelectedInquiry(item)}
                                title="Open message details"
                                className={`p-1.5 rounded-lg transition-colors ${
                                  selectedInquiry?.id === item.id 
                                    ? "bg-[#F5F0E6] text-[#8C764D]" 
                                    : "hover:bg-[#FAF8F5] hover:text-[#c7962d]"
                                }`}
                              >
                                <Eye size={15} />
                              </button>
                              
                              {/* Send Email Icon */}
                              <a 
                                href={`mailto:${item.email}?subject=Re: Your travel inquiry to ${item.destinations || "Wanderlust"}&body=Hi ${item.name},%0D%0A%0D%0AThanks so much for reaching out!`}
                                onClick={() => handleUpdateField(item.id, "status", "replied")}
                                title="Reply via Email"
                                className="p-1.5 rounded-lg hover:bg-[#FAF8F5] hover:text-[#c7962d] transition-colors"
                              >
                                <Mail size={15} />
                              </a>

                              {/* Convert Booking CheckCircle */}
                              <button 
                                onClick={() => handleUpdateField(item.id, "status", "converted")}
                                title={item.status === "converted" ? "Booking Confirmed" : "Convert to Booking"}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  item.status === "converted"
                                    ? "text-green-600 hover:bg-green-50"
                                    : "hover:bg-[#FAF8F5] hover:text-[#c7962d]"
                                }`}
                              >
                                <CheckCircle2 size={15} />
                              </button>

                              {/* Delete/Archive Trash Icon */}
                              <button 
                                onClick={() => handleDelete(item.id)}
                                title="Delete traveler inquiry"
                                className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>

                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination Controls */}
                <div className="flex items-center justify-between border-t border-brand-border/40 pt-4 mt-4 font-sans text-xs">
                  <div className="text-brand-muted font-medium">
                    Showing {filteredInquiries.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(filteredInquiries.length, currentPage * itemsPerPage)} of {filteredInquiries.length} entries
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="px-3 py-1.5 border border-brand-border rounded-lg text-brand-ink hover:bg-brand-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-semibold cursor-pointer"
                      >
                        Previous
                      </button>
                      {(() => {
                        const maxVisible = 10;
                        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                        let endPage = startPage + maxVisible - 1;
                        
                        if (endPage > totalPages) {
                          endPage = totalPages;
                          startPage = Math.max(1, endPage - maxVisible + 1);
                        }
                        
                        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
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
                        ));
                      })()}
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

          {/* Inquiry Workflow Card */}
          <div className="bg-white border border-brand-border/70 rounded-2xl shadow-xs p-6">
            <h2 className="font-serif font-bold text-lg text-brand-ink mb-5 pb-1">Inquiry Workflow</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: "1. New", desc: "Inquiry submitted through the Plan With Me form and waiting for review." },
                { step: "2. Replied / Follow-up", desc: "Admin has responded or needs to send another message." },
                { step: "3. Converted", desc: "Inquiry becomes a confirmed booking attached to a package." }
              ].map((step, idx) => (
                <div key={idx} className="bg-[#FAF8F5]/40 border border-brand-border/40 rounded-xl p-4.5">
                  <h3 className="font-serif font-bold text-xs text-brand-ink mb-1.5">{step.step}</h3>
                  <p className="text-brand-muted text-[11px] leading-relaxed font-medium">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Selected Inquiry Detail Inspector Panel (Hides completely by default!) */}
        {selectedInquiry && (
          <div className="xl:col-span-1 animate-slide-in">
            <div className="bg-white border border-brand-border rounded-2xl shadow-xs p-6 space-y-6 sticky top-6">
              
              {/* Profile Card Header */}
              <div className="flex justify-between items-start pb-5 border-b border-brand-border/40">
                <div>
                  <h3 className="font-serif font-bold text-xl text-brand-ink mb-1">
                    {selectedInquiry.name}
                  </h3>
                  <p className="text-[11.5px] font-bold text-brand-muted">
                    {selectedInquiry.email} &middot; <span className="font-medium text-brand-ink/80">{selectedInquiry.package || "Custom Itinerary"}</span>
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedInquiry(null)}
                  title="Close inspector panel"
                  className="p-1.5 hover:bg-[#FAF8F5] text-brand-muted hover:text-brand-ink rounded-lg transition-colors border border-brand-border/20 shadow-xs"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Field Rows */}
              <div className="space-y-3.5 text-xs">
                
                <div className="flex justify-between items-center py-1 border-b border-brand-border/20">
                  <span className="text-brand-muted font-bold text-[11px] uppercase tracking-wide">Status</span>
                  <div>{getStatusBadge(selectedInquiry.status)}</div>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-brand-border/20">
                  <span className="text-brand-muted font-bold text-[11px] uppercase tracking-wide">Destination</span>
                  <span className="font-bold text-brand-ink">{selectedInquiry.destinations || "Not specified"}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-brand-border/20">
                  <span className="text-brand-muted font-bold text-[11px] uppercase tracking-wide">Travel Dates</span>
                  <span className="font-semibold text-brand-ink">{selectedInquiry.dates || "Not specified"}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-brand-border/20">
                  <span className="text-brand-muted font-bold text-[11px] uppercase tracking-wide">Budget</span>
                  <span className="font-bold text-brand-ink">{selectedInquiry.budget || "Not specified"}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-brand-border/20">
                  <span className="text-brand-muted font-bold text-[11px] uppercase tracking-wide">Travellers</span>
                  <span className="font-semibold text-brand-ink">{selectedInquiry.travellers || "2 adults"}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-brand-muted font-bold text-[11px] uppercase tracking-wide">Package</span>
                  <span className="font-semibold text-brand-ink">{selectedInquiry.package || "Custom Itinerary"}</span>
                </div>

              </div>

              {/* Message card block */}
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-[13px] text-brand-ink">Inquiry Message</h4>
                <div className="bg-[#FAF8F5] border border-[#F2ECE4]/70 rounded-xl p-4.5 text-[12px] text-brand-ink/90 leading-relaxed max-h-48 overflow-y-auto font-light">
                  {selectedInquiry.message || <span className="italic text-brand-muted">No details provided.</span>}
                </div>
              </div>

              {/* Editable Internal Notes */}
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-[13px] text-brand-ink flex items-center justify-between">
                  Internal Notes
                </h4>
                <textarea 
                  rows="3.5"
                  value={selectedInquiry.notes || ""}
                  onChange={(e) => handleUpdateField(selectedInquiry.id, "notes", e.target.value)}
                  placeholder="Type internal client notes here. Saves automatically..."
                  className="w-full bg-[#FAF8F5]/30 border border-brand-border rounded-xl p-3.5 text-xs text-brand-ink/80 focus:outline-none focus:border-[#c7962d] focus:ring-1 focus:ring-[#c7962d] resize-none font-medium leading-relaxed"
                />
              </div>

              {/* Assign To & Priority Dropdowns */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-brand-muted mb-1.5 tracking-wider">Assign To</label>
                  <div className="relative">
                    <select
                      value={selectedInquiry.assigned_to || "Ava Wright"}
                      onChange={(e) => handleUpdateField(selectedInquiry.id, "assigned_to", e.target.value)}
                      className="w-full bg-white border border-brand-border rounded-lg py-2 px-3 pr-8 text-xs focus:outline-none focus:border-[#c7962d] appearance-none text-brand-ink cursor-pointer font-medium"
                    >
                      <option value="Ava Wright">Ava Wright</option>
                      <option value="No one">No one</option>
                    </select>
                    <ChevronDown size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-brand-muted mb-1.5 tracking-wider">Priority</label>
                  <div className="relative">
                    <select
                      value={selectedInquiry.priority || "Normal"}
                      onChange={(e) => handleUpdateField(selectedInquiry.id, "priority", e.target.value)}
                      className="w-full bg-white border border-brand-border rounded-lg py-2 px-3 pr-8 text-xs focus:outline-none focus:border-[#c7962d] appearance-none text-[#brand-ink] cursor-pointer font-medium"
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Low">Low</option>
                    </select>
                    <ChevronDown size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Next Action Dropdown */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-brand-muted mb-1.5 tracking-wider">Next Action</label>
                <div className="relative">
                  <select
                    value={selectedInquiry.next_action || "Send reply"}
                    onChange={(e) => handleUpdateField(selectedInquiry.id, "next_action", e.target.value)}
                    className="w-full bg-white border border-brand-border rounded-lg py-2.5 px-3 pr-8 text-xs focus:outline-none focus:border-[#c7962d] appearance-none text-brand-ink cursor-pointer font-medium"
                  >
                    <option value="Send reply">Send reply</option>
                    <option value="Schedule call">Schedule call</option>
                    <option value="Send proposal">Send proposal</option>
                  </select>
                  <ChevronDown size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                </div>
              </div>

              {/* Mark Replied & Convert Booking actions */}
              <div className="flex gap-3 pt-2">
                <button 
                  disabled={statusUpdating || selectedInquiry.status === "replied"}
                  onClick={() => handleUpdateStatus(selectedInquiry.id, "replied")}
                  className="flex-1 bg-white border border-brand-border text-brand-ink hover:bg-brand-bg hover:border-brand-ink/35 font-bold py-3.5 rounded-lg text-xs transition-colors disabled:opacity-40 shadow-xs"
                >
                  Mark Replied
                </button>
                <button 
                  disabled={statusUpdating || selectedInquiry.status === "converted"}
                  onClick={() => handleUpdateStatus(selectedInquiry.id, "converted")}
                  className="flex-1 bg-[#c7962d] hover:bg-[#b58522] text-white font-bold py-3.5 rounded-lg text-xs transition-colors disabled:opacity-40 shadow-xs"
                >
                  Convert to Booking
                </button>
              </div>

              {/* Activity Timeline */}
              <div className="pt-4 border-t border-brand-border/40 space-y-3.5">
                <h4 className="font-serif font-bold text-[13px] text-brand-ink flex items-center gap-1.5">
                  <Activity size={14} className="text-[#c7962d]" />
                  Activity
                </h4>
                
                <div className="space-y-4 text-xs pl-1">
                  
                  {/* Item 1 */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#FAF8F5] border border-brand-border/60 text-[10px] font-bold text-[#c7962d] flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div>
                      <div className="font-bold text-brand-ink">Inquiry received</div>
                      <div className="text-brand-muted text-[10.5px]">Submitted through Plan with Me form.</div>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#FAF8F5] border border-brand-border/60 text-[10px] font-bold text-[#c7962d] flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      {selectedInquiry.status === "replied" ? (
                        <>
                          <div className="font-bold text-green-700 flex items-center gap-0.5"><Check size={11} /> Replied</div>
                          <div className="text-brand-muted text-[10.5px]">Ava Wright responded to client.</div>
                        </>
                      ) : selectedInquiry.status === "converted" ? (
                        <>
                          <div className="font-bold text-green-700 flex items-center gap-0.5"><Check size={11} /> Converted!</div>
                          <div className="text-brand-muted text-[10.5px]">Traveler successfully converted to active booking.</div>
                        </>
                      ) : (
                        <>
                          <div className="font-bold text-[#c7962d]">Awaiting response</div>
                          <div className="text-brand-muted text-[10.5px]">No reply has been sent yet.</div>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Add Manual Inquiry Drawer Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-brand-border rounded-[24px] shadow-2xl p-7 max-w-[550px] w-full max-h-[90vh] overflow-y-auto scrollbar-luxury">
            
            <div className="flex justify-between items-center pb-4 border-b border-brand-border mb-6">
              <h3 className="font-serif font-bold text-xl text-brand-ink flex items-center gap-2">
                <Plus size={20} className="text-[#c7962d]" /> Add Manual Inquiry
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-[#FAF8F5] text-brand-muted hover:text-brand-ink rounded-lg transition-colors border border-brand-border/10"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddManualInquiry} className="space-y-4 text-xs font-semibold">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-muted mb-1 uppercase font-bold tracking-wide">Client Name *</label>
                  <input 
                    type="text"
                    required
                    value={newInquiryData.name}
                    onChange={(e) => setNewInquiryData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#FAF8F5]/40 border border-brand-border rounded-lg p-2.5 focus:outline-none focus:border-[#c7962d] text-brand-ink font-medium"
                    placeholder="e.g. Sarah Connor"
                  />
                </div>
                <div>
                  <label className="block text-brand-muted mb-1 uppercase font-bold tracking-wide">Email Address *</label>
                  <input 
                    type="email"
                    required
                    value={newInquiryData.email}
                    onChange={(e) => setNewInquiryData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-[#FAF8F5]/40 border border-brand-border rounded-lg p-2.5 focus:outline-none focus:border-[#c7962d] text-brand-ink font-medium"
                    placeholder="e.g. sarah@connor.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-muted mb-1 uppercase font-bold tracking-wide">Package Interest</label>
                  <select 
                    value={newInquiryData.package}
                    onChange={(e) => setNewInquiryData(prev => ({ ...prev, package: e.target.value }))}
                    className="w-full bg-white border border-brand-border rounded-lg p-2.5 focus:outline-none focus:border-[#c7962d] text-brand-ink font-medium cursor-pointer"
                  >
                    <option value="Custom Itinerary">Custom Itinerary</option>
                    <option value="1 on 1 Consultation">1 on 1 Consultation</option>
                    <option value="Full Concierge">Full Concierge</option>
                  </select>
                </div>
                <div>
                  <label className="block text-brand-muted mb-1 uppercase font-bold tracking-wide">Destination</label>
                  <input 
                    type="text"
                    value={newInquiryData.destinations}
                    onChange={(e) => setNewInquiryData(prev => ({ ...prev, destinations: e.target.value }))}
                    className="w-full bg-[#FAF8F5]/40 border border-brand-border rounded-lg p-2.5 focus:outline-none focus:border-[#c7962d] text-brand-ink font-medium"
                    placeholder="e.g. France, Spain"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-muted mb-1 uppercase font-bold tracking-wide">Rough Dates</label>
                  <input 
                    type="text"
                    value={newInquiryData.dates}
                    onChange={(e) => setNewInquiryData(prev => ({ ...prev, dates: e.target.value }))}
                    className="w-full bg-[#FAF8F5]/40 border border-brand-border rounded-lg p-2.5 focus:outline-none focus:border-[#c7962d] text-brand-ink font-medium"
                    placeholder="e.g. October 2026"
                  />
                </div>
                <div>
                  <label className="block text-brand-muted mb-1 uppercase font-bold tracking-wide">Budget</label>
                  <input 
                    type="text"
                    value={newInquiryData.budget}
                    onChange={(e) => setNewInquiryData(prev => ({ ...prev, budget: e.target.value }))}
                    className="w-full bg-[#FAF8F5]/40 border border-brand-border rounded-lg p-2.5 focus:outline-none focus:border-[#c7962d] text-brand-ink font-medium"
                    placeholder="e.g. $5,000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-brand-muted mb-1 uppercase font-bold tracking-wide">Travellers Count</label>
                <input 
                  type="text"
                  value={newInquiryData.travellers}
                  onChange={(e) => setNewInquiryData(prev => ({ ...prev, travellers: e.target.value }))}
                  className="w-full bg-[#FAF8F5]/40 border border-brand-border rounded-lg p-2.5 focus:outline-none focus:border-[#c7962d] text-[#brand-ink] font-medium"
                  placeholder="e.g. 2 adults, 1 child"
                />
              </div>

              <div>
                <label className="block text-brand-muted mb-1 uppercase font-bold tracking-wide">Dream Trip Message Details</label>
                <textarea 
                  rows="3"
                  value={newInquiryData.message}
                  onChange={(e) => setNewInquiryData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full bg-[#FAF8F5]/40 border border-brand-border rounded-lg p-3 focus:outline-none focus:border-[#c7962d] text-brand-ink font-medium resize-none leading-relaxed"
                  placeholder="Describe traveler desires here..."
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white border border-brand-border text-brand-ink font-bold py-3 rounded-lg hover:bg-brand-bg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={addingInquiry}
                  className="flex-1 bg-[#c7962d] hover:bg-[#b58522] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  {addingInquiry && <Loader2 className="animate-spin" size={14} />}
                  Add Inquiry
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
