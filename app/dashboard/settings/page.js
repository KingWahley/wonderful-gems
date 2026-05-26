"use client";

import { useState, useEffect } from "react";
import { Settings, Save, RotateCcw, Palette, User, Shield, Info, Check } from "lucide-react";

export default function SettingsCMS() {
  const [profileName, setProfileName] = useState("Ava Wright");
  const [profileRole, setProfileRole] = useState("Administrator");
  const [activeTheme, setActiveTheme] = useState("default");
  
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load current settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("dashboard-profile-name") || "Ava Wright";
      const savedRole = localStorage.getItem("dashboard-profile-role") || "Administrator";
      const savedTheme = localStorage.getItem("dashboard-theme") || "default";

      setProfileName(savedName);
      setProfileRole(savedRole);
      setActiveTheme(savedTheme);
    }
  }, []);

  const themesList = [
    { id: "default", name: "Warm Gold", hex: "#c7962d", bgClass: "bg-[#c7962d]", desc: "The original editorial ochre and mustard palette." },
    { id: "rose", name: "Terracotta Rose", hex: "#c05a46", bgClass: "bg-[#c05a46]", desc: "Earthy sophisticated reddish-orange hues." },
    { id: "emerald", name: "Emerald Sage", hex: "#2e6f40", bgClass: "bg-[#2e6f40]", desc: "Deep organic olive forest tones." },
    { id: "cobalt", name: "Royal Cobalt", hex: "#2f5c9e", bgClass: "bg-[#2f5c9e]", desc: "Classic premium cobalt and sky blue contrast." },
    { id: "charcoal", name: "Charcoal Slate", hex: "#444444", bgClass: "bg-[#444444]", desc: "Sleek contemporary slate and gray accents." }
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    // Simulate saving delay for premium UX feedback
    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("dashboard-profile-name", profileName.trim() || "Ava Wright");
        localStorage.setItem("dashboard-profile-role", profileRole.trim() || "Administrator");
        localStorage.setItem("dashboard-theme", activeTheme);

        // Dispatch dynamic theme event for layout and page listeners to sync in real time
        window.dispatchEvent(new Event("theme-changed"));
      }
      setSaving(false);
      setSavedSuccess(true);
      
      // Auto dismiss success toast after 3 seconds
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 450);
  };

  const handleReset = () => {
    if (confirm("Reset dashboard settings to default system configurations?")) {
      setProfileName("Ava Wright");
      setProfileRole("Administrator");
      setActiveTheme("default");
      
      if (typeof window !== "undefined") {
        localStorage.setItem("dashboard-profile-name", "Ava Wright");
        localStorage.setItem("dashboard-profile-role", "Administrator");
        localStorage.setItem("dashboard-theme", "default");
        window.dispatchEvent(new Event("theme-changed"));
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  return (
    <div className="w-full pb-10">
      
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 pb-2 border-b border-brand-border/40">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-brand-ink mb-1.5 font-bold tracking-tight flex items-center gap-3">
            <Settings size={28} className="text-brand-mustard shrink-0" /> Settings
          </h1>
          <p className="text-brand-muted text-sm font-light">
            Customize your CMS personal profile settings, manage editorial workspace themes, and tailor user layout preferences.
          </p>
        </div>
      </div>

      {/* Success Notification Toast */}
      {savedSuccess && (
        <div className="fixed top-5 right-5 z-[9999] bg-[#e7f5e9] border border-[#1f7a3f]/20 rounded-xl p-4 flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 font-sans">
          <div className="w-7 h-7 rounded-full bg-[#1f7a3f]/10 flex items-center justify-center text-[#1f7a3f]">
            <Check size={16} />
          </div>
          <div>
            <h4 className="font-bold text-[#1f7a3f] text-xs">Settings Saved Successfully</h4>
            <p className="text-[10.5px] text-[#1f7a3f]/80 mt-0.5">Workspace details and color themes updated immediately.</p>
          </div>
        </div>
      )}

      {/* Main Forms Layout */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start font-sans">
        
        {/* Left Columns (Inputs & Customization Options) - Span 2 */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: User Profile Settings */}
          <div className="bg-white border border-brand-border/70 rounded-2xl p-6 shadow-2xs">
            <h3 className="font-serif font-bold text-base text-brand-ink mb-4 flex items-center gap-2">
              <User size={18} className="text-brand-mustard" /> Personal Profile Info
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-brand-muted uppercase tracking-wider mb-2">Display User Name</label>
                <input 
                  type="text" 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. Ava Wright"
                  className="w-full bg-[#FAF8F5]/40 border border-brand-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-brand-mustard transition-colors placeholder:text-brand-muted/50 text-brand-ink font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brand-muted uppercase tracking-wider mb-2">Workspace Role / Position</label>
                <input 
                  type="text" 
                  value={profileRole}
                  onChange={(e) => setProfileRole(e.target.value)}
                  placeholder="e.g. Administrator"
                  className="w-full bg-[#FAF8F5]/40 border border-brand-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-brand-mustard transition-colors placeholder:text-brand-muted/50 text-brand-ink font-semibold"
                  required
                />
              </div>
            </div>

            <div className="bg-[#FAF8F5]/60 border border-brand-border/40 rounded-xl p-4 mt-5 flex items-start gap-3">
              <Shield size={16} className="text-brand-mustard mt-0.5 shrink-0" />
              <p className="text-[11px] text-brand-muted leading-relaxed">
                Changes to your display name and role will propagate across all user interface panels immediately (such as navigation cards, author credits, and inquiry routing tags) to preserve localized workspace coherence.
              </p>
            </div>
          </div>

          {/* Card 2: Workspace Color Palette Themes */}
          <div className="bg-white border border-brand-border/70 rounded-2xl p-6 shadow-2xs">
            <h3 className="font-serif font-bold text-base text-brand-ink mb-2 flex items-center gap-2">
              <Palette size={18} className="text-brand-mustard" /> CMS Color Palette Theme
            </h3>
            <p className="text-brand-muted text-xs font-light mb-6">
              Recolor the entire CMS workspace interface instantly to match your personal mood or branding color choice.
            </p>

            {/* Themes Swatch Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themesList.map((t) => {
                const isSelected = activeTheme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTheme(t.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 cursor-pointer relative group ${
                      isSelected 
                        ? "border-brand-mustard bg-brand-mustard-soft/10 shadow-xs" 
                        : "border-brand-border/70 hover:border-brand-border hover:bg-[#FAF8F5]/40"
                    }`}
                  >
                    {/* Circle Color Swatch */}
                    <div className={`w-8 h-8 rounded-full shrink-0 border border-black/5 shadow-2xs flex items-center justify-center text-white ${t.bgClass}`}>
                      {isSelected && <Check size={14} className="stroke-[3]" />}
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="font-bold text-brand-ink text-xs">{t.name}</h4>
                      <p className="text-[10.5px] text-brand-muted leading-relaxed mt-0.5 font-light">{t.desc}</p>
                    </div>

                    {/* Border Indicator Pill */}
                    {isSelected && (
                      <span className="absolute right-0 top-1/4 bottom-1/4 w-1 bg-brand-mustard rounded-l-md"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Actions Control Deck */}
        <div className="space-y-6">
          <div className="bg-white border border-brand-border/70 rounded-2xl p-6 shadow-2xs sticky top-8">
            <h3 className="font-serif font-bold text-base text-brand-ink mb-4 flex items-center gap-2">
              Workspace Controls
            </h3>

            {/* Quick Preview Panel */}
            <div className="bg-[#FAF8F5]/80 border border-brand-border/60 rounded-xl p-4 mb-6 text-center font-sans">
              <span className="block text-[9px] text-brand-muted uppercase font-bold tracking-widest mb-3">Live Profile Preview</span>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-brand-mustard-soft text-brand-mustard flex items-center justify-center font-serif font-bold text-lg mb-2 shadow-2xs">
                  {profileName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "AW"}
                </div>
                <h4 className="font-serif font-bold text-sm text-brand-ink leading-tight">{profileName || "Ava Wright"}</h4>
                <span className="text-brand-muted text-[10px] uppercase font-bold tracking-wider mt-1">{profileRole || "Administrator"}</span>
              </div>
            </div>

            <hr className="border-brand-border/40 my-5" />

            {/* Save Buttons deck */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-brand-mustard text-white py-2.5 rounded-lg text-xs font-bold hover:bg-brand-mustard/90 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save size={14} /> {saving ? "Saving Changes..." : "Save System Config"}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-full bg-white border border-brand-border text-brand-ink py-2.5 rounded-lg text-xs font-bold hover:bg-[#FAF8F5]/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw size={14} /> Reset Settings
              </button>
            </div>

            {/* Info Footer Block */}
            <div className="mt-6 pt-5 border-t border-brand-border/40 flex gap-2.5 text-[10px] text-brand-muted font-light leading-normal">
              <Info size={14} className="text-brand-mustard shrink-0 mt-0.5" />
              <span>
                System settings are persisted directly in your browser's local sandbox data partition, safeguarding your tailored CMS preferences across page refreshes.
              </span>
            </div>
          </div>
        </div>

      </form>
      
    </div>
  );
}
