import Link from "next/link";
import { DEFAULT_SESSION_ID } from "@/lib/session";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-900 px-4 text-white">
      <div className="text-center">
        <p className="text-sm text-sky-300">福岡工業大学 オープンキャンパス</p>
        <h1 className="mt-1 text-2xl font-bold">
          高校生参加型トークセッション
        </h1>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <Link
          href="/display"
          className="rounded-2xl bg-sky-600 py-4 text-center text-lg font-bold hover:bg-sky-500"
        >
          🖥 メインモニター画面
        </Link>
        <Link
          href="/admin"
          className="rounded-2xl bg-slate-700 py-4 text-center text-lg font-bold hover:bg-slate-600"
        >
          🎛 管理者画面
        </Link>
        <Link
          href={`/join/${DEFAULT_SESSION_ID}`}
          className="rounded-2xl bg-green-600 py-4 text-center text-lg font-bold hover:bg-green-500"
        >
          📱 参加者画面
        </Link>
      </div>

      <p className="text-xs text-slate-400">
        参加者はメインモニターのQRコードから /join/{DEFAULT_SESSION_ID} にアクセスします
      </p>
    </main>
  );
}
