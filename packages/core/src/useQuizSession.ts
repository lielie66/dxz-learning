import { useState } from "react";
import type { WrongItem } from "./types";

export type QuizSessionEntry<Q, K extends string, E extends object = {}> = {
  q: Q;
  review: WrongItem<K> | null;
  chosen: number | null;
  added: boolean;
} & E;

export type QuizSessionOptions<
  Q,
  Scope extends string,
  K extends string,
  E extends object = {},
> = {
  /** 按范围生成一道新题；avoidKind 用于避免连续同题型 */
  makeQuestion: (scope: Scope | K, avoidKind?: K) => Q;
  /** 错题重练时按题型生成变式 */
  makeVariant: (kind: K) => Q;
  kindOf: (q: Q) => K;
  /** 由学科创建 entry，可带自己的额外字段（如 clickPoint） */
  createEntry: (q: Q, review: WrongItem<K> | null) => QuizSessionEntry<Q, K, E>;
  answerOf: (q: Q) => number;
  userAnswerOf: (q: Q, index: number) => string;
  onWrong: (q: Q, userAnswer: string) => void;
  onReview: (id: string, correct: boolean) => void;
  /** 开始新题 / 下一题 / 开始错题重练时调用，用于切场景 */
  onQuestionChange?: (q: Q) => void;
  /** 错题重练最后一题做完后调用 */
  onReviewComplete?: () => void;
  initialScope: Scope;
};

/**
 * 练习会话：题目历史、当前选项、错题重练流程。
 * 不负责讲解 / 课程 / 场景渲染，这些仍由学科 App 管理。
 */
export function useQuizSession<
  Q,
  Scope extends string,
  K extends string,
  E extends object = {},
>(options: QuizSessionOptions<Q, Scope, K, E>) {
  const [history, setHistory] = useState<QuizSessionEntry<Q, K, E>[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [practiceKind, setPracticeKind] = useState<Scope | K>(options.initialScope);

  const entry = histIdx >= 0 ? history[histIdx] ?? null : null;
  const quiz = entry?.q ?? null;
  const chosen = entry?.chosen ?? null;
  const reviewItem = entry?.review ?? null;

  const updateEntry = (patch: Partial<QuizSessionEntry<Q, K, E>>) => {
    setHistory((items) =>
      items.map((item, index) =>
        index === histIdx ? ({ ...item, ...patch } as QuizSessionEntry<Q, K, E>) : item
      )
    );
  };

  const start = (scope: Scope | K) => {
    const q = options.makeQuestion(scope);
    setPracticeKind(scope);
    setHistory([options.createEntry(q, null)]);
    setHistIdx(0);
    options.onQuestionChange?.(q);
  };

  const startReview = (items: WrongItem<K>[]) => {
    if (!items.length) {
      setHistory([]);
      setHistIdx(-1);
      return;
    }
    const entries = items.map((item) =>
      options.createEntry(options.makeVariant(item.kind), item)
    );
    setHistory(entries);
    setHistIdx(0);
    options.onQuestionChange?.(entries[0].q);
  };

  const answer = (index: number) => {
    if (!quiz || chosen !== null) return;
    const correct = index === options.answerOf(quiz);
    updateEntry({ chosen: index, added: !correct } as Partial<QuizSessionEntry<Q, K, E>>);
    if (reviewItem) {
      options.onReview(reviewItem.id, correct);
    } else if (!correct) {
      options.onWrong(quiz, options.userAnswerOf(quiz, index));
    }
  };

  const next = () => {
    if (histIdx < history.length - 1) {
      setHistIdx(histIdx + 1);
      return;
    }
    if (history[histIdx]?.review) {
      options.onReviewComplete?.();
      setHistory([]);
      setHistIdx(-1);
      return;
    }
    const avoidKind = quiz ? options.kindOf(quiz) : undefined;
    const q = options.makeQuestion(practiceKind, avoidKind);
    setHistory((items) => [...items, options.createEntry(q, null)]);
    setHistIdx(histIdx + 1);
    options.onQuestionChange?.(q);
  };

  const prev = () => setHistIdx((index) => Math.max(0, index - 1));

  const reset = () => {
    setHistory([]);
    setHistIdx(-1);
  };

  return {
    history,
    histIdx,
    practiceKind,
    entry,
    quiz,
    chosen,
    reviewItem,
    start,
    startReview,
    answer,
    next,
    prev,
    reset,
    updateEntry,
  };
}
