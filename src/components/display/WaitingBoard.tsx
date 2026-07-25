"use client";

import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

const ACCENT = "#00a0e9";
const SIGNAL = "#d9e021";

/**
 * トークセッション開始前の待機画面。
 *
 * 会場に着いた高校生に「このQRを読めば参加できる」ことだけを伝える。
 * 何ができるかは本編で明かしたいので、機能の説明はあえて置かない。
 * 待たされていることが不安にならないよう、準備中であることを動きで示す。
 */
export function WaitingBoard({ joinUrl }: { joinUrl: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#1f2124] text-white">
      {/* スライド1と同じ円のモチーフ。ゆっくり呼吸させて「止まっていない」ことを示す */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "40vw",
          height: "40vw",
          right: "-9vw",
          top: "-15vw",
          backgroundColor: ACCENT,
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />
      <div
        className="absolute rounded-full border-[1.6vw] border-white/5"
        style={{ width: "26vw", height: "26vw", left: "-8vw", bottom: "-10vw" }}
        aria-hidden="true"
      />

      <div className="relative flex h-full flex-col items-center justify-between px-[6%] py-[4%]">
        {/* 見出し */}
        <header className="text-center">
          <p
            className="font-bold tracking-[0.22em]"
            style={{ fontSize: "1.05vw", color: ACCENT }}
          >
            FUKUOKA INSTITUTE OF TECHNOLOGY / OPEN CAMPUS 2026
          </p>
          <h1
            className="mt-[0.8vw] font-black tracking-[-0.03em]"
            style={{ fontSize: "3.1vw", lineHeight: 1.1 }}
          >
            テック系学生 トークセッション
          </h1>
          <div
            className="mx-auto mt-[0.9vw] h-[0.28vw] w-[16vw] rounded-full"
            style={{ backgroundColor: SIGNAL }}
            aria-hidden="true"
          />
        </header>

        {/* QRコード */}
        <div className="flex flex-col items-center">
          <p className="font-bold" style={{ fontSize: "1.6vw" }}>
            スマホから参加できます
          </p>

          <div className="relative mt-[1.1vw]">
            <motion.span
              className="pointer-events-none absolute inset-[-1vw] rounded-[2vw]"
              style={{ border: `0.25vw solid ${ACCENT}` }}
              animate={{ opacity: [0.75, 0], scale: [1, 1.09] }}
              transition={{
                duration: 2.2,
                repeatDelay: 1.4,
                repeat: Infinity,
                ease: "easeOut",
              }}
              aria-hidden="true"
            />
            <div
              className="relative bg-white"
              style={{ padding: "1.1vw", borderRadius: "1.2vw" }}
            >
              <QRCodeSVG
                value={joinUrl}
                size={512}
                level="M"
                style={{ width: "20vw", height: "20vw", display: "block" }}
              />
            </div>
          </div>

          <p
            className="mt-[1.3vw] font-bold text-white/70"
            style={{ fontSize: "1.15vw" }}
          >
            スマホのカメラをかざしてください
          </p>
        </div>

        {/* 準備中の案内 */}
        <footer className="flex flex-col items-center">
          <div className="flex items-center gap-[0.55vw]">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="inline-block rounded-full"
                style={{
                  width: "0.75vw",
                  height: "0.75vw",
                  backgroundColor: SIGNAL,
                }}
                animate={{ opacity: [0.25, 1, 0.25], y: ["0%", "-55%", "0%"] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.18,
                  ease: "easeInOut",
                }}
                aria-hidden="true"
              />
            ))}
            <span
              className="ml-[0.5vw] font-bold"
              style={{ fontSize: "1.25vw", color: SIGNAL }}
            >
              ただいま準備中
            </span>
          </div>
          <p
            className="mt-[0.9vw] font-bold"
            style={{ fontSize: "1.75vw" }}
          >
            画面はそのままに、トークセッションが始まるまでお待ちください！
          </p>
        </footer>
      </div>
    </div>
  );
}
