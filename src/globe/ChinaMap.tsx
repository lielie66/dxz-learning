import { useEffect, useRef } from "react";
import { CHINA_GEO, PROVINCE_MAP } from "../data/china";
import type { GlobeMarker } from "./Globe";

export type ChinaConfig = {
  highlights: string[];
  markers: GlobeMarker[];
  showLine: boolean;
  showNames: boolean;
  showExtremes: boolean;
};

export const defaultChinaConfig: ChinaConfig = {
  highlights: [],
  markers: [],
  showLine: false,
  showNames: true,
  showExtremes: false,
};

type Poly = { name: string; rings: { pts: [number, number][]; minX: number; minY: number; maxX: number; maxY: number }[] };
type Rect = { x: number; y: number; w: number; h: number; scale: number };

const LON_MIN = 73.2;
const LON_MAX = 135.4;
const LAT_MIN = 3.2;
const LAT_MAX = 53.8;
const PAD = 30;

const merc = (lat: number) =>
  (Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) * 180) / Math.PI;

const LABEL_OFFSET: Record<string, [number, number]> = {
  北京市: [-14, -10],
  天津市: [16, -2],
  上海市: [16, 2],
  香港特别行政区: [18, 12],
  澳门特别行政区: [-18, 14],
};

const EXTREMES = [
  { lon: 124.0, lat: 53.56, label: "最北端", dx: 8, dy: -8 },
  { lon: 112.3, lat: 3.4, label: "最南端", dx: 8, dy: -9 },
  { lon: 135.1, lat: 48.3, label: "最东端", dx: -46, dy: 4 },
  { lon: 73.5, lat: 39.5, label: "最西端", dx: 8, dy: 4 },
];

const HEIHE: [number, number] = [127.53, 50.25];
const TENGCHONG: [number, number] = [98.49, 25.02];

function inRing(px: number, py: number, pts: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0];
    const yi = pts[i][1];
    const xj = pts[j][0];
    const yj = pts[j][1];
    const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

type Props = {
  config: ChinaConfig;
  onPick?: (name: string | null) => void;
  onHover?: (name: string | null) => void;
};

