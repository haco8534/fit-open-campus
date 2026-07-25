import {
  NG_WORDS_EXACT,
  NG_WORDS_FOLDED,
  SAFE_PHRASES,
} from "./ngWords";

export const COMMENT_MAX_LENGTH = 30;
export const QUESTION_MAX_LENGTH = 80;

const URL_PATTERN =
  /(https?:\/\/|www\.|[a-z0-9-]+\.(com|net|jp|org|io|dev|app|xyz|info))/i;
const EMAIL_PATTERN = /[\w.+-]+@[\w-]+/;
// 9桁以上の数字列（区切りあり含む）を電話番号らしき文字列とみなす
const PHONE_PATTERN = /(\d[\s\-()]?){9,}/;

/** 空白・記号・伸ばし棒。「し ね」「し・ね」「し～ね」のような回避を潰すために落とす */
const NOISE_PATTERN =
  /[\s　ー~〜_\-–—.,、。・･!！?？"'`^*+=<>()（）[\]{}｢｣「」『』:;|\\/@#$%&…]/g;

/** カタカナをひらがなに畳む（「シネ」と「しね」を同じ扱いにする） */
function toHiragana(text: string): string {
  return text.replace(/[ァ-ヶ]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0x60)
  );
}

/**
 * NGワード判定用に本文を正規化する。
 *
 * - NFKC で全角英数・半角カナを揃える（「死ね」「ｼﾈ」を同じ形にする）
 * - 空白と記号を落とす（「し ね」での回避を防ぐ）
 * - 問題のない語（「ばかり」など）を先に取り除く
 *
 * exact は表記を残したもの、folded はカタカナをひらがなに畳んだもの。
 * 2文字の語を畳んで判定すると「イク」が「行く」に反応してしまうため、2種類を使い分ける。
 */
function normalizeForMatch(raw: string): { exact: string; folded: string } {
  let base = raw.normalize("NFKC").toLowerCase().replace(NOISE_PATTERN, "");
  for (const phrase of SAFE_PHRASES) {
    base = base.split(phrase).join("");
  }
  return { exact: base, folded: toHiragana(base) };
}

/** NGワードを含むか。含む場合はその語を返す（ログ用。利用者には見せない） */
export function findNgWord(raw: string): string | null {
  const { exact, folded } = normalizeForMatch(raw);
  for (const word of NG_WORDS_FOLDED) {
    if (folded.includes(word)) return word;
  }
  for (const word of NG_WORDS_EXACT) {
    if (exact.includes(word)) return word;
  }
  return null;
}

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
  if (findNgWord(text)) {
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
