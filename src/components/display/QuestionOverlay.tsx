"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { FeaturedQuestion } from "@/lib/session";

/** 管理者が選んだ質問をメインモニターに表示する */
export function QuestionOverlay({
  question,
}: {
  question: FeaturedQuestion | null;
}) {
  return (
    <AnimatePresence>
      {question && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="pointer-events-none absolute inset-x-0 bottom-[12%] z-[25] flex justify-center"
        >
          <div className="max-w-[70%] rounded-2xl bg-indigo-900/85 px-[2vw] py-[1.2vw] backdrop-blur-sm">
            <p className="mb-[0.3vw] font-bold text-indigo-200" style={{ fontSize: "1.2vw" }}>
              💬 会場からの質問
            </p>
            <p className="font-bold text-white" style={{ fontSize: "1.9vw" }}>
              {question.text}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
