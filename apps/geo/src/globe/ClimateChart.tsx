import { CITY_MAP } from "../data/geo4";

type Props = {
  city: string;
  title?: string;
  compact?: boolean;
};

const W = 330;
const H = 220;
const PL = 38;
const PR = 300;
const PT = 20;
const PB = 176;

export default function ClimateChart({ city, title, compact = false }: Props) {
  const data = CITY_MAP.get(city);
  if (!data) return null;

  const tempMax = 30;
  const tempMin = -20;
  const precipMax = 300;

  const x = (i: number) => PL + ((PR - PL) / 12) * (i + 0.5);
  const yTemp = (t: number) => PB - ((t - tempMin) / (tempMax - tempMin)) * (PB - PT);
  const yPrecip = (p: number) => PB - (p / precipMax) * (PB - PT);

  const tempPath = data.temp
    .map((t, i) => `${i === 0 ? "M" : "L"}${x(i)},${yTemp(t)}`)
    .join(" ");

  return (
    <div className={compact ? "climate-chart compact" : "climate-chart"}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${city}气温曲线和降水量柱状图`}>
        <rect x={PL} y={PT} width={PR - PL} height={PB - PT} fill="rgba(148,197,255,0.05)" />
        {[-20, -10, 0, 10, 20, 30].map((t) => (
          <g key={t}>
            <line x1={PL} y1={yTemp(t)} x2={PR} y2={yTemp(t)} stroke="rgba(148,197,255,0.12)" />
            <text x={PL - 5} y={yTemp(t) + 4} textAnchor="end" className="chart-axis">
              {t}
            </text>
          </g>
        ))}
        {[0, 100, 200, 300].map((p) => (
          <text key={p} x={PR + 5} y={yPrecip(p) + 4} className="chart-axis">
            {p}
          </text>
        ))}

        {data.precip.map((p, i) => {
          const bw = (PR - PL) / 12 - 6;
          return (
            <rect
              key={i}
              x={x(i) - bw / 2}
              y={yPrecip(p)}
              width={bw}
              height={PB - yPrecip(p)}
              fill="#60a5fa"
              opacity="0.75"
              rx="1.5"
            />
          );
        })}

        <path d={tempPath} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
        {data.temp.map((t, i) => (
          <circle key={i} cx={x(i)} cy={yTemp(t)} r="2.2" fill="#f97316" />
        ))}

        {data.temp.map((_, i) =>
          i % (compact ? 3 : 1) === 0 ? (
            <text key={i} x={x(i)} y={PB + 14} textAnchor="middle" className="chart-axis">
              {i + 1}
            </text>
          ) : null
        )}

        <text x={(PL + PR) / 2} y={H - 6} textAnchor="middle" className="chart-axis">
          月份
        </text>

        <text x={PL} y={12} className="chart-title">
          {title ?? data.name}
        </text>
      </svg>
    </div>
  );
}
