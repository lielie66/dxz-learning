export type LatLon = { lat: number; lon: number };

/** 把经度规整到 (-180, 180] */
export function normLon(lon: number): number {
  let x = (((lon + 180) % 360) + 360) % 360 - 180;
  if (x === -180) x = 180;
  return x;
}

export function fmtLat(lat: number): string {
  if (lat === 0) return "0°（赤道）";
  return `${Math.abs(lat)}°${lat > 0 ? "N" : "S"}`;
}

export function fmtLon(lon: number): string {
  if (lon === 0) return "0°（本初子午线）";
  if (Math.abs(lon) === 180) return "180°";
  return `${Math.abs(lon)}°${lon > 0 ? "E" : "W"}`;
}

export function fmtCoord(p: LatLon): string {
  return `${fmtLat(p.lat)}，${fmtLon(p.lon)}`;
}

/** 南/北半球 */
export function nsHemisphere(lat: number): "北半球" | "南半球" {
  return lat >= 0 ? "北半球" : "南半球";
}

/** 东/西半球：20°W 向东到 160°E 为东半球 */
export function ewHemisphere(lon: number): "东半球" | "西半球" {
  const x = normLon(lon);
  return x >= -20 && x < 160 ? "东半球" : "西半球";
}

export function latZone(lat: number): "低纬度" | "中纬度" | "高纬度" {
  const a = Math.abs(lat);
  if (a < 30) return "低纬度";
  if (a < 60) return "中纬度";
  return "高纬度";
}

/** 关于地心对称：纬度变号，经度相差 180° */
export function antipode(p: LatLon): LatLon {
  return { lat: -p.lat, lon: normLon(p.lon + 180) };
}

/** 关于赤道对称：只变纬度 */
export function mirrorEquator(p: LatLon): LatLon {
  return { lat: -p.lat, lon: p.lon };
}

/** 关于本初子午线对称：只变经度 */
export function mirrorPrime(p: LatLon): LatLon {
  return { lat: p.lat, lon: normLon(-p.lon) };
}

/** 粗略方向判断（用于同纬或同经的两点） */
export function directionFrom(a: LatLon, b: LatLon): string {  if (a.lat === b.lat) {
    const d = normLon(a.lon - b.lon);
    return d > 0 ? "正东" : "正西";
  }
  if (a.lon === b.lon) {
    return a.lat > b.lat ? "正北" : "正南";
  }
  const ns = a.lat > b.lat ? "北" : "南";
  const d = normLon(a.lon - b.lon);
  const ew = d > 0 ? "东" : "西";
  return `${ns}${ew}`;
}

/** 球面坐标 -> three.js 世界坐标（与等距圆柱贴图对齐） */
export function latLonToVec3(lat: number, lon: number, r = 1) {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return {
    x: r * Math.cos(la) * Math.cos(lo),
    y: r * Math.sin(la),
    z: -r * Math.cos(la) * Math.sin(lo),
  };
}

/** three.js 世界坐标 -> 经纬度 */
export function vec3ToLatLon(x: number, y: number, z: number): LatLon {
  const r = Math.sqrt(x * x + y * y + z * z) || 1;
  const lat = (Math.asin(y / r) * 180) / Math.PI;
  const lon = (Math.atan2(-z, x) * 180) / Math.PI;
  return { lat: Math.round(lat), lon: Math.round(normLon(lon)) };
}

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 两点间的大圆距离（单位：度） */
export function angularDistance(a: LatLon, b: LatLon): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const p1 = toRad(a.lat);
  const p2 = toRad(b.lat);
  const dl = toRad(b.lon - a.lon);
  const c =
    Math.sin(p1) * Math.sin(p2) + Math.cos(p1) * Math.cos(p2) * Math.cos(dl);
  return (Math.acos(Math.min(1, Math.max(-1, c))) * 180) / Math.PI;
}

/** 从 a 到 b 的南北 / 东西偏差（度） */
export function deltaHint(a: LatLon, b: LatLon): { ns: number; ew: number } {
  return { ns: b.lat - a.lat, ew: normLon(b.lon - a.lon) };
}
