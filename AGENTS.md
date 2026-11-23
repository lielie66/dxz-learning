# AGENTS.md · 开发入口

本文件是所有编码代理（OpenCode / Claude Code / Codex / 其他）进入本仓库的第一站。
**先读完本文件，再按顺序读：**

1. [`SPEC.md`](./SPEC.md) — 项目定位、内容模型、题目与设计规范
2. [`HANDOFF.md`](./HANDOFF.md) — 当前进度、已知问题、下一步
3. [`handoff/ARCHITECTURE.md`](./handoff/ARCHITECTURE.md) — 仓库结构、包边界、后续拆分
4. [`handoff/CONTENT.md`](./handoff/CONTENT.md) — 教材、讲解、题库、隐私规则
5. [`handoff/DEPLOY.md`](./handoff/DEPLOY.md) — GitHub / Gitee / EdgeOne / 离线包发布流程
6. [`handoff/DECISIONS.md`](./handoff/DECISIONS.md) — 已定决策，不要重复讨论
7. [`handoff/NEW_SUBJECT.md`](./handoff/NEW_SUBJECT.md) — 开历史 / 生物前必读

---

## 1. 这个仓库是什么

《带孝子爱学习》——面向七年级上学期的**纯前端、离线优先**复习工具。
目前地理已上线，历史 / 生物待开发。

- 无后端、无账号、无埋点
- 每个学科构建成**单个 HTML 文件**，双击可用
- 在线版：<https://dxz.flowzen.cn/>（落地页）
  - 地理：<https://dxz.flowzen.cn/geo/>
- 离线包：GitHub Release `v0.1.0` / Gitee `release/geo-lab-offline.zip`

## 2. 仓库结构（monorepo · Phase 1 已完成）

```text
dxz-learning/
├── apps/
│   └── geo/                 地理应用（Vite + React + Three.js）
│       ├── index.html
│       ├── src/
│       ├── vite.config.ts
│       └── package.json     @dxz/geo
├── packages/
│   ├── core/                @dxz/core：通用类型、存储、错题本
│   └── content/             @dxz/content：内容 schema 与校验
├── site/                    学科落地页源
├── docs/                    发布产物
│   ├── index.html           落地页（构建生成）
│   └── geo/index.html       地理单文件（构建生成）
├── scripts/
│   ├── copy-docs.mjs        复制 apps/<subject>/dist → docs/<subject>/
│   ├── build-site.mjs       复制 site/index.html → docs/index.html
│   └── make-release.ps1     生成离线 zip
├── handoff/                 交接与运维文档
├── AGENTS.md / CLAUDE.md
├── SPEC.md / HANDOFF.md
└── package.json             npm workspaces 根
```

**已抽取到 `@dxz/core` 的部分：**

- `WrongItem` / `WrongInput` / `WrongStats` 类型
- `createWrongBook()`：错题本引擎，按学科传入 `storageKey`，支持旧键迁移
- `readJSON` / `writeJSON` / `readMigratedJSON`
- 外壳 UI：`AppShell`、`Tabs`、`LessonChips` / `LessonHead` / `StepCard` / `StepNav`
- 练习 UI：`StartScreen`、`QuizHeader`、`Feedback`、`ChoiceQuestion`
- 错题本 UI：`WrongBookPanel`
- 练习会话：`useQuizSession`（题目历史、选择、下一题、错题重练流程）
- 错题本状态：`useWrongBook`（按学科 storageKey，自动迁移旧键）
- 随机工具：`shuffle` / `shuffleWithAnswer` / `createShuffleBag` / `createRecentTracker`
- 基础 CSS：`packages/core/src/ui.css`；地理场景样式在 `apps/geo/src/geo.css`

**尚未抽取（Phase 3 可选）：**

- 通用题目类型扩展（地理的 visual / geo4Visual 仍在 `apps/geo`）
- 各学科的 scene registry 类型
- 更细的 CSS 变量 / 主题系统

历史/生物现在可以复用 core 的外壳、练习会话、错题本和随机工具；只写自己的 manifest / lessons / quiz / scenes。

## 3. 常用命令

在仓库根目录执行（Windows PowerShell）：

```powershell
npm ci                  # 首次安装（workspaces）
npm run dev:geo         # 地理开发服务器
npm run build:geo       # 地理构建 → docs/geo/index.html
npm run build:site      # 落地页 → docs/index.html
npm run build           # build:geo + build:site
npm run preview:geo     # 预览地理 dist
npm run lint            # oxlint（全仓库）

# 重新生成离线包（需要 docs/geo/index.html 已更新）
npm run release:geo
```

