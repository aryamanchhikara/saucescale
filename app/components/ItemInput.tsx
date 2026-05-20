"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onAnalyze: (url: string) => void;
  loading: boolean;
}

const SAMPLE_URL = "https://www.ssense.com/en-us/men/product/salehe-bembury/black-crocs-edition-pollex-clog/9373891";

export default function ItemInput({ onAnalyze, loading }: Props) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onAnalyze(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="PASTE ITEM URL HERE…"
          className="flex-1 px-5 py-4 text-white text-sm outline-none placeholder-blue-400 transition-all"
          style={{
            background: "#0d1548",
            border: "3px solid #2a3a9e",
            boxShadow: "inset 0 0 0 1px rgba(255,215,0,0.05)",
            fontFamily: "var(--font-geist-mono)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#FFD700")}
          onBlur={(e) => (e.target.style.borderColor = "#2a3a9e")}
          disabled={loading}
        />
        <motion.button
          type="submit"
          disabled={loading || !url.trim()}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="px-8 py-4 font-bold text-sm text-black shrink-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: loading || !url.trim() ? "#555" : "#FFD700",
            border: "3px solid #000",
            boxShadow: loading || !url.trim() ? "none" : "4px 4px 0px #000",
            fontFamily: "var(--font-press-start)",
            fontSize: "10px",
          }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              RATING…
            </span>
          ) : (
            "ANALYZE ▶"
          )}
        </motion.button>
      </div>
      <p className="mt-2.5 text-xs text-blue-400 text-center">
        TRY:{" "}
        <button
          type="button"
          onClick={() => setUrl(SAMPLE_URL)}
          className="text-[#FFD700] hover:underline underline-offset-2 transition-colors"
        >
          Salehe Bembury × Crocs Pollex Clog
        </button>
      </p>
    </form>
  );
}
