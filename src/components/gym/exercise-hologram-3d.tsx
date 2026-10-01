import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { guideFor, type Load } from '@/lib/exercise-guide';
import { motion3DFor, skeleton3D, U, v3, type Skel3 } from '@/lib/exercise-3d';
import { ease, frameFor, MOTIONS, SEG, type Motion, type P } from '@/lib/exercise-motion';
import { cn } from '@/lib/utils';
import type { Exercise } from '@/types';
import { ExerciseHologram } from './exercise-hologram';

/*
 * Holograma 3D do exercício (three.js). Reaproveita as poses 2D de `exercise-motion.ts`:
 * o plano do desenho vira o plano X/Y da cena e cada lado do corpo ganha profundidade (Z),
 * então a figura pode ser girada e vista de qualquer ângulo.
 */

/* ------------------------------- Material holográfico ------------------------------- */

const holoVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vY;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec4 mv = viewMatrix * world;
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    vY = world.y;
    gl_Position = projectionMatrix * mv;
  }
`;
const holoFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vY;
  void main() {
    float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 1.6);
    float scan = 0.5 + 0.5 * sin(vY * 9.0 - uTime * 5.0);
    float band = smoothstep(0.96, 1.0, sin(vY * 1.2 - uTime * 1.6));
    float flicker = 0.92 + 0.08 * sin(uTime * 37.0);
    float a = (0.12 + fres * 0.9) * (0.7 + 0.3 * scan) * flicker + band * 0.35;
    gl_FragColor = vec4(uColor * (0.55 + fres * 1.6 + band), a * uOpacity);
  }
`;

function holoMaterial(color: THREE.Color, opacity = 1) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: color }, uTime: { value: 0 }, uOpacity: { value: opacity } },
    vertexShader: holoVertex,
    fragmentShader: holoFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

/* ------------------------------------ Peças ------------------------------------ */

const UP = new THREE.Vector3(0, 1, 0);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 14, 1);
const SPHERE = new THREE.SphereGeometry(1, 18, 14);
const BOX = new THREE.BoxGeometry(1, 1, 1);
const DISC = new THREE.CylinderGeometry(1, 1, 1, 24, 1);

/** Posiciona um cilindro unitário entre a e b. */
function placeBone(mesh: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3, r: number) {
  const dir = b.clone().sub(a);
  const len = Math.max(dir.length(), 0.001);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.scale.set(r, len, r);
  mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
}

/** Corpo humano holográfico (ossos + articulações) atualizado a cada quadro. */
class Figure {
  group = new THREE.Group();
  private bones: THREE.Mesh[] = [];
  private joints: THREE.Mesh[] = [];
  private head: THREE.Mesh;
  private torso: THREE.Mesh;
  private chest: THREE.Mesh;
  private pelvis: THREE.Mesh;

  constructor(mat: THREE.Material) {
    const mk = (g: THREE.BufferGeometry) => {
      const m = new THREE.Mesh(g, mat);
      this.group.add(m);
      return m;
    };
    for (let i = 0; i < 10; i++) this.bones.push(mk(CYL));
    for (let i = 0; i < 12; i++) this.joints.push(mk(SPHERE));
    this.head = mk(SPHERE);
    this.torso = mk(CYL);
    this.chest = mk(CYL);
    this.pelvis = mk(CYL);
  }

