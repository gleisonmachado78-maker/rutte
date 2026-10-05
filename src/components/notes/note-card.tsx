import { ArrowRightLeft, Check, ClipboardCopy, Copy, GripVertical, ListChecks, ListTodo, Maximize2, MoreHorizontal, Pin, PinOff, Plus, Trash2, Type, X } from 'lucide-react';
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
  return <textarea ref={ref} rows={1} value={value} onChange={(e) => onChange(e.target.value)} className={cn('block w-full resize-none overflow-hidden bg-transparent outline-none placeholder:text-foreground/35 focus-visible:ring-0 focus-visible:ring-offset-0', className)} {...rest} />;
}

const cursorToEnd = (e: React.FocusEvent<HTMLTextAreaElement>) => {
  const n = e.currentTarget.value.length;
  e.currentTarget.setSelectionRange(n, n);
};

export interface NoteCardProps {
  note: NoteBox;
  notebooks: Notebook[];
  /** "preview" = caixa compacta na grade; "editor" = caixa ampliada para escrever */
  mode?: 'preview' | 'editor';
  /** mostra de qual bloco é (na busca) */
  showNotebook?: boolean;
  dragging?: boolean;
  /** caixa recém-criada: começa pelo título */
  isNew?: boolean;
  onSave: (note: NoteBox) => void;
  onDelete: (note: NoteBox) => void;
  onDuplicate: (note: NoteBox) => void;
  onToTask: (note: NoteBox) => void;
  onOpen?: (id: string) => void;
  onClose?: () => void;
  onDragStart?: (e: ReactPointerEvent, id: string) => void;
}

