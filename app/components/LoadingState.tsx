"use client";

import { motion } from "framer-motion";

const steps = [
  "크로미움 브라우저 실행 중...",
  "네이버 지도에 접속 중...",
  "검색 결과 로딩 중...",
  "스크롤 다운하여 더 많은 결과 로드 중...",
  "플레이스 순위 분석 중...",
];

export default function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        className="rounded-2xl border p-8"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16">
            <motion.div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: "var(--border)" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-transparent"
              style={{ borderTopColor: "var(--accent)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <div
              className="absolute inset-2 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ background: "var(--surface-2)", color: "var(--accent)" }}
            >
              N
            </div>
          </div>
        </div>

        <p
          className="text-center font-semibold mb-6"
          style={{ color: "var(--text-primary)" }}
        >
          네이버 지도 검색 진행 중
        </p>

        {/* Steps */}
        <div className="flex flex-col gap-2.5">
          {steps.map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 1.2, duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 1.2, duration: 0.3 }}
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
              >
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{
                    delay: i * 1.2,
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                  className="w-2 h-2 rounded-full"
                  style={{ background: "var(--accent)" }}
                />
              </motion.div>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {step}
              </span>
            </motion.div>
          ))}
        </div>

        <p
          className="text-center text-xs mt-6"
          style={{ color: "var(--text-muted)" }}
        >
          최대 30~60초 정도 소요될 수 있습니다
        </p>
      </div>
    </motion.div>
  );
}
