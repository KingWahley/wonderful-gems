"use client";

import { useState } from "react";
import { saveSubscriber } from "@/lib/db";
import { Loader2 } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await saveSubscriber(email);
      setSuccess(true);
      setEmail("");
    } catch (err) {
      console.error("Error subscribing to newsletter:", err);
      // Check for uniqueness constraint error
      if (err.message && (err.message.includes("unique") || err.message.includes("duplicate") || err.message.includes("already exists"))) {
        setError("This email is already subscribed!");
      } else {
        setError("Failed to subscribe. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-gold-600 uppercase tracking-widest text-xs font-semibold mb-3 block">Join The Club</span>
        <h2 className="text-4xl md:text-5xl font-serif text-charcoal-900 mb-6">Wanderlust in Your Inbox</h2>
        <p className="text-charcoal-800/70 mb-10 font-light leading-relaxed max-w-2xl mx-auto">
          Subscribe to our exclusive newsletter to receive curated itineraries, luxury travel inspiration, and first access to our limited-availability tours.
        </p>
        
        {success ? (
          <div className="max-w-xl mx-auto bg-[#96CBA8]/20 border border-[#96CBA8] rounded-[16px] p-6">
            <span className="text-2xl block mb-2">🎉</span>
            <p className="text-[13px] font-bold text-[#3d5e47]">Success! You have subscribed to our newsletter.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row max-w-xl mx-auto gap-3 items-end">
            <div className="flex-grow w-full text-left">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-charcoal-900 py-3 px-2 text-charcoal-900 focus:outline-none focus:border-gold-600 bg-transparent text-[14px]"
                required
                disabled={loading}
              />
              {error && (
                <p className="text-xs text-coral-500 mt-1 font-semibold">⚠️ {error}</p>
              )}
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-charcoal-900 text-white px-8 py-3.5 text-xs tracking-widest uppercase hover:bg-gold-500 transition-colors sm:w-auto w-full mt-4 sm:mt-0 flex items-center justify-center gap-2 disabled:opacity-50 h-[46px] shrink-0"
            >
              {loading && <Loader2 className="animate-spin" size={14} />}
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
