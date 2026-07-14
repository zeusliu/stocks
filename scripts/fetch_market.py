"""从公开接口抓取 A 股真实日行情，写出网站 JSON。

主数据源：东方财富涨停池 / 指数 / 行业板块
备选校验：akshare（同属东财数据封装时可用于对照）

用法：
  .venv/bin/python scripts/fetch_market.py
  .venv/bin/python scripts/fetch_market.py --date 2026-07-14
  .venv/bin/python scripts/fetch_market.py --days 5
"""

from __future__ import annotations

import argparse
import json
import time
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "public" / "data"
DAILY_DIR = DATA / "daily"

UA = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Referer": "https://quote.eastmoney.com/",
}


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {path.relative_to(ROOT)}")


def get_json(url: str, params: dict[str, Any], retries: int = 3) -> dict[str, Any]:
    last_err: Exception | None = None
    for i in range(retries):
        try:
            res = requests.get(url, params=params, headers=UA, timeout=25)
            res.raise_for_status()
            return res.json()
        except Exception as exc:  # noqa: BLE001
            last_err = exc
            time.sleep(0.8 * (i + 1))
    raise RuntimeError(f"请求失败 {url}: {last_err}")


def ymd(d: date | str) -> str:
    if isinstance(d, date):
        return d.strftime("%Y%m%d")
    return d.replace("-", "")


def iso(d: date | str) -> str:
    if isinstance(d, date):
        return d.isoformat()
    if "-" in d:
        return d
    return f"{d[0:4]}-{d[4:6]}-{d[6:8]}"


def price_from_em(raw: Any) -> float:
    """东财涨停池最新价字段多为价格*1000。"""
    try:
        v = float(raw or 0)
    except (TypeError, ValueError):
        return 0.0
    if v > 1000:
        return round(v / 1000.0, 2)
    return round(v, 2)


def fetch_limit_up_eastmoney(trade_date: str) -> tuple[list[dict[str, Any]], int]:
    """东方财富涨停池。返回 (样本列表, 全市场涨停家数)。"""
    payload = get_json(
        "https://push2ex.eastmoney.com/getTopicZTPool",
        {
            "ut": "7eea3edcaed734bea9cbfc24409ed989",
            "dpt": "wz.ztzt",
            "Pageindex": "0",
            "pagesize": "100",
            "sort": "fbt:asc",
            "date": ymd(trade_date),
        },
    )
    data = payload.get("data") or {}
    pool = data.get("pool") or []
    total = int(data.get("tc") or len(pool) or 0)

    rows: list[dict[str, Any]] = []
    for item in pool[:15]:
        code = str(item.get("c") or "")
        name = str(item.get("n") or "")
        pct = round(float(item.get("zdp") or 0), 2)
        price = price_from_em(item.get("p"))
        # 板块/原因字段在接口里可能叫 hybk / reason
        reason = str(item.get("hybk") or item.get("reason") or "涨停").strip() or "涨停"
        rows.append(
            {
                "code": code,
                "name": name,
                "pct": pct,
                "price": price,
                "reason": reason,
            }
        )
    return rows, total


def fetch_limit_down_eastmoney(trade_date: str) -> tuple[list[dict[str, Any]], int]:
    payload = get_json(
        "https://push2ex.eastmoney.com/getTopicDTPool",
        {
            "ut": "7eea3edcaed734bea9cbfc24409ed989",
            "dpt": "wz.ztzt",
            "Pageindex": "0",
            "pagesize": "50",
            "sort": "fund:asc",
            "date": ymd(trade_date),
        },
    )
    data = payload.get("data") or {}
    pool = data.get("pool") or []
    total = int(data.get("tc") or len(pool) or 0)
    rows: list[dict[str, Any]] = []
    for item in pool[:10]:
        rows.append(
            {
                "code": str(item.get("c") or ""),
                "name": str(item.get("n") or ""),
                "pct": round(float(item.get("zdp") or 0), 2),
                "price": price_from_em(item.get("p")),
                "reason": str(item.get("hybk") or "跌停").strip() or "跌停",
            }
        )
    return rows, total


