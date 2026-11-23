# 部署与发布 Runbook

> 适用于当前 monorepo：`apps/<subject>` + `docs/<subject>/`。
> 所有命令在仓库根目录执行。**不要把密码、token、私钥写进仓库或命令历史。**

---

## 1. 渠道一览

| 渠道 | 用途 | 更新方式 |
|---|---|---|
| GitHub `main` | 主仓库 / 代码背书 | `git push origin main` |
| GitHub Pages `/docs` | 海外备用站 | 推送后自动构建 |
| Gitee `main` | 国内镜像 | SSH 推送（HTTPS 需 token） |
| Gitee raw | 国内离线包直链 | 推送 `release/geo-lab-offline.zip` |
| GitHub Release `v0.1.0` | 离线包 | `gh release upload ... --clobber` |
| EdgeOne Pages | 主站 `dxz.flowzen.cn` | 控制台手动上传 |

---

## 2. 构建

```powershell
npm ci
npm run build
```

产物：

- `apps/geo/dist/index.html`（本地）
- `docs/geo/index.html`（生成，**需要提交**）
- `docs/index.html`（落地页，生成，**需要提交**）

当前可用：

```powershell
npm run build          # build:geo + build:site
npm run build:geo
npm run build:site
```

新增学科后：

```powershell
npm run build:history
npm run build:biology
```

产物在 `docs/` 下，保持与线上路径一致。

---

## 3. GitHub

```powershell
git add -A
git commit -m "feat(geo): ..."
git push origin main
```

国内网络如果直连 GitHub 失败，可临时走本地代理（**不要写进 git config 提交**）：

```powershell
git -c http.proxy=http://127.0.0.1:7890 -c https.proxy=http://127.0.0.1:7890 push origin main
```

GitHub Pages：

- 仓库 Settings → Pages → Source = `main` / `/docs`
- 推送后 1–3 分钟生效
- 地址：<https://lielie66.github.io/dxz-learning/>
- 拆分后：`/geo/`、`/history/`、`/biology/`

---

## 4. Gitee

账号开了 2FA，**HTTPS 密码不能用于 git**。两种方式：

### 方式 A：SSH（推荐）

1. 本机生成临时 key：

```powershell
ssh-keygen -t ed25519 -N '""' -C "dxz-deploy-temp" -f "$env:TEMP\gitee_dxz"
```

2. Gitee → 设置 → SSH 公钥 → 添加 `gitee_dxz.pub` 内容（需要账号密码验证）。
3. 推送：

```powershell
$env:GIT_SSH_COMMAND = "ssh -i `"$env:TEMP\gitee_dxz`" -o IdentitiesOnly=yes"
git push git@gitee.com:acef09/dxz-learning.git main
```

4. 推送后删除 Gitee 上的临时公钥，并删除本地私钥。

### 方式 B：私人令牌

Gitee → 设置 → 私人令牌 → 生成 `projects` 权限令牌，然后：

```powershell
git push https://acef09:<TOKEN>@gitee.com/acef09/dxz-learning.git main
```

用完即撤销。不要把 token 写进 remote URL 长期保存。

### 验证

```powershell
git ls-remote https://gitee.com/acef09/dxz-learning.git refs/heads/main

curl.exe -L "https://gitee.com/acef09/dxz-learning/raw/main/docs/geo/index.html" -o "$env:TEMP\gitee_index.html"
(Get-Item "$env:TEMP\gitee_index.html").Length

curl.exe -L "https://gitee.com/acef09/dxz-learning/raw/main/release/geo-lab-offline.zip" -o "$env:TEMP\gitee.zip"
# 期望 414,859 B 左右，文件头 PK
```

---

## 5. EdgeOne Pages（主站）

### 项目信息

- 控制台：<https://console.tencentcloud.com/edgeone/makers>
- 项目：`xenogeneic-red-rnv9axnn`
- ProjectId：`makers-dlyjvw6e9jvt`
- 域名：`dxz.flowzen.cn`
- CNAME：`dxz.flowzen.cn.pages.dnsoe8.com`
- 加速区域：全球可用区（不含中国大陆）

### 发布步骤

1. 本地 `npm run build`，确认 `docs/index.html` 和 `docs/geo/index.html` 都已更新。
2. 把 `docs/` 打成 ZIP（根含 `index.html`、`geo/`）：
   ```powershell
   Compress-Archive -Path (Get-ChildItem docs -Force).FullName -DestinationPath "$env:TEMP\dxz-site.zip" -Force
   ```
3. 控制台 → 项目 → **Build & Deploy → New Deployment**，或直接打开：
   `https://console.tencentcloud.com/edgeone/makers/upload/makers-dlyjvw6e9jvt`
