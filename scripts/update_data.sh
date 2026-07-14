#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> 抓取行情（建议使用项目虚拟环境）"
if [[ -x .venv/bin/python ]]; then
  .venv/bin/python scripts/fetch_market.py "$@"
else
  python3 scripts/fetch_market.py "$@"
fi

echo "==> 复盘到期推荐"
python3 scripts/review_recommendations.py

echo "==> 完成。检查 public/data 后执行："
echo "    git add public/data && git commit -m \"chore: update market data\" && git push"
