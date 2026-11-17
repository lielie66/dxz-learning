# HANDOFF · 进度交接

> 更新时间：2026-11-17
> 交接基线：`8ab5cdf`（之后以 `git log --oneline -5` 为准）
> 读者：下一个接手的 agent / 另一个 session / 另一台电脑

---

## 0. 一页结论

- 地理单科已经可用：20 课、24 类题、3D 地球、中国地图、等高线实验室、错题本。
- 线上地址 <https://dxz.flowzen.cn/> 正常，证书有效到 2027-02-07。
- 仓库仍是**单应用**，`SPEC.md` 里的 monorepo 尚未拆分。
- 下一步优先级：**先拆 monorepo / 冻结边界**，再开历史和生物；否则多个 session 会改同一份 `src/`。
- 已知外部问题：另一台电脑的 Chrome 对 `dxz.flowzen.cn` 报了红色 Safe Browsing 误报，已提交申诉，待 Google 复核。

---

## 1. 线上资产

| 渠道 | 地址 | 状态 |
|---|---|---|
| 主站（EdgeOne Pages） | <https://dxz.flowzen.cn/> | 正常，HTTPS |
| GitHub 仓库 | <https://github.com/lielie66/dxz-learning> | `main` |
| GitHub Pages | <https://lielie66.github.io/dxz-learning/> | 正常（海外线路） |
| Gitee 镜像 | <https://gitee.com/acef09/dxz-learning> | 已同步到 `8ab5cdf` |
| Gitee 离线包 | <https://gitee.com/acef09/dxz-learning/raw/main/release/geo-lab-offline.zip> | 414,859 B，PK 有效 |
| GitHub Release | `v0.1.0` → `geo-lab-offline.zip` | 已更新为当前版本 |

EdgeOne 控制台信息：

- 项目名：`xenogeneic-red-rnv9axnn`
- ProjectId：`makers-dlyjvw6e9jvt`
- 加速区域：全球可用区（不含中国大陆）
- 自定义域名：`dxz.flowzen.cn`
- CNAME：`dxz.flowzen.cn.pages.dnsoe8.com`
- 证书：TrustAsia DV，`CN=dxz.flowzen.cn`，2026-11-09 → 2027-02-07
- 部署方式：**控制台手动上传**，没有接 Git 自动部署

账号与密码不写进仓库。EdgeOne / GitHub / Gitee / DNSPod 的登录信息由用户保管。

---

## 2. 当前功能

### 地理 · 中图版 2024 七年级上册

- 20 课，按教材顺序：
  - 第 1 章 宇宙环境：第 1–2 课
  - 第 2 章 地球和地图：第 3–11 课
  - 第 3 章 疆域人口：第 12–15 课
  - 第 4 章 自然环境：第 16–20 课
- 24 类题：经纬线、读坐标、半球、五带、方向、动手定位、找省份、简称、行政中心、疆域、人口、民族、三级阶梯、气候类型、气温降水、河流、分界线、地球与五带、地图三要素、等高线、行政区划之最、宇宙、太空探索等
- 3D 地球仪：拖动、缩放、点击读经纬度、球面/平面/对照
- 中国地图：省份、河流、三级阶梯、气候图
- 等高线实验室：立体地形 + 俯视等高线并排、拖动切面、5 个部位（山顶/山脊/山谷/陡坡缓坡/陡崖）
- 错题本：1/3/7/15 天复习、按知识点统计
- 单文件离线构建（约 1.47 MB）

### 页面结构

左侧场景 + 右侧「讲解 / 练习 / 错题本」。
桌面优先 1366×768，移动端最低 360px。

---

## 3. 最近完成（按时间倒序）

1. `2370a8c` 等高线实验室：新增 `src/globe/ContourLab.tsx`，第 11 课改为切面模型 + 5 场景；离线包与线上同步。
2. `4182f73` README 增加 `dxz.flowzen.cn` 永久地址。
3. `da716c4` README 增加 Gitee 镜像、英文 README、Star 入口。
4. 域名：EdgeOne 自定义域名 + TrustAsia 证书 + Force HTTPS。
5. 20 课重排、等高线 V 尖方向、比例尺对比度修复。

---

## 4. 待办（Backlog）

### P0 · 开新学科之前必须做

- [ ] **monorepo 拆分**：`apps/geo`、`apps/history`、`apps/biology`、`packages/core`、`packages/content`。
      方案与步骤见 `handoff/ARCHITECTURE.md`。
- [ ] 根目录落地页：`/` 选择学科，`/geo/`、`/history/`、`/biology/` 各自单文件。
- [ ] 根 `package.json` 改成 workspaces，保留 `npm run build:geo` 等脚本。
- [ ] 给每个学科独立的 localStorage 命名空间：`dxz:<subject>:wrongbook:v1`（SPEC 已定，代码目前仍是 `geo-lab:wrongbook:v1`，拆分时迁移）。

### P1 · 历史

- [ ] 确认教材版本（统编版？2024 版？）与学校进度。
- [ ] 章节清单、考点权重、时间轴 scene。
- [ ] 先做权重最高的 2 个单元，跑通「讲解 + 练习 + 错题」。
- [ ] 历史事实至少两个来源核对；敏感表述保守。

