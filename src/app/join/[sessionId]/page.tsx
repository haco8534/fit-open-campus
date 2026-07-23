"use client";

import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_SESSION_ID, type SessionMode } from "@/lib/session";
import { getPollOption } from "@/config/pollOptions";
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

type PhaseUI = {
  badge: string;
  emoji: string;
  hint: string;
  bg: string;
};

// モードごとの「今なにをする時間か」を示す表示
const PHASE: Record<SessionMode, PhaseUI> = {
  reaction: {
    badge: "リアクションタイム",
    emoji: "🙌",
    hint: "ボタンを押して盛り上げよう！",
    bg: "from-indigo-600 via-purple-600 to-fuchsia-600",
  },
  talk: {
    badge: "座談会トーク中",
    emoji: "💬",
    hint: "感想やリアクションを送ってみよう！",
    bg: "from-sky-600 via-indigo-600 to-purple-600",
  },
  poll: {
    badge: "投票タイム",
    emoji: "🗳️",
    hint: "聞きたいテーマに投票してね！",
    bg: "from-rose-500 via-pink-600 to-fuchsia-600",
  },
  question: {
    badge: "質問タイム",
    emoji: "🙋",
    hint: "聞きたいことを送ってみよう！",
    bg: "from-emerald-500 via-teal-600 to-sky-600",
  },
  ending: {
    badge: "エンディング",
    emoji: "🎉",
    hint: "参加してくれてありがとう！",
    bg: "from-amber-500 via-orange-500 to-rose-500",
  },
};

export default function JoinPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params?.sessionId ?? DEFAULT_SESSION_ID;

  const uid = useAnonymousAuth();
  usePresence(sessionId, uid);
  const { state, connected, configured, loaded } = useSessionState(sessionId);
  const connectionCount = useConnectionCount(sessionId);
  const poll = usePoll(sessionId, uid);
  const sendComment = useSendComment(sessionId, uid);
  const sendReaction = useSendReaction(sessionId, uid);
  const sendQuestion = useSendQuestion(sessionId, uid);

  const themeLabel = getPollOption(state.selectedTheme)?.label;
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
      return <WaitingScreen title="接続中…" message="少しだけ待ってね" />;
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
      case "poll":
        return <PollPanel poll={poll} selectedTheme={state.selectedTheme} />;

      case "question":
        return (
          <div className="flex flex-col gap-4">
            <QuestionForm onSend={sendQuestion} />
            {state.reactionsEnabled && (
              <ReactionPanel onSend={sendReaction} title="リアクションも送れるよ" />
            )}
          </div>
        );

      case "ending":
        return (
          <div className="flex flex-col gap-4">
            <div className="rounded-3xl bg-white/95 p-5 text-center shadow-lg">
              <p className="text-2xl">🎉🎓🎉</p>
              <p className="mt-2 text-lg font-black text-slate-800">
                ご参加ありがとう！
              </p>
              <p className="mt-1 text-sm text-slate-500">
                気になることは、近くのスタッフや登壇者に気軽に聞いてね
              </p>
            </div>
            <ReactionPanel
              onSend={sendReaction}
              disabled={!state.reactionsEnabled}
              title="最後にもう一度リアクション！"
            />
            <CommentForm onSend={sendComment} disabled={!state.commentsEnabled} />
          </div>
        );

      case "talk":
      case "reaction":
      default:
        return (
          <div className="flex flex-col gap-4">
            {themeLabel && (
              <div className="rounded-2xl bg-white/95 px-4 py-3 text-center shadow-md">
                <p className="text-[11px] font-bold tracking-wide text-fuchsia-600">
                  🎤 いま話しているテーマ
                </p>
                <p className="mt-0.5 font-bold text-slate-800">{themeLabel}</p>
              </div>
            )}
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
    <main
      className={`relative min-h-screen w-full bg-gradient-to-b ${phase.bg} transition-colors duration-700`}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        {/* ヘッダー */}
        <header className="flex items-center justify-between px-4 pt-4">
          <div className="flex items-center gap-1.5 text-white">
            <span className="text-sm font-black leading-tight">
              福工大 学生トークセッション
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-black/20 px-2.5 py-1 text-[11px] font-bold text-white">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                connected ? "bg-green-300" : "bg-red-300 animate-pulse"
              }`}
            />
            {connected ? `${connectionCount}人が参加中` : "接続中…"}
          </div>
        </header>

        {/* フェーズバナー：今なにをする時間かを大きく示す */}
        {ready && (
          <div className="px-4 pt-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={state.mode}
                initial={{ opacity: 0, scale: 0.92, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-3 rounded-3xl bg-white/15 px-4 py-3 backdrop-blur-sm"
              >
                <motion.span
                  animate={{ rotate: [0, -8, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="text-4xl"
                >
                  {phase.emoji}
                </motion.span>
                <div className="text-white">
                  <p className="text-lg font-black leading-tight">{phase.badge}</p>
                  <p className="text-xs font-medium text-white/80">{phase.hint}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* 本体：モードに応じて自動切り替え */}
        <div className="flex-1 px-4 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${state.sessionActive}-${state.mode}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.22 }}
            >
              {renderBody()}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="px-4 pb-4 text-center text-[11px] font-medium text-white/70">
          匿名で参加中・コメントやリアクションはスクリーンに映るよ
        </footer>
      </div>
    </main>
  );
}
