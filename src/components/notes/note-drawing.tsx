import { Check, Eraser, Hand, Highlighter, PenLine, Plus, Redo2, Trash2, Undo2 } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { askConfirm } from '@/components/ui/confirm';
import { cn } from '@/lib/utils';
import type { NoteBlock, NoteStroke } from '@/types';

type Drawing = Extract<NoteBlock, { type: 'desenho' }>;
type Tool = NoteStroke['tool'] | 'mao';

/** "auto" = cor do texto do tema (preto no claro, branco no escuro). */
const COLORS = [
  { id: 'auto', label: 'Tinta', css: 'rgb(var(--foreground, 17 23 39))' },
  { id: '#B91B1C', label: 'Vermelho', css: '#B91B1C' },
  { id: '#2563EB', label: 'Azul', css: '#2563EB' },
  { id: '#16A34A', label: 'Verde', css: '#16A34A' },
  { id: '#F59E0B', label: 'Amarelo', css: '#F59E0B' },
  { id: '#9333EA', label: 'Roxo', css: '#9333EA' },
];
const SIZES = [2, 5, 10];
const PAPERS: { id: Drawing['paper']; label: string }[] = [
  { id: 'liso', label: 'Liso' },
  { id: 'linhas', label: 'Linhas' },
  { id: 'quadriculado', label: 'Quadriculado' },
];

/** Fundo da folha em CSS (fica fora do canvas, então a borracha não apaga as linhas). */
const paperStyle = (paper: Drawing['paper'], width: number): React.CSSProperties => {
  const step = (40 * width) / 1000;
  if (paper === 'linhas') return { backgroundImage: `linear-gradient(to bottom, transparent ${step - 1}px, rgb(var(--foreground) / .12) ${step - 1}px)`, backgroundSize: `100% ${step}px` };
  if (paper === 'quadriculado')
    return {
      backgroundImage: `linear-gradient(to right, rgb(var(--foreground) / .08) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--foreground) / .08) 1px, transparent 1px)`,
      backgroundSize: `${step}px ${step}px`,
    };
  return {};
};

function inkColor(el: HTMLElement | null) {
  const v = el ? getComputedStyle(el).color : '';
  return v || '#111727';
}

/** Desenha um traço (linhas suavizadas por pontos médios). */
function strokePath(g: CanvasRenderingContext2D, s: NoteStroke, k: number, ink: string) {
  const p = s.pts;
  if (p.length < 2) return;
  g.save();
  g.globalCompositeOperation = s.tool === 'borracha' ? 'destination-out' : 'source-over';
  g.globalAlpha = s.tool === 'marcador' ? 0.35 : 1;
  g.strokeStyle = s.color === 'auto' ? ink : s.color;
  g.lineWidth = Math.max(1, (s.tool === 'marcador' ? s.size * 3 : s.tool === 'borracha' ? s.size * 4 : s.size) * k);
  g.lineCap = s.tool === 'marcador' ? 'square' : 'round';
  g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(p[0] * k, p[1] * k);
  if (p.length === 2) g.lineTo(p[0] * k + 0.01, p[1] * k);
  for (let i = 2; i < p.length - 2; i += 2) {
    const mx = ((p[i] + p[i + 2]) / 2) * k;
    const my = ((p[i + 1] + p[i + 3]) / 2) * k;
    g.quadraticCurveTo(p[i] * k, p[i + 1] * k, mx, my);
  }
  g.lineTo(p[p.length - 2] * k, p[p.length - 1] * k);
  g.stroke();
  g.restore();
}

