// Live BIM viewer for models converted with scripts/ifc-to-bim.py: every element is pickable with its Revit data,
// systems explode apart, plan and vertical section cuts, and schedules that highlight their elements in 3D.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export type BimElement = {
  i: number;
  l: number;
  c: string;
  f: string;
  t?: string;
  s?: string[];
  v?: string;
  z?: string;
  n?: number;
  iv?: number;
  k?: string;
  b: [number, number, number, number, number, number];
  id?: string;
  vr: [number, number];
};
type Range = [number, number];
export type BimLayer = { id: string; label: string; color: string; count: number; verts: number; tris: number; i32: boolean; pos: Range; nrm: Range; elem: Range; idx: Range };
export type BimMeta = {
  bounds: { min: number[]; max: number[]; scale: number[] };
  layers: BimLayer[];
  levels: { name: string; elev: number }[];
  stats: Record<string, number>;
  elements: BimElement[];
  schedules: { id: string; title: string; cols: string[]; rows: { cells: string[]; ids: number[]; count: number; length: number | null }[] }[];
};

export type BimApi = {
  meta: BimMeta;
  select: (ids: number[] | null, fly?: boolean) => void;
  setLayerVisible: (layer: number, on: boolean) => void;
  setExplode: (on: boolean) => void;
  setSection: (axis: 'y' | 'x', value: number | null) => void;
  range: { y: [number, number]; x: [number, number] };
  home: () => void;
};

const GHOST = new THREE.Color('#3b424d');
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const SELECT = new THREE.Color('#ffc233');

async function fetchGz(url: string, onProgress: (p: number) => void) {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  const total = Number(res.headers.get('content-length')) || 0;
  let got = 0;
  const counted = res.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, ctl) {
        got += chunk.length;
        if (total) onProgress(Math.min(1, got / total));
        ctl.enqueue(chunk);
      },
    }),
  );
  // Some hosts already decode gzip on the fly; detect the gzip magic number before inflating.
  const buf = new Uint8Array(await new Response(counted).arrayBuffer());
  if (buf[0] === 0x1f && buf[1] === 0x8b) return new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  return buf.buffer;
}

