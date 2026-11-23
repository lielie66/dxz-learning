import { createWrongBook } from "@dxz/core";
import type { WrongInput, WrongItem as CoreWrongItem, WrongStats } from "@dxz/core";
import type { Question, QuestionKind } from "./quiz";
import { fmtCoord } from "./coords";

export type WrongItem = CoreWrongItem<QuestionKind>;
export type { WrongStats };

export const GEO_WRONG_KEY = "dxz:geo:wrongbook:v1";
export const GEO_WRONG_LEGACY_KEY = "geo-lab:wrongbook:v1";

const book = createWrongBook<QuestionKind>({
  storageKey: GEO_WRONG_KEY,
  legacyKey: GEO_WRONG_LEGACY_KEY,
});

/** 把地理题目转成错题本需要的字段；correct 由地理自己格式化。 */
export function wrongInput(q: Question): WrongInput<QuestionKind> {
  return {
    kind: q.kind,
    tag: q.tag,
    prompt: q.prompt,
    correct:
      q.targetProvince ?? (q.target ? fmtCoord(q.target) : q.options[q.answer]),
    explain: q.explain,
  };
}

export function loadWrongBook(): WrongItem[] {
  return book.load();
}

export function addWrong(q: Question, userAnswer: string): WrongItem[] {
  return book.add(wrongInput(q), userAnswer);
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
