import { BookOpen, CirclePlay, Library, Palette, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BookCard } from '@/components/library/book-card';
import { VideoCard, VideoPlayerDialog, useVideoPlayer } from '@/components/life/videos';
import { useBookShelf, useUser } from '@/hooks/use-data';
import { BOOKS } from '@/lib/books';
import { SHELF_LABEL, TOPICS, type ShelfStatus, type TopicId } from '@/lib/library';
import { focusAreas } from '@/lib/onboarding';
import { cn } from '@/lib/utils';
import { LIFE_VIDEOS } from '@/lib/videos';

type Tab = 'livros' | 'videos';
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const chip = 'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors duration-200';
const chipOn = 'border-primary bg-primary text-white';
const chipOff = 'border-border bg-background hover:bg-muted';

export function LibraryPage() {
  const location = useLocation();
  const nav = (location.state ?? {}) as { tab?: Tab; topic?: TopicId };
  const [tab, setTab] = useState<Tab>(nav.tab ?? (BOOKS.length ? 'livros' : 'videos'));
  const [topic, setTopic] = useState<TopicId | 'ALL'>(nav.topic ?? 'ALL');
  const [q, setQ] = useState('');
  const [shelfFilter, setShelfFilter] = useState<ShelfStatus | null>(null);
  const [onlyAnimated, setOnlyAnimated] = useState(false);
  const { data: shelf = {} } = useBookShelf();
  const { data: user } = useUser();
  const player = useVideoPlayer();

  // Vindo da Roda da Vida com um tema já escolhido
  useEffect(() => {
    if (nav.tab) setTab(nav.tab);
    if (nav.topic) setTopic(nav.topic);
  }, [nav.tab, nav.topic]);

  // Temas ligados aos objetivos da pessoa aparecem primeiro
  const focus = user ? focusAreas(user.goals) : [];
  const ordered = useMemo(
    () => [...TOPICS].sort((a, b) => Number(!a.videoAreas.some((x) => focus.includes(x))) - Number(!b.videoAreas.some((x) => focus.includes(x)))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focus.join()],
  );

  const query = norm(q.trim());
  const books = BOOKS.filter(
    (b) =>
      (topic === 'ALL' || b.topic === topic) &&
      (!shelfFilter || shelf[b.googleId] === shelfFilter) &&
      (!query || norm(`${b.title} ${b.author}`).includes(query)),
  );
  const videoTopic = (area: string) => TOPICS.find((t) => t.videoAreas.includes(area as never))?.id;
  const videos = LIFE_VIDEOS.filter(
    (v) =>
      (topic === 'ALL' || videoTopic(v.area) === topic) &&
      (!onlyAnimated || v.style === 'animado') &&
      (!query || norm(`${v.title} ${v.channel}`).includes(query)),
  ).sort((a, b) => Number(a.style !== 'animado') - Number(b.style !== 'animado'));

  const topicsWithItems = ordered.filter((t) =>
    tab === 'livros' ? BOOKS.some((b) => b.topic === t.id) : LIFE_VIDEOS.some((v) => t.videoAreas.includes(v.area)),
  );
  const shelfCount = (s: ShelfStatus) => Object.values(shelf).filter((x) => x === s).length;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <Library className="size-7 text-primary" aria-hidden /> Biblioteca
        </h1>
        <p className="text-sm text-foreground/60">Livros e vídeos escolhidos para você se desenvolver, organizados por tema.</p>
      </header>

      <div role="tablist" aria-label="Tipo de conteúdo" className="flex w-fit gap-1 rounded-xl border border-border bg-card p-1">
        {(
          [
            { id: 'livros', label: 'Livros', icon: BookOpen, n: BOOKS.length },
            { id: 'videos', label: 'Vídeos', icon: CirclePlay, n: LIFE_VIDEOS.length },
          ] as const
        ).map(({ id, label, icon: Icon, n }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => {
              setTab(id);
              setTopic('ALL');
            }}
            className={cn('inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold transition-colors', tab === id ? 'bg-primary text-white' : 'text-foreground/65 hover:text-foreground')}
          >
            <Icon className="size-4" aria-hidden /> {label}
            <span className={cn('text-xs tabular-nums', tab === id ? 'text-white/75' : 'text-foreground/40')}>{n}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" aria-hidden />
          <input
            id="library-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tab === 'livros' ? 'Buscar por título ou autor…' : 'Buscar vídeo ou canal…'}
            aria-label="Buscar na biblioteca"
            className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-9 text-sm focus:border-primary focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {q && (
            <button type="button" onClick={() => setQ('')} className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-foreground/50 hover:bg-muted" aria-label="Limpar busca">
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none]" role="toolbar" aria-label="Temas">
          <button type="button" aria-pressed={topic === 'ALL'} onClick={() => setTopic('ALL')} className={cn(chip, topic === 'ALL' ? chipOn : chipOff)}>
            Todos
          </button>
          {topicsWithItems.map((t) => (
            <button key={t.id} type="button" aria-pressed={topic === t.id} onClick={() => setTopic(t.id)} className={cn(chip, topic === t.id ? chipOn : chipOff)}>
              <t.icon className="size-4" style={{ color: topic === t.id ? undefined : t.color }} aria-hidden />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'livros' ? (
          <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Minha estante">
            <span className="self-center text-xs font-semibold uppercase tracking-wide text-foreground/50">Minha estante:</span>
            {(['quero', 'lendo', 'lido'] as ShelfStatus[]).map((s) => (
              <button key={s} type="button" aria-pressed={shelfFilter === s} onClick={() => setShelfFilter((x) => (x === s ? null : s))} className={cn(chip, 'h-8 text-xs', shelfFilter === s ? chipOn : chipOff)}>
                {SHELF_LABEL[s]} <span className="tabular-nums opacity-70">{shelfCount(s)}</span>
              </button>
            ))}
          </div>
        ) : (
          <button type="button" aria-pressed={onlyAnimated} onClick={() => setOnlyAnimated((v) => !v)} className={cn(chip, 'h-8 text-xs', onlyAnimated ? chipOn : chipOff)}>
            <Palette className="size-3.5" aria-hidden /> Só animados
          </button>
        )}
      </div>

      {tab === 'livros' ? (
        books.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-foreground/60">
            {shelfFilter ? `Nenhum livro marcado como “${SHELF_LABEL[shelfFilter]}” neste tema.` : 'Nenhum livro encontrado.'}
          </p>
        ) : (
          ordered
            .filter((t) => books.some((b) => b.topic === t.id))
            .map((t) => (
              <section key={t.id} aria-labelledby={`bk-${t.id}`} className="space-y-2">
                <h2 id={`bk-${t.id}`} className="flex items-center gap-2 font-bold">
                  <t.icon className="size-5" style={{ color: t.color }} aria-hidden /> {t.label}
                </h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {books
                    .filter((b) => b.topic === t.id)
                    .map((b) => (
                      <BookCard key={b.googleId} book={b} status={shelf[b.googleId]} />
                    ))}
                </div>
              </section>
            ))
        )
      ) : videos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-foreground/60">Nenhum vídeo encontrado.</p>
      ) : (
        ordered
          .filter((t) => videos.some((v) => t.videoAreas.includes(v.area)))
          .map((t) => (
            <section key={t.id} aria-labelledby={`vd-${t.id}`} className="space-y-2">
              <h2 id={`vd-${t.id}`} className="flex items-center gap-2 font-bold">
                <t.icon className="size-5" style={{ color: t.color }} aria-hidden /> {t.label}
              </h2>
              <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:thin]" role="list" aria-label={`Vídeos de `}>
                {videos
                  .filter((v) => t.videoAreas.includes(v.area))
                  .map((v) => (
                    <div key={v.youtubeId} role="listitem" className="w-[78vw] max-w-[280px] shrink-0 snap-start sm:w-[260px]">
                      <VideoCard video={v} onPlay={player.play} />
                    </div>
                  ))}
              </div>
            </section>
          ))
      )}

      <VideoPlayerDialog video={player.video} onClose={player.close} />
    </div>
  );
}