export async function mountBim(
  container: HTMLElement,
  base: string,
  ui: { onPick?: (e: BimElement | null) => void; onProgress?: (p: number) => void } = {},
): Promise<BimApi> {
  const [meta, bin] = await Promise.all([fetch(`${base}/meta.json`).then((r) => r.json() as Promise<BimMeta>), fetchGz(`${base}/geo.bin.gz`, (p) => ui.onProgress?.(p))]);
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.localClippingEnabled = true;
  renderer.domElement.className = 'bim__canvas';
  container.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const [x0, y0, z0] = meta.bounds.min;
  const [x1, y1, z1] = meta.bounds.max;
  const size = Math.max(x1 - x0, y1 - y0, z1 - z0);
  const center = new THREE.Vector3((x0 + x1) / 2, (y1 - y0) * 0.35, (z0 + z1) / 2);
  const camera = new THREE.PerspectiveCamera(35, 1, 0.05, size * 20);
  const homeDir = new THREE.Vector3(0.75, 0.62, 0.95).normalize();
  const homeDist = size * 1.55;
  camera.position.copy(center).addScaledVector(homeDir, homeDist);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(center);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.zoomToCursor = true;
  controls.screenSpacePanning = true;
  controls.minDistance = 0.5;
  controls.maxDistance = size * 5;
  controls.autoRotate = !reduced;
  controls.autoRotateSpeed = 0.35;
  renderer.domElement.style.touchAction = 'pan-y';
  controls.addEventListener('start', () => (controls.autoRotate = false));

  scene.add(new THREE.HemisphereLight('#eef3ff', '#262a31', 1.5));
  const sun = new THREE.DirectionalLight('#ffffff', 2.1);
  sun.position.set(size, size * 1.6, size * 0.7);
  scene.add(sun);
  const fill = new THREE.DirectionalLight('#9ec2ff', 0.6);
  fill.position.set(-size, size * 0.5, -size);
  scene.add(fill);
  const grid = new THREE.GridHelper(size * 2.4, 48, '#3a414d', '#22262e');
  grid.position.set(center.x, -0.02, center.z);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.45;
  scene.add(grid);

  // ----- section planes -----
  const OFF = 1e6; // plane far away = no cut (exploded bands rise well above the model)
  const planeY = new THREE.Plane(new THREE.Vector3(0, -1, 0), OFF);
  const planeX = new THREE.Plane(new THREE.Vector3(-1, 0, 0), OFF);
  const clipping = [planeY, planeX];
  const sectionMat = new THREE.MeshBasicMaterial({ color: '#5b9be6', transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false });
  const secY = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0 + 2, z1 - z0 + 2), sectionMat);
  secY.rotation.x = -Math.PI / 2;
  secY.position.set(center.x, 0, center.z);
  secY.visible = false;
  const secX = new THREE.Mesh(new THREE.PlaneGeometry(z1 - z0 + 2, y1 - y0 + 2), sectionMat);
  secX.rotation.y = Math.PI / 2;
  secX.position.set(0, (y0 + y1) / 2, center.z);
  secX.visible = false;
  scene.add(secY, secX);

  // ----- decode layers -----
  const [sx, sy, sz] = meta.bounds.scale;
  const layerMeshes: THREE.Mesh[] = [];
  const baseColors: Float32Array[] = [];
  const elemsByLayer: BimElement[][] = meta.layers.map(() => []);
  for (const e of meta.elements) elemsByLayer[e.l]?.push(e);
  const layerOf = new Map<number, number>();
  meta.layers.forEach((L, li) => {
    const q = new Uint16Array(bin, L.pos[0], L.pos[1]);
    const pos = new Float32Array(q.length);
    for (let k = 0; k < q.length; k += 3) {
      pos[k] = x0 + q[k] * sx;
      pos[k + 1] = y0 + q[k + 1] * sy;
      pos[k + 2] = z0 + q[k + 2] * sz;
    }
    const on = new Int8Array(bin, L.nrm[0], L.nrm[1]);
    const nrm = new Float32Array((on.length / 2) * 3);
    for (let k = 0, j = 0; k < on.length; k += 2, j += 3) {
      const ox = on[k] / 127;
      const oy = on[k + 1] / 127;
      let nz = 1 - Math.abs(ox) - Math.abs(oy);
      let nx = ox;
      let ny = oy;
      if (nz < 0) {
        nx = (1 - Math.abs(oy)) * Math.sign(ox || 1);
        ny = (1 - Math.abs(ox)) * Math.sign(oy || 1);
      }
      const len = Math.hypot(nx, ny, nz) || 1;
      nrm[j] = nx / len;
      nrm[j + 1] = ny / len;
      nrm[j + 2] = nz / len;
    }
    const elem = new Uint16Array(bin, L.elem[0], L.elem[1]);
    const idx = L.i32 ? new Uint32Array(bin, L.idx[0], L.idx[1]) : new Uint16Array(bin, L.idx[0], L.idx[1]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    const col = new Float32Array(pos.length);
    const c = new THREE.Color(L.color);
    for (let k = 0; k < col.length; k += 3) {
      col[k] = c.r;
      col[k + 1] = c.g;
      col[k + 2] = c.b;
    }
    baseColors.push(col.slice());
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    geo.userData.elem = elem;
    geo.computeBoundingSphere();
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.15, clippingPlanes: clipping, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.layer = li;
    scene.add(mesh);
    layerMeshes.push(mesh);
    for (const e of elemsByLayer[li]) layerOf.set(e.i, li);
  });

  // ----- colours: highlight / ghost -----
  let selected: Set<number> | null = null;
  const paint = () => {
    layerMeshes.forEach((mesh, li) => {
      const attr = mesh.geometry.getAttribute('color') as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      const base = baseColors[li];
      if (!selected) arr.set(base);
      else
        for (const e of elemsByLayer[li]) {
          const [s0, n] = e.vr;
          const on = selected.has(e.i);
          for (let k = s0 * 3; k < (s0 + n) * 3; k += 3) {
            if (on) {
              arr[k] = SELECT.r;
              arr[k + 1] = SELECT.g;
              arr[k + 2] = SELECT.b;
            } else {
              arr[k] = GHOST.r;
              arr[k + 1] = GHOST.g;
              arr[k + 2] = GHOST.b;
            }
          }
        }
      attr.needsUpdate = true;
    });
  };

  // ----- explode by system -----
  let explode = 0;
  let explodeTarget = 0;
  // systems explode into bands: equipment & valves, chilled water, condenser water, hot & domestic water,
  // drainage & air, electrical & lighting, protection
  const BAND: Record<string, number> = { equipment: 0, valves: 0, chw: 1, cw: 2, hw: 3, dom: 3, drain: 4, air: 4, elec: 5, power: 5, light: 5, lps: 6, safety: 6 };
  const bandOf = meta.layers.map((L) => BAND[L.id] ?? 0);
  const BANDS = Math.max(...bandOf) + 1;
  const GAP = (y1 - y0) * 0.5;
  const layerOffset = (li: number) => bandOf[li] * GAP * ease(explode);

  // ----- camera flights -----
  let fly: { t: number; fp: THREE.Vector3; tp: THREE.Vector3; ft: THREE.Vector3; tt: THREE.Vector3 } | null = null;
  const flyToBox = (box: THREE.Box3) => {
    const c = box.getCenter(new THREE.Vector3());
    const r = Math.max(box.getSize(new THREE.Vector3()).length() * 0.5, 0.6);
    const dist = Math.min(controls.maxDistance, (r / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2))) * 1.15);
    const dir = camera.position.clone().sub(controls.target).normalize();
    fly = { t: 0, fp: camera.position.clone(), tp: c.clone().addScaledVector(dir, dist), ft: controls.target.clone(), tt: c };
    controls.autoRotate = false;
  };
  const boxOf = (ids: number[]) => {
    const box = new THREE.Box3();
    for (const id of ids) {
      const e = meta.elements[id];
      const dy = layerOffset(e.l);
      box.expandByPoint(new THREE.Vector3(e.b[0], e.b[1] + dy, e.b[2]));
      box.expandByPoint(new THREE.Vector3(e.b[3], e.b[4] + dy, e.b[5]));
    }
    return box;
  };

  // ----- picking -----
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let down: { x: number; y: number } | null = null;
  const pick = (ev: PointerEvent) => {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(layerMeshes.filter((m) => m.visible), false).filter((h) => clipping.every((p) => p.distanceToPoint(h.point) >= -1e-4));
    const h = hits[0];
    if (!h || !h.face) return null;
    const elem = (h.object as THREE.Mesh).geometry.userData.elem as Uint16Array;
    return meta.elements[elem[h.face.a]];
  };
  renderer.domElement.addEventListener('pointerdown', (ev) => (down = { x: ev.clientX, y: ev.clientY }));
  renderer.domElement.addEventListener('pointerup', (ev) => {
    if (down && Math.hypot(ev.clientX - down.x, ev.clientY - down.y) < 6) {
      const e = pick(ev);
      api.select(e ? [e.i] : null, false);
      ui.onPick?.(e);
    }
    down = null;
  });

  // ----- sizing & loop -----
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(container);
  resize();
  let raf = 0;
  let last = performance.now();
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (explode !== explodeTarget) {
      explode += Math.sign(explodeTarget - explode) * Math.min(Math.abs(explodeTarget - explode), dt / 0.8);
      const e = ease(explode);
      layerMeshes.forEach((m, li) => (m.position.y = bandOf[li] * GAP * e));
    }
    if (fly) {
      fly.t = Math.min(1, fly.t + dt / 0.9);
      const k = ease(fly.t);
      camera.position.lerpVectors(fly.fp, fly.tp, k);
      controls.target.lerpVectors(fly.ft, fly.tt, k);
      if (fly.t >= 1) fly = null;
    }
    controls.update(dt);
    renderer.render(scene, camera);
  };
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    } else if (!e.isIntersecting && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }).observe(container);

  const api: BimApi = {
    meta,
    select(ids, doFly = true) {
      selected = ids && ids.length ? new Set(ids) : null;
      paint();
      if (ids && ids.length && doFly) flyToBox(boxOf(ids));
    },
    setLayerVisible(li, on) {
      layerMeshes[li].visible = on;
    },
    setExplode(on) {
      explodeTarget = on ? 1 : 0;
      if (on) flyToBox(new THREE.Box3(new THREE.Vector3(x0, y0, z0), new THREE.Vector3(x1, y1 + GAP * (BANDS - 1), z1)));
    },
    setSection(axis, value) {
      if (axis === 'y') {
        planeY.constant = value ?? OFF;
        secY.visible = value !== null;
        secY.position.y = value ?? 0;
      } else {
        planeX.constant = value ?? OFF;
        secX.visible = value !== null;
        secX.position.x = value ?? 0;
      }
    },
    range: { y: [y0, y1], x: [x0, x1] },
    home() {
      const c = center.clone();
      fly = { t: 0, fp: camera.position.clone(), tp: c.clone().addScaledVector(homeDir, homeDist), ft: controls.target.clone(), tt: c };
    },
  };
  void layerOf;
  return api;
}
