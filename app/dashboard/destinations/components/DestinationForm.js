"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveDestination, uploadImage } from "@/lib/db";
import { ChevronRight, Loader2, X, Plus, Search, Bell } from "lucide-react";
import { getFlagEmoji } from "@/components/dashboard/LocationAutocomplete";
import dynamic from "next/dynamic";
import ConfirmModal from "@/components/shared/ConfirmModal";
const LocationAutocomplete = dynamic(() => import("@/components/dashboard/LocationAutocomplete"), {
  loading: () => <div className="animate-pulse bg-gray-100 border border-gray-300 h-[38px] rounded-[8px]"></div>,
  ssr: false
});


export default function DestinationForm({ initialData }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    emoji: "💡",
    variant: "primary",
    confirmLabel: "Confirm",
    onConfirm: () => {}
  });

  const [formData, setFormData] = useState({
    id: initialData?.id || "",
    country: initialData?.country || "",
    flag: initialData?.extras?.flag || "",
    code: initialData?.code || "",
    description: initialData?.description || "",
    excerpt: initialData?.excerpt || "",
    coverImage: initialData?.coverImage || "",
    whyILoveItTitle: initialData?.extras?.whyILoveItTitle || "",
    whyILoveIt: initialData?.whyILoveIt || "",
    moments: initialData?.moments?.length > 0 ? initialData.moments : [""],
    status: initialData?.status === "draft" ? "Draft" : (initialData?.status === "published" ? "Published" : "Draft"),
    featureOnHomepage: initialData?.extras?.featureOnHomepage || "No",
    slug: initialData?.slug || "",
    sortOrder: initialData?.extras?.sortOrder || "1",
    seoTitle: initialData?.extras?.seoTitle || "",
    metaDescription: initialData?.extras?.metaDescription || initialData?.excerpt || "",
    region: initialData?.region || "Asia"
  });

  const handleAddMoment = () => {
    setFormData(prev => ({ ...prev, moments: [...prev.moments, ""] }));
  };

  const handleMomentChange = (index, value) => {
    const newMoments = [...formData.moments];
    newMoments[index] = value;
    setFormData(prev => ({ ...prev, moments: newMoments }));
  };

  const handleRemoveMoment = (index) => {
    const newMoments = formData.moments.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, moments: newMoments }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const publicUrl = await uploadImage(file);
      setFormData(prev => ({ ...prev, coverImage: publicUrl }));
    } catch (error) {
      setConfirmConfig({
        isOpen: true,
        title: "Upload Failed ❌",
        message: `Failed to upload image: ${error.message}`,
        emoji: "❌",
        variant: "danger",
        confirmLabel: "Okay",
        cancelLabel: null,
        onConfirm: () => setConfirmConfig(prev => ({ ...prev, isOpen: false }))
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const executeSave = async (isDraft, customSlug = null) => {
    try {
      setSaving(true);
      
      const generatedSlug = customSlug || formData.slug || formData.country.toLowerCase().replace(/\s+/g, '-');
      const countryCode = formData.code || "XX"; // fallback

      // Store extra visual fields into description_json if we want to retain them without breaking DB
      const extras = {
        flag: formData.flag,
        whyILoveItTitle: formData.whyILoveItTitle,
        featureOnHomepage: formData.featureOnHomepage,
        sortOrder: formData.sortOrder,
        seoTitle: formData.seoTitle,
        metaDescription: formData.metaDescription || formData.excerpt || ""
      };

      const payload = {
        country: formData.country,
        code: countryCode.toUpperCase(),
        slug: generatedSlug,
        region: formData.region,
        excerpt: formData.excerpt || formData.metaDescription || "",
        description: formData.description,
        description_json: JSON.stringify(extras),
        whyILoveIt: formData.whyILoveIt,
        moments: formData.moments.filter(m => m.trim().length > 0),
        coverImage: formData.coverImage,
        status: isDraft ? "draft" : "published"
      };

      if (formData.id) {
        payload.id = formData.id;
      }

      await saveDestination(payload);
      router.push("/dashboard/destinations");
    } catch (e) {
      if (e.message.includes("destinations_slug_key") || e.message.includes("duplicate key")) {
        // Show warning confirmation modal
        setConfirmConfig({
          isOpen: true,
          title: "Location Already Exists ⚠️",
          message: `The location "${formData.country}" already exists. Do you want to proceed creating the destination post with the same name?`,
          emoji: "⚠️",
          variant: "danger",
          confirmLabel: "Yes, Proceed",
          cancelLabel: "Cancel",
          onConfirm: async () => {
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            // Auto add suffix to string
            const uniqueSuffix = "-" + Math.floor(100 + Math.random() * 900);
            const newSlug = (customSlug || formData.slug || formData.country.toLowerCase().replace(/\s+/g, '-')) + uniqueSuffix;
            setFormData(prev => ({ ...prev, slug: newSlug }));
            await executeSave(isDraft, newSlug);
          }
        });
      } else {
        setConfirmConfig({
          isOpen: true,
          title: "Error Saving ❌",
          message: `Failed to save: ${e.message}`,
          emoji: "❌",
          variant: "danger",
          confirmLabel: "Okay",
          cancelLabel: null,
          onConfirm: () => setConfirmConfig(prev => ({ ...prev, isOpen: false }))
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const executePreview = async (customSlug = null) => {
    try {
      setSaving(true);
      const generatedSlug = customSlug || formData.slug || formData.country.toLowerCase().replace(/\s+/g, '-');
      const countryCode = formData.code || "XX";

      const extras = {
        flag: formData.flag,
        whyILoveItTitle: formData.whyILoveItTitle,
        featureOnHomepage: formData.featureOnHomepage,
        sortOrder: formData.sortOrder,
        seoTitle: formData.seoTitle,
        metaDescription: formData.metaDescription || formData.excerpt || ""
      };

      const payload = {
        country: formData.country,
        code: countryCode.toUpperCase(),
        slug: generatedSlug,
        region: formData.region,
        excerpt: formData.excerpt || formData.metaDescription || "",
        description: formData.description,
        description_json: JSON.stringify(extras),
        whyILoveIt: formData.whyILoveIt,
        moments: formData.moments.filter(m => m.trim().length > 0),
        coverImage: formData.coverImage,
        status: formData.status === "Published" ? "published" : "draft"
      };

      if (formData.id) {
        payload.id = formData.id;
      }

      await saveDestination(payload);
      window.open(`/destinations/${generatedSlug}`, '_blank');
    } catch (e) {
      if (e.message.includes("destinations_slug_key") || e.message.includes("duplicate key")) {
        // Show warning confirmation modal
        setConfirmConfig({
          isOpen: true,
          title: "Location Already Exists ⚠️",
          message: `The location "${formData.country}" already exists. Do you want to proceed creating the destination post with the same name?`,
          emoji: "⚠️",
          variant: "danger",
          confirmLabel: "Yes, Proceed",
          cancelLabel: "Cancel",
          onConfirm: async () => {
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            const uniqueSuffix = "-" + Math.floor(100 + Math.random() * 900);
            const newSlug = (customSlug || formData.slug || formData.country.toLowerCase().replace(/\s+/g, '-')) + uniqueSuffix;
            setFormData(prev => ({ ...prev, slug: newSlug }));
            await executePreview(newSlug);
          }
        });
      } else {
        setConfirmConfig({
          isOpen: true,
          title: "Error Saving ❌",
          message: `Failed to save and preview: ${e.message}`,
          emoji: "❌",
          variant: "danger",
          confirmLabel: "Okay",
          cancelLabel: null,
          onConfirm: () => setConfirmConfig(prev => ({ ...prev, isOpen: false }))
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (isDraft) => {
    if (!formData.country) {
      setConfirmConfig({
        isOpen: true,
        title: "Required Field Missing ⚠️",
        message: "Country is required.",
        emoji: "⚠️",
        variant: "danger",
        confirmLabel: "Okay",
        cancelLabel: null,
        onConfirm: () => setConfirmConfig(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    const actionText = isDraft ? "save this destination as a draft" : "publish this destination page";
    const emojiIcon = isDraft ? "📝" : "🚀";

    setConfirmConfig({
      isOpen: true,
      title: isDraft ? "Save Draft?" : "Publish Destination?",
      message: `Are you sure you want to ${actionText}?`,
      emoji: emojiIcon,
      variant: "primary",
      confirmLabel: isDraft ? "Save" : "Publish",
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        await executeSave(isDraft);
      }
    });
  };

  const handlePreview = async () => {
    if (!formData.country) {
      setConfirmConfig({
        isOpen: true,
        title: "Required Field Missing ⚠️",
        message: "Country is required to preview.",
        emoji: "⚠️",
        variant: "danger",
        confirmLabel: "Okay",
        cancelLabel: null,
        onConfirm: () => setConfirmConfig(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }
    await executePreview();
  };

  return (
    <div className="font-sans text-brand-ink">
      {/* Fake Topbar just for the visual match if desired, though layout has sidebar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-border">
        <div className="flex items-center gap-2 text-sm text-brand-muted">
          <Link href="/dashboard/destinations" className="hover:text-brand-ink transition-colors">Destinations</Link>
          <ChevronRight size={14} />
          <span className="text-brand-ink font-semibold">Add Destination</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 mb-8">
        <div>
          <h2 className="font-serif text-3xl font-semibold mb-2 text-brand-ink">
            {initialData ? `Edit ${initialData.country}` : "Add Destination"}
          </h2>
          <p className="text-brand-muted text-sm max-w-2xl leading-relaxed">
            Create a new destination page with the exact required CMS fields: country, description, &quot;Why I Love It&quot; title and body, memorable moments, image, status and slug.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/destinations" className="inline-flex items-center justify-center px-4 py-2 border border-brand-border bg-white text-brand-ink rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          <button 
            onClick={() => handleSave(true)} 
            disabled={saving}
            className="inline-flex items-center justify-center px-4 py-2 border border-brand-border bg-white text-brand-ink rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Draft
          </button>
          <button 
            onClick={() => handleSave(false)} 
            disabled={saving}
            className="inline-flex items-center justify-center px-4 py-2 bg-brand-mustard text-white rounded-lg font-bold text-sm hover:bg-[#b88a29] transition-colors shadow-[0_8px_22px_rgba(199,150,45,0.18)] disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Publish Destination
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
        <div className="space-y-6">
          
          <section className="bg-white border border-brand-border rounded-2xl p-6 shadow-[0_8px_28px_rgba(22,22,22,0.03)]">
            <div className="mb-4">
              <h3 className="text-lg font-extrabold m-0 text-brand-ink">Destination Details</h3>
              <p className="text-brand-muted text-[13px] leading-relaxed mt-1">This content powers the destination listing, destination detail page and homepage destination carousel.</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-extrabold mb-2">Country</label>
                  <LocationAutocomplete 
                    value={formData.country}
                    onChange={(val, code) => {
                      setFormData(p => ({ 
                        ...p, 
                        country: val,
                        slug: val.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, '-'),
                        code: code || p.code,
                        flag: code ? getFlagEmoji(code) : p.flag
                      }));
                    }}
                    type="country"
                    placeholder="e.g. Japan" 
                    className="w-full border border-brand-border rounded-lg bg-white px-3 py-3 text-sm focus:outline-none focus:border-brand-mustard"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-extrabold mb-2">Flag / Emoji</label>
                  <input 
                    type="text" 
                    value={formData.flag}
                    onChange={e => setFormData(p => ({ ...p, flag: e.target.value }))}
                    placeholder="e.g. 🇯🇵" 
                    className="w-full border border-brand-border rounded-lg bg-white px-3 py-3 text-sm focus:outline-none focus:border-brand-mustard"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-extrabold mb-2">Country Code (2 letters)</label>
                  <input 
                    type="text" 
                    maxLength={2}
                    value={formData.code}
                    onChange={e => setFormData(p => ({ ...p, code: e.target.value }))}
                    placeholder="e.g. JP" 
                    className="w-full border border-brand-border rounded-lg bg-white px-3 py-3 text-sm focus:outline-none focus:border-brand-mustard uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-extrabold mb-2">Region</label>
                  <input 
                    type="text"
                    list="regions-list"
                    value={formData.region}
                    onChange={e => setFormData(p => ({ ...p, region: e.target.value }))}
                    placeholder="e.g. Asia"
                    className="w-full border border-brand-border rounded-lg bg-white px-3 py-3 text-sm focus:outline-none focus:border-brand-mustard"
                  />
                  <datalist id="regions-list">
                    <option value="Asia" />
                    <option value="Europe" />
                    <option value="Africa" />
                    <option value="North America" />
                    <option value="South America" />
                    <option value="Oceania" />
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-extrabold mb-2">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Write a short destination description. Example: Scenic view from Japan, with slow temples, food counters and quiet city mornings." 
                  className="w-full border border-brand-border rounded-lg bg-white px-3 py-3 text-sm focus:outline-none focus:border-brand-mustard min-h-[120px]"
                />
                <div className="text-xs text-brand-muted mt-1.5">Used on destination cards, destination details and previews.</div>
              </div>

              <div>
                <label className="block text-[13px] font-extrabold mb-2">Excerpt / Subtitle</label>
                <textarea 
                  value={formData.excerpt}
                  onChange={e => setFormData(p => ({ ...p, excerpt: e.target.value }))}
                  placeholder="e.g. Old capitals, neon avenues, and the ritual of small things." 
                  className="w-full border border-brand-border rounded-lg bg-white px-3 py-3 text-sm focus:outline-none focus:border-brand-mustard min-h-[80px]"
                />
                <div className="text-xs text-brand-muted mt-1.5">A short, evocative summary of the destination. Appears as a subtitle on the guide details page.</div>
              </div>

              <div>
                <label className="block text-[13px] font-extrabold mb-2">Destination Image</label>
                <div className="min-h-[150px] border-2 border-dashed border-[#d4c6ad] rounded-xl bg-[#fffaf1] flex flex-col items-center justify-center text-center p-5 text-brand-muted relative hover:bg-[#fff5e1] transition-colors cursor-pointer">
                  {formData.coverImage ? (
                    <img src={formData.coverImage} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-60" />
                  ) : null}
                  <div className="relative z-10 pointer-events-none">
                    {uploadingImage ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-ink" />
                    ) : (
                      <>
                        <span className="block text-brand-ink font-bold mb-1">Upload destination image</span>
                        <span className="text-xs">Recommended size: 1600 x 1000px. Used for cards, details page and carousel.</span>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    disabled={uploadingImage}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white border border-brand-border rounded-2xl p-6 shadow-[0_8px_28px_rgba(22,22,22,0.03)]">
            <div className="mb-4">
              <h3 className="text-lg font-extrabold m-0 text-brand-ink">Why I Love It</h3>
              <p className="text-brand-muted text-[13px] leading-relaxed mt-1">This is the personal editorial section for the destination detail page.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-extrabold mb-2">Why I Love It Title</label>
                <input 
                  type="text" 
                  value={formData.whyILoveItTitle}
                  onChange={e => setFormData(p => ({ ...p, whyILoveItTitle: e.target.value }))}
                  placeholder="e.g. Kyoto rewards a slower pace" 
                  className="w-full border border-brand-border rounded-lg bg-white px-3 py-3 text-sm focus:outline-none focus:border-brand-mustard"
                />
              </div>
              <div>
                <label className="block text-[13px] font-extrabold mb-2">Why I Love It Body</label>
                <textarea 
                  value={formData.whyILoveIt}
                  onChange={e => setFormData(p => ({ ...p, whyILoveIt: e.target.value }))}
                  placeholder="Write the personal note explaining what makes this destination memorable and worth recommending." 
                  className="w-full border border-brand-border rounded-lg bg-white px-3 py-3 text-sm focus:outline-none focus:border-brand-mustard min-h-[120px]"
                />
              </div>
            </div>
          </section>

          <section className="bg-white border border-brand-border rounded-2xl p-6 shadow-[0_8px_28px_rgba(22,22,22,0.03)]">
            <div className="mb-4">
              <h3 className="text-lg font-extrabold m-0 text-brand-ink">Moments</h3>
              <p className="text-brand-muted text-[13px] leading-relaxed mt-1">Add short memorable moments that can appear as highlights on the destination detail page.</p>
            </div>
            <div className="space-y-2.5">
              {formData.moments.map((moment, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={moment}
                    onChange={e => handleMomentChange(idx, e.target.value)}
                    placeholder="e.g. Slow mornings through lantern-lit streets" 
                    className="flex-1 border border-brand-border rounded-lg bg-white px-3 py-3 text-sm focus:outline-none focus:border-brand-mustard"
                  />
                  <button 
                    onClick={() => handleRemoveMoment(idx)}
                    className="px-3 py-3 border border-brand-border bg-white text-brand-danger rounded-lg font-bold text-xs hover:bg-gray-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button 
                onClick={handleAddMoment}
                className="w-full mt-2 border border-dashed border-[#cfb678] bg-brand-mustard-soft text-[#7a5517] py-3 rounded-lg font-extrabold text-sm hover:bg-[#f0e0b8] transition-colors"
              >
                + Add Moment
              </button>
            </div>
          </section>

          <section className="bg-white border border-brand-border rounded-2xl p-6 shadow-[0_8px_28px_rgba(22,22,22,0.03)]">
            <div className="mb-4">
              <h3 className="text-lg font-extrabold m-0 text-brand-ink">Publishing & SEO</h3>
              <p className="text-brand-muted text-[13px] leading-relaxed mt-1">Control visibility, homepage featuring and URL details.</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-extrabold mb-2">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                    className="w-full border border-brand-border rounded-lg bg-white px-3 py-3 text-sm focus:outline-none focus:border-brand-mustard"
                  >
                    <option>Draft</option>
                    <option>Published</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-extrabold mb-2">Featured on Homepage</label>
                  <select 
                    value={formData.featureOnHomepage}
                    onChange={e => setFormData(p => ({ ...p, featureOnHomepage: e.target.value }))}
                    className="w-full border border-brand-border rounded-lg bg-white px-3 py-3 text-sm focus:outline-none focus:border-brand-mustard"
                  >
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-extrabold mb-2">URL Slug</label>
                  <input 
                    type="text" 
                    value={formData.slug}
                    onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))}
                    placeholder="e.g. japan" 
                    className="w-full border border-brand-border rounded-lg bg-white px-3 py-3 text-sm focus:outline-none focus:border-brand-mustard"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-extrabold mb-2">Sort Order</label>
                  <input 
                    type="number" 
                    value={formData.sortOrder}
                    onChange={e => setFormData(p => ({ ...p, sortOrder: e.target.value }))}
                    placeholder="e.g. 1" 
                    className="w-full border border-brand-border rounded-lg bg-white px-3 py-3 text-sm focus:outline-none focus:border-brand-mustard"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-extrabold mb-2">SEO Title</label>
                <input 
                  type="text" 
                  value={formData.seoTitle}
                  onChange={e => setFormData(p => ({ ...p, seoTitle: e.target.value }))}
                  placeholder="e.g. Japan Travel Stories and Guides — The Long Way" 
                  className="w-full border border-brand-border rounded-lg bg-white px-3 py-3 text-sm focus:outline-none focus:border-brand-mustard"
                />
              </div>
              <div>
                <label className="block text-[13px] font-extrabold mb-2">Meta Description</label>
                <textarea 
                  value={formData.metaDescription}
                  onChange={e => setFormData(p => ({ ...p, metaDescription: e.target.value }))}
                  placeholder="Write a short search description for this destination page." 
                  className="w-full border border-brand-border rounded-lg bg-white px-3 py-3 text-sm focus:outline-none focus:border-brand-mustard min-h-[80px]"
                />
              </div>
            </div>
          </section>

        </div>

        {/* Live Preview Sidebar */}
        <aside className="sticky top-[100px] bg-white border border-brand-border rounded-2xl overflow-hidden shadow-[0_10px_32px_rgba(22,22,22,0.05)] hidden lg:block">
          <div 
            className="h-[230px] bg-cover bg-center flex items-end p-5 text-white"
            style={{ 
              backgroundImage: formData.coverImage 
                ? `linear-gradient(135deg, rgba(22,22,22,0.58), rgba(199,150,45,0.28)), url('${formData.coverImage}')`
                : "linear-gradient(135deg, rgba(22,22,22,0.58), rgba(199,150,45,0.28)), url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80')" 
            }}
          >
            <h3 className="font-serif text-3xl m-0">{formData.country || "Japan"}</h3>
          </div>
          <div className="p-5">
            <span className="inline-block px-2.5 py-1.5 rounded-full text-xs font-extrabold mb-4 bg-brand-warning-bg text-brand-warning">
              {formData.status} Preview
            </span>
            <h4 className="font-serif text-lg m-0 mb-2">{formData.whyILoveItTitle || "Kyoto rewards a slower pace"}</h4>
            {formData.excerpt && (
              <p className="text-brand-ink text-[12px] italic leading-relaxed mb-3 border-l-2 border-brand-mustard pl-2">
                &ldquo;{formData.excerpt}&rdquo;
              </p>
            )}
            <p className="text-brand-muted text-[13px] leading-relaxed mb-3">
              {formData.description || "Scenic view from Japan, with slow temples, food counters and quiet city mornings."}
            </p>
            {formData.whyILoveIt && (
              <p className="text-brand-muted text-[13px] leading-relaxed mb-4">
                {formData.whyILoveIt}
              </p>
            )}

            <div className="mb-4 flex flex-wrap gap-1.5">
              {(formData.moments.filter(Boolean).length > 0 ? formData.moments.filter(Boolean) : ["Lantern-lit streets", "Temple walks", "Train rides"]).map((m, i) => (
                <span key={i} className="inline-block bg-brand-mustard-soft text-[#7a5517] rounded-full px-2.5 py-1.5 text-[11px] font-extrabold">
                  {m}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-brand-border">
              <div className="bg-[#fffdf9] border border-brand-border rounded-xl p-3">
                <strong className="block font-serif text-xl">0</strong>
                <span className="text-brand-muted text-[11px]">Blog Posts</span>
              </div>
              <div className="bg-[#fffdf9] border border-brand-border rounded-xl p-3">
                <strong className="block font-serif text-xl">0</strong>
                <span className="text-brand-muted text-[11px]">Mini Guides</span>
              </div>
              <div className="bg-[#fffdf9] border border-brand-border rounded-xl p-3">
                <strong className="block font-serif text-xl">0</strong>
                <span className="text-brand-muted text-[11px]">Tours</span>
              </div>
              <div className="bg-[#fffdf9] border border-brand-border rounded-xl p-3">
                <strong className="block font-serif text-xl text-brand-ink">{formData.featureOnHomepage}</strong>
                <span className="text-brand-muted text-[11px]">Homepage</span>
              </div>
            </div>
            
            <button 
              type="button"
              onClick={handlePreview}
              disabled={saving}
              className="w-full mt-4 px-4 py-2 bg-brand-mustard text-white rounded-lg font-bold text-sm hover:bg-[#b88a29] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="animate-spin w-4 h-4" />}
              Preview Destination Page
            </button>
            <Link href="/dashboard/destinations" className="block text-center w-full mt-2 px-4 py-2 border border-brand-border bg-white text-brand-ink rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors">
              Back to Destination List
            </Link>
          </div>
        </aside>

      </div>
      <ConfirmModal {...confirmConfig} onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))} />
    </div>
  );
}