def fetch_shanghai_index() -> tuple[float, float]:
    """返回 (收盘/现价, 涨跌幅%)。盘中为现价。失败时返回 (0, 0)。"""
    try:
        payload = get_json(
            "https://push2.eastmoney.com/api/qt/stock/get",
            {
                "secid": "1.000001",
                "fields": "f43,f60,f169,f170,f58",
            },
        )
        data = payload.get("data") or {}
        close = float(data.get("f43") or 0) / 100.0
        prev = float(data.get("f60") or 0) / 100.0
        pct = float(data.get("f170") or 0) / 100.0
        if close <= 0 and prev > 0:
            close = prev
        return round(close, 2), round(pct, 2)
    except Exception as exc:  # noqa: BLE001
        print(f"上证指数抓取失败（可忽略）: {exc}")
        return 0.0, 0.0


def fetch_sectors_eastmoney() -> list[dict[str, Any]]:
    try:
        payload = get_json(
            "https://push2.eastmoney.com/api/qt/clist/get",
            {
                "pn": "1",
                "pz": "12",
                "po": "1",
                "np": "1",
                "fltt": "2",
                "invt": "2",
                "fid": "f3",
                "fs": "m:90+t:2",
                "fields": "f12,f14,f2,f3,f4,f20,f8,f104,f105",
            },
        )
    except Exception as exc:  # noqa: BLE001
        print(f"行业板块抓取失败（可忽略）: {exc}")
        return []

    diff = ((payload.get("data") or {}).get("diff")) or []
    sectors: list[dict[str, Any]] = []
    for item in diff[:8]:
        pct = float(item.get("f3") or 0)
        leaders = []
        for key in ("f104", "f105"):
            v = item.get(key)
            if v:
                leaders.append(str(v))
        sectors.append(
            {
                "name": str(item.get("f14") or ""),
                "pct": round(pct, 2),
                "leaders": leaders or ["—"],
                "reason": "来自东方财富行业板块当日涨跌幅。",
            }
        )
    return sectors


def verify_with_akshare(trade_date: str, codes: list[str]) -> dict[str, Any]:
    """用 akshare 对照涨停池，返回校验摘要（失败不抛错）。"""
    try:
        import akshare as ak  # type: ignore
    except ImportError:
        return {"ok": False, "reason": "未安装 akshare"}

    try:
        df = ak.stock_zt_pool_em(date=ymd(trade_date))
        ak_codes = set(str(x) for x in df["代码"].astype(str).tolist()) if "代码" in df else set()
        hit = [c for c in codes if c in ak_codes]
        return {
            "ok": True,
            "akshareCount": int(len(df)),
            "sampleOverlap": hit,
            "overlapRate": round(len(hit) / max(len(codes), 1), 2),
        }
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "reason": str(exc)}


def sentiment_from_counts(limit_up: int, limit_down: int, index_pct: float) -> str:
    if limit_up >= 60 and index_pct >= 0.5:
        return "偏强"
    if limit_down >= 40 or index_pct <= -1:
        return "偏弱"
    if limit_up >= 30:
        return "活跃"
    return "震荡"


