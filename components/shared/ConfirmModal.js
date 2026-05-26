"use client";
import React from "react";
import { Loader2 } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  emoji = "💡",
  variant = "primary"
}) {
  if (!isOpen) return null;

  const confirmBtnClass = variant === "danger"
    ? "bg-coral-500 hover:bg-coral-600 text-white"
    : "bg-mustard-500 hover:bg-mustard-600 text-white";

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-charcoal-900/40 backdrop-blur-md flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 animate-fade-in" onClick={!loading ? onCancel : undefined}></div>

      {/* Modal Box */}
      <div className="bg-[#FBF7EE] w-full max-w-md rounded-[28px] border border-charcoal-900/10 shadow-2xl p-7 text-center relative z-10 animate-fade-in transform scale-100 transition-all duration-300">
        {/* Emoji Icon Container */}
        <div className="w-16 h-16 rounded-full bg-cream-200 border border-charcoal-900/5 flex items-center justify-center text-3xl mx-auto mb-5 shadow-inner">
          {emoji}
        </div>

        {/* Text */}
        <h3 className="font-serif text-2xl font-bold text-charcoal-900 mb-2 leading-snug">
          {title}
        </h3>
        <p className="text-sm text-charcoal-700/80 leading-relaxed font-light mb-8 max-w-sm mx-auto">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="flex-1 py-3 px-5 bg-white border border-charcoal-900/10 hover:bg-charcoal-900/5 text-charcoal-800 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`flex-1 py-3 px-5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 ${confirmBtnClass}`}
          >
            {loading && <Loader2 className="animate-spin w-3 h-3" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