  update(s: Skel3) {
    let b = 0;
    let j = 0;
    for (const i of [0, 1] as const) {
      const [sh, el, ha, hp, kn, an, to] = [s.shoulders[i], s.elbows[i], s.hands[i], s.hips[i], s.knees[i], s.ankles[i], s.toes[i]];
      placeBone(this.bones[b++], sh, el, 0.32);
      placeBone(this.bones[b++], el, ha, 0.26);
      placeBone(this.bones[b++], hp, kn, 0.42);
      placeBone(this.bones[b++], kn, an, 0.33);
      placeBone(this.bones[b++], an, to, 0.2);
      for (const [q, r] of [[sh, 0.4], [el, 0.3], [ha, 0.3], [kn, 0.38], [an, 0.28], [hp, 0.4]] as const) {
        const m = this.joints[j++];
        m.position.copy(q);
        m.scale.setScalar(r);
      }
    }
    placeBone(this.torso, s.hip, s.neck, 0.62);
    placeBone(this.chest, s.shoulders[0], s.shoulders[1], 0.42);
    placeBone(this.pelvis, s.hips[0], s.hips[1], 0.46);
    this.head.position.copy(s.head);
    this.head.scale.set(SEG.headR * U, SEG.headR * U * 1.12, SEG.headR * U);
  }
}

const Z = new THREE.Vector3(0, 0, 1);

/** Barra / halteres nas mãos. */
class LoadMesh {
  group = new THREE.Group();
  private parts: THREE.Mesh[] = [];
  private load: Load;
  constructor(load: Load, mat: THREE.Material) {
    this.load = load;
    const n = load === 'barbell' ? 5 : load === 'none' ? 0 : 6;
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(i === 0 || (load !== 'barbell' && i % 3 === 0) ? CYL : DISC, mat);
      this.parts.push(m);
      this.group.add(m);
    }
  }
  update(s: Skel3) {
    if (this.load === 'none') return;
    if (this.load === 'barbell') {
      // Barra passando pelas duas mãos, com anilhas nas pontas
      const [bar, d1, d2, c1, c2] = this.parts;
      const [h0, h1] = s.hands;
      const dir = h0.clone().sub(h1);
      if (dir.lengthSq() < 0.04) dir.copy(Z);
      dir.normalize();
      const mid = h0.clone().add(h1).multiplyScalar(0.5);
      const half = Math.max(h0.distanceTo(h1) / 2 + 2.2, 3.4);
      const a = mid.clone().addScaledVector(dir, -half);
      const b = mid.clone().addScaledVector(dir, half);
      placeBone(bar, a, b, 0.09);
      for (const [m, at, r, w] of [
        [d1, a.clone().addScaledVector(dir, 0.5), 1.5, 0.28],
        [d2, b.clone().addScaledVector(dir, -0.5), 1.5, 0.28],
        [c1, a.clone().addScaledVector(dir, 0.9), 1.05, 0.2],
        [c2, b.clone().addScaledVector(dir, -0.9), 1.05, 0.2],
      ] as const) {
        m.position.copy(at);
        m.scale.set(r, w, r);
        m.quaternion.setFromUnitVectors(UP, dir);
      }
      return;
    }
    // Halteres: um em cada mão, cabo atravessando a mão (perpendicular ao antebraço)
    ([0, 1] as const).forEach((i) => {
      const h = s.hands[i];
      const fore = h.clone().sub(s.elbows[i]).normalize();
      let axis = Z.clone().sub(fore.clone().multiplyScalar(Z.dot(fore)));
      if (axis.lengthSq() < 1e-4) axis = new THREE.Vector3(1, 0, 0);
      axis.normalize();
      const a = h.clone().addScaledVector(axis, -0.75);
      const b = h.clone().addScaledVector(axis, 0.75);
      const [bar, w1, w2] = this.parts.slice(i * 3, i * 3 + 3);
      placeBone(bar, a, b, 0.07);
      for (const [m, at] of [[w1, a], [w2, b]] as const) {
        m.position.copy(at);
        m.scale.set(0.5, 0.32, 0.5);
        m.quaternion.setFromUnitVectors(UP, axis);
      }
    });
  }
}

