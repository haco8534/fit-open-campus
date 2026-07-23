"use client";

import Image from "next/image";
import { slides } from "@/config/slides";

type Props = {
  currentSlide: number;
  currentMode: string;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (slideId: number) => void;
};

export function SlideController({
  currentSlide,
  currentMode,
  onPrev,
  onNext,
  onSelect,
}: Props) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold text-slate-700">スライド操作</h2>
        <span className="text-sm text-slate-500">
          {currentSlide} / {slides.length}（mode: {currentMode}）
        </span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <button
          onClick={onPrev}
          className="rounded-xl bg-slate-700 py-5 text-xl font-bold text-white active:bg-slate-800"
        >
          ← 前へ
        </button>
        <button
          onClick={onNext}
          className="rounded-xl bg-sky-600 py-5 text-xl font-bold text-white active:bg-sky-700"
        >
          次へ →
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {slides.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`overflow-hidden rounded-lg border-2 text-left ${
              s.id === currentSlide
                ? "border-sky-500 ring-2 ring-sky-200"
                : "border-slate-200"
            }`}
          >
            <div className="relative aspect-video w-full bg-slate-900">
              <Image
                src={s.image}
                alt={s.title ?? `スライド ${s.id}`}
                fill
                unoptimized
                className="object-contain"
                onError={() => {}}
              />
            </div>
            <div className="truncate px-1.5 py-1 text-[11px] text-slate-600">
              {s.id}. {s.title}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
