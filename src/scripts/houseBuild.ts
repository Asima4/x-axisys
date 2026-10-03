// Scroll-driven "plan to building" sequence for a real project.
// Geometry comes from src/data/shamita-model.json, extracted from the project's vector PDF
// (walls, openings, footprint and roof outline), so every element sits exactly on the drawing.

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

type Rle = { origin: [number, number]; cell: number; w: number; h: number; rle: number[][] };
type Opening = [number, number, number, number, 'window' | 'slider' | 'door' | 'garage' | 'open'];
export type HouseModel = {
  floor: number;
  plate: number;
  pitch: number;
  walls: [number, number, number, number, number][]; // x0,z0,x1,z1, exterior(1)/interior(0)
  openings: Opening[];
  footprint: Rle;
  roof: Rle;
  planRect: [number, number, number, number];
  columns: [number, number][];
};

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function decode(r: Rle): boolean[][] {
  return r.rle.map((row) => {
    let v = row[0] === 1;
    const out: boolean[] = [];
    for (const n of row.slice(1)) {
      for (let i = 0; i < n; i++) out.push(v);
      v = !v;
    }
    return out;
  });
}

const OPENING_SPEC = {
  window: { sill: 3, head: 8, glass: true },
  slider: { sill: 0, head: 8, glass: true },
  door: { sill: 0, head: 8, glass: false },
  garage: { sill: 0, head: 8, glass: false },
  open: { sill: 0, head: 8.5, glass: false },
};

