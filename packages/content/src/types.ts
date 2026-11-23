export type SubjectId = "geo" | "history" | "biology" | string;

export type Chapter = {
  id: string;
  title: string;
  sections: { id: string; title: string }[];
};

export type SubjectManifest = {
  id: SubjectId;
  name: string;
  grade: string;
  term: string;
  edition: string;
  region: string;
  /** ISO 日期，用于倒计时和复习排期 */
  examDate: string;
  chapters: Chapter[];
  /** 内容版本，用于错题数据迁移 */
  version: string;
};

export type SceneSpec = {
  /** globe | worldMap | chinaMap | timeline | cell | ... */
  type: string;
  props: Record<string, unknown>;
};

export type LessonStepBase = {
  title: string;
  body: string;
  bullets?: string[];
  tip?: string;
  scene: SceneSpec;
};

export type QuestionSource = {
  type: "textbook" | "exam" | "school" | "original";
  name?: string;
  year?: number;
  /** 答案是否已核对 */
  verified: boolean;
};

export type QuestionBase = {
  id: string;
  subject: SubjectId;
  kind: string;
  chapterId: string;
  pointId: string;
  stem: string;
  options?: string[];
  answer: number | string;
  explain: string;
  difficulty: 1 | 2 | 3;
  scene?: SceneSpec;
  source?: QuestionSource;
};