4. 选择 **Select file**，上传 `dxz-site.zip`。
   - 也支持单个 HTML / 文件夹；**不支持多个单独文件**。
   - 单文件上限 25 MB。
5. 点 **开始部署**，等状态变成“完成”。
6. 访问 `https://dxz.flowzen.cn/?v=<日期>` 和 `https://dxz.flowzen.cn/geo/` 验证。

新增历史 / 生物后，ZIP 根里会多出 `history/`、`biology/`。

### 域名 / HTTPS

- 自定义域名已加，状态应为 **Effective**
- 证书：TrustAsia DV，自动续期
- 已开启 **Force HTTPS**（HTTP 302 → HTTPS）
- 如果换域名：
  1. 添加自定义域名，按提示加 TXT 归属验证
  2. 验证通过后加 CNAME
  3. 等状态 Effective
  4. Configuration → Apply for a free certificate → Save
  5. 等 HTTPS 变成 Deployed

### 验证

```powershell
curl.exe -I https://dxz.flowzen.cn/
# 期望 200，Content-Length 约 1,472,367

# 证书
$tcp = New-Object System.Net.Sockets.TcpClient('43.174.247.113',443)
$ssl = New-Object System.Net.Security.SslStream($tcp.GetStream(),$false,({$true} -as [System.Net.Security.RemoteCertificateValidationCallback]))
$ssl.AuthenticateAsClient('dxz.flowzen.cn')
$cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($ssl.RemoteCertificate)
$cert.Subject; $cert.Issuer; $cert.NotAfter
```

### 回滚

控制台重新上传上一版 `dxz-site.zip` 即可。
保留最近两版的构建产物（本地或 release/），不要只留最新一份。

---

## 6. 离线包

### 生成

```powershell
npm run release:geo
```

产物：`release/geo-lab-offline.zip`（约 405–415 KB）
内含：`地理实验室.html` + `使用说明.txt`

> 脚本对换行敏感。当前文件是 **UTF-8 BOM + CRLF**；如果改成 LF，Windows PowerShell 5.1 可能报 here-string 未终止。

### 发布到 GitHub Release

```powershell
$env:HTTPS_PROXY="http://127.0.0.1:7890"
gh release upload v0.1.0 release/geo-lab-offline.zip --clobber

gh release view v0.1.0 --json assets --jq ".assets[] | {name, size, updatedAt}"
```

### 发布到 Gitee

随 `main` 推送即可：

`https://gitee.com/acef09/dxz-learning/raw/main/release/geo-lab-offline.zip`

### 注意

- EdgeOne 站点根目录放 `.zip` 实测返回 404，**不要把离线包当站点静态文件**。
- 离线包链接优先用 GitHub Release；国内用 Gitee raw。
- 每次重新生成后，检查 zip 内 HTML 大小与 `docs/geo/index.html` 一致。

---

## 7. 发布后检查清单

- [ ] `https://dxz.flowzen.cn/` 200，标题「带孝子爱学习」
- [ ] `https://dxz.flowzen.cn/geo/` 200，标题「地理实验室 · 七年级地理」
- [ ] `?v=<日期>` 能看到最新改动
- [ ] 证书 `CN=dxz.flowzen.cn`，未过期
- [ ] HTTP 自动跳 HTTPS
- [ ] 手机 360px 宽不横向溢出
- [ ] 第 1 课、第 11 课、练习、错题本各走一遍
- [ ] GitHub / Gitee 的 `docs/geo/index.html` 与线上大小一致
- [ ] 离线包能解压、双击打开
- [ ] `README.md` 的链接可点开

---

## 8. 安全

- 账号密码、token、私钥只由用户保管；仓库内不出现。
- 临时 SSH key 用完删除（本地 + Gitee）。
- Gitee / EdgeOne / GitHub 密码如果在聊天里出现过，提醒用户修改。
- 不在公开仓库提交 `content-private/`。
