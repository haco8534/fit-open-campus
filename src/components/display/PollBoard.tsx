"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { PollResultData } from "@/hooks/usePoll";

type Props = {
  poll: PollResultData;
};

const PAPER_COLORS = ["#f4eadf", "#ffffff", "#f8f2eb", "#ffffff"];

function AnimatedCount({ value }: { value: number }) {
  return (
    <span className="relative inline-block tabular-nums">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ scale: 1.35, y: "-8%", color: "#ff3838" }}
          animate={{ scale: 1, y: "0%", color: "#111111" }}
          exit={{ opacity: 0, position: "absolute" }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * 会場スクリーンの投票ボード。
 *
 * 投票は締め切らないので「投票終了」も「このテーマに決まりました」も出さない。
 * 登壇者が結果を眺めながら話すあいだ、票は動き続ける。
 */
export function PollBoard({ poll }: Props) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-white text-black">
      <div className="absolute inset-x-0 bottom-0 h-[13%] bg-[#cf9a6b]" />
      <div className="absolute right-[-3%] top-[-10%] h-[19vw] w-[19vw] rounded-full border-[2.2vw] border-[#cf9a6b]/15" />

      <div className="relative flex h-full flex-col px-[4.2%] pb-[14.5%] pt-[3.2%]">
        <header className="mb-[2%] flex items-end justify-between border-b-[0.28vw] border-black pb-[1.4%]">
          <div>
            <p
              className="font-black tracking-[0.16em] text-[#cf9a6b]"
              style={{ fontSize: "1.2vw" }}
            >
              TALK SESSION / LIVE VOTE
            </p>
            <h1
              className="font-black tracking-[-0.04em]"
              style={{ fontSize: "3.45vw", lineHeight: 1.05 }}
            >
              次に話すテーマを、みんなで決めよう
            </h1>
          </div>
          <div className="flex items-center gap-[1vw] pb-[0.2vw]">
            <div
              className="border-[0.16vw] border-black bg-[#ff3838] px-[1vw] py-[0.42vw] font-black text-white"
              style={{ fontSize: "1.05vw" }}
            >
              投票受付中
            </div>
            <p className="font-black" style={{ fontSize: "1.3vw" }}>
              TOTAL&nbsp; {poll.totalVotes}
            </p>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-[1.2vw]">
          {poll.tallies.map((t, index) => {
            const isLeader = poll.leaderId === t.id && poll.totalVotes > 0;
            const share = poll.totalVotes > 0 ? t.votes / poll.totalVotes : 0;

            return (
              <article
                key={t.id}
                className="relative flex min-h-0 flex-col justify-between overflow-hidden border-[0.18vw] border-black px-[1.5vw] py-[1.25vw]"
                style={{
                  backgroundColor: PAPER_COLORS[index % PAPER_COLORS.length],
                  boxShadow: isLeader ? "0.5vw 0.5vw 0 #cf9a6b" : "none",
                }}
              >
                <motion.div
                  className="absolute inset-y-0 left-0 bg-[#cf9a6b]/18"
                  animate={{ width: `${share * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  aria-hidden="true"
                />

                <div className="relative flex items-start gap-[1.2vw]">
                  <span
                    className="shrink-0 font-black leading-none text-[#cf9a6b]"
                    style={{ fontSize: "3.7vw" }}
                  >
                    0{index + 1}
                  </span>
                  <h2
                    className="max-w-[31vw] font-black tracking-[-0.03em]"
                    style={{ fontSize: "1.75vw", lineHeight: 1.2 }}
                  >
                    {t.label}
                  </h2>
                  {isLeader && (
                    <span
                      className="absolute right-0 top-0 bg-black px-[0.65vw] py-[0.25vw] font-black text-white"
                      style={{ fontSize: "0.85vw" }}
                    >
                      TOP
                    </span>
                  )}
                </div>

                <div className="relative flex items-end justify-between border-t-[0.12vw] border-black/30 pt-[0.6vw]">
                  <div className="flex items-baseline gap-[0.45vw]">
                    <span
                      className="font-black leading-none"
                      style={{ fontSize: "4.7vw" }}
                    >
                      <AnimatedCount value={t.votes} />
                    </span>
                    <span className="font-black" style={{ fontSize: "1.15vw" }}>
                      VOTES
                    </span>
                  </div>
                  <span
                    className="font-black text-[#cf9a6b]"
                    style={{ fontSize: "1.65vw" }}
                  >
                    {Math.round(share * 100)}%
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        <p
          className="absolute inset-x-0 bottom-[4.2%] text-center font-black text-white"
          style={{ fontSize: "1.25vw" }}
        >
          スマホからいつでも投票・変更できます
        </p>
      </div>
    </div>
  );
}
