// 生成 OG 分享图 public/og.png（1200×630）。改了 SVG 重跑：node scripts/make-og.mjs
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "node:fs";

// 底部装饰 sparkline（上行走势）
const spark = (() => {
  const W = 1040, H = 70, x0 = 80, y0 = 500;
  const ys = [40, 38, 44, 36, 30, 33, 24, 26, 18, 20, 12, 8];
  const pts = ys.map((v, i) => `${(x0 + (i / (ys.length - 1)) * W).toFixed(0)},${(y0 + v).toFixed(0)}`).join(" ");
  return `<polyline points="${pts}" fill="none" stroke="#f2a93b" stroke-width="3" stroke-linejoin="round" opacity="0.55"/>`;
})();

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="82%" cy="-5%" r="75%">
      <stop offset="0" stop-color="#f2a93b" stop-opacity="0.20"/>
      <stop offset="1" stop-color="#f2a93b" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="cyc" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#5a4a26"/>
      <stop offset="0.62" stop-color="#f2a93b"/>
      <stop offset="1" stop-color="#f2a93b"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="#0b0e14"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="0" y="0" width="1200" height="630" fill="none" stroke="#1c2230" stroke-width="2"/>

  <!-- 周期热度弧 -->
  <g transform="translate(792,150)">
    <path d="M0 230 A230 230 0 0 1 460 230" fill="none" stroke="#232a3a" stroke-width="15" stroke-linecap="round"/>
    <path d="M0 230 A230 230 0 0 1 379 81" fill="none" stroke="url(#cyc)" stroke-width="15" stroke-linecap="round"/>
    <circle cx="379" cy="81" r="14" fill="#f2a93b"/>
    <text x="230" y="210" font-family="'IBM Plex Mono','SFMono-Regular',monospace" font-size="64" font-weight="700" fill="#f2a93b" text-anchor="middle">65%</text>
    <text x="230" y="250" font-family="'PingFang SC',sans-serif" font-size="22" fill="#7a8499" text-anchor="middle">上行周期中段</text>
  </g>

  <!-- 左侧文字 -->
  <text x="80" y="142" font-family="'IBM Plex Mono','SFMono-Regular',monospace" font-size="22" letter-spacing="4" fill="#7a8499">DRAM · NAND · HBM · 实时监控终端</text>
  <text x="74" y="280" font-family="Archivo,'Helvetica Neue',Arial,sans-serif" font-size="112" font-weight="800" fill="#e6e9ef">Storage<tspan fill="#f2a93b">Cycle</tspan></text>
  <text x="80" y="356" font-family="'PingFang SC',sans-serif" font-size="50" font-weight="700" fill="#e6e9ef">存储周期监控终端</text>
  <text x="80" y="410" font-family="'PingFang SC',sans-serif" font-size="27" fill="#aab2c5">周期拐点 · 股价 / 财报 / 分析师共识 · 现货价走势 · 事件日历</text>

  ${spark}
  <text x="80" y="600" font-family="'IBM Plex Mono','SFMono-Regular',monospace" font-size="24" fill="#7a8499">storage-cycle.pages.dev</text>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: 1200 },
  font: { loadSystemFonts: true },
  background: "#0b0e14",
});
const png = resvg.render().asPng();
writeFileSync(new URL("../public/og.png", import.meta.url), png);
console.log("og.png written:", png.length, "bytes");
