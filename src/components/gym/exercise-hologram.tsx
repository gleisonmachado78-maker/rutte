import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import { guideFor, type Load } from '@/lib/exercise-guide';
import { ease, frameFor, interpolate, MOTIONS, SEG, solve, type Motion, type P, type Prop, type Skeleton } from '@/lib/exercise-motion';
import { cn } from '@/lib/utils';
import type { Exercise } from '@/types';

/* ---------------- Relógio compartilhado (um único requestAnimationFrame) ---------------- */

const subscribers = new Set<(now: number) => void>();
let rafId = 0;
let lastFrame = 0;
let watchdog = 0;
function loop(now: number) {
  lastFrame = performance.now();
  subscribers.forEach((fn) => fn(now));
  rafId = subscribers.size ? requestAnimationFrame(loop) : 0;
}
function subscribe(fn: (now: number) => void) {
  subscribers.add(fn);
  if (!rafId) rafId = requestAnimationFrame(loop);
  // Reserva: se o navegador suspender os quadros (janela embutida/sem pintura), avança por temporizador
  if (!watchdog) {
    watchdog = window.setInterval(() => {
      if (!subscribers.size) {
        window.clearInterval(watchdog);
        watchdog = 0;
        return;
      }
      if (performance.now() - lastFrame > 250) {
        const now = performance.now();
        subscribers.forEach((f) => f(now));
      }
    }, 50);
  }
  return () => {
    subscribers.delete(fn);
  };
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Fase 0–1 do ciclo; pausa fora da tela e quando `playing` é falso. */
function usePhase(dur: number, playing: boolean, speed: number, ref: RefObject<Element | null>) {
  const [phase, setPhase] = useState(0.5);
  const visible = useRef(true);
  const acc = useRef({ last: 0, phase: 0.25 });

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  useEffect(() => {
    if (!playing || prefersReducedMotion()) return;
    acc.current.last = 0;
    return subscribe((now) => {
      const a = acc.current;
      if (!a.last) a.last = now;
      const dt = now - a.last;
      if (dt < 33 || !visible.current) return; // ~30 fps é suficiente
      a.last = now;
      a.phase = (a.phase + (dt * speed) / dur) % 1;
      setPhase(a.phase);
    });
  }, [dur, playing, speed]);

  return phase;
}

/* ----------------------------------- Desenho ----------------------------------- */

const NEON = (a: number) => `rgb(var(--neon) / ${a})`;
const line = (a: P, b: P) => `M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`;

function Limbs({ s, i, opacity }: { s: Skeleton; i: 0 | 1; opacity: number }) {
  const w = s.view === 'side' ? 5 : 4.5;
  return (
    <g stroke={NEON(opacity)} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={`${line(s.shoulders[i], s.elbows[i])} ${line(s.elbows[i], s.hands[i])}`} />
      <path d={`${line(s.hips[i], s.knees[i])} ${line(s.knees[i], s.ankles[i])} ${line(s.ankles[i], s.toes[i])}`} />
      {[s.elbows[i], s.knees[i], s.hands[i]].map((p, k) => (
        <circle key={k} cx={p[0]} cy={p[1]} r={2.2} fill={NEON(opacity)} stroke="none" />
      ))}
    </g>
  );
}

function Figure({ s, ghost = false }: { s: Skeleton; ghost?: boolean }) {
  const o = ghost ? 0.22 : 1;
  const far = ghost ? 0.14 : s.view === 'side' ? 0.45 : 1;
  return (
    <g>
      <Limbs s={s} i={1} opacity={far} />
      {s.view === 'front' ? (
        <path
          d={`M ${s.shoulders[1][0]} ${s.shoulders[1][1]} L ${s.shoulders[0][0]} ${s.shoulders[0][1]} L ${s.hips[0][0]} ${s.hips[0][1]} L ${s.hips[1][0]} ${s.hips[1][1]} Z`}
          fill={NEON(ghost ? 0.03 : 0.12)}
          stroke={NEON(o)}
          strokeWidth={3}
          strokeLinejoin="round"
        />
      ) : (
        <path d={line(s.hip, s.neck)} stroke={NEON(o)} strokeWidth={7} strokeLinecap="round" />
      )}
      <path d={line(s.neck, s.head)} stroke={NEON(o)} strokeWidth={3} strokeLinecap="round" />
      <circle cx={s.head[0]} cy={s.head[1]} r={SEG.headR} fill={NEON(ghost ? 0.03 : 0.15)} stroke={NEON(o)} strokeWidth={2.5} />
      <Limbs s={s} i={0} opacity={o} />
    </g>
  );
}

function Load_({ s, load }: { s: Skeleton; load: Load }) {
  if (load === 'none') return null;
  const stroke = NEON(0.95);
  if (load === 'barbell') {
    if (s.view === 'front') {
      const [r, l] = s.hands;
      return (
        <g stroke={stroke} strokeLinecap="round">
          <path d={line([l[0] - 18, l[1]], [r[0] + 18, r[1]])} strokeWidth={3} />
          <path d={`${line([l[0] - 14, l[1] - 8], [l[0] - 14, l[1] + 8])} ${line([r[0] + 14, r[1] - 8], [r[0] + 14, r[1] + 8])}`} strokeWidth={5} />
        </g>
      );
    }
    const h = s.hands[0];
    return <circle cx={h[0]} cy={h[1]} r={9} fill={NEON(0.2)} stroke={stroke} strokeWidth={2.5} />;
  }
  return (
    <g stroke={stroke} strokeWidth={3} strokeLinecap="round">
      {s.hands.map((h, i) => (
        <g key={i}>
          <path d={line([h[0] - 6, h[1]], [h[0] + 6, h[1]])} />
          <path d={`${line([h[0] - 6, h[1] - 4], [h[0] - 6, h[1] + 4])} ${line([h[0] + 6, h[1] - 4], [h[0] + 6, h[1] + 4])}`} />
        </g>
      ))}
    </g>
  );
}

function Props_({ s, props }: { s: Skeleton; props: Prop[] }) {
  return (
    <g stroke={NEON(0.55)} strokeLinecap="round" fill="none">
      {props.map((p, i) => {
        switch (p.kind) {
          case 'line':
            return <polyline key={i} points={p.pts.map((q) => q.join(',')).join(' ')} strokeWidth={p.w ?? 4} />;
          case 'circle':
            return <circle key={i} cx={p.c[0]} cy={p.c[1]} r={p.r} strokeWidth={2} />;
          case 'cable':
            return (
              <g key={i}>
                <circle cx={p.anchor[0]} cy={p.anchor[1]} r={4} strokeWidth={2} />
                <path d={line(p.anchor, s.hands[0])} strokeWidth={1.5} strokeDasharray="3 2" />
                <path d={line([s.hands[0][0] - 8, s.hands[0][1]], [s.hands[0][0] + 8, s.hands[0][1]])} strokeWidth={3} stroke={NEON(0.95)} />
              </g>
            );
          case 'feetplate': {
            const f = s.ankles[0];
            return <path key={i} d={line([f[0] - 10, f[1] - 13], [f[0] + 12, f[1] + 14])} strokeWidth={5} stroke={NEON(0.8)} />;
          }
          case 'pad': {
            const a = s.ankles[0];
            return <circle key={i} cx={a[0]} cy={a[1]} r={5} strokeWidth={2.5} stroke={NEON(0.8)} fill={NEON(0.15)} />;
          }
          case 'hipbar':
            return <circle key={i} cx={s.hip[0]} cy={s.hip[1] - 8} r={9} strokeWidth={2.5} stroke={NEON(0.95)} fill={NEON(0.2)} />;
        }
      })}
    </g>
  );
}

/**
 * Holograma animado mostrando a execução do exercício (loop A → B → A).
 * Fantasmas tênues marcam as posições inicial e final (amplitude do movimento).
 */
export function ExerciseHologram({
  exercise,
  className,
  playing = true,
  speed = 1,
  compact = false,
}: {
  exercise: Pick<Exercise, 'id' | 'muscle' | 'name'>;
  className?: string;
  playing?: boolean;
  speed?: number;
  compact?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const guide = guideFor(exercise);
  const motion: Motion = MOTIONS[guide.motion];
  const phase = usePhase(motion.dur, playing, speed, ref);
  const k = ease(phase);
  const s = solve(motion.view, interpolate(motion, k));
  const ghostA = solve(motion.view, motion.a);
  const ghostB = solve(motion.view, motion.b);
  const uid = useId().replace(/:/g, '');
  const floor = motion.floor !== false;
  const f = frameFor(motion);
  const vb = `${f.x} ${f.y} ${f.w} ${f.h}`;

  return (
    <div ref={ref} className={cn('relative overflow-hidden rounded-xl border border-neon/40 bg-navy', className)}>
      <svg viewBox={vb} className="block h-auto w-full" role="img" aria-label={`Demonstração animada: ${exercise.name}`}>
        <defs>
          <filter id={`g-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={Math.max(0.8, f.w * 0.007)} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id={`p-${uid}`} width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M 12 0 L 0 0 0 12" fill="none" stroke={NEON(0.07)} strokeWidth="1" />
          </pattern>
          <linearGradient id={`s-${uid}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="rgb(var(--neon))" stopOpacity="0" />
            <stop offset=".5" stopColor="rgb(var(--neon))" stopOpacity=".3" />
            <stop offset="1" stopColor="rgb(var(--neon))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x={f.x} y={f.y} width={f.w} height={f.h} fill={`url(#p-${uid})`} />
        {floor && (
          <g>
            <ellipse cx="100" cy="141" rx="70" ry="6" fill={NEON(0.1)} />
            <ellipse cx="100" cy="141" rx="70" ry="6" fill="none" stroke={NEON(0.5)} strokeWidth="1" strokeDasharray="8 5" className="holo-ring" />
          </g>
        )}
        {!compact && (
          <>
            <Figure s={ghostA} ghost />
            <Figure s={ghostB} ghost />
          </>
        )}
        <g filter={`url(#g-${uid})`} className="holo-flicker">
          <Props_ s={s} props={motion.props ?? []} />
          <Figure s={s} />
          <Load_ s={s} load={guide.load} />
        </g>
        <rect x={f.x} y={f.y} width={f.w} height={f.h * 0.13} fill={`url(#s-${uid})`} className="holo-scan" />
        {!compact && (
          <text x={f.x + 5} y={f.y + 9} fill={NEON(0.8)} fontSize={f.w * 0.035} letterSpacing="1" className="font-mono">
            RUTTE · {motion.hold ? 'SEGURE A POSIÇÃO' : 'EXECUÇÃO'}
          </text>
        )}
      </svg>
    </div>
  );
}
