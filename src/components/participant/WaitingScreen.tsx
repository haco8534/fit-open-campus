"use client";

import styles from "./participant.module.css";

type Props = {
  title?: string;
  message?: string;
};

export function WaitingScreen({
  title = "まもなく始まります",
  message = "スクリーンにご注目ください",
}: Props) {
  return (
    <section
      className={`${styles.contentCard} flex min-h-[280px] flex-col items-center justify-center gap-3 p-6 text-center`}
      aria-live="polite"
    >
      <span className="relative flex h-3 w-3" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--accent) opacity-40" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-(--accent)" />
      </span>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="max-w-[16rem] text-sm leading-relaxed text-slate-500">
        {message}
      </p>
      <p className="mt-2 text-xs text-slate-400">
        画面は進行に合わせて自動で切り替わります
      </p>
    </section>
  );
}
