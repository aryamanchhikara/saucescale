"use client";

import { motion } from "framer-motion";
import { getNicheLabel } from "@/lib/scoring";

interface Props {
  score: number;
}

const THRESHOLDS = [
  { pct: 0,   label: "MALL CORE" },
  { pct: 25,  label: "MAINSTREAM" },
  { pct: 50,  label: "IN THE KNOW" },
  { pct: 75,  label: "DEEP CUTS" },
  { pct: 100, label: "FORUM-PILLED" },
];

export default function NicheMeter({ score }: Props) {
  const label = getNicheLabel(score).toUpperCase();

  return (
    <div
      className="p-5 flex flex-col"
      style={{ background: "#0d1548", border: "3px solid #2a3a9e", boxShadow: "5px 5px 0 #000" }}
    >
      <h2
        className="text-xs text-[#FFD700] mb-4 drop-shadow-[1px_1px_0_#000]"
        style={{ fontFamily: "var(--font-press-start)" }}
      >
        ★ NICHE METER
      </h2>

      <div className="flex gap-4 flex-1">
        {/* Vertical bar */}
        <div
          className="relative w-8 overflow-hidden flex-shrink-0 self-stretch min-h-[120px]"
          style={{ background: "#1a2470", border: "2px solid #2a3a9e" }}
        >
          <motion.div
            className="absolute bottom-0 left-0 right-0"
            style={{
              background: "linear-gradient(to top, #4a6ab0, #60a5fa, #a78bfa, #f97316, #FFD700)",
            }}
            initial={{ height: "0%" }}
            animate={{ height: `${score}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 18 }}
          />
          {/* Glowing top edge */}
          <motion.div
            className="absolute left-0 right-0 h-1.5 blur-sm"
            style={{ background: "#FFD700", boxShadow: "0 0 8px 2px #FFD70088" }}
            initial={{ bottom: "0%" }}
            animate={{ bottom: `${Math.max(0, score - 1)}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 18 }}
          />
        </div>

        {/* Labels */}
        <div className="flex flex-col justify-between flex-1 py-0.5 self-stretch min-h-[120px]">
          {[...THRESHOLDS].reverse().map(({ pct, label: l }) => (
            <div key={pct} className="flex items-center gap-2">
              <span
                className="text-[10px] transition-colors"
                style={{
                  color: label === l ? "#FFD700" : "#2a4a8e",
                  fontFamily: label === l ? "var(--font-press-start)" : "inherit",
                  fontWeight: label === l ? "bold" : "normal",
                  textShadow: label === l ? "1px 1px 0 #000" : "none",
                }}
              >
                {l}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 text-center">
        <motion.span
          key={score}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold text-[#FFD700]"
          style={{ fontFamily: "var(--font-press-start)", textShadow: "2px 2px 0 #000" }}
        >
          {score}
        </motion.span>
        <span className="text-blue-400 text-sm ml-1">/100</span>
      </div>
    </div>
  );
}
