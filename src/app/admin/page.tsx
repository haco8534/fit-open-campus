"use client";

import { useCallback, useEffect } from "react";
import {
  DEFAULT_SESSION_ID,
  blockUser,
  clearComments,
  closePoll,
  deleteQuestion,
  featureQuestion,
  goToSlide,
  openPoll,
  resetPoll,
  resetSession,
  setQuestionStatus,
  setSelectedTheme,
  setSessionActive,
  updateState,
  type SessionMode,
} from "@/lib/session";
import { getDb } from "@/lib/firebase";
import { FIRST_SLIDE_ID, LAST_SLIDE_ID } from "@/config/slides";
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth";
import { useSessionState } from "@/hooks/useSessionState";
import { useConnectionCount } from "@/hooks/usePresence";
import { usePoll } from "@/hooks/usePoll";
import { useRecentComments } from "@/hooks/useComments";
import { useQuestions, type QuestionRecord } from "@/hooks/useQuestions";
import { SlideController } from "@/components/admin/SlideController";
import { PollController } from "@/components/admin/PollController";
import { CommentController } from "@/components/admin/CommentController";
import { QuestionController } from "@/components/admin/QuestionController";
import { SessionController } from "@/components/admin/SessionController";

const MODES: { mode: SessionMode; label: string }[] = [
  { mode: "reaction", label: "リアクション" },
  { mode: "poll", label: "投票" },
  { mode: "talk", label: "座談会" },
  { mode: "question", label: "質疑応答" },
  { mode: "ending", label: "エンディング" },
];

