/**
 * Esqueleto 3D a partir das poses 2D de `exercise-motion.ts`.
 * O desenho vira o plano X/Y; braços e pernas ganham profundidade (Z) e são resolvidos
 * com cinemática inversa 3D — assim cotovelos e joelhos podem abrir para os lados.
 */
import * as THREE from 'three';
import { interpolate, MOTIONS, SEG, solve, type Motion, type Motion3D, type MotionKey, type P, type Pose, type Skeleton } from './exercise-motion';

export const U = 0.1; // 1 unidade do desenho = 0,1 na cena
export const DEPTH = { shoulder: 12, hip: 7 };

/** Ponto do desenho (y para baixo, chão em 140) → cena (y para cima, chão em 0). */
export const v3 = (p: P, z = 0) => new THREE.Vector3((p[0] - 100) * U, (140 - p[1]) * U, z * U);

export interface Skel3 {
  view: Motion['view'];
  head: THREE.Vector3;
  neck: THREE.Vector3;
  hip: THREE.Vector3;
  shoulders: [THREE.Vector3, THREE.Vector3];
  hips: [THREE.Vector3, THREE.Vector3];
  elbows: [THREE.Vector3, THREE.Vector3];
  hands: [THREE.Vector3, THREE.Vector3];
  knees: [THREE.Vector3, THREE.Vector3];
  ankles: [THREE.Vector3, THREE.Vector3];
  toes: [THREE.Vector3, THREE.Vector3];
  /** esqueleto 2D de origem (para acessórios que só dependem do plano) */
  flat: Skeleton;
}

