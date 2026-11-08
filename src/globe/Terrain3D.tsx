import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";

/** 地形高度：西侧一条山脊，东侧一条山谷，整体向南倾斜 */
const H = (x: number, z: number) => {
  const taper = Math.exp(-(x * x) / 1.2);
  const ridge = 0.65 * Math.exp(-((z + 0.4) ** 2) / 0.05) * taper;
  const valley = -0.55 * Math.exp(-((z - 0.35) ** 2) / 0.05) * taper;
  return 0.55 + 0.12 * x + ridge + valley;
};

function ramp(t: number) {
  const c1 = new THREE.Color("#4f9a52");
  const c2 = new THREE.Color("#d6b24c");
  const c3 = new THREE.Color("#8b5a2b");
  if (t < 0.55) return c1.clone().lerp(c2, t / 0.55);
  return c2.clone().lerp(c3, (t - 0.55) / 0.45);
}

export default function Terrain3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.set(0, 3.3, 2.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(mount.clientWidth, mount.clientHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0";
    labelRenderer.domElement.style.left = "0";
    labelRenderer.domElement.style.pointerEvents = "none";
    mount.appendChild(labelRenderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enablePan = false;
    controls.minDistance = 1.7;
    controls.maxDistance = 6;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.target.set(0, 0.55, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 1.7);
    key.position.set(3, 5, 2);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xbcd7ff, 0.5);
    fill.position.set(-3, 2, -3);
    scene.add(fill);

    // 地形网格
    const N = 140;
    const geo = new THREE.PlaneGeometry(2, 2, N, N);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const hs: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = H(x, z);
      pos.setY(i, h);
      hs.push(h);
    }
    const min = Math.min(...hs);
    const max = Math.max(...hs);
    const colors: number[] = [];
    for (const h of hs) {
      const c = ramp((h - min) / (max - min || 1));
      colors.push(c.r, c.g, c.b);
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.9,
        metalness: 0,
        side: THREE.DoubleSide,
      })
    );
    scene.add(mesh);

    // 四周的“土层”侧壁，让地形看起来是一个立体块
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x6b4a2b,
      roughness: 1,
      side: THREE.DoubleSide,
    });
    const addWall = (edge: "n" | "s" | "e" | "w") => {
      const positions: number[] = [];
      const seg = 80;
      for (let i = 0; i < seg; i++) {
        const t0 = -1 + (2 * i) / seg;
        const t1 = -1 + (2 * (i + 1)) / seg;
        let p0: [number, number];
        let p1: [number, number];
        if (edge === "s") {
          p0 = [t0, 1];
          p1 = [t1, 1];
        } else if (edge === "n") {
          p0 = [t0, -1];
          p1 = [t1, -1];
        } else if (edge === "e") {
          p0 = [1, t0];
          p1 = [1, t1];
        } else {
          p0 = [-1, t0];
          p1 = [-1, t1];
        }
        const h0 = H(p0[0], p0[1]);
        const h1 = H(p1[0], p1[1]);
        positions.push(
          p0[0], h0, p0[1],
          p1[0], h1, p1[1],
          p1[0], 0, p1[1],
          p0[0], h0, p0[1],
          p1[0], 0, p1[1],
          p0[0], 0, p0[1]
        );
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      g.computeVertexNormals();
      return new THREE.Mesh(g, wallMat);
    };
    scene.add(addWall("s"), addWall("n"), addWall("e"), addWall("w"));

    // 等高线（marching squares）
    const verts: number[] = [];
    const N2 = 120;
    const step = 2 / N2;

    const edgePoint = (
      a: number,
      b: number,
      xa: number,
      za: number,
      xb: number,
      zb: number,
      level: number
    ): [number, number] => {
      const t = (level - a) / (b - a || 1);
      return [xa + (xb - xa) * t, za + (zb - za) * t];
    };

    for (let level = 0.12; level < 1.0; level += 0.1) {
      for (let i = 0; i < N2; i++) {
        for (let j = 0; j < N2; j++) {
          const x0 = -1 + i * step;
          const z0 = -1 + j * step;
          const x1 = x0 + step;
          const z1 = z0 + step;
          const h00 = H(x0, z0);
          const h10 = H(x1, z0);
          const h11 = H(x1, z1);
          const h01 = H(x0, z1);
          const pts: [number, number][] = [];
          if (h00 > level !== h10 > level) pts.push(edgePoint(h00, h10, x0, z0, x1, z0, level));
          if (h10 > level !== h11 > level) pts.push(edgePoint(h10, h11, x1, z0, x1, z1, level));
          if (h11 > level !== h01 > level) pts.push(edgePoint(h11, h01, x1, z1, x0, z1, level));
          if (h01 > level !== h00 > level) pts.push(edgePoint(h01, h00, x0, z1, x0, z0, level));
          if (pts.length === 2) {
            verts.push(pts[0][0], level + 0.006, pts[0][1], pts[1][0], level + 0.006, pts[1][1]);
          } else if (pts.length === 4) {
            verts.push(
              pts[0][0], level + 0.006, pts[0][1],
              pts[1][0], level + 0.006, pts[1][1],
              pts[2][0], level + 0.006, pts[2][1],
              pts[3][0], level + 0.006, pts[3][1]
            );
          }
        }
      }
    }
    const contourGeo = new THREE.BufferGeometry();
    contourGeo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    const contours = new THREE.LineSegments(
      contourGeo,
      new THREE.LineBasicMaterial({ color: 0x4a2c0f, transparent: true, opacity: 0.8 })
    );
    scene.add(contours);

    // 山谷里的河流
    const riverPts: THREE.Vector3[] = [];
    for (let x = -0.8; x <= 0.9; x += 0.05) {
      riverPts.push(new THREE.Vector3(x, H(x, 0.35) + 0.03, 0.35));
    }
    const riverCurve = new THREE.CatmullRomCurve3(riverPts);
    const river = new THREE.Mesh(
      new THREE.TubeGeometry(riverCurve, 64, 0.018, 8, false),
      new THREE.MeshBasicMaterial({ color: 0x1d4ed8 })
    );
    scene.add(river);

    // 标注
    const addLabel = (text: string, cls: string, p: THREE.Vector3) => {
      const el = document.createElement("div");
      el.className = "t3d-label " + cls;
      el.textContent = text;
      const obj = new CSS2DObject(el);
      obj.position.copy(p);
      scene.add(obj);
    };
    addLabel("山脊", "ridge", new THREE.Vector3(0, H(0, -0.4) + 0.38, -0.4));
    addLabel("山谷（河流）", "valley", new THREE.Vector3(0.15, H(0.15, 0.35) + 0.55, 0.35));

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      labelRenderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      scene.traverse((obj) => {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
      if (labelRenderer.domElement.parentElement === mount) mount.removeChild(labelRenderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="terrain3d-canvas" />;
}
