export type PollOption = {
  id: string;
  label: string;
};

export const POLL_OPTIONS: PollOption[] = [
  { id: "ai-learning", label: "生成AI時代に技術を学ぶ意味はあるのか" },
  { id: "fit-growth", label: "福工大に入って何ができるようになったか" },
  { id: "beginner", label: "技術に詳しくなくてもついていけるか" },
  { id: "growth-common", label: "大学で成長している人の共通点" },
];

