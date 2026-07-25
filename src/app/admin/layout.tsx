import type { Metadata } from "next";

// 管理者画面は検索エンジンに載せない（URLを直接知っている進行役だけが開く想定）
export const metadata: Metadata = {
  title: "管理者画面",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
