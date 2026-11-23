import { mkdirSync, copyFileSync } from "node:fs";

// 把 site/index.html 复制到 docs/index.html（学科落地页）
mkdirSync("docs", { recursive: true });
copyFileSync("site/index.html", "docs/index.html");
console.log("docs/index.html（学科落地页）已更新");
