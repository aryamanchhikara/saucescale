"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { AnalyzedItem } from "@/lib/types";

interface Props {
  score: number;
  tier: AnalyzedItem["tier"] | null;
}

const TIER_COLORS: Record<string, string> = {
  "No Sauce": "#6b7280",
  Mid: "#60a5fa",
  Saucy: "#a78bfa",
  Heat: "#f97316",
  "Drip Lord": "#FFD700",
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function scoreToAngle(score: number): number {
  return -90 + (score / 100) * 180;
}

export default function SauceMeter({ score, tier }: Props) {
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  const angle = useTransform(spring, (v) => scoreToAngle(v));
  const cx = 120, cy = 120, r = 88;

  useEffect(() => { spring.set(score); }, [score, spring]);

  const color = tier ? (TIER_COLORS[tier] ?? "#FFD700") : "#FFD700";

  const needleX = useTransform(angle, (a) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return cx + r * Math.cos(rad);
  });
  const needleY = useTransform(angle, (a) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return cy + r * Math.sin(rad);
  });

  const arcSegments = [
    { start: -90, end: -54, color: "#ef4444" },
    { start: -54, end: -18, color: "#f97316" },
    { start: -18, end: 18,  color: "#eab308" },
    { start: 18,  end: 54,  color: "#22c55e" },
    { start: 54,  end: 90,  color: "#FFD700" },
  ];

  return (
    <div
      className="p-5 flex flex-col"
      style={{ background: "#0d1548", border: "3px solid #2a3a9e", boxShadow: "5px 5px 0 #000" }}
    >
      <h2
        className="text-xs text-[#FFD700] mb-3 drop-shadow-[1px_1px_0_#000]"
        style={{ fontFamily: "var(--font-press-start)" }}
      >
        ★ SAUCE SCORE
      </h2>

      <div className="flex-1 flex flex-col items-center justify-center">
        <svg viewBox="0 0 240 130" className="w-full max-w-[240px]">
          {/* Track */}
          <path d={describeArc(cx, cy, r, -90, 90)} fill="none" stroke="#1a2470" strokeWidth="16" strokeLinecap="round" />

          {/* Colored arc segments up to score */}
          {arcSegments.map((seg, i) => {
            const segEnd = Math.min(seg.end, -90 + (score / 100) * 180);
            if (score <= (i / 5) * 100) return null;
            return (
              <path
                key={i}
                d={describeArc(cx, cy, r, seg.start, segEnd)}
                fill="none"
                stroke={seg.color}
                strokeWidth="16"
                strokeLinecap={i === 0 ? "round" : "butt"}
              />
            );
          })}

          {/* Needle */}
          <motion.line x1={cx} y1={cy} x2={needleX} y2={needleY}
            stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="6" fill="#FFD700" stroke="#000" strokeWidth="2" />

          {/* Score number */}
          <text x={cx} y={cy - 8} textAnchor="middle" fill="#FFD700"
            fontSize="30" fontWeight="800" fontFamily="monospace">
            {score}
          </text>
        </svg>

        <motion.div key={tier} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-center -mt-2">
          <span className="text-base font-bold tracking-wide" style={{ color, fontFamily: "var(--font-press-start)", fontSize: "10px" }}>
            {tier ?? "???"}
          </span>
          <p className="text-xs text-blue-400 mt-1">LAST 5 ITEMS · WEIGHTED</p>
        </motion.div>
      </div>
    </div>
  );
}
