# 架构与拆分方案

> 目标：同一仓库容纳地理 / 历史 / 生物，共用外壳、练习引擎、错题本和设计系统；
> 每个学科仍然产出**一个可双击的 HTML**。

---

## 1. 现状（2026-11-23）

**monorepo Phase 1 已完成：**

```text
dxz-learning/
├── apps/geo/                 @dxz/geo
│   ├── index.html
│   ├── src/
│   ├── vite.config.ts
│   └── package.json
├── packages/core/            @dxz/core
│   └── src/{types,storage,wrongbook,index}.ts
├── packages/content/         @dxz/content
│   └── src/{types,validate,index}.ts
├── site/index.html           落地页源
├── docs/
│   ├── index.html            落地页（生成）
│   └── geo/index.html        地理（生成）
├── scripts/
├── handoff/
├── AGENTS.md / CLAUDE.md
├── SPEC.md / HANDOFF.md
└── package.json             workspaces 根
```

已经抽到 core 的：

- `WrongItem` / `WrongInput` / `WrongStats`
- `createWrongBook()`（按学科传入 `storageKey`，支持旧键迁移）
- `readJSON` / `writeJSON` / `readMigratedJSON`
- 外壳 UI：`AppShell` / `Tabs` / `LessonChips` / `LessonHead` / `StepCard` / `StepNav`
- 练习 UI：`StartScreen` / `QuizHeader` / `Feedback` / `ChoiceQuestion`
- 错题本 UI：`WrongBookPanel`
- 基础 CSS：`packages/core/src/ui.css`（暂含地理场景样式）

**尚未抽取（Phase 2b）：**

- 通用练习会话状态机（tabs、练习历史、错题复习流程）
- 通用洗牌袋 / 最近签名去重
- CSS 拆成 core base + 各学科样式
- 地理 App 仍保留状态与场景切换逻辑

因此：历史和生物现在**可以复用 UI 组件**，但完整 app 的会话层还要等 2b；先写内容与 scene。

---

## 2. 包边界

### `packages/core`

只放**与学科无关**的东西：

- `AppShell`：顶栏、左右布局、响应式（Phase 2）
- `Tabs`：讲解 / 练习 / 错题本（Phase 2）
- `StepCard`、`QuizCard`、`WrongBookView`、`StatsBar`（Phase 2）
- `useWrongBook`、`createWrongBook`、`storage`（已完成）
- 通用洗牌袋 / 去重（Phase 2）
- `design tokens` / 基础 CSS（Phase 2）
- `SceneRegistry` 类型（Phase 2）
- `SubjectManifest` 类型（已放 `@dxz/content`）

**不要**放：地理的经纬网、历史的时间轴、生物的细胞图。

### `packages/content`

- `SubjectManifest` / `Chapter` / `LessonStepBase` / `QuestionBase` / `SceneSpec`（已完成）
- `validateQuestion()` / `validateLessonSteps()`（基础版已完成）
- 后续：教材版本、章节、考点的通用结构；不存放任何一科的具体内容

### `apps/<subject>`

- `manifest.ts`：学科名、教材版本、章节、考试日期、内容版本
- `lessons.ts`：该学科课程
- `quiz/`：该学科题目生成器
- `scenes/`：该学科可视化组件
- `styles.css`：只放该学科特有的样式

**禁止** `apps/history` import `apps/geo`。

---

## 3. 构建与部署

### 每个学科一个单文件

```text
apps/geo/dist/index.html       → docs/geo/index.html
apps/history/dist/index.html   → docs/history/index.html
apps/biology/dist/index.html   → docs/biology/index.html
site/index.html                → docs/index.html
```

`docs/` 是 GitHub Pages 的发布目录，也是 EdgeOne 上传的根。

### 根 `package.json`（当前）

```json
{
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev:geo": "npm run dev -w @dxz/geo",
    "build:geo": "npm run build -w @dxz/geo && node scripts/copy-docs.mjs geo",
    "build:site": "node scripts/build-site.mjs",
    "build": "npm run build:geo && npm run build:site",
    "preview:geo": "npm run preview -w @dxz/geo",
    "lint": "oxlint",
    "release:geo": "powershell -ExecutionPolicy Bypass -File scripts/make-release.ps1"
  }
}
```

新增学科时加：

```json
"dev:history": "npm run dev -w @dxz/history",
"build:history": "npm run build -w @dxz/history && node scripts/copy-docs.mjs history"
```

