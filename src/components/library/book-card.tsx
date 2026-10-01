import { BookOpenCheck, Check, ExternalLink, Plus } from 'lucide-react';
import { useState } from 'react';
import { useCreateTask, useSetBookStatus } from '@/hooks/use-data';
import { coverUrl, SHELF_LABEL, TOPIC_BY_ID, whereToFind, type Book, type ShelfStatus } from '@/lib/library';
import { todayISO } from '@/lib/task-utils';
import { cn } from '@/lib/utils';

/** Capa do Google Livros; sem internet (ou se a imagem falhar), mostra uma capa tipográfica. */
export function BookCover({ book, className }: { book: Book; className?: string }) {
  const [failed, setFailed] = useState(false);
  const topic = TOPIC_BY_ID[book.topic];
  if (failed) {
    return (
      <div
        className={cn('flex aspect-[2/3] flex-col justify-between rounded-md p-2.5 text-white shadow-md', className)}
        style={{ background: `linear-gradient(160deg, ${topic.color}, #111727)` }}
        role="img"
        aria-label={`Capa: ${book.title}`}
      >
        <topic.icon className="size-4 opacity-80" aria-hidden />
        <span className="line-clamp-4 font-brand text-sm font-bold leading-tight">{book.title}</span>
        <span className="line-clamp-1 text-[10px] opacity-80">{book.author}</span>
      </div>
    );
  }
  return (
    <img
      src={coverUrl(book.googleId)}
      alt={`Capa do livro ${book.title}`}
      loading="lazy"
      onError={() => setFailed(true)}
      onLoad={(e) => {
        // O Google devolve uma imagem minúscula quando não há capa
        if ((e.target as HTMLImageElement).naturalWidth < 40) setFailed(true);
      }}
      className={cn('aspect-[2/3] w-full rounded-md bg-muted object-cover shadow-md', className)}
    />
  );
}

const STATUSES: ShelfStatus[] = ['quero', 'lendo', 'lido'];

export function BookCard({ book, status }: { book: Book; status?: ShelfStatus }) {
  const setStatus = useSetBookStatus();
  const createTask = useCreateTask();
  const [goalAdded, setGoalAdded] = useState(false);
  const topic = TOPIC_BY_ID[book.topic];

  const addGoal = () => {
    createTask.mutate(
      {
        title: `Ler 10 páginas de “${book.title}”`,
        whatToDo: `${book.title} — ${book.author}. ${book.why}`,
        status: 'NOT_STARTED',
        priority: 'MEDIUM',
        dueDate: todayISO(),
        recurrenceRule: 'FREQ=DAILY',
        scope: 'PERSONAL',
        lifeAreaId: 'intelectual',
        subtasks: [],
        links: whereToFind(book).map((l, i) => ({ id: `lk_${book.googleId}_${i}`, title: l.label, url: l.href })),
      },
      { onSuccess: () => setGoalAdded(true) },
    );
    if (!status) setStatus.mutate({ id: book.googleId, status: 'lendo' });
  };

  return (
    <article className="flex gap-3 rounded-xl border border-border bg-card p-3">
      <div className="w-[84px] shrink-0 sm:w-24">
        <BookCover book={book} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div>
          <h4 className="font-semibold leading-snug">{book.title}</h4>
          <p className="text-xs text-foreground/60">
            {book.author}
            {book.pages ? ` · ${book.pages} págs.` : ''}
          </p>
          <p className="mt-1.5 text-sm leading-snug text-foreground/80">{book.why}</p>
        </div>

        <div role="radiogroup" aria-label={`Minha estante: ${book.title}`} className="flex flex-wrap gap-1">
          {STATUSES.map((s) => {
            const on = status === s;
            return (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setStatus.mutate({ id: book.googleId, status: on ? null : s })}
                className={cn(
                  'inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-xs font-medium transition-colors',
                  on ? 'border-primary bg-primary text-white' : 'border-border hover:bg-muted',
                )}
              >
                {on && <Check className="size-3" aria-hidden />}
                {SHELF_LABEL[s]}
              </button>
            );
          })}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="font-semibold text-foreground/60">Onde encontrar:</span>
          {whereToFind(book).map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline dark:text-neon">
              {l.label}
              {l.hint && <span className="text-foreground/45">({l.hint})</span>}
              <ExternalLink className="size-3" aria-hidden />
            </a>
          ))}
        </div>

        {status !== 'lido' && (
          <button
            type="button"
            onClick={addGoal}
            disabled={goalAdded || createTask.isPending}
            className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-foreground/70 hover:text-primary disabled:text-emerald-600"
          >
            {goalAdded ? <BookOpenCheck className="size-3.5" aria-hidden /> : <Plus className="size-3.5" aria-hidden />}
            {goalAdded ? 'Meta de leitura criada' : 'Criar meta de leitura (10 págs./dia)'}
          </button>
        )}
        <span className="sr-only">Tema: {topic.label}</span>
      </div>
    </article>
  );
}
