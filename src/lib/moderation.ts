export const COMMENT_MAX_LENGTH = 30;
export const QUESTION_MAX_LENGTH = 80;

// 最低限のNGワード。イベント前に必要に応じて追加する。
const NG_WORDS = [
  "死ね",
  "殺す",
  "きもい",
  "キモい",
  "うざい",
  "ウザい",
  "ばか",
  "バカ",
  "あほ",
  "アホ",
  "くそ",
  "クソ",
];

const URL_PATTERN =
  /(https?:\/\/|www\.|[a-z0-9-]+\.(com|net|jp|org|io|dev|app|xyz|info))/i;
const EMAIL_PATTERN = /[\w.+-]+@[\w-]+/;
// 9桁以上の数字列（区切りあり含む）を電話番号らしき文字列とみなす
const PHONE_PATTERN = /(\d[\s\-()]?){9,}/;

export type ModerationResult =
  | { ok: true; text: string }
  | { ok: false; reason: string };

function validateText(raw: string, maxLength: number): ModerationResult {
  const text = raw.replace(/\s+/g, " ").trim();

  if (text.length === 0) {
    return { ok: false, reason: "内容を入力してください" };
  }
  if (raw.includes("\n") || raw.includes("\r")) {
    return { ok: false, reason: "改行は使えません" };
  }
  if (text.length > maxLength) {
    return { ok: false, reason: `${maxLength}文字以内で入力してください` };
  }
  if (URL_PATTERN.test(text)) {
    return { ok: false, reason: "URLは送信できません" };
  }
  if (EMAIL_PATTERN.test(text)) {
    return { ok: false, reason: "メールアドレスは送信できません" };
  }
  if (PHONE_PATTERN.test(text)) {
    return { ok: false, reason: "電話番号らしき文字列は送信できません" };
  }
  const lower = text.toLowerCase();
  if (NG_WORDS.some((w) => lower.includes(w.toLowerCase()))) {
    return { ok: false, reason: "使用できない言葉が含まれています" };
  }
  return { ok: true, text };
}

export function validateComment(raw: string): ModerationResult {
  return validateText(raw, COMMENT_MAX_LENGTH);
}

export function validateQuestion(raw: string): ModerationResult {
  return validateText(raw, QUESTION_MAX_LENGTH);
}
