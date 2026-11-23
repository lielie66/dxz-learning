# HANDOFF · 进度交接

> 更新时间：2026-11-23
> 交接基线：以 `git log --oneline -1` 为准
> 读者：下一个接手的 agent / 另一个 session / 另一台电脑

---

## 0. 一页结论

- **monorepo Phase 1 已完成**：地理迁入 `apps/geo`，根目录是 npm workspaces。
- **Phase 2a 已完成**：`@dxz/core` 抽出外壳 UI（`AppShell` / `Tabs` / 讲解卡 / 练习卡 / 错题本卡）、类型、存储、错题本引擎；`@dxz/content` 建好 schema + 校验。
- 地理仍可构建、可运行；构建产物在 `docs/geo/index.html`。
- 根路径 `docs/index.html` 是**学科落地页**，地理入口 `/geo/`。
- **Phase 2b 未完成**：通用练习会话状态机 / 洗牌袋还没抽。历史/生物可以复用 UI 组件，但完整 app 还要等 2b。
- 线上 `https://dxz.flowzen.cn/` 已更新为“落地页 + `/geo/`”结构（2026-11-23 部署）。

---

## 1. 线上资产

| 渠道 | 地址 | 状态 |
|---|---|---|
| 主站（EdgeOne Pages） | <https://dxz.flowzen.cn/> | 新版：落地页 + `/geo/` |
| GitHub 仓库 | <https://github.com/lielie66/dxz-learning> | `main` |
| GitHub Pages | <https://lielie66.github.io/dxz-learning/> | 推送后自动构建 |
| Gitee 镜像 | <https://gitee.com/acef09/dxz-learning> | 已与 GitHub 同一提交 |
| Gitee 离线包 | <https://gitee.com/acef09/dxz-learning/raw/main/release/geo-lab-offline.zip> | 415,042 B |
| GitHub Release | `v0.1.0` → `geo-lab-offline.zip` | 当前版本 |

EdgeOne：

- 项目 `xenogeneic-red-rnv9axnn`，ProjectId `makers-dlyjvw6e9jvt`
- 域名 `dxz.flowzen.cn`，CNAME `dxz.flowzen.cn.pages.dnsoe8.com`
- 证书 TrustAsia DV，2026-11-09 → 2027-02-07
- 部署方式：控制台手动上传（未接 Git 自动部署）

账号密码不写进仓库，由用户保管。

---

## 2. 仓库结构

```text
dxz-learning/
├── apps/geo/                 @dxz/geo
├── packages/core/            @dxz/core（类型 / 存储 / 错题本）
├── packages/content/         @dxz/content（schema / 校验）
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

命令：

```powershell
npm ci
npm run dev:geo
npm run build          # build:geo + build:site
npm run preview:geo
npm run lint
npm run release:geo
```

---

## 3. 最近完成

1. **monorepo Phase 1**：`apps/geo` + 根 workspaces + `docs/geo/` 输出。
2. `packages/core`：`createWrongBook()`、`readMigratedJSON()`，地理错题本键迁到 `dxz:geo:wrongbook:v1`（自动读旧键 `geo-lab:wrongbook:v1`）。
3. `packages/content`：`SubjectManifest` / `LessonStepBase` / `QuestionBase` + 基础校验。
4. 落地页 `site/index.html`：地理已上线，历史/生物“开发中”，含离线包入口。
5. 构建验证：`npm run build` 通过，地理 1.47 MB；`/geo/` 页面、等高线实验室、错题本迁移均验证。
6. EdgeOne 已部署 `docs/` ZIP：`https://dxz.flowzen.cn/` 为落地页，`/geo/` 为地理。
7. **Phase 2a**：抽出 `AppShell` / `Tabs` / `LessonChips` / `LessonHead` / `StepCard` / `StepNav` / `StartScreen` / `QuizHeader` / `Feedback` / `ChoiceQuestion` / `WrongBookPanel` 到 `@dxz/core`，地理改为组合这些组件；外壳 CSS 移到 `packages/core/src/ui.css`。

---

## 4. 待办

### P0 · Phase 2b（会话层 / 练习引擎）

