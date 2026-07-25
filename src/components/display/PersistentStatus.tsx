"use client";

import type { SlideQr } from "@/config/slides";
import { JoinQr } from "./JoinQr";

type Props = {
  joinUrl: string;
  showQr: boolean;
  /** 表示中のスライドに設定されたQRの位置・大きさ */
  qr?: SlideQr;
  themeLabel?: string | null;
};

/** QRコード・現在テーマなどの常設UI */
export function PersistentStatus({ joinUrl, showQr, qr, themeLabel }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      {/*
        現在のテーマ（下辺の中央）。
        QRはスライドごとに四隅を移動するため、ぶつからない位置に置いている。
      */}
      {themeLabel && (
        <div className="absolute inset-x-0 bottom-[3%] flex justify-center">
          <div className="max-w-[60%] rounded-full bg-black/75 px-[1.4vw] py-[0.5vw]">
            <span
              className="font-bold text-yellow-300"
              style={{ fontSize: "1.3vw" }}
            >
              🎤 テーマ：{themeLabel}
            </span>
          </div>
        </div>
      )}

      {showQr && joinUrl && <JoinQr joinUrl={joinUrl} qr={qr} />}
    </div>
  );
}
