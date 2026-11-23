import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { getEarthTexture } from "./texture";
import { latLonToVec3, vec3ToLatLon, type LatLon } from "../lib/coords";

export type GlobeMarker = { lat: number; lon: number; label?: string; kind?: "point" | "target" };

export type GlobeConfig = {
  showLat: boolean;
  showLon: boolean;
  showLabels: boolean;
  showEquator: boolean;
  showPrime: boolean;
  showZones: boolean;
  showHemi: boolean;
  highlightLat: number | null;
  highlightLon: number | null;
  markers: GlobeMarker[];
  focus: { lat: number; lon: number; distance?: number } | null;
  autoRotate?: boolean;
};

export const defaultGlobeConfig: GlobeConfig = {
  showLat: true,
  showLon: true,
  showLabels: true,
  showEquator: true,
  showPrime: true,
  showZones: false,
  showHemi: false,
  highlightLat: null,
  highlightLon: null,
  markers: [],
  focus: { lat: 22, lon: 105, distance: 3.8 },
  autoRotate: false,
};

const R = 1.002;

function latCirclePoints(lat: number, r = R): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const rr = r * Math.cos((lat * Math.PI) / 180);
  const y = r * Math.sin((lat * Math.PI) / 180);
  for (let lon = 0; lon <= 360; lon += 3) {
    const a = (lon * Math.PI) / 180;
    pts.push(new THREE.Vector3(rr * Math.cos(a), y, -rr * Math.sin(a)));
  }
  return pts;
}

function lonArcPoints(lon: number, r = R): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let lat = -90; lat <= 90; lat += 2) {
    const v = latLonToVec3(lat, lon, r);
    pts.push(new THREE.Vector3(v.x, v.y, v.z));
  }
  return pts;
}

function lineFrom(points: THREE.Vector3[], color: number, opacity: number) {
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  return new THREE.Line(geo, mat);
}

function bandMesh(latA: number, latB: number, color: number, opacity = 0.16) {
  const thetaStart = THREE.MathUtils.degToRad(90 - latB);
  const thetaLength = THREE.MathUtils.degToRad(latB - latA);
  const geo = new THREE.SphereGeometry(1.004, 96, 32, 0, Math.PI * 2, thetaStart, thetaLength);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  return new THREE.Mesh(geo, mat);
}

type Refs = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  earth: THREE.Mesh;
  latGroup: THREE.Group;
  lonGroup: THREE.Group;
  latLabels: THREE.Group;
  lonLabels: THREE.Group;
  equator: THREE.Object3D;
  prime: THREE.Object3D;
  zonesGroup: THREE.Group;
  hemiGroup: THREE.Group;
  highlightGroup: THREE.Group;
  markerGroup: THREE.Group;
  focusTarget: THREE.Vector3 | null;
};

type Props = {
  config: GlobeConfig;
  onPick?: (p: LatLon) => void;
  onHover?: (p: LatLon | null) => void;
};

