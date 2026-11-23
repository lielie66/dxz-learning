import { useEffect, useRef, useState } from "react";

export type ContourScene = "mountain" | "ridge" | "valley" | "slope" | "cliff";

type SceneMeta = { tab: string; title: string; text: string };

const SCENES: Record<ContourScene, SceneMeta> = {
  mountain: {
    tab: "① 山顶",
    title: "山顶：里面高，外面低",
    text: "山头像一个隆起的包。用几张等高度的水平面切它，俯视时就得到一圈圈闭合的等高线。往中心走，海拔升高。",
  },
  ridge: {
    tab: "② 山脊",
    title: "山脊：等高线凸向低处",
    text: "山脊是向低处伸出的高地，像一条凸起的脊背。等高线遇到脊背，会被推向坡下：山脊的 V 形尖端指向低海拔。",
  },
  valley: {
    tab: "③ 山谷",
    title: "山谷：等高线凸向高处",
    text: "山谷是向高处深入的低地，像在坡面上刻出一条沟。等高线遇到沟，会向坡上凹进去：山谷的 V 形尖端指向高海拔。水顺谷地往低处流。",
  },
  slope: {
    tab: "④ 陡坡与缓坡",
    title: "陡坡线密，缓坡线疏",
    text: "相邻两条线的海拔总差 50 米。坡越陡，走很短距离就升高 50 米，等高线挤得密；坡越缓，走很远才升高 50 米，等高线分得开。",
  },
  cliff: {
    tab: "⑤ 陡崖",
    title: "陡崖：多条线挤在一起",
    text: "地面近乎直立时，横向走很短就跨过许多高度，等高线高度密集，甚至重合。",
  },
};

const HEIGHT: Record<ContourScene, (x: number, y: number) => number> = {
  mountain: (x, y) => 70 + 400 * Math.exp(-((((x * 1.08) ** 2) + ((y * 0.96) ** 2)) / 0.58)),
  ridge: (x, y) => 300 + 155 * y + 105 * Math.exp(-Math.pow(Math.abs(x) / 0.35, 1.28)),
  valley: (x, y) => 300 + 155 * y - 105 * Math.exp(-Math.pow(Math.abs(x) / 0.35, 1.28)),
  slope: (x, y) => 250 + y * (125 + 270 * ((1 + Math.tanh(4 * x)) / 2)),
  cliff: (x, y) =>
    85 + 100 * (y + 1) + 230 / (1 + Math.exp(-((y - 0.035 * Math.sin(3 * x)) / 0.019))),
};

const LEVELS = [100, 150, 200, 250, 300, 350, 400, 450];
const GRID = 58;
const POINTS = Array.from({ length: GRID + 1 }, (_, j) =>
  Array.from({ length: GRID + 1 }, (_, i) => ({ x: -1 + (2 * i) / GRID, y: -1 + (2 * j) / GRID }))
);

type Point = { x: number; y: number };
type Segment = [Point, Point];
type XY = { x: number; y: number };

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function mix(a: number[], b: number[], t: number) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

function terrainRGB(z: number) {
  const t = clamp((z - 75) / 420, 0, 1);
  return t < 0.48
    ? mix([75, 150, 130], [156, 186, 130], t / 0.48)
    : mix([156, 186, 130], [223, 199, 146], (t - 0.48) / 0.52);
}

function terrainColor(z: number, shade = 0) {
  const rgb = terrainRGB(z).map((v) => clamp(Math.round(v + shade), 0, 255));
  return `rgb(${rgb.join(",")})`;
}

function contoursAt(f: (x: number, y: number) => number, level: number): Segment[] {
  const out: Segment[] = [];
  for (let j = 0; j < GRID; j++) {
    for (let i = 0; i < GRID; i++) {
      const a = POINTS[j][i];
      const b = POINTS[j][i + 1];
      const c = POINTS[j + 1][i + 1];
      const d = POINTS[j + 1][i];
      const v = [f(a.x, a.y), f(b.x, b.y), f(c.x, c.y), f(d.x, d.y)];
      const corners = [a, b, c, d];
      const hits: Point[] = [];
      for (let k = 0; k < 4; k++) {
        const n = (k + 1) % 4;
        if (v[k] < level !== v[n] < level) {
          const t = (level - v[k]) / (v[n] - v[k]);
          hits.push({
            x: corners[k].x + t * (corners[n].x - corners[k].x),
            y: corners[k].y + t * (corners[n].y - corners[k].y),
          });
        }
      }
      if (hits.length === 2) out.push([hits[0], hits[1]]);
      else if (hits.length === 4) out.push([hits[0], hits[1]], [hits[2], hits[3]]);
    }
  }
  return out;
}