- [x] `AppShell` / 顶栏 / 左右布局
- [x] 页签（讲解 / 练习 / 错题本）
- [x] `StepCard` / `ChoiceQuestion` / `WrongBookPanel`
- [x] 外壳 CSS 移到 `packages/core/src/ui.css`
- [ ] 通用练习会话状态机（tabs、练习历史、错题复习流程）
- [ ] 通用洗牌袋 / 最近签名去重
- [ ] CSS 拆成 core base + 各学科样式
- [ ] 地理改为“只提供 lessons / quiz / scenes / manifest”

### P1 · 历史

- [ ] 确认教材版本（统编版年份/印次）、学校进度、考试范围
- [ ] `apps/history` 脚手架（Phase 2 后）
- [ ] 先做权重最高的 2 个单元
- [ ] 时间轴 / 疆域路线 / 材料题 scene

### P1 · 生物

- [ ] 确认教材版本（人教版/北师大版/苏教版）
- [ ] `apps/biology` 脚手架
- [ ] 细胞 / 显微镜 / 生态系统 scene

### P2 · 共同能力

- [ ] `npm run validate`（复用 `@dxz/content` 的校验）
- [ ] 错题本导出 / 导入 JSON
- [ ] 期末复习模式（章节 / 错题 / 真题模拟）
- [ ] 自动化测试
- [ ] 清理未引用的 `ValleyContour.tsx` / `Terrain3D.tsx`

---

## 5. 已知问题

| 问题 | 影响 | 处理 |
|---|---|---|
| Chrome Safe Browsing 红页 | 另一台电脑打开主站会先看到红页 | 已提交误报申诉；见 §6 |
| `npm run validate` 不存在 | SPEC 提到但未实现 | P2，用 `@dxz/content` 补 |
| 无自动化测试 | 改 quiz/错题本风险高 | P2 |
| `ValleyContour` / `Terrain3D` 已不被课程引用 | 死代码，仍进打包 | 确认后删除 |
| Phase 2b 未做 | 历史/生物还没有通用会话层 | 先做内容；2b 抽 session hook |
| `ui.css` 仍含地理场景样式 | 历史/生物会带入未用 CSS | 后续拆 core base + 学科样式 |
| EdgeOne 根目录 `.zip` 404 | 离线包不能当站点静态文件 | 继续放 Release / Gitee raw |

---

## 6. Chrome 红页记录

- 现象：另一台电脑 Chrome 打开 `https://dxz.flowzen.cn/` 出现红色“欺骗性网站”。
- 已排查：DNS（Google/Cloudflare/Quad9/OpenDNS）、腾讯网址安全、证书（TrustAsia → DigiCert G2）、HTTP→HTTPS、页面无外链/表单/下载，均正常。
- 已提交 Google 误报申诉（static educational site, new subdomain, false positive）。
- 待办：用能访问 Google 的网络看 Transparency Report（`dxz.flowzen.cn` 和 `flowzen.cn`）。
- 临时使用：红页 →「详细信息」→「访问这个不安全的网站」。

---

## 7. 学科认领表

| 学科 | 负责人 / Session | 状态 | 分支 |
|---|---|---|---|
| 地理 | 当前 session | 维护中 | `main` |
| 历史 | 待认领 | 内容可先做，代码等 Phase 2 | `feat/history-*` |
| 生物 | 待认领 | 内容可先做，代码等 Phase 2 | `feat/biology-*` |
| 核心 / Phase 2 | 待认领 | 未开始 | `refactor/core-*` |

---

## 8. 下一个 agent 的第一条命令

```powershell
git clone https://github.com/lielie66/dxz-learning.git
cd dxz-learning
npm ci
npm run build
npx vite preview --outDir docs
```

然后：

1. 读 `AGENTS.md` → `SPEC.md` → 本文件 → `handoff/ARCHITECTURE.md`。
2. 确认学科在 §7 已认领。
3. 新学科先做内容 / scene；外壳等 Phase 2。
4. 改完更新本文件 §3 / §4 / §7。

---

## 9. 不要做的事

- 不要直接编辑 `docs/index.html` / `docs/geo/index.html`（构建会覆盖）。
- 不要把历史/生物代码塞进 `apps/geo`。
- 不要复制 `packages/core` 到新学科。
- 不要把 `content-private/`、试卷、孩子信息推到公开仓库。
- 不要强推 `main`、不要改写历史。
- 不要在没有确认教材版本的情况下批量写课。
- 不要在仓库里写密码或 token。
