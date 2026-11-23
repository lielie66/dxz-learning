import * as THREE from "three";
import { getLandRings } from "../lib/land";

let cached: THREE.CanvasTexture | null = null;

/** 用矢量陆地数据画一张等距圆柱投影的地球贴图，干净、可离线、没有版权问题 */
export function getEarthTexture(): THREE.CanvasTexture {
  if (cached) return cached;
  const W = 2048;
  const H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // 海洋
  const ocean = ctx.createLinearGradient(0, 0, 0, H);
  ocean.addColorStop(0, "#aecfec");
  ocean.addColorStop(0.5, "#c3ddf6");
  ocean.addColorStop(1, "#aecfec");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, W, H);

  const project = (lon: number, lat: number): [number, number] => [
    ((lon + 180) / 360) * W,
    ((90 - lat) / 180) * H,
  ];

  ctx.fillStyle = "#f0ead9";
  ctx.strokeStyle = "#c6b795";
  ctx.lineWidth = 1.2;

  for (const ring of getLandRings()) {
    ctx.beginPath();
    let prevX: number | null = null;
    ring.forEach(([lon, lat], i) => {
      const [x, y] = project(lon, lat);
      if (i === 0) ctx.moveTo(x, y);
      else if (prevX !== null && Math.abs(x - prevX) > W / 2) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      prevX = x;
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 极地淡出，避免极点拉伸难看
  const fade = ctx.createLinearGradient(0, 0, 0, H);
  fade.addColorStop(0, "rgba(255,255,255,0.55)");
  fade.addColorStop(0.08, "rgba(255,255,255,0)");
  fade.addColorStop(0.92, "rgba(255,255,255,0)");
  fade.addColorStop(1, "rgba(255,255,255,0.55)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, W, H);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cached = tex;
  return tex;
}
