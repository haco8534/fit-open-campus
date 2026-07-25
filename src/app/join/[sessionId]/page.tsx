"use client";

import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_SESSION_ID, type SessionMode } from "@/lib/session";
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth";
import { useSessionState } from "@/hooks/useSessionState";
import { usePresence, useConnectionCount } from "@/hooks/usePresence";
import { usePoll } from "@/hooks/usePoll";
import { useSendComment } from "@/hooks/useComments";
import { useSendReaction } from "@/hooks/useReactions";
import { useSendQuestion } from "@/hooks/useQuestions";
import { ReactionPanel } from "@/components/participant/ReactionPanel";
import { CommentForm } from "@/components/participant/CommentForm";
import { PollPanel } from "@/components/participant/PollPanel";
import { QuestionForm } from "@/components/participant/QuestionForm";
import { WaitingScreen } from "@/components/participant/WaitingScreen";
import styles from "@/components/participant/participant.module.css";

type PhaseUI = {
  title: string;
  hint: string;
};

const PHASE: Record<SessionMode, PhaseUI> = {
  waiting: {
    title: "参加できました",
    hint: "セッションが始まるまでお待ちください",
  },
  reaction: {
    title: "リアクションを送ろう",
    hint: "気になったところでボタンをタップしてください",
  },
  talk: {
    title: "感想をシェアしよう",
    hint: "リアクションとコメントが会場スクリーンに表示されます",
  },
  poll: {
    title: "次のテーマを選ぼう",
    hint: "いちばん聞きたいテーマを1つ選んでください",
  },
  question: {
    title: "質問してみよう",
    hint: "匿名で送れます。登壇者が会場で回答します",
  },
  ending: {
    title: "ご参加ありがとうございました",
    hint: "最後に感想を送ってみてください",
  },
};

export default function JoinPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params?.sessionId ?? DEFAULT_SESSION_ID;

  const { uid, failed: authFailed } = useAnonymousAuth();
  usePresence(sessionId, uid);
  const { state, connected, configured, loaded } = useSessionState(sessionId);
  const connectionCount = useConnectionCount(sessionId);
  const poll = usePoll(sessionId, uid);
  const sendComment = useSendComment(sessionId, uid);
  const sendReaction = useSendReaction(sessionId, uid);
  const sendQuestion = useSendQuestion(sessionId, uid);

  const phase = PHASE[state.mode] ?? PHASE.reaction;
  const ready = configured && loaded && uid && state.sessionActive;

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
      // サインインに失敗しているときは黙って待たせない（自動で再試行し続けている）
      return authFailed ? (
        <WaitingScreen
          title="接続をやり直しています"
          message="電波の良い場所で少し待ってください。つながらないときは画面を再読み込みしてね"
        />
      ) : (
        <WaitingScreen title="接続中…" message="少しだけ待ってね" />
      );
    }
    if (!state.sessionActive) {
      return (
        <WaitingScreen
          title="まもなく始まります"
          message="スクリーンにご注目ください"
        />
      );
    }

    switch (state.mode) {
      // 開始前。コメントもリアクションも送れない
      case "waiting":
        return (
          <WaitingScreen
            title="まもなく始まります"
            message="スクリーンを見ながらお待ちください。始まったらこの画面が自動で切り替わります"
          />
        );

      case "poll":
        return <PollPanel poll={poll} />;

      case "question":
        return (
          <div className="flex flex-col gap-3">
            <QuestionForm onSend={sendQuestion} />
            {state.reactionsEnabled && (
              <ReactionPanel onSend={sendReaction} title="聞きながら反応する" compact />
            )}
          </div>
        );

      // スライド8（エンディング・質問受付）。質問フォームもここに出す
      case "ending":
        return (
          <div className="flex flex-col gap-3">
            <div className={`${styles.contentCard} p-4`}>
              <h2 className="text-base font-semibold">ご参加ありがとうございました</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                気になることは、近くのスタッフや登壇者にも気軽に聞いてみてください。
              </p>
            </div>
            <QuestionForm onSend={sendQuestion} />
            <ReactionPanel
              onSend={sendReaction}
              disabled={!state.reactionsEnabled}
              title="最後に感想を送る"
            />
            <CommentForm onSend={sendComment} disabled={!state.commentsEnabled} />
          </div>
        );

      case "talk":
      case "reaction":
      default:
        return (
          <div className="flex flex-col gap-3">
            <ReactionPanel
              onSend={sendReaction}
              disabled={!state.reactionsEnabled}
            />
            <CommentForm onSend={sendComment} disabled={!state.commentsEnabled} />
          </div>
        );
    }
  };

  return (
    <main className={styles.shell}>
      <div
        className={`${styles.canvas} mx-auto flex min-h-[100dvh] w-full max-w-[520px] flex-col`}
      >
        <header
          className={`${styles.header} flex items-center justify-between gap-3 px-4 py-3`}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={`${styles.logo} flex h-8 w-8 shrink-0 items-center justify-center text-[11px] font-bold`}
            >
              FIT
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">
                学生トークセッション
              </p>
              <p className="truncate text-xs text-slate-500">
                オープンキャンパス 2026
              </p>
            </div>
          </div>
          <div
            className={`${styles.statusChip} flex shrink-0 items-center gap-1.5 px-2.5 py-1 text-xs`}
            aria-live="polite"
          >
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                connected ? "bg-emerald-500" : "animate-pulse bg-amber-500"
              }`}
            />
            {connected ? `${connectionCount}人` : "接続中"}
          </div>
        </header>

        {ready && (
          <div className="px-4 pt-4">
            <h1 className="text-lg font-semibold">{phase.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{phase.hint}</p>
          </div>
        )}

        <div className="flex-1 px-4 pb-4 pt-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${state.sessionActive}-${state.mode}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {renderBody()}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer
          className={`${styles.footer} mt-auto px-4 py-3 text-center text-xs`}
        >
          匿名で参加中です。投稿は会場のスクリーンに表示されます。
        </footer>
      </div>
    </main>
  );
}
