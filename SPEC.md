# 《带孝子爱学习》项目规范

版本：v0.1 · 2026-11-08

## 1. 定位

把抽象的学科概念做成可视化 + 可练习的复习工具，服务七年级上学期期末复习。

- 学段：七年级上学期
- 地区：使用中图版的地区
- 用途：期末考试前的专项复习，不是替代课堂，也不是全面刷题
- 学科顺序：地理 → 历史 → 生物 → 主科
- 交付形态：网页（GitHub Pages）+ 可离线双击的单文件

## 2. 范围与取舍

- 以**近 2–3 年当地期末真题**和**学校复习资料**为考点依据，不以“教材全覆盖”为目标。
- 先跑通，再精修：每个学科先保证「讲解能看懂、题目能练、错题能复习」，再补细节。
- 按期末权重和孩子薄弱点排序，允许某些小节只做“了解”级别。

## 3. 仓库结构（目标）

单仓库、多入口。历史开工前落地：

```
dxz-learning/
├── apps/
│   ├── geo/                地理入口（现有代码迁入）
│   ├── history/            历史入口
│   └── biology/            生物入口
├── packages/
│   ├── core/               壳、练习引擎、错题本、存储、设计系统
│   └── content/            内容 schema 与校验脚本
├── content-private/        学校试卷、孩子错题（不进公开仓库）
├── docs/                   GitHub Pages 产物：/geo/ /history/ /biology/ + 落地页
└── SPEC.md
```

在拆分完成前，允许 `geo-lab` 维持单应用结构，但新代码要按 `core` / `subjects` 的边界放。

## 4. 内容模型

所有学科共用同一套 schema，学科只提供数据和 scene 组件。

```ts
type SubjectManifest = {
  id: "geo" | "history" | "biology";
  name: string;
  grade: "七年级";
  term: "上册";
  edition: string;        // 中图版 / 统编版 / 人教版
  region: string;         // 使用中图版的地区
  examDate: string;       // ISO 日期，用于倒计时和复习排期
  chapters: { id: string; title: string; sections: { id: string; title: string }[] }[];
  version: string;        // 内容版本，用于错题数据迁移
};

type LessonStep = {
  title: string;
  body: string;
  bullets?: string[];
  tip?: string;
  scene: SceneSpec;       // 这一步的地图/动画/图表
};

type SceneSpec = {
  type: string;           // globe | worldMap | chinaMap | timeline | cell | ...
  props: Record<string, unknown>;
};

type Question = {
  id: string;
  subject: string;
  kind: string;           // 题型，学科自定义
  chapterId: string;
  pointId: string;        // 考点 id
  stem: string;
  options?: string[];
  answer: number | string;
  explain: string;
  difficulty: 1 | 2 | 3;
  scene?: SceneSpec;
  source?: {
    type: "textbook" | "exam" | "school" | "original";
    name?: string;
    year?: number;
    verified: boolean;    // 答案是否核对过
  };
};
```

新的可视化 = 新增一个 scene 组件并注册，不改外壳。

## 5. 题目规范

- 一题只考一个点；题干不绕弯。
- 干扰项要“像真的错”，不能凑数；同一题选项互不重复。
- 解析三段：正确答案、为什么、易错点。
- 每题标注 `chapterId`、`pointId`、`difficulty`。
- 程序生成的题必须保证：答案唯一、答案在选项内、最近 N 题不重复（洗牌袋 + 最近签名）。
- 固定小题库用洗牌袋，一轮出完再重复。
- 真题导入必须标注来源和 `verified`；没核对答案的默认 `false`，不进正式练习。

## 6. 设计规范

- 基础字号 16px，行高 1.7，正文不超过 18px。
- 桌面优先 1366×768；移动端最低 360px 宽可用。
- 视觉分区固定：左侧场景，右侧「讲解 / 练习 / 错题本」。
- 颜色、间距、圆角统一走 `styles.css` 顶部的 CSS 变量，不在组件里写死色值。
- 共享组件：顶栏、页签、讲解卡片、练习卡片、错题卡片、统计条。

## 7. 工程规范

- TypeScript strict；提交前 `npm run build` 必须通过。
- 内容改动跑 `npm run validate`：答案在选项内、选项不重复、解析非空、scene 参数合法。
- 提交信息：`feat(geo): ...`、`fix(core): ...`、`content(history): ...`、`docs: ...`。
- `main` 保持可发布；大改走分支。
- 每次可交付节点打 tag（如 `geo-v0.2`）。
- 新增学科不复制 `core`，只新增 `apps/<subject>` 和 scene 组件。

## 8. 数据、隐私与版权

- 不采集任何用户数据，不埋点。
- 学习记录只存浏览器 localStorage，键名 `dxz:<subject>:wrongbook:v1`。
- 提供导出/导入 JSON，方便换设备和备份。
- **学校试卷、孩子姓名/学校、原始扫描图不进入公开仓库**，统一放 `content-private/` 并加入 `.gitignore`。
- 公开仓库只放自编题、变式题或已确认可公开的题目；教材原文不复制。
- 历史学科事实至少两个来源核对；敏感表述保守处理。

## 9. 试卷导入流程

用于把孩子学校的试卷、模拟题、错题转成题库。

1. **拍照**：整页拍全，光线均匀，不压边，包含题号、题干、全部选项；有答案页一起拍。
2. **存放**：`content-private/papers/<学科>/<日期>-<来源>/`，一页一张，文件名带页码。
3. **转录**：识别成结构化 JSON（题干、选项、答案、解析、考点、难度），低置信度的字词单独标出待确认。
4. **核对**：答案以答案页为准；没有答案页的，标注 `verified: false`，由人确认后再转正。
5. **去重**：与现有题库比对题干和考点，重复的只保留一条，记录出现次数。
6. **入库**：写入 `content-private/questions/<学科>.json`，构建时合并；公开仓库不包含该文件。
7. **反馈**：孩子做错的题打上 `origin: "child-wrong"`，在期末复习模式里提高权重。

## 10. 里程碑

| 时间 | 目标 |
|---|---|
| 11/9–11/15 | 抽 core 边界、定 schema、地理补第 1 章与第 4 章、期末复习模式跑通 |
| 11/16–11/22 | 历史框架 + 权重最高的 2 个单元 |
| 11/23–11/29 | 历史剩余单元 + 真题映射 |
| 11/30–12/6 | 生物框架 + 核心章节 |
| 12/7–12/13 | 生物剩余 + 三科联调 + 落地页 |
| 12/14–12/20 | 真题模拟、错题驱动复习、修 bug |
| 12/21 之后 | 内容冻结，只修错误 |

## 11. 期末复习模式

三个入口，共用错题本和考点数据：

- **章节复习**：按章节过讲解 + 对应练习。
- **错题重做**：按 1/3/7/15 天排期，只出错题和同考点变式。
- **真题模拟**：按期末题型组卷，限时，交卷后给考点报告。

排序权重 = 真题出现频率 × 孩子错误率 × 最近错误时间。
