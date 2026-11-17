# 架构与拆分方案

> 目标：同一仓库容纳地理 / 历史 / 生物，共用一套外壳、练习引擎、错题本和设计系统；
> 每个学科仍然产出**一个可双击的 HTML**。

---

## 1. 现状 vs 目标

### 现状（2026-11-17）

```text
dxz-learning/                ← 仓库根就是地理应用
├── src/
│   ├── App.tsx              外壳 + 页面布局 + 视图切换
│   ├── lessons.ts           地理 20 课
│   ├── lib/quiz.ts          地理 24 类题
│   ├── lib/wrongbook.ts     错题本
│   ├── globe/*              地理场景
│   └── styles.css
├── docs/index.html          构建产物
├── release/geo-lab-offline.zip
└── scripts/
```

问题：

- 历史 / 生物没有地方放；硬塞进 `src/` 会让单文件越来越大，且多个 agent 改同一批文件。
- `App.tsx` 同时承担“外壳”和“地理特有逻辑”，无法直接复用。
- 没有构建多个入口的能力。

### 目标

```text
dxz-learning/
├── apps/
│   ├── geo/                 地理（现有代码迁入）
│   │   ├── src/
│   │   │   ├── lessons.ts
│   │   │   ├── quiz/
│   │   │   ├── scenes/
│   │   │   └── manifest.ts
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   ├── history/
│   └── biology/
├── packages/
│   ├── core/                外壳、页签、讲解卡、练习卡、错题本、存储、设计变量
│   └── content/             schema、类型、校验脚本
├── site/                    落地页源（静态 HTML）
├── docs/                    GitHub Pages 产物：/、/geo/、/history/、/biology/
├── content-private/         试卷、孩子错题（gitignore）
├── scripts/
├── AGENTS.md
├── SPEC.md
├── HANDOFF.md
└── package.json             workspaces 根
```

---

## 2. 包边界

### `packages/core`

只放**与学科无关**的东西：

- `AppShell`：顶栏、左右布局、响应式
- `Tabs`：讲解 / 练习 / 错题本
- `StepCard`、`QuizCard`、`WrongBookView`、`StatsBar`
- `useWrongBook`、`storage`（localStorage 适配、命名空间、导入导出）
- `design tokens` / 基础 CSS
- `SceneRegistry` 类型：学科注册自己的 scene 组件
- `SubjectManifest` 类型

**不要**放：地理的经纬网、历史的时间轴、生物的细胞图。这些属于各学科。

### `packages/content`

- `LessonStep` / `Question` / `SubjectManifest` 类型
- `validateContent()`：答案在选项内、选项不重复、解析非空、scene 参数合法
- 教材版本、章节、考点的通用结构
- 不存放任何一科的具体内容

### `apps/<subject>`

- `manifest.ts`：学科名、教材版本、章节、考试日期、内容版本
- `lessons.ts`：该学科课程
- `quiz/`：该学科题目生成器
- `scenes/`：该学科可视化组件
- `styles.css`：只放该学科特有的样式

**禁止** `apps/history`  import `apps/geo`。

---

## 3. 构建与部署

### 每个学科一个单文件

每个 app 继续用 `vite-plugin-singlefile`，产物：

```text
apps/geo/dist/index.html       → docs/geo/index.html
apps/history/dist/index.html   → docs/history/index.html
apps/biology/dist/index.html   → docs/biology/index.html
site/index.html                → docs/index.html
```

`docs/` 仍是 GitHub Pages 的发布目录，也是 EdgeOne 上传的根。

### 根 `package.json`（示例）

```json
{
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev:geo": "npm run dev -w @dxz/geo",
    "build:geo": "npm run build -w @dxz/geo && node scripts/copy-docs.mjs geo",
    "build:history": "npm run build -w @dxz/history && node scripts/copy-docs.mjs history",
    "build:biology": "npm run build -w @dxz/biology && node scripts/copy-docs.mjs biology",
    "build:site": "node scripts/build-site.mjs",
    "build": "npm run build:geo && npm run build:history && npm run build:biology && npm run build:site",
    "lint": "oxlint",
    "validate": "node scripts/validate-content.mjs"
  }
}
```

`scripts/copy-docs.mjs` 改成接受学科参数，复制到 `docs/<subject>/index.html`。

### 路由

