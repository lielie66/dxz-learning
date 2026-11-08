import type { Question, QuestionKind } from "./quiz";
import { fmtCoord } from "./coords";

export type WrongItem = {
  id: string;
  kind: QuestionKind;
  tag: string;
  prompt: string;
  correct: string;
  userAnswer: string;
  explain: string;
  createdAt: number;
  stage: number;
  nextReview: number;
  attempts: number;
  correctCount: number;
};

const KEY = "geo-lab:wrongbook:v1";
const DAY = 24 * 60 * 60 * 1000;
const INTERVALS = [1, 3, 7, 15];

export function loadWrongBook(): WrongItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as WrongItem[]) : [];
  } catch {
    return [];
  }
}

function save(items: WrongItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* 空间不足时忽略 */
  }
}

export function addWrong(q: Question, userAnswer: string): WrongItem[] {
  const items = loadWrongBook();
  const correct = q.targetProvince ?? (q.target ? fmtCoord(q.target) : q.options[q.answer]);
  // 同一种题型 + 同一知识点，只留一条，避免错题本爆炸
  const existing = items.find((x) => x.kind === q.kind && x.tag === q.tag && x.stage < 4);
  const now = Date.now();
  if (existing) {
    existing.prompt = q.prompt;
    existing.correct = correct;
    existing.userAnswer = userAnswer;
    existing.explain = q.explain;
    existing.createdAt = now;
    existing.stage = 0;
    existing.nextReview = now;
    existing.attempts += 1;
  } else {
    items.unshift({
      id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
      kind: q.kind,
      tag: q.tag,
      prompt: q.prompt,
      correct,
      userAnswer,
      explain: q.explain,
      createdAt: now,
      stage: 0,
      nextReview: now,
      attempts: 1,
      correctCount: 0,
    });
  }
  save(items);
  return items;
}

export function reviewResult(id: string, correct: boolean): WrongItem[] {
  const items = loadWrongBook();
  const it = items.find((x) => x.id === id);
  if (it) {
    it.attempts += 1;
    if (correct) {
      it.correctCount += 1;
      it.stage = Math.min(it.stage + 1, 4);
      const days = INTERVALS[Math.min(it.stage - 1, INTERVALS.length - 1)];
      it.nextReview = Date.now() + days * DAY;
    } else {
      it.stage = 0;
      it.nextReview = Date.now();
    }
  }
  save(items);
  return items;
}

export function dueItems(items: WrongItem[]): WrongItem[] {
  const now = Date.now();
  return items.filter((x) => x.stage < 4 && x.nextReview <= now);
}

export function clearWrongBook(): WrongItem[] {
  save([]);
  return [];
}

export type WrongStats = {
  total: number;
  due: number;
  mastered: number;
  byTag: { tag: string; count: number; mastered: number }[];
};

export function wrongStats(items: WrongItem[]): WrongStats {
  const now = Date.now();
  const map = new Map<string, { count: number; mastered: number }>();
  for (const it of items) {
    const m = map.get(it.tag) ?? { count: 0, mastered: 0 };
    m.count += 1;
    if (it.stage >= 4) m.mastered += 1;
    map.set(it.tag, m);
  }
  return {
    total: items.length,
    due: items.filter((x) => x.stage < 4 && x.nextReview <= now).length,
    mastered: items.filter((x) => x.stage >= 4).length,
    byTag: [...map.entries()]
      .map(([tag, v]) => ({ tag, ...v }))
      .sort((a, b) => b.count - a.count),
  };
}
