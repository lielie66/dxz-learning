import { useState } from "react";

type Mode = "valley" | "ridge";

/**
 * 用水位解释等高线凸向：
 * 水面与谷底/山脊的交点，水位越高越靠上游。
 * 山谷：V 尖指向高处（上游）；山脊：V 尖指向低处（下游）。
 */
export default function ValleyContour() {
  const [mode, setMode] = useState<Mode>("valley");
  const [level, setLevel] = useState(55);

  const floorX = (y: number) => 100 + ((y - 395) / 85) * 700;
  const waterY = 470 - (level / 100) * 60;
  const hitX = Math.min(760, Math.max(140, floorX(waterY)));

  const contours = [
    { y: 415, label: "300 米", x: 265 },
    { y: 435, label: "200 米", x: 430 },
    { y: 455, label: "100 米", x: 595 },
  ];
  const nearest = contours.reduce((a, b) =>
    Math.abs(b.y - waterY) < Math.abs(a.y - waterY) ? b : a
  );

  const dir: 1 | -1 = mode === "valley" ? -1 : 1; // 山谷 V 尖朝左，山脊 V 尖朝右

  const chevron = (x: number, stroke: string, width: number, opacity = 1) => {
    const armX = x - dir * 110;
    return (
      <g opacity={opacity}>
        <path d={`M${x},220 L${armX},110`} stroke={stroke} strokeWidth={width} fill="none" />
        <path d={`M${x},220 L${armX},325`} stroke={stroke} strokeWidth={width} fill="none" />
      </g>
    );
  };

  return (
    <div className="valley-wrap">
      <svg viewBox="0 0 900 580" className="valley-svg" role="img" aria-label="水位与等高线">
        {/* 俯视图 */}
        <rect x="60" y="50" width="780" height="280" rx="14" fill="#fbf7ec" stroke="#d6c9ab" />
        <text x="90" y="82" className="valley-note">
          {mode === "valley" ? "俯视：山谷里的等高线" : "俯视：山脊上的等高线"}
        </text>
        <text x="90" y="108" className="valley-arrow">← 高处（上游）</text>
        <text x="810" y="108" textAnchor="end" className="valley-arrow">低处（下游） →</text>
        <text x="810" y="82" textAnchor="end" className="valley-red">
          当前水位 ≈ {nearest.label}
        </text>

        {mode === "valley" ? (
          <>
            <line x1="120" y1="220" x2="780" y2="220" stroke="#2563eb" strokeWidth="3" />
            <polygon points="780,220 766,213 766,227" fill="#2563eb" />
            <text x="700" y="206" className="valley-small">河流</text>
          </>
        ) : (
          <>
            <rect x="120" y="190" width="660" height="60" rx="30" fill="rgba(180,83,9,0.12)" />
            <line x1="120" y1="220" x2="780" y2="220" stroke="#b45309" strokeWidth="1.4" strokeDasharray="6 4" opacity="0.6" />
            <text x="690" y="206" className="valley-small">山脊线</text>
          </>
        )}

        {/* 三条静态等高线 */}
        {contours.map((c) => (
          <g key={c.label} opacity={c.label === nearest.label ? 0.22 : 0.55}>
            {chevron(c.x, "#b45309", 1.4)}
            <text x={c.x} y="322" textAnchor="middle" className="valley-small">
              {c.label}
            </text>
          </g>
        ))}

        {/* 当前水位的等高线 */}
        {chevron(hitX, "#dc2626", 3)}
        <circle cx={hitX} cy={220} r="5" fill="#dc2626" />
        <text
          x={hitX + (dir === 1 ? 14 : -14)}
          y="254"
          textAnchor={dir === 1 ? "start" : "end"}
          className="valley-red"
        >
          V 尖 → {mode === "valley" ? "高处" : "低处"}
        </text>
        <text x="90" y="300" className="valley-small">
          {mode === "valley"
            ? "两条支线在交叉点的下游张开，V 尖朝上游"
            : "两条支线在交叉点的上游张开，V 尖朝下游"}
        </text>

        {/* 剖面 */}
        <rect x="60" y="350" width="780" height="210" rx="14" fill="#f5efe0" stroke="#d6c9ab" />
        <text x="90" y="382" className="valley-note">
          {mode === "valley" ? "剖面：沿着河流切开看" : "剖面：沿着山脊切开看"}
        </text>

        <line x1="100" y1="395" x2="800" y2="480" stroke="#8b5a2b" strokeWidth="3" />
        <text x="110" y="388" className="valley-small">
          {mode === "valley" ? "谷底（上游高）" : "山脊（上游高）"}
        </text>
        <text x="790" y="476" textAnchor="end" className="valley-small">
          {mode === "valley" ? "谷底（下游低）" : "山脊（下游低）"}
        </text>

        <line x1="100" y1={waterY} x2="800" y2={waterY} stroke="#2563eb" strokeWidth="2" strokeDasharray="6 4" />
        <text x="806" y={waterY + 4} className="valley-blue">水位</text>
        <circle cx={hitX} cy={waterY} r="6" fill="#dc2626" stroke="#fff" strokeWidth="2" />
        <line x1={hitX} y1={waterY} x2={hitX} y2="300" stroke="#dc2626" strokeWidth="1.2" strokeDasharray="4 4" />
        <text x={hitX + 8} y={waterY - 10} className="valley-red">同一高度</text>
      </svg>

      <div className="valley-controls">
        <div className="valley-mode">
          <button className={mode === "valley" ? "on" : ""} onClick={() => setMode("valley")}>
            山谷
          </button>
          <button className={mode === "ridge" ? "on" : ""} onClick={() => setMode("ridge")}>
            山脊
          </button>
        </div>
        <span>水位</span>
        <input
          type="range"
          min="0"
          max="100"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
        />
        <span className="valley-level">{level < 34 ? "低" : level < 67 ? "中" : "高"}</span>
      </div>

      <p className="valley-summary">
        {mode === "valley"
          ? "山谷：等高线的 V 尖指向高处（上游）。水位越高，等高线越靠上游。"
          : "山脊：等高线的 V 尖指向低处（下游）。等高线绕过山脊，开口朝上游。"}
      </p>
    </div>
  );
}
