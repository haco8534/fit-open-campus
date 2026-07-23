"use client";

import type { SlideVideo as SlideVideoConfig } from "@/config/slides";

/** スライド画像の上に重ねる動画。位置・サイズは 0〜1 の比率で指定する */
export function SlideVideo({ video }: { video: SlideVideoConfig }) {
  return (
    <video
      src={video.src}
      autoPlay={video.autoplay}
      loop={video.loop}
      muted={video.muted ?? true}
      playsInline
      preload="auto"
      style={{
        position: "absolute",
        left: `${video.left * 100}%`,
        top: `${video.top * 100}%`,
        width: `${video.width * 100}%`,
        height: `${video.height * 100}%`,
        objectFit: "cover",
      }}
    />
  );
}
