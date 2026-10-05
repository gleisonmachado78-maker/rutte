/**
 * Microanimações da Rutte (sem bibliotecas): confete ao concluir, destaque do item recém-criado.
 * Tudo é desligado quando o sistema pede "reduzir movimento".
 */

export const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* Último toque/clique: o confete sai de onde a pessoa tocou */
let lastPoint: { x: number; y: number; at: number } | null = null;
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', (e) => (lastPoint = { x: e.clientX, y: e.clientY, at: Date.now() }), { capture: true, passive: true });
}

const COLORS = ['#B91B1C', '#E0393A', '#7F1D1C', '#FFFFFF', '#F59E0B', '#FF6B6B'];

/** Chuvinha de confete curta, nas cores da marca. */
export function celebrate(opts: { x?: number; y?: number; count?: number; spread?: number } = {}) {
  if (reducedMotion() || typeof document === 'undefined') return;
  const recent = lastPoint && Date.now() - lastPoint.at < 1500 ? lastPoint : null;
  const x = opts.x ?? recent?.x ?? window.innerWidth / 2;
  const y = opts.y ?? recent?.y ?? window.innerHeight / 2;
  const count = opts.count ?? 26;
  const spread = opts.spread ?? 1;

  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden';
  document.body.appendChild(layer);

  let alive = count;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    const size = 5 + Math.random() * 6;
    const round = Math.random() < 0.35;
    p.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${round ? size : size * 0.45}px;background:${COLORS[i % COLORS.length]};border-radius:${round ? '50%' : '2px'};box-shadow:0 0 6px rgba(224,57,58,.45)`;
    layer.appendChild(p);
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3 * spread;
    const dist = (60 + Math.random() * 90) * spread;
    const dx = Math.cos(ang) * dist;
    const dy = Math.sin(ang) * dist;
    const rot = (Math.random() - 0.5) * 720;
    const anim = p.animate(
      [
        { transform: 'translate(-50%,-50%) scale(.6) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${rot / 2}deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(calc(-50% + ${dx * 1.15}px), calc(-50% + ${dy + 90}px)) scale(.8) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: 850 + Math.random() * 350, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' },
    );
    anim.onfinish = () => {
      p.remove();
      if (--alive === 0) layer.remove();
    };
  }
  // segurança: remove a camada mesmo se alguma animação não terminar
  window.setTimeout(() => layer.remove(), 2000);
}

/* Itens recém-criados ganham um brilho ao aparecer */
const fresh = new Map<string, number>();
export const markFresh = (id: string) => fresh.set(id, Date.now());
/** Verdadeiro se o item foi criado há menos de 2,5 s (consulta uma vez, ao montar). */
export function isFresh(id: string) {
  const at = fresh.get(id);
  if (!at) return false;
  if (Date.now() - at > 2500) {
    fresh.delete(id);
    return false;
  }
  return true;
}
