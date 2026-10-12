// Builds the tabletop-scale AR models in public/models/ar/ (Draco-compressed GLB, metres).
//   npx tsx scripts/make-ar-models.ts [path/to/food-court-ar-raw.glb]
// The wood frame comes straight from the procedural model (feet -> metres at 1:40). The food court
// input is a pre-scaled (1:50) GLB exported from the Revit IFC; it is only re-compressed here.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { draco } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { mkdirSync } from 'node:fs';
import { buildPieces } from '../src/scripts/woodFrame';
import { MEMBERS, type MemberId } from '../src/data/woodFrame';

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.encoder': await draco3d.createEncoderModule(),
  'draco3d.decoder': await draco3d.createDecoderModule(),
});
mkdirSync('public/models/ar', { recursive: true });

// ----- wood frame -----
const S = 0.3048 / 40;
const doc = new Document();
const buffer = doc.createBuffer();
const scene = doc.createScene('wood-frame');
const pieces = buildPieces();
const bounds = new THREE.Box3();
for (const p of pieces) bounds.expandByPoint(p.pos);
const c = bounds.getCenter(new THREE.Vector3());
const offset = new THREE.Vector3(-c.x, 0.5, -c.z);
const unitBox = new THREE.BoxGeometry(1, 1, 1);
const unitCyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 10);
const m4 = new THREE.Matrix4();
for (const id of Object.keys(MEMBERS) as MemberId[]) {
  const mine = pieces.filter((p) => p.c === id);
  if (!mine.length) continue;
  const geo = mergeGeometries(mine.map((p) => (p.shape === 'box' ? unitBox : unitCyl).clone().applyMatrix4(m4.compose(p.pos.clone().add(offset), p.quat, p.size))))!;
  geo.scale(S, S, S);
  const member = MEMBERS[id] as (typeof MEMBERS)[MemberId] & { kind?: string };
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
await io.write('public/models/ar/wood-frame.glb', doc);
console.log('wood-frame.glb', pieces.length, 'pieces');

// ----- food court (optional input) -----
const fc = process.argv[2];
if (fc) {
  const d = await io.read(fc);
  await d.transform(draco());
  await io.write('public/models/ar/container-food-court.glb', d);
  console.log('container-food-court.glb');
}
