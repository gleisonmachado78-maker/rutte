import { ChevronLeft, ChevronRight, ExternalLink, Headphones, Play, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SPOTIFY_PLAYLISTS } from '@/lib/spotify-playlists-data';
import { cn } from '@/lib/utils';

/**
 * Playlists de treino: ao abrir, todos os gêneros aparecem, cada um com uma fileira de playlists para escolher.
 * Todas são playlists do Spotify conferidas no oEmbed oficial (título e capa do próprio Spotify). Tocar abre o player flutuante.
 */
interface Genre {
  id: string;
  label: string;
  emoji: string;
  vibe: string;
  spotify?: { id: string; title: string };
  search: string;
}

const GENRES: Genre[] = [
  { id: 'motivacao', label: 'Motivação', emoji: '🔥', vibe: 'Pesado e motivador para bater recorde', spotify: { id: '37i9dQZF1DX76Wlfdnj7AP', title: 'Beast Mode' }, search: 'treino motivação' },
  { id: 'funk', label: 'Funk', emoji: '🔊', vibe: 'Batida brasileira para não parar', spotify: { id: '37i9dQZF1DWTkIwO2HDifB', title: 'Funk Hits' }, search: 'funk treino' },
  { id: 'sertanejo', label: 'Sertanejo', emoji: '🤠', vibe: 'Os sertanejos mais animados', spotify: { id: '37i9dQZF1DXdSjVZQzv2tl', title: 'Esquenta Sertanejo' }, search: 'sertanejo treino' },
  { id: 'phonk', label: 'Phonk', emoji: '🏎️', vibe: 'O som das academias do momento', spotify: { id: '37i9dQZF1DWWY64wDtewQt', title: 'phonk' }, search: 'phonk gym' },
  { id: 'rap', label: 'Rap / Hip-hop', emoji: '🎤', vibe: 'Rimas e graves para o treino pesado', spotify: { id: '37i9dQZF1DX9oh43oAzkyx', title: 'Beast Mode Hip-Hop' }, search: 'rap treino' },
  { id: 'trap', label: 'Trap', emoji: '💎', vibe: 'Graves fortes e energia lá em cima', spotify: { id: '37i9dQZF1DX0XUsuxWHRQd', title: 'RapCaviar' }, search: 'trap treino' },
  { id: 'eletronica', label: 'Eletrônica', emoji: '🎧', vibe: 'EDM, house e trance em ritmo constante', spotify: { id: '37i9dQZF1DX4dyzvuaRJ0n', title: 'mint' }, search: 'eletrônica treino' },
  { id: 'rock', label: 'Rock', emoji: '🎸', vibe: 'Guitarras para empurrar mais', spotify: { id: '37i9dQZF1DWXRqgorJj26U', title: 'Rock Classics' }, search: 'rock treino' },
  { id: 'metal', label: 'Metal', emoji: '🤘', vibe: 'Peso máximo, sem dó', spotify: { id: '37i9dQZF1DWTcqUzwhNmKv', title: 'Kickass Metal' }, search: 'metal treino' },
  { id: 'pop', label: 'Pop', emoji: '✨', vibe: 'Hits pop para treinar no embalo', spotify: { id: '37i9dQZF1DXdxcBWuJkbcy', title: 'Gym Hits' }, search: 'pop treino' },
  { id: 'brasil', label: 'Top Brasil', emoji: '🇧🇷', vibe: 'O que está tocando no Brasil', spotify: { id: '37i9dQZF1DX0FOF1IUWK1W', title: 'Top Brasil' }, search: 'top brasil' },
  { id: 'pagode', label: 'Pagode & Samba', emoji: '🥁', vibe: 'Para treinar sorrindo', search: 'pagode treino' },
  { id: 'forro', label: 'Forró & Piseiro', emoji: '🪗', vibe: 'Pisadinha e paredão', search: 'forró treino' },
  { id: 'brega', label: 'Brega Funk', emoji: '🕺', vibe: 'Tecnobrega, arrocha e paredão', search: 'brega funk' },
  { id: 'gospel', label: 'Gospel', emoji: '🙏', vibe: 'Louvores animados para treinar', search: 'gospel treino' },
  { id: 'reggaeton', label: 'Reggaeton', emoji: '💃', vibe: 'Latino, dançante e quente', search: 'reggaeton treino' },
  { id: 'kpop', label: 'K-pop', emoji: '💜', vibe: 'Energia do pop coreano', spotify: { id: '37i9dQZF1DX9tPFwDMOaN1', title: 'K-Pop ON!' }, search: 'kpop workout' },
  { id: 'mpb', label: 'MPB', emoji: '🌴', vibe: 'Brasilidades para um treino leve', search: 'mpb' },
  { id: 'flashback', label: 'Flashback', emoji: '📼', vibe: 'Anos 70, 80, 90 e 2000', search: 'flashback treino' },
  { id: 'cardio', label: 'Cardio & Corrida', emoji: '🏃', vibe: 'Ritmo certo para esteira, bike e HIIT', spotify: { id: '37i9dQZF1DWSJHnPb1f0X3', title: 'Cardio' }, search: 'corrida treino' },
  { id: 'alongamento', label: 'Alongamento & Relax', emoji: '🧘', vibe: 'Calma para alongar e desacelerar', search: 'alongamento relaxar' },
];

