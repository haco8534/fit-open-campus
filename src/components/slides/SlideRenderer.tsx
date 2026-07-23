"use client";

import { useState } from "react";
import Image from "next/image";
import type { SlideConfig } from "@/config/slides";
import { SlideVideo } from "./SlideVideo";

type Props = {
  slide: SlideConfig;
  /** サムネイル表示などで動画を無効化する場合は false */
  showVideo?: boolean;
  className?: string;
};

export function SlideRenderer({ slide, showVideo = true, className = "" }: Props) {
  // 読み込みに失敗した画像パスを記録する（スライドが変われば自動的にリセットされる）
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === slide.image;

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden bg-black ${className}`}
    >
      {failed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-800 to-slate-950 text-white">
          <span className="text-[6cqw] font-bold opacity-40">{slide.id}</span>
          {slide.title && <span className="opacity-70">{slide.title}</span>}
        </div>
      ) : (
        <Image
          src={slide.image}
          alt={slide.title ?? `スライド ${slide.id}`}
          fill
          priority
          unoptimized
          className="object-contain"
          onError={() => setFailedSrc(slide.image)}
        />
      )}
      {showVideo && slide.video && <SlideVideo video={slide.video} />}
    </div>
  );
}
