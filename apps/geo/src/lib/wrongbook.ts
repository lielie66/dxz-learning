import { createWrongBook } from "@dxz/core";
import type { WrongItem as CoreWrongItem, WrongStats } from "@dxz/core";
import type { Question, QuestionKind } from "./quiz";
import { fmtCoord } from "./coords";

export type WrongItem = CoreWrongItem<QuestionKind>;
export type { WrongStats };

const book = createWrongBook<QuestionKind>({
  storageKey: "dxz:geo:wrongbook:v1",
  legacyKey: "geo-lab:wrongbook:v1",
});

export function loadWrongBook(): WrongItem[] {
  return book.load();
}

export function addWrong(q: Question, userAnswer: string): WrongItem[] {
  const correct =
    q.targetProvince ?? (q.target ? fmtCoord(q.target) : q.options[q.answer]);
  return book.add(
    {
      kind: q.kind,
      tag: q.tag,
      prompt: q.prompt,
      correct,
      explain: q.explain,
    },
    userAnswer
  );
}

export function reviewResult(id: string, correct: boolean): WrongItem[] {
  return book.review(id, correct);
}

export function dueItems(items: WrongItem[]): WrongItem[] {
  return book.due(items);
}

export function clearWrongBook(): WrongItem[] {
  return book.clear();
}

export function wrongStats(items: WrongItem[]): WrongStats {
  return book.stats(items);
}