export function mountHouseBuild(container: HTMLElement, model: HouseModel, planUrl: string) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;

  const F = model.floor; // top of slab
  const P = model.plate; // top of wall
  const H = P - F;

  // Model bounds / centre (feet)
  const [px0, pz0, px1, pz1] = model.planRect;
  const fp = model.footprint;
  const cx = fp.origin[0] + (fp.w * fp.cell) / 2;
  const cz = fp.origin[1] + (fp.h * fp.cell) / 2;
  const size = Math.max(fp.w, fp.h) * fp.cell;
  const w = (x: number, y: number, z: number) => new THREE.Vector3(x - cx, y, z - cz);

  // ----- renderer / scene -----
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.className = 'viewer3d__canvas';
  container.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#0d0f13', size * 2.2, size * 4.5);
  const camera = new THREE.PerspectiveCamera(32, 1, 1, size * 10);

  scene.add(new THREE.HemisphereLight('#e6eeff', '#23262d', 1.0));
  const sun = new THREE.DirectionalLight('#fff6ea', 3.2);
  sun.position.set(size * 0.9, size * 1.0, size * 0.35);
  sun.castShadow = true;
  sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
  const half = size * 0.75;
  Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 1, far: size * 4 });
  sun.shadow.bias = -0.0006;
  scene.add(sun);
  const fill = new THREE.DirectionalLight('#9ec2ff', 0.55);
  fill.position.set(-size, size * 0.4, -size * 0.6);
  scene.add(fill);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(size * 8, size * 8), new THREE.ShadowMaterial({ opacity: 0.32 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const grid = new THREE.GridHelper(size * 5, 50, '#3a414d', '#252a33');
  grid.position.y = -0.02;
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.55;
  scene.add(grid);

  const mat = (color: string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...opts });
  const M = {
    slab: mat('#bdb8ad', { roughness: 0.95 }),
    stud: mat('#d9b37b', { roughness: 0.8 }),
    wall: mat('#f1eee8'),
    inner: mat('#e4e0d8'),
    glass: mat('#9cc3dc', { roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.4, side: THREE.DoubleSide }),
    frame: mat('#2a2f38', { roughness: 0.5, metalness: 0.3 }),
    garage: mat('#e7e4de', { roughness: 0.6 }),
    door: mat('#6b4a2f', { roughness: 0.6 }),
    roof: mat('#4c525c', { roughness: 0.88, flatShading: true }),
    fascia: mat('#f1eee8', { roughness: 0.7 }),
    column: mat('#f4f1ea', { roughness: 0.6 }),
  };

  // ----- helpers -----
  const boxes = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const addBox = (m: THREE.Material, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) => {
    const g = new THREE.BoxGeometry(Math.abs(x1 - x0) || 0.01, Math.abs(y1 - y0) || 0.01, Math.abs(z1 - z0) || 0.01);
    g.translate((x0 + x1) / 2 - cx, (y0 + y1) / 2, (z0 + z1) / 2 - cz);
    if (!boxes.has(m)) boxes.set(m, []);
    boxes.get(m)!.push(g);
  };
  const flush = (group: THREE.Group) => {
    for (const [m, list] of boxes) {
      const mesh = new THREE.Mesh(mergeGeometries(list)!, m);
      mesh.castShadow = m !== M.glass;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    boxes.clear();
  };

  // ----- slab (footprint) -----
  const slabGroup = new THREE.Group();
  const foot = decode(fp);
  foot.forEach((row, j) => {
    let i = 0;
    while (i < row.length) {
      if (!row[i]) {
        i++;
        continue;
      }
      let k = i;
      while (k < row.length && row[k]) k++;
      const x0 = fp.origin[0] + i * fp.cell;
      const x1 = fp.origin[0] + k * fp.cell;
      const z0 = fp.origin[1] + j * fp.cell;
      addBox(M.slab, x0, 0, z0, x1, F, z0 + fp.cell);
      i = k;
    }
  });
  flush(slabGroup);
  scene.add(slabGroup);

  // ----- plan sheet on the slab -----
  const planTex = new THREE.TextureLoader().load(planUrl);
  planTex.colorSpace = THREE.SRGBColorSpace;
  planTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const planMat = new THREE.MeshBasicMaterial({ map: planTex, transparent: true, depthWrite: false, toneMapped: false, fog: false });
  const plan = new THREE.Mesh(new THREE.PlaneGeometry(px1 - px0, pz1 - pz0), planMat);
  plan.rotation.x = -Math.PI / 2;
  plan.position.copy(w((px0 + px1) / 2, F + 0.03, (pz0 + pz1) / 2));
  plan.renderOrder = 2;
  scene.add(plan);

  // ----- framing (studs + plates) -----
  const framing = new THREE.Group();
  const studGeo = new THREE.BoxGeometry(1, 1, 1);
  const studMats: THREE.Matrix4[] = [];
  const addStud = (x: number, z: number, sx: number, sz: number, y0: number, y1: number) =>
    studMats.push(new THREE.Matrix4().compose(w(x, (y0 + y1) / 2, z), new THREE.Quaternion(), new THREE.Vector3(sx, y1 - y0, sz)));
  for (const [x0, z0, x1, z1] of model.walls) {
    const along = Math.abs(x1 - x0) >= Math.abs(z1 - z0);
    const len = along ? Math.abs(x1 - x0) : Math.abs(z1 - z0);
    const t = along ? Math.abs(z1 - z0) : Math.abs(x1 - x0);
    const n = Math.max(1, Math.round(len / (16 / 12)));
    for (let s = 0; s <= n; s++) {
      const u = (along ? Math.min(x0, x1) : Math.min(z0, z1)) + Math.min(len - 0.06, Math.max(0.06, (len * s) / n));
      if (along) addStud(u, (z0 + z1) / 2, 0.125, t * 0.9, F, P - 0.25);
      else addStud((x0 + x1) / 2, u, t * 0.9, 0.125, F, P - 0.25);
    }
    // top & bottom plates
    addBox(M.stud, Math.min(x0, x1), P - 0.25, Math.min(z0, z1), Math.max(x0, x1), P, Math.max(z0, z1));
    addBox(M.stud, Math.min(x0, x1), F, Math.min(z0, z1), Math.max(x0, x1), F + 0.125, Math.max(z0, z1));
  }
  // headers over openings (framing)
  for (const [x0, z0, x1, z1, kind] of model.openings) {
    const spec = OPENING_SPEC[kind];
    addBox(M.stud, x0, F + spec.head, z0, x1, P, z1);
  }
  flush(framing);
  const studs = new THREE.InstancedMesh(studGeo, M.stud, studMats.length);
  studMats.forEach((m, i) => studs.setMatrixAt(i, m));
  studs.castShadow = true;
  framing.add(studs);
  scene.add(framing);

  // ----- finished walls, openings, glazing -----
  const walls = new THREE.Group();
  for (const [x0, z0, x1, z1, ext] of model.walls) addBox(ext ? M.wall : M.inner, x0, F, z0, x1, P, z1);
  for (const [x0, z0, x1, z1, kind] of model.openings) {
    const spec = OPENING_SPEC[kind];
    const along = Math.abs(x1 - x0) >= Math.abs(z1 - z0);
    // header and sill infill
    addBox(M.wall, x0, F + spec.head, z0, x1, P, z1);
    if (spec.sill > 0) addBox(M.wall, x0, F, z0, x1, F + spec.sill, z1);
    const mz = (z0 + z1) / 2;
    const mx = (x0 + x1) / 2;
    const y0 = F + spec.sill;
    const y1 = F + spec.head;
    if (spec.glass) {
      if (along) {
        addBox(M.glass, x0, y0, mz - 0.03, x1, y1, mz + 0.03);
        addBox(M.frame, x0, y0, mz - 0.12, x1, y0 + 0.15, mz + 0.12);
        addBox(M.frame, x0, y1 - 0.15, mz - 0.12, x1, y1, mz + 0.12);
        const panes = Math.max(1, Math.round(Math.abs(x1 - x0) / 3));
        for (let p = 0; p <= panes; p++) {
          const x = x0 + ((x1 - x0) * p) / panes;
          addBox(M.frame, x - 0.08, y0, mz - 0.12, x + 0.08, y1, mz + 0.12);
        }
      } else {
        addBox(M.glass, mx - 0.03, y0, z0, mx + 0.03, y1, z1);
        addBox(M.frame, mx - 0.12, y0, z0, mx + 0.12, y0 + 0.15, z1);
        addBox(M.frame, mx - 0.12, y1 - 0.15, z0, mx + 0.12, y1, z1);
        const panes = Math.max(1, Math.round(Math.abs(z1 - z0) / 3));
        for (let p = 0; p <= panes; p++) {
          const z = z0 + ((z1 - z0) * p) / panes;
          addBox(M.frame, mx - 0.12, y0, z - 0.08, mx + 0.12, y1, z + 0.08);
        }
      }
    } else if (kind === 'garage') {
      for (let k = 0; k < 4; k++) {
        const ya = y0 + ((y1 - y0) * k) / 4 + 0.05;
        const yb = y0 + ((y1 - y0) * (k + 1)) / 4 - 0.05;
        if (along) addBox(M.garage, x0, ya, mz - 0.15, x1, yb, mz + 0.15);
        else addBox(M.garage, mx - 0.15, ya, z0, mx + 0.15, yb, z1);
      }
    } else if (kind === 'door') {
      if (along) addBox(M.door, x0 + 0.2, y0, mz - 0.1, x1 - 0.2, y1, mz + 0.1);
      else addBox(M.door, mx - 0.1, y0, z0 + 0.2, mx + 0.1, y1, z1 - 0.2);
    }
  }
  // lanai columns
  for (const [x, z] of model.columns) addBox(M.column, x - 0.4, F, z - 0.4, x + 0.4, P, z + 0.4);
  flush(walls);
  scene.add(walls);

  // ----- hip roof: height = eave + pitch × chessboard distance to the roof edge -----
  const roofGroup = new THREE.Group();
  const fasciaPos: number[] = [];
  {
    const r = model.roof;
    const cells = decode(r);
    const W = r.w;
    const Hh = r.h;
    const inside = (i: number, j: number) => j >= 0 && j < Hh && i >= 0 && i < W && cells[j][i];
    // vertex grid (W+1)×(H+1); boundary vertices get distance 0
    const VW = W + 1;
    const d = new Float32Array((W + 1) * (Hh + 1)).fill(1e9);
    for (let j = 0; j <= Hh; j++)
      for (let i = 0; i <= W; i++) {
        const all = inside(i - 1, j - 1) && inside(i, j - 1) && inside(i - 1, j) && inside(i, j);
        if (!all) d[j * VW + i] = 0;
      }
    for (let j = 0; j <= Hh; j++)
      for (let i = 0; i <= W; i++) {
        let v = d[j * VW + i];
        if (i > 0) v = Math.min(v, d[j * VW + i - 1] + 1);
        if (j > 0) v = Math.min(v, d[(j - 1) * VW + i] + 1);
        if (i > 0 && j > 0) v = Math.min(v, d[(j - 1) * VW + i - 1] + 1);
        if (i < W && j > 0) v = Math.min(v, d[(j - 1) * VW + i + 1] + 1);
        d[j * VW + i] = v;
      }
    for (let j = Hh; j >= 0; j--)
      for (let i = W; i >= 0; i--) {
        let v = d[j * VW + i];
        if (i < W) v = Math.min(v, d[j * VW + i + 1] + 1);
        if (j < Hh) v = Math.min(v, d[(j + 1) * VW + i] + 1);
        if (i < W && j < Hh) v = Math.min(v, d[(j + 1) * VW + i + 1] + 1);
        if (i > 0 && j < Hh) v = Math.min(v, d[(j + 1) * VW + i - 1] + 1);
        d[j * VW + i] = v;
      }
    // eave: overhang = distance from roof edge to the wall face
    const overhang = Math.max(0.5, (fp.origin[0] - r.origin[0]) || 1);
    const eave = P - model.pitch * overhang;
    const hy = (i: number, j: number) => eave + model.pitch * d[j * VW + i] * r.cell;
    const vx = (i: number) => r.origin[0] + i * r.cell - cx;
    const vz = (j: number) => r.origin[1] + j * r.cell - cz;

    const pos: number[] = [];
    const tri = (a: number[], b: number[], c: number[]) => pos.push(...a, ...b, ...c);
    for (let j = 0; j < Hh; j++)
      for (let i = 0; i < W; i++) {
        if (!cells[j][i]) continue;
        const a = [vx(i), hy(i, j), vz(j)];
        const b = [vx(i + 1), hy(i + 1, j), vz(j)];
        const c = [vx(i + 1), hy(i + 1, j + 1), vz(j + 1)];
        const e = [vx(i), hy(i, j + 1), vz(j + 1)];
        // split along the diagonal whose ends are closest in height, so hips and valleys stay crisp
        if (Math.abs(a[1] - c[1]) <= Math.abs(b[1] - e[1])) {
          tri(a, e, c);
          tri(a, c, b);
        } else {
          tri(a, e, b);
          tri(b, e, c);
        }
        // fascia on outer edges
        const edge = (p: number[], q: number[]) => {
          const pl = [p[0], p[1] - 0.9, p[2]];
          const ql = [q[0], q[1] - 0.9, q[2]];
          fasciaPos.push(...p, ...pl, ...q, ...q, ...pl, ...ql);
        };
        if (!inside(i, j - 1)) edge(b, a);
        if (!inside(i, j + 1)) edge(e, c);
        if (!inside(i - 1, j)) edge(a, e);
        if (!inside(i + 1, j)) edge(c, b);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    const roof = new THREE.Mesh(g, M.roof);
    roof.castShadow = true;
    roof.receiveShadow = true;
    roofGroup.add(roof);
    const fg = new THREE.BufferGeometry();
    fg.setAttribute('position', new THREE.Float32BufferAttribute(fasciaPos, 3));
    fg.computeVertexNormals();
    const fascia = new THREE.Mesh(fg, new THREE.MeshStandardMaterial({ color: '#f1eee8', roughness: 0.7, side: THREE.DoubleSide }));
    roofGroup.add(fascia);
    // soffit underside
    const soffit = new THREE.Mesh(g.clone(), new THREE.MeshStandardMaterial({ color: '#d9d5cd', side: THREE.BackSide }));
    soffit.position.y = -0.9;
    roofGroup.add(soffit);
  }
  scene.add(roofGroup);

  // ----- fade helpers -----
  const fadeables = new Map<THREE.Material, number>();
  const collect = (g: THREE.Object3D) =>
    g.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | undefined;
      if (m && !fadeables.has(m)) fadeables.set(m, m.opacity ?? 1);
    });
  [framing, walls, roofGroup].forEach(collect);
  const setOpacity = (g: THREE.Object3D, f: number) => {
    g.visible = f > 0.01;
    g.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (!m) return;
      const base = fadeables.get(m) ?? 1;
      const transparent = base * f < 0.999;
      if (m.transparent !== transparent) {
        m.transparent = transparent;
        m.needsUpdate = true;
      }
      m.opacity = base * f;
      m.depthWrite = f > 0.6 && base >= 1;
      o.castShadow = f > 0.5 && m !== M.glass;
    });
  };

  // ----- camera path: top-down over the plan -> three-quarter view -----
  const target = new THREE.Vector3(0, H * 0.35, 0);
  const sph = new THREE.Spherical();
  const from = { r: size * 2.15, polar: 0.002, az: 0 };
  const to = { r: size * 2.55, polar: 1.0, az: 0.62 };

  const apply = (p: number) => {
    // 01 plan (0–0.18) · 02 framing (0.18–0.42) · 03 walls (0.42–0.64) · 04 roof (0.64–0.86)
    const frameUp = smooth(0.16, 0.4, p);
    framing.scale.y = Math.max(frameUp, 0.001);
    setOpacity(framing, (frameUp > 0 ? 1 : 0) * (1 - smooth(0.52, 0.66, p)));
    const wallIn = smooth(0.42, 0.6, p);
    walls.scale.y = Math.max(0.001, 0.4 + 0.6 * wallIn);
    setOpacity(walls, wallIn);
    const roofIn = smooth(0.64, 0.84, p);
    roofGroup.position.y = (1 - roofIn) * H * 1.2;
    setOpacity(roofGroup, roofIn);
    planMat.opacity = 1 - 0.55 * smooth(0.45, 0.7, p);

    const c = ease(smooth(0.06, 0.66, p));
    sph.set(from.r + (to.r - from.r) * c, from.polar + (to.polar - from.polar) * c, from.az + (to.az - from.az) * c + (p > 0.86 ? (p - 0.86) * 0.9 : 0));
    camera.position.setFromSpherical(sph).add(target);
    camera.lookAt(target);
  };

  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = camera.aspect < 1 ? 44 : camera.aspect < 1.3 ? 36 : 30;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '100px' });
  io.observe(container);

  let target01 = reduced ? 1 : 0;
  let cur = -1;
  let last = performance.now();
  let raf = 0;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (!visible || document.hidden) return;
    const next = cur < 0 ? target01 : cur + (target01 - cur) * Math.min(1, dt * 7);
    if (Math.abs(next - cur) > 1e-5) {
      cur = Math.abs(target01 - next) < 1e-4 ? target01 : next;
      apply(cur);
    }
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(loop);
  container.classList.add('is-ready');

  return {
    setBuild(p: number) {
      target01 = reduced ? 1 : Math.min(1, Math.max(0, p));
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      renderer.dispose();
    },
  };
}
