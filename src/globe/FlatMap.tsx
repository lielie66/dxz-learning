import { useEffect, useRef } from "react";
import { getLandRings } from "../lib/land";
import { normLon, type LatLon } from "../lib/coords";
import type { GlobeConfig } from "./Globe";

type Props = {
  config: GlobeConfig;
  onPick?: (p: LatLon) => void;
  onHover?: (p: LatLon | null) => void;
};

type Rect = { x: number; y: number; w: number; h: number };

const PAD = 30;

export default function FlatMap({ config, onPick, onHover }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rectRef = useRef<Rect>({ x: 0, y: 0, w: 1, h: 1 });
  const pickRef = useRef(onPick);
  const hoverRef = useRef(onHover);
  pickRef.current = onPick;
  hoverRef.current = onHover;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d")!;

    const project = (lon: number, lat: number): [number, number] => {
      const r = rectRef.current;
      return [r.x + ((lon + 180) / 360) * r.w, r.y + ((90 - lat) / 180) * r.h];
    };

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = wrap.clientWidth;
      const cssH = wrap.clientHeight;
      if (!cssW || !cssH) return;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      const availW = cssW - PAD * 2;
      const availH = cssH - 26 - 46;
      let w = availW;
      let h = w / 2;
      if (h > availH) {
        h = availH;
        w = h * 2;
      }
      const x = (cssW - w) / 2;
      const y = 26 + (availH - h) / 2;
      rectRef.current = { x, y, w, h };

      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();

      // 海洋
      const ocean = ctx.createLinearGradient(0, y, 0, y + h);
      ocean.addColorStop(0, "#aecfec");
      ocean.addColorStop(0.5, "#c3ddf6");
      ocean.addColorStop(1, "#aecfec");
      ctx.fillStyle = ocean;
      ctx.fillRect(x, y, w, h);

      // 陆地
      ctx.fillStyle = "#f0ead9";
      ctx.strokeStyle = "#c6b795";
      ctx.lineWidth = 1;
      for (const ring of getLandRings()) {
        ctx.beginPath();
        let prevX: number | null = null;
        ring.forEach(([lon, lat], i) => {
          const [px, py] = project(lon, lat);
          if (i === 0) ctx.moveTo(px, py);
          else if (prevX !== null && Math.abs(px - prevX) > w / 2) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
          prevX = px;
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // 低中高纬色带
      if (config.showZones) {
        const bands: [number, number, string, number][] = [
          [-30, 30, "#22c55e", 0.18],
          [30, 60, "#f59e0b", 0.2],
          [60, 90, "#a855f7", 0.2],
          [-60, -30, "#f59e0b", 0.2],
          [-90, -60, "#a855f7", 0.2],
        ];
        for (const [latA, latB, color, alpha] of bands) {
          const [, y1] = project(0, latB);
          const [, y2] = project(0, latA);
          ctx.fillStyle = color;
          ctx.globalAlpha = alpha;
          ctx.fillRect(x, y1, w, y2 - y1);
          ctx.globalAlpha = 1;
        }
      }

      // 东半球绿色半壳
      if (config.showHemi) {
        const [x1] = project(-20, 0);
        const [x2] = project(160, 0);
        ctx.fillStyle = "#22c55e";
        ctx.globalAlpha = 0.16;
        ctx.fillRect(x1, y, x2 - x1, h);
        ctx.globalAlpha = 1;
      }

      // 经纬网
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(43,74,111,0.28)";
      if (config.showLat) {
        for (let lat = -75; lat <= 75; lat += 15) {
          if (lat === 0) continue;
          const [, py] = project(0, lat);
          ctx.beginPath();
          ctx.moveTo(x, py);
          ctx.lineTo(x + w, py);
          ctx.stroke();
        }
      }
      if (config.showLon) {
        for (let lon = -180; lon < 180; lon += 15) {
          if (lon === 0) continue;
          const [px] = project(lon, 0);
          ctx.beginPath();
          ctx.moveTo(px, y);
          ctx.lineTo(px, y + h);
          ctx.stroke();
        }
      }

      // 赤道
      if (config.showEquator) {
        const [, py] = project(0, 0);
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, py);
        ctx.lineTo(x + w, py);
        ctx.stroke();
      }

      // 本初子午线
      if (config.showPrime) {
        const [px] = project(0, 0);
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, y);
        ctx.lineTo(px, y + h);
        ctx.stroke();
      }

      // 东西半球分界
      if (config.showHemi) {
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2;
        for (const lon of [-20, 160]) {
          const [px] = project(lon, 0);
          ctx.beginPath();
          ctx.moveTo(px, y);
          ctx.lineTo(px, y + h);
          ctx.stroke();
        }
      }

      // 高亮线
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 4;
      if (config.highlightLat !== null) {
        const [, py] = project(0, config.highlightLat);
        ctx.beginPath();
        ctx.moveTo(x, py);
        ctx.lineTo(x + w, py);
        ctx.stroke();
      }
      if (config.highlightLon !== null) {
        const [px] = project(config.highlightLon, 0);
        ctx.beginPath();
        ctx.moveTo(px, y);
        ctx.lineTo(px, y + h);
        ctx.stroke();
      }

      // 标记点
      for (const mk of config.markers) {
        const [px, py] = project(mk.lon, mk.lat);
        const color = mk.kind === "target" ? "#f97316" : "#22d3ee";
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
        if (mk.label) {
          ctx.fillStyle = "#0f172a";
          ctx.font = "600 12px 'PingFang SC','Microsoft YaHei',sans-serif";
          ctx.fillText(mk.label, px + 10, py + 4);
        }
      }

      // 极点提示（说明文字在底部）

      ctx.restore();

      // 边框
      ctx.strokeStyle = "rgba(148,197,255,0.35)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

      // 纬度刻度
      ctx.fillStyle = "#5b7290";
      ctx.font = "11px 'PingFang SC','Microsoft YaHei',sans-serif";
      for (const lat of [-60, -30, 0, 30, 60]) {
        const [, py] = project(0, lat);
        const label = lat === 0 ? "0°" : `${Math.abs(lat)}°${lat > 0 ? "N" : "S"}`;
        ctx.fillText(label, x - 24, py + 4);
      }
      // 经度刻度
      for (const lon of [-120, -60, 0, 60, 120]) {
        const [px] = project(lon, 0);
        const label =
          lon === 0 ? "0°" : `${Math.abs(lon)}°${lon > 0 ? "E" : "W"}`;
        ctx.fillText(label, px - 12, y + h + 16);
      }

      // 底部说明
      const cap = "上下两条边 = 北极 / 南极 · 左右两边 = 同一条 180° 经线";
      ctx.fillStyle = "rgba(148,197,255,0.5)";
      ctx.fillText(cap, x + (w - ctx.measureText(cap).width) / 2, y + h + 34);
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [config]);

  const toLatLon = (ev: { clientX: number; clientY: number }): LatLon | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const px = ev.clientX - rect.left;
    const py = ev.clientY - rect.top;
    const r = rectRef.current;
    if (px < r.x || px > r.x + r.w || py < r.y || py > r.y + r.h) return null;
    const lon = ((px - r.x) / r.w) * 360 - 180;
    const lat = 90 - ((py - r.y) / r.h) * 180;
    return { lat: Math.round(lat), lon: Math.round(normLon(lon)) };
  };

  return (
    <div ref={wrapRef} className="flat-wrap">
      <canvas
        ref={canvasRef}
        className="flat-canvas"
        onPointerMove={(ev) => hoverRef.current?.(toLatLon(ev))}
        onPointerLeave={() => hoverRef.current?.(null)}
        onClick={(ev) => {
          const p = toLatLon(ev);
          if (p) pickRef.current?.(p);
        }}
      />
    </div>
  );
}
