"use client";

import { useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { AnalyzedItem } from "@/lib/types";
import { getTierColor } from "@/lib/scoring";

interface Props {
  items: AnalyzedItem[];
  focusedId?: string;
}

interface TooltipPayload {
  payload: AnalyzedItem;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload || !payload[0]) return null;
  const item = payload[0].payload;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-3 max-w-[200px]"
        style={{
          background: "#0d1548",
          border: "3px solid #FFD700",
          boxShadow: "4px 4px 0 #000",
        }}
      >
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-28 object-cover mb-2"
            style={{ border: "2px solid #2a3a9e" }}
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        )}
        <p className="text-xs font-bold text-[#FFD700] truncate">{item.brand}</p>
        <p className="text-xs text-blue-200 truncate">{item.name}</p>
        <p className="text-xs text-blue-400 mt-1 italic">"{item.verdict}"</p>
        <span
          className="inline-block mt-1.5 text-xs px-2 py-0.5 font-semibold"
          style={{
            background: getTierColor(item.tier) + "33",
            color: getTierColor(item.tier),
            border: `1px solid ${getTierColor(item.tier)}`,
          }}
        >
          {item.tier}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}

function QuadrantLabel({ x, y, text, subtext }: { x: string; y: string; text: string; subtext: string }) {
  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
    >
      <p className="text-xs font-bold text-blue-700 text-center leading-tight">{text}</p>
      <p className="text-[10px] text-blue-800 text-center">{subtext}</p>
    </div>
  );
}

export default function SauceGraph({ items, focusedId }: Props) {
  const isEmpty = items.length === 0;

  const data = items.map((item) => ({
    ...item,
    x: item.sauceDown,
    y: item.sauceUp,
    z: item.price ? Math.max(6, Math.min(20, item.price / 80)) : 8,
  }));

  return (
    <div
      className="p-5 h-full min-h-[340px] flex flex-col"
      style={{ background: "#0d1548", border: "3px solid #2a3a9e", boxShadow: "5px 5px 0 #000" }}
    >
      <h2
        className="text-xs text-[#FFD700] mb-4 drop-shadow-[1px_1px_0_#000]"
        style={{ fontFamily: "var(--font-press-start)" }}
      >
        ★ SAUCE MAP
      </h2>

      {isEmpty ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-blue-400 text-sm">ANALYZE AN ITEM TO PLOT IT</p>
        </div>
      ) : (
        <div className="flex-1 relative">
          <div className="absolute inset-0 pointer-events-none z-10 flex">
            <div className="relative flex-1">
              <QuadrantLabel x="25%" y="25%" text="PURE HEAT" subtext="rare + bold" />
              <QuadrantLabel x="75%" y="25%" text="TRY HARD" subtext="all noise" />
              <QuadrantLabel x="25%" y="75%" text="FORGETTABLE" subtext="no presence" />
              <QuadrantLabel x="75%" y="75%" text="BASIC" subtext="safe + soulless" />
            </div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#1a2470" />
              <XAxis
                dataKey="x"
                type="number"
                domain={[0, 100]}
                tick={{ fill: "#4a6ab0", fontSize: 10 }}
                label={{ value: "← SAUCE DOWN", position: "insideBottom", offset: -15, fill: "#4a6ab0", fontSize: 10 }}
              />
              <YAxis
                dataKey="y"
                type="number"
                domain={[0, 100]}
                tick={{ fill: "#4a6ab0", fontSize: 10 }}
                label={{ value: "SAUCE UP ↑", angle: -90, position: "insideLeft", offset: 15, fill: "#4a6ab0", fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
              <Scatter data={data} isAnimationActive>
                {data.map((entry) => {
                  const isFocused = entry.id === focusedId;
                  const isNewest = entry.id === items[0]?.id;
                  return (
                    <Cell
                      key={entry.id}
                      fill={getTierColor(entry.tier)}
                      fillOpacity={isFocused ? 1 : isNewest ? 0.9 : 0.6}
                      stroke={isFocused || isNewest ? getTierColor(entry.tier) : "transparent"}
                      strokeWidth={isFocused ? 3 : isNewest ? 2 : 0}
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
