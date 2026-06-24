import { useEffect, useRef, useState } from "react";
import {
  createChart,
  LineSeries,
  ColorType,
  LineStyle,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";

export interface SeriesDef {
  symbol: string;
  name: string;
  color: string;
}

interface HistoryResp {
  series: Record<string, { baseline: number | null; points: [number, number][] }>;
  errors?: Record<string, string>;
}

export default function PriceChart({ defs }: { defs: SeriesDef[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [legend, setLegend] = useState<
    Record<string, { last: number | null; hover: number | null; on: boolean }>
  >(() => Object.fromEntries(defs.map((d) => [d.symbol, { last: null, hover: null, on: true }])));
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<Record<string, ISeriesApi<"Line">>>({});

  // 拉数据 + 建图
  useEffect(() => {
    let disposed = false;
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
      grid: {
        vertLines: { color: "rgba(35,42,58,0.5)" },
        horzLines: { color: "rgba(35,42,58,0.5)" },
      },
      rightPriceScale: { borderColor: "#232a3a" },
      timeScale: { borderColor: "#232a3a", timeVisible: false, fixLeftEdge: true, fixRightEdge: true },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "#3a4657", labelBackgroundColor: "#1a2030" },
        horzLine: { color: "#3a4657", labelBackgroundColor: "#1a2030" },
      },
      localization: {
        priceFormatter: (v: number) => (v >= 0 ? "+" : "") + v.toFixed(1) + "%",
      },
    });
    chartRef.current = chart;

    const symbols = defs.map((d) => d.symbol);
    fetch("/api/history?symbols=" + encodeURIComponent(symbols.join(",")))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("http " + r.status))))
      .then((data: HistoryResp) => {
        if (disposed) return;
        let added = 0;
        const lastVals: Record<string, number | null> = {};

        for (const def of defs) {
          const raw = data.series?.[def.symbol];
          if (!raw || !raw.baseline || !raw.points?.length) continue;
          const base = raw.baseline;

          // rebase 成 YTD %，并把时间戳对齐到 UTC 日界，方便多市场叠加
          const seen = new Set<number>();
          const pts = raw.points
            .map(([t, c]) => {
              const day = (Math.floor(t / 86400) * 86400) as UTCTimestamp;
              return { time: day, value: (c / base - 1) * 100 };
            })
            .filter((p) => (seen.has(p.time) ? false : (seen.add(p.time), true)))
            .sort((a, b) => (a.time as number) - (b.time as number));
          if (!pts.length) continue;

          const s = chart.addSeries(LineSeries, {
            color: def.color,
            lineWidth: 2,
            priceLineVisible: false,
            lastValueVisible: true,
            crosshairMarkerRadius: 3,
          });
          s.setData(pts);
          seriesRef.current[def.symbol] = s;
          lastVals[def.symbol] = pts[pts.length - 1].value;
          added++;
        }

        if (!added) {
          setStatus("error");
          return;
        }

        // 0% 参考线
        const first = Object.values(seriesRef.current)[0];
        first?.createPriceLine({
          price: 0,
          color: "#3a4657",
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: "年初",
        });

        chart.timeScale().fitContent();
        setLegend((prev) => {
          const next = { ...prev };
          for (const sym in lastVals) next[sym] = { ...next[sym], last: lastVals[sym] };
          return next;
        });
        setStatus("ok");

        // 悬停联动图例
        chart.subscribeCrosshairMove((param) => {
          setLegend((prev) => {
            const next = { ...prev };
            for (const def of defs) {
              const s = seriesRef.current[def.symbol];
              const d = s && param.seriesData.get(s);
              next[def.symbol] = {
                ...next[def.symbol],
                hover: d && "value" in d ? (d.value as number) : null,
              };
            }
            return next;
          });
        });
      })
      .catch(() => !disposed && setStatus("error"));

    return () => {
      disposed = true;
      chart.remove();
      chartRef.current = null;
      seriesRef.current = {};
    };
  }, [defs]);

  const toggle = (sym: string) => {
    const s = seriesRef.current[sym];
    if (!s) return;
    setLegend((prev) => {
      const on = !prev[sym].on;
      s.applyOptions({ visible: on });
      return { ...prev, [sym]: { ...prev[sym], on } };
    });
  };

  const fmt = (v: number | null) => (v == null ? "—" : (v >= 0 ? "+" : "") + v.toFixed(1) + "%");

  return (
    <div>
      {/* 图例 / 开关 */}
      <div className="mb-3 flex flex-wrap gap-2">
        {defs.map((d) => {
          const l = legend[d.symbol];
          const show = l?.hover ?? l?.last ?? null;
          return (
            <button
              key={d.symbol}
              onClick={() => toggle(d.symbol)}
              className="flex items-center gap-2 rounded-lg border border-[color:var(--color-line)] px-2.5 py-1.5 text-xs transition-colors hover:bg-[color:var(--color-surface-2)]/60"
              style={{
                background: l?.on ? "var(--color-surface-2)" : "transparent",
                opacity: l?.on ? 1 : 0.4,
              }}
              aria-pressed={l?.on}
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="text-[color:var(--color-ink-dim)]">{d.name}</span>
              <span className="font-mono tnum text-[color:var(--color-ink-mute)]">{fmt(show)}</span>
            </button>
          );
        })}
      </div>

      <div className="relative h-[340px] w-full overflow-hidden rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)]/40">
        <div ref={wrapRef} className="absolute inset-0" />
        {status !== "ok" && (
          <div className="absolute inset-0 grid place-items-center text-sm text-[color:var(--color-ink-mute)]">
            {status === "loading" ? "加载实时走势…" : "走势数据暂不可用（实时源限流），稍后重试"}
          </div>
        )}
      </div>
      <p className="mt-2 text-[11px] text-[color:var(--color-ink-mute)]">
        全部以年初收盘为 0% 基准做 YTD 归一化对比 · 数据 Yahoo Finance · 点击图例可隐藏/显示
      </p>
    </div>
  );
}
