/** 错题本条目。kind 由学科定义，core 不关心具体题型。 */
export type WrongItem<K extends string = string> = {
  id: string;
  kind: K;
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

/** 写入错题本所需的最小信息；correct 由学科自己格式化。 */
export type WrongInput<K extends string = string> = {
  kind: K;
  tag: string;
  prompt: string;
  correct: string;
  explain: string;
};

export type WrongStats = {
  total: number;
  due: number;
  mastered: number;
  byTag: { tag: string; count: number; mastered: number }[];
};