/** Aparelhos (banco, polia, apoio…). */
class PropsMesh {
  group = new THREE.Group();
  private dyn: { kind: string; meshes: THREE.Mesh[]; anchor?: P }[] = [];
  constructor(motion: Motion, mat: THREE.Material) {
    const add = (g: THREE.BufferGeometry) => {
      const m = new THREE.Mesh(g, mat);
      this.group.add(m);
      return m;
    };
    for (const p of motion.props ?? []) {
      if (p.kind === 'line') {
        for (let i = 0; i < p.pts.length - 1; i++) {
          const a = v3(p.pts[i]);
          const b = v3(p.pts[i + 1]);
          const w = (p.w ?? 4) * U;
          if (w >= 0.5) {
            // tampo largo (banco/assento) vira uma caixa com profundidade
            const m = add(BOX);
            const dir = b.clone().sub(a);
            m.position.copy(a).add(b).multiplyScalar(0.5);
            m.scale.set(dir.length(), w, motion.view === 'front' ? 3.6 : 2.8);
            m.rotation.z = Math.atan2(dir.y, dir.x);
          } else {
            placeBone(add(CYL), a, b, w * 0.6);
          }
        }
      } else if (p.kind === 'circle') {
        const m = add(new THREE.TorusGeometry(p.r * U, 0.08, 10, 40));
        m.position.copy(v3(p.c));
      } else if (p.kind === 'cable') {
        const pulley = add(new THREE.TorusGeometry(0.45, 0.1, 10, 24));
        pulley.position.copy(v3(p.anchor));
        this.dyn.push({ kind: 'cable', anchor: p.anchor, meshes: [add(CYL), add(CYL)] });
      } else {
        this.dyn.push({ kind: p.kind, meshes: [add(p.kind === 'feetplate' ? BOX : CYL), ...(p.kind === 'hipbar' ? [add(DISC), add(DISC)] : [])] });
      }
    }
  }
  update(s: Skel3) {
    const f = s.flat;
    for (const d of this.dyn) {
      const [m, m2, m3] = d.meshes;
      if (d.kind === 'cable' && d.anchor) {
        const h = s.hands[0].clone().add(s.hands[1]).multiplyScalar(0.5);
        placeBone(m, v3(d.anchor), h, 0.04);
        const w = Math.max(s.hands[0].distanceTo(s.hands[1]) / 2 + 0.3, 0.9);
        placeBone(m2, h.clone().setZ(h.z - w), h.clone().setZ(h.z + w), 0.1);
      } else if (d.kind === 'feetplate') {
        const an = f.ankles[0];
        const a = v3([an[0] - 10, an[1] - 13]);
        const b = v3([an[0] + 12, an[1] + 14]);
        const dir = b.clone().sub(a);
        m.position.copy(a).add(b).multiplyScalar(0.5);
        m.scale.set(dir.length(), 0.35, 3);
        m.rotation.set(0, 0, Math.atan2(dir.y, dir.x));
      } else if (d.kind === 'pad') {
        const a = s.ankles[0].clone().add(s.ankles[1]).multiplyScalar(0.5);
        placeBone(m, a.clone().setZ(-1.4), a.clone().setZ(1.4), 0.5);
      } else if (d.kind === 'hipbar') {
        const c = v3([f.hip[0], f.hip[1] - 8]);
        const a = c.clone().setZ(-3.4);
        const b = c.clone().setZ(3.4);
        placeBone(m, a, b, 0.09);
        for (const [disc, at] of [[m2, a.clone().setZ(-2.9)], [m3, b.clone().setZ(2.9)]] as const) {
          disc.position.copy(at);
          disc.scale.set(1.3, 0.28, 1.3);
          disc.quaternion.setFromUnitVectors(UP, Z);
        }
      }
    }
  }
}

