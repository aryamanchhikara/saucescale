"use client";

import { motion } from "framer-motion";
import { AnalyzedItem } from "@/lib/types";
import { getTierColor } from "@/lib/scoring";

interface Props {
  items: AnalyzedItem[];
  focusedId?: string;
  onFocus: (id: string) => void;
}

export default function HistoryStrip({ items, focusedId, onFocus }: Props) {
  if (items.length === 0) return null;

  const visible = items.slice(0, 10);

  return (
    <div className="w-full">
      <h2
        className="text-xs text-[#FFD700] mb-3 drop-shadow-[1px_1px_0_#000]"
        style={{ fontFamily: "var(--font-press-start)" }}
      >
        ★ HISTORY
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {visible.map((item, i) => {
          const sauceScore = Math.round(Math.max(0, Math.min(100, item.sauceUp - item.sauceDown * 0.5)));
          const isFocused = item.id === focusedId;
          const color = getTierColor(item.tier);

          return (
            <motion.button
              key={item.id}
              onClick={() => onFocus(item.id)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex-shrink-0 w-28 overflow-hidden transition-all"
              style={{
                background: "#0d1548",
                border: isFocused ? `3px solid #FFD700` : `3px solid #2a3a9e`,
                boxShadow: isFocused ? "4px 4px 0 #FFD700" : "3px 3px 0 #000",
              }}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-20 object-cover"
                  style={{ borderBottom: "2px solid #1a2470" }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div className="w-full h-20 flex items-center justify-center" style={{ background: "#1a2470" }}>
                  <span className="text-blue-600 text-xs">NO IMG</span>
                </div>
              )}
              <div className="p-2">
                <p className="text-xs font-bold truncate" style={{ color }}>{item.brand}</p>
                <p className="text-xs text-blue-300 truncate">{item.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-mono text-[#FFD700]">{sauceScore}</span>
                  <span
                    className="text-[9px] px-1 py-0.5 font-semibold"
                    style={{ background: color + "22", color, border: `1px solid ${color}` }}
                  >
                    {item.tier === "Drip Lord" ? "DL" : item.tier === "No Sauce" ? "NS" : item.tier}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
