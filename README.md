# BluePulse · 股票小白站

给投资小白看的 A 股学习站：每日涨跌、行业走势、原因解读、推荐留存与到期复盘。

> 内容仅供学习，不构成投资建议。

## 本地预览

```bash
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

## 数据怎么更新（本机抓取 → GitHub）

1. 安装 Python 依赖：

```bash
pip install -r scripts/requirements.txt
```

2. 抓取并（可选）复盘：

```bash
chmod +x scripts/update_data.sh
./scripts/update_data.sh
# 或指定日期
./scripts/update_data.sh --date 2026-07-14
```

3. 提交数据并推送：

```bash
git add public/data
git commit -m "chore: update market data"
git push
```

网站静态读 `public/data/`，推送后 GitHub Pages 会显示最新数据。

## 部署到 GitHub Pages

1. 把仓库推到 GitHub  
2. Settings → Pages → Source 选 GitHub Actions  
3. 本仓库已配置静态导出：`npm run build` 产出 `out/`  
4. 若仓库名不是 `username.github.io`，在 `next.config.ts` 增加：

```ts
basePath: "/你的仓库名",
assetPrefix: "/你的仓库名",
```

并设置：

```bash
NEXT_PUBLIC_BASE_PATH=/你的仓库名
```

## 目录说明

| 路径 | 作用 |
|------|------|
| `src/app` | 页面 |
| `public/data` | 日行情 / 周期 / 推荐 / 复盘 JSON |
| `scripts/` | 本机抓取与复盘脚本 |

当前 `public/data` 内是演示数据，方便先把网站跑通；接入 `akshare` 后可换成真实行情。
