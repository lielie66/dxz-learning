type Props = {
  mode: "world" | "china" | "all";
};

type Event = { year: string; text: string; group: "world" | "china" };

const WORLD: Event[] = [
  { year: "1957", text: "苏联发射世界第一颗人造地球卫星", group: "world" },
  { year: "1961", text: "加加林乘“东方 1 号”首次进入太空", group: "world" },
  { year: "1969", text: "美国“阿波罗 11 号”首次载人登月", group: "world" },
];

const CHINA: Event[] = [
  { year: "1970", text: "“东方红一号”——中国第一颗人造卫星", group: "china" },
  { year: "2003", text: "“神舟五号”杨利伟，中国首次载人航天", group: "china" },
  { year: "2007", text: "“嫦娥一号”，中国首次月球探测", group: "china" },
  { year: "2020", text: "“天问一号”火星探测；“嫦娥五号”采样返回", group: "china" },
  { year: "2021", text: "“天和”核心舱发射，中国空间站开始建造", group: "china" },
  { year: "2022", text: "中国空间站全面建成", group: "china" },
];

export default function SpaceTimeline({ mode }: Props) {
  const events = mode === "world" ? WORLD : mode === "china" ? CHINA : [...WORLD, ...CHINA].sort((a, b) => Number(a.year) - Number(b.year));
  const top = 110;
  const bottom = 520;
  const gap = events.length > 1 ? (bottom - top) / (events.length - 1) : 0;

  return (
    <div className="timeline-wrap">
      <svg viewBox="0 0 900 570" className="timeline-svg" role="img" aria-label="太空探索时间轴">
        <text x="450" y="48" textAnchor="middle" className="tl-title">
          {mode === "world" ? "人类太空探索" : mode === "china" ? "中国航天之路" : "太空探索大事记"}
        </text>

        <line x1="280" y1={top - 20} x2="280" y2={bottom + 20} stroke="rgba(148,197,255,0.35)" strokeWidth="2" />

        {events.map((e, i) => {
          const y = top + i * gap;
          const color = e.group === "china" ? "#f97316" : "#60a5fa";
          return (
            <g key={e.year + e.text}>
              <circle cx="280" cy={y} r="7" fill={color} stroke="#0b1929" strokeWidth="2" />
              <text x="258" y={y + 5} textAnchor="end" className="tl-year" fill={color}>
                {e.year}
              </text>
              <text x="306" y={y + 5} className="tl-text">
                {e.text}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="tl-caption">
        蓝色为世界航天，橙色为中国航天。太空探索的意义：认识宇宙、开发资源、推动科技进步。
      </p>
    </div>
  );
}
