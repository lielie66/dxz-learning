export default function UniverseHierarchy() {
  return (
    <div className="hierarchy-wrap">
      <svg viewBox="0 0 900 570" className="hierarchy-svg" role="img" aria-label="天体系统层级">
        <rect x="40" y="40" width="820" height="490" rx="18" fill="rgba(37,99,235,0.06)" stroke="rgba(148,197,255,0.35)" />
        <text x="64" y="76" className="hier-label big">可观测宇宙</text>

        <rect x="110" y="100" width="680" height="390" rx="16" fill="rgba(37,99,235,0.08)" stroke="rgba(148,197,255,0.35)" />
        <text x="134" y="136" className="hier-label">银河系</text>

        <rect x="190" y="170" width="520" height="270" rx="14" fill="rgba(37,99,235,0.1)" stroke="rgba(148,197,255,0.35)" />
        <text x="214" y="206" className="hier-label">太阳系</text>

        <rect x="320" y="270" width="270" height="110" rx="12" fill="rgba(37,99,235,0.12)" stroke="rgba(148,197,255,0.4)" />
        <text x="342" y="304" className="hier-label small">地月系</text>

        <circle cx="420" cy="345" r="22" fill="#60a5fa" stroke="#dbeafe" strokeWidth="1.5" />
        <text x="420" y="350" textAnchor="middle" className="hier-earth">地球</text>
        <circle cx="505" cy="330" r="9" fill="#cbd5e1" />
        <text x="505" y="334" textAnchor="middle" className="hier-moon">月</text>

        <circle cx="250" cy="340" r="18" fill="#fbbf24" />
        <text x="250" y="345" textAnchor="middle" className="hier-sun">太阳</text>

        <text x="110" y="496" className="hier-note">
          层级由大到小：可观测宇宙 → 银河系 → 太阳系 → 地月系
        </text>
        <text x="110" y="520" className="hier-note">
          地球是太阳系中的一颗行星，月球是地球唯一的天然卫星
        </text>
      </svg>
    </div>
  );
}
