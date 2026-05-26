"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || "Invalid login credentials.");
      } else {
        router.refresh(); // Refresh route matching state in middleware
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login exception:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF7EE] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans text-brand-ink">
      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#c7962d]/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-coral-500/5 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-[440px] z-10 space-y-8">
        {/* Brand Logo Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img src="/images/logo.png" alt="The Long Way" className="h-16 w-auto object-contain" />
          </div>
          <p className="text-brand-muted text-xs uppercase tracking-[0.2em] font-semibold mt-2.5">
            Login here to access the cms dashboard 
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-brand-border rounded-[24px] p-8 md:p-10 shadow-xl shadow-brand-ink/5 relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-brand-ink/80 tracking-wide uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
                <input
                  type="email"
                  required
                  placeholder="admin@thelongway.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full bg-brand-bg/40 border border-brand-border rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-[#c7962d] focus:ring-1 focus:ring-[#c7962d] transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-bold text-brand-ink/80 tracking-wide uppercase">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-brand-bg/40 border border-brand-border rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-[#c7962d] focus:ring-1 focus:ring-[#c7962d] transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#c7962d] hover:bg-[#b58522] text-white font-bold py-3.5 px-6 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-[#c7962d]/10 transition-all disabled:opacity-60 h-[48px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center pt-2">
          <a
            href="/"
            className="text-[11px] font-bold text-brand-muted hover:text-[#c7962d] uppercase tracking-wider transition-colors"
          >
            &larr; Return to main site
          </a>
        </div>
      </div>
    </div>
  );
}