/** Folha de desenho de uma nota. Fora do modo de edição é só a imagem (a tela rola normalmente). */
export function NoteDrawing({
  block,
  editing,
  onChange,
  onEdit,
  onDone,
  compact,
}: {
  block: Drawing;
  editing?: boolean;
  onChange?: (b: Drawing) => void;
  onEdit?: () => void;
  onDone?: () => void;
  /** prévia pequena na grade */
  compact?: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);
  const [tool, setTool] = useState<Tool>('caneta');
  const [color, setColor] = useState('auto');
  const [size, setSize] = useState(SIZES[0]);
  const [redo, setRedo] = useState<NoteStroke[]>([]);
  const live = useRef<NoteStroke | null>(null);
  const penSeen = useRef(false);
  const k = width / 1000;
  const height = Math.round(block.h * k);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const paint = useCallback(
    (extra?: NoteStroke | null) => {
      const c = canvas.current;
      if (!c || !width) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (c.width !== Math.round(width * dpr) || c.height !== Math.round(height * dpr)) {
        c.width = Math.round(width * dpr);
        c.height = Math.round(height * dpr);
      }
      const g = c.getContext('2d');
      if (!g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, width, height);
      const ink = inkColor(wrap.current);
      block.strokes.forEach((s) => strokePath(g, s, k, ink));
      if (extra) strokePath(g, extra, k, ink);
    },
    [block.strokes, width, height, k],
  );
  useEffect(() => paint(), [paint]);

  const point = (e: PointerEvent | React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return [Math.round(((e.clientX - r.left) / k) * 10) / 10, Math.round(((e.clientY - r.top) / k) * 10) / 10];
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!editing || tool === 'mao') return;
    if (e.pointerType === 'pen') penSeen.current = true;
    // com caneta (Apple Pencil/S Pen) a palma da mão não risca
    if (e.pointerType === 'touch' && penSeen.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    live.current = { tool, color, size, pts: point(e) };
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = live.current;
    if (!s) return;
    const evs = (e.nativeEvent.getCoalescedEvents?.() ?? []).length ? e.nativeEvent.getCoalescedEvents() : [e.nativeEvent];
    for (const ev of evs) {
      const [x, y] = point(ev);
      const lx = s.pts[s.pts.length - 2];
      const ly = s.pts[s.pts.length - 1];
      if (Math.hypot(x - lx, y - ly) >= 1.2) s.pts.push(x, y);
    }
    paint(s);
  };
  const up = () => {
    const s = live.current;
    live.current = null;
    if (!s || !onChange) return;
    onChange({ ...block, strokes: [...block.strokes, s] });
    setRedo([]);
  };

  const undo = () => {
    if (!block.strokes.length || !onChange) return;
    setRedo((r) => [...r, block.strokes[block.strokes.length - 1]]);
    onChange({ ...block, strokes: block.strokes.slice(0, -1) });
  };
  const redoOne = () => {
    if (!redo.length || !onChange) return;
    onChange({ ...block, strokes: [...block.strokes, redo[redo.length - 1]] });
    setRedo((r) => r.slice(0, -1));
  };

  const toolBtn = (id: Tool, label: string, Icon: typeof PenLine) => (
    <button
      type="button"
      onClick={() => setTool(id)}
      aria-pressed={tool === id}
      aria-label={label}
      title={label}
      className={cn('grid size-9 shrink-0 place-items-center rounded-lg transition-colors', tool === id ? 'bg-primary text-white' : 'text-foreground/70 hover:bg-foreground/10')}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );

  return (
    <div className="text-foreground">
      {editing && (
        <div className="sticky top-0 z-10 -mx-1 mb-2 flex flex-wrap items-center gap-1 rounded-xl border border-border bg-background/95 p-1.5 shadow-sm backdrop-blur">
          {toolBtn('caneta', 'Caneta', PenLine)}
          {toolBtn('marcador', 'Marca-texto', Highlighter)}
          {toolBtn('borracha', 'Borracha', Eraser)}
          {toolBtn('mao', 'Mão: rolar a tela sem riscar', Hand)}
          <span className="mx-1 h-6 w-px bg-border" aria-hidden />
          <div role="radiogroup" aria-label="Cor" className="flex items-center gap-1">
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={color === c.id}
                aria-label={c.label}
                title={c.label}
                onClick={() => {
                  setColor(c.id);
                  if (tool === 'borracha' || tool === 'mao') setTool('caneta');
                }}
                className={cn('size-6 rounded-full border border-foreground/20 transition-transform hover:scale-110', color === c.id && 'ring-2 ring-primary ring-offset-2 ring-offset-background')}
                style={{ background: c.id === 'auto' ? 'currentColor' : c.css }}
              />
            ))}
          </div>
          <span className="mx-1 h-6 w-px bg-border" aria-hidden />
          <div role="radiogroup" aria-label="Espessura" className="flex items-center gap-1">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={size === s}
                aria-label={`Espessura ${s}`}
                onClick={() => setSize(s)}
                className={cn('grid size-8 place-items-center rounded-lg', size === s ? 'bg-foreground/10' : 'hover:bg-foreground/5')}
              >
                <span className="rounded-full bg-current" style={{ width: 4 + s, height: 4 + s }} aria-hidden />
              </button>
            ))}
          </div>
          <span className="mx-1 h-6 w-px bg-border" aria-hidden />
          <button type="button" onClick={undo} disabled={!block.strokes.length} className="grid size-9 place-items-center rounded-lg text-foreground/70 hover:bg-foreground/10 disabled:opacity-30" aria-label="Desfazer" title="Desfazer">
            <Undo2 className="size-4" aria-hidden />
          </button>
          <button type="button" onClick={redoOne} disabled={!redo.length} className="grid size-9 place-items-center rounded-lg text-foreground/70 hover:bg-foreground/10 disabled:opacity-30" aria-label="Refazer" title="Refazer">
            <Redo2 className="size-4" aria-hidden />
          </button>
          <select
            value={block.paper}
            onChange={(e) => onChange?.({ ...block, paper: e.target.value as Drawing['paper'] })}
            aria-label="Tipo de folha"
            className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
          >
            {PAPERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={async () => block.strokes.length && (await askConfirm({ title: 'Apagar todo o desenho?', confirmLabel: 'Apagar', danger: true })) && onChange?.({ ...block, strokes: [] })}
            className="grid size-9 place-items-center rounded-lg text-foreground/70 hover:bg-foreground/10 hover:text-red-500"
            aria-label="Apagar desenho inteiro"
            title="Apagar tudo"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
          <button type="button" onClick={onDone} className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:brightness-110">
            <Check className="size-4" aria-hidden /> Pronto
          </button>
        </div>
      )}
      <div
        ref={wrap}
        className={cn('relative w-full overflow-hidden rounded-xl border', editing ? 'border-primary/50' : 'border-foreground/10', compact && 'max-h-40')}
        style={{ height: height || undefined, minHeight: width ? undefined : 120, ...paperStyle(block.paper, width) }}
      >
        <canvas
          ref={canvas}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onClick={!editing ? onEdit : undefined}
          style={{ width, height, touchAction: editing && tool !== 'mao' ? 'none' : 'auto' }}
          className={cn('block', editing ? (tool === 'mao' ? 'cursor-grab' : 'cursor-crosshair') : onEdit && 'cursor-pointer')}
          role="img"
          aria-label={block.strokes.length ? `Desenho com ${block.strokes.length} traços${editing ? '' : ' — toque para editar'}` : 'Folha de desenho em branco'}
        />
        {!editing && !block.strokes.length && !compact && (
          <span className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-foreground/40">Toque para desenhar</span>
        )}
      </div>
      {editing && (
        <button
          type="button"
          onClick={() => onChange?.({ ...block, h: block.h + 350 })}
          className="mt-1.5 inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-sm font-medium text-foreground/55 hover:text-primary"
        >
          <Plus className="size-4" aria-hidden /> Mais espaço na folha
        </button>
      )}
    </div>
  );
}
