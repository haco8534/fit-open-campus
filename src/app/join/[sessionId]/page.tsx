"use client";

import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_SESSION_ID } from "@/lib/session";
import { getPollOption } from "@/config/pollOptions";
import { getSlide } from "@/config/slides";
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth";
import { useSessionState } from "@/hooks/useSessionState";
import { usePresence } from "@/hooks/usePresence";
import { usePoll } from "@/hooks/usePoll";
import { useSendComment } from "@/hooks/useComments";
import { useSendReaction } from "@/hooks/useReactions";
import { useSendQuestion } from "@/hooks/useQuestions";
import { ReactionPanel } from "@/components/participant/ReactionPanel";
import { CommentForm } from "@/components/participant/CommentForm";
import { PollPanel } from "@/components/participant/PollPanel";
import { QuestionForm } from "@/components/participant/QuestionForm";
import { WaitingScreen } from "@/components/participant/WaitingScreen";

export default function JoinPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params?.sessionId ?? DEFAULT_SESSION_ID;

  const uid = useAnonymousAuth();
  usePresence(sessionId, uid);
  const { state, connected, configured, loaded } = useSessionState(sessionId);
  const poll = usePoll(sessionId, uid);
  const sendComment = useSendComment(sessionId, uid);
  const sendReaction = useSendReaction(sessionId, uid);
  const sendQuestion = useSendQuestion(sessionId, uid);

  const themeLabel = getPollOption(state.selectedTheme)?.label;
  const slide = getSlide(state.currentSlide);

  const renderBody = () => {
    if (!configured) {
      return (
        <WaitingScreen
          title="準備中です"
          message="アプリの設定が完了していません"
        />
      );
    }
    if (!loaded || !uid) {
      return <WaitingScreen title="接続中…" message="少しお待ちください" />;
    }
    if (!state.sessionActive) {
      return <WaitingScreen />;
    }

    switch (state.mode) {
      case "poll":
        return <PollPanel poll={poll} selectedTheme={state.selectedTheme} />;

      case "question":
        return (
          <div className="flex flex-col gap-6">
            <QuestionForm onSend={sendQuestion} />
            {state.reactionsEnabled && (
              <ReactionPanel onSend={sendReaction} />
            )}
          </div>
        );

      case "ending":
        return (
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl bg-sky-100 p-4 text-center">
              <p className="text-lg font-bold text-sky-800">
                ご参加ありがとうございました！🎉
              </p>
              <p className="mt-1 text-sm text-sky-700">
                質問があれば近くのスタッフや登壇者に気軽に声をかけてください
              </p>
            </div>
            <ReactionPanel
              onSend={sendReaction}
              disabled={!state.reactionsEnabled}
            />
            <CommentForm
              onSend={sendComment}
              disabled={!state.commentsEnabled}
            />
          </div>
        );

      case "talk":
      case "reaction":
      default:
        return (
          <div className="flex flex-col gap-5">
            {themeLabel && (
              <div className="rounded-2xl bg-yellow-100 px-4 py-3 text-center">
                <p className="text-xs text-yellow-700">🎤 いま話しているテーマ</p>
                <p className="mt-0.5 font-bold text-yellow-900">{themeLabel}</p>
              </div>
            )}
            <div>
              <p className="mb-2 text-center text-sm text-slate-500">
                リアクションで盛り上げよう！
              </p>
              <ReactionPanel
                onSend={sendReaction}
                disabled={!state.reactionsEnabled}
              />
            </div>
            <CommentForm
              onSend={sendComment}
              disabled={!state.commentsEnabled}
            />
          </div>
        );
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-slate-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-sm font-bold text-slate-800">
              福岡工業大学 学生トークセッション
            </h1>
            <p className="text-[11px] text-slate-400">
              {slide.title ?? ""}・匿名で参加できます
            </p>
          </div>
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              connected ? "bg-green-500" : "bg-red-500 animate-pulse"
            }`}
            title={connected ? "接続中" : "再接続中"}
          />
        </div>
      </header>

      {/* モードに応じて自動切り替え */}
      <div className="flex-1 px-4 py-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${state.sessionActive}-${state.mode}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            {renderBody()}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="px-4 pb-4 text-center text-[11px] text-slate-400">
        コメント・リアクションはスクリーンに表示されます
      </footer>
    </main>
  );
}
