export type RateLimiter = {
  /** 実行を試みる。許可されたら true を返し、次のインターバルを開始する */
  attempt: () => boolean;
  /** 次に送信できるまでの残りミリ秒 */
  remainingMs: () => number;
};

export function createRateLimiter(intervalMs: number): RateLimiter {
  let last = 0;
  return {
    attempt() {
      const now = Date.now();
      if (now - last < intervalMs) return false;
      last = now;
      return true;
    },
    remainingMs() {
      return Math.max(0, intervalMs - (Date.now() - last));
    },
  };
}

export const REACTION_INTERVAL_MS = 1000;
export const COMMENT_INTERVAL_MS = 5000;
export const QUESTION_INTERVAL_MS = 10000;
