"use client";

import { motion } from "framer-motion";

interface PlaceResult {
  rank: number;
  placeId: string;
  name: string;
  category: string;
  address: string;
  isTarget: boolean;
}

interface SearchResult {
  success: boolean;
  keyword: string;
  targetPlaceId: string;
  targetPlace: PlaceResult | null;
  totalResults: number;
  allResults: PlaceResult[];
  error?: string;
}

interface ResultCardProps {
  result: SearchResult;
  onReset: () => void;
}

function RankBadge({ rank }: { rank: number }) {
  const isTop3 = rank <= 3;
  const colors: Record<number, { bg: string; text: string; label: string }> = {
    1: { bg: "#f59e0b22", text: "#f59e0b", label: "1위" },
    2: { bg: "#94a3b822", text: "#94a3b8", label: "2위" },
    3: { bg: "#b4530922", text: "#cd7f32", label: "3위" },
  };

  if (isTop3) {
    const c = colors[rank];
    return (
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
        style={{ background: c.bg, color: c.text }}
      >
        {c.label}
      </div>
    );
  }

  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0"
      style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
    >
      {rank}
    </div>
  );
}

function PlaceRow({ place, index }: { place: PlaceResult; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150"
      style={{
        background: place.isTarget ? "rgba(59, 130, 246, 0.08)" : "transparent",
        border: place.isTarget ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid transparent",
      }}
    >
      <RankBadge rank={place.rank} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-sm font-semibold truncate"
            style={{ color: place.isTarget ? "var(--accent)" : "var(--text-primary)" }}
          >
            {place.name}
          </span>
          {place.isTarget && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              찾는 플레이스
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {place.category && (
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {place.category}
            </span>
          )}
          {place.category && place.address && (
            <span style={{ color: "var(--text-muted)", fontSize: "10px" }}>·</span>
          )}
          {place.address && (
            <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
              {place.address}
            </span>
          )}
        </div>
      </div>

      <div className="flex-shrink-0">
        <span
          className="text-xs font-mono px-2 py-1 rounded-lg"
          style={{
            background: "var(--surface-2)",
            color: "var(--text-muted)",
            border: "1px solid var(--border)",
          }}
        >
          #{place.placeId}
        </span>
      </div>
    </motion.div>
  );
}

export default function ResultCard({ result, onReset }: ResultCardProps) {
  const found = result.targetPlace !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto flex flex-col gap-4"
    >
      {/* Summary card */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                검색 키워드
              </p>
              <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                {result.keyword}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                검색된 결과
              </p>
              <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                {result.totalResults}개
              </p>
            </div>
          </div>

          {/* Target result highlight */}
          {found ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="rounded-xl p-5"
              style={{
                background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))",
                border: "1px solid rgba(59,130,246,0.3)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
                  style={{ background: "var(--accent)", boxShadow: "0 4px 20px var(--accent-glow)" }}
                >
                  <span className="text-white text-xl font-black leading-none">
                    {result.targetPlace!.rank}
                  </span>
                  <span className="text-white/70 text-xs">위</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base truncate" style={{ color: "var(--text-primary)" }}>
                    {result.targetPlace!.name}
                  </p>
                  {result.targetPlace!.category && (
                    <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      {result.targetPlace!.category}
                    </p>
                  )}
                  <p className="text-xs mt-1 font-mono" style={{ color: "var(--text-muted)" }}>
                    플레이스 ID: {result.targetPlace!.placeId}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div
              className="rounded-xl p-5 text-center"
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              <p className="font-semibold mb-1" style={{ color: "#f87171" }}>
                검색 결과에서 찾을 수 없음
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                플레이스 ID <span className="font-mono">{result.targetPlaceId}</span>가{" "}
                검색된 {result.totalResults}개 결과 안에 없습니다
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Full result list */}
      {result.allResults.length > 0 && (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div
            className="px-5 py-4 border-b flex items-center justify-between"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              전체 검색 결과
            </p>
            <span
              className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
            >
              총 {result.totalResults}개
            </span>
          </div>

          <div className="p-3 flex flex-col gap-1 max-h-[480px] overflow-y-auto">
            {result.allResults.map((place, i) => (
              <PlaceRow key={place.placeId} place={place} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Reset button */}
      <motion.button
        onClick={onReset}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3.5 rounded-xl text-sm font-semibold transition-colors duration-200"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--text-secondary)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.color = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
      >
        새로 검색하기
      </motion.button>
    </motion.div>
  );
}
