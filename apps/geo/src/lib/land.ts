import { feature } from "topojson-client";
import landTopo from "world-atlas/land-110m.json";

export type Ring = number[][];

let cached: Ring[] | null = null;

/**
 * Natural Earth 110m 陆地轮廓（经度 -180~180，纬度 -90~90）。
 * 同时给 3D 贴图和平面地图使用，保证两者一模一样。
 */
export function getLandRings(): Ring[] {
  if (cached) return cached;
  const topo = landTopo as unknown as Parameters<typeof feature>[0];
  const geo = feature(topo, (landTopo as any).objects.land) as any;
  const rings: Ring[] = [];
  const geoms = geo.type === "FeatureCollection" ? geo.features : [geo];
  for (const f of geoms) {
    const g = f.geometry;
    if (!g) continue;
    if (g.type === "Polygon") {
      for (const ring of g.coordinates) rings.push(ring as Ring);
    } else if (g.type === "MultiPolygon") {
      for (const poly of g.coordinates) for (const ring of poly) rings.push(ring as Ring);
    }
  }
  cached = rings;
  return rings;
}
