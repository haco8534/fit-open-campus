"use client";

import { QRCodeSVG } from "qrcode.react";

type Props = {
  joinUrl: string;
  showQr: boolean;
  connected: boolean;
  connectionCount: number;
  themeLabel?: string | null;
};

/** QRコード・接続人数・現在テーマなどの常設UI */
export function PersistentStatus({
  joinUrl,
  showQr,
  connected,
  connectionCount,
  themeLabel,
}: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      {/* 現在のテーマ（左上） */}
      {themeLabel && (
        <div className="absolute left-[1.5%] top-[2.5%] rounded-full bg-black/70 px-[1.2vw] py-[0.5vw]">
          <span className="font-bold text-yellow-300" style={{ fontSize: "1.3vw" }}>
            🎤 テーマ：{themeLabel}
          </span>
        </div>
      )}

      {/* QRコード（右下） */}
      {showQr && joinUrl && (
        <div className="absolute bottom-[3%] right-[1.5%] flex flex-col items-center gap-[0.4vw] rounded-xl bg-white p-[0.8vw] shadow-lg">
          <QRCodeSVG value={joinUrl} size={130} style={{ width: "8vw", height: "8vw" }} />
          <span className="font-bold text-slate-800" style={{ fontSize: "0.9vw" }}>
            スマホで参加！
          </span>
        </div>
      )}

      {/* 接続人数・通信状態（左下） */}
      <div className="absolute bottom-[3%] left-[1.5%] flex items-center gap-[1vw] rounded-full bg-black/70 px-[1.2vw] py-[0.5vw]">
        <span
          className={`inline-block h-[0.8vw] w-[0.8vw] rounded-full ${
            connected ? "bg-green-400" : "bg-red-500 animate-pulse"
          }`}
        />
        <span className="text-white" style={{ fontSize: "1.1vw" }}>
          {connected ? `参加中 ${connectionCount} 人` : "再接続中…"}
        </span>
      </div>
    </div>
  );
}
