"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ItemInput from "./components/ItemInput";
import SauceGraph from "./components/SauceGraph";
import SauceMeter from "./components/SauceMeter";
import NicheMeter from "./components/NicheMeter";
import HistoryStrip from "./components/HistoryStrip";
import ShimmerSkeleton from "./components/ShimmerSkeleton";
import ManualEntryForm from "./components/ManualEntryForm";
import { AnalyzedItem, ScrapedItem } from "@/lib/types";
import { getHistory, addToHistory } from "@/lib/storage";
import { computeRollingSauceScore, computeAverageNiche } from "@/lib/scoring";

export default function Home() {
  const [history, setHistory] = useState<AnalyzedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | undefined>();
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [pendingUrl, setPendingUrl] = useState("");
  const [latestItem, setLatestItem] = useState<AnalyzedItem | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const sauceScore = computeRollingSauceScore(history);
  const nicheScore = computeAverageNiche(history);
  const currentTier = latestItem?.tier ?? history[0]?.tier ?? null;

  async function runAnalysis(url: string, manualItem?: ScrapedItem) {
    setLoading(true);
    setError(null);
    setShowManualEntry(false);

    try {
      const body = manualItem ? { url, manualItem } : { url };

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needsManualEntry) {
          setPendingUrl(url);
          setShowManualEntry(true);
          setLoading(false);
          return;
        }
        throw new Error(data.error || "Analysis failed");
      }

      const item = data as AnalyzedItem;
      const updated = addToHistory(item);
      setHistory(updated);
      setFocusedId(item.id);
      setLatestItem(item);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleManualSubmit(scrapedItem: ScrapedItem) {
    await runAnalysis(pendingUrl, scrapedItem);
  }

  const hasItems = history.length > 0;

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ background: "#07071a" }}>
      {/* Top bar */}
      <header
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: "3px solid #FFD700", background: "#0d1548" }}
      >
        <div>
          <h1
            className="text-lg tracking-tight text-[#FFD700] drop-shadow-[2px_2px_0px_#000]"
            style={{ fontFamily: "var(--font-press-start)" }}
          >
            SAUCE SCALE
          </h1>
          <p className="text-blue-300 text-[10px] tracking-widest mt-1">
            ★ RATE YOUR FITS, SCIENTIFICALLY ★
          </p>
        </div>
        {hasItems && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-blue-300"
          >
            <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-pulse" />
            {history.length} RATED
          </motion.div>
        )}
      </header>

      <main className="flex-1 px-4 sm:px-6 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Hero input */}
        <motion.section
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <ItemInput onAnalyze={(url) => runAnalysis(url)} loading={loading} />

          <AnimatePresence>
            {error && (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-300 text-sm px-4 py-2"
                style={{ border: "2px solid #ef4444", background: "#1a0a0a", boxShadow: "3px 3px 0 #000" }}
              >
                ✖ {error}
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showManualEntry && (
              <ManualEntryForm
                url={pendingUrl}
                onSubmit={handleManualSubmit}
                onCancel={() => setShowManualEntry(false)}
              />
            )}
          </AnimatePresence>
        </motion.section>

        {loading && <ShimmerSkeleton />}

        {!loading && (
          <AnimatePresence mode="wait">
            {hasItems ? (
              <motion.section
                key="panels"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                <div className="lg:col-span-2">
                  <SauceGraph items={history} focusedId={focusedId} />
                </div>
                <div className="flex flex-col gap-6">
                  <SauceMeter score={sauceScore} tier={currentTier} />
                  <NicheMeter score={nicheScore} />
                </div>
              </motion.section>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center gap-6 py-24 text-center"
              >
                <div className="text-6xl animate-bounce select-none">⭐</div>
                <h2
                  className="text-[#FFD700] text-sm drop-shadow-[2px_2px_0px_#000]"
                  style={{ fontFamily: "var(--font-press-start)" }}
                >
                  INSERT ITEM
                </h2>
                <p className="text-blue-300 text-sm max-w-sm">
                  Paste a link from SSENSE, Grailed, Farfetch, END., Dover Street Market to get your first sauce score.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Latest item result card */}
        <AnimatePresence>
          {latestItem && !loading && (
            <motion.section
              key={latestItem.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-5 flex flex-col sm:flex-row gap-5"
              style={{
                background: "#0d1548",
                border: "3px solid #FFD700",
                boxShadow: "5px 5px 0px #000",
              }}
            >
              {latestItem.imageUrl && (
                <img
                  src={latestItem.imageUrl}
                  alt={latestItem.name}
                  className="w-full sm:w-28 h-40 sm:h-28 object-cover flex-shrink-0"
                  style={{ border: "2px solid #2a3a9e", imageRendering: "auto" }}
                  onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="text-[#FFD700] font-bold text-sm">{latestItem.brand}</p>
                    <p className="text-white font-semibold">{latestItem.name}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      ["Sauce Up", latestItem.sauceUp],
                      ["Sauce Down", latestItem.sauceDown],
                      ["Niche", latestItem.niche],
                    ].map(([label, val]) => (
                      <span
                        key={label}
                        className="text-xs px-3 py-1 text-blue-200"
                        style={{ background: "#1a2470", border: "2px solid #2a3a9e", boxShadow: "2px 2px 0 #000" }}
                      >
                        {label}: <strong className="text-[#FFD700]">{val}</strong>
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-blue-200 text-sm mt-2 italic">"{latestItem.verdict}"</p>
                {latestItem.price && (
                  <p className="text-blue-400 text-xs mt-1">${latestItem.price.toLocaleString()}</p>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {hasItems && !loading && (
          <section>
            <HistoryStrip items={history} focusedId={focusedId} onFocus={setFocusedId} />
          </section>
        )}
      </main>

      <footer
        className="px-6 py-3 text-center text-blue-400 text-xs"
        style={{ borderTop: "3px solid #2a3a9e", background: "#0d1548" }}
      >
        © SAUCE SCALE — POWERED BY OPENROUTER — INSERT COIN TO CONTINUE
      </footer>
    </div>
  );
}
