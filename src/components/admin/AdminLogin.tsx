"use client";

import { useState, type FormEvent } from "react";

type Props = {
  /** パスワードを検証する。true なら管理画面を開く */
  onSubmit: (passcode: string) => Promise<boolean>;
  /** 匿名認証が確立してFirebaseに問い合わせできる状態か */
  ready: boolean;
};

export function AdminLogin({ onSubmit, ready }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (checking || !ready || value.length === 0) return;
    setChecking(true);
    setError(null);
    const ok = await onSubmit(value);
    setChecking(false);
    if (!ok) {
      setError("パスワードが違います");
      setValue("");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-slate-800">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-sm"
      >
        <h1 className="text-lg font-bold">管理者画面</h1>
        <p className="mt-1 text-sm text-slate-500">
          パスワードを入力してください
        </p>

        <label htmlFor="admin-passcode" className="sr-only">
          パスワード
        </label>
        <input
          id="admin-passcode"
          type="password"
          autoFocus
          autoComplete="current-password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        />
        <p className="mt-1 min-h-5 text-xs text-red-600" role="alert">
          {error ?? ""}
        </p>

        <button
          type="submit"
          disabled={!ready || checking || value.length === 0}
          className="mt-1 w-full rounded-lg bg-sky-600 py-3 font-bold text-white active:bg-sky-700 disabled:bg-slate-300"
        >
          {!ready ? "接続中…" : checking ? "確認中…" : "ログイン"}
        </button>
      </form>
    </main>
  );
}
