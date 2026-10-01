/**
 * Motor de animação dos hologramas de exercício.
 * Cada movimento tem duas poses-chave (A = início, B = fim); a figura oscila A → B → A.
 * As poses definem só quadril, inclinação do tronco, mãos e pés — cotovelos e joelhos
 * são resolvidos por cinemática inversa de dois segmentos.
 * Coordenadas no viewBox "0 -20 200 170" (chão em y = 140), vista lateral olhando para a direita.
 */
import type { MuscleGroup } from '@/types';

export type P = [number, number];

export interface Pose {
  hip: P;
  /** inclinação do tronco em graus (0 = em pé; + = para frente; -90 = deitado com a cabeça à esquerda) */
  t: number;
  /** [perto, longe] na vista lateral · [direita, esquerda] na vista frontal */
  hands: [P, P];
  feet: [P, P];
  /** lado para onde dobram cotovelos/joelhos (+1/-1) */
  eb?: [number, number];
  kb?: [number, number];
}

export type Prop =
  | { kind: 'line'; pts: P[]; w?: number }
  | { kind: 'cable'; anchor: P }
  | { kind: 'feetplate' }
  | { kind: 'pad' }
  | { kind: 'hipbar' }
  | { kind: 'circle'; c: P; r: number };

export interface Motion {
  view: 'side' | 'front';
  a: Pose;
  b: Pose;
  /** duração de um ciclo completo (ms) */
  dur: number;
  props?: Prop[];
  floor?: boolean;
  /** exercício isométrico (segurar) */
  hold?: boolean;
  /** interpola mãos/pés em arco (ao redor do ombro/quadril) em vez de linha reta */
  arc?: ('hands' | 'feet')[];
  /** profundidade para o holograma 3D (ignorada no 2D) */
  d3?: Motion3D;
}

type Pair = [number, number];

/** Dicas de profundidade de um movimento para o 3D (em unidades do desenho). */
export interface Motion3D {
  /**
   * Afastamento das mãos/pés. Vista lateral: distância para fora do centro do corpo.
   * Vista frontal: quanto ficam à frente do corpo.
   */
  a?: { hands?: Pair; feet?: Pair };
  b?: { hands?: Pair; feet?: Pair };
  /** para onde apontam cotovelos / joelhos: [x (+ = frente), y (+ = para baixo), lado (+ = para fora / frente)] */
  armPole?: [number, number, number];
  legPole?: [number, number, number];
  /** mãos percorrem um arco ao redor do ombro (crucifixo) */
  slerpHands?: boolean;
}

export const SEG = { torso: 46, upperArm: 24, foreArm: 22, thigh: 30, shin: 30, head: 13, headR: 8 };

const stand = (over: Partial<Pose> = {}): Pose => ({
  hip: [100, 80],
  t: 0,
  hands: [[103, 80], [99, 80]],
  feet: [[102, 140], [98, 140]],
  ...over,
});

const BENCH: Prop = { kind: 'line', pts: [[48, 111], [134, 111]], w: 6 };
const BENCH_LEGS: Prop[] = [
  { kind: 'line', pts: [[58, 111], [58, 140]], w: 3 },
  { kind: 'line', pts: [[124, 111], [124, 140]], w: 3 },
];
const SEAT = (x1: number, x2: number, y: number): Prop[] => [
  { kind: 'line', pts: [[x1, y], [x2, y]], w: 6 },
  { kind: 'line', pts: [[(x1 + x2) / 2, y], [(x1 + x2) / 2, 140]], w: 3 },
];

