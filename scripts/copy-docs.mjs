import { mkdirSync, copyFileSync } from "node:fs";

// 把单文件构建产物同步到 docs/，供 GitHub Pages 直接托管
mkdirSync("docs", { recursive: true });
copyFileSync("dist/index.html", "docs/index.html");
console.log("docs/index.html 已更新");
