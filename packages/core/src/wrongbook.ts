import { readMigratedJSON, writeJSON } from "./storage";
import type { WrongInput, WrongItem, WrongStats } from "./types";

const DAY = 24 * 60 * 60 * 1000;
const INTERVALS = [1, 3, 7, 15];

export type WrongBookOptions = {
  /** 新键，例如 dxz:geo:wrongbook:v1 */
  storageKey: string;
  /** 旧键，用于一次性迁移，例如 geo-lab:wrongbook:v1 */
  legacyKey?: string;
};

/**
 * 创建一个学科的错题本。core 不关心题型和答案格式：
 * 学科把 correct 先格式化好，再交给 add。
 */
export function createWrongBook<K extends string>(options: WrongBookOptions) {
  const load = (): WrongItem<K>[] => {
    const items = readMigratedJSON<WrongItem<K>[]>(
      options.storageKey,
      options.legacyKey,
      []
    );
    return Array.isArray(items) ? items : [];
  };

  const save = (items: WrongItem<K>[]) => writeJSON(options.storageKey, items);

  const add = (input: WrongInput<K>, userAnswer: string): WrongItem<K>[] => {
    const items = load();
    // 同一种题型 + 同一知识点，只留一条，避免错题本爆炸
    const existing = items.find(
      (x) => x.kind === input.kind && x.tag === input.tag && x.stage < 4
    );
    const now = Date.now();
    if (existing) {
      existing.prompt = input.prompt;
      existing.correct = input.correct;
      existing.userAnswer = userAnswer;
      existing.explain = input.explain;
      existing.createdAt = now;
      existing.stage = 0;
      existing.nextReview = now;
      existing.attempts += 1;
    } else {
      items.unshift({
        id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
        kind: input.kind,
        tag: input.tag,
        prompt: input.prompt,
        correct: input.correct,
        userAnswer,
        explain: input.explain,
        createdAt: now,
        stage: 0,
        nextReview: now,
        attempts: 1,
        correctCount: 0,
      });
    }
    save(items);
    return items;
  };

  const review = (id: string, correct: boolean): WrongItem<K>[] => {
    const items = load();
    const item = items.find((x) => x.id === id);
    if (item) {
      item.attempts += 1;
      if (correct) {
        item.correctCount += 1;
        item.stage = Math.min(item.stage + 1, 4);
        const days = INTERVALS[Math.min(item.stage - 1, INTERVALS.length - 1)];
        item.nextReview = Date.now() + days * DAY;
      } else {
        item.stage = 0;
        item.nextReview = Date.now();
      }
    }
    save(items);
    return items;
  };

  const due = (items: WrongItem<K>[]): WrongItem<K>[] => {
    const now = Date.now();
    return items.filter((x) => x.stage < 4 && x.nextReview <= now);
  };

  const clear = (): WrongItem<K>[] => {
    save([]);
    return [];
  };

  const stats = (items: WrongItem<K>[]): WrongStats => {
    const now = Date.now();
    const map = new Map<string, { count: number; mastered: number }>();
    for (const item of items) {
      const entry = map.get(item.tag) ?? { count: 0, mastered: 0 };
      entry.count += 1;
      if (item.stage >= 4) entry.mastered += 1;
      map.set(item.tag, entry);
    }
    return {
      total: items.length,
      due: items.filter((x) => x.stage < 4 && x.nextReview <= now).length,
      mastered: items.filter((x) => x.stage >= 4).length,
      byTag: [...map.entries()]
        .map(([tag, value]) => ({ tag, ...value }))
        .sort((a, b) => b.count - a.count),
    };
  };

  return { load, add, review, due, clear, stats };
}
