# AGENTS.md · 开发入口

本文件是所有编码代理（OpenCode / Claude Code / Codex / 其他）进入本仓库的第一站。
**先读完本文件，再按顺序读：**

1. [`SPEC.md`](./SPEC.md) — 项目定位、内容模型、题目与设计规范
2. [`HANDOFF.md`](./HANDOFF.md) — 当前进度、已知问题、下一步
3. [`handoff/ARCHITECTURE.md`](./handoff/ARCHITECTURE.md) — 目标仓库结构与迁移方案
4. [`handoff/CONTENT.md`](./handoff/CONTENT.md) — 教材、讲解、题库、隐私规则
5. [`handoff/DEPLOY.md`](./handoff/DEPLOY.md) — GitHub / Gitee / EdgeOne / 离线包发布流程
6. [`handoff/DECISIONS.md`](./handoff/DECISIONS.md) — 已定决策，不要重复讨论
7. [`handoff/NEW_SUBJECT.md`](./handoff/NEW_SUBJECT.md) — 开历史 / 生物前必读

---

## 1. 这个仓库是什么

《带孝子爱学习》——面向七年级上学期的**纯前端、离线优先**复习工具。
目前只有**地理**一科，对应中图版（中国地图出版社）2024 年版七年级上册。

- 无后端、无账号、无埋点
- 构建产物是**单个 HTML 文件**，双击可用
- 在线版：<https://dxz.flowzen.cn/>
- 离线包：GitHub Release `v0.1.0` / Gitee `release/geo-lab-offline.zip`

## 2. 当前仓库状态（重要）

**截至 2026-11-17，仓库根目录就是地理单应用，不是 monorepo。**

```text
dxz-learning/                ← 仓库根 = 地理应用
├── src/                     ← 地理的全部代码（27 个文件，约 8.3k 行）
├── docs/index.html          ← 构建产物，GitHub Pages / EdgeOne 部署源（需要提交）
├── release/                 ← 离线 zip
├── assets/                  ← README 截图
├── scripts/                 ← 离线包、copy-docs 脚本
├── SPEC.md
└── ...
```

`SPEC.md` 里的 `apps/geo`、`packages/core` 是**目标结构，尚未落地**。
在拆分完成前，**不要假设 `apps/` 或 `packages/` 已经存在**。

## 3. 常用命令

在仓库根目录执行（Windows PowerShell）：

```powershell
npm ci                 # 首次安装
npm run dev            # 本地开发
npm run build          # tsc + vite 构建，并自动复制到 docs/index.html
npm run preview        # 预览 dist
npm run lint           # oxlint

# 重新生成离线包（需要 docs/index.html 已更新）
powershell -ExecutionPolicy Bypass -File scripts/make-release.ps1
```

环境：Node **20.19+**（当前验证 20.19.4），npm 10.x。
`npm run validate` 在 SPEC 里提到过，但**尚未实现**，不要假设它存在。

## 4. 目录与职责

| 路径 | 职责 |
|---|---|
| `src/App.tsx` | 单应用外壳：顶栏、左场景 / 右讲解·练习·错题本、视图切换 |
| `src/lessons.ts` | 20 课的顺序、文案、场景参数 |
| `src/lib/quiz.ts` | 24 类题目生成器、去重、答案 |
| `src/lib/wrongbook.ts` | localStorage 错题本、1/3/7/15 天复习 |
| `src/globe/*` | 各场景组件（3D 地球、中国地图、等高线实验室等） |
| `src/styles.css` | 全部样式与 CSS 变量 |
| `scripts/copy-docs.mjs` | 把 `dist/index.html` 复制到 `docs/index.html` |
| `scripts/make-release.ps1` | 生成 `release/geo-lab-offline.zip` |
| `docs/index.html` | **构建产物，需要提交**；不要手改 |
| `dist/` | 本地构建目录，已 gitignore |

## 5. 硬性约束

1. **教材顺序不能乱**。课程按教材章节顺序编号；新增内容先确认教材版本与目录。
2. **公开仓库不出现地区个人信息**：不写“西安城六区”、孩子姓名/学校、试卷扫描图。
3. **不提交** `node_modules/`、`dist/`、`content-private/`、任何密码 / token / 私钥。
4. **不重写 git 历史、不强推 `main`**，除非用户明确要求。
5. 题目答案必须核对；未核对的标 `verified: false`，不进正式练习。
6. 视觉上文字与背景要有足够对比度；图示里的浅色文字不要贴浅背景。
7. 构建产物 `docs/index.html` 是**生成文件**，改源码后重新 `npm run build`，不要直接编辑。

## 6. 多 Session / 多电脑并行规则

这是本仓库最重要的协作约束。

- **一个学科只设一个 owner**。开始新学科前，先在 `HANDOFF.md` 的“学科认领”表里登记。
- **拆分完成前，同一时间只允许一个 session 改 `src/`**。其他 session 先做只读调研、内容准备或独立分支。
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
- **共享代码（壳、练习引擎、错题本、设计变量）改动前**，先在 `handoff/DECISIONS.md` 记一条，避免两个 agent 各改一套。
- 不要复制 `core` 到新学科；新学科只加自己的内容和 scene 组件。
- 每台电脑 clone 后先跑 `npm ci && npm run build`，确认基线可构建再改。

## 7. 完成定义（Definition of Done）

一个改动要同时满足：

- [ ] `npm run build` 通过
- [ ] `npm run lint` 没有新增 warning
- [ ] 本地 `npm run preview` 手动走一遍受影响的课 / 题
- [ ] 移动端 360px 宽不横向溢出
- [ ] 没有把个人信息、试卷、密钥写进仓库
- [ ] 更新 `HANDOFF.md` 的进度与下一步
- [ ] 如涉及上线：按 `handoff/DEPLOY.md` 重新部署并验证线上

## 8. 遇到不确定时

- 教材版本、章节范围、考试权重：**问用户**，不要猜。
- 历史事实、生物概念：至少两个来源核对。
- 设计取舍：先看 `handoff/DECISIONS.md`，没有再问。
- 线上异常（Chrome 红页、证书、DNS）：先看 `HANDOFF.md` 的“已知问题”，不要急着重装或改代码。
