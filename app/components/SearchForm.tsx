"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface SearchFormProps {
  onSearch: (keyword: string, placeUrl: string) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [keyword, setKeyword] = useState("");
  const [placeUrl, setPlaceUrl] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim() || !placeUrl.trim() || isLoading) return;
    onSearch(keyword.trim(), placeUrl.trim());
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="rounded-2xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: "var(--accent)", color: "#fff" }}>
              N
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                네이버 플레이스 순위 검색
              </p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                키워드와 플레이스 URL을 입력하세요
              </p>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              검색 키워드
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="예: 강남치과"
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 disabled:opacity-50"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-glow)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              플레이스 URL
            </label>
            <input
              type="url"
              value={placeUrl}
              onChange={(e) => setPlaceUrl(e.target.value)}
              placeholder="예: https://map.naver.com/p/search/.../place/38893823"
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 disabled:opacity-50"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-glow)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              네이버 지도에서 플레이스 페이지 URL을 그대로 붙여넣으세요
            </p>
          </div>

          <motion.button
            type="submit"
            disabled={!keyword.trim() || !placeUrl.trim() || isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "var(--accent)",
              color: "#fff",
              boxShadow: "0 4px 15px var(--accent-glow)",
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                순위 검색 중...
              </span>
            ) : (
              "순위 검색하기"
            )}
          </motion.button>
        </div>
      </div>
    </motion.form>
  );
}