export default function Globe({ config, onPick, onHover }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const refs = useRef<Refs | null>(null);
  const lastFocus = useRef("");
  const fitRef = useRef(2.8);
  const pickRef = useRef(onPick);
  const hoverRef = useRef(onHover);
  pickRef.current = onPick;
  hoverRef.current = onHover;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    const start = latLonToVec3(22, 105, 3.8);
    camera.position.set(start.x, start.y, start.z);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.style.touchAction = "none";
    mount.appendChild(renderer.domElement);

    // 度数标签（CSS2D，永远正对屏幕，清晰不糊）
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(mount.clientWidth, mount.clientHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0";
    labelRenderer.domElement.style.left = "0";
    labelRenderer.domElement.style.pointerEvents = "none";
    mount.appendChild(labelRenderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.rotateSpeed = 0.55;
    controls.zoomSpeed = 0.7;
    controls.minDistance = 1.45;
    controls.maxDistance = 6;

    // 灯光：跟随相机，保证正面永远明亮
    scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    camera.add(dir);
    dir.position.set(0, 0, 1);
    scene.add(camera);

    // 星空
    const starGeo = new THREE.BufferGeometry();
    const starPos: number[] = [];
    for (let i = 0; i < 700; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(30 + Math.random() * 20);
      starPos.push(v.x, v.y, v.z);
    }
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.11, transparent: true, opacity: 0.55 })
    );
    scene.add(stars);

    // 地球
    const earthMat = new THREE.MeshStandardMaterial({
      map: getEarthTexture(),
      roughness: 1,
      metalness: 0,
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96), earthMat);
    scene.add(earth);

    // 大西洋方向的柔和光晕
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(1.06, 64, 48),
      new THREE.MeshBasicMaterial({ color: 0x4a90d9, transparent: true, opacity: 0.07, side: THREE.BackSide })
    );
    scene.add(glow);

    // 经纬网
    const latGroup = new THREE.Group();
    for (let lat = -75; lat <= 75; lat += 15) {
      if (lat === 0) continue;
      latGroup.add(lineFrom(latCirclePoints(lat), 0x2b4a6f, 0.38));
    }
    scene.add(latGroup);

    const lonGroup = new THREE.Group();
    for (let lon = -180; lon < 180; lon += 15) {
      if (lon === 0) continue;
      lonGroup.add(lineFrom(lonArcPoints(lon), 0x2b4a6f, 0.32));
    }
    scene.add(lonGroup);

    // 度数标签
    const latLabels = new THREE.Group();
    const lonLabels = new THREE.Group();
    const allLabels: CSS2DObject[] = [];
    const addLabel = (group: THREE.Group, lat: number, lon: number, text: string) => {
      const el = document.createElement("div");
      el.className = "globe-label";
      el.textContent = text;
      const obj = new CSS2DObject(el);
      const v = latLonToVec3(lat, lon, 1.012);
      obj.position.set(v.x, v.y, v.z);
      group.add(obj);
      allLabels.push(obj);
    };
    for (const lat of [-60, -30, 30, 60]) {
      const text = `${Math.abs(lat)}°${lat > 0 ? "N" : "S"}`;
      for (const lon of [-135, -45, 45, 135]) addLabel(latLabels, lat, lon, text);
    }
    addLabel(latLabels, 0, 60, "赤道 0°");
    addLabel(latLabels, 0, -120, "赤道 0°");
    for (let lon = -150; lon <= 180; lon += 30) {
      const text =
        lon === 180 || lon === -180
          ? "180°"
          : lon === 0
            ? "0°"
            : `${Math.abs(lon)}°${lon > 0 ? "E" : "W"}`;
      addLabel(lonLabels, 2.5, lon, text);
    }
    addLabel(latLabels, 89, 0, "北极");
    addLabel(latLabels, -89, 0, "南极");
    scene.add(latLabels);
    scene.add(lonLabels);

    const equator = lineFrom(latCirclePoints(0, 1.004), 0xef4444, 0.95);
    scene.add(equator);

    const prime = lineFrom(lonArcPoints(0, 1.004), 0x2563eb, 0.95);
    scene.add(prime);

    // 低中高纬色带
    const zonesGroup = new THREE.Group();
    zonesGroup.add(bandMesh(-30, 30, 0x22c55e, 0.22));
    zonesGroup.add(bandMesh(30, 60, 0xf59e0b, 0.24));
    zonesGroup.add(bandMesh(60, 90, 0xa855f7, 0.26));
    zonesGroup.add(bandMesh(-60, -30, 0xf59e0b, 0.24));
    zonesGroup.add(bandMesh(-90, -60, 0xa855f7, 0.26));
    zonesGroup.visible = false;
    scene.add(zonesGroup);

    // 东西半球分界：20°W 向东到 160°E 为东半球（绿色半壳）
    const hemiGroup = new THREE.Group();
    const eastShell = new THREE.Mesh(
      new THREE.SphereGeometry(
        1.005,
        96,
        48,
        THREE.MathUtils.degToRad(160),
        Math.PI
      ),
      new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    hemiGroup.add(eastShell);
    hemiGroup.add(lineFrom(lonArcPoints(-20, 1.006), 0xf59e0b, 0.95));
    hemiGroup.add(lineFrom(lonArcPoints(160, 1.006), 0xf59e0b, 0.95));
    hemiGroup.visible = false;
    scene.add(hemiGroup);

    const highlightGroup = new THREE.Group();
    scene.add(highlightGroup);

    const markerGroup = new THREE.Group();
    scene.add(markerGroup);

    refs.current = {
      renderer,
      scene,
      camera,
      controls,
      earth,
      latGroup,
      lonGroup,
      latLabels,
      lonLabels,
      equator,
      prime,
      zonesGroup,
      hemiGroup,
      highlightGroup,
      markerGroup,
      focusTarget: null,
    };

    // 交互
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const toNdc = (ev: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const hitAt = (ev: PointerEvent): LatLon | null => {
      toNdc(ev);
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObject(earth, false);
      if (!hits.length) return null;
      const p = hits[0].point;
      return vec3ToLatLon(p.x, p.y, p.z);
    };

    const onPointerDown = (ev: PointerEvent) => {
      downX = ev.clientX;
      downY = ev.clientY;
      if (refs.current) refs.current.focusTarget = null;
    };
    const onPointerUp = (ev: PointerEvent) => {
      if (Math.abs(ev.clientX - downX) > 6 || Math.abs(ev.clientY - downY) > 6) return;
      const p = hitAt(ev);
      if (p) pickRef.current?.(p);
    };
    const onPointerMove = (ev: PointerEvent) => {
      const p = hitAt(ev);
      hoverRef.current?.(p);
      renderer.domElement.style.cursor = p ? "crosshair" : "grab";
    };
    const onPointerLeave = () => hoverRef.current?.(null);

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);

    // 自适应尺寸
    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      labelRenderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      // 保证整个球都在画面里（分屏时窗口变窄会自动拉远）
      const vFov = (camera.fov * Math.PI) / 180;
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
      const fit = 1.06 / Math.sin(Math.min(vFov, hFov) / 2);
      fitRef.current = fit;
      if (camera.position.length() < fit) {
        camera.position.setLength(fit);
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    let raf = 0;
    const camDir = new THREE.Vector3();
    const labelDir = new THREE.Vector3();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const r = refs.current;
      if (r?.focusTarget) {
        camera.position.lerp(r.focusTarget, 0.09);
        if (camera.position.distanceTo(r.focusTarget) < 0.008) r.focusTarget = null;
      }
      controls.update();

      // 背面的标签隐藏，避免透出来
      camDir.copy(camera.position).normalize();
      for (const obj of allLabels) {
        labelDir.copy(obj.position).normalize();
        const dot = labelDir.dot(camDir);
        (obj.element as HTMLElement).style.opacity = dot > 0.12 ? "1" : "0";
      }

      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      controls.dispose();
      scene.traverse((obj) => {
        const anyObj = obj as THREE.Mesh;
        anyObj.geometry?.dispose?.();
        const mat = anyObj.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
      if (labelRenderer.domElement.parentElement === mount) mount.removeChild(labelRenderer.domElement);
      refs.current = null;
    };
  }, []);

  // 配置更新
  useEffect(() => {
    const r = refs.current;
    if (!r) return;
    r.latGroup.visible = config.showLat;
    r.lonGroup.visible = config.showLon;
    r.latLabels.visible = config.showLat && config.showLabels;
    r.lonLabels.visible = config.showLon && config.showLabels;
    r.equator.visible = config.showEquator;
    r.prime.visible = config.showPrime;
    r.zonesGroup.visible = config.showZones;
    r.hemiGroup.visible = config.showHemi;
    r.controls.autoRotate = !!config.autoRotate;
    r.controls.autoRotateSpeed = 0.6;

    // 高亮纬线
    while (r.highlightGroup.children.length) {
      const c = r.highlightGroup.children.pop() as THREE.Mesh;
      c.geometry?.dispose();
      (c.material as THREE.Material)?.dispose();
    }
    if (config.highlightLat !== null) {
      const lat = config.highlightLat;
      const radius = Math.cos((lat * Math.PI) / 180) * 1.006;
      if (radius > 0.02) {
        const geo = new THREE.TorusGeometry(radius, 0.008, 8, 180);
        const mat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = Math.PI / 2;
        mesh.position.y = Math.sin((lat * Math.PI) / 180) * 1.006;
        r.highlightGroup.add(mesh);
      }
    }
    if (config.highlightLon !== null) {
      const pts = lonArcPoints(config.highlightLon, 1.006).map(
        (v) => new THREE.Vector3(v.x, v.y, v.z)
      );
      const curve = new THREE.CatmullRomCurve3(pts);
      const geo = new THREE.TubeGeometry(curve, 120, 0.008, 8, false);
      const mat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
      r.highlightGroup.add(new THREE.Mesh(geo, mat));
    }

    // 标记点
    while (r.markerGroup.children.length) {
      const c = r.markerGroup.children.pop() as THREE.Group;
      c.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mm = m.material as THREE.Material | undefined;
        mm?.dispose?.();
      });
    }
    for (const mk of config.markers) {
      const g = new THREE.Group();
      const v = latLonToVec3(mk.lat, mk.lon, 1);
      const color = mk.kind === "target" ? 0xf97316 : 0x22d3ee;
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 20, 20),
        new THREE.MeshBasicMaterial({ color })
      );
      dot.position.set(v.x, v.y, v.z);
      g.add(dot);
      const outer = latLonToVec3(mk.lat, mk.lon, 1.14);
      const stem = lineFrom(
        [new THREE.Vector3(v.x, v.y, v.z), new THREE.Vector3(outer.x, outer.y, outer.z)],
        color,
        0.9
      );
      g.add(stem);
      r.markerGroup.add(g);
    }

    if (config.focus) {
      const fk = `${config.focus.lat}|${config.focus.lon}|${config.focus.distance ?? ""}`;
      if (fk !== lastFocus.current) {
        lastFocus.current = fk;
        const f = latLonToVec3(
          config.focus.lat,
          config.focus.lon,
          Math.max(
            config.focus.distance ?? r.camera.position.length(),
            fitRef.current
          )
        );
        r.focusTarget = new THREE.Vector3(f.x, f.y, f.z);
      }
    } else {
      lastFocus.current = "";
    }
  }, [config]);

  return <div ref={mountRef} className="globe-canvas" />;
}