export const MOTIONS = {
  squat: {
    view: 'side', dur: 2600,
    a: stand({ hands: [[140, 44], [138, 46]], feet: [[104, 140], [98, 140]] }),
    b: { hip: [84, 108], t: 38, hands: [[148, 76], [146, 78]], feet: [[104, 140], [98, 140]] },
    d3: { a: { hands: [8, 8], feet: [10, 10] } },
  },
  squatBar: {
    view: 'side', dur: 2800,
    a: stand({ hands: [[95, 36], [95, 36]], feet: [[104, 140], [98, 140]], eb: [-1, -1] }),
    b: { hip: [84, 108], t: 38, hands: [[107, 70], [107, 70]], feet: [[104, 140], [98, 140]], eb: [-1, -1] },
    d3: { a: { hands: [22, 22], feet: [10, 10] }, armPole: [-1, 1, 0.4] },
  },
  squatGoblet: {
    view: 'side', dur: 2600,
    a: stand({ hands: [[112, 48], [110, 48]], feet: [[104, 140], [98, 140]] }),
    b: { hip: [84, 108], t: 38, hands: [[124, 84], [122, 84]], feet: [[104, 140], [98, 140]] },
    d3: { a: { hands: [3, 3], feet: [10, 10] }, armPole: [0, 1, 0.6] },
  },
  lunge: {
    view: 'side', dur: 2600,
    a: { hip: [100, 84], t: 0, hands: [[103, 84], [99, 84]], feet: [[128, 140], [72, 138]] },
    b: { hip: [100, 108], t: 0, hands: [[103, 108], [99, 108]], feet: [[128, 140], [72, 138]] },
  },
  legPress: {
    view: 'side', dur: 2600, floor: false,
    props: [
      { kind: 'line', pts: [[36, 84], [74, 116]], w: 6 },
      { kind: 'line', pts: [[74, 116], [104, 116]], w: 6 },
      { kind: 'line', pts: [[88, 116], [96, 140]], w: 3 },
      { kind: 'feetplate' },
    ],
    a: { hip: [78, 112], t: -58, hands: [[84, 118], [82, 118]], feet: [[112, 84], [110, 86]] },
    b: { hip: [78, 112], t: -58, hands: [[84, 118], [82, 118]], feet: [[130, 70], [128, 72]] },
  },
  legExtension: {
    view: 'side', dur: 2400, arc: ['feet'],
    props: [...SEAT(66, 112, 106), { kind: 'line', pts: [[66, 106], [60, 58]], w: 6 }, { kind: 'pad' }],
    a: { hip: [88, 100], t: -10, hands: [[94, 108], [92, 108]], feet: [[116, 132], [114, 132]] },
    b: { hip: [88, 100], t: -10, hands: [[94, 108], [92, 108]], feet: [[146, 98], [144, 98]] },
  },
  legCurl: {
    view: 'side', dur: 2400,
    props: [{ kind: 'line', pts: [[36, 112], [150, 112]], w: 6 }, { kind: 'line', pts: [[92, 112], [92, 140]], w: 3 }, { kind: 'pad' }],
    a: { hip: [104, 105], t: -90, hands: [[42, 114], [42, 114]], feet: [[162, 107], [162, 107]], kb: [1, 1] },
    b: { hip: [104, 105], t: -90, hands: [[42, 114], [42, 114]], feet: [[128, 72], [128, 72]], kb: [1, 1] },
  },
  hinge: {
    view: 'side', dur: 2800,
    a: stand({ t: 4, hands: [[106, 82], [104, 82]], feet: [[104, 140], [100, 140]] }),
    b: { hip: [88, 84], t: 72, hands: [[130, 116], [128, 116]], feet: [[104, 140], [100, 140]] },
  },
  hipThrust: {
    view: 'side', dur: 2400,
    props: [{ kind: 'line', pts: [[30, 122], [62, 122]], w: 6 }, { kind: 'line', pts: [[40, 122], [40, 140]], w: 3 }, { kind: 'hipbar' }],
    a: { hip: [100, 126], t: -76, hands: [[104, 124], [102, 124]], feet: [[130, 140], [128, 140]] },
    b: { hip: [100, 102], t: -106, hands: [[104, 100], [102, 100]], feet: [[130, 140], [128, 140]] },
    d3: { a: { hands: [11, 11], feet: [11, 11] } },
  },
  bridge: {
    view: 'side', dur: 2400,
    a: { hip: [100, 130], t: -96, hands: [[98, 139], [96, 139]], feet: [[128, 140], [126, 140]], eb: [-1, -1] },
    b: { hip: [96, 110], t: -118, hands: [[98, 139], [96, 139]], feet: [[128, 140], [126, 140]], eb: [-1, -1] },
    d3: { a: { hands: [16, 16], feet: [11, 11] }, armPole: [0, 1, 0.3] },
  },
  calf: {
    view: 'side', dur: 1800,
    props: [{ kind: 'line', pts: [[90, 142], [120, 142]], w: 4 }],
    a: stand(),
    b: stand({ hip: [100, 71], hands: [[103, 71], [99, 71]], feet: [[102, 131], [98, 131]] }),
  },
  benchPress: {
    view: 'side', dur: 2600,
    props: [BENCH, ...BENCH_LEGS],
    a: { hip: [120, 105], t: -90, hands: [[76, 61], [76, 61]], feet: [[148, 140], [142, 140]] },
    b: { hip: [120, 105], t: -90, hands: [[80, 90], [80, 90]], feet: [[148, 140], [142, 140]] },
    d3: { a: { hands: [19, 19], feet: [14, 14] }, armPole: [0, 1, 1] },
  },
  inclinePress: {
    view: 'side', dur: 2600,
    props: [
      { kind: 'line', pts: [[66, 80], [116, 112]], w: 6 },
      { kind: 'line', pts: [[116, 112], [136, 112]], w: 6 },
      { kind: 'line', pts: [[118, 112], [118, 140]], w: 3 },
    ],
    a: { hip: [118, 108], t: -58, hands: [[92, 40], [90, 40]], feet: [[148, 140], [142, 140]] },
    b: { hip: [118, 108], t: -58, hands: [[92, 76], [90, 76]], feet: [[148, 140], [142, 140]] },
    d3: { a: { hands: [17, 17], feet: [14, 14] }, armPole: [0, 1, 1] },
  },
  fly: {
    view: 'front', dur: 2600, arc: ['hands'],
    a: stand({ hands: [[152, 46], [48, 46]], feet: [[108, 140], [92, 140]] }),
    b: stand({ hands: [[106, 52], [94, 52]], feet: [[108, 140], [92, 140]] }),
  },
  pushUp: {
    view: 'side', dur: 2200,
    a: { hip: [93, 113], t: 65, hands: [[136, 138], [134, 138]], feet: [[40, 138], [40, 138]], kb: [1, 1] },
    b: { hip: [97, 125], t: 78, hands: [[136, 138], [134, 138]], feet: [[40, 138], [40, 138]], kb: [1, 1] },
    d3: { a: { hands: [16, 16], feet: [5, 5] }, armPole: [-1, 0, 0.7] },
  },
  dip: {
    view: 'side', dur: 2400,
    props: [{ kind: 'line', pts: [[36, 92], [74, 92]], w: 6 }, { kind: 'line', pts: [[44, 92], [44, 140]], w: 3 }],
    a: { hip: [82, 98], t: -6, hands: [[70, 90], [68, 90]], feet: [[142, 140], [138, 140]] },
    b: { hip: [82, 120], t: -6, hands: [[70, 90], [68, 90]], feet: [[142, 140], [138, 140]] },
  },
  pulldown: {
    view: 'side', dur: 2600,
    props: [...SEAT(70, 118, 108), { kind: 'line', pts: [[112, 94], [134, 94]], w: 5 }, { kind: 'cable', anchor: [98, -16] }],
    a: { hip: [96, 104], t: -10, hands: [[96, 14], [94, 14]], feet: [[128, 140], [124, 140]] },
    b: { hip: [96, 104], t: -18, hands: [[92, 54], [90, 54]], feet: [[128, 140], [124, 140]] },
    d3: { a: { hands: [24, 24], feet: [10, 10] }, armPole: [0, 0, 1] },
  },
  pullUp: {
    view: 'side', dur: 2600, floor: false,
    props: [{ kind: 'line', pts: [[66, 18], [136, 18]], w: 5 }],
    a: { hip: [100, 104], t: 0, hands: [[104, 18], [100, 18]], feet: [[96, 160], [94, 160]] },
    b: { hip: [100, 78], t: 0, hands: [[104, 18], [100, 18]], feet: [[96, 134], [94, 134]] },
    d3: { a: { hands: [22, 22], feet: [5, 5] }, armPole: [0, 0, 1] },
  },
  bentRow: {
    view: 'side', dur: 2400,
    a: { hip: [92, 84], t: 66, hands: [[134, 110], [132, 110]], feet: [[106, 140], [102, 140]] },
    b: { hip: [92, 84], t: 66, hands: [[118, 88], [116, 88]], feet: [[106, 140], [102, 140]] },
  },
  seatedRow: {
    view: 'side', dur: 2600,
    props: [...SEAT(58, 100, 122), { kind: 'line', pts: [[138, 104], [142, 136]], w: 5 }, { kind: 'cable', anchor: [198, 96] }],
    a: { hip: [84, 116], t: 18, hands: [[140, 84], [138, 84]], feet: [[137, 120], [135, 120]] },
    b: { hip: [84, 116], t: -6, hands: [[98, 94], [96, 94]], feet: [[137, 120], [135, 120]] },
  },
  curl: {
    view: 'side', dur: 2400,
    a: stand({ hands: [[104, 80], [100, 80]] }),
    b: stand({ hands: [[114, 44], [110, 44]] }),
  },
  pushdown: {
    view: 'side', dur: 2200,
    props: [{ kind: 'cable', anchor: [118, -16] }],
    a: stand({ hip: [98, 80], t: 8, hands: [[120, 56], [118, 56]] }),
    b: stand({ hip: [98, 80], t: 8, hands: [[112, 80], [110, 80]] }),
  },
  overheadExt: {
    view: 'side', dur: 2600,
    props: SEAT(74, 118, 108),
    a: { hip: [96, 104], t: 0, hands: [[84, 44], [84, 44]], feet: [[124, 140], [120, 140]] },
    b: { hip: [96, 104], t: 0, hands: [[98, 12], [98, 12]], feet: [[124, 140], [120, 140]] },
  },
  shoulderPress: {
    view: 'front', dur: 2600,
    props: [{ kind: 'line', pts: [[76, 108], [124, 108]], w: 6 }],
    a: { hip: [100, 104], t: 0, hands: [[126, 56], [74, 56]], feet: [[112, 140], [88, 140]], eb: [1, -1] },
    b: { hip: [100, 104], t: 0, hands: [[108, 16], [92, 16]], feet: [[112, 140], [88, 140]], eb: [1, -1] },
    d3: { a: { hands: [4, 4], feet: [27, 27] }, legPole: [0, -1, 1] },
  },
  lateralRaise: {
    view: 'front', dur: 2600, arc: ['hands'],
    a: stand({ hands: [[117, 84], [83, 84]], feet: [[106, 140], [94, 140]] }),
    b: stand({ hands: [[158, 40], [42, 40]], feet: [[106, 140], [94, 140]] }),
    d3: { a: { hands: [3, 3] } },
  },
  facePull: {
    view: 'side', dur: 2400,
    props: [{ kind: 'cable', anchor: [198, 34] }],
    a: stand({ t: -4, hands: [[142, 40], [140, 40]] }),
    b: stand({ t: -4, hands: [[104, 24], [102, 24]], eb: [-1, -1] }),
  },
  crunch: {
    view: 'side', dur: 2200,
    a: { hip: [100, 132], t: -88, hands: [[60, 124], [58, 124]], feet: [[128, 140], [126, 140]] },
    b: { hip: [100, 132], t: -62, hands: [[68, 102], [66, 102]], feet: [[128, 140], [126, 140]] },
  },
  plank: {
    view: 'side', dur: 3200, hold: true,
    a: { hip: [86, 118], t: 80, hands: [[152, 138], [150, 138]], feet: [[30, 138], [30, 138]] },
    b: { hip: [86, 116], t: 80, hands: [[152, 138], [150, 138]], feet: [[30, 138], [30, 138]] },
  },
  legRaise: {
    view: 'side', dur: 2600, arc: ['feet'],
    a: { hip: [110, 134], t: -90, hands: [[106, 139], [104, 139]], feet: [[170, 136], [170, 136]], eb: [-1, -1] },
    b: { hip: [110, 134], t: -90, hands: [[106, 139], [104, 139]], feet: [[114, 74], [114, 74]], eb: [-1, -1] },
    d3: { a: { hands: [15, 15], feet: [4, 4] }, armPole: [0, 1, 0.3] },
  },
  bicycle: {
    view: 'side', dur: 1600,
    a: { hip: [104, 132], t: -68, hands: [[66, 108], [64, 108]], feet: [[114, 104], [164, 122]], kb: [1, 1] },
    b: { hip: [104, 132], t: -68, hands: [[66, 108], [64, 108]], feet: [[164, 122], [114, 104]], kb: [1, 1] },
  },
  run: {
    view: 'side', dur: 800, floor: false,
    props: [
      { kind: 'line', pts: [[44, 142], [164, 142]], w: 5 },
      { kind: 'line', pts: [[150, 142], [166, 64]], w: 3 },
      { kind: 'line', pts: [[166, 64], [144, 62]], w: 3 },
    ],
    a: { hip: [100, 80], t: 8, hands: [[80, 70], [124, 64]], feet: [[126, 138], [76, 120]] },
    b: { hip: [100, 77], t: 8, hands: [[124, 64], [80, 70]], feet: [[76, 120], [126, 138]] },
  },
  bike: {
    view: 'side', dur: 1100, floor: false,
    props: [
      { kind: 'line', pts: [[78, 94], [100, 94]], w: 5 },
      { kind: 'line', pts: [[90, 94], [118, 128]], w: 3 },
      { kind: 'line', pts: [[118, 128], [146, 76]], w: 3 },
      { kind: 'line', pts: [[140, 74], [156, 72]], w: 4 },
      { kind: 'line', pts: [[70, 142], [160, 142]], w: 4 },
      { kind: 'circle', c: [118, 128], r: 13 },
    ],
    a: { hip: [90, 92], t: 30, hands: [[148, 74], [146, 74]], feet: [[131, 128], [105, 128]] },
    b: { hip: [90, 92], t: 30, hands: [[148, 74], [146, 74]], feet: [[105, 128], [131, 128]] },
  },
  jumpingJack: {
    view: 'front', dur: 1200, arc: ['hands'],
    a: stand({ hands: [[118, 80], [82, 80]], feet: [[104, 140], [96, 140]] }),
    b: stand({ hip: [100, 76], hands: [[132, -4], [68, -4]], feet: [[126, 140], [74, 140]] }),
  },
  burpee: {
    view: 'side', dur: 1800,
    a: { hip: [92, 112], t: 50, hands: [[130, 138], [126, 138]], feet: [[100, 140], [96, 140]] },
    b: { hip: [100, 70], t: 0, hands: [[104, -16], [100, -16]], feet: [[102, 130], [98, 130]] },
  },
} satisfies Record<string, Motion>;