/** Base do projetor: anéis, grade e feixe de luz. */
function makeProjector(color: THREE.Color, radius: number) {
  const g = new THREE.Group();
  const lineMat = (o: number) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const ring = (r1: number, r2: number, o: number) => {
    const m = new THREE.Mesh(new THREE.RingGeometry(r1, r2, 72), lineMat(o));
    m.rotation.x = -Math.PI / 2;
    g.add(m);
    return m;
  };
  ring(radius - 0.12, radius, 0.85);
  ring(radius * 0.72 - 0.06, radius * 0.72, 0.45);
  const dashed = new THREE.Mesh(new THREE.RingGeometry(radius + 0.25, radius + 0.4, 48, 1, 0, Math.PI * 1.6), lineMat(0.5));
  dashed.rotation.x = -Math.PI / 2;
  g.add(dashed);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(radius, 64), lineMat(0.07));
  disc.rotation.x = -Math.PI / 2;
  g.add(disc);
  const grid = new THREE.PolarGridHelper(radius, 12, 5, 64, color, color);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.18;
  g.add(grid);
  // Feixe de luz subindo da base
  const beamMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: color } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 uColor; varying vec2 vUv; void main(){ gl_FragColor = vec4(uColor, pow(1.0 - vUv.y, 2.2) * 0.13); }',
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.8, radius, 12, 48, 1, true), beamMat);
  beam.position.y = 6;
  g.add(beam);
  return { group: g, spin: dashed };
}

/** Cor neon atual do tema (Pessoal = vermelho, Empresa = azul). */
function readNeon() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--neon').trim();
  const [r, g, b] = raw.split(/[\s,]+/).map(Number);
  return Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b) ? new THREE.Color(r / 255, g / 255, b / 255) : new THREE.Color('#ff4d5e');
}

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Holograma 3D animado: arraste para girar; gira sozinho devagar quando ninguém mexe.
 * Sem WebGL, mostra o holograma 2D.
 */
