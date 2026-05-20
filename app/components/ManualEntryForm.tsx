"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ScrapedItem } from "@/lib/types";

interface Props {
  url: string;
  onSubmit: (item: ScrapedItem) => void;
  onCancel: () => void;
}

const inputStyle = {
  background: "#07071a",
  border: "2px solid #2a3a9e",
  color: "white",
  outline: "none",
  width: "100%",
  padding: "10px 16px",
  fontSize: "14px",
};

export default function ManualEntryForm({ url, onSubmit, onCancel }: Props) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("clothing");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim() || "Unknown Item",
      brand: brand.trim() || "Unknown Brand",
      price: price ? parseFloat(price) : null,
      imageUrl: imageUrl.trim() || null,
      description: description.trim(),
      category: category.trim() || "clothing",
      url,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 w-full max-w-2xl mx-auto"
      style={{ background: "#0d1548", border: "3px solid #FFD700", boxShadow: "5px 5px 0 #000" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3
            className="text-[#FFD700] text-xs drop-shadow-[1px_1px_0_#000]"
            style={{ fontFamily: "var(--font-press-start)" }}
          >
            MANUAL ENTRY
          </h3>
          <p className="text-blue-300 text-xs mt-1">URL couldn't be scraped — fill in details to still get rated.</p>
        </div>
        <button
          onClick={onCancel}
          className="text-blue-400 hover:text-[#FFD700] text-xl leading-none transition-colors"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input required value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Item name *" style={inputStyle}
          className="col-span-full placeholder-blue-600 focus:border-yellow-400 transition-colors" />
        <input required value={brand} onChange={(e) => setBrand(e.target.value)}
          placeholder="Brand *" style={inputStyle}
          className="placeholder-blue-600 focus:border-yellow-400 transition-colors" />
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
          placeholder="Price (USD)" style={inputStyle}
          className="placeholder-blue-600 focus:border-yellow-400 transition-colors" />
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Image URL (optional)" style={inputStyle}
          className="col-span-full placeholder-blue-600 focus:border-yellow-400 transition-colors" />
        <input value={category} onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (jacket, sneakers…)" style={inputStyle}
          className="placeholder-blue-600 focus:border-yellow-400 transition-colors" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)" rows={2}
          style={{ ...inputStyle, resize: "none" }}
          className="col-span-full placeholder-blue-600 focus:border-yellow-400 transition-colors" />

        <div className="col-span-full flex gap-3">
          <button type="button" onClick={onCancel}
            className="flex-1 py-2.5 text-blue-400 text-sm hover:text-white transition-colors"
            style={{ border: "2px solid #2a3a9e" }}>
            CANCEL
          </button>
          <button type="submit"
            className="flex-1 py-2.5 text-black font-bold text-sm transition-colors"
            style={{ background: "#FFD700", border: "3px solid #000", boxShadow: "3px 3px 0 #000", fontFamily: "var(--font-press-start)", fontSize: "10px" }}>
            ANALYZE ▶
          </button>
        </div>
      </form>
    </motion.div>
  );
}
