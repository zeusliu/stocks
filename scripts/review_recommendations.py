"""对到期推荐做复盘：对比推荐后 N 日实际涨跌，写入 reviews.json。

用法:
  python scripts/review_recommendations.py

说明:
  - MVP 若本地没有足够历史价，会用 daily JSON 中的涨跌近似估算（演示逻辑）
  - 后续可换成个股日 K 精确复权收益
"""

from __future__ import annotations

import json
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "public" / "data"


def load(name: str):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def save(name: str, payload) -> None:
    (DATA / name).write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote public/data/{name}")


def add_days(date_str: str, days: int) -> str:
    return (datetime.strptime(date_str, "%Y-%m-%d") + timedelta(days=days)).strftime("%Y-%m-%d")


def classify(actual_pct: float) -> str:
    if actual_pct >= 5:
        return "beat"
    if actual_pct >= 0:
        return "met"
    return "miss"


def main() -> None:
    index = load("index.json")
    latest = index["latestDate"]
    rec_file = load("recommendations.json")
    review_file = load("reviews.json")

    existing_ids = {item["recommendationId"] for item in review_file.get("items", [])}
    new_reviews = []

    for item in rec_file.get("items", []):
        if item["id"] in existing_ids:
            continue
        due = add_days(item["date"], item["horizonDays"] + 2)  # 粗略：自然日近似交易日
        if due > latest and item["status"] == "watching":
            # 未到复盘窗口
            continue

        # 演示：用 horizon 对应一个占位涨跌；真实环境应读个股行情
        horizon = int(item.get("horizonDays", 3))
        expected_pct = {1: 2.0, 3: 3.0, 5: 5.0, 7: 6.0}.get(horizon, 3.0)
        actual_pct = 1.5 if horizon >= 5 else (-0.8 if horizon <= 1 else 1.0)
        result = classify(actual_pct)

        review = {
            "id": f"rev-auto-{item['id']}",
            "recommendationId": item["id"],
            "recommendDate": item["date"],
            "reviewDate": latest,
            "code": item["code"],
            "name": item["name"],
            "horizonDays": item["horizonDays"],
            "expectedNote": item["targetNote"],
            "expectedPct": expected_pct,
            "actualPct": actual_pct,
            "gapNote": "自动复盘占位结果，请用真实行情替换。",
            "gapReason": (
                "当前脚本用占位收益完成闭环。接入个股日 K 后，"
                "这里会写成：预期逻辑 vs 实际涨跌 vs 板块环境差异。"
            ),
            "result": result,
        }
        new_reviews.append(review)
        item["status"] = "reviewed"

    if not new_reviews:
        print("没有新的到期推荐需要复盘。")
        return

    review_file["items"] = new_reviews + review_file.get("items", [])
    review_file["updatedAt"] = latest
    rec_file["updatedAt"] = latest
    save("reviews.json", review_file)
    save("recommendations.json", rec_file)


if __name__ == "__main__":
    main()
