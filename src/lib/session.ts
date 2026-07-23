import {
  ref,
  remove,
  serverTimestamp,
  set,
  update,
  type Database,
} from "firebase/database";
import { getSlide, type SlideMode } from "@/config/slides";

export const DEFAULT_SESSION_ID =
  process.env.NEXT_PUBLIC_SESSION_ID ?? "open-campus-2026";

export type SessionMode = SlideMode;

export type FeaturedQuestion = {
  id: string;
  text: string;
};

export type SessionState = {
  currentSlide: number;
  mode: SessionMode;
  commentsEnabled: boolean;
  reactionsEnabled: boolean;
  pollEnabled: boolean;
  sessionActive: boolean;
  /** 投票で選ばれたテーマの pollOption id */
  selectedTheme: string | null;
  /** メインモニターに表示中の質問 */
  featuredQuestion: FeaturedQuestion | null;
  updatedAt: number;
};

export const DEFAULT_STATE: SessionState = {
  currentSlide: 1,
  mode: "reaction",
  commentsEnabled: true,
  reactionsEnabled: true,
  pollEnabled: false,
  sessionActive: true,
  selectedTheme: null,
  featuredQuestion: null,
  updatedAt: 0,
};

export function sessionPath(sessionId: string, ...parts: string[]): string {
  return ["sessions", sessionId, ...parts].join("/");
}

export function statePath(sessionId: string): string {
  return sessionPath(sessionId, "state");
}

export async function updateState(
  db: Database,
  sessionId: string,
  patch: Partial<Omit<SessionState, "updatedAt">>
): Promise<void> {
  await update(ref(db, statePath(sessionId)), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

/** スライド移動。スライドに設定された mode も同時に反映する */
export async function goToSlide(
  db: Database,
  sessionId: string,
  slideId: number
): Promise<void> {
  const slide = getSlide(slideId);
  await updateState(db, sessionId, {
    currentSlide: slide.id,
    mode: slide.mode,
  });
}

export async function openPoll(db: Database, sessionId: string): Promise<void> {
  await set(ref(db, sessionPath(sessionId, "poll", "status")), "open");
  await updateState(db, sessionId, {
    pollEnabled: true,
    mode: "poll",
    selectedTheme: null,
  });
}

/** 投票終了。winnerId が null の場合は同票などで進行役が選ぶ */
export async function closePoll(
  db: Database,
  sessionId: string,
  winnerId: string | null
): Promise<void> {
  await set(ref(db, sessionPath(sessionId, "poll", "status")), "closed");
  await updateState(db, sessionId, {
    pollEnabled: false,
    selectedTheme: winnerId,
  });
}

export async function resetPoll(db: Database, sessionId: string): Promise<void> {
  await remove(ref(db, sessionPath(sessionId, "poll", "voters")));
  await set(ref(db, sessionPath(sessionId, "poll", "status")), "closed");
  await updateState(db, sessionId, { pollEnabled: false, selectedTheme: null });
}

export async function setSelectedTheme(
  db: Database,
  sessionId: string,
  themeId: string | null
): Promise<void> {
  await updateState(db, sessionId, { selectedTheme: themeId });
}

export async function clearComments(
  db: Database,
  sessionId: string
): Promise<void> {
  await remove(ref(db, sessionPath(sessionId, "comments")));
}

export async function blockUser(
  db: Database,
  sessionId: string,
  uid: string
): Promise<void> {
  await set(ref(db, sessionPath(sessionId, "blockedUsers", uid)), true);
}

export async function setQuestionStatus(
  db: Database,
  sessionId: string,
  questionId: string,
  status: "pending" | "featured" | "answered"
): Promise<void> {
  await set(
    ref(db, sessionPath(sessionId, "questions", questionId, "status")),
    status
  );
}

export async function deleteQuestion(
  db: Database,
  sessionId: string,
  questionId: string
): Promise<void> {
  await remove(ref(db, sessionPath(sessionId, "questions", questionId)));
}

/** メインモニターに質問を表示する（null で非表示） */
export async function featureQuestion(
  db: Database,
  sessionId: string,
  question: FeaturedQuestion | null
): Promise<void> {
  await updateState(db, sessionId, { featuredQuestion: question });
}

/** 緊急停止・再開 */
export async function setSessionActive(
  db: Database,
  sessionId: string,
  active: boolean
): Promise<void> {
  await updateState(db, sessionId, { sessionActive: active });
}

/** セッション状態の初期化（コメント・リアクション・質問・投票をすべて消す） */
export async function resetSession(
  db: Database,
  sessionId: string
): Promise<void> {
  await Promise.all([
    remove(ref(db, sessionPath(sessionId, "comments"))),
    remove(ref(db, sessionPath(sessionId, "reactions"))),
    remove(ref(db, sessionPath(sessionId, "questions"))),
    remove(ref(db, sessionPath(sessionId, "poll", "voters"))),
    set(ref(db, sessionPath(sessionId, "poll", "status")), "closed"),
  ]);
  await set(ref(db, statePath(sessionId)), {
    ...DEFAULT_STATE,
    updatedAt: serverTimestamp(),
  });
}
