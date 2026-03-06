"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "tripwit_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if no decision has been made yet
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 text-white px-4 py-3 flex items-center gap-4 shadow-2xl">
      <p className="flex-1 text-xs text-slate-300">
        We use cookies for analytics and advertising to keep TripWit free.{" "}
        <a
          href="/privacy"
          target="_blank"
          className="underline text-slate-200 hover:text-white"
        >
          Privacy policy
        </a>
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={decline}
          className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
        >
          Decline
        </button>
        <button
          onClick={accept}
          className="px-4 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-700 font-medium transition-colors"
        >
          Accept
        </button>
      </div>
      <button
        onClick={decline}
        className="text-slate-500 hover:text-white ml-1"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