def build_daily(trade_date: str) -> dict[str, Any] | None:
    limit_up, limit_up_count = fetch_limit_up_eastmoney(trade_date)
    if not limit_up and limit_up_count == 0:
        print(f"{trade_date}: 无涨停池数据（可能休市或未更新）")
        return None

    limit_down, limit_down_count = fetch_limit_down_eastmoney(trade_date)
    index_close, index_pct = fetch_shanghai_index()
    sectors = fetch_sectors_eastmoney()

    verify = verify_with_akshare(trade_date, [x["code"] for x in limit_up[:8]])

    # 涨幅榜：优先用涨停池前几名；跌幅榜用跌停样本
    top_gainers = [
        {"code": x["code"], "name": x["name"], "pct": x["pct"], "price": x["price"]}
        for x in limit_up[:5]
    ]
    top_losers = [
        {"code": x["code"], "name": x["name"], "pct": x["pct"], "price": x["price"]}
        for x in limit_down[:5]
    ]

    sentiment = sentiment_from_counts(limit_up_count, limit_down_count, index_pct)
    one_liner = (
        f"上证 {index_close:.2f}（{index_pct:+.2f}%），"
        f"涨停 {limit_up_count} 家，跌停 {limit_down_count} 家。"
    )

    return {
        "date": iso(trade_date),
        "source": "eastmoney",
        "verifiedAt": datetime.now().isoformat(timespec="seconds"),
        "verify": verify,
        "summary": {
            "indexName": "上证指数",
            "indexClose": index_close,
            "indexPct": index_pct,
            "limitUp": limit_up_count,
            "limitDown": limit_down_count,
            "upCount": 0,
            "downCount": 0,
            "sentiment": sentiment,
            "oneLiner": one_liner,
        },
        "limitUp": limit_up,
        "limitDown": limit_down,
        "topGainers": top_gainers,
        "topLosers": top_losers,
        "sectors": sectors,
        "interpretation": (
            f"{iso(trade_date)} 数据来自东方财富涨停/跌停池与行业板块。"
            f"首页与每日行情按交易日展示，可与公开行情交叉核对。"
            + (
                f" akshare 对照重叠 {verify.get('overlapRate')}"
                if verify.get("ok")
                else f" akshare 对照未完成：{verify.get('reason')}"
            )
        ),
    }


def update_index(dates: list[str]) -> None:
    dates = sorted(set(dates))
    write_json(
        DATA / "index.json",
        {
            "market": "A股",
            "latestDate": dates[-1],
            "dates": dates,
            "disclaimer": (
                "本站行情数据来自公开接口（东方财富等），仅供学习与核对，"
                "不构成任何投资建议。股市有风险，入市需谨慎。"
            ),
        },
    )


def recent_trade_candidates(days: int) -> list[str]:
    """回溯日历日，跳过周末，返回候选 YYYY-MM-DD。"""
    out: list[str] = []
    d = date.today()
    for _ in range(days * 3):
        if d.weekday() < 5:
            out.append(d.isoformat())
            if len(out) >= days + 3:
                break
        d -= timedelta(days=1)
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description="抓取真实 A 股行情 JSON")
    parser.add_argument("--date", help="单个交易日 YYYY-MM-DD")
    parser.add_argument("--days", type=int, default=5, help="抓最近若干个有数据的交易日")
    args = parser.parse_args()

    DAILY_DIR.mkdir(parents=True, exist_ok=True)

    if args.date:
        candidates = [args.date]
    else:
        candidates = recent_trade_candidates(args.days)

    saved: list[str] = []
    fingerprints: set[str] = set()

    for trade_date in candidates:
        try:
            payload = build_daily(trade_date)
        except Exception as exc:  # noqa: BLE001
            print(f"{trade_date}: 抓取失败 {exc}")
            continue
        if not payload:
            continue

        # 跳过与已保存日期内容完全相同的“串日”结果（盘中接口有时返回同一池）
        fp = json.dumps([x["code"] for x in payload["limitUp"][:8]], ensure_ascii=False)
        if fp in fingerprints and not args.date:
            print(f"{trade_date}: 与已有交易日涨停样本重复，跳过")
            continue
        fingerprints.add(fp)

        write_json(DAILY_DIR / f"{payload['date']}.json", payload)
        print(
            f"{payload['date']}: 涨停{payload['summary']['limitUp']} "
            f"跌停{payload['summary']['limitDown']} "
            f"上证{payload['summary']['indexClose']} "
            f"校验={payload.get('verify')}"
        )
        print("  涨停样本:", ", ".join(f"{x['name']}({x['code']})" for x in payload["limitUp"][:5]))
        saved.append(payload["date"])
        if not args.date and len(saved) >= args.days:
            break
        time.sleep(0.5)

    if not saved:
        raise SystemExit("未抓到任何交易日数据，请检查网络或稍后重试。")

    # 清理过期演示文件：仅保留本次真实抓取的日期 + 既有但同批
    update_index(saved)
    print("完成。请刷新网站核对涨停列表。")


if __name__ == "__main__":
    main()