export type MotionKey = keyof typeof MOTIONS;

export const MUSCLE_FALLBACK: Record<MuscleGroup, MotionKey> = {
  peito: 'benchPress',
  costas: 'bentRow',
  pernas: 'squat',
  gluteos: 'bridge',
  ombros: 'shoulderPress',
  biceps: 'curl',
  triceps: 'pushdown',
  abdomen: 'crunch',
  panturrilha: 'calf',
  cardio: 'run',
};

/* ------------------------------ Cinemática ------------------------------ */

const rad = (d: number) => (d * Math.PI) / 180;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpP = (a: P, b: P, k: number): P => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

/** Cinemática inversa de 2 segmentos: devolve [articulação do meio, ponta] */
export function ik(root: P, target: P, a: number, b: number, side: number): [P, P] {
  const dx = target[0] - root[0];
  const dy = target[1] - root[1];
  const raw = Math.hypot(dx, dy) || 0.001;
  const d = Math.min(Math.max(raw, Math.abs(a - b) + 0.5), a + b - 0.01);
  const base = Math.atan2(dy, dx);
  const cosA = (a * a + d * d - b * b) / (2 * a * d);
  const A = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const ang = base + side * A;
  const mid: P = [root[0] + a * Math.cos(ang), root[1] + a * Math.sin(ang)];
  const end: P = [root[0] + (dx / raw) * d, root[1] + (dy / raw) * d];
  return [mid, end];
}

