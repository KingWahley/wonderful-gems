"use client";

import { useState, useEffect } from "react";
import { fetchSettings, saveSettings, uploadImage } from "@/lib/db";
import { 
  User, 
  HelpCircle, 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Image as ImageIcon, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import MediaSelectorModal from "@/components/dashboard/MediaSelectorModal";

export default function CMSPageSettings() {
  // Tabs State
  const [activeTab, setActiveTab] = useState("about_page");
  
  // Settings States
  const [aboutPage, setAboutPage] = useState({
    badge: "",
    title: "",
    introText: "",
    middleText: "",
    footerText: "",
    coverImage: "",
    floatingPill: "",
    contactTitle: "",
    contactEmail: ""
  });
  
  const [planPage, setPlanPage] = useState({
    heroBadge: "",
    heroTitle: "",
    heroSubtitle: "",
    faqBadge: "",
    faqTitle: "",
    faqs: []
  });

  // UI States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState(null);

  // Load Settings
  useEffect(() => {
    async function loadAllSettings() {
      try {
        const [about, plan] = await Promise.all([
          fetchSettings("about_page"),
          fetchSettings("plan_page")
        ]);
        
        if (about) setAboutPage(about);
        if (plan) setPlanPage({
          ...plan,
          faqs: plan.faqs || []
        });
      } catch (err) {
        console.error("Failed to load settings from Supabase:", err);
        showToast("error", "Error loading settings. Sourced from local fallbacks instead.");
      } finally {
        setLoading(false);
      }
    }
    loadAllSettings();
  }, []);

  // Toast trigger
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Handle Saving active settings
  const handleSave = async (key, data) => {
    setSaving(true);
    try {
      await saveSettings(key, data);
      showToast("success", `${formatKeyName(key)} saved live to Supabase!`);
    } catch (err) {
      console.error(err);
      showToast("error", `Failed to save ${formatKeyName(key)}. Check console or RLS privileges.`);
    } finally {
      setSaving(false);
    }
  };

  // Helper formatting for key
  const formatKeyName = (key) => {
    return key
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Handle image upload with auto-update
  const handleImageUpload = async (e, tabKey, fieldKey) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const url = await uploadImage(file);
      
      if (tabKey === "about_page") {
        setAboutPage(prev => ({ ...prev, [fieldKey]: url }));
      }
      
      showToast("success", "Cover image uploaded successfully to Supabase Storage!");
    } catch (err) {
      console.warn("Storage upload failed (probably bucket wanderful-images is not created yet). Using local preview instead.", err);
      // Generate object URL as preview to support offline testing
      const localUrl = URL.createObjectURL(file);
      if (tabKey === "about_page") {
        setAboutPage(prev => ({ ...prev, [fieldKey]: localUrl }));
      }
      showToast("warning", "Storage upload failed. Image preview updated locally, but please save with a valid URL or create the bucket.");
    } finally {
      setImageUploading(false);
    }
  };

  // FAQ array helpers
  const handleFaqChange = (index, field, val) => {
    const updatedFaqs = [...planPage.faqs];
    updatedFaqs[index] = { ...updatedFaqs[index], [field]: val };
    setPlanPage(prev => ({ ...prev, faqs: updatedFaqs }));
  };

  const addFaq = () => {
    setPlanPage(prev => ({
      ...prev,
      faqs: [...prev.faqs, { q: "", a: "" }]
    }));
  };

  const removeFaq = (index) => {
    const updatedFaqs = planPage.faqs.filter((_, idx) => idx !== index);
    setPlanPage(prev => ({ ...prev, faqs: updatedFaqs }));
  };

  const moveFaq = (index, direction) => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === planPage.faqs.length - 1) return;
    
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updatedFaqs = [...planPage.faqs];
    const temp = updatedFaqs[index];
    updatedFaqs[index] = updatedFaqs[targetIdx];
    updatedFaqs[targetIdx] = temp;
    
    setPlanPage(prev => ({ ...prev, faqs: updatedFaqs }));
  };

  const sidebarTabs = [
    { id: "about_page", label: "About Page", icon: <User size={18} /> },
    { id: "plan_page", label: "Plan & FAQs", icon: <HelpCircle size={18} /> },
  ];

  return (
    <div className="relative pb-16">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border animate-fade-in ${
          toast.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : toast.type === "warning"
            ? "bg-amber-50 border-amber-200 text-amber-800"
            : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <div className="text-xs font-semibold tracking-wide uppercase">{toast.message}</div>
        </div>
      )}

      {/* Loading Overlay */}
      {saving && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/40 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-white/90 border border-cream-200 rounded-2xl p-8 max-w-sm w-full text-center shadow-xl flex flex-col items-center">
            <Loader2 className="animate-spin text-brand-mustard mb-4" size={40} />
            <h3 className="font-serif text-lg text-charcoal-900 font-bold mb-1">Publishing Live Changes</h3>
            <p className="text-xs text-charcoal-800/70">Syncing your content settings back to Supabase database...</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif text-charcoal-900 mb-2">CMS Page Settings</h1>
          <p className="text-charcoal-800/70 text-sm">Design, edit, and tailor your travel journal's marketing pages dynamically without code edits.</p>
        </div>
        <Link 
          href="/plan-with-me" 
          target="_blank"
          className="bg-white border border-brand-border text-charcoal-900 px-4 py-2.5 rounded-md text-sm hover:border-brand-mustard hover:bg-cream-100/30 transition-all flex items-center justify-center gap-2 font-medium self-start sm:self-auto"
        >
          View Plan Page <ExternalLink size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-brand-mustard" size={36} />
          <p className="text-charcoal-800/60 text-sm font-medium">Connecting to Supabase...</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Vertical navigation tabs */}
          <aside className="w-full lg:w-[240px] shrink-0 bg-white rounded-xl shadow-xs border border-cream-200 p-2.5 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
            {sidebarTabs.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all whitespace-nowrap cursor-pointer ${
                    active 
                      ? "bg-brand-mustard-soft text-brand-mustard" 
                      : "text-charcoal-800/70 hover:bg-cream-100 hover:text-charcoal-900"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </aside>

          {/* Form Content Area */}
          <div className="flex-1 w-full bg-white rounded-xl shadow-xs border border-cream-200 p-6 md:p-8">
            
            {/* ABOUT PAGE TAB */}
            {activeTab === "about_page" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl text-charcoal-900 mb-1 flex items-center gap-2 font-bold">
                    About Elena & Journal
                    <Sparkles size={16} className="text-brand-mustard" />
                  </h2>
                  <p className="text-xs text-charcoal-800/60">Configure the complete static copies, floating portrait pills, about page layouts, and contact card email.</p>
                </div>
                
                <hr className="border-cream-200" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">Page Category Badge</label>
                    <input 
                      type="text" 
                      value={aboutPage.badge}
                      onChange={e => setAboutPage(prev => ({ ...prev, badge: e.target.value }))}
                      placeholder="e.g. ABOUT"
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">Floating Portrait Pill Text</label>
                    <input 
                      type="text" 
                      value={aboutPage.floatingPill}
                      onChange={e => setAboutPage(prev => ({ ...prev, floatingPill: e.target.value }))}
                      placeholder="e.g. 👋 HI, THAT'S ME"
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">About Main Title (Supports multi-line with Enter)</label>
                  <textarea 
                    rows="2"
                    value={aboutPage.title}
                    onChange={e => setAboutPage(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. I write about places&#10;like I'd text a friend."
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard resize-none"
                  />
                  <p className="text-[10px] text-charcoal-800/40 mt-1">Pressing Enter inserts a line break that shows on the public About page.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">Intro Paragraph</label>
                    <textarea 
                      rows="3"
                      value={aboutPage.introText}
                      onChange={e => setAboutPage(prev => ({ ...prev, introText: e.target.value }))}
                      placeholder="First paragraph copy..."
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">Middle Paragraph</label>
                    <textarea 
                      rows="3"
                      value={aboutPage.middleText}
                      onChange={e => setAboutPage(prev => ({ ...prev, middleText: e.target.value }))}
                      placeholder="Second paragraph copy..."
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">Footer Paragraph</label>
                    <textarea 
                      rows="3"
                      value={aboutPage.footerText}
                      onChange={e => setAboutPage(prev => ({ ...prev, footerText: e.target.value }))}
                      placeholder="Third/disclaimer paragraph copy..."
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">Contact Card Title</label>
                    <input 
                      type="text" 
                      value={aboutPage.contactTitle}
                      onChange={e => setAboutPage(prev => ({ ...prev, contactTitle: e.target.value }))}
                      placeholder="e.g. say hi 👋"
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">Contact Email Address</label>
                    <input 
                      type="email" 
                      value={aboutPage.contactEmail}
                      onChange={e => setAboutPage(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="hello@thelongway.travel"
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">Portrait Image URL</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="text" 
                      value={aboutPage.coverImage}
                      onChange={e => setAboutPage(prev => ({ ...prev, coverImage: e.target.value }))}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="flex-1 bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard" 
                    />
                    
                    <button
                      type="button"
                      onClick={() => {
                        setMediaTarget({ tab: "about_page", field: "coverImage" });
                        setIsMediaModalOpen(true);
                      }}
                      className="bg-brand-bg text-brand-ink px-4 py-3 border border-brand-border rounded-lg text-xs font-semibold tracking-wide uppercase hover:bg-cream-100 transition-colors flex items-center gap-2 cursor-pointer shrink-0"
                    >
                      <ImageIcon size={14} /> Library
                    </button>
                    
                    <label className="bg-charcoal-900 text-white px-4 py-3 rounded-lg text-xs font-semibold tracking-wide uppercase hover:bg-brand-mustard transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0">
                      {imageUploading ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Upload size={14} />
                      )}
                      Upload
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => handleImageUpload(e, "about_page", "coverImage")}
                        className="hidden" 
                      />
                    </label>
                  </div>
                  
                  {aboutPage.coverImage && (
                    <div className="mt-4 relative max-w-[280px] aspect-[4/5] rounded-xl overflow-hidden border border-brand-border shadow-xs">
                      <img 
                        src={aboutPage.coverImage} 
                        alt="About portrait preview" 
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-cream-200 flex justify-end">
                  <button
                    onClick={() => handleSave("about_page", aboutPage)}
                    className="bg-charcoal-900 text-white px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-brand-mustard transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Save size={14} /> Save About Page Config
                  </button>
                </div>
              </div>
            )}

            {/* PLAN PAGE & FAQS TAB */}
            {activeTab === "plan_page" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl text-charcoal-900 mb-1 flex items-center gap-2 font-bold">
                    Plan Customization & FAQs
                    <Sparkles size={16} className="text-brand-mustard" />
                  </h2>
                  <p className="text-xs text-charcoal-800/60">Configure the Plan with Me intro, the FAQ section title, and edit, reorder, or delete direct accordion questions.</p>
                </div>
                
                <hr className="border-cream-200" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">Hero Section Badge</label>
                    <input 
                      type="text" 
                      value={planPage.heroBadge}
                      onChange={e => setPlanPage(prev => ({ ...prev, heroBadge: e.target.value }))}
                      placeholder="e.g. PLAN WITH ME"
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">Hero Section Title</label>
                    <input 
                      type="text" 
                      value={planPage.heroTitle}
                      onChange={e => setPlanPage(prev => ({ ...prev, heroTitle: e.target.value }))}
                      placeholder="e.g. Your custom slow travel itinerary."
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">Hero Subtitle copy</label>
                  <textarea 
                    rows="3"
                    value={planPage.heroSubtitle}
                    onChange={e => setPlanPage(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                    placeholder="Short summary detailing custom itineraries features..."
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-cream-100">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">FAQ Badge Title</label>
                    <input 
                      type="text" 
                      value={planPage.faqBadge}
                      onChange={e => setPlanPage(prev => ({ ...prev, faqBadge: e.target.value }))}
                      placeholder="e.g. CURIOUS?"
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">FAQ Section Title</label>
                    <input 
                      type="text" 
                      value={planPage.faqTitle}
                      onChange={e => setPlanPage(prev => ({ ...prev, faqTitle: e.target.value }))}
                      placeholder="e.g. Common questions"
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-mustard" 
                    />
                  </div>
                </div>

                {/* FAQ List Dynamic Editor */}
                <div className="pt-6 border-t border-cream-200">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-serif text-lg text-charcoal-900 font-bold">Frequently Asked Questions ({planPage.faqs.length})</h3>
                      <p className="text-[11px] text-charcoal-800/50">These questions appear in the accordion at the bottom of the plan with me booking form.</p>
                    </div>
                    <button
                      onClick={addFaq}
                      className="bg-brand-mustard text-white px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-charcoal-900 transition-all cursor-pointer shadow-xs"
                    >
                      <Plus size={14} /> Add FAQ Item
                    </button>
                  </div>

                  {planPage.faqs.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-brand-border rounded-xl bg-brand-bg/50">
                      <HelpCircle className="mx-auto text-charcoal-300 mb-2" size={32} />
                      <p className="text-xs text-charcoal-800/50 font-medium">No FAQ items defined yet. Click "Add FAQ Item" above to get started!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {planPage.faqs.map((faq, idx) => (
                        <div 
                          key={idx} 
                          className="bg-brand-bg/30 border border-brand-border rounded-xl p-4 md:p-5 flex gap-4 items-start"
                        >
                          <div className="flex flex-col gap-1 shrink-0 pt-2">
                            <button 
                              onClick={() => moveFaq(idx, "up")}
                              disabled={idx === 0}
                              className={`p-1 rounded hover:bg-cream-200 text-charcoal-500 hover:text-charcoal-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer`}
                              title="Move Up"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <span className="text-[10px] text-center font-bold text-charcoal-800/40 select-none">{idx + 1}</span>
                            <button 
                              onClick={() => moveFaq(idx, "down")}
                              disabled={idx === planPage.faqs.length - 1}
                              className={`p-1 rounded hover:bg-cream-200 text-charcoal-500 hover:text-charcoal-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer`}
                              title="Move Down"
                            >
                              <ArrowDown size={14} />
                            </button>
                          </div>

                          <div className="flex-grow space-y-3">
                            <input 
                              type="text" 
                              value={faq.q}
                              onChange={e => handleFaqChange(idx, "q", e.target.value)}
                              placeholder={`Question ${idx + 1}...`}
                              className="w-full bg-white border border-brand-border rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-mustard text-charcoal-900" 
                            />
                            <textarea 
                              rows="2"
                              value={faq.a}
                              onChange={e => handleFaqChange(idx, "a", e.target.value)}
                              placeholder={`Provide clear, informative answer to Question ${idx + 1}...`}
                              className="w-full bg-white border border-brand-border rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-brand-mustard resize-none text-charcoal-800" 
                            />
                          </div>

                          <button 
                            onClick={() => removeFaq(idx)}
                            className="p-2.5 rounded-lg text-brand-danger bg-brand-danger-bg hover:opacity-85 transition-opacity cursor-pointer self-start mt-2"
                            title="Delete FAQ Item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-cream-200 flex justify-end">
                  <button
                    onClick={() => handleSave("plan_page", planPage)}
                    className="bg-charcoal-900 text-white px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-brand-mustard transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Save size={14} /> Save FAQ & Plan Config
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Media Selector Modal */}
      <MediaSelectorModal
        isOpen={isMediaModalOpen}
        onClose={() => {
          setIsMediaModalOpen(false);
          setMediaTarget(null);
        }}
        onSelect={(url) => {
          if (mediaTarget) {
            if (mediaTarget.tab === "about_page") {
              setAboutPage(prev => ({ ...prev, [mediaTarget.field]: url }));
            }
          }
          setIsMediaModalOpen(false);
          setMediaTarget(null);
        }}
      />
    </div>
  );
}
