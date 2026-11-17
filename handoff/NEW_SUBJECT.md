# 开新学科 Checklist

> 用于历史 / 生物。**不要跳过前置条件**，否则会和地理的 session 撞车。

---

## 0. 前置条件

- [ ] monorepo 已拆分（`apps/geo` + `packages/core`），或用户明确同意“先在独立分支做内容准备，不合并”
- [ ] 教材版本、版次、学校进度、考试范围已确认（见 `handoff/CONTENT.md` §1）
- [ ] 在 `HANDOFF.md` §7 学科认领表登记：学科 / session / 分支
- [ ] 已读 `AGENTS.md`、`SPEC.md`、`HANDOFF.md`、`handoff/ARCHITECTURE.md`、`handoff/CONTENT.md`

---

## 1. 建 app（拆分后）

```powershell
# 以 geo 为模板，不要复制 core
cp -r apps/geo apps/history
# 或使用脚手架脚本（待补）
```

然后：

- [ ] 改 `apps/history/package.json` 的 `name` 为 `@dxz/history`
- [ ] 改 `vite.config.ts` 的 `base` 仍为 `./`
- [ ] 改 `index.html` 的 title
- [ ] 删除 geo 的 `lessons.ts` / `quiz/` / `scenes/`，保留空目录
- [ ] 确认 `scripts/copy-docs.mjs history` 输出到 `docs/history/index.html`
- [ ] 在根 `package.json` 加 `dev:history` / `build:history`

---

## 2. 写 manifest

```ts
export const manifest: SubjectManifest = {
  id: "history",
  name: "历史",
  grade: "七年级",
  term: "上册",
  edition: "统编版（待确认年份）",
  region: "使用统编版的地区",
  examDate: "2027-01-XX",
  version: "0.1.0",
  chapters: [
    // 按教材目录逐章填
  ],
};
```

- [ ] 章节顺序与教材一致
- [ ] `examDate` 已和用户确认
- [ ] `version` 从 `0.1.0` 开始

---

## 3. 先做 1–2 个单元，不要全量开工

推荐顺序：

1. 权重最高 / 孩子最薄弱的 1 个单元
2. 跑通「讲解 → 练习 → 错题本 → 复习」
3. 再做第 2 个单元
4. 确认节奏后再批量

每单元至少：

- [ ] 3–6 个 `LessonStep`
- [ ] 1 个可视化 scene（没有就先复用文字 + 图）
- [ ] 8–15 道题，覆盖本单元考点
- [ ] 1 个易错点总结

---

## 4. scene 组件

- [ ] 在 `apps/history/src/scenes/` 新建组件
- [ ] 在 `apps/history/src/sceneRegistry.ts` 注册
- [ ] props 用可序列化对象，便于以后做内容校验
- [ ] 移动端 360px 宽可用
- [ ] 文字对比度足够
- [ ] 首屏不依赖鼠标悬停（触屏也要能看）

历史建议先做：

- `timeline`：时间轴 + 事件卡
- `map`：疆域 / 路线 / 战役
- `sourceCard`：材料题

生物建议先做：

- `cell`：细胞结构
- `microscope`：显微镜
- `cycle`：光合 / 呼吸

---

## 5. 题目

- [ ] 在 `apps/history/src/quiz/` 写生成器
- [ ] 注册到 `quizRegistry`
- [ ] 每题有 `chapterId` / `pointId` / `difficulty` / `explain`
- [ ] 干扰项不重复、答案唯一
- [ ] 真题标 `source.verified`
- [ ] 私有题只进 `content-private/`

---

## 6. 错题本

- [ ] 使用 `dxz:history:wrongbook:v1` 命名空间
- [ ] 复用 `packages/core` 的 `useWrongBook`
- [ ] 不要复用 `geo-lab:wrongbook:v1`
- [ ] 验证：答错 → 进错题本 → 1/3/7/15 天排期

---

## 7. 构建与上线

- [ ] `npm run build:history` 产出 `docs/history/index.html`
- [ ] `docs/index.html` 落地页加上历史入口（状态从“开发中”改为“已上线”）
- [ ] 本地 `npx serve docs` 验证 `/history/`
- [ ] 按 `handoff/DEPLOY.md` 部署 EdgeOne
- [ ] GitHub / Gitee 推送
- [ ] 线上验证：`https://dxz.flowzen.cn/history/`

---

## 8. 完成定义

- [ ] 教材顺序正确
- [ ] 讲解能看懂（找一个没学过的人读一遍）
- [ ] 题目答案核对过
- [ ] 错题本可记录、可复习
- [ ] 移动端可用
- [ ] 无个人信息 / 试卷 / 密钥
- [ ] `HANDOFF.md` 更新：进度、已知问题、下一步
- [ ] `README.md` 功能列表更新

---

## 9. 不要做

- 不要把地理的 `lessons.ts` / `quiz.ts` 复制过来改（内容完全不同）
- 不要复制 `packages/core` 到新 app
- 不要在 `apps/history` 里 import `apps/geo`
- 不要改 `apps/geo` 的文件来“顺手适配”历史
- 不要在没确认教材版本前批量写课
- 不要把学校试卷 / 孩子信息提交到公开仓库

---

## 10. 给新 Session 的开场提示（可直接复制）

```text
你在 dxz-learning 仓库工作。请先按顺序读：
AGENTS.md、SPEC.md、HANDOFF.md、handoff/ARCHITECTURE.md、
handoff/CONTENT.md、handoff/DEPLOY.md、handoff/DECISIONS.md。

当前仓库仍是地理单应用，monorepo 尚未拆分。
我要做的是【历史 / 生物】学科。

请先做三件事，不要直接写代码：
1. 复述当前仓库状态和你要改的边界；
2. 确认教材版本、章节、考试范围（不确定就问我）；
3. 给出本轮最小可交付计划（先做哪个单元、哪些 scene、哪些题）。

遵守 AGENTS.md 的并行开发规则：一个学科一个 owner，
不要改 apps/geo，不要复制 core，不要提交个人信息。
```
