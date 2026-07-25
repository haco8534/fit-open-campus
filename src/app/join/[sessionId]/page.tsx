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
import styles from "@/components/participant/participant.module.css";

type PhaseUI = {
  number: string;
  kicker: string;
  title: string;
  hint: string;
  mark: string;
};

const PHASE: Record<SessionMode, PhaseUI> = {
  reaction: {
    number: "01",
    kicker: "REACT",
    title: "その場で、反応しよう。",
    hint: "感じた瞬間にボタンをタップ",
    mark: "!",
  },
  talk: {
    number: "02",
    kicker: "LIVE TALK",
    title: "感じたことを、そのまま。",
    hint: "リアクションやひとことをスクリーンへ",
    mark: "▶",
  },
  poll: {
    number: "03",
    kicker: "YOUR CHOICE",
    title: "次の話題を、みんなで決める。",
    hint: "いちばん聞きたいテーマを1つ選ぼう",
    mark: "✓",
  },
  question: {
    number: "04",
    kicker: "ASK US",
    title: "気になること、聞いてみよう。",
    hint: "名前は出ないので、気軽にどうぞ",
    mark: "?",
  },
  ending: {
    number: "05",
    kicker: "THANK YOU",
    title: "ここから、キャンパスへ。",
    hint: "参加してくれてありがとうございました",
    mark: "＋",
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
      case "poll":
        return <PollPanel poll={poll} selectedTheme={state.selectedTheme} />;

      case "question":
        return (
          <div className="flex flex-col gap-3">
            <QuestionForm onSend={sendQuestion} />
            {state.reactionsEnabled && (
              <ReactionPanel onSend={sendReaction} title="聞きながら反応する" compact />
            )}
          </div>
        );

      case "ending":
        return (
          <div className="flex flex-col gap-3">
            <div className={`${styles.contentCard} relative overflow-hidden p-5`}>
              <span className="absolute -right-3 -top-5 text-[72px] font-black leading-none text-[var(--accent-soft)]">
                FIT
              </span>
              <p className={`${styles.sectionLabel} relative text-[10px] font-black`}>
                SESSION COMPLETE
              </p>
              <p className="relative mt-4 text-2xl font-black tracking-tight">
                ご参加ありがとう！
              </p>
              <p className="relative mt-2 max-w-[18rem] text-sm font-bold leading-relaxed text-slate-600">
                気になることは、近くのスタッフや登壇者に気軽に聞いてね
              </p>
            </div>
            <ReactionPanel
              onSend={sendReaction}
              disabled={!state.reactionsEnabled}
              title="最後にひとつ、感想をタップ"
            />
            <CommentForm onSend={sendComment} disabled={!state.commentsEnabled} />
          </div>
        );

      case "talk":
      case "reaction":
      default:
        return (
          <div className="flex flex-col gap-3">
            {themeLabel && (
              <div className={`${styles.softCard} flex items-start gap-3 p-3.5`}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-sm font-black text-white">
                  NOW
                </span>
                <div>
                  <p className="text-[10px] font-black tracking-[0.14em] text-[var(--accent)]">
                    いま話しているテーマ
                  </p>
                  <p className="mt-1 text-sm font-black leading-snug">{themeLabel}</p>
                </div>
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
      className={styles.shell}
      data-phase={state.mode}
    >
      <div className={`${styles.canvas} mx-auto flex min-h-[100dvh] w-full max-w-[520px] flex-col`}>
        <header className="flex items-center justify-between gap-3 px-4 pb-3 pt-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px_10px_3px_10px] bg-[var(--ink)] text-xs font-black tracking-tight text-white">
              FIT
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-black tracking-[0.12em] text-slate-500">
                OPEN CAMPUS 2026
              </p>
              <p className="truncate text-sm font-black leading-tight">学生トークセッション</p>
            </div>
          </div>
          <div
            className="flex shrink-0 items-center gap-1.5 rounded-full border-2 border-[var(--ink)] bg-white px-2.5 py-1.5 text-[10px] font-black"
            aria-live="polite"
          >
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                connected ? "bg-[#65d36e]" : "animate-pulse bg-[#ff5c35]"
              }`}
            />
            {connected ? `${connectionCount}人 LIVE` : "接続中"}
          </div>
        </header>

        {ready && (
          <div className="px-4 pb-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={state.mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className={`${styles.phaseCard} min-h-[136px] p-4 text-white`}
              >
                <div className="relative z-10 flex h-full items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black tracking-[0.2em] text-white/75">
                      {phase.number} / {phase.kicker}
                    </p>
                    <h1 className="mt-3 max-w-[17rem] text-[26px] font-black leading-[1.12] tracking-[-0.04em]">
                      {phase.title}
                    </h1>
                    <p className="mt-2 text-xs font-bold text-white/85">{phase.hint}</p>
                  </div>
                  <motion.span
                    animate={{ rotate: [2, -2, 2] }}
                    transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                    className={`${styles.phaseStamp} flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px_16px_5px_16px] text-3xl font-black text-[var(--ink)]`}
                    aria-hidden="true"
                  >
                    {phase.mark}
                  </motion.span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        <div className="flex-1 px-4 pb-4">
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

        <footer className={`${styles.privacyStrip} mt-auto flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-bold text-slate-600`}>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ink)] text-[10px] text-white">
            i
          </span>
          匿名で参加中／投稿は会場スクリーンに表示されます
        </footer>
      </div>
    </main>
  );
}