环境：Node **20.19+**（当前验证 20.19.4），npm 10.x。
`npm run validate` 在 SPEC 里提到过，但**尚未实现**，不要假设它存在。

## 4. 目录与职责

| 路径 | 职责 |
|---|---|
| `apps/geo/src/App.tsx` | 地理应用：状态、场景切换、页面组合（外壳用 core） |
| `apps/geo/src/lessons.ts` | 地理 20 课 |
| `apps/geo/src/lib/quiz.ts` | 地理 24 类题 |
| `apps/geo/src/lib/wrongbook.ts` | 薄包装：调用 `@dxz/core`，键 `dxz:geo:wrongbook:v1` |
| `apps/geo/src/globe/*` | 地理场景组件 |
| `packages/core/src/ui/*` | 通用外壳 / 页签 / 讲解卡 / 练习卡 / 错题本 UI |
| `packages/core/src/ui.css` | 通用样式 |
| `packages/core/src/{useQuizSession,useWrongBook,random}.ts` | 练习会话、错题本状态、洗牌/去重 |
| `packages/core/src/{types,storage,wrongbook}.ts` | 类型、存储、错题本引擎 |
| `apps/geo/src/geo.css` | 地理场景样式 |
| `packages/content/src/*` | 学科 manifest / lesson / question schema、校验 |
| `site/index.html` | 学科落地页 |
| `docs/index.html` | 构建产物：落地页 |
| `docs/geo/index.html` | 构建产物：地理单文件 |
| `docs/` 其他 | GitHub Pages / EdgeOne 发布目录 |

## 5. 硬性约束

1. **教材顺序不能乱**。课程按教材章节顺序编号；新增内容先确认教材版本与目录。
2. **公开仓库不出现地区个人信息**：不写“西安城六区”、孩子姓名/学校、试卷扫描图。
3. **不提交** `node_modules/`、`apps/*/dist/`、`content-private/`、任何密码 / token / 私钥。
4. **不重写 git 历史、不强推 `main`**，除非用户明确要求。
5. 题目答案必须核对；未核对的标 `verified: false`，不进正式练习。
6. 视觉上文字与背景要有足够对比度；图示里的浅色文字不要贴浅背景。
7. `docs/` 下是**生成文件**，改源码后重新构建，不要直接编辑。

## 6. 多 Session / 多电脑并行规则

- **一个学科只设一个 owner**。开始新学科前，先在 `HANDOFF.md` 的“学科认领”表里登记。
- 地理改 `apps/geo`；历史改 `apps/history`；生物改 `apps/biology`；**互不越界**。
- 共享代码（`packages/core`、`packages/content`、根脚本、设计变量）改动前，先在 `handoff/DECISIONS.md` 记一条。
- 分支命名：
  - `feat/history-...`
  - `feat/biology-...`
  - `refactor/core-...`
  - `fix/geo-...`
- 提交前缀：
  - `feat(geo):` / `feat(history):` / `feat(biology):`
  - `fix(core):` / `fix(geo):`
  - `content(history):`
  - `docs:` / `chore:`
- 不要复制 `packages/core` 到新学科；新学科只加自己的内容和 scene 组件。
- 每台电脑 clone 后先跑 `npm ci && npm run build`，确认基线可构建再改。

## 7. 完成定义（Definition of Done）

- [ ] `npm run build` 通过（地理 + 落地页）
- [ ] `npm run lint` 没有新增 warning
- [ ] 本地 `npx vite preview --outDir docs` 手动走一遍 `/` 和 `/geo/`
- [ ] 移动端 360px 宽不横向溢出
- [ ] 没有把个人信息、试卷、密钥写进仓库
- [ ] 更新 `HANDOFF.md` 的进度与下一步
- [ ] 如涉及上线：按 `handoff/DEPLOY.md` 重新部署并验证线上

## 8. 遇到不确定时

- 教材版本、章节范围、考试权重：**问用户**，不要猜。
- 历史事实、生物概念：至少两个来源核对。
- 设计取舍：先看 `handoff/DECISIONS.md`，没有再问。
- 线上异常（Chrome 红页、证书、DNS）：先看 `HANDOFF.md` 的“已知问题”，不要急着重装或改代码。
