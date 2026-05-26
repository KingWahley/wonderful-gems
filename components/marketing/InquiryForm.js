"use client";

import { useState, useEffect } from "react";
import { saveInquiry } from "@/lib/db";
import { Loader2 } from "lucide-react";

export default function InquiryForm({ packages = [] }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    package: packages[0]?.title || "",
    destinations: "",
    dates: "",
    budget: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Captcha State
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: "" });

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 8) + 2; // numbers 2-9
    const num2 = Math.floor(Math.random() * 8) + 2;
    setCaptcha({ num1, num2, answer: "" });
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setError("Name and Email are required.");
      return;
    }

    // Captcha Validation
    const isHuman = parseInt(captcha.answer) === (captcha.num1 + captcha.num2);
    if (!isHuman) {
      setError("Incorrect verification code. Please prove you are human!");
      generateCaptcha();
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await saveInquiry({
        name: formData.name,
        email: formData.email,
        package: formData.package,
        destinations: formData.destinations,
        dates: formData.dates,
        budget: formData.budget,
        message: formData.message,
        status: "new"
      });
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        package: packages[0]?.title || "",
        destinations: "",
        dates: "",
        budget: "",
        message: ""
      });
      generateCaptcha();
    } catch (err) {
      console.error("Error submitting inquiry:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="inquiry" className="mb-32 scroll-mt-24">
      <div className="bg-white rounded-[32px] shadow-sm p-10 md:p-14 max-w-[700px] mx-auto border border-cream-200">
        <div className="mb-8">
          <span className="text-[10px] tracking-[0.2em] font-bold text-mustard-500 uppercase block mb-3">✍️ SEND AN INQUIRY</span>
          <h2 className="text-[32px] font-serif font-bold text-charcoal-900 mb-2 leading-tight">Tell me about your trip</h2>
          <p className="text-[13px] font-medium text-charcoal-800/70">Quick form — I read every one personally and reply within 48 hours.</p>
        </div>

        {success ? (
          <div className="bg-[#96CBA8]/20 border border-[#96CBA8] rounded-[16px] p-6 text-center">
            <span className="text-3xl block mb-2">🎉</span>
            <h3 className="font-serif font-bold text-[18px] text-charcoal-900 mb-2">Thank you!</h3>
            <p className="text-[13px] font-medium text-charcoal-800/80 leading-relaxed">Your inquiry has been successfully sent. I will personally review it and get back to you within 48 hours!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-coral-500/10 border border-coral-500 rounded-[12px] p-4 text-[13px] text-coral-600 font-semibold">
                ⚠️ {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-charcoal-900 mb-2 tracking-wide">Your name <span className="text-coral-500">*</span></label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#FBF7EE] border border-charcoal-900/10 rounded-[12px] px-4 py-3.5 text-[14px] focus:outline-none focus:border-mustard-500 focus:ring-1 focus:ring-mustard-500" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-charcoal-900 mb-2 tracking-wide">Email <span className="text-coral-500">*</span></label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#FBF7EE] border border-charcoal-900/10 rounded-[12px] px-4 py-3.5 text-[14px] focus:outline-none focus:border-mustard-500 focus:ring-1 focus:ring-mustard-500" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-charcoal-900 mb-2 tracking-wide">Package</label>
              <div className="relative">
                <select 
                  name="package"
                  value={formData.package}
                  onChange={handleChange}
                  className="w-full bg-[#FBF7EE] border border-charcoal-900/10 rounded-[12px] px-4 py-3.5 text-[14px] focus:outline-none focus:border-mustard-500 focus:ring-1 focus:ring-mustard-500 appearance-none text-charcoal-900 cursor-pointer"
                >
                  {packages.map((pkg, idx) => (
                    <option key={idx} value={pkg.title}>{pkg.title}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-charcoal-500">
                  <span className="text-[10px]">▼</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-charcoal-900 mb-2 tracking-wide">Destination(s)</label>
                <input 
                  type="text" 
                  name="destinations"
                  value={formData.destinations}
                  onChange={handleChange}
                  placeholder="e.g. Japan, Portugal..." 
                  className="w-full bg-[#FBF7EE] border border-charcoal-900/10 rounded-[12px] px-4 py-3.5 text-[14px] placeholder:text-charcoal-900/40 focus:outline-none focus:border-mustard-500 focus:ring-1 focus:ring-mustard-500" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-charcoal-900 mb-2 tracking-wide">Approx. dates</label>
                <input 
                  type="text" 
                  name="dates"
                  value={formData.dates}
                  onChange={handleChange}
                  placeholder="e.g. Sept 2026, 10 days" 
                  className="w-full bg-[#FBF7EE] border border-charcoal-900/10 rounded-[12px] px-4 py-3.5 text-[14px] placeholder:text-charcoal-900/40 focus:outline-none focus:border-mustard-500 focus:ring-1 focus:ring-mustard-500" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-charcoal-900 mb-2 tracking-wide">Rough budget (optional)</label>
              <input 
                type="text" 
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="$ per person" 
                className="w-full bg-[#FBF7EE] border border-charcoal-900/10 rounded-[12px] px-4 py-3.5 text-[14px] placeholder:text-charcoal-900/40 focus:outline-none focus:border-mustard-500 focus:ring-1 focus:ring-mustard-500" 
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-charcoal-900 mb-2 tracking-wide">Tell me what you're dreaming of</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4" 
                placeholder="Slow mornings? Markets? Off-the-beaten-path? Tell me everything." 
                className="w-full bg-[#FBF7EE] border border-charcoal-900/10 rounded-[12px] px-4 py-3.5 text-[14px] placeholder:text-charcoal-900/40 focus:outline-none focus:border-mustard-500 focus:ring-1 focus:ring-mustard-500 resize-none"
              />
            </div>

            {/* Elegant Anti-Bot Verification Checkbox Card */}
            <div className="bg-[#FAF8F5] border border-charcoal-900/5 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-inner">
              <div className="flex items-center gap-3">
                <span className="text-xl">🛡️</span>
                <div className="text-left">
                  <h4 className="text-[12px] font-bold text-charcoal-900 uppercase tracking-wider mb-0.5">Human Verification</h4>
                  <p className="text-[11px] text-charcoal-800/60 font-medium leading-tight">Please complete this quick check to prevent robot spam.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                <span className="text-[13px] font-bold text-charcoal-900 bg-cream-200 px-3 py-2 rounded-lg border border-charcoal-900/5 font-mono select-none">
                  {captcha.num1} + {captcha.num2} =
                </span>
                <input 
                  type="number"
                  name="captcha"
                  required
                  placeholder="?"
                  value={captcha.answer}
                  onChange={(e) => setCaptcha(prev => ({ ...prev, answer: e.target.value }))}
                  className="w-16 bg-white border border-charcoal-900/10 rounded-lg px-2.5 py-2 text-center text-[14px] font-bold text-charcoal-900 focus:outline-none focus:border-mustard-500 focus:ring-1 focus:ring-mustard-500 font-mono placeholder:text-charcoal-900/20"
                />
              </div>
            </div>
            
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-[#E6B63E] hover:bg-[#D4A532] text-white text-[11px] tracking-[0.2em] font-bold uppercase py-4 px-8 rounded-full transition-colors w-full sm:w-auto shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading && <Loader2 className="animate-spin" size={14} />}
                SEND INQUIRY &rarr;
              </button>
              <p className="text-[9px] text-charcoal-900/40 mt-4 tracking-wide font-medium">By submitting, you agree to be contacted about your inquiry. No spam, ever.</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