export function ExerciseHologram3D({
  exercise,
  className,
  playing = true,
  speed = 1,
  autoRotate = true,
  freezeAt,
  angle,
}: {
  exercise: Pick<Exercise, 'id' | 'muscle' | 'name'>;
  className?: string;
  playing?: boolean;
  speed?: number;
  autoRotate?: boolean;
  /** fixa a pose (0 = início, 1 = fim) — usado para conferir os movimentos */
  freezeAt?: number;
  /** ângulo inicial da câmera (radianos) */
  angle?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const live = useRef({ playing, speed, autoRotate });
  live.current = { playing, speed, autoRotate };
  const [ok] = useState(webglAvailable);
  const guide = guideFor(exercise);
  const motionKey = guide.motion;

  useEffect(() => {
    const el = host.current;
    if (!el || !ok) return;
    const motion: Motion = motion3DFor(motionKey);
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'pan-y';

    const scene = new THREE.Scene();
    const color = readNeon();
    const mat = holoMaterial(color, 1);
    const ghostMat = holoMaterial(color, 0.16);
    const propMat = holoMaterial(color, 0.55);

    // Enquadramento a partir da caixa 2D do movimento
    const f = frameFor(motion);
    const center = v3([f.x + f.w / 2, f.y + f.h / 2]);
    const size = Math.max(f.w, f.h) * U;
    const camera = new THREE.PerspectiveCamera(32, 200 / 170, 0.1, 200);
    const dist = size * 1.85;
    const startAngle = angle ?? (motion.view === 'side' ? 0.62 : 0.32);
    camera.position.set(center.x + Math.sin(startAngle) * dist, center.y + dist * 0.2, Math.cos(startAngle) * dist);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(center);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.autoRotateSpeed = 1.1;
    controls.update();

    const projector = makeProjector(color, Math.max(4.2, size * 0.42));
    projector.group.position.set(center.x, 0, 0);
    if (motion.floor !== false) scene.add(projector.group);

    const figure = new Figure(mat);
    scene.add(figure.group);
    const ghosts = [new Figure(ghostMat), new Figure(ghostMat)];
    ghosts[0].update(skeleton3D(motion, 0));
    ghosts[1].update(skeleton3D(motion, 1));
    ghosts.forEach((g) => scene.add(g.group));
    const load = new LoadMesh(guide.load, mat);
    scene.add(load.group);
    const props = new PropsMesh(motion, propMat);
    scene.add(props.group);

    // Partículas subindo pelo feixe
    const N = 70;
    const pPos = new Float32Array(N * 3);
    const seeds = Array.from({ length: N }, () => [Math.random() * Math.PI * 2, Math.random() * 3.6, Math.random()]);
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color, size: 0.09, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false });
    const particles = new THREE.Points(pGeo, pMat);
    if (motion.floor !== false) scene.add(particles);

    // Tamanho acompanha o contêiner
    const resize = () => {
      const w = el.clientWidth || 300;
      const h = w * (170 / 200);
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = 'auto';
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // Troca de cor quando muda Pessoal/Empresa ou o tema
    const mo = new MutationObserver(() => {
      const c = readNeon();
      for (const m of [mat, ghostMat, propMat]) (m.uniforms.uColor.value as THREE.Color).copy(c);
      color.copy(c);
      pMat.color.copy(c);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-scope', 'class'] });

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    let interacting = false;
    let idleTimer = 0;
    controls.addEventListener('start', () => {
      interacting = true;
      window.clearTimeout(idleTimer);
    });
    controls.addEventListener('end', () => {
      idleTimer = window.setTimeout(() => (interacting = false), 2500);
    });

    let phase = 0.25;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(now - last, 100);
      last = now;
      if (!visible) return;
      const { playing: play, speed: sp, autoRotate: spin } = live.current;
      if (play && !reduced) phase = (phase + (dt * sp) / motion.dur) % 1;
      const k = freezeAt ?? (reduced ? 0.5 : ease(phase));
      const s = skeleton3D(motion, k);
      figure.update(s);
      load.update(s);
      props.update(s);

      const t = now / 1000;
      for (const m of [mat, ghostMat, propMat]) m.uniforms.uTime.value = t;
      projector.spin.rotation.z = t * 0.6;
      const r = Math.max(4.2, size * 0.42) * 0.85;
      for (let i = 0; i < N; i++) {
        const [a, h0, sp2] = seeds[i];
        const y = (h0 + t * (0.4 + sp2 * 0.6)) % 5;
        pPos[i * 3] = center.x + Math.cos(a + t * 0.2) * r * (0.4 + sp2 * 0.6);
        pPos[i * 3 + 1] = y;
        pPos[i * 3 + 2] = Math.sin(a + t * 0.2) * r * (0.4 + sp2 * 0.6);
      }
      pGeo.attributes.position.needsUpdate = true;

      controls.autoRotate = spin && !interacting && !reduced;
      controls.update();
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(idleTimer);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      controls.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry && ![CYL, SPHERE, BOX, DISC].includes(m.geometry as never)) m.geometry.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        mats.forEach((x) => x.dispose());
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [motionKey, guide.load, ok, freezeAt, angle]);

  if (!ok) return <ExerciseHologram exercise={exercise} playing={playing} speed={speed} className={className} />;

  return (
    <div
      className={cn('relative cursor-grab overflow-hidden rounded-xl border border-neon/40 bg-[radial-gradient(ellipse_at_50%_85%,rgb(var(--neon)/0.18),transparent_60%),linear-gradient(#0b1020,#111727)] active:cursor-grabbing', className)}
      role="img"
      aria-label={`Demonstração 3D animada: ${exercise.name}. Arraste para girar.`}
    >
      <div ref={host} className="w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0_3px,rgb(255_255_255/0.025)_3px_4px)]" aria-hidden />
      <span className="pointer-events-none absolute left-2.5 top-2 font-mono text-[10px] tracking-widest text-neon/90">
        RUTTE · HOLOGRAMA 3D · {(MOTIONS[motionKey] as Motion).hold ? 'SEGURE A POSIÇÃO' : 'EXECUÇÃO'}
      </span>
      <span className="pointer-events-none absolute bottom-2 right-2.5 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/70">↻ arraste para girar</span>
    </div>
  );
}
