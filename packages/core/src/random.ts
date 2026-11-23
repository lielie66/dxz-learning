/** Fisher–Yates 洗牌，原地打乱并返回。 */
export function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/** 把正确答案和干扰项去重、打乱，返回选项与正确下标。 */
export function shuffleWithAnswer(
  correct: string,
  distractors: string[]
): { options: string[]; answer: number } {
  const unique = [correct];
  for (const distractor of distractors) {
    if (!unique.includes(distractor)) unique.push(distractor);
  }
  shuffle(unique);
  return { options: unique, answer: unique.indexOf(correct) };
}

/**
 * 洗牌袋：固定小池子先把每一项都出完，再重新洗牌。
 * 每个 key 独立一袋；同一袋不会连续两次抽到同一项。
 */
export function createShuffleBag() {
  const bags = new Map<string, number[]>();
  const lastPick = new Map<string, number>();

  const draw = (key: string, size: number): number => {
    let bag = bags.get(key);
    if (!bag || bag.length === 0) {
      bag = Array.from({ length: size }, (_, i) => i);
      shuffle(bag);
      const last = lastPick.get(key);
      if (last !== undefined && bag.length > 1 && bag[bag.length - 1] === last) {
        [bag[bag.length - 1], bag[0]] = [bag[0], bag[bag.length - 1]];
      }
      bags.set(key, bag);
    }
    const index = bag.pop()!;
    lastPick.set(key, index);
    return index;
  };

  return { draw };
}

/**
 * 最近 N 题签名去重。
 * 生成题目后检查 has(sig)，如果重复就重抽；入池用 add(sig)。
 */
export function createRecentTracker(max = 30) {
  const seen: string[] = [];
  return {
    has: (sig: string) => seen.includes(sig),
    add: (sig: string) => {
      seen.push(sig);
      if (seen.length > max) seen.shift();
    },
  };
}
