type Props = {
  highlight?: string | null;
};

const PLANETS = [
  { name: "水星", r: 52, angle: 20, size: 3.5 },
  { name: "金星", r: 72, angle: 95, size: 5 },
  { name: "地球", r: 94, angle: 160, size: 5.5 },
  { name: "火星", r: 116, angle: 225, size: 4.5 },
  { name: "木星", r: 160, angle: 275, size: 10 },
  { name: "土星", r: 196, angle: 320, size: 9 },
  { name: "天王星", r: 228, angle: 35, size: 7 },
  { name: "海王星", r: 256, angle: 140, size: 7 },
];

export default function SolarSystem({ highlight = null }: Props) {
  const cx = 440;
  const cy = 285;
  const on = (name: string) => highlight === null || highlight === name;

  return (
    <div className="solar-wrap">
      <svg viewBox="0 0 900 570" className="solar-svg" role="img" aria-label="太阳系示意图">
        {PLANETS.map((p) => (
          <circle
            key={"orbit" + p.name}
            cx={cx}
            cy={cy}
            r={p.r}
            fill="none"
            stroke="rgba(148,197,255,0.18)"
            strokeWidth="1"
          />
        ))}
        <circle
          cx={cx}
          cy={cy}
          r={136}
          fill="none"
          stroke="rgba(148,197,255,0.35)"
          strokeWidth="3"
          strokeDasharray="2 7"
        />

        <circle cx={cx} cy={cy} r="26" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
        <text x={cx} y={cy + 4} textAnchor="middle" className="solar-sun">太阳</text>

        {PLANETS.map((p) => {
          const a = (p.angle * Math.PI) / 180;
          const px = cx + Math.cos(a) * p.r;
          const py = cy + Math.sin(a) * p.r;
          const lx = cx + Math.cos(a) * (p.r + 22);
          const ly = cy + Math.sin(a) * (p.r + 22);
          const isEarth = p.name === "地球";
          return (
            <g key={p.name} opacity={on(p.name) ? 1 : 0.25}>
              <circle
                cx={px}
                cy={py}
                r={p.size}
                fill={isEarth ? "#22c55e" : p.name === "火星" ? "#ef4444" : "#93c5fd"}
              />
              {isEarth && hintRing(px, py)}
              <text x={lx} y={ly + 4} textAnchor="middle" className={isEarth ? "solar-label earth" : "solar-label"}>
                {p.name}
              </text>
            </g>
          );
        })}

        <text x={80} y={70} className="solar-note">
          小行星带位于火星和木星之间
        </text>
        <text x={80} y={96} className="solar-note">
          八大行星自近及远：水星、金星、地球、火星、木星、土星、天王星、海王星
        </text>
        <text x={80} y={122} className="solar-note">
          示意图，行星大小和轨道距离未按真实比例
        </text>
      </svg>
    </div>
  );
}

function hintRing(x: number, y: number) {
  return <circle cx={x} cy={y} r="13" fill="none" stroke="#22c55e" strokeWidth="2" opacity="0.7" />;
}
