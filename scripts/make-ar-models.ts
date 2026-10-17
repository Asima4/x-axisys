// Builds the tabletop-scale AR models in public/models/ar/ (Draco-compressed GLB, metres).
//   npx tsx scripts/make-ar-models.ts [path/to/food-court-ar-raw.glb]
// The wood and steel frames come straight from the procedural models (feet -> metres at 1:40 / 1:75). The food court
// input is a pre-scaled (1:50) GLB exported from the Revit IFC; it is only re-compressed here.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { draco } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { mkdirSync } from 'node:fs';
import { buildPieces, type Piece } from '../src/scripts/woodFrame';
import { buildSteelPieces } from '../src/scripts/steelFrame';
import { buildMepPieces } from '../src/scripts/mepFrame';
import { MEMBERS, type Member } from '../src/data/woodFrame';
import { STEEL_MEMBERS } from '../src/data/steelFrame';
import { MEP_MEMBERS } from '../src/data/mepModel';

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.encoder': await draco3d.createEncoderModule(),
  'draco3d.decoder': await draco3d.createDecoderModule(),
});
mkdirSync('public/models/ar', { recursive: true });

// ----- procedural models (wood 1:40, steel 1:75, MEP 1:40) -----
const unitBox = new THREE.BoxGeometry(1, 1, 1);
const unitCyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 10);
const m4 = new THREE.Matrix4();
async function exportFrame(name: string, pieces: Piece[], members: Record<string, Member>, ratio: number, lift: number) {
  const S = 0.3048 / ratio;
  const doc = new Document();
  const buffer = doc.createBuffer();
  const scene = doc.createScene(name);
  const bounds = new THREE.Box3();
  for (const p of pieces) bounds.expandByPoint(p.pos);
  const c = bounds.getCenter(new THREE.Vector3());
  const offset = new THREE.Vector3(-c.x, lift, -c.z);
  for (const id of Object.keys(members)) {
    const mine = pieces.filter((p) => p.c === id);
    if (!mine.length) continue;
    const geo = mergeGeometries(mine.map((p) => (p.shape === 'box' ? unitBox : unitCyl).clone().applyMatrix4(m4.compose(p.pos.clone().add(offset), p.quat, p.size))))!;
    geo.scale(S, S, S);
    const member = members[id];
    const col = new THREE.Color(member.color);
    const steel = member.kind === 'steel';
    const prim = doc
      .createPrimitive()
      .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(geo.getAttribute('position').array)).setBuffer(buffer))
      .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(geo.getAttribute('normal').array)).setBuffer(buffer))
      .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(geo.getIndex()!.array)).setBuffer(buffer))
      .setMaterial(doc.createMaterial(member.name).setBaseColorFactor([col.r, col.g, col.b, 1]).setMetallicFactor(steel ? 0.7 : 0).setRoughnessFactor(steel ? 0.4 : 0.8));
    scene.addChild(doc.createNode(id).setMesh(doc.createMesh(id).addPrimitive(prim)));
  }
  await doc.transform(draco());
  await io.write(`public/models/ar/${name}.glb`, doc);
  console.log(`${name}.glb`, pieces.length, 'pieces');
}
await exportFrame('wood-frame', buildPieces(), MEMBERS, 40, 0.5);
await exportFrame('steel-frame', buildSteelPieces(), STEEL_MEMBERS, 75, 3.5);
await exportFrame('mep-model', buildMepPieces(), MEP_MEMBERS, 40, 2.2);

// ----- food court (optional input) -----
const fc = process.argv[2];
if (fc) {
  const d = await io.read(fc);
  await d.transform(draco());
  await io.write('public/models/ar/container-food-court.glb', d);
  console.log('container-food-court.glb');
}
