import { useMemo, useState } from "react";
import { createWrongBook } from "./wrongbook";
import type { WrongInput, WrongItem, WrongStats } from "./types";

/**
 * 学科错题本的 React 状态封装。
 * 传入新键和可选的旧键；旧键会一次性迁移到新键。
 */
export function useWrongBook<K extends string>(storageKey: string, legacyKey?: string) {
  const store = useMemo(
    () => createWrongBook<K>({ storageKey, legacyKey }),
    [storageKey, legacyKey]
  );
  const [items, setItems] = useState<WrongItem<K>[]>(() => store.load());

  const stats = useMemo<WrongStats>(() => store.stats(items), [store, items]);

  const add = (input: WrongInput<K>, userAnswer: string) => {
    setItems(store.add(input, userAnswer));
  };

  const review = (id: string, correct: boolean) => {
    setItems(store.review(id, correct));
  };

  const clear = () => setItems(store.clear());

  const due = () => store.due(items);

  return { items, stats, add, review, clear, due };
}
