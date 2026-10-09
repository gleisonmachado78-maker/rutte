import { BookOpen, Check, ChevronLeft, ChevronRight, CirclePlay, ListPlus, ListTodo, Search, TvMinimalPlay } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/sheet';
import { useCreateTask } from '@/hooks/use-data';
import { GOAL_GUIDES, tipBook, youtubeSearchUrl } from '@/lib/goal-guides';
import { coverUrl } from '@/lib/library';
import { GOALS } from '@/lib/onboarding';
import { todayISO } from '@/lib/task-utils';
import { cn } from '@/lib/utils';
import { embedUrl, LIFE_VIDEOS, thumbUrl, type LifeVideo } from '@/lib/videos';
import { useUI } from '@/store/ui';
import type { GoalId } from '@/types';

const DONE_KEY = 'rutte:goal-tips';
const readDone = (): Record<string, boolean> => {
  try {
    return JSON.parse(localStorage.getItem(DONE_KEY) ?? '{}');
  } catch {
    return {};
  }
};

type Tab = 'dicas' | 'videos';

/** Guia de uma meta: dicas de livros (uma por vez), vídeos para assistir ali mesmo e busca no YouTube. */
export function GoalGuideDialog({ goal, stats, onClose }: { goal: GoalId | null; stats?: string; onClose: () => void }) {
  return (
    <Dialog open={!!goal} onOpenChange={(o) => !o && onClose()}>
      <DialogContent aria-describedby={undefined} className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-2xl overflow-y-auto rounded-2xl p-0">
        {goal && <GoalGuide key={goal} goal={goal} stats={stats} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function GoalGuide({ goal, stats, onClose }: { goal: GoalId; stats?: string; onClose: () => void }) {
  const def = GOALS[goal];
  const guide = GOAL_GUIDES[goal];
  const Icon = def.icon;
  const navigate = useNavigate();
  const resetFilters = useUI((s) => s.resetFilters);
  const setFilters = useUI((s) => s.setFilters);
  const createTask = useCreateTask();

  const [tab, setTab] = useState<Tab>('dicas');
  const [i, setI] = useState(0);
  const [done, setDone] = useState(readDone);
  const [playing, setPlaying] = useState<LifeVideo | null>(null);
  const [q, setQ] = useState(guide.search);

  useEffect(() => {
    try {
      localStorage.setItem(DONE_KEY, JSON.stringify(done));
    } catch {
      /* sem armazenamento */
    }
  }, [done]);

  const tips = guide.tips;
  const tip = tips[i];
  const key = `${goal}:${i}`;
  const book = tipBook(tip);
  const practiced = tips.filter((_, n) => done[`${goal}:${n}`]).length;
  const videos = LIFE_VIDEOS.filter((v) => def.areas.includes(v.area)).slice(0, 6);

  // setas do teclado trocam a dica
  useEffect(() => {
    if (tab !== 'dicas') return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') setI((n) => Math.min(tips.length - 1, n + 1));
      if (e.key === 'ArrowLeft') setI((n) => Math.max(0, n - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tab, tips.length]);

  const toTask = () => {
    createTask.mutate({
      title: tip.tip,
      whatToDo: `${tip.detail}\n\nDica de “${tip.book}”, de ${tip.author}.`,
      status: 'NOT_STARTED',
      priority: 'MEDIUM',
      dueDate: todayISO(),
      scope: def.business ? 'BUSINESS' : 'PERSONAL',
      lifeAreaId: def.areas[0],
      subtasks: [],
      links: [],
    });
    toast.success('Virou afazer para hoje', { description: tip.tip });
  };

  return (
    <div className="flex flex-col">
      {/* Cabeçalho */}
      <header className="flex items-start gap-4 border-b border-border p-5 pr-12">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary dark:text-neon">
          <Icon className="size-6" aria-hidden />
        </span>
        <div className="min-w-0">
          <DialogTitle className="text-lg font-bold leading-tight">{def.label}</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-foreground/65">{guide.intro}</DialogDescription>
          {stats && <p className="mt-2 text-xs font-medium text-foreground/50">{stats}</p>}
        </div>
      </header>

      {/* Abas */}
      <div role="tablist" aria-label="Guia da meta" className="mx-5 mt-4 grid grid-cols-2 rounded-xl bg-muted p-1">
        {([
          ['dicas', 'Dicas dos livros', BookOpen],
          ['videos', 'Vídeos', CirclePlay],
        ] as const).map(([id, label, TabIcon]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn('flex h-9 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-all duration-200', tab === id ? 'bg-card text-foreground shadow-sm' : 'text-foreground/55 hover:text-foreground')}
          >
            <TabIcon className="size-4" aria-hidden /> {label}
          </button>
        ))}
      </div>

      {tab === 'dicas' ? (
        <section className="p-5" aria-live="polite">
          <div key={key} className="fade-up rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start gap-4">
              {book ? (
                <img src={coverUrl(book.googleId)} alt="" className="h-24 w-16 shrink-0 rounded-md object-cover shadow-md" loading="lazy" />
              ) : (
                <span className="grid h-24 w-16 shrink-0 place-items-center rounded-md bg-gradient-to-br from-primary/20 to-primary/5 text-primary dark:text-neon">
                  <BookOpen className="size-6" aria-hidden />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/45">
                  Dica {i + 1} de {tips.length}
                </p>
                <h3 className="mt-1 text-xl font-bold leading-snug">{tip.tip}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">{tip.detail}</p>
                <p className="mt-3 text-xs text-foreground/55">
                  📖 <span className="font-semibold text-foreground/75">{tip.book}</span> · {tip.author}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={!!done[key]}
                onClick={() => setDone((d) => ({ ...d, [key]: !d[key] }))}
                className={cn(
                  'inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition-all duration-200',
                  done[key] ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-border hover:bg-muted',
                )}
              >
                <Check className="size-4" aria-hidden /> {done[key] ? 'Já pratico' : 'Marcar como praticada'}
              </button>
              <Button size="sm" variant="outline" onClick={toTask}>
                <ListPlus /> Virar afazer
              </Button>
            </div>
          </div>

          {/* Navegação entre dicas */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <Button variant="ghost" size="icon" onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0} aria-label="Dica anterior">
              <ChevronLeft />
            </Button>
            <div className="flex items-center gap-1.5">
              {tips.map((t, n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setI(n)}
                  aria-label={`Dica ${n + 1}: ${t.tip}`}
                  aria-current={n === i}
                  className={cn('h-2 rounded-full transition-all duration-300', n === i ? 'w-6 bg-primary' : done[`${goal}:${n}`] ? 'w-2 bg-emerald-500' : 'w-2 bg-foreground/20 hover:bg-foreground/40')}
                />
              ))}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setI((n) => Math.min(tips.length - 1, n + 1))} disabled={i === tips.length - 1} aria-label="Próxima dica">
              <ChevronRight />
            </Button>
          </div>
          <p className="mt-1 text-center text-xs text-foreground/50">
            {practiced} de {tips.length} {practiced === 1 ? 'dica praticada' : 'dicas praticadas'}
          </p>
        </section>
      ) : (
        <section className="space-y-4 p-5">
          {/* Pesquisar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) window.open(youtubeSearchUrl(q.trim()), '_blank', 'noopener');
            }}
            className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 pl-3 focus-within:border-primary"
          >
            <Search className="size-4 shrink-0 text-foreground/40" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Pesquisar vídeos sobre a meta" className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none" />
            <Button type="submit" size="sm">
              <TvMinimalPlay /> Pesquisar no YouTube
            </Button>
          </form>

          {playing && (
            <div className="fade-up overflow-hidden rounded-xl border border-border bg-black">
              <div className="aspect-video">
                <iframe
                  key={playing.youtubeId}
                  src={embedUrl(playing.youtubeId)}
                  title={playing.title}
                  className="size-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/45">Selecionados para esta meta</p>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {videos.map((v) => (
              <li key={v.youtubeId}>
                <button
                  type="button"
                  onClick={() => setPlaying(v)}
                  className={cn(
                    'group flex w-full gap-3 rounded-xl border p-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                    playing?.youtubeId === v.youtubeId ? 'border-primary bg-primary/5' : 'border-border bg-card',
                  )}
                >
                  <span className="relative block aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <img src={thumbUrl(v.youtubeId)} alt="" loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <span className="absolute inset-0 grid place-items-center bg-navy/20 group-hover:bg-navy/40">
                      <CirclePlay className="size-7 text-white drop-shadow" aria-hidden />
                    </span>
                  </span>
                  <span className="min-w-0 py-0.5">
                    <span className="line-clamp-2 text-sm font-semibold leading-snug">{v.title}</span>
                    <span className="mt-1 block truncate text-xs text-foreground/55">{v.channel}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="flex flex-wrap justify-end gap-2 border-t border-border p-4">
        <Button
          variant="ghost"
          onClick={() => {
            resetFilters();
            setFilters({ lifeAreaIds: def.areas });
            onClose();
            navigate('/tasks');
          }}
        >
          <ListTodo /> Ver afazeres desta meta
        </Button>
        <Button onClick={onClose}>Fechar</Button>
      </footer>
    </div>
  );
}
