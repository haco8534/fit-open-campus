export type ReactionType = "like" | "laugh" | "hmm" | "more" | "wow";

export type ReactionDef = {
  type: ReactionType;
  emoji: string;
  label: string;
};

export const REACTIONS: ReactionDef[] = [
  { type: "like", emoji: "👍", label: "なるほど" },
  { type: "laugh", emoji: "😂", label: "おもしろい" },
  { type: "hmm", emoji: "🤔", label: "わからない" },
  { type: "more", emoji: "👀", label: "もっと聞きたい" },
  { type: "wow", emoji: "🎉", label: "すごい" },
];

export const REACTION_TYPES: ReactionType[] = REACTIONS.map((r) => r.type);

export function getReaction(type: string): ReactionDef | undefined {
  return REACTIONS.find((r) => r.type === type);
}