### 路由

- `/` → 落地页
- `/geo/` → 地理
- `/history/` → 历史
- `/biology/` → 生物

每个单文件内部不需要 router。

### EdgeOne 上传

控制台“直接上传”只接受单个 HTML / ZIP / 文件夹，不接受多个单独文件。
拆分后：

1. `npm run build`
2. 把 `docs/` 打成 ZIP（根含 `index.html`、`geo/`、`history/`、`biology/`）
3. 控制台上传 ZIP
4. 验证 `/`、`/geo/`

根目录放 `.zip` 当下载文件实测 404；离线包仍走 GitHub Release / Gitee raw。

---

## 4. Phase 2：抽 core 的步骤

### Step 1 · 抽 UI 外壳（Phase 2a 已完成）

- [x] `AppShell`：顶栏、左右布局、响应式
- [x] `Tabs`：讲解 / 练习 / 错题本
- [x] `StepCard`：标题、正文、bullets、tip、步骤计数
- [x] `ChoiceQuestion`：选项、反馈、蒙对加错题、下一题
- [x] `WrongBookPanel`：统计、列表、复习入口
- [~] 外壳 CSS 已移到 `packages/core/src/ui.css`，但还含地理场景样式，待拆成 core base + `apps/geo/geo.css`

### Step 2 · 抽练习会话层（Phase 2b，待做）

- [ ] 洗牌袋（shuffle bag）
- [ ] 最近 N 题签名去重
- [ ] 题目工厂注册表：学科传入 `makeQuestion(kind)`
- [ ] `useSubjectSession`：tabs / 练习历史 / 错题复习流程
- [ ] `QuestionBase` 扩展：地理的 visual / geo4Visual 放回 geo

### Step 3 · 地理改为纯配置（部分完成）

- [x] 外壳从 `@dxz/core` 引入（`AppShell` / `Tabs` / 讲解 / 练习 / 错题本）
- [ ] `apps/geo/src/App.tsx` 只保留地理的 lessons / quiz / scenes / 视图分支
- [ ] 行为与样式完全不变

### Step 4 · 历史 / 生物脚手架（待 2b）

按 `handoff/NEW_SUBJECT.md`：

- [ ] `apps/<subject>` 从 core 引入外壳
- [ ] 只写 manifest / lessons / quiz / scenes
- [ ] 构建到 `docs/<subject>/index.html`

---

## 5. 数据与兼容

### localStorage 命名空间

现状：

- 地理：`dxz:geo:wrongbook:v1`
- 旧键：`geo-lab:wrongbook:v1`（自动迁移，保留一版）

目标：

- 历史：`dxz:history:wrongbook:v1`
- 生物：`dxz:biology:wrongbook:v1`

迁移策略：`readMigratedJSON(newKey, legacyKey, fallback)`，先读新键，没有再读旧键并写入新键。

### 内容版本

`SubjectManifest.version` 用于错题数据迁移。
课程增删、题号变化时递增，并在 `HANDOFF.md` 记录。

---

## 6. 为什么不选另外两种结构

### 方案 B：一个应用 + 学科切换器

- 优点：一次构建、一个文件、共享最彻底
- 缺点：历史/生物代码都进同一个 1.5 MB 文件，首屏越来越慢；多个 agent 改同一份 `App.tsx`，冲突不断
- 结论：不适合多 session 并行

### 方案 C：每个学科一个独立仓库

- 优点：完全隔离
- 缺点：外壳、错题本、设计系统要复制三份；用户要记三个地址
- 结论：不采用

---

## 7. 风险与对策

| 风险 | 对策 |
|---|---|
| Phase 2 抽外壳改坏地理 | 先写快照/手动回归清单；每抽一块跑 `npm run build` + `/geo/` 全课 |
| core 接口不稳定 | 先在 geo 内部用，稳定后再让历史/生物接 |
| 单文件体积继续涨 | 每科独立单文件；core 只放必要代码；定期看 gzip |
| 多 agent 改 core 冲突 | core 改动先在 `handoff/DECISIONS.md` 登记；一个时间一个 core owner |
| EdgeOne 目录结构不对 | 本地 `npx vite preview --outDir docs` 验证 `/` 和 `/geo/` 后再上传 |
| GitHub Pages 的 `/geo/` 404 | 确认 `docs/geo/index.html` 已提交，Pages source 仍是 `/docs` |
