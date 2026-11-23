type Props = {
  mode: "shape" | "zones";
};

const ZONES = [
  { y1: -90, y2: -66.5, name: "南寒带", color: "#93c5fd" },
  { y1: -66.5, y2: -23.5, name: "南温带", color: "#86efac" },
  { y1: -23.5, y2: 23.5, name: "热带", color: "#fdba74" },
  { y1: 23.5, y2: 66.5, name: "北温带", color: "#86efac" },
  { y1: 66.5, y2: 90, name: "北寒带", color: "#93c5fd" },
];

export default function EarthBasics({ mode }: Props) {
  if (mode === "shape") {
    return (
      <div className="earth-wrap">
        <svg viewBox="0 0 900 560" className="earth-svg" role="img" aria-label="地球的形状和大小">
          <ellipse cx="440" cy="300" rx="240" ry="200" fill="#bfe0fb" stroke="#60a5fa" strokeWidth="2" />
          <ellipse cx="440" cy="300" rx="240" ry="200" fill="none" stroke="#dbeafe" strokeWidth="1" strokeDasharray="4 4" />
          <ellipse cx="440" cy="300" rx="240" ry="185" fill="none" stroke="#93c5fd" strokeWidth="1.2" strokeDasharray="3 5" />
          <line x1="440" y1="300" x2="680" y2="300" stroke="#f97316" strokeWidth="2" />
          <circle cx="440" cy="300" r="4" fill="#f97316" />
          <text x="560" y="324" textAnchor="middle" className="earth-note-dark">
            平均半径 6371 千米
          </text>

          <path d="M200 300 A240 200 0 0 0 680 300" fill="none" stroke="#2563eb" strokeWidth="3" />
          <text x="440" y="536" textAnchor="middle" className="earth-note" fill="#93c5fd">
            赤道周长约 4 万千米
          </text>

          <text x="440" y="36" textAnchor="middle" className="earth-title">
            两极稍扁、赤道略鼓的不规则椭球体
          </text>
        </svg>
        <p className="earth-caption">证据：远航船只先见桅杆、登高望远、月食、麦哲伦环球航行、卫星照片。</p>
      </div>
    );
  }

  const cx = 330;
  const cy = 280;
  const r = 220;
  const yOf = (lat: number) => cy - r * Math.sin((lat * Math.PI) / 180);

  return (
    <div className="earth-wrap">
      <svg viewBox="0 0 900 560" className="earth-svg" role="img" aria-label="地球五带划分">
        <defs>
          <clipPath id="earthClip">
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="#dbeafe" stroke="#60a5fa" strokeWidth="2" />
        <g clipPath="url(#earthClip)">
          {ZONES.map((z) => {
            const y1 = yOf(z.y1);
            const y2 = yOf(z.y2);
            return (
              <rect
                key={z.name}
                x={cx - r}
                y={Math.min(y1, y2)}
                width={r * 2}
                height={Math.abs(y2 - y1)}
                fill={z.color}
                opacity="0.55"
              />
            );
          })}
          {[-66.5, -23.5, 0, 23.5, 66.5].map((lat) => (
            <line
              key={lat}
              x1={cx - r}
              y1={yOf(lat)}
              x2={cx + r}
              y2={yOf(lat)}
              stroke={lat === 0 ? "#ef4444" : "#475569"}
              strokeWidth={lat === 0 ? 2.5 : 1.4}
              strokeDasharray={lat === 0 ? "" : "5 4"}
            />
          ))}
        </g>

        {[
          { lat: 0, text: "赤道 0°" },
          { lat: 23.5, text: "北回归线 23.5°N" },
          { lat: -23.5, text: "南回归线 23.5°S" },
          { lat: 66.5, text: "北极圈 66.5°N" },
          { lat: -66.5, text: "南极圈 66.5°S" },
        ].map((l) => (
          <text key={l.text} x={cx + r + 16} y={yOf(l.lat) + 4} className="earth-axis">
            {l.text}
          </text>
        ))}

        {ZONES.map((z) => {
          const mid = (z.y1 + z.y2) / 2;
          return (
            <text
              key={z.name + "label"}
              x={cx - r - 18}
              y={yOf(mid) + 4}
              textAnchor="end"
              className="earth-zone"
            >
              {z.name}
            </text>
          );
        })}

        <text x={cx} y={cy - r - 22} textAnchor="middle" className="earth-title">
          五带的划分
        </text>
        <text x={cx} y={cy + r + 34} textAnchor="middle" className="earth-sub">
          回归线是热带与温带的分界，极圈是温带与寒带的分界
        </text>
      </svg>
    </div>
  );
}
