import type { LessonStepBase, QuestionBase } from "./types";

export type ValidationIssue = { path: string; message: string };

/** 只做结构级校验；学科特有的 scene 参数由各学科补。 */
export function validateQuestion(q: QuestionBase): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!q.id) issues.push({ path: "id", message: "缺少 id" });
  if (!q.stem.trim()) issues.push({ path: "stem", message: "题干为空" });
  if (!q.explain.trim()) issues.push({ path: "explain", message: "解析为空" });
  if (q.options) {
    if (q.options.length < 2) {
      issues.push({ path: "options", message: "选项少于 2 个" });
    }
    if (new Set(q.options).size !== q.options.length) {
      issues.push({ path: "options", message: "选项有重复" });
    }
    if (typeof q.answer === "number" && (q.answer < 0 || q.answer >= q.options.length)) {
      issues.push({ path: "answer", message: "答案不在选项范围内" });
    }
    if (typeof q.answer === "string" && !q.options.includes(q.answer)) {
      issues.push({ path: "answer", message: "答案不在选项内" });
    }
  }
  return issues;
}

export function validateLessonSteps(steps: LessonStepBase[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  steps.forEach((step, index) => {
    if (!step.title.trim()) {
      issues.push({ path: `steps[${index}].title`, message: "标题为空" });
    }
    if (!step.body.trim()) {
      issues.push({ path: `steps[${index}].body`, message: "正文为空" });
    }
    if (!step.scene?.type) {
      issues.push({ path: `steps[${index}].scene`, message: "缺少 scene 类型" });
    }
  });
  return issues;
}