- `/` → 落地页（三个学科卡片 + 离线包链接）
- `/geo/` → 地理单文件
- `/history/` → 历史单文件
- `/biology/` → 生物单文件

每个单文件内部**不需要 router**；学科内导航仍由右侧课程按钮完成。

### EdgeOne 上传

EdgeOne Makers 的“直接上传”不接受多个单独文件，只接受单个 HTML / ZIP / 文件夹。
拆分后建议：

1. 本地 `npm run build`
2. 把 `docs/` 打成 `site-deploy.zip`（根含 `index.html`、`geo/`、`history/`、`biology/`）
3. 控制台上传 ZIP
4. 验证 `/`、`/geo/`、`/history/`、`/biology/`

注意：根目录放 `.zip` 当下载文件实测返回 404，离线包仍走 GitHub Release / Gitee raw。

---

## 4. 拆分步骤（建议按顺序做）

### Phase 0 · 冻结与基线

- [ ] `git checkout -b refactor/monorepo`
- [ ] 打 tag：`geo-v0.9-pre-monorepo`
- [ ] 记录当前线上产物 hash / 文件大小，拆分后逐项对比
- [ ] 确认 `npm run build`、`npm run preview` 基线通过

### Phase 1 · 目录搬迁（先不改逻辑）

- [ ] 根 `package.json` 改为 workspaces 根
- [ ] 新建 `apps/geo/`，把 `index.html`、`src/`、`vite.config.ts`、`tsconfig*`、`package.json` 迁入
- [ ] 根保留 `scripts/`、`docs/`、`release/`、`assets/`、`SPEC.md` 等
- [ ] 修正 `scripts/copy-docs.mjs`、`make-release.ps1` 的路径
- [ ] `npm install` 重新生成 lockfile
- [ ] `npm run build:geo` 产出 `docs/geo/index.html`
- [ ] 临时保留 `docs/index.html` 为地理，确保线上不中断
- [ ] 全量回归：20 课、24 类题、错题本、离线包

> 这一阶段的目标是“行为完全不变”，只改路径。不要顺手重构。

### Phase 2 · 抽 core

按依赖从少到多抽：

1. `storage` + `useWrongBook`（最独立）
2. `AppShell` / `Tabs` / `StepCard` / `QuizCard` / `WrongBookView`
3. `styles.css` 拆成 `core/base.css` + `apps/geo/geo.css`
4. `SceneRegistry` 类型

每抽一块，地理必须仍能构建、页面不变。

### Phase 3 · 落地页 + 多入口构建

- [ ] `site/index.html`：三个学科卡片，显示“已上线 / 开发中”
- [ ] `scripts/build-site.mjs` 复制到 `docs/index.html`
- [ ] `docs/geo/index.html` 可访问
- [ ] 根路径 `/` 不再直接是地理

### Phase 4 · 历史 / 生物

按 `handoff/NEW_SUBJECT.md` 执行。
新学科只新增 `apps/<subject>`，不改 `apps/geo`。

---

## 5. 数据与兼容

### localStorage 命名空间

现状：`geo-lab:wrongbook:v1`

目标：`dxz:<subject>:wrongbook:v1`

迁移策略：

- 读取时先读新键；没有则读旧键 `geo-lab:wrongbook:v1`，迁移到 `dxz:geo:wrongbook:v1`
- 迁移后保留旧键一个版本，避免回滚丢数据
- 历史 / 生物从一开始就用新键

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
- 缺点：外壳、错题本、设计系统要复制三份；用户要记三个地址；与“同一个仓库”的目标冲突
- 结论：不采用

---

## 7. 风险与对策

| 风险 | 对策 |
|---|---|
| 搬迁后路径/构建坏了 | Phase 1 只改路径，不改逻辑；逐项对比产物 |
| core 抽得太早，接口不稳定 | 先复制后抽象：Phase 1 完成、行为稳定后再抽 |
| 单文件体积继续涨 | 每科独立单文件；core 只放必要代码；定期看 gzip 大小 |
| 多 agent 改 core 冲突 | core 改动先在 `handoff/DECISIONS.md` 登记；一个时间只允许一个 core owner |
| EdgeOne 上传目录结构不对 | 本地 `docs/` 结构与线上一致；上传前用 `python -m http.server` 验证 `/geo/` 等路径 |
| GitHub Pages 的 `/geo/` 404 | 确认 `docs/geo/index.html` 已提交，Pages source 仍是 `/docs` |
