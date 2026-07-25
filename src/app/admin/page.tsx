"use client";

import { useCallback, useEffect, useState } from "react";
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
  setQuestionStatus,
  setSelectedTheme,
  setSessionActive,
  updateState,
} from "@/lib/session";
import { isAdminUnlocked, signInAdmin } from "@/lib/adminAuth";
import { getDb } from "@/lib/firebase";
import { FIRST_SLIDE_ID, LAST_SLIDE_ID } from "@/config/slides";
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth";
import { useSessionState } from "@/hooks/useSessionState";
import { useConnectionCount } from "@/hooks/usePresence";
import { usePoll } from "@/hooks/usePoll";
import { useRecentComments } from "@/hooks/useComments";
import { useQuestions, type QuestionRecord } from "@/hooks/useQuestions";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { SlideController } from "@/components/admin/SlideController";
import { PollController } from "@/components/admin/PollController";
import { CommentController } from "@/components/admin/CommentController";
import { QuestionController } from "@/components/admin/QuestionController";

export default function AdminPage() {
  const sessionId = DEFAULT_SESSION_ID;
  const { uid } = useAnonymousAuth();
  const { state, connected, configured } = useSessionState(sessionId);
  const connectionCount = useConnectionCount(sessionId);
  const poll = usePoll(sessionId, uid);
  const comments = useRecentComments(sessionId);
  const questions = useQuestions(sessionId);

  // パスワードによる管理者ログイン。タブを閉じるまで有効
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    // sessionStorage はサーバー描画時に読めないのでマウント後に反映する
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUnlocked(isAdminUnlocked());
  }, []);

  const handleLogin = useCallback(
    async (passcode: string): Promise<boolean> => {
      const db = getDb();
      if (!db || !uid) return false;
      const ok = await signInAdmin(db, sessionId, uid, passcode);
      if (ok) setUnlocked(true);
      return ok;
    },
    [sessionId, uid]
  );

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
          "操作に失敗しました。通信状況を確認し、必要ならページを再読み込みしてログインし直してください。"
        );
      });
    },
    []
  );

  const move = useCallback(
    (slideId: number) => {
      withDb((db) =>
        goToSlide(db, sessionId, slideId, {
          currentSlide: state.currentSlide,
          modeLocked: state.modeLocked,
        })
      );
    },
    [withDb, sessionId, state.currentSlide, state.modeLocked]
  );

  const handlePrev = useCallback(() => {
    move(Math.max(FIRST_SLIDE_ID, state.currentSlide - 1));
  }, [move, state.currentSlide]);

  const handleNext = useCallback(() => {
    move(Math.min(LAST_SLIDE_ID, state.currentSlide + 1));
  }, [move, state.currentSlide]);

  const handlePollToggle = useCallback(() => {
    if (poll.status === "open") {
      withDb((db) =>
        closePoll(db, sessionId, poll.leaderId, state.currentSlide)
      );
    } else {
      withDb((db) => openPoll(db, sessionId));
    }
  }, [withDb, sessionId, poll.status, poll.leaderId, state.currentSlide]);

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

  // キーボードショートカット（ログイン前は無効）
  useEffect(() => {
    if (!unlocked) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      // Ctrl+R（再読み込み）や Ctrl+P（印刷）でリアクション/投票が
      // 誤って切り替わらないよう、修飾キー付きは無視する
      if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
      // 矢印キーの長押しでスライドが飛ぶのを防ぐ
      if (e.repeat) return;

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
          // Esc は全画面解除などで無意識に押されるキーなので必ず確認する
          if (
            confirm(
              state.sessionActive
                ? "参加型表示をすべて停止します。よろしいですか？"
                : "参加型表示を再開しますか？"
            )
          ) {
            withDb((db) =>
              setSessionActive(db, sessionId, !state.sessionActive)
            );
          }
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
    unlocked,
  ]);

  if (configured && !unlocked) {
    return <AdminLogin onSubmit={handleLogin} ready={Boolean(uid)} />;
  }

  // main の text-slate-800 は必須：付けないと端末がダークモードのとき
  // body の色（明るいグレー）を継承して、白カード上のコメント・質問が読めなくなる
  return (
    <main className="min-h-screen bg-slate-100 pb-10 text-slate-800">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="font-bold text-slate-800">管理者画面</h1>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {!state.sessionActive && (
              <span className="rounded-full bg-red-100 px-3 py-1 font-bold text-red-700">
                緊急停止中
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  connected ? "bg-green-500" : "animate-pulse bg-red-500"
                }`}
              />
              接続 {connectionCount} 人
            </span>
            <span className="hidden sm:inline">
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

        <div className="grid items-start gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <SlideController
              currentSlide={state.currentSlide}
              currentMode={state.mode}
              onPrev={handlePrev}
              onNext={handleNext}
              onSelect={move}
            />

            <PollController
              poll={poll}
              selectedTheme={state.selectedTheme}
              onStart={() => withDb((db) => openPoll(db, sessionId))}
              onEnd={() =>
                withDb((db) =>
                  closePoll(db, sessionId, poll.leaderId, state.currentSlide)
                )
              }
              onReset={() => {
                if (confirm("投票結果をリセットしますか？")) {
                  withDb((db) => resetPoll(db, sessionId, state.currentSlide));
                }
              }}
              onPickTheme={(themeId) =>
                withDb((db) => setSelectedTheme(db, sessionId, themeId))
              }
            />
          </div>

          <div className="flex flex-col gap-4">
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