function drawLines(
  ctx: CanvasRenderingContext2D,
  segments: Segment[],
  transform: (p: Point) => XY,
  width: number,
  stroke: string
) {
  ctx.beginPath();
  for (const [a, b] of segments) {
    const p = transform(a);
    const q = transform(b);
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(q.x, q.y);
  }
  ctx.lineWidth = width;
  ctx.strokeStyle = stroke;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fill = "#25545a",
  bg = "#fffdf8e8"
) {
  ctx.font = '700 12px system-ui, -apple-system, "Microsoft YaHei", sans-serif';
  const w = ctx.measureText(text).width + 16;
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(x - 6, y - 14, w, 21, 6);
  ctx.fill();
  ctx.fillStyle = fill;
  ctx.fillText(text, x + 2, y);
}

function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.strokeStyle = "#d6533d";
  ctx.fillStyle = "#d6533d";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 12 * Math.cos(a - 0.48), y2 - 12 * Math.sin(a - 0.48));
  ctx.lineTo(x2 - 12 * Math.cos(a + 0.48), y2 - 12 * Math.sin(a + 0.48));
  ctx.closePath();
  ctx.fill();
}

type Props = { scene?: ContourScene };

export default function ContourLab({ scene: initialScene = "mountain" }: Props) {
  const [scene, setScene] = useState<ContourScene>(initialScene);
  const [level, setLevel] = useState(300);
  const [hoverText, setHoverText] = useState("鼠标指向地图查看海拔");

  const terrainRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<HTMLCanvasElement>(null);
  const yaw = useRef(0.48);
  const elevation = useRef(0.75);
  const drag = useRef<{ x: number; y: number; yaw: number; elevation: number } | null>(null);

  useEffect(() => {
    const terrain = terrainRef.current;
    const map = mapRef.current;
    if (!terrain || !map) return;

    const f = HEIGHT[scene];
    let mapMetrics: { ox: number; oy: number; size: number } | null = null;

    const measure = (canvas: HTMLCanvasElement) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: rect.width, h: rect.height, ctx };
    };

    const project = (x: number, y: number, z: number, w: number, h: number): XY => {
      const s = Math.min(w * 0.33, h * 0.48);
      const c = Math.cos(yaw.current);
      const si = Math.sin(yaw.current);
      const e = Math.sin(elevation.current);
      const ce = Math.cos(elevation.current);
      return {
        x: w / 2 + s * (x * c + y * si),
        y: h * 0.63 + s * (x * si - y * c) * e - s * (z / 450) * ce * 1.12,
      };
    };

    const drawTerrain = () => {
      const m = measure(terrain);
      if (!m) return;
      const { w, h, ctx } = m;
      ctx.clearRect(0, 0, w, h);

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#eef7f3");
      grad.addColorStop(1, "#f7f4e9");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const cells: {
        a: Point;
        b: Point;
        c: Point;
        d: Point;
        cx: number;
        cy: number;
        depth: number;
      }[] = [];
      for (let j = 0; j < GRID; j++) {
        for (let i = 0; i < GRID; i++) {
          const a = POINTS[j][i];
          const b = POINTS[j][i + 1];
          const c = POINTS[j + 1][i + 1];
          const d = POINTS[j + 1][i];
          const cx = (a.x + c.x) / 2;
          const cy = (a.y + c.y) / 2;
          cells.push({
            a,
            b,
            c,
            d,
            cx,
            cy,
            depth: -cx * Math.sin(yaw.current) + cy * Math.cos(yaw.current),
          });
        }
      }
      cells.sort((p, q) => q.depth - p.depth);

      for (const cell of cells) {
        const { a, b, c, d, cx, cy } = cell;
        const pts = [a, b, c, d].map((v) => project(v.x, v.y, f(v.x, v.y), w, h));
        const dx = (f(cx + 0.018, cy) - f(cx - 0.018, cy)) / 0.036;
        const dy = (f(cx, cy + 0.018) - f(cx, cy - 0.018)) / 0.036;
        const shade = clamp(-dx * 0.11 + dy * 0.08, -28, 23);
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let k = 1; k < 4; k++) ctx.lineTo(pts[k].x, pts[k].y);
        ctx.closePath();
        ctx.fillStyle = terrainColor(f(cx, cy), shade);
        ctx.fill();
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = ctx.fillStyle;
        ctx.stroke();
      }

      const plane = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ].map(([x, y]) => project(x, y, level, w, h));
      ctx.beginPath();
      ctx.moveTo(plane[0].x, plane[0].y);
      for (let k = 1; k < 4; k++) ctx.lineTo(plane[k].x, plane[k].y);
      ctx.closePath();
      ctx.fillStyle = "rgba(74,177,187,.075)";
      ctx.fill();
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = "rgba(28,118,130,.53)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);

      for (const z of LEVELS) {
        const seg = contoursAt(f, z);
        const to = (p: Point) => project(p.x, p.y, z, w, h);
        drawLines(ctx, seg, to, z === level ? 6 : 2.5, "rgba(29,74,75,.24)");
        drawLines(
          ctx,
          seg,
          to,
          z === level ? 3.5 : 1.35,
          z === level ? "#ed654c" : "rgba(255,255,244,.89)"
        );
      }
      drawLabel(ctx, `切面 ${level} 米`, 14, 36, "#c8503b");
    };

    const drawMap = () => {
      const m = measure(map);
      if (!m) return;
      const { w, h, ctx } = m;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#f8f9ef";
      ctx.fillRect(0, 0, w, h);

      const size = Math.max(80, Math.min(w - 64, h - 50));
      const ox = (w - size) / 2;
      const oy = (h - size) / 2;
      const xy = (x: number, y: number): XY => ({
        x: ox + ((x + 1) * size) / 2,
        y: oy + ((1 - y) * size) / 2,
      });
      mapMetrics = { ox, oy, size };

      const cells = 48;
      const cell = size / cells;
      const bg = [248, 249, 239];
      for (let j = 0; j < cells; j++) {
        for (let i = 0; i < cells; i++) {
          const x = -1 + ((i + 0.5) * 2) / cells;
          const y = 1 - ((j + 0.5) * 2) / cells;
          const blended = mix(bg, terrainRGB(f(x, y)), 0.3).map((v) => Math.round(v));
          ctx.fillStyle = `rgb(${blended.join(",")})`;
          ctx.fillRect(ox + i * cell, oy + j * cell, cell + 1, cell + 1);
        }
      }

      ctx.strokeStyle = "#aac9ba";
      ctx.lineWidth = 1.3;
      ctx.strokeRect(ox, oy, size, size);

      for (const z of LEVELS) {
        const seg = contoursAt(f, z);
        const to = (p: Point) => xy(p.x, p.y);
        drawLines(ctx, seg, to, z === level ? 6.5 : 2.5, z === level ? "#fff9e8" : "rgba(255,253,244,.92)");
        drawLines(ctx, seg, to, z === level ? 3.4 : 1.45, z === level ? "#e85f48" : "#426f6b");
      }
      drawLabel(ctx, `${level} 米`, ox + 10, oy + 24, "#c8503b");

      if (scene === "ridge" || scene === "valley") {
        const sign = scene === "ridge" ? 1 : -1;
        const tip = (level - 300 - sign * 105) / 155;
        const side = (level - 300) / 155;
        if (tip > -0.83 && tip < 0.83) {
          const start = xy(0.15, side);
          const end = xy(0.15, tip);
          drawArrow(ctx, start.x, start.y, end.x, end.y);
          const label = scene === "ridge" ? "凸向低处" : "凸向高处";
          drawLabel(
            ctx,
            label,
            clamp(end.x + 15, ox + 15, ox + size - 92),
            clamp(end.y + (scene === "ridge" ? 22 : -9), oy + 26, oy + size - 11),
            "#c8503b"
          );
        }
        drawLabel(ctx, "高处 ↑", ox + size - 72, oy + 25);
        drawLabel(ctx, "低处 ↓", ox + size - 72, oy + size - 10);
      } else if (scene === "slope") {
        drawLabel(ctx, "缓坡 · 线疏", ox + 10, oy + size - 12);
        drawLabel(ctx, "陡坡 · 线密", ox + size - 108, oy + size - 12);
      } else if (scene === "cliff") {
        drawLabel(ctx, "陡崖：多条线密集", ox + size / 2 - 70, oy + size / 2 - 12, "#a94835");
      } else {
        const p = xy(0, 0.76);
        drawLabel(ctx, "向中心升高", p.x - 44, p.y);
      }

      ctx.fillStyle = "#577470";
      ctx.font = '12px system-ui, -apple-system, "Microsoft YaHei", sans-serif';
      ctx.fillText("50 米 / 条", ox + 8, oy + size + 18);
    };

    const render = () => {
      drawTerrain();
      drawMap();
    };

    const onDown = (e: PointerEvent) => {
      drag.current = {
        x: e.clientX,
        y: e.clientY,
        yaw: yaw.current,
        elevation: elevation.current,
      };
      terrain.setPointerCapture(e.pointerId);
      terrain.classList.add("dragging");
    };

    const onMove = (e: PointerEvent) => {
      if (!drag.current) return;
      yaw.current = drag.current.yaw + (e.clientX - drag.current.x) * 0.009;
      elevation.current = clamp(
        drag.current.elevation - (e.clientY - drag.current.y) * 0.006,
        0.38,
        1.42
      );
      drawTerrain();
    };

    const stop = () => {
      drag.current = null;
      terrain.classList.remove("dragging");
    };

    const onMapMove = (e: PointerEvent) => {
      if (!mapMetrics) return;
      const rect = map.getBoundingClientRect();
      const x = (e.clientX - rect.left - mapMetrics.ox) / mapMetrics.size;
      const y = (e.clientY - rect.top - mapMetrics.oy) / mapMetrics.size;
      setHoverText(
        x >= 0 && x <= 1 && y >= 0 && y <= 1
          ? `这里约 ${Math.round(f(2 * x - 1, 1 - 2 * y))} 米`
          : "鼠标指向地图查看海拔"
      );
    };

    const onMapLeave = () => setHoverText("鼠标指向地图查看海拔");

    terrain.addEventListener("pointerdown", onDown);
    terrain.addEventListener("pointermove", onMove);
    terrain.addEventListener("pointerup", stop);
    terrain.addEventListener("pointercancel", stop);
    map.addEventListener("pointermove", onMapMove);
    map.addEventListener("pointerleave", onMapLeave);

    const observer = new ResizeObserver(render);
    observer.observe(terrain);
    observer.observe(map);
    render();

    return () => {
      observer.disconnect();
      terrain.removeEventListener("pointerdown", onDown);
      terrain.removeEventListener("pointermove", onMove);
      terrain.removeEventListener("pointerup", stop);
      terrain.removeEventListener("pointercancel", stop);
      map.removeEventListener("pointermove", onMapMove);
      map.removeEventListener("pointerleave", onMapLeave);
    };
  }, [scene, level]);

  return (
    <div className="contourlab">
      <div className="contourlab-card">
        <div className="contourlab-head">
          <div>
            <div className="contourlab-eyebrow">七年级地理 · 动手观察</div>
            <h2 className="contourlab-title">把山从上往下看</h2>
          </div>
          <div className="contourlab-tabs" role="tablist" aria-label="选择地形部位">
            {(Object.keys(SCENES) as ContourScene[]).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={scene === key}
                className={scene === key ? "on" : ""}
                onClick={() => setScene(key)}
              >
                {SCENES[key].tab}
              </button>
            ))}
          </div>
        </div>

        <div className="contourlab-stage">
          <article className="contourlab-panel">
            <div className="contourlab-panelhead">
              <h3>立体地形</h3>
              <span>拖动旋转 · 上下拖动改变俯视角</span>
            </div>
            <div className="contourlab-viewport">
              <canvas
                ref={terrainRef}
                className="contourlab-canvas contourlab-terrain"
                aria-label="可拖动旋转的三维地形示意图"
              />
            </div>
          </article>

          <article className="contourlab-panel">
            <div className="contourlab-panelhead">
              <h3>平面等高线图</h3>
              <span>从正上方往下看</span>
            </div>
            <div className="contourlab-viewport">
              <canvas ref={mapRef} className="contourlab-canvas" aria-label="与左侧地形同步的平面等高线地图" />
              <div className="contourlab-hover">{hoverText}</div>
            </div>
          </article>
        </div>

        <div className="contourlab-controls">
          <label htmlFor="contour-level">切面高度</label>
          <input
            id="contour-level"
            type="range"
            min={100}
            max={450}
            step={50}
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
          />
          <output className="contourlab-level">{level} 米</output>
          <span className="contourlab-legend">
            <i />
            珊瑚色 = 当前切出的等高线
          </span>
        </div>

        <div className="contourlab-conclusion" aria-live="polite">
          <span className="contourlab-tag">观察结论</span>
          <strong>{SCENES[scene].title}</strong>
          <p>{SCENES[scene].text}</p>
        </div>
      </div>
    </div>
  );
}