/** Cinemática inversa de 2 segmentos em 3D, com vetor de "polo" (para onde dobra a articulação). */
function ik3(root: THREE.Vector3, target: THREE.Vector3, a: number, b: number, pole: THREE.Vector3): [THREE.Vector3, THREE.Vector3] {
  const toT = target.clone().sub(root);
  const raw = Math.max(toT.length(), 1e-4);
  const d = Math.min(Math.max(raw, Math.abs(a - b) + 0.01), a + b - 0.001);
  const u = toT.divideScalar(raw);
  const x = (a * a - b * b + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(a * a - x * x, 0));
  let perp = pole.clone().sub(u.clone().multiplyScalar(pole.dot(u)));
  if (perp.lengthSq() < 1e-8) perp = new THREE.Vector3(0, 0, 1).cross(u);
  if (perp.lengthSq() < 1e-8) perp = new THREE.Vector3(1, 0, 0);
  perp.normalize();
  const mid = root.clone().addScaledVector(u, x).addScaledVector(perp, h);
  const end = root.clone().addScaledVector(u, d);
  return [mid, end];
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/**
 * Movimentos que no 3D usam outra coreografia. O crucifixo, por exemplo, é deitado no banco:
 * no 2D (vista frontal) os braços abrem e fecham; no 3D eles descem para os lados e sobem em arco.
 */
const OVERRIDE_3D: Partial<Record<MotionKey, Motion>> = {
  fly: {
    view: 'side',
    dur: 2800,
    props: [
      { kind: 'line', pts: [[48, 111], [134, 111]], w: 6 },
      { kind: 'line', pts: [[58, 111], [58, 140]], w: 3 },
      { kind: 'line', pts: [[124, 111], [124, 140]], w: 3 },
    ],
    a: { hip: [120, 105], t: -90, hands: [[78, 112], [78, 112]], feet: [[148, 140], [142, 140]] },
    b: { hip: [120, 105], t: -90, hands: [[77, 62], [77, 62]], feet: [[148, 140], [142, 140]] },
    d3: { a: { hands: [52, 52], feet: [14, 14] }, b: { hands: [5, 5] }, armPole: [0, 1, 1], slerpHands: true },
  },
};
export const motion3DFor = (key: MotionKey): Motion => OVERRIDE_3D[key] ?? MOTIONS[key];

/** Esqueleto 3D do movimento no instante k (0 = início, 1 = fim). */
export function skeleton3D(m: Motion, k: number): Skel3 {
  const pose: Pose = interpolate(m, k);
  const s = solve(m.view, pose);
  const side = m.view === 'side';
  const d3: Motion3D | undefined = m.d3;
  const sideZ = (i: 0 | 1, v: number) => (side ? (i ? -v : v) : v);

  const shoulders: [THREE.Vector3, THREE.Vector3] = [v3(s.shoulders[0], side ? DEPTH.shoulder : 0), v3(s.shoulders[1], side ? -DEPTH.shoulder : 0)];
  const hips: [THREE.Vector3, THREE.Vector3] = [v3(s.hips[0], side ? DEPTH.hip : 0), v3(s.hips[1], side ? -DEPTH.hip : 0)];

  const handOut = (i: 0 | 1) => {
    const za = d3?.a?.hands?.[i] ?? (side ? DEPTH.shoulder - 2 : 0);
    const zb = d3?.b?.hands?.[i] ?? za;
    return sideZ(i, lerp(za, zb, k));
  };
  const footOut = (i: 0 | 1) => {
    const za = d3?.a?.feet?.[i] ?? (side ? DEPTH.hip : 0);
    const zb = d3?.b?.feet?.[i] ?? za;
    return sideZ(i, lerp(za, zb, k));
  };

  const pole = (i: 0 | 1, hint: [number, number, number] | undefined, root: P, joint: P) =>
    hint ? new THREE.Vector3(hint[0], -hint[1], sideZ(i, hint[2])) : new THREE.Vector3(joint[0] - root[0], -(joint[1] - root[1]), 0);

  const A = SEG.upperArm * U;
  const B = SEG.foreArm * U;
  const T = SEG.thigh * U;
  const S = SEG.shin * U;

  // Alvo das mãos: posição 2D desejada + profundidade (ou arco 3D ao redor do ombro)
  const handTarget = (i: 0 | 1) => {
    if (!d3?.slerpHands) return v3(pose.hands[i], handOut(i));
    const at = (p: Pose, kk: number) => {
      const sp = solve(m.view, p);
      const sh = v3(sp.shoulders[i], side ? sideZ(i, DEPTH.shoulder) : 0);
      const za = d3.a?.hands?.[i] ?? 0;
      const zb = d3.b?.hands?.[i] ?? za;
      return v3(p.hands[i], sideZ(i, kk ? zb : za)).sub(sh);
    };
    const va = at(m.a, 0);
    const vb = at(m.b, 1);
    const len = lerp(va.length(), vb.length(), k);
    const dir = va.clone().normalize().lerp(vb.clone().normalize(), k);
    // slerp simples: normaliza a direção interpolada (arco suave)
    return shoulders[i].clone().add(dir.normalize().multiplyScalar(len));
  };

  const arms = ([0, 1] as const).map((i) => ik3(shoulders[i], handTarget(i), A, B, pole(i, d3?.armPole, s.shoulders[i], s.elbows[i])));
  const legs = ([0, 1] as const).map((i) => ik3(hips[i], v3(pose.feet[i], footOut(i)), T, S, pole(i, d3?.legPole, s.hips[i], s.knees[i])));

  const toe = (i: 0 | 1) => {
    const an = legs[i][1];
    const off = new THREE.Vector3((s.toes[i][0] - s.ankles[i][0]) * U, -(s.toes[i][1] - s.ankles[i][1]) * U, 0);
    if (!side) off.set(0, -0.15, 0.7); // de frente, a ponta do pé aponta para a câmera
    return an.clone().add(off);
  };

  return {
    view: m.view,
    head: v3(s.head),
    neck: v3(s.neck),
    hip: v3(s.hip),
    shoulders,
    hips,
    elbows: [arms[0][0], arms[1][0]],
    hands: [arms[0][1], arms[1][1]],
    knees: [legs[0][0], legs[1][0]],
    ankles: [legs[0][1], legs[1][1]],
    toes: [toe(0), toe(1)],
    flat: s,
  };
}
