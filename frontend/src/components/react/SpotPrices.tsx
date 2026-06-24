import { useEffect, useRef, useState } from "react";
import {
  createChart,
  AreaSeries,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";

interface SpotRow {
  date: string;
  category: string;
  item: string;
  vendors: string;
  daily_high: number | null;
  daily_low: number | null;
  session_avg: number | null;
  change_pct: string;
  trend: string;
}
interface Snapshot { asOf: string | null; rows: SpotRow[] }
interface Hist { item: string; history: { date: string; session_avg: number | null; change_pct: string; trend: string }[] }

const UP = "var(--color-up)";
const DOWN = "var(--color-down)";
const MUTE = "var(--color-ink-mute)";
const trendColor = (t: string) => (t?.includes("rise") ? UP : t?.includes("fall") ? DOWN : MUTE);
const CAT = (c: string) => (c === "dram" ? "DRAM" : c === "nand" ? "NAND" : c.toUpperCase());

export default function SpotPrices() {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [hist, setHist] = useState<Hist | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const wrapRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  // 初始：最新快照
  useEffect(() => {
    fetch("/api/spot")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error())))
      .then((d: Snapshot) => {
        setSnap(d);
        setStatus("ok");
        // 默认选有历史的品项（DDR4 16Gb 已回填），否则第一项
        const preferred = d.rows?.find((r) => r.item === "DDR4 16Gb (2Gx8) 3200")?.item ?? d.rows?.[0]?.item;
        if (preferred) setSel(preferred);
      })
      .catch(() => setStatus("error"));
  }, []);

  // 选中项 → 拉 60 天历史
  useEffect(() => {
    if (!sel) return;
    fetch("/api/spot?item=" + encodeURIComponent(sel))
      .then((r) => r.json())
      .then((d: Hist) => setHist(d))
      .catch(() => setHist(null));
  }, [sel]);

  // 建图（一次）
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#7a8499",
        fontFamily: "'IBM Plex Mono', monospace",
        attributionLogo: false,
      },
      grid: { vertLines: { color: "rgba(35,42,58,0.5)" }, horzLines: { color: "rgba(35,42,58,0.5)" } },
      rightPriceScale: { borderColor: "#232a3a" },
      timeScale: { borderColor: "#232a3a", fixLeftEdge: true, fixRightEdge: true },
      crosshair: { mode: CrosshairMode.Normal },
    });
    const s = chart.addSeries(AreaSeries, {
      lineColor: "#f2a93b",
      topColor: "rgba(242,169,59,0.22)",
      bottomColor: "rgba(242,169,59,0)",
      lineWidth: 2,
      priceLineVisible: false,
    });
    chartRef.current = chart;
    seriesRef.current = s;
    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // 历史 → 更新 series
  useEffect(() => {
    const s = seriesRef.current;
    if (!s || !hist) return;
    const seen = new Set<string>();
    const data = (hist.history || [])
      .filter((h) => h.session_avg != null && !seen.has(h.date) && (seen.add(h.date), true))
      .map((h) => ({ time: h.date, value: h.session_avg as number }))
      .sort((a, b) => (a.time < b.time ? -1 : 1));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    s.setData(data as any);
    chartRef.current?.timeScale().fitContent();
  }, [hist]);

  const selRow = snap?.rows.find((r) => r.item === sel);
  const fmt = (n: number | null) => (n == null ? "—" : String(n));

  return (
    <div>
      <div class="mb-3 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-[color:var(--color-ink-mute)]">
        <span class="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--color-heat)]" />
        实时现货价 · TrendForce
        {snap?.asOf && <span class="font-mono normal-case text-[color:var(--color-ink-dim)]">截至 {snap.asOf}</span>}
      </div>

      {status === "error" ? (
        <div class="rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)]/40 p-6 text-sm text-[color:var(--color-ink-mute)]">
          现货数据暂不可用（爬虫尚未写入或源限流）
        </div>
      ) : (
        <div class="grid gap-5 lg:grid-cols-[290px_1fr]">
          {/* 左：当前现货价列表（可点） */}
          <div class="max-h-[360px] overflow-y-auto rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)]/40">
            {(snap?.rows ?? []).map((r, i) => {
              const prevCat = snap?.rows[i - 1]?.category;
              return (
                <>
                  {r.category !== prevCat && (
                    <div class="border-b border-[color:var(--color-line-soft)] bg-[color:var(--color-bg)]/40 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-[color:var(--color-ink-mute)]">
                      {CAT(r.category)}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setSel(r.item)}
                    class="flex w-full items-center gap-2 border-b border-[color:var(--color-line-soft)] px-3 py-2 text-left text-xs transition-colors last:border-0 hover:bg-[color:var(--color-surface-2)]/50"
                    style={{ background: r.item === sel ? "var(--color-surface-2)" : "transparent" }}
                  >
                    <span class="min-w-0 flex-1 truncate text-[color:var(--color-ink-dim)]">{r.item}</span>
                    <span class="font-mono tabular-nums text-[color:var(--color-ink)]">{fmt(r.session_avg)}</span>
                    <span class="w-14 text-right font-mono tabular-nums" style={{ color: trendColor(r.trend) }}>
                      {r.change_pct}
                    </span>
                  </button>
                </>
              );
            })}
          </div>

          {/* 右：选中品项历史走势 */}
          <div class="rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)]/40 p-4">
            <div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <div class="text-sm font-medium text-[color:var(--color-ink)]">{sel ?? "—"}</div>
              {selRow && (
                <div class="flex items-baseline gap-3 font-mono text-xs">
                  <span class="text-base font-semibold tabular-nums text-[color:var(--color-ink)]">{fmt(selRow.session_avg)}</span>
                  <span class="tabular-nums" style={{ color: trendColor(selRow.trend) }}>{selRow.change_pct}</span>
                  <span class="text-[color:var(--color-ink-mute)]">高 {fmt(selRow.daily_high)} · 低 {fmt(selRow.daily_low)}</span>
                </div>
              )}
            </div>
            <div class="relative h-[300px]">
              <div ref={wrapRef} class="absolute inset-0" />
              {(!hist || (hist.history?.length ?? 0) < 2) && (
                <div class="absolute inset-0 grid place-items-center text-xs text-[color:var(--color-ink-mute)]">
                  {status === "loading" ? "加载中…" : "历史数据积累中（每日爬一次，过几天就有走势了）"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <p class="mt-2 text-[11px] text-[color:var(--color-ink-mute)]">
        现货均价（USD/颗）· 点左侧品项看 60 天走势 · 数据经爬虫取自 TrendForce 公开现货页，每日更新，仅供研究参考
      </p>
    </div>
  );
}
