type Props = {
  mode: "scale" | "direction" | "legend";
};

export default function MapBasics({ mode }: Props) {
  if (mode === "scale") {
    return (
      <div className="map-basics">
        <svg viewBox="0 0 900 540" className="map-svg" role="img" aria-label="地图的比例尺">
          <text x="450" y="46" textAnchor="middle" className="mb-title">
            比例尺 = 图上距离 ÷ 实地距离
          </text>

          <g>
            <rect x="80" y="90" width="320" height="150" rx="10" fill="#f2ecdc" stroke="#c9bb9c" />
            <text x="240" y="130" textAnchor="middle" className="mb-strong" fill="#7c2d12">世界地图</text>
            <text x="240" y="162" textAnchor="middle" className="mb-sub" fill="#8a6a3a">比例尺小</text>
            <text x="240" y="190" textAnchor="middle" className="mb-sub" fill="#8a6a3a">范围大 · 内容简略</text>
          </g>
          <g>
            <rect x="500" y="90" width="320" height="150" rx="10" fill="#f2ecdc" stroke="#c9bb9c" />
            <text x="660" y="130" textAnchor="middle" className="mb-strong" fill="#7c2d12">中国地图</text>
            <text x="660" y="162" textAnchor="middle" className="mb-sub" fill="#8a6a3a">比例尺大</text>
            <text x="660" y="190" textAnchor="middle" className="mb-sub" fill="#8a6a3a">范围小 · 内容详细</text>
          </g>
          <text x="450" y="270" textAnchor="middle" className="mb-note">
            图幅相同：比例尺越小 → 表示范围越大 → 内容越简略
          </text>

          <g transform="translate(90,320)">
            <text x="0" y="0" className="mb-strong">数字式</text>
            <text x="0" y="28" className="mb-sub">1 : 100 000</text>
            <text x="0" y="66" className="mb-strong">文字式</text>
            <text x="0" y="94" className="mb-sub">图上 1 厘米代表实地 1 千米</text>
            <text x="0" y="132" className="mb-strong">线段式</text>
            <line x1="0" y1="158" x2="240" y2="158" stroke="#f59e0b" strokeWidth="3" />
            <line x1="0" y1="150" x2="0" y2="166" stroke="#f59e0b" strokeWidth="3" />
            <line x1="120" y1="150" x2="120" y2="166" stroke="#f59e0b" strokeWidth="3" />
            <line x1="240" y1="150" x2="240" y2="166" stroke="#f59e0b" strokeWidth="3" />
            <text x="0" y="184" textAnchor="middle" className="mb-sub">0</text>
            <text x="120" y="184" textAnchor="middle" className="mb-sub">1 千米</text>
            <text x="240" y="184" textAnchor="middle" className="mb-sub">2 千米</text>
          </g>

          <g transform="translate(470,330)">
            <text x="0" y="0" className="mb-strong">换算口诀</text>
            <text x="0" y="30" className="mb-sub">1 千米 = 100 000 厘米</text>
            <text x="0" y="58" className="mb-sub">厘米换千米：去掉 5 个 0</text>
            <text x="0" y="86" className="mb-sub">比例尺是分式，分母越大，比例尺越小</text>
          </g>
        </svg>
      </div>
    );
  }

  if (mode === "direction") {
    return (
      <div className="map-basics">
        <svg viewBox="0 0 900 540" className="map-svg" role="img" aria-label="地图的方向">
          <g transform="translate(200,280)">
            <circle r="110" fill="none" stroke="#94a3b8" strokeWidth="2" />
            <polygon points="0,-140 18,-80 0,-96 -18,-80" fill="#ef4444" />
            <text x="0" y="-150" textAnchor="middle" className="mb-strong">北 N</text>
            <text x="0" y="166" textAnchor="middle" className="mb-sub">南 S</text>
            <text x="130" y="6" className="mb-sub">东 E</text>
            <text x="-130" y="6" textAnchor="end" className="mb-sub">西 W</text>
            <line x1="0" y1="-80" x2="0" y2="120" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="-120" y1="0" x2="120" y2="0" stroke="#cbd5e1" strokeWidth="1" />
          </g>
          <text x="200" y="466" textAnchor="middle" className="mb-sub">有指向标：箭头一般指向北方</text>

          <g transform="translate(470,120)">
            <text x="0" y="0" className="mb-strong">没有指向标：上北下南，左西右东</text>
            <rect x="0" y="30" width="300" height="180" rx="8" fill="#f8fafc" stroke="#cbd5e1" />
            <text x="150" y="22" textAnchor="middle" className="mb-sub">北</text>
            <text x="150" y="230" textAnchor="middle" className="mb-sub" fill="#1e293b">南</text>
            <text x="-8" y="126" textAnchor="end" className="mb-sub">西</text>
            <text x="308" y="126" className="mb-sub">东</text>
            <circle cx="90" cy="90" r="6" fill="#2563eb" />
            <text x="102" y="94" className="mb-sub" fill="#1e293b">A</text>
            <circle cx="220" cy="150" r="6" fill="#2563eb" />
            <text x="232" y="154" className="mb-sub" fill="#1e293b">B</text>
            <line x1="90" y1="90" x2="220" y2="150" stroke="#94a3b8" strokeDasharray="4 4" />
            <text x="150" y="106" className="mb-note" fill="#92400e">A 在 B 的西北方向</text>
          </g>

          <g transform="translate(470,350)">
            <text x="0" y="0" className="mb-strong">有经纬网：经线指示南北，纬线指示东西</text>
            <text x="0" y="30" className="mb-sub">同一条经线上：只有南北</text>
            <text x="0" y="58" className="mb-sub">同一条纬线上：只有东西</text>
          </g>
        </svg>
      </div>
    );
  }

  const items = [
    ["首都", "★"],
    ["城市", "●"],
    ["铁路", "▬▬"],
    ["公路", "──"],
    ["河流", "〰"],
    ["湖泊", "◇"],
    ["山峰", "▲"],
    ["等高线", "◎"],
    ["国界", "┃"],
    ["省界", "┆"],
    ["沙漠", "⋯"],
    ["运河", "═"],
  ];
  return (
    <div className="map-basics">
      <svg viewBox="0 0 900 540" className="map-svg" role="img" aria-label="地图的图例">
        <text x="450" y="50" textAnchor="middle" className="mb-title">常用图例</text>
        {items.map(([name, sym], i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const x = 110 + col * 260;
          const y = 120 + row * 95;
          return (
            <g key={name}>
              <rect x={x - 30} y={y - 34} width="60" height="60" rx="10" fill="#f8fafc" stroke="#cbd5e1" />
              <text x={x} y={y + 8} textAnchor="middle" className="mb-symbol">{sym}</text>
              <text x={x + 44} y={y + 6} className="mb-sub">{name}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
