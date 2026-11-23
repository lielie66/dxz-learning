type Props = {
  highlight?: 1 | 2 | 3 | null;
};

const COLORS = {
  1: "#a78bfa",
  2: "#f59e0b",
  3: "#22c55e",
};

export default function TerrainProfile({ highlight = null }: Props) {
  const alpha = (n: 1 | 2 | 3) => (highlight === null || highlight === n ? 0.55 : 0.14);
  const stroke = (n: 1 | 2 | 3) => (highlight === null || highlight === n ? 1 : 0.3);

  return (
    <div className="terrain-wrap">
      <svg
        viewBox="0 0 900 380"
        className="terrain-svg"
        role="img"
        aria-label="我国地势三级阶梯剖面示意图"
      >
        {[0, 1000, 2000, 3000, 4000, 5000].map((h) => {
          const y = 330 - h * 0.055;
          return (
            <g key={h}>
              <line x1="34" y1={y} x2="866" y2={y} stroke="rgba(148,197,255,0.14)" strokeWidth="1" />
              <text x="28" y={y + 4} textAnchor="end" className="terrain-axis">
                {h === 0 ? "0" : `${h / 1000}km`}
              </text>
            </g>
          );
        })}

        {/* 三级阶梯 */}
        <path d="M40,330 L40,110 L266,110 L266,330 Z" fill={COLORS[1]} opacity={alpha(1)} />
        <path d="M266,330 L266,220 L574,220 L574,330 Z" fill={COLORS[2]} opacity={alpha(2)} />
        <path d="M574,330 L574,302 L860,302 L860,330 Z" fill={COLORS[3]} opacity={alpha(3)} />

        <path d="M40,110 L266,110" stroke={COLORS[1]} strokeWidth="3" opacity={stroke(1)} fill="none" />
        <path d="M266,220 L574,220" stroke={COLORS[2]} strokeWidth="3" opacity={stroke(2)} fill="none" />
        <path d="M574,302 L860,302" stroke={COLORS[3]} strokeWidth="3" opacity={stroke(3)} fill="none" />

        {/* 台阶标注 */}
        <text x="153" y="86" textAnchor="middle" className={highlight === 1 ? "terrain-label on" : "terrain-label"}>
          第一级阶梯
        </text>
        <text x="153" y="106" textAnchor="middle" className="terrain-sub">
          青藏高原 · 4000 米以上
        </text>

        <text x="420" y="196" textAnchor="middle" className={highlight === 2 ? "terrain-label on" : "terrain-label"}>
          第二级阶梯
        </text>
        <text x="420" y="216" textAnchor="middle" className="terrain-sub">
          高原、盆地 · 1000—2000 米
        </text>

        <text x="717" y="278" textAnchor="middle" className={highlight === 3 ? "terrain-label on" : "terrain-label"}>
          第三级阶梯
        </text>
        <text x="717" y="298" textAnchor="middle" className="terrain-sub">
          平原、丘陵 · 500 米以下
        </text>

        {/* 分界线 */}
        <line x1="266" y1="110" x2="266" y2="330" stroke="#c4b5fd" strokeWidth="1.5" strokeDasharray="5 4" />
        <text x="266" y="348" textAnchor="middle" className="terrain-boundary">
          昆仑山—祁连山—横断山
        </text>
        <line x1="574" y1="220" x2="574" y2="330" stroke="#fcd34d" strokeWidth="1.5" strokeDasharray="5 4" />
        <text x="574" y="348" textAnchor="middle" className="terrain-boundary">
          大兴安岭—太行山—巫山—雪峰山
        </text>

        {/* 东西方向 */}
        <text x="52" y="372" className="terrain-dir">西</text>
        <line x1="76" y1="367" x2="840" y2="367" stroke="rgba(148,197,255,0.35)" strokeWidth="1" />
        <polygon points="840,362 852,367 840,372" fill="rgba(148,197,255,0.55)" />
        <text x="856" y="372" textAnchor="end" className="terrain-dir">东</text>
      </svg>
      <p className="terrain-note">示意图：我国地势西高东低，呈三级阶梯状分布。</p>
    </div>
  );
}
