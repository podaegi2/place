"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SearchForm from "./components/SearchForm";
import LoadingState from "./components/LoadingState";
import ResultCard from "./components/ResultCard";

type AppState = "idle" | "loading" | "result" | "error";

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

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSearch(keyword: string, placeUrl: string) {
    setState("loading");
    setResult(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/search-rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, placeUrl }),
      });

      const data: SearchResult = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error || "검색 중 오류가 발생했습니다.");
        setState("error");
        return;
      }

      setResult(data);
      setState("result");
    } catch {
      setErrorMsg("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
      setState("error");
    }
  }

  function handleReset() {
    setState("idle");
    setResult(null);
    setErrorMsg("");
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(30,42,62,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(30,42,62,0.4) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Accent glow */}
      <div
        className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex-1 flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-6 pt-10 pb-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-base"
              style={{
                background: "var(--accent)",
                color: "#fff",
                boxShadow: "0 4px 20px var(--accent-glow)",
              }}
            >
              N
            </div>
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              Place Rank
            </span>
          </div>
          <h1
            className="text-2xl font-black tracking-tight mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            네이버 플레이스 순위 검색기
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            키워드를 검색했을 때 내 플레이스가 몇 위인지 확인하세요
          </p>
        </motion.header>

        {/* Main content */}
        <div className="flex-1 px-4 pb-12 flex flex-col items-center">
          <AnimatePresence mode="wait">
            {state === "idle" && (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <SearchForm onSearch={handleSearch} isLoading={false} />
              </motion.div>
            )}

            {state === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex justify-center"
              >
                <LoadingState />
              </motion.div>
            )}

            {state === "result" && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex justify-center"
              >
                <ResultCard result={result} onReset={handleReset} />
              </motion.div>
            )}

            {state === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-2xl mx-auto flex flex-col gap-4"
              >
                <div
                  className="rounded-2xl border p-6 text-center"
                  style={{
                    background: "var(--surface)",
                    borderColor: "rgba(239,68,68,0.3)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mx-auto mb-4"
                    style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}
                  >
                    !
                  </div>
                  <p
                    className="font-semibold mb-2"
                    style={{ color: "#f87171" }}
                  >
                    오류가 발생했습니다
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {errorMsg}
                  </p>
                </div>
                <motion.button
                  onClick={handleReset}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold"
                  style={{
                    background: "var(--accent)",
                    color: "#fff",
                    boxShadow: "0 4px 15px var(--accent-glow)",
                  }}
                >
                  다시 시도하기
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