export interface Skeleton {
  view: 'side' | 'front';
  head: P;
  neck: P;
  hip: P;
  /** [perto/direita, longe/esquerda] */
  shoulders: [P, P];
  hips: [P, P];
  elbows: [P, P];
  hands: [P, P];
  knees: [P, P];
  ankles: [P, P];
  toes: [P, P];
}

export function interpolate(m: Motion, k: number): Pose {
  const { a, b } = m;
  const hip = lerpP(a.hip, b.hip, k);
  const t = lerp(a.t, b.t, k);
  const front = m.view === 'front';
  // Pontos de rotação (ombro/quadril) de cada pose, para interpolar em coordenadas polares
  const anchors = (pose: Pose, what: 'hands' | 'feet', i: 0 | 1): P => {
    const tt = rad(pose.t);
    if (what === 'feet') return front ? [pose.hip[0] + (i ? -7 : 7), pose.hip[1]] : pose.hip;
    const neck: P = [pose.hip[0] + SEG.torso * Math.sin(tt), pose.hip[1] - SEG.torso * Math.cos(tt)];
    return front ? [neck[0] + (i ? -13 : 13), neck[1] + 4] : neck;
  };
  const pick = (what: 'hands' | 'feet', i: 0 | 1): P => {
    const pa = a[what][i];
    const pb = b[what][i];
    if (!m.arc?.includes(what)) return lerpP(pa, pb, k);
    const ra = anchors(a, what, i);
    const rb = anchors(b, what, i);
    const now = lerpP(ra, rb, k);
    const angA = Math.atan2(pa[1] - ra[1], pa[0] - ra[0]);
    let angB = Math.atan2(pb[1] - rb[1], pb[0] - rb[0]);
    if (angB - angA > Math.PI) angB -= 2 * Math.PI;
    if (angA - angB > Math.PI) angB += 2 * Math.PI;
    const ang = lerp(angA, angB, k);
    const r = lerp(Math.hypot(pa[0] - ra[0], pa[1] - ra[1]), Math.hypot(pb[0] - rb[0], pb[1] - rb[1]), k);
    return [now[0] + r * Math.cos(ang), now[1] + r * Math.sin(ang)];
  };
  return {
    hip,
    t,
    hands: [pick('hands', 0), pick('hands', 1)],
    feet: [pick('feet', 0), pick('feet', 1)],
    eb: k < 0.5 ? a.eb : b.eb ?? a.eb,
    kb: k < 0.5 ? a.kb : b.kb ?? a.kb,
  };
}

