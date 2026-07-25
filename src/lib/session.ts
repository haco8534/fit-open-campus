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
  /** 参加者画面のフェーズ。これが唯一の「いま何を出すか」の情報源 */
  mode: SessionMode;
  /**
   * 進行役が mode を手動で固定しているか。
   * true のあいだはスライド送りで mode を上書きしない
   * （質疑応答中に「次へ」を押して参加者の質問フォームが消える事故を防ぐ）。
   */
  modeLocked: boolean;
  commentsEnabled: boolean;
  reactionsEnabled: boolean;
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
  modeLocked: false,
  commentsEnabled: true,
  reactionsEnabled: true,
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

/**
 * スライド移動。mode が固定されていなければスライドの mode も反映する。
 *
 * - 同じスライドへの移動は書き込まない（端のスライドで「次へ」を連打すると
 *   currentSlide は変わらないのに mode だけ巻き戻る、という事故を防ぐ）
 * - modeLocked が true のときは currentSlide だけを動かす
 */
export async function goToSlide(
  db: Database,
  sessionId: string,
  slideId: number,
  options: { currentSlide?: number; modeLocked?: boolean } = {}
): Promise<void> {
  const slide = getSlide(slideId);
  if (options.currentSlide === slide.id) return;

  const patch: Partial<Omit<SessionState, "updatedAt">> = {
    currentSlide: slide.id,
  };
  if (!options.modeLocked) patch.mode = slide.mode;
  await updateState(db, sessionId, patch);
}

/** 進行役が手動でモードを指定する。以降スライド送りでは上書きされない */
export async function setMode(
  db: Database,
  sessionId: string,
  mode: SessionMode
): Promise<void> {
  await updateState(db, sessionId, { mode, modeLocked: true });
}

/** モードの手動固定を解除し、いま表示中のスライドの mode に戻す */
export async function followSlideMode(
  db: Database,
  sessionId: string,
  slideId: number
): Promise<void> {
  await updateState(db, sessionId, {
    modeLocked: false,
    mode: getSlide(slideId).mode,
  });
}

export async function openPoll(db: Database, sessionId: string): Promise<void> {
  await set(ref(db, sessionPath(sessionId, "poll", "status")), "open");
  // 投票中にスライドを動かしても投票画面が消えないよう mode を固定する
  await updateState(db, sessionId, {
    mode: "poll",
    modeLocked: true,
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
  await updateState(db, sessionId, { selectedTheme: winnerId });
}

export async function resetPoll(db: Database, sessionId: string): Promise<void> {
  await remove(ref(db, sessionPath(sessionId, "poll", "voters")));
  await set(ref(db, sessionPath(sessionId, "poll", "status")), "closed");
  await updateState(db, sessionId, { selectedTheme: null });
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