export default function AdminPage() {
  const sessionId = DEFAULT_SESSION_ID;
  const uid = useAnonymousAuth();
  const { state, connected, configured } = useSessionState(sessionId);
  const connectionCount = useConnectionCount(sessionId);
  const poll = usePoll(sessionId, uid);
  const comments = useRecentComments(sessionId);
  const questions = useQuestions(sessionId);

  const withDb = useCallback(
    (fn: (db: NonNullable<ReturnType<typeof getDb>>) => Promise<void>) => {
      const db = getDb();
      if (!db) {
        alert("Firebaseが設定されていません（.env.local を確認してください）");
        return;
      }
      fn(db).catch((e) => {
        console.error(e);
        alert(
          "操作に失敗しました。管理者権限（admins/あなたのUID）が設定されているか確認してください。"
        );
      });
    },
    []
  );

  const handlePrev = useCallback(() => {
    withDb((db) =>
      goToSlide(db, sessionId, Math.max(FIRST_SLIDE_ID, state.currentSlide - 1))
    );
  }, [withDb, sessionId, state.currentSlide]);

  const handleNext = useCallback(() => {
    withDb((db) =>
      goToSlide(db, sessionId, Math.min(LAST_SLIDE_ID, state.currentSlide + 1))
    );
  }, [withDb, sessionId, state.currentSlide]);

  const handlePollToggle = useCallback(() => {
    if (poll.status === "open") {
      withDb((db) => closePoll(db, sessionId, poll.leaderId));
    } else {
      withDb((db) => openPoll(db, sessionId));
    }
  }, [withDb, sessionId, poll.status, poll.leaderId]);

  const handleToggleComments = useCallback(() => {
    withDb((db) =>
      updateState(db, sessionId, { commentsEnabled: !state.commentsEnabled })
    );
  }, [withDb, sessionId, state.commentsEnabled]);

  const handleToggleReactions = useCallback(() => {
    withDb((db) =>
      updateState(db, sessionId, { reactionsEnabled: !state.reactionsEnabled })
    );
  }, [withDb, sessionId, state.reactionsEnabled]);

  // キーボードショートカット
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      ) {
        return;
      }
      switch (e.key) {
        case "ArrowRight":
          handleNext();
          break;
        case "ArrowLeft":
          handlePrev();
          break;
        case "p":
        case "P":
          handlePollToggle();
          break;
        case "c":
        case "C":
          handleToggleComments();
          break;
        case "r":
        case "R":
          handleToggleReactions();
          break;
        case "Escape":
          withDb((db) => setSessionActive(db, sessionId, !state.sessionActive));
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    handleNext,
    handlePrev,
    handlePollToggle,
    handleToggleComments,
    handleToggleReactions,
    withDb,
    sessionId,
    state.sessionActive,
  ]);

  return (
    <main className="min-h-screen bg-slate-100 pb-10">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="font-bold text-slate-800">管理者画面</h1>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {!state.sessionActive && (
              <span className="rounded-full bg-red-100 px-3 py-1 font-bold text-red-700">
                緊急停止中
              </span>
            )}
            <span>
              ←→: スライド / P: 投票 / C: コメント / R: リアクション / Esc: 停止
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-4 flex max-w-5xl flex-col gap-4 px-4">
        {!configured && (
          <p className="rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-800">
            Firebaseが未設定です。.env.local に接続情報を設定してください。
          </p>
        )}
        {configured && uid && (
          <p className="rounded-xl bg-white px-4 py-2 text-xs text-slate-400">
            あなたのUID: <code className="select-all">{uid}</code>
            （Realtime Database の <code>admins/{uid}</code> に true
            を設定すると管理者として書き込みできます）
          </p>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <SlideController
              currentSlide={state.currentSlide}
              currentMode={state.mode}
              onPrev={handlePrev}
              onNext={handleNext}
              onSelect={(id) => withDb((db) => goToSlide(db, sessionId, id))}
            />

            {/* セッションモード手動変更 */}
            <section className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="mb-3 font-bold text-slate-700">
                参加者画面モード
              </h2>
              <div className="grid grid-cols-5 gap-2">
                {MODES.map((m) => (
                  <button
                    key={m.mode}
                    onClick={() =>
                      withDb((db) => updateState(db, sessionId, { mode: m.mode }))
                    }
                    className={`rounded-lg py-2.5 text-xs font-bold ${
                      state.mode === m.mode
                        ? "bg-sky-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </section>

            <SessionController
              sessionActive={state.sessionActive}
              connectionCount={connectionCount}
              connected={connected}
              onToggleActive={() =>
                withDb((db) =>
                  setSessionActive(db, sessionId, !state.sessionActive)
                )
              }
              onResetSession={() => withDb((db) => resetSession(db, sessionId))}
            />
          </div>

          <div className="flex flex-col gap-4">
            <PollController
              poll={poll}
              selectedTheme={state.selectedTheme}
              onStart={() => withDb((db) => openPoll(db, sessionId))}
              onEnd={() =>
                withDb((db) => closePoll(db, sessionId, poll.leaderId))
              }
              onReset={() => {
                if (confirm("投票結果をリセットしますか？")) {
                  withDb((db) => resetPoll(db, sessionId));
                }
              }}
              onPickTheme={(themeId) =>
                withDb((db) => setSelectedTheme(db, sessionId, themeId))
              }
            />

            <CommentController
              comments={comments}
              commentsEnabled={state.commentsEnabled}
              reactionsEnabled={state.reactionsEnabled}
              onToggleComments={handleToggleComments}
              onToggleReactions={handleToggleReactions}
              onClearComments={() => withDb((db) => clearComments(db, sessionId))}
              onBlockUser={(userId) =>
                withDb((db) => blockUser(db, sessionId, userId))
              }
            />

            <QuestionController
              questions={questions}
              featuredQuestion={state.featuredQuestion}
              onFeature={(q: QuestionRecord) =>
                withDb(async (db) => {
                  await featureQuestion(db, sessionId, {
                    id: q.id,
                    text: q.text,
                  });
                  await setQuestionStatus(db, sessionId, q.id, "featured");
                })
              }
              onUnfeature={() =>
                withDb((db) => featureQuestion(db, sessionId, null))
              }
              onMarkAnswered={(q: QuestionRecord) =>
                withDb(async (db) => {
                  if (state.featuredQuestion?.id === q.id) {
                    await featureQuestion(db, sessionId, null);
                  }
                  await setQuestionStatus(db, sessionId, q.id, "answered");
                })
              }
              onDelete={(q: QuestionRecord) =>
                withDb(async (db) => {
                  if (state.featuredQuestion?.id === q.id) {
                    await featureQuestion(db, sessionId, null);
                  }
                  await deleteQuestion(db, sessionId, q.id);
                })
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}
