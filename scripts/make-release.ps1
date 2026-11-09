# 生成离线版压缩包：release/geo-lab-offline.zip
# 用法：在仓库根目录执行 powershell -ExecutionPolicy Bypass -File scripts/make-release.ps1

$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root "docs\index.html"
if (-not (Test-Path $src)) {
    Write-Error "找不到 docs/index.html，请先运行 npm run build"
    exit 1
}

$stage = Join-Path $env:TEMP "geo-release"
if (Test-Path $stage) { Remove-Item -Recurse -Force $stage }
New-Item -ItemType Directory -Force -Path $stage | Out-Null

Copy-Item $src (Join-Path $stage "地理实验室.html") -Force

$readme = @"
地理实验室 · 七年级地理复习工具（离线版）

1. 解压本压缩包。
2. 双击「地理实验室.html」，用 Chrome 或 Edge 打开。
3. 不需要联网，不需要安装任何软件。
4. 错题记录保存在浏览器本地，换浏览器或清理缓存会丢失。
5. 建议放在固定文件夹，不要随意移动。

适用教材：中图版（中国地图出版社）七年级上册，2024 年版。
"@
$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Join-Path $stage "使用说明.txt"), $readme, $utf8)

$outDir = Join-Path $root "release"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$zip = Join-Path $outDir "geo-lab-offline.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zip -CompressionLevel Optimal

Write-Output ("已生成 " + $zip + " (" + [math]::Round((Get-Item $zip).Length / 1KB) + " KB)")
