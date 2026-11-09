import { ArrowDown, ArrowUp, Camera, ImageIcon, ImageOff, Loader2, PenLine, Trash2, Type } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { NoteDrawing } from '@/components/notes/note-drawing';
import { noteImages } from '@/lib/note-images';
import { newDrawing, newTextBlock } from '@/lib/notes';
import { cn, uid } from '@/lib/utils';
import type { NoteBlock } from '@/types';

/** Imagem guardada no aparelho (some com um aviso se ela foi colocada em outro aparelho). */
export function NoteImage({ fileKey, w, h, className, onClick }: { fileKey: string; w: number; h: number; className?: string; onClick?: () => void }) {
  const [url, setUrl] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    noteImages
      .url(fileKey)
      .then((u) => alive && setUrl(u))
      .catch(() => alive && setUrl(null));
    return () => {
      alive = false;
    };
  }, [fileKey]);
  if (url === null)
    return (
      <div className={cn('grid place-items-center gap-1 rounded-xl border border-dashed border-foreground/20 p-4 text-center text-xs text-foreground/50', className)}>
        <ImageOff className="size-5" aria-hidden /> Imagem guardada em outro aparelho
      </div>
    );
  return (
    <img
      src={url ?? undefined}
      width={w}
      height={h}
      alt=""
      loading="lazy"
      onClick={onClick}
      style={{ aspectRatio: `${w} / ${h}` }}
      className={cn('block h-auto w-full rounded-xl bg-foreground/5 object-contain', onClick && 'cursor-zoom-in', className)}
    />
  );
}

/** Textarea que cresce com o conteúdo. */
function Grow({ value, onChange, ...rest }: { value: string; onChange: (v: string) => void } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full resize-none overflow-hidden bg-transparent py-1 text-base leading-relaxed outline-none placeholder:text-foreground/35 focus-visible:ring-0 focus-visible:ring-offset-0"
      {...rest}
    />
  );
}

/** Imagens enviadas por arquivo, câmera, colar ou arrastar → blocos de imagem. */
export async function imagesToBlocks(files: File[]): Promise<NoteBlock[]> {
  const out: NoteBlock[] = [];
  for (const f of files) {
    try {
      const { key, w, h } = await noteImages.add(f);
      out.push({ id: uid('bk'), type: 'imagem', fileKey: key, w, h });
    } catch {
      toast.error(`Não foi possível adicionar ${f.name || 'a imagem'}`);
    }
  }
  return out;
}

/** Conteúdo extra da nota (texto, imagens e desenhos), um embaixo do outro, como no iPhone. */
export function NoteBlocks({ blocks, onChange, autoEdit }: { blocks: NoteBlock[]; onChange: (blocks: NoteBlock[], immediate?: boolean) => void; autoEdit?: string | null }) {
  const [drawing, setDrawing] = useState<string | null>(null);
  // desenho recém-inserido já abre pronto para riscar
  useEffect(() => {
    if (autoEdit) setDrawing(autoEdit);
  }, [autoEdit]);
  const [zoom, setZoom] = useState<string | null>(null);
  const set = (id: string, b: NoteBlock, immediate = false) => onChange(blocks.map((x) => (x.id === id ? b : x)), immediate);
  const remove = (id: string) => onChange(blocks.filter((x) => x.id !== id), true);
  const moveBy = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next, true);
  };

  if (!blocks.length) return null;
  return (
    <div className="space-y-3 py-2">
      {blocks.map((b, i) => (
        <div key={b.id} className="group/block relative">
          {b.type === 'texto' ? (
            <Grow
              value={b.text}
              onChange={(text) => set(b.id, { ...b, text })}
              placeholder="Continue escrevendo…"
              aria-label="Texto"
              data-block-text={b.id}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !b.text) {
                  e.preventDefault();
                  remove(b.id);
                }
              }}
            />
          ) : b.type === 'imagem' ? (
            <NoteImage fileKey={b.fileKey} w={b.w} h={b.h} onClick={() => setZoom(zoom === b.id ? null : b.id)} className={zoom === b.id ? '' : 'max-h-[60dvh] w-auto max-w-full'} />
          ) : (
            <NoteDrawing block={b} editing={drawing === b.id} onEdit={() => setDrawing(b.id)} onDone={() => setDrawing(null)} onChange={(nb) => set(b.id, nb)} />
          )}
          {drawing !== b.id && (
            <div className="absolute right-1 top-1 flex gap-0.5 rounded-lg border border-border bg-background/90 p-0.5 opacity-100 shadow-sm backdrop-blur transition-opacity sm:opacity-0 sm:group-hover/block:opacity-100 sm:group-focus-within/block:opacity-100">
              {b.type === 'desenho' && (
                <button type="button" onClick={() => setDrawing(b.id)} className="grid size-7 place-items-center rounded-md text-foreground/60 hover:bg-foreground/10 hover:text-foreground" aria-label="Editar desenho" title="Editar desenho">
                  <PenLine className="size-3.5" aria-hidden />
                </button>
              )}
              <button type="button" onClick={() => moveBy(i, -1)} disabled={i === 0} className="grid size-7 place-items-center rounded-md text-foreground/60 hover:bg-foreground/10 disabled:opacity-30" aria-label="Subir" title="Subir">
                <ArrowUp className="size-3.5" aria-hidden />
              </button>
              <button type="button" onClick={() => moveBy(i, 1)} disabled={i === blocks.length - 1} className="grid size-7 place-items-center rounded-md text-foreground/60 hover:bg-foreground/10 disabled:opacity-30" aria-label="Descer" title="Descer">
                <ArrowDown className="size-3.5" aria-hidden />
              </button>
              <button type="button" onClick={() => remove(b.id)} className="grid size-7 place-items-center rounded-md text-foreground/60 hover:bg-red-500/10 hover:text-red-500" aria-label="Remover" title="Remover">
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** Barra para inserir texto, imagem, foto ou desenho no fim da nota. */
export function NoteInsertBar({ onAdd }: { onAdd: (blocks: NoteBlock[]) => void }) {
  const file = useRef<HTMLInputElement>(null);
  const cam = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const pick = async (list: FileList | null) => {
    const files = Array.from(list ?? []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    setBusy(true);
    const blocks = await imagesToBlocks(files);
    setBusy(false);
    if (blocks.length) onAdd(blocks);
  };
  const btn = 'inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-foreground/70 hover:bg-foreground/10 hover:text-foreground';
  return (
    <div className="flex flex-wrap items-center gap-1" role="toolbar" aria-label="Inserir na nota">
      <button type="button" className={btn} onClick={() => onAdd([newTextBlock()])}>
        <Type className="size-4" aria-hidden /> Texto
      </button>
      <button type="button" className={btn} onClick={() => file.current?.click()} disabled={busy}>
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ImageIcon className="size-4" aria-hidden />} Imagem
      </button>
      <button type="button" className={cn(btn, 'sm:hidden')} onClick={() => cam.current?.click()} disabled={busy}>
        <Camera className="size-4" aria-hidden /> Foto
      </button>
      <button type="button" className={btn} onClick={() => onAdd([newDrawing()])}>
        <PenLine className="size-4" aria-hidden /> Desenho
      </button>
      <input
        ref={file}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          void pick(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={cam}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          void pick(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