export function solve(view: 'side' | 'front', pose: Pose): Skeleton {
  const t = rad(pose.t);
  const hip = pose.hip;
  const neck: P = [hip[0] + SEG.torso * Math.sin(t), hip[1] - SEG.torso * Math.cos(t)];
  const head: P = [neck[0] + SEG.head * Math.sin(t), neck[1] - SEG.head * Math.cos(t)];
  const front = view === 'front';
  const shoulders: [P, P] = front ? [[neck[0] + 13, neck[1] + 4], [neck[0] - 13, neck[1] + 4]] : [neck, neck];
  const hips: [P, P] = front ? [[hip[0] + 7, hip[1]], [hip[0] - 7, hip[1]]] : [hip, hip];
  const eb = pose.eb ?? (front ? [-1, 1] : [1, 1]);
  const kb = pose.kb ?? (front ? [-1, 1] : [-1, -1]);

  const arm = (i: 0 | 1) => ik(shoulders[i], pose.hands[i], SEG.upperArm, SEG.foreArm, eb[i]);
  const leg = (i: 0 | 1) => ik(hips[i], pose.feet[i], SEG.thigh, SEG.shin, kb[i]);
  const [e0, h0] = arm(0);
  const [e1, h1] = arm(1);
  const [k0, a0] = leg(0);
  const [k1, a1] = leg(1);
  const toe = (an: P, i: number): P =>
    front ? [an[0] + (i === 0 ? 5 : -5), an[1] + 2] : an[1] >= 126 ? [an[0] + 9, 140] : [an[0] + 8, an[1] + 3];

  return {
    view,
    head,
    neck,
    hip,
    shoulders,
    hips,
    elbows: [e0, e1],
    hands: [h0, h1],
    knees: [k0, k1],
    ankles: [a0, a1],
    toes: [toe(a0, 0), toe(a1, 1)],
  };
}

