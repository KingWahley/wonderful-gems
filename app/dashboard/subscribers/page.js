"use client";

import { useState, useEffect } from "react";
import { fetchSubscribers, deleteSubscriber } from "@/lib/db";
import { 
  Search, Mail, Clipboard, ClipboardCheck, Trash2, RefreshCw, 
  AlertCircle, Inbox, Loader2
} from "lucide-react";

export default function SubscribersDashboard() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);

  async function loadSubscribers() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchSubscribers();
      setSubscribers(data || []);
    } catch (err) {
      console.warn("Failed to load subscribers:", err);
      if (
        !err.message || 
        err.message === "{}" || 
        err.message.includes("relation") || 
        err.message.includes("does not exist") || 
        err.message.includes("42P01")
      ) {
        setError("Database tables are not set up yet. Please execute the SQL queries in 'supabase_tables.sql' in your Supabase SQL Editor first!");
      } else {
        setError("Failed to fetch subscribers: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubscribers();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this subscriber?")) return;

    try {
      await deleteSubscriber(id);
      setSubscribers(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.warn("Failed to delete subscriber:", err);
      alert("Error removing subscriber: " + err.message);
    }
  };

  const handleCopyEmails = () => {
    if (subscribers.length === 0) return;
    const emails = subscribers.map(s => s.email).join(", ");
    navigator.clipboard.writeText(emails)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.warn("Could not copy emails to clipboard:", err);
        alert("Failed to copy emails.");
      });
  };

  const filteredSubscribers = subscribers.filter(item => 
    (item.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-5 border-b border-brand-border gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-brand-ink flex items-center gap-3">
            <Mail size={22} className="text-[#c7962d]" /> 
            Newsletter Subscribers
          </h1>
          <p className="text-brand-muted text-xs mt-1">Manage email signups submitted from the Homepage newsletter form.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <button 
            onClick={handleCopyEmails}
            disabled={subscribers.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#c7962d] text-white text-xs font-bold rounded-lg hover:bg-[#b58522] transition-all shadow-sm w-full sm:w-auto disabled:opacity-50"
          >
            {copied ? (
              <>
                <ClipboardCheck size={14} />
                Copied Emails!
              </>
            ) : (
              <>
                <Clipboard size={14} />
                Copy All Emails
              </>
            )}
          </button>
          <button 
            onClick={loadSubscribers} 
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-brand-border text-xs font-bold text-brand-ink rounded-lg hover:bg-brand-bg transition-all shadow-sm disabled:opacity-50 shrink-0"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl mb-8 flex items-start gap-4 shadow-sm">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-bold text-red-900 text-sm mb-1">Database Sync Needed</h3>
            <p className="text-red-700 text-xs leading-relaxed mb-4">{error}</p>
            <div className="bg-red-950 text-red-200 p-4 rounded-lg font-mono text-[11px] overflow-x-auto select-all leading-relaxed whitespace-pre-wrap max-w-2xl">
{`CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) for email privacy
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for safe reruns
DROP POLICY IF EXISTS "Allow public insert to newsletter_subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow admin full access to newsletter_subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow local dev read/write to newsletter_subscribers" ON newsletter_subscribers;

-- Allow anyone to subscribe to the newsletter
CREATE POLICY "Allow public insert to newsletter_subscribers" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Allow admins full access
CREATE POLICY "Allow admin full access to newsletter_subscribers" ON newsletter_subscribers
  FOR ALL TO authenticated USING (true);

-- Explicitly grant permissions to public (required for Stitch database proxies and any connection role)
GRANT ALL ON newsletter_subscribers TO public;

-- (DEVELOPMENT ONLY): If you don't have Auth set up in your CMS layout yet,
-- uncomment this policy to view/manage subscribers locally using the anon key:
-- CREATE POLICY "Allow local dev read/write to newsletter_subscribers" ON newsletter_subscribers FOR ALL TO anon USING (true);`}
            </div>
            <p className="text-red-600/80 text-[10px] mt-2">Copy this SQL and paste it into your Supabase SQL Editor, then refresh this page.</p>
          </div>
        </div>
      ) : null}

      <div className="max-w-4xl space-y-6">
        {/* Controls Bar */}
        <div className="bg-white p-4 rounded-xl border border-brand-border shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={15} />
            <input 
              type="text" 
              placeholder="Search subscribers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-bg/50 border border-brand-border rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-[#c7962d] transition-colors" 
            />
          </div>

          <div className="text-brand-muted text-xs font-semibold shrink-0">
            Total Subscribers: {filteredSubscribers.length}
          </div>
        </div>

        {/* List/Table */}
        {loading ? (
          <div className="bg-white border border-brand-border rounded-2xl p-16 flex flex-col items-center justify-center shadow-sm">
            <Loader2 className="animate-spin text-[#c7962d] mb-4" size={32} />
            <span className="text-brand-muted text-xs">Loading subscribers...</span>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="bg-white border border-brand-border rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-12 h-12 bg-brand-bg rounded-full flex items-center justify-center text-brand-muted mb-4">
              <Inbox size={20} />
            </div>
            <h3 className="font-bold text-brand-ink text-sm mb-1">No subscribers found</h3>
            <p className="text-brand-muted text-xs max-w-xs leading-relaxed">
              {searchTerm ? "No matches found for your search." : "Email subscriptions will appear here once users join your club."}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-brand-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto scrollbar-luxury">
              <table className="w-full text-left text-xs whitespace-nowrap table-auto">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-bg/10">
                    <th className="p-4 pt-5 pb-3 font-bold text-brand-muted uppercase tracking-wider">Email Address</th>
                    <th className="p-4 pt-5 pb-3 font-bold text-brand-muted uppercase tracking-wider">Subscribed Date</th>
                    <th className="p-4 pt-5 pb-3 font-bold text-brand-muted uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40">
                  {filteredSubscribers.map((item) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-brand-bg/25 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-semibold text-[13px] text-brand-ink">{item.email}</span>
                      </td>
                      <td className="p-4 text-brand-muted text-[11px]">
                        {new Date(item.created_at).toLocaleDateString(undefined, { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDelete(item.id)}
                          title="Remove Subscriber"
                          className="p-2 hover:bg-red-50 hover:text-red-600 text-brand-muted rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