type Item = { kind: 'spotify' | 'deezer'; id: string; title: string; cover?: string; meta: string; genre: string };

const KEY = 'rutte:gym-music';
const readSaved = (): Item | null => {
  try {
    const raw = localStorage.getItem(KEY) ?? '';
    const v = raw.startsWith('{') ? JSON.parse(raw) : null;
    return v && v.kind ? (v as Item) : null;
  } catch {
    return null;
  }
};
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Playlists do Spotify do gênero (conferidas no oEmbed oficial; as oficiais do Spotify vêm primeiro). */
function itemsOf(g: Genre): Item[] {
  return (SPOTIFY_PLAYLISTS[g.id] ?? []).map((p) => ({
    kind: 'spotify',
    id: p.id,
    title: p.title,
    cover: p.cover,
    meta: p.editorial ? 'Oficial do Spotify' : 'Playlist do Spotify',
    genre: g.id,
  }));
}

export function WorkoutPlaylist() {
  const [playing, setPlaying] = useState<Item | null>(readSaved);
  const [q, setQ] = useState('');
  const [only, setOnly] = useState<string | null>(null);
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      if (playing) localStorage.setItem(KEY, JSON.stringify(playing));
    } catch {
      /* sem armazenamento */
    }
  }, [playing]);

  const total = useMemo(() => GENRES.reduce((n, g) => n + itemsOf(g).length, 0), []);
  // destaques: a playlist oficial do Spotify de cada gênero (ou a primeira)
  const featured = useMemo(
    () =>
      GENRES.map((g) => ({ g, it: itemsOf(g).find((i) => i.meta.startsWith('Oficial')) }))
        .filter((x): x is { g: Genre; it: Item } => !!x.it)
        .slice(0, 8),
    [],
  );
  const collage = featured.slice(0, 4).map((f) => f.it.cover);
  const query = norm(q.trim());
  const rows = GENRES.filter((g) => !only || g.id === only)
    .map((g) => ({ g, items: itemsOf(g).filter((it) => !query || norm(`${it.title} ${g.label}`).includes(query)) }))
    .filter((r) => r.items.length);
  const pickGenre = (id: string | null) => {
    setOnly(id);
    top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const browsing = !only && !query;

  return (
    <div ref={top} className="scroll-mt-4 space-y-8 pb-32">
      {/* ---------- topo ---------- */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1DB954]/25 via-primary/70 to-navy p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -left-16 -top-24 size-72 rounded-full bg-[#1DB954]/25 blur-3xl" aria-hidden />
        <div className="relative grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
              <Headphones className="size-4" aria-hidden /> Playlist do treino
            </p>
            <h2 className="mt-2 text-balance text-3xl font-bold leading-tight sm:text-4xl">Qual é a vibe de hoje?</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-white/15 px-3 py-1">{total} playlists</span>
              <span className="rounded-full bg-white/15 px-3 py-1">{GENRES.length} gêneros</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1DB954] px-3 py-1 text-black">
                <SpotifyMark className="size-3.5" /> Spotify
              </span>
            </div>
            <label className="mt-5 flex max-w-md items-center gap-2 rounded-2xl bg-white px-4 text-navy shadow-lg">
              <Search className="size-4 shrink-0 text-navy/50" aria-hidden />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar: academia, corrida, anos 2000…"
                aria-label="Buscar playlist"
                className="h-12 min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-navy/45"
              />
              {q && (
                <button type="button" onClick={() => setQ('')} className="grid size-7 place-items-center rounded-full hover:bg-navy/10" aria-label="Limpar busca">
                  <X className="size-4" />
                </button>
              )}
            </label>
          </div>
          {/* mosaico de capas */}
          <div className="relative mx-auto hidden h-56 w-60 lg:block" aria-hidden>
            {collage.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                className="absolute size-36 rounded-2xl object-cover shadow-2xl ring-1 ring-white/20"
                style={{ left: [0, 96, 24, 110][i], top: [0, 8, 92, 104][i], rotate: `${[-8, 7, 4, -5][i]}deg`, zIndex: [1, 2, 3, 4][i] }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- gêneros (uma linha, fixa ao rolar) ---------- */}
      <nav aria-label="Gêneros" className="sticky top-[calc(3.25rem+env(safe-area-inset-top))] z-20 -mx-4 bg-background/95 px-4 py-2.5 shadow-[0_8px_16px_-12px_rgb(0_0_0_/_.5)] backdrop-blur md:top-0 sm:mx-0 sm:rounded-2xl sm:px-2">
        <div role="radiogroup" className="flex gap-2 overflow-x-auto [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-24px),transparent)] [scrollbar-width:none]">
          <Chip on={!only} onClick={() => pickGenre(null)}>Todos</Chip>
          {GENRES.map((g) => (
            <Chip key={g.id} on={only === g.id} onClick={() => pickGenre(only === g.id ? null : g.id)}>
              <span aria-hidden>{g.emoji}</span> {g.label}
            </Chip>
          ))}
        </div>
      </nav>

      {/* ---------- destaques ---------- */}
      {browsing && (
        <section aria-label="Destaques" className="space-y-3">
          <h3 className="text-lg font-bold">Destaques oficiais do Spotify</h3>
          <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {featured.map(({ g, it }) => (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => setPlaying(it)}
                  className={cn(
                    'group flex w-full items-center gap-3 overflow-hidden rounded-xl bg-card pr-3 text-left ring-1 ring-border transition-all duration-200 hover:bg-muted hover:ring-primary/40',
                    playing?.id === it.id && 'ring-2 ring-primary',
                  )}
                >
                  <img src={it.cover} alt="" loading="lazy" className="size-16 shrink-0 object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{it.title}</span>
                    <span className="block truncate text-xs text-foreground/55">
                      {g.emoji} {g.label}
                    </span>
                  </span>
                  <span className={cn('grid size-9 shrink-0 place-items-center rounded-full bg-[#1DB954] text-black shadow transition-all duration-200', playing?.id === it.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>
                    <Play className="size-4 fill-current" aria-hidden />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- fileiras por gênero ---------- */}
      {only && (
        <button type="button" onClick={() => pickGenre(null)} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline dark:text-neon">
          <ChevronLeft className="size-4" aria-hidden /> Ver todos os gêneros
        </button>
      )}
      {rows.map(({ g, items }) => (
        <GenreRow key={g.id} genre={g} items={items} playing={playing} onPlay={setPlaying} expanded={!!only} onSeeAll={() => pickGenre(g.id)} />
      ))}
      {rows.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-foreground/60">Nenhuma playlist com “{q}”. Tente outro termo.</div>
      )}

      {/* portal: fora da animação da página, senão o player não fica fixo na tela */}
      {playing && createPortal(<MiniPlayer item={playing} onClose={() => setPlaying(null)} />, document.body)}
    </div>
  );
}

function SpotifyMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="12" fill="currentColor" />
      <path d="M6.5 9.3c3.8-1.1 8-.8 11.2 1M7.2 12.4c3.1-.9 6.5-.6 9.1.9M7.8 15.3c2.4-.6 4.9-.4 7 .7" stroke="#1DB954" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition-all duration-200',
        on ? 'bg-foreground text-background' : 'bg-muted text-foreground/75 hover:bg-border hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

function GenreRow({ genre, items, playing, onPlay, expanded, onSeeAll }: { genre: Genre; items: Item[]; playing: Item | null; onPlay: (i: Item) => void; expanded: boolean; onSeeAll: () => void }) {
  const scroller = useRef<HTMLUListElement>(null);
  const slide = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.85, behavior: 'smooth' });
  return (
    <section aria-label={genre.label} className="group/row space-y-3">
      <header className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-lg" aria-hidden>
          {genre.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold leading-tight">{genre.label}</h3>
          <p className="truncate text-xs text-foreground/55">{genre.vibe}</p>
        </div>
        {!expanded && (
          <>
            <div className="hidden gap-1 opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 sm:flex">
              <button type="button" onClick={() => slide(-1)} className="grid size-8 place-items-center rounded-full bg-muted hover:bg-border" aria-label={`Voltar em ${genre.label}`}>
                <ChevronLeft className="size-4" />
              </button>
              <button type="button" onClick={() => slide(1)} className="grid size-8 place-items-center rounded-full bg-muted hover:bg-border" aria-label={`Avançar em ${genre.label}`}>
                <ChevronRight className="size-4" />
              </button>
            </div>
            <button type="button" onClick={onSeeAll} className="shrink-0 text-xs font-bold uppercase tracking-wider text-foreground/55 hover:text-foreground">
              Ver {items.length}
            </button>
          </>
        )}
      </header>
      <ul
        ref={scroller}
        className={cn(
          expanded
            ? 'grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6'
            : '-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:none]',
        )}
      >
        {items.map((it) => (
          <li key={`${it.kind}-${it.id}`} className={cn(!expanded && 'w-[148px] shrink-0 snap-start sm:w-40')}>
            <Cover item={it} emoji={genre.emoji} active={playing?.id === it.id} onClick={() => onPlay(it)} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Cover({ item, emoji, active, onClick }: { item: Item; emoji: string; active: boolean; onClick: () => void }) {
  const official = item.meta.startsWith('Oficial');
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className="group block w-full rounded-2xl p-2 text-left transition-colors duration-200 hover:bg-muted">
      <span className={cn('relative block aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary to-navy shadow-md', active && 'ring-2 ring-[#1DB954] ring-offset-2 ring-offset-background')}>
        {item.cover ? (
          <img src={item.cover} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <span className="grid size-full place-items-center text-5xl" aria-hidden>
            {emoji}
          </span>
        )}
        {official && <span className="absolute left-2 top-2 rounded-full bg-[#1DB954] px-2 py-0.5 text-[10px] font-bold text-black shadow">Oficial</span>}
        <span
          className={cn(
            'absolute bottom-2 right-2 grid size-11 place-items-center rounded-full bg-[#1DB954] text-black shadow-xl transition-all duration-200',
            active ? 'opacity-100' : 'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100',
          )}
        >
          <Play className="size-5 fill-current" aria-hidden />
        </span>
      </span>
      <span className="mt-2.5 line-clamp-2 text-sm font-semibold leading-snug" title={item.title}>
        {item.title}
      </span>
      {active && <span className="mt-0.5 block text-xs font-semibold text-[#1DB954]">Tocando agora</span>}
    </button>
  );
}

/** Player flutuante: continua tocando enquanto a pessoa navega pelas fileiras. */
function MiniPlayer({ item, onClose }: { item: Item; onClose: () => void }) {
  const open = item.kind === 'spotify' ? `https://open.spotify.com/playlist/${item.id}` : `https://www.deezer.com/br/playlist/${item.id}`;
  return (
    <div className="fade-up fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl md:bottom-4 md:left-auto md:right-4 md:w-[380px]">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <span className="relative flex size-2.5" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#1DB954] opacity-60" />
          <span className="relative inline-flex size-2.5 rounded-full bg-[#1DB954]" />
        </span>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold">{item.title}</p>
        <a href={open} target="_blank" rel="noreferrer" className="grid size-8 place-items-center rounded-lg text-foreground/60 hover:bg-muted" aria-label="Abrir no app" title={`Abrir no ${item.kind === 'spotify' ? 'Spotify' : 'Deezer'}`}>
          <ExternalLink className="size-4" />
        </a>
        <button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-lg text-foreground/60 hover:bg-muted" aria-label="Fechar player">
          <X className="size-4" />
        </button>
      </div>
      {item.kind === 'spotify' ? (
        <iframe key={item.id} title={`Spotify: ${item.title}`} src={`https://open.spotify.com/embed/playlist/${item.id}?utm_source=generator&theme=0`} className="block h-[152px] w-full" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
      ) : (
        <iframe key={item.id} title={`Deezer: ${item.title}`} src={`https://widget.deezer.com/widget/dark/playlist/${item.id}?tracklist=true`} className="block h-[232px] w-full" allow="encrypted-media; clipboard-write" />
      )}
      <p className="px-3 py-1.5 text-[10px] text-foreground/45">Sem login no Spotify tocam prévias de 30 s · entre na sua conta ou abra no app para ouvir inteira.</p>
    </div>
  );
}
