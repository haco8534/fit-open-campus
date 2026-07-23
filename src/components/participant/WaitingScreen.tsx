"use client";

type Props = {
  title?: string;
  message?: string;
};

/** セッション停止中や接続待ちの画面 */
export function WaitingScreen({
  title = "しばらくお待ちください",
  message = "スクリーンにご注目ください",
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="text-4xl">🎤</span>
      <h2 className="text-lg font-bold text-slate-700">{title}</h2>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
