"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { onValue, ref, set } from "firebase/database";
import { getDb } from "@/lib/firebase";
import { sessionPath } from "@/lib/session";
import { POLL_OPTIONS } from "@/config/pollOptions";

export type PollStatus = "open" | "closed";

export type PollTally = {
  id: string;
  label: string;
  votes: number;
};

export type PollResultData = {
  status: PollStatus;
  tallies: PollTally[];
  totalVotes: number;
  /** 最多票のオプションid（同票の場合は null） */
  leaderId: string | null;
  /** 自分の投票先 */
  myVote: string | null;
  vote: (optionId: string) => Promise<boolean>;
};

export function usePoll(sessionId: string, uid: string | null): PollResultData {
  const [status, setStatus] = useState<PollStatus>("closed");
  const [voters, setVoters] = useState<Record<string, string>>({});

  useEffect(() => {
    const db = getDb();
    if (!db) return;
    return onValue(ref(db, sessionPath(sessionId, "poll")), (snap) => {
      const v = snap.val() as {
        status?: string;
        voters?: Record<string, string>;
      } | null;
      setStatus(v?.status === "open" ? "open" : "closed");
      setVoters(v?.voters ?? {});
    });
  }, [sessionId]);

  const tallies = useMemo<PollTally[]>(() => {
    const counts = new Map<string, number>();
    for (const optionId of Object.values(voters)) {
      counts.set(optionId, (counts.get(optionId) ?? 0) + 1);
    }
    return POLL_OPTIONS.map((o) => ({
      id: o.id,
      label: o.label,
      votes: counts.get(o.id) ?? 0,
    }));
  }, [voters]);

  const totalVotes = useMemo(
    () => tallies.reduce((sum, t) => sum + t.votes, 0),
    [tallies]
  );

  const leaderId = useMemo(() => {
    const max = Math.max(...tallies.map((t) => t.votes));
    if (max === 0) return null;
    const leaders = tallies.filter((t) => t.votes === max);
    return leaders.length === 1 ? leaders[0].id : null;
  }, [tallies]);

  const myVote = uid ? (voters[uid] ?? null) : null;

  const vote = useCallback(
    async (optionId: string): Promise<boolean> => {
      const db = getDb();
      if (!db || !uid || status !== "open") return false;
      try {
        await set(
          ref(db, sessionPath(sessionId, "poll", "voters", uid)),
          optionId
        );
        return true;
      } catch {
        return false;
      }
    },
    [sessionId, uid, status]
  );

  return { status, tallies, totalVotes, leaderId, myVote, vote };
}