/** Caixa que enquadra todo o movimento (poses A e B + acessórios), na proporção 200:170. */
export function frameFor(m: Motion): { x: number; y: number; w: number; h: number } {
  const pts: P[] = [];
  for (const pose of [m.a, m.b]) {
    const s = solve(m.view, pose);
    pts.push(s.head, s.neck, s.hip, ...s.hands, ...s.elbows, ...s.knees, ...s.ankles, ...s.toes);
  }
  for (const p of m.props ?? []) {
    if (p.kind === "line") pts.push(...p.pts);
    if (p.kind === "cable") pts.push(p.anchor);
    if (p.kind === "circle") pts.push([p.c[0] - p.r, p.c[1] - p.r], [p.c[0] + p.r, p.c[1] + p.r]);
  }
  if (m.floor !== false) pts.push([60, 143], [140, 143]);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const pad = 14;
  let x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad;
  let y0 = Math.min(...ys) - pad - 8, y1 = Math.max(...ys) + pad;
  const ratio = 200 / 170;
  let w = x1 - x0, h = y1 - y0;
  if (w / h > ratio) { const nh = w / ratio; y0 -= (nh - h) / 2; h = nh; } else { const nw = h * ratio; x0 -= (nw - w) / 2; w = nw; }
  return { x: x0, y: y0, w, h };
}

/** Fase 0–1 → fator de interpolação suave (vai e volta). */
export const ease = (phase: number) => (1 - Math.cos(2 * Math.PI * phase)) / 2;
