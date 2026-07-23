"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { PollResultData } from "@/hooks/usePoll";
import { getPollOption } from "@/config/pollOptions";

type Props = {
  poll: PollResultData;
  selectedTheme: string | null;
};

// テーマごとの配色（遠くからでも見分けやすいように4色に分ける）
const ACCENTS = [
  { bar: "from-sky-400 to-blue-600", ring: "#38bdf8", glow: "rgba(56,189,248,0.55)" },
  { bar: "from-emerald-400 to-green-600", ring: "#34d399", glow: "rgba(52,211,153,0.55)" },
  { bar: "from-amber-400 to-orange-600", ring: "#fbbf24", glow: "rgba(251,191,36,0.55)" },
  { bar: "from-fuchsia-400 to-purple-600", ring: "#e879f9", glow: "rgba(232,121,249,0.55)" },
];

/** 票が増えるたびにポップするカウンター */
function AnimatedCount({ value }: { value: number }) {
  return (
    <span className="relative inline-block tabular-nums">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ scale: 1.9, y: "-8%", color: "#fde047" }}
          animate={{ scale: 1, y: "0%", color: "#ffffff" }}
          exit={{ opacity: 0, position: "absolute" }}
          transition={{ type: "spring", stiffness: 320, damping: 16 }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** メインモニターの投票画面（スライド7）。画像の代わりに全面描画する */
export function PollBoard({ poll, selectedTheme }: Props) {
  const closed = poll.status === "closed";
  const winner = getPollOption(selectedTheme);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_20%_0%,#1e3a8a_0%,#0b1220_55%,#050810_100%)]">
      {/* 背景の淡い光 */}
      <div className="pointer-events-none absolute -left-[10%] top-[10%] h-[40vw] w-[40vw] rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-[10%] bottom-[0%] h-[40vw] w-[40vw] rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative flex h-full flex-col px-[4%] py-[3.5%]">
        {/* ヘッダー */}
        <div className="mb-[2.2%] flex items-end justify-between">
          <div>
            <p
              className="font-bold tracking-wide text-sky-300"
              style={{ fontSize: "1.5vw" }}
            >
              📣 スマホから投票してね！
            </p>
            <h1
              className="font-black text-white"
              style={{ fontSize: "3.4vw", lineHeight: 1.1 }}
            >
              どの話を一番聞きたい？
            </h1>
          </div>
          <div className="text-right">
            <div
              className={`inline-block rounded-full px-[1.4vw] py-[0.4vw] font-bold ${
                closed
                  ? "bg-white/10 text-white/70"
                  : "bg-red-500 text-white"
              }`}
              style={{ fontSize: "1.3vw" }}
            >
              {closed ? "受付終了" : "🔴 投票受付中"}
            </div>
            <p className="mt-[0.4vw] font-bold text-white" style={{ fontSize: "1.6vw" }}>
              合計 {poll.totalVotes} 票
            </p>
          </div>
        </div>

        {/* テーマカード 2x2 */}
        <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-[1.6%]">
          {poll.tallies.map((t, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            const isLeader = poll.leaderId === t.id && poll.totalVotes > 0;
            const isWinner = closed && selectedTheme === t.id;
            const dimmed = closed && winner && !isWinner;
            const share = poll.totalVotes > 0 ? t.votes / poll.totalVotes : 0;

            return (
              <motion.div
                key={t.id}
                animate={{
                  opacity: dimmed ? 0.4 : 1,
                  scale: isWinner ? 1.03 : 1,
                }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                className="relative flex flex-col justify-between overflow-hidden rounded-[1.4vw] border-2 p-[2%]"
                style={{
                  borderColor:
                    isWinner || isLeader ? accent.ring : "rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  boxShadow:
                    isWinner || isLeader
                      ? `0 0 3vw ${accent.glow}`
                      : "none",
                }}
              >
                {/* 背景バー（得票率） */}
                <motion.div
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${accent.bar} opacity-25`}
                  animate={{ width: `${share * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />

                {/* 上段：番号 + テーマ */}
                <div className="relative flex items-start gap-[1vw]">
                  <span
                    className="flex shrink-0 items-center justify-center rounded-full font-black text-white"
                    style={{
                      width: "3vw",
                      height: "3vw",
                      fontSize: "1.6vw",
                      background: `linear-gradient(135deg, ${accent.ring}, rgba(0,0,0,0.2))`,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="font-bold text-white"
                    style={{ fontSize: "1.9vw", lineHeight: 1.2 }}
                  >
                    {t.label}
                  </span>
                  {(isLeader || isWinner) && (
                    <span
                      className="absolute -right-[0.5vw] -top-[0.5vw]"
                      style={{ fontSize: "2.2vw" }}
                    >
                      👑
                    </span>
                  )}
                </div>

                {/* 下段：大きな票数 */}
                <div className="relative flex items-end justify-between">
                  <div className="flex items-baseline gap-[0.6vw]">
                    <span
                      className="font-black leading-none text-white"
                      style={{ fontSize: "6vw" }}
                    >
                      <AnimatedCount value={t.votes} />
                    </span>
                    <span
                      className="font-bold text-white/60"
                      style={{ fontSize: "1.6vw" }}
                    >
                      票
                    </span>
                  </div>
                  <span
                    className="font-bold text-white/50"
                    style={{ fontSize: "1.5vw" }}
                  >
                    {Math.round(share * 100)}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 勝者バナー */}
        <AnimatePresence>
          {closed && winner && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-[1.6%] rounded-[1vw] bg-gradient-to-r from-yellow-400 to-amber-500 px-[2vw] py-[1vw] text-center"
            >
              <span className="font-black text-slate-900" style={{ fontSize: "2vw" }}>
                🏆 このテーマで話します：{winner.label}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
