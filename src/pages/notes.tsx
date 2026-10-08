import { Briefcase, Check, ChevronDown, User, ListChecks, Pencil, Plus, Search, StickyNote, Trash2, Type, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { NoteCard } from '@/components/notes/note-card';
import { Button } from '@/components/ui/button';
import { askConfirm } from '@/components/ui/confirm';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown';
import { useCreateTask, useDeleteNote, useDeleteNotebook, useNotebooks, useNotes, useReorderNotes, useSaveNote, useSaveNotebook } from '@/hooks/use-data';
import { newItem, newNote, NOTEBOOK_EMOJIS, noteToText } from '@/lib/notes';
import { todayISO } from '@/lib/task-utils';
import { cn, uid } from '@/lib/utils';
import { useUI } from '@/store/ui';
import type { NoteBox, Notebook, Scope } from '@/types';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const LAST_KEY = 'rutte:notes-last';

export function NotesPage() {
  const { data: notebooks = [] } = useNotebooks();
  const { data: notes = [] } = useNotes();
  const saveNote = useSaveNote();
  const delNote = useDeleteNote();
  const saveNb = useSaveNotebook();
  const delNb = useDeleteNotebook();
  const reorder = useReorderNotes();
  const createTask = useCreateTask();
  const qc = useQueryClient();

  const [active, setActive] = useState<string>(() => {
    try {
      return localStorage.getItem(LAST_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [q, setQ] = useState('');
  const [quick, setQuick] = useState('');
  /** caixa aberta em tamanho grande para editar */
  const [openId, setOpenId] = useState<string | null>(null);
  const [newId, setNewId] = useState<string | null>(null);
  const [newNbOpen, setNewNbOpen] = useState(false);
  const [nbName, setNbName] = useState('');
  const [renaming, setRenaming] = useState<string | null>(null);

  // Pessoal x Empresa: segue o seletor global quando ele aponta um dos dois
  const globalScope = useUI((s) => s.scope);
  const [side, setSide] = useState<Scope>(globalScope === 'BUSINESS' ? 'BUSINESS' : 'PERSONAL');
  useEffect(() => {
    if (globalScope !== 'ALL') setSide(globalScope);
  }, [globalScope]);
  const scopeOf = (nb?: Notebook) => nb?.scope ?? 'PERSONAL';
  const nbs = useMemo(() => notebooks.filter((n) => scopeOf(n) === side), [notebooks, side]);
  const notesIn = (sc: Scope) => notes.filter((n) => scopeOf(notebooks.find((b) => b.id === n.notebookId)) === sc).length;

  const current = nbs.find((n) => n.id === active) ?? nbs[0];
  useEffect(() => {
    if (current && current.id !== active) setActive(current.id);
  }, [current, active]);
  useEffect(() => {
    try {
      if (active) localStorage.setItem(LAST_KEY, active);
    } catch {
      /* sem armazenamento */
    }
  }, [active]);

  /* ---------- arrastar para reorganizar (mouse e toque) ---------- */
  const [dragId, setDragId] = useState<string | null>(null);
  const [order, setOrder] = useState<string[] | null>(null);
  const orderRef = useRef<string[] | null>(null);

  const query = norm(q.trim());
  const visible = useMemo(() => {
    const base = query ? notes.filter((n) => scopeOf(notebooks.find((b) => b.id === n.notebookId)) === side && norm(noteToText(n)).includes(query)) : notes.filter((n) => n.notebookId === current?.id);
    const sorted = [...base].sort((a, b) => Number(b.pinned) - Number(a.pinned) || a.order - b.order);
    if (!order) return sorted;
    const pos = new Map(order.map((id, i) => [id, i]));
    return [...sorted].sort((a, b) => (pos.get(a.id) ?? 0) - (pos.get(b.id) ?? 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, notebooks, side, current?.id, query, order]);

  const startDrag = (e: ReactPointerEvent, id: string) => {
    if (query) return;
    e.preventDefault();
    const ids = visible.map((n) => n.id);
    orderRef.current = ids;
    setOrder(ids);
    setDragId(id);
    const pinned = visible.find((n) => n.id === id)?.pinned;

    const move = (ev: PointerEvent) => {
      const el = document.elementFromPoint(ev.clientX, ev.clientY)?.closest<HTMLElement>('[data-note-id]');
      const over = el?.dataset.noteId;
      if (!over || over === id || (el.dataset.pinned === '1') !== !!pinned) return;
      const cur = orderRef.current!;
      const from = cur.indexOf(id);
      const to = cur.indexOf(over);
      if (from < 0 || to < 0) return;
      const next = [...cur];
      next.splice(from, 1);
      next.splice(to, 0, id);
      orderRef.current = next;
      setOrder(next);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      const final = orderRef.current;
      if (final) reorder.mutate(final);
      setDragId(null);
      setOrder(null);
      orderRef.current = null;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  /* ---------- ações ---------- */
  const firstOrder = () => Math.min(0, ...notes.filter((n) => n.notebookId === current?.id).map((n) => n.order)) - 1;

  const addBox = (kind: 'texto' | 'lista', text = '') => {
    if (!current) return;
    const n = newNote(current.id, kind === 'lista' ? { kind, items: [newItem()] } : { text }, firstOrder());
    saveNote.mutate(n);
    setQ('');
    if (!text) {
      // caixa nova já abre grande, pronta para escrever
      setNewId(n.id);
      setOpenId(n.id);
    }
  };

  /** Fecha a caixa grande; se era nova e ficou vazia, descarta. */
  const closeEditor = () => {
    const id = openId;
    const wasNew = id && id === newId;
    setOpenId(null);
    setNewId(null);
    if (!wasNew) return;
    // espera o último salvamento da caixa (feito ao fechar) e confere se ficou vazia
    window.setTimeout(() => {
      const n = qc.getQueryData<NoteBox[]>(['notes'])?.find((x) => x.id === id);
      if (n && !n.title.trim() && !n.text.trim() && !n.items.some((i) => i.text.trim())) delNote.mutate(n.id);
    }, 50);
  };

  const removeNote = (n: NoteBox) => {
    if (openId === n.id) {
      setOpenId(null);
      setNewId(null);
    }
    delNote.mutate(n.id);
    toast('Nota excluída', { description: n.title || noteToText(n).slice(0, 60) || 'Sem título', action: { label: 'Desfazer', onClick: () => saveNote.mutate(n) } });
  };

  const duplicate = (n: NoteBox) => {
    const now = new Date().toISOString();
    saveNote.mutate({ ...n, id: uid('nt'), title: n.title ? `${n.title} (cópia)` : '', items: n.items.map((i) => ({ ...i, id: uid('it') })), order: n.order - 0.5, pinned: false, createdAt: now, updatedAt: now });
    toast.success('Nota duplicada');
  };

  const toTask = (n: NoteBox) => {
    createTask.mutate({
      title: n.title || (n.kind === 'lista' ? n.items[0]?.text : n.text.split('\n')[0])?.slice(0, 120) || 'Afazer da nota',
      whatToDo: n.kind === 'texto' ? n.text : undefined,
      status: 'NOT_STARTED',
      priority: 'MEDIUM',
      dueDate: todayISO(),
      scope: scopeOf(notebooks.find((b) => b.id === n.notebookId)),
      subtasks: n.kind === 'lista' ? n.items.filter((i) => i.text.trim()).map((i) => ({ id: uid('st'), title: i.text, isCompleted: i.done })) : [],
      links: [],
    });
  };

  const createNotebook = (fixed?: string) => {
    const name = (fixed ?? nbName).trim();
    if (!name) return setNewNbOpen(false);
    const nb: Notebook = { id: uid('nb'), name, emoji: fixed ? '💼' : NOTEBOOK_EMOJIS[notebooks.length % NOTEBOOK_EMOJIS.length], order: notebooks.length, createdAt: new Date().toISOString(), scope: side };
    saveNb.mutate(nb);
    setActive(nb.id);
    setNbName('');
    setNewNbOpen(false);
  };

  const removeNotebook = async (nb: Notebook) => {
    const count = notes.filter((n) => n.notebookId === nb.id).length;
    if (side === 'PERSONAL' && nbs.length <= 1) {
      toast('Você precisa ter pelo menos um bloco');
      return;
    }
    if (await askConfirm({ title: `Excluir o bloco “${nb.name}”?`, message: count ? `As ${count} notas dentro dele também serão excluídas.` : 'O bloco está vazio.', confirmLabel: 'Excluir bloco', danger: true })) {
      delNb.mutate(nb.id);
      setActive(nbs.find((n) => n.id !== nb.id)?.id ?? '');
    }
  };

  const openNote = openId ? notes.find((n) => n.id === openId) : undefined;
  const pinned = visible.filter((n) => n.pinned);
  const others = visible.filter((n) => !n.pinned);
  const countOf = (id: string) => notes.filter((n) => n.notebookId === id).length;

  const grid = (list: NoteBox[]) => (
    <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {list.map((n) => (
        <NoteCard
          key={n.id}
          note={n}
          notebooks={notebooks}
          showNotebook={!!query}
          dragging={dragId === n.id}
          onOpen={(id) => {
            setNewId(null);
            setOpenId(id);
          }}
          onSave={(x) => saveNote.mutate(x)}
          onDelete={removeNote}
          onDuplicate={duplicate}
          onToTask={toTask}
          onDragStart={query ? undefined : startDrag}
        />
      ))}
    </div>
  );

  return (
    <div className={cn('space-y-4', dragId && 'select-none')}>
      <header className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <StickyNote className="size-7 text-primary" aria-hidden /> Notas
          </h1>
          <p className="text-sm text-foreground/60">Blocos de notas com quantas caixas você quiser. Tudo salva sozinho.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar em todas as notas…"
            aria-label="Buscar nas notas"
            className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-9 text-sm focus:border-primary focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {q && (
            <button type="button" onClick={() => setQ('')} className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-foreground/50 hover:bg-muted" aria-label="Limpar busca">
              <X className="size-4" />
            </button>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={!current}>
              <Plus /> Nova caixa <ChevronDown className="opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
            <DropdownMenuItem onSelect={() => addBox('texto')}>
              <Type /> Caixa de texto
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => addBox('lista')}>
              <ListChecks /> Lista de itens
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Pessoal x Empresa */}
      <div role="radiogroup" aria-label="Notas pessoais ou de trabalho" className="inline-flex rounded-xl border border-border bg-card p-1">
        {([
          ['PERSONAL', 'Pessoal', User, 'bg-brand'],
          ['BUSINESS', 'Empresa', Briefcase, 'bg-business'],
        ] as const).map(([value, label, Icon, bg]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={side === value}
            onClick={() => {
              setSide(value);
              setQ('');
            }}
            className={cn('flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold transition-all duration-200', side === value ? cn(bg, 'text-white shadow-sm') : 'text-foreground/60 hover:text-foreground')}
          >
            <Icon className="size-4" aria-hidden /> {label}
            <span className={cn('text-xs tabular-nums', side === value ? 'text-white/75' : 'text-foreground/40')}>{notesIn(value)}</span>
          </button>
        ))}
      </div>

      {/* Blocos */}
      <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none]" role="tablist" aria-label="Blocos de notas">
        {nbs.map((nb) => {
          const on = nb.id === current?.id && !query;
          if (renaming === nb.id) {
            return (
              <form
                key={nb.id}
                className="flex shrink-0 items-center gap-1 rounded-full border border-primary bg-card pl-3 pr-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  const name = new FormData(e.currentTarget).get('name')?.toString().trim();
                  if (name) saveNb.mutate({ ...nb, name });
                  setRenaming(null);
                }}
              >
                <input name="name" autoFocus defaultValue={nb.name} onBlur={(e) => e.currentTarget.form?.requestSubmit()} aria-label="Novo nome do bloco" className="h-8 w-32 bg-transparent text-sm font-medium outline-none" />
                <button type="submit" className="grid size-7 place-items-center rounded-full text-primary" aria-label="Salvar nome">
                  <Check className="size-4" />
                </button>
              </form>
            );
          }
          return (
            <div key={nb.id} className={cn('flex shrink-0 items-center rounded-full border transition-colors', on ? 'border-primary bg-primary text-white' : 'border-border bg-card hover:bg-muted')}>
              <button type="button" role="tab" aria-selected={on} onClick={() => { setActive(nb.id); setQ(''); }} className="flex h-9 items-center gap-1.5 pl-3.5 pr-2 text-sm font-medium">
                <span aria-hidden>{nb.emoji}</span> {nb.name}
                <span className={cn('text-xs tabular-nums', on ? 'text-white/75' : 'text-foreground/45')}>{countOf(nb.id)}</span>
              </button>
              {on && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="mr-1 grid size-7 place-items-center rounded-full hover:bg-white/15" aria-label={`Opções do bloco ${nb.name}`}>
                      <ChevronDown className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-60">
                    <DropdownMenuItem onSelect={() => setRenaming(nb.id)}>
                      <Pencil /> Renomear
                    </DropdownMenuItem>
                    <DropdownMenuLabel>Ícone</DropdownMenuLabel>
                    <div className="grid grid-cols-8 gap-0.5 px-1 pb-1">
                      {NOTEBOOK_EMOJIS.map((em) => (
                        <button key={em} type="button" onClick={() => saveNb.mutate({ ...nb, emoji: em })} className={cn('grid size-7 place-items-center rounded-md text-base hover:bg-muted', nb.emoji === em && 'bg-muted ring-1 ring-primary')} aria-label={`Ícone ${em}`}>
                          {em}
                        </button>
                      ))}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 dark:text-red-400" onSelect={() => removeNotebook(nb)}>
                      <Trash2 /> Excluir bloco
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}
        {newNbOpen ? (
          <form
            className="flex shrink-0 items-center gap-1 rounded-full border border-primary bg-card pl-3 pr-1"
            onSubmit={(e) => {
              e.preventDefault();
              createNotebook();
            }}
          >
            <input autoFocus value={nbName} onChange={(e) => setNbName(e.target.value)} onBlur={() => createNotebook()} onKeyDown={(e) => e.key === 'Escape' && setNewNbOpen(false)} placeholder="Nome do bloco" aria-label="Nome do novo bloco" className="h-8 w-36 bg-transparent text-sm outline-none" />
            <button type="submit" className="grid size-7 place-items-center rounded-full text-primary" aria-label="Criar bloco">
              <Check className="size-4" />
            </button>
          </form>
        ) : (
          <button type="button" onClick={() => setNewNbOpen(true)} className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-dashed border-border px-3.5 text-sm font-medium text-foreground/60 hover:border-primary hover:text-primary">
            <Plus className="size-4" aria-hidden /> Novo bloco
          </button>
        )}
      </div>

      {/* Nota rápida */}
      {!query && current && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!quick.trim()) return;
            addBox('texto', quick.trim());
            setQuick('');
          }}
          className="flex items-center gap-2 rounded-2xl border border-border bg-card p-1.5 pl-4 shadow-sm focus-within:border-primary"
        >
          <input value={quick} onChange={(e) => setQuick(e.target.value)} placeholder={`Nota rápida em “${current.name}”… (Enter para salvar)`} aria-label="Nota rápida" className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none" />
          <Button type="submit" size="sm" disabled={!quick.trim()}>
            <Plus /> Salvar
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => addBox('lista')} title="Nova lista">
            <ListChecks />
          </Button>
        </form>
      )}

      {query && <p className="text-sm text-foreground/60">{visible.length ? `${visible.length} ${visible.length === 1 ? 'nota encontrada' : 'notas encontradas'} em ${side === 'BUSINESS' ? 'Empresa' : 'Pessoal'}` : 'Nenhuma nota encontrada.'}</p>}

      {!query && !current && (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border px-6 py-14 text-center">
          <Briefcase className="size-10 text-business/60" aria-hidden />
          <p className="mt-3 font-semibold">Suas notas de trabalho ficam aqui</p>
          <p className="mt-1 max-w-sm text-sm text-foreground/60">Separadas das pessoais: reuniões, clientes, ideias de projeto.</p>
          <Button className="mt-4" onClick={() => createNotebook('Trabalho')}>
            <Plus /> Criar bloco de trabalho
          </Button>
        </div>
      )}

      {!query && visible.length === 0 && current && (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border px-6 py-14 text-center">
          <StickyNote className="size-10 text-foreground/25" aria-hidden />
          <p className="mt-3 font-semibold">Este bloco está vazio</p>
          <p className="mt-1 max-w-sm text-sm text-foreground/60">Crie caixas para separar ideias, resumos, listas e rascunhos.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button onClick={() => addBox('texto')}>
              <Type /> Caixa de texto
            </Button>
            <Button variant="outline" onClick={() => addBox('lista')}>
              <ListChecks /> Lista
            </Button>
          </div>
        </div>
      )}

      {pinned.length > 0 && (
        <section aria-label="Notas fixadas" className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/50">Fixadas</h2>
          {grid(pinned)}
        </section>
      )}
      {others.length > 0 && (
        <section aria-label="Notas" className="space-y-2">
          {pinned.length > 0 && <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/50">Outras</h2>}
          {grid(others)}
        </section>
      )}
      {/* Caixa aberta em tamanho grande */}
      <Dialog open={!!openNote} onOpenChange={(o) => !o && closeEditor()}>
        <DialogContent
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            // foca o título (caixa nova) ou o fim do texto (caixa existente)
            e.preventDefault();
            window.setTimeout(() => document.querySelector<HTMLElement>('[role=dialog] [data-autofocus]')?.focus(), 60);
          }}
          className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-3xl overflow-y-auto rounded-2xl border-0 bg-background p-0 shadow-2xl">
          <DialogTitle className="sr-only">{openNote?.title || 'Editar nota'}</DialogTitle>
          {openNote && (
            <NoteCard
              key={openNote.id}
              mode="editor"
              isNew={openNote.id === newId}
              note={openNote}
              notebooks={notebooks}
              onSave={(x) => saveNote.mutate(x)}
              onDelete={removeNote}
              onDuplicate={duplicate}
              onToTask={toTask}
              onClose={closeEditor}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