### P1 · 生物

- [ ] 确认教材版本（人教版？北师大版？）与学校进度。
- [ ] 细胞、显微镜、生态系统等 scene。
- [ ] 先做核心章节，再补全。

### P2 · 共同能力

- [ ] `npm run validate`：答案在选项内、选项不重复、解析非空、scene 参数合法。
- [ ] 错题本导出 / 导入 JSON（换设备备份）。
- [ ] 期末复习模式：章节复习 / 错题重做 / 真题模拟。
- [ ] 试卷导入流程（`content-private/`，见 SPEC §9）。
- [ ] 自动化测试：至少对 `quiz.ts` 的生成器做快照/不变量测试。
- [ ] 性能：单文件 1.47 MB，历史/生物接入后考虑按学科拆包（单文件仍是目标）。

---

## 5. 已知问题

| 问题 | 影响 | 处理 |
|---|---|---|
| Chrome 红色 Safe Browsing 误报 | 另一台电脑打开主站会先看到“欺骗性网站”红页 | 已提交误报申诉；站点侧 DNS / 证书 / 腾讯网址安全均正常。见 §6 |
| 仓库未拆 monorepo | 多 session 并行会改同一份 `src/` | P0，先拆分或冻结边界 |
| `npm run validate` 不存在 | SPEC 里提到但没实现 | 拆分时补 |
| 无自动化测试 | 改 `quiz.ts` 风险高 | P2 |
| `ValleyContour.tsx` / `Terrain3D.tsx` 已不被课程引用 | 死代码，仍打进包 | 拆分时确认后删除；删除前先全局搜索 |
| Gitee HTTPS 推送需要 token | 账号开了 2FA，密码不能用于 git | 用 SSH key，或创建私人令牌；不要提交 token |
| EdgeOne 根目录放 `.zip` 实测 404 | 不能把离线包当站点静态文件 | 离线包继续放 GitHub Release / Gitee raw |
| `make-release.ps1` 对 LF 敏感 | Windows PowerShell 5.1 下 here-string 可能报错 | 文件已转为 CRLF + UTF-8 BOM；改脚本时保留 |
| README 的 Gitee 离线包链接依赖镜像同步 | 忘了推 Gitee 会拿到旧包 | 每次发布后推 Gitee 并验证 zip 大小 |

---

## 6. Chrome 红页（Safe Browsing）记录

- 现象：另一台电脑 Chrome 打开 `https://dxz.flowzen.cn/` 出现红色“欺骗性网站”警告。
- 已排查：
  - DNS：Google / Cloudflare / Quad9 / OpenDNS 均正常解析到 `43.174.246.113` / `43.174.247.113`
  - 腾讯网址安全中心：安全网站，暂未发现风险
  - 证书：`CN=dxz.flowzen.cn`，TrustAsia → DigiCert Global Root G2，两个节点一致
  - HTTP：302 → HTTPS
  - 页面：纯静态，无外链、无表单、无下载
- 已做：在 Google 误报页提交申诉（英文说明：static educational site, new subdomain, false positive）。
- 待做：
  - 用能访问 Google 的网络查看 Transparency Report：
    - `https://transparencyreport.google.com/safe-browsing/search?url=dxz.flowzen.cn`
    - `https://transparencyreport.google.com/safe-browsing/search?url=flowzen.cn`
  - 如果根域名被标，找根因（该域名下还有 `admin`、`order`、`stock`、`n8n` 等子域名）。
  - 可走 Google Search Console 站长申诉（需要 DNS TXT 验证）。
- 临时使用：红页 →「详细信息」→「访问这个不安全的网站」。

---

## 7. 学科认领表

开始新学科前先在这里登记，避免两个 session 抢同一科。

| 学科 | 负责人 / Session | 状态 | 分支 |
|---|---|---|---|
| 地理 | 当前 session | 维护中 | `main` |
| 历史 | 待认领 | 未开始 | `feat/history-*` |
| 生物 | 待认领 | 未开始 | `feat/biology-*` |
| 核心 / 拆分 | 待认领 | 未开始 | `refactor/core-*` |

---

## 8. 下一个 agent 的第一条命令

```powershell
git clone https://github.com/lielie66/dxz-learning.git
cd dxz-learning
npm ci
npm run build
npm run preview
```

然后：

1. 读 `AGENTS.md` → `SPEC.md` → 本文件 → `handoff/ARCHITECTURE.md`。
2. 确认自己要接的学科在 §7 已认领。
3. 如果要做新学科：先确认 monorepo 是否已拆；没拆就先做拆分，或只在自己的分支上做内容准备。
4. 改完更新本文件的 §3 / §4 / §7。

---

## 9. 不要做的事

- 不要直接编辑 `docs/index.html`（构建会覆盖）。
- 不要为了快，把历史/生物代码复制进 `src/` 和地理混在一起。
- 不要把 `content-private/`、试卷、孩子信息推到公开仓库。
- 不要强推 `main`、不要改写历史。
- 不要在没有确认教材版本的情况下批量写课。
- 不要在仓库里写 EdgeOne / GitHub / Gitee 的密码或 token。
- 不要因为 Chrome 红页就关闭安全浏览或改 DNS；先按 §6 排查。
