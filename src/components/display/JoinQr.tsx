"use client";

import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import type { QrPosition, SlideQr } from "@/config/slides";

type Props = {
  joinUrl: string;
  qr?: SlideQr;
};

const ACCENT = "#0093dd";

const POSITION_CLASS: Record<QrPosition, string> = {
  "top-left": "left-[1.5%] top-[2.5%]",
  "top-right": "right-[1.5%] top-[2.5%]",
  "bottom-left": "left-[1.5%] bottom-[3%]",
  "bottom-right": "right-[1.5%] bottom-[3%]",
};

// normal は 1920x1080 換算でおよそ 146x197px。
// スライドの図版や文字と重ならない大きさに抑えている（各スライドの余白を実測して決めた）。
// 参加の呼びかけは導入スライドの large に任せ、以降は「まだ参加できる」目印として置く。
const SIZE = {
  normal: {
    qr: "6.5vw",
    headline: "0.9vw",
    hint: "0.8vw",
    padding: "0.55vw",
    radius: "0.6vw",
  },
  large: {
    qr: "15vw",
    headline: "1.8vw",
    hint: "1.35vw",
    padding: "1.2vw",
    radius: "1.1vw",
  },
} as const;

/**
 * 会場スクリーンの隅に出す参加用QR。
 *
 * ただ置いてあるだけだと見落とされるので、
 * 「何をすればいいか」を言葉で書き、数秒おきに軽く波紋を出して視線を集める。
 * 置く隅はスライドごとに slides.ts の qr.position で指定する
 * （スライドの図版や文字と重ならないようにするため）。
 */
export function JoinQr({ joinUrl, qr }: Props) {
  const position = qr?.position ?? "bottom-right";
  const s = SIZE[qr?.size ?? "normal"];

  return (
    <div
      className={`pointer-events-none absolute z-50 ${POSITION_CLASS[position]}`}
    >
      <motion.div
        className="relative"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{
          duration: 1.6,
          repeatDelay: 3.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* 視線を集めるための波紋 */}
        <motion.span
          className="pointer-events-none absolute inset-[-0.5vw]"
          style={{
            border: `0.22vw solid ${ACCENT}`,
            borderRadius: `calc(${s.radius} + 0.5vw)`,
          }}
          animate={{ opacity: [0.85, 0], scale: [1, 1.13] }}
          transition={{
            duration: 1.6,
            repeatDelay: 3.4,
            repeat: Infinity,
            ease: "easeOut",
          }}
          aria-hidden="true"
        />

        <div
          className="relative overflow-hidden bg-white"
          style={{
            borderRadius: s.radius,
            boxShadow: "0 0.5vw 1.6vw rgba(0,0,0,0.35)",
          }}
        >
          <div
            className="flex items-center justify-center gap-[0.35vw] whitespace-nowrap px-[0.4vw] py-[0.4vw] font-bold text-white"
            style={{ background: ACCENT, fontSize: s.headline }}
          >
            <span aria-hidden="true">📱</span>
            スマホで参加
          </div>

          <div
            className="flex flex-col items-center"
            style={{ padding: s.padding }}
          >
            <QRCodeSVG
              value={joinUrl}
              size={256}
              level="M"
              style={{ width: s.qr, height: s.qr, display: "block" }}
            />
            <p
              className="mt-[0.45vw] font-bold text-slate-800"
              style={{ fontSize: s.hint }}
            >
              カメラをかざすだけ
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
