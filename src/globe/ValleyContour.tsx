import { useState } from "react";

/**
 * 用“水位”解释山谷等高线为什么凸向高处：
 * 水面与谷底的交点，水位越高越靠上游；等高线的 V 尖就是这个交点。
 */
export default function ValleyContour() {
  const [level, setLevel] = useState(55);

  // 谷底剖面：左高（上游）右低（下游）
  const floorX = (y: number) => 100 + ((y - 395) / 85) * 700;

  const waterY = 470 - (level / 100) * 60; // 410..470
  const hitX = Math.min(760, Math.max(140, floorX(waterY)));

  const contours = [
    { y: 415, label: "300 米", x: 265 },
    { y: 435, label: "200 米", x: 430 },
    { y: 455, label: "100 米", x: 595 },
  ];
  const nearest = contours.reduce((a, b) =>
    Math.abs(b.y - waterY) < Math.abs(a.y - waterY) ? b : a
  );

  return (
    <div className="valley-wrap">
      <svg viewBox="0 0 900 620" className="valley-svg" role="img" aria-label="水位与山谷等高线">
        {/* 俯视图 */}
        <rect x="60" y="50" width="780" height="280" rx="14" fill="#fbf7ec" stroke="#d6c9ab" />
        <text x="90" y="82" className="valley-note">俯视：山谷里的等高线</text>
        <text x="90" y="108" className="valley-arrow">← 高处（上游）</text>
        <text x="810" y="108" textAnchor="end" className="valley-arrow">低处（下游） →</text>

        {/* 河道 */}
        <line x1="120" y1="220" x2="780" y2="220" stroke="#2563eb" strokeWidth="3" />
        <polygon points="780,220 766,213 766,227" fill="#2563eb" />
        <text x="700" y="206" className="valley-small">河流</text>

        {/* 三条静态等高线，V 尖朝左（上游） */}
        {contours.map((c) => (
          <g key={c.label} opacity={c.label === nearest.label ? 0.25 : 0.55}>
            <path d={`M${c.x},220 L${c.x + 110},110`} fill="none" stroke="#b45309" strokeWidth="1.4" />
            <path d={`M${c.x},220 L${c.x + 110},330`} fill="none" stroke="#b45309" strokeWidth="1.4" />
            <text x={c.x + 12} y="306" className="valley-small">
              {c.label}
            </text>
          </g>
        ))}

        {/* 当前水位对应的等高线 */}
        <path d={`M${hitX},220 L${hitX + 110},110`} fill="none" stroke="#dc2626" strokeWidth="3" />
        <path d={`M${hitX},220 L${hitX + 110},330`} fill="none" stroke="#dc2626" strokeWidth="3" />
        <circle cx={hitX} cy={220} r="5" fill="#dc2626" />
        <text x={hitX + 118} y="300" className="valley-red">
          当前等高线 ≈ {nearest.label}
        </text>

        {/* 剖面 */}
        <rect x="60" y="350" width="780" height="210" rx="14" fill="#f5efe0" stroke="#d6c9ab" />
        <text x="90" y="382" className="valley-note">剖面：沿着河流切开看</text>

        <line x1="100" y1="395" x2="800" y2="480" stroke="#8b5a2b" strokeWidth="3" />
        <text x="110" y="388" className="valley-small">谷底（上游高）</text>
        <text x="790" y="476" textAnchor="end" className="valley-small">谷底（下游低）</text>

        {/* 水位线 */}
        <line x1="100" y1={waterY} x2="800" y2={waterY} stroke="#2563eb" strokeWidth="2" strokeDasharray="6 4" />
        <text x="806" y={waterY + 4} className="valley-blue">水位</text>
        <circle cx={hitX} cy={waterY} r="6" fill="#dc2626" stroke="#fff" strokeWidth="2" />

        {/* 俯视与剖面的连线 */}
        <line x1={hitX} y1={waterY} x2={hitX} y2="300" stroke="#dc2626" strokeWidth="1.2" strokeDasharray="4 4" />
        <text x={hitX + 8} y={waterY - 10} className="valley-red">同一高度</text>

        <text x="90" y="540" className="valley-note">
          水位越高，交点越靠上游（左）；水位越低，交点越靠下游（右）。
        </text>
        <text x="90" y="566" className="valley-red">
          所以山谷的等高线，V 尖总是指向高处（上游）。
        </text>
        <text x="90" y="592" className="valley-note">
          山脊正好相反：等高线凸向低处（下游），V 尖指向下坡。
        </text>
      </svg>

      <div className="valley-controls">
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
    </div>
  );
}
