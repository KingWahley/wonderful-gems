"use client";

import { useState, useEffect } from "react";
import { fetchBlogs, saveBlog, deleteBlog, fetchDestinations, uploadImage } from "@/lib/db";
import { Plus, Edit2, Trash2, Search, X, Loader2, Image as ImageIcon, Calendar } from "lucide-react";

export default function BlogCMS() {
  const [blogs, setBlogs] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  
  // Form State
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    slug: "",
    destination: "",
    countryCode: "",
    category: "",
    excerpt: "",
    coverImage: "",
    isFresh: false,
    date: ""
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [blogsData, destinationsData] = await Promise.all([
        fetchBlogs(),
        fetchDestinations()
      ]);
      setBlogs(blogsData);
      setDestinations(destinationsData);
    } catch (e) {
      console.error("Failed to load blog page data", e);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setModalMode("add");
    setFormData({
      id: "",
      title: "",
      slug: "",
      destination: destinations[0]?.country || "",
      countryCode: destinations[0]?.code || "",
      category: "",
      excerpt: "",
      coverImage: "",
      isFresh: false,
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (blog) => {
    setModalMode("edit");
    setFormData({
      id: blog.id,
      title: blog.title || "",
      slug: blog.slug || "",
      destination: blog.destination || "",
      countryCode: blog.countryCode || "",
      category: blog.category || "",
      excerpt: blog.excerpt || "",
      coverImage: blog.coverImage || "",
      isFresh: !!blog.isFresh,
      date: blog.date || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (confirm(`Are you sure you want to delete the blog post "${title}"?`)) {
      try {
        await deleteBlog(id);
        setBlogs(blogs.filter(b => b.id !== id));
      } catch (e) {
        alert("Failed to delete blog post: " + e.message);
      }
    }
  };

  const handleDestinationChange = (e) => {
    const destName = e.target.value;
    const destObj = destinations.find(d => d.country === destName);
    setFormData(prev => ({
      ...prev,
      destination: destName,
      countryCode: destObj ? destObj.code : ""
    }));
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    // Auto-generate slug and category if adding
    if (modalMode === "add") {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // remove special chars
        .replace(/\s+/g, "-"); // spaces to hyphens
      
      setFormData(prev => ({
        ...prev,
        title,
        slug,
        category: prev.category || `TRAVEL • ${prev.destination.toUpperCase()} • ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}`
      }));
    } else {
      setFormData(prev => ({ ...prev, title }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const publicUrl = await uploadImage(file);
      setFormData(prev => ({ ...prev, coverImage: publicUrl }));
    } catch (error) {
      alert("Failed to upload image: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.destination) {
      alert("Title, slug, and destination are required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: formData.title,
        slug: formData.slug.toLowerCase().replace(/\s+/g, "-"),
        destination: formData.destination,
        countryCode: formData.countryCode.toUpperCase(),
        category: formData.category || `TRAVEL • ${formData.destination.toUpperCase()}`,
        excerpt: formData.excerpt,
        coverImage: formData.coverImage || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop",
        isFresh: formData.isFresh,
        date: formData.date
      };

      if (formData.id) {
        payload.id = formData.id;
      }

      await saveBlog(payload);
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      alert("Failed to save blog post: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = blogs.filter(b => {
    const matchStr = `${b.title} ${b.destination} ${b.category}`.toLowerCase();
    return matchStr.includes(searchQuery.toLowerCase());
  });

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif text-charcoal-900 mb-2">Blog Posts</h1>
          <p className="text-charcoal-800/70 text-sm">Manage the articles and journals published on your travel dashboard.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-charcoal-900 text-white px-4 py-2.5 rounded-md text-sm hover:bg-gold-600 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={16} /> Write Blog Post
        </button>
      </div>

      {/* Main List Box */}
      <div className="bg-white rounded-xl shadow-sm border border-cream-200 overflow-hidden">
        <div className="p-4 border-b border-cream-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-cream-100/30">
          <div className="relative w-full max-w-sm">
            <input 
              type="text" 
              placeholder="Search blog posts..." 
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
            <p className="text-charcoal-800/60 text-sm font-medium">Loading blogs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-charcoal-800/60 mb-2 font-medium">No blog posts found.</p>
            <p className="text-xs text-charcoal-800/40">Draft a new story to see it listed here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-100/50 text-xs uppercase tracking-widest text-charcoal-800/60 border-b border-cream-200">
                  <th className="p-4 font-medium">Article Title</th>
                  <th className="p-4 font-medium">Destination</th>
                  <th className="p-4 font-medium">Placement</th>
                  <th className="p-4 font-medium">Category / Date</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {filtered.map((blog) => (
                  <tr key={blog.id} className="hover:bg-cream-100/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded overflow-hidden bg-cream-200 flex-shrink-0 border border-cream-200">
                          <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="max-w-md">
                          <div className="font-medium text-charcoal-900 line-clamp-1">{blog.title}</div>
                          <div className="text-xs text-charcoal-800/50">/{blog.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-charcoal-800">
                      <span className="flex items-center gap-1 font-medium">
                        <span className="text-[10px] bg-cream-200 text-charcoal-900 px-1.5 py-0.5 rounded font-bold">{blog.countryCode}</span>
                        {blog.destination}
                      </span>
                    </td>
                    <td className="p-4">
                      {blog.isFresh ? (
                        <span className="inline-block px-2.5 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-bold rounded-full uppercase tracking-wider">
                          Fresh Off Road
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full uppercase tracking-wider">
                          Standard Blog
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-charcoal-800/70 font-mono">
                      {blog.category || blog.date}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(blog)}
                          className="p-2 text-charcoal-400 hover:text-gold-600 hover:bg-cream-100 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(blog.id, blog.title)}
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
          <div>Showing {filtered.length} blog posts</div>
        </div>
      </div>

      {/* Upsert Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-charcoal-900/65 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-cream-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-cream-200 flex justify-between items-center bg-cream-100/30">
              <h2 className="font-serif text-xl text-charcoal-900 font-bold">
                {modalMode === "add" ? "Write New Blog Post" : `Edit ${formData.title}`}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-charcoal-400 hover:text-charcoal-900 hover:bg-cream-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
              <div>
                <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                  placeholder="e.g. Slow Mornings In Kyoto"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Destination *</label>
                  <input
                    type="text"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                    className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                    placeholder="e.g. Japan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Country Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={formData.countryCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value.toUpperCase() }))}
                    className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900 font-mono"
                    placeholder="e.g. JP"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                    placeholder="e.g. slow-mornings-in-kyoto"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Cover Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.coverImage}
                      onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                      className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                      placeholder="https://..."
                    />
                    <label className="bg-cream-200 hover:bg-cream-300 border border-cream-300 rounded-md px-4 flex items-center justify-center cursor-pointer transition-colors text-charcoal-900" title="Upload local image">
                      {uploadingImage ? <Loader2 className="animate-spin text-charcoal-600" size={18} /> : <ImageIcon size={18} />}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Category (e.g. CULTURE • KYOTO • APR 2025)</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                    placeholder="e.g. CULTURE • KYOTO • APR 2025"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Sub-Date Label (e.g. BRUSSELS • BRUGES • JUN 2025)</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                    placeholder="e.g. LISBON · SINTRA · OCTOBER 2025"
                  />
                </div>

                <div className="flex items-center pt-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFresh}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFresh: e.target.checked }))}
                      className="w-5 h-5 rounded border-cream-200 text-gold-600 focus:ring-gold-500 cursor-pointer"
                    />
                    <div>
                      <span className="block text-sm font-semibold text-charcoal-900">Placement: Fresh Off The Road</span>
                      <span className="block text-xs text-charcoal-800/50">Feature this in the premium journal layout on the homepage</span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800/70 uppercase tracking-wider mb-2">Excerpt (Quick summary)</label>
                <textarea
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full border border-cream-200 rounded-md p-2.5 text-sm focus:outline-none focus:border-gold-500 bg-white text-charcoal-900"
                  placeholder="Draft a brief excerpt to hook readers..."
                />
              </div>

              {formData.coverImage && (
                <div className="border border-cream-200 rounded-xl p-4 flex flex-col items-center gap-2 bg-cream-100/10">
                  <span className="text-xs font-semibold text-charcoal-800/50 uppercase">Preview Cover Image</span>
                  <img src={formData.coverImage} alt="Cover Preview" className="h-40 w-full object-cover rounded-lg border border-cream-200" />
                </div>
              )}

              <div className="p-6 border-t border-cream-200 flex justify-end gap-3 bg-cream-100/30 -mx-6 -mb-6 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-cream-200 rounded-md text-sm hover:bg-cream-100 text-charcoal-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-charcoal-900 text-white rounded-md text-sm hover:bg-gold-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  {modalMode === "add" ? "Publish Blog" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