export default function ChinaMap({ config, onPick, onHover }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef<() => void>(() => {});
  const rectRef = useRef<Rect>({ x: 0, y: 0, w: 1, h: 1, scale: 1 });
  const polysRef = useRef<Poly[]>([]);
  const hoverRef = useRef<string | null>(null);
  const pickRef = useRef(onPick);
  const hoverCbRef = useRef(onHover);
  pickRef.current = onPick;
  hoverCbRef.current = onHover;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d")!;

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
      const availH = cssH - PAD * 2;
      const bw = LON_MAX - LON_MIN;
      const bh = merc(LAT_MAX) - merc(LAT_MIN);
      const scale = Math.min(availW / bw, availH / bh);
      const w = bw * scale;
      const h = bh * scale;
      const x = (cssW - w) / 2;
      const y = (cssH - h) / 2;
      rectRef.current = { x, y, w, h, scale };

      const project = (lon: number, lat: number): [number, number] => [
        x + (lon - LON_MIN) * scale,
        y + (merc(LAT_MAX) - merc(lat)) * scale,
      ];

      // 海洋底色
      ctx.fillStyle = "#dceaf8";
      ctx.fillRect(x, y, w, h);

      // 省份
      const polys: Poly[] = [];
      for (const prov of CHINA_GEO.provinces) {
        const isHi = config.highlights.includes(prov.name);
        const isHover = hoverRef.current === prov.name;
        ctx.beginPath();
        const rings: Poly["rings"] = [];
        for (const ring of prov.rings) {
          const pts: [number, number][] = [];
          let minX = Infinity;
          let minY = Infinity;
          let maxX = -Infinity;
          let maxY = -Infinity;
          ring.forEach(([lon, lat], i) => {
            const p = project(lon, lat);
            pts.push(p);
            if (p[0] < minX) minX = p[0];
            if (p[1] < minY) minY = p[1];
            if (p[0] > maxX) maxX = p[0];
            if (p[1] > maxY) maxY = p[1];
            if (i === 0) ctx.moveTo(p[0], p[1]);
            else ctx.lineTo(p[0], p[1]);
          });
          ctx.closePath();
          rings.push({ pts, minX, minY, maxX, maxY });
        }
        polys.push({ name: prov.name, rings });

        ctx.fillStyle = isHi ? "#fbbf24" : isHover ? "#e6efff" : "#f2ecdc";
        ctx.strokeStyle = isHi ? "#b45309" : isHover ? "#2563eb" : "#c9bb9c";
        ctx.lineWidth = isHi ? 1.8 : 1;
        ctx.fill();
        ctx.stroke();
      }
      polysRef.current = polys;

      // 九段线
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 4]);
      for (const line of CHINA_GEO.jd) {
        ctx.beginPath();
        line.forEach(([lon, lat], i) => {
          const p = project(lon, lat);
          if (i === 0) ctx.moveTo(p[0], p[1]);
          else ctx.lineTo(p[0], p[1]);
        });
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // 黑河—腾冲线
      if (config.showLine) {
        const a = project(HEIHE[0], HEIHE[1]);
        const b = project(TENGCHONG[0], TENGCHONG[1]);
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#dc2626";
        ctx.font = "600 11px 'PingFang SC','Microsoft YaHei',sans-serif";
        ctx.fillText("黑河", a[0] + 6, a[1] - 6);
        ctx.fillText("腾冲", b[0] + 6, b[1] + 12);
      }

      // 四至
      if (config.showExtremes) {
        for (const e of EXTREMES) {
          const p = project(e.lon, e.lat);
          ctx.beginPath();
          ctx.arc(p[0], p[1], 4, 0, Math.PI * 2);
          ctx.fillStyle = "#ef4444";
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.font = "600 11px 'PingFang SC','Microsoft YaHei',sans-serif";
          ctx.fillStyle = "#7f1d1d";
          ctx.fillText(e.label, p[0] + e.dx, p[1] + e.dy);
        }
      }

      // 标记点
      for (const mk of config.markers) {
        const p = project(mk.lon, mk.lat);
        const color = mk.kind === "target" ? "#f97316" : "#0891b2";
        ctx.beginPath();
        ctx.arc(p[0], p[1], 6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
        if (mk.label) {
          ctx.font = "600 12px 'PingFang SC','Microsoft YaHei',sans-serif";
          ctx.fillStyle = "#0f172a";
          ctx.fillText(mk.label, p[0] + 10, p[1] + 4);
        }
      }

      // 简称
      if (config.showNames) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (const prov of CHINA_GEO.provinces) {
          const meta = PROVINCE_MAP.get(prov.name);
          if (!meta) continue;
          const p = project(prov.center[0], prov.center[1]);
          const off = LABEL_OFFSET[prov.name];
          const tx = p[0] + (off ? off[0] : 0);
          const ty = p[1] + (off ? off[1] : 0);
          if (off) {
            ctx.strokeStyle = "#b9a983";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p[0], p[1]);
            ctx.lineTo(tx, ty);
            ctx.stroke();
          }
          ctx.font = "600 11px 'PingFang SC','Microsoft YaHei',sans-serif";
          ctx.lineWidth = 3;
          ctx.strokeStyle = "rgba(255,255,255,0.85)";
          ctx.strokeText(meta.abbr, tx, ty);
          ctx.fillStyle = "#6b5a3c";
          ctx.fillText(meta.abbr, tx, ty);
        }
        ctx.textAlign = "start";
        ctx.textBaseline = "alphabetic";
      }

      // 悬停信息
      const hn = hoverRef.current;
      if (hn) {
        const meta = PROVINCE_MAP.get(hn);
        if (meta) {
          const text = `${meta.name} · 简称 ${meta.abbr} · ${meta.capital}`;
          ctx.font = "12px 'PingFang SC','Microsoft YaHei',sans-serif";
          const tw = ctx.measureText(text).width;
          const bx = x + 10;
          const by = y + 10;
          ctx.fillStyle = "rgba(255,255,255,0.92)";
          ctx.strokeStyle = "#cbd8e8";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(bx, by, tw + 20, 28, 8);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#12263f";
          ctx.fillText(text, bx + 10, by + 18);
        }
      }

      // 边框
      ctx.strokeStyle = "rgba(148,197,255,0.35)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    };

    drawRef.current = draw;
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [config]);

  const hitTest = (ev: { clientX: number; clientY: number }): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const px = ev.clientX - rect.left;
    const py = ev.clientY - rect.top;
    const r = rectRef.current;
    if (px < r.x || px > r.x + r.w || py < r.y || py > r.y + r.h) return null;
    for (const poly of polysRef.current) {
      for (const ring of poly.rings) {
        if (px < ring.minX || px > ring.maxX || py < ring.minY || py > ring.maxY) continue;
        if (inRing(px, py, ring.pts)) return poly.name;
      }
    }
    return null;
  };

  return (
    <div ref={wrapRef} className="flat-wrap">
      <canvas
        ref={canvasRef}
        className="flat-canvas"
        onPointerMove={(ev) => {
          const name = hitTest(ev);
          if (name !== hoverRef.current) {
            hoverRef.current = name;
            hoverCbRef.current?.(name);
            drawRef.current();
          }
        }}
        onPointerLeave={() => {
          if (hoverRef.current) {
            hoverRef.current = null;
            hoverCbRef.current?.(null);
            drawRef.current();
          }
        }}
        onClick={(ev) => {
          pickRef.current?.(hitTest(ev));
        }}
      />
    </div>
  );
}