/** Caixa de nota. Na grade é uma prévia; ao editar, abre ampliada e salva sozinha. */
export function NoteCard({ note, notebooks, mode = 'preview', showNotebook, dragging, isNew, onSave, onDelete, onDuplicate, onToTask, onOpen, onClose, onDragStart }: NoteCardProps) {
  const editor = mode === 'editor';
  const [draft, setDraft] = useState(note);
  const [focusItem, setFocusItem] = useState<string | null>(null);
  const timer = useRef<number>(0);
  const latest = useRef(note);
  const color = NOTE_COLOR_BY_ID[draft.color] ?? NOTE_COLOR_BY_ID.padrao;

  // Mudanças vindas de fora atualizam o rascunho sem atropelar o que está sendo digitado
  useEffect(() => {
    setDraft((d) => (timer.current && d.id === note.id ? { ...note, title: d.title, text: d.text, items: d.items } : note));
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
  // salva o que faltar ao fechar
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
  const open = () => onOpen?.(note.id);

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
  const empty = !draft.title.trim() && !draft.text.trim() && !draft.items.some((i) => i.text.trim());

  const checkbox = (it: NoteItem) => (
    <button
      type="button"
      role="checkbox"
      aria-checked={it.done}
      aria-label={it.done ? `Desmarcar: ${it.text}` : `Marcar: ${it.text}`}
      onClick={(e) => {
        e.stopPropagation();
        setItems(draft.items.map((x) => (x.id === it.id ? { ...x, done: !x.done } : x)), true);
      }}
      className={cn('mt-[3px] grid size-[18px] shrink-0 place-items-center rounded-md border-2 transition-colors', it.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-foreground/30 hover:border-primary')}
    >
      {it.done && <Check className="size-3" strokeWidth={3} aria-hidden />}
    </button>
  );

  const progress = draft.kind === 'lista' && draft.items.length > 0 && (
    <div className="mb-1.5 flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
        <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-300" style={{ width: `${(done / draft.items.length) * 100}%` }} />
      </div>
      <span className="text-[11px] font-semibold tabular-nums text-foreground/55">
        {done}/{draft.items.length}
      </span>
    </div>
  );

  return (
    <article
      data-note-id={editor ? undefined : note.id}
      data-pinned={note.pinned ? '1' : '0'}
      className={cn(
        'group relative flex flex-col border transition-[box-shadow,transform,opacity] duration-150',
        color.card,
        editor ? 'min-h-[55dvh] rounded-2xl p-4 sm:p-6' : 'rounded-2xl p-3 shadow-sm hover:shadow-md',
        dragging && 'z-10 scale-[1.02] opacity-80 shadow-xl ring-2 ring-primary',
      )}
    >
      <header className="flex items-start gap-1">
        {!editor && onDragStart && (
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
        {editor ? (
          <AutoText
            value={draft.title}
            onChange={(title) => commit({ ...draft, title })}
            placeholder="Título"
            aria-label="Título da nota"
            data-autofocus={isNew ? '' : undefined}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
            className="min-w-0 flex-1 py-1 text-xl font-bold leading-snug sm:text-2xl"
          />
        ) : (
          <button type="button" onClick={open} className="min-w-0 flex-1 py-1 text-left text-[15px] font-bold leading-snug">
            {draft.title ? <span className="line-clamp-2">{draft.title}</span> : <span className="sr-only">Abrir nota</span>}
          </button>
        )}
        <button
          type="button"
          onClick={() => commit({ ...draft, pinned: !draft.pinned }, true)}
          className={cn('grid size-7 shrink-0 place-items-center rounded-md transition-colors hover:bg-foreground/5', draft.pinned ? 'text-primary dark:text-neon' : 'text-foreground/30 opacity-100 hover:text-foreground/70 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100', editor && 'sm:opacity-100')}
          aria-label={draft.pinned ? 'Desafixar' : 'Fixar no topo'}
          aria-pressed={draft.pinned}
          title={draft.pinned ? 'Desafixar' : 'Fixar no topo'}
        >
          <Pin className={cn('size-4', draft.pinned && 'fill-current')} aria-hidden />
        </button>
        {editor && onClose && (
          <button type="button" onClick={onClose} className="grid size-7 shrink-0 place-items-center rounded-md text-foreground/45 hover:bg-foreground/5 hover:text-foreground" aria-label="Fechar e voltar ao tamanho normal">
            <X className="size-4" aria-hidden />
          </button>
        )}
      </header>

      {showNotebook && nb && <p className="mb-1 text-[11px] font-medium text-foreground/50">{nb.emoji} {nb.name}</p>}

      {/* ------------------------------ corpo ------------------------------ */}
      {editor ? (
        draft.kind === 'texto' ? (
          <AutoText
            value={draft.text}
            onChange={(text) => commit({ ...draft, text })}
            placeholder="Escreva à vontade…"
            aria-label="Texto da nota"
            data-autofocus={!isNew ? '' : undefined}
            onFocus={cursorToEnd}
            className="min-h-[40dvh] flex-1 py-2 text-base leading-relaxed"
          />
        ) : (
          <div className="flex-1 py-2">
            {progress}
            <ul className="space-y-1">
              {draft.items.map((it, idx) => (
                <li key={it.id} className="group/item flex items-start gap-2.5">
                  {checkbox(it)}
                  <input
                    value={it.text}
                    data-autofocus={!isNew && idx === draft.items.length - 1 ? '' : undefined}
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
                    className={cn('min-w-0 flex-1 bg-transparent py-0.5 text-base outline-none placeholder:text-foreground/35 focus-visible:ring-0 focus-visible:ring-offset-0', it.done && 'text-foreground/45 line-through')}
                  />
                  <button
                    type="button"
                    onClick={() => setItems(draft.items.filter((x) => x.id !== it.id), true)}
                    className="grid size-7 shrink-0 place-items-center rounded text-foreground/30 hover:text-red-500 sm:opacity-0 sm:group-hover/item:opacity-100"
                    aria-label={`Remover item: ${it.text}`}
                  >
                    <X className="size-4" aria-hidden />
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
              className="mt-2 inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-sm font-medium text-foreground/55 hover:text-primary"
            >
              <Plus className="size-4" aria-hidden /> Adicionar item
            </button>
          </div>
        )
      ) : (
        /* prévia: clicar abre a caixa ampliada */
        <div
          role="button"
          tabIndex={0}
          onClick={open}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              open();
            }
          }}
          className="-mx-1 cursor-text rounded-lg px-1 py-1 outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Editar nota${draft.title ? `: ${draft.title}` : ''}`}
        >
          {empty ? (
            <p className="text-sm text-foreground/40">Toque para escrever…</p>
          ) : draft.kind === 'texto' ? (
            <p className="line-clamp-[10] whitespace-pre-wrap break-words text-sm leading-relaxed">{draft.text}</p>
          ) : (
            <>
              {progress}
              <ul className="space-y-0.5">
                {draft.items.slice(0, 7).map((it) => (
                  <li key={it.id} className="flex items-start gap-2">
                    {checkbox(it)}
                    <span className={cn('min-w-0 flex-1 break-words py-0.5 text-sm', it.done && 'text-foreground/45 line-through', !it.text && 'text-foreground/35')}>{it.text || 'Item vazio'}</span>
                  </li>
                ))}
              </ul>
              {draft.items.length > 7 && <p className="mt-1 text-xs font-medium text-foreground/50">+ {draft.items.length - 7} itens</p>}
            </>
          )}
        </div>
      )}

      {/* ------------------------------ rodapé ------------------------------ */}
      <footer className={cn('mt-auto flex flex-wrap items-center gap-1 pt-2', editor && 'border-t border-foreground/10 pt-3')}>
        <div role="radiogroup" aria-label="Cor da nota" className={cn('flex items-center gap-1 transition-opacity', editor ? 'opacity-100' : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100')}>
          {NOTE_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={draft.color === c.id}
              aria-label={`Cor ${c.label}`}
              title={c.label}
              onClick={() => commit({ ...draft, color: c.id }, true)}
              className={cn('rounded-full transition-transform hover:scale-125', editor ? 'size-5' : 'size-4', c.dot, draft.color === c.id && 'ring-2 ring-foreground/60')}
            />
          ))}
        </div>
        <span className="ml-auto text-[10px] tabular-nums text-foreground/40" title={`Editada em ${new Date(draft.updatedAt).toLocaleString('pt-BR')}`}>
          {editor ? `Editada ${new Date(draft.updatedAt).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}` : new Date(draft.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </span>
        {!editor && (
          <button type="button" onClick={open} className="grid size-7 place-items-center rounded-md text-foreground/40 hover:bg-foreground/5 hover:text-foreground" aria-label="Abrir em tamanho grande" title="Abrir em tamanho grande">
            <Maximize2 className="size-4" aria-hidden />
          </button>
        )}
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
          <DropdownMenuContent align="end" className="z-[80] w-56">
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
        {editor && onClose && (
          <button type="button" onClick={onClose} className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:brightness-110">
            <Check className="size-4" aria-hidden /> Concluir
          </button>
        )}
      </footer>
    </article>
  );
}
