import { ArrowRightLeft, Check, ClipboardCopy, Copy, GripVertical, ListChecks, ListTodo, MoreHorizontal, Pin, PinOff, Plus, Trash2, Type, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown';
import { newItem, NOTE_COLOR_BY_ID, NOTE_COLORS, noteToText } from '@/lib/notes';
import { cn } from '@/lib/utils';
import type { NoteBox, NoteItem, Notebook } from '@/types';

/** Textarea que cresce com o conteúdo. */
function AutoText({ value, onChange, className, ...rest }: { value: string; onChange: (v: string) => void; className?: string } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return <textarea ref={ref} rows={1} value={value} onChange={(e) => onChange(e.target.value)} className={cn('block w-full resize-none overflow-hidden bg-transparent outline-none placeholder:text-foreground/35', className)} {...rest} />;
}

export interface NoteCardProps {
  note: NoteBox;
  notebooks: Notebook[];
  /** mostra de qual bloco é (na busca) */
  showNotebook?: boolean;
  dragging?: boolean;
  autoFocus?: boolean;
  onSave: (note: NoteBox) => void;
  onDelete: (note: NoteBox) => void;
  onDuplicate: (note: NoteBox) => void;
  onToTask: (note: NoteBox) => void;
  onDragStart?: (e: ReactPointerEvent, id: string) => void;
}

/** Caixa de nota: edita no lugar e salva sozinha (pequena pausa depois de digitar). */
export function NoteCard({ note, notebooks, showNotebook, dragging, autoFocus, onSave, onDelete, onDuplicate, onToTask, onDragStart }: NoteCardProps) {
  const [draft, setDraft] = useState(note);
  const [focusItem, setFocusItem] = useState<string | null>(null);
  const timer = useRef<number>(0);
  const latest = useRef(note);
  const color = NOTE_COLOR_BY_ID[draft.color] ?? NOTE_COLOR_BY_ID.padrao;

  // Mudanças vindas de fora (fixar, mover, reordenar) atualizam o rascunho sem perder o texto em edição
  useEffect(() => {
    setDraft((d) => ({ ...note, title: d.id === note.id && timer.current ? d.title : note.title, text: d.id === note.id && timer.current ? d.text : note.text, items: d.id === note.id && timer.current ? d.items : note.items }));
  }, [note]);

  const commit = (next: NoteBox, immediate = false) => {
    const stamped = { ...next, updatedAt: new Date().toISOString() };
    setDraft(stamped);
    latest.current = stamped;
    window.clearTimeout(timer.current);
    if (immediate) {
      timer.current = 0;
      onSave(stamped);
      return;
    }
    timer.current = window.setTimeout(() => {
      timer.current = 0;
      onSave(latest.current);
    }, 450);
  };
  // salva o que faltar ao sair da tela
  useEffect(
    () => () => {
      if (timer.current) {
        window.clearTimeout(timer.current);
        onSave(latest.current);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const setItems = (items: NoteItem[], immediate = false) => commit({ ...draft, items }, immediate);
  const done = draft.items.filter((i) => i.done).length;

  const toggleKind = () => {
    if (draft.kind === 'texto') {
      const lines = draft.text.split('\n').map((l) => l.replace(/^\s*(?:[-•*]|\[[ x]\])\s*/i, '').trim()).filter(Boolean);
      commit({ ...draft, kind: 'lista', items: lines.length ? lines.map((l) => newItem(l)) : [newItem()] }, true);
    } else {
      commit({ ...draft, kind: 'texto', text: draft.items.map((i) => (i.done ? `✓ ${i.text}` : i.text)).join('\n') }, true);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(noteToText(draft));
      toast.success('Nota copiada');
    } catch {
      toast('Não foi possível copiar');
    }
  };

  const nb = notebooks.find((n) => n.id === draft.notebookId);

  return (
    <article
      data-note-id={note.id}
      data-pinned={note.pinned ? '1' : '0'}
      className={cn(
        'group relative flex flex-col rounded-2xl border p-3 shadow-sm transition-[box-shadow,transform,opacity] duration-150 focus-within:shadow-md',
        color.card,
        dragging && 'z-10 scale-[1.02] opacity-80 shadow-xl ring-2 ring-primary',
      )}
    >
      <header className="flex items-start gap-1">
        {onDragStart && (
          <button
            type="button"
            onPointerDown={(e) => onDragStart(e, note.id)}
            className="-ml-1 mt-0.5 grid size-7 shrink-0 cursor-grab touch-none place-items-center rounded-md text-foreground/30 hover:bg-foreground/5 hover:text-foreground/70 active:cursor-grabbing"
            aria-label="Arrastar para reorganizar"
            title="Arraste para reorganizar"
          >
            <GripVertical className="size-4" aria-hidden />
          </button>
        )}
        <AutoText
          value={draft.title}
          onChange={(title) => commit({ ...draft, title })}
          placeholder="Título"
          aria-label="Título da nota"
          autoFocus={autoFocus}
          className="min-w-0 flex-1 py-1 text-[15px] font-bold leading-snug"
        />
        <button
          type="button"
          onClick={() => commit({ ...draft, pinned: !draft.pinned }, true)}
          className={cn('grid size-7 shrink-0 place-items-center rounded-md transition-colors hover:bg-foreground/5', draft.pinned ? 'text-primary dark:text-neon' : 'text-foreground/30 opacity-100 hover:text-foreground/70 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100')}
          aria-label={draft.pinned ? 'Desafixar' : 'Fixar no topo'}
          aria-pressed={draft.pinned}
          title={draft.pinned ? 'Desafixar' : 'Fixar no topo'}
        >
          <Pin className={cn('size-4', draft.pinned && 'fill-current')} aria-hidden />
        </button>
      </header>

      {showNotebook && nb && <p className="mb-1 text-[11px] font-medium text-foreground/50">{nb.emoji} {nb.name}</p>}

      {draft.kind === 'texto' ? (
        <AutoText value={draft.text} onChange={(text) => commit({ ...draft, text })} placeholder="Escreva aqui…" aria-label="Texto da nota" className="min-h-[3rem] py-1 text-sm leading-relaxed" />
      ) : (
        <div className="py-1">
          {draft.items.length > 0 && (
            <div className="mb-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
                <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-300" style={{ width: `${(done / draft.items.length) * 100}%` }} />
              </div>
              <span className="text-[11px] font-semibold tabular-nums text-foreground/55">
                {done}/{draft.items.length}
              </span>
            </div>
          )}
          <ul className="space-y-0.5">
            {draft.items.map((it, idx) => (
              <li key={it.id} className="group/item flex items-start gap-2">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={it.done}
                  aria-label={it.done ? `Desmarcar: ${it.text}` : `Marcar: ${it.text}`}
                  onClick={() => setItems(draft.items.map((x) => (x.id === it.id ? { ...x, done: !x.done } : x)), true)}
                  className={cn('mt-[3px] grid size-[18px] shrink-0 place-items-center rounded-md border-2 transition-colors', it.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-foreground/30 hover:border-primary')}
                >
                  {it.done && <Check className="size-3" strokeWidth={3} aria-hidden />}
                </button>
                <input
                  value={it.text}
                  ref={(el) => {
                    if (el && focusItem === it.id) {
                      el.focus();
                      setFocusItem(null);
                    }
                  }}
                  onChange={(e) => setItems(draft.items.map((x) => (x.id === it.id ? { ...x, text: e.target.value } : x)))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const n = newItem();
                      const items = [...draft.items];
                      items.splice(idx + 1, 0, n);
                      setItems(items);
                      setFocusItem(n.id);
                    } else if (e.key === 'Backspace' && !it.text && draft.items.length > 1) {
                      e.preventDefault();
                      setItems(draft.items.filter((x) => x.id !== it.id));
                      setFocusItem(draft.items[Math.max(0, idx - 1)].id);
                    }
                  }}
                  placeholder="Item da lista"
                  aria-label={`Item ${idx + 1}`}
                  className={cn('min-w-0 flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-foreground/35', it.done && 'text-foreground/45 line-through')}
                />
                <button
                  type="button"
                  onClick={() => setItems(draft.items.filter((x) => x.id !== it.id), true)}
                  className="grid size-6 shrink-0 place-items-center rounded text-foreground/30 opacity-100 hover:text-red-500 sm:opacity-0 sm:group-hover/item:opacity-100"
                  aria-label={`Remover item: ${it.text}`}
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              const n = newItem();
              setItems([...draft.items, n]);
              setFocusItem(n.id);
            }}
            className="mt-1 inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-xs font-medium text-foreground/55 hover:text-primary"
          >
            <Plus className="size-3.5" aria-hidden /> Adicionar item
          </button>
        </div>
      )}

      <footer className="mt-auto flex items-center gap-1 pt-2">
        <div role="radiogroup" aria-label="Cor da nota" className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          {NOTE_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={draft.color === c.id}
              aria-label={`Cor ${c.label}`}
              title={c.label}
              onClick={() => commit({ ...draft, color: c.id }, true)}
              className={cn('size-4 rounded-full ring-offset-1 ring-offset-transparent transition-transform hover:scale-125', c.dot, draft.color === c.id && 'ring-2 ring-foreground/60')}
            />
          ))}
        </div>
        <span className="ml-auto text-[10px] tabular-nums text-foreground/40" title={`Editada em ${new Date(draft.updatedAt).toLocaleString('pt-BR')}`}>
          {new Date(draft.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </span>
        <button
          type="button"
          onClick={toggleKind}
          className="grid size-7 place-items-center rounded-md text-foreground/40 hover:bg-foreground/5 hover:text-foreground"
          aria-label={draft.kind === 'texto' ? 'Transformar em lista' : 'Transformar em texto'}
          title={draft.kind === 'texto' ? 'Transformar em lista' : 'Transformar em texto'}
        >
          {draft.kind === 'texto' ? <ListChecks className="size-4" aria-hidden /> : <Type className="size-4" aria-hidden />}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="grid size-7 place-items-center rounded-md text-foreground/40 hover:bg-foreground/5 hover:text-foreground" aria-label="Mais opções da nota">
              <MoreHorizontal className="size-4" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onSelect={() => commit({ ...draft, pinned: !draft.pinned }, true)}>
              {draft.pinned ? <PinOff /> : <Pin />} {draft.pinned ? 'Desafixar' : 'Fixar no topo'}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDuplicate(draft)}>
              <Copy /> Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={copy}>
              <ClipboardCopy /> Copiar texto
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onToTask(draft)}>
              <ListTodo /> Transformar em afazer
            </DropdownMenuItem>
            {notebooks.length > 1 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Mover para</DropdownMenuLabel>
                {notebooks
                  .filter((n) => n.id !== draft.notebookId)
                  .map((n) => (
                    <DropdownMenuItem key={n.id} onSelect={() => commit({ ...draft, notebookId: n.id }, true)}>
                      <ArrowRightLeft /> {n.emoji} {n.name}
                    </DropdownMenuItem>
                  ))}
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 dark:text-red-400" onSelect={() => onDelete(draft)}>
              <Trash2 /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </footer>
    </article>
  );
}
