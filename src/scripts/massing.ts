// Live massing preview for the scope builder: footprint, storeys and roof form update as the visitor answers.
import * as THREE from 'three';

export type Massing = { type: string; area: number; stories: number; system: string };

const FLOOR: Record<string, number> = { industrial: 24, commercial: 14, multifamily: 10.5 };
const GABLE = new Set(['single-family', 'adu', 'addition']);

export function mountMassing(container: HTMLElement, label?: HTMLElement) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.prepend(renderer.domElement);
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 1, 4000);
  scene.add(new THREE.HemisphereLight('#dfe9ff', '#1a1d24', 1.4));
  const sun = new THREE.DirectionalLight('#ffffff', 1.6);
  sun.position.set(-1, 2, 1.4);
  scene.add(sun);
  const grid = new THREE.GridHelper(1, 24, '#2f3642', '#20252e');
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.7;
  scene.add(grid);

  const group = new THREE.Group();
  scene.add(group);
  const fill = new THREE.MeshStandardMaterial({ color: '#2d5f9e', transparent: true, opacity: 0.32, roughness: 0.6, depthWrite: false, side: THREE.DoubleSide });
  const solid = new THREE.MeshStandardMaterial({ color: '#3f78bf', transparent: true, opacity: 0.55, roughness: 0.5 });
  const edge = new THREE.LineBasicMaterial({ color: '#8fc0ff' });
  const plate = new THREE.LineBasicMaterial({ color: '#5b9be6', transparent: true, opacity: 0.6 });

  let span = 60;
  let targetH = 1;
  let grow = 1;
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material = fill) => {
    group.add(new THREE.Mesh(geo, mat));
    group.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 20), edge));
  };

  const update = (m: Massing) => {
    group.clear();
    const stories = Math.max(1, m.stories);
    const perFloor = Math.max(150, m.area / stories);
    const ratio = m.type === 'multifamily' || m.type === 'commercial' ? 1.8 : 1.35;
    const w = Math.sqrt(perFloor * ratio);
    const d = perFloor / w;
    const fh = FLOOR[m.type] ?? 10;
    const H = stories * fh;
    if (m.type === 'modular') {
      // stacked 8' x 40' modules
      const n = Math.max(1, Math.round(perFloor / 320));
      const cols = Math.ceil(Math.sqrt(n / 4)) || 1;
      for (let s = 0; s < stories; s++)
        for (let i = 0; i < n; i++) {
          const g = new THREE.BoxGeometry(40, 9.5, 8);
          g.translate((i % cols) * 42 - (cols - 1) * 21, s * 9.6 + 4.75, Math.floor(i / cols) * 8.6 - (Math.ceil(n / cols) - 1) * 4.3);
          add(g, solid);
        }
      span = Math.max(cols * 42, Math.ceil(n / cols) * 8.6, stories * 9.6);
    } else {
      const g = new THREE.BoxGeometry(w, H, d);
      g.translate(0, H / 2, 0);
      add(g);
      for (let s = 1; s < stories; s++) {
        const pts = [new THREE.Vector3(-w / 2, s * fh, -d / 2), new THREE.Vector3(w / 2, s * fh, -d / 2), new THREE.Vector3(w / 2, s * fh, d / 2), new THREE.Vector3(-w / 2, s * fh, d / 2), new THREE.Vector3(-w / 2, s * fh, -d / 2)];
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), plate));
      }
      if (GABLE.has(m.type)) {
        const rise = (Math.min(w, d) / 2) * 0.5;
        const shape = new THREE.Shape([new THREE.Vector2(-d / 2, 0), new THREE.Vector2(d / 2, 0), new THREE.Vector2(0, rise)]);
        const roof = new THREE.ExtrudeGeometry(shape, { depth: w, bevelEnabled: false });
        roof.rotateY(Math.PI / 2);
        roof.translate(-w / 2, H, 0);
        add(roof, solid);
      } else {
        const par = new THREE.BoxGeometry(w + 0.6, 3, d + 0.6);
        par.translate(0, H + 1.5, 0);
        group.add(new THREE.LineSegments(new THREE.EdgesGeometry(par), edge));
      }
      // structural grid hint
      const bays = Math.max(2, Math.round(w / (m.system === 'steel' || m.system === 'concrete' ? 25 : 16)));
      for (let i = 0; i <= bays; i++) {
        const x = -w / 2 + (i * w) / bays;
        for (const z of [-d / 2, d / 2]) {
          const col = new THREE.BoxGeometry(0.8, H, 0.8);
          col.translate(x, H / 2, z);
          group.add(new THREE.Mesh(col, solid));
        }
      }
      span = Math.max(w, d, H * 1.2);
    }
    grid.scale.setScalar(span * 3);
    targetH = H;
    grow = reduced ? 1 : 0;
    if (label) label.textContent = m.type === 'modular' ? `${stories} storey${stories > 1 ? 's' : ''} of modules · ≈${Math.round(perFloor).toLocaleString()} sq ft per floor` : `≈ ${Math.round(w)}' × ${Math.round(d)}' footprint · ${stories} storey${stories > 1 ? 's' : ''} · ${Math.round(H + (GABLE.has(m.type) ? (Math.min(w, d) / 2) * 0.5 : 3))}' high`;
  };

  const resize = () => {
    const { clientWidth: cw, clientHeight: ch } = container;
    if (!cw || !ch) return;
    renderer.setSize(cw, ch, false);
    camera.aspect = cw / ch;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(container);
  resize();

  let angle = 0.7;
  let dist = 200;
  let raf = 0;
  let last = performance.now();
  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!reduced) angle += dt * 0.25;
    grow = Math.min(1, grow + dt * 2.2);
    group.scale.y = 1 - Math.pow(1 - grow, 3);
    dist += (span * 2.6 - dist) * Math.min(1, dt * 4);
    camera.position.set(Math.cos(angle) * dist, dist * 0.55 + targetH * 0.3, Math.sin(angle) * dist);
    camera.lookAt(0, targetH * 0.4, 0);
    renderer.render(scene, camera);
  };
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    } else if (!e.isIntersecting && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  });
  io.observe(container);
  return { update };
}
