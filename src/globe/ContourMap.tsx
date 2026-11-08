type Feature = "peak" | "saddle" | "cliff" | "ridge" | "valley";

type Props = {
  highlight?: Feature | null;
};

const LEVELS_A = [
  [30, 20],
  [55, 38],
  [80, 58],
  [110, 80],
  [140, 100],
];
const LEVELS_B = [
  [32, 22],
  [58, 42],
  [85, 62],
  [115, 85],
  [145, 105],
];

function Contours({ cx, cy, levels }: { cx: number; cy: number; levels: number[][] }) {
  return (
    <>
      {levels.map(([rx, ry], i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          stroke="#b45309"
          strokeWidth={i === 0 ? 1.8 : 1.2}
          transform={`rotate(-8 ${cx} ${cy})`}
        />
      ))}
    </>
  );
}

function Label({
  x,
  y,
  text,
  active,
  anchor = "start",
}: {
  x: number;
  y: number;
  text: string;
  active: boolean;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      className={active ? "contour-label on" : "contour-label"}
    >
      {text}
    </text>
  );
}

export default function ContourMap({ highlight = null }: Props) {
  const on = (f: Feature) => highlight === null || highlight === f;
  return (
    <div className="contour-wrap">
      <svg viewBox="0 0 900 560" className="contour-svg" role="img" aria-label="等高线地形图">
        <rect x="40" y="30" width="820" height="500" rx="14" fill="#fbf7ec" stroke="#d6c9ab" />

        <Contours cx={300} cy={210} levels={LEVELS_A} />
        <Contours cx={600} cy={230} levels={LEVELS_B} />

        {/* 两山顶之间的山脊线（鞍部在中间） */}
        <line x1="300" y1="210" x2="600" y2="230" stroke="#b45309" strokeWidth="1" strokeDasharray="6 4" opacity="0.45" />

        {/* 陡崖：等高线密集重合 */}
        <g stroke="#92400e" strokeWidth="1.6">
          <path d="M765,235 C770,270 768,300 764,330" fill="none" />
          <path d="M775,240 C780,272 778,302 774,328" fill="none" />
          <path d="M785,246 C789,276 787,304 783,326" fill="none" />
          <path d="M795,252 C798,280 796,306 792,324" fill="none" />
        </g>
        <path d="M760,330 l8,-10 l8,10 l8,-10 l8,10" stroke="#92400e" strokeWidth="1.5" fill="none" />

        {/* 山谷与河流 */}
        <path
          d="M452,268 C446,320 458,370 450,420 C444,465 452,500 448,528"
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <polygon points="448,528 441,514 455,514" fill="#2563eb" />
        <path d="M405,300 L450,276 L495,300" fill="none" stroke="#b45309" strokeWidth="1.2" />
        <path d="M410,350 L450,326 L490,350" fill="none" stroke="#b45309" strokeWidth="1.2" />
        <path d="M414,400 L450,376 L486,400" fill="none" stroke="#b45309" strokeWidth="1.2" />

        {/* 山脊：等高线凸向低处 */}
        <path d="M250,250 C220,300 205,340 190,380" fill="none" stroke="#b45309" strokeWidth="1.2" strokeDasharray="5 4" />

        {/* 标记点 */}
        <circle cx="300" cy="210" r="5" fill="#dc2626" />
        <circle cx="600" cy="230" r="5" fill="#dc2626" />
        <circle cx="452" cy="262" r="5" fill="#7c3aed" />
        <circle cx="775" cy="300" r="5" fill="#92400e" />
        <circle cx="208" cy="330" r="5" fill="#0891b2" />
        <circle cx="450" cy="420" r="5" fill="#2563eb" />

        <Label x={300} y={188} text="A 山顶" active={on("peak")} anchor="middle" />
        <Label x={600} y={208} text="B 山顶" active={on("peak")} anchor="middle" />
        <Label x={470} y={252} text="C 鞍部" active={on("saddle")} />
        <Label x={805} y={296} text="D 陡崖" active={on("cliff")} />
        <Label x={150} y={392} text="E 山脊" active={on("ridge")} />
        <Label x={472} y={430} text="F 山谷（有河流）" active={on("valley")} />

        <text x={70} y={70} className="contour-note">等高距 100 米</text>
        <text x={70} y={94} className="contour-note">稀疏 = 缓坡，密集 = 陡坡</text>
        <text x={70} y={498} className="contour-note">由外向内：100、200、300、400、500 米</text>
        <text x={70} y={518} className="contour-note">等高线凸向高处为山谷，凸向低处为山脊</text>
      </svg>
      <p className="contour-caption">示意图：A、B 两座山峰，C 为鞍部，D 为陡崖，E 为山脊，F 为山谷。</p>
    </div>
  );
}
