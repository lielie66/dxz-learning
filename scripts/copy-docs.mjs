import { mkdirSync, copyFileSync } from "node:fs";

// 把某个学科的单文件构建产物同步到 docs/<subject>/index.html
const subject = process.argv[2];
if (!subject) {
  console.error("用法: node scripts/copy-docs.mjs <subject>");
  process.exit(1);
}

mkdirSync(`docs/${subject}`, { recursive: true });
copyFileSync(`apps/${subject}/dist/index.html`, `docs/${subject}/index.html`);
console.log(`docs/${subject}/index.html 已更新`);
