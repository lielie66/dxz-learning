# CLAUDE.md

本仓库的统一入口是 [`AGENTS.md`](./AGENTS.md)。

开始任何工作前，请先读：

1. [`AGENTS.md`](./AGENTS.md) — 命令、目录、硬性约束、多 session 并行规则
2. [`SPEC.md`](./SPEC.md) — 内容模型与规范
3. [`HANDOFF.md`](./HANDOFF.md) — 当前进度、已知问题、下一步
4. [`handoff/ARCHITECTURE.md`](./handoff/ARCHITECTURE.md) — 包边界与 Phase 2
5. [`handoff/CONTENT.md`](./handoff/CONTENT.md) — 教材、讲解、题库、隐私
6. [`handoff/DEPLOY.md`](./handoff/DEPLOY.md) — 发布流程
7. [`handoff/DECISIONS.md`](./handoff/DECISIONS.md) — 已定决策

当前是 monorepo：

- `apps/geo`：地理应用
- `packages/core`：通用类型 / 存储 / 错题本
- `packages/content`：schema 与校验
- `docs/`：落地页 + 各学科构建产物

外壳（AppShell / 页签 / 练习卡）尚未抽到 core，历史/生物先做内容与 scene。
