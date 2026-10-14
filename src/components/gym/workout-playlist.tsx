import { ChevronLeft, ChevronRight, ExternalLink, Headphones, Play, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DEEZER_PLAYLISTS } from '@/lib/workout-playlists-data';
import { cn } from '@/lib/utils';

/**
 * Playlists de treino: ao abrir, todos os gêneros aparecem, cada um com uma fileira de playlists para escolher.
 * - Destaque Spotify: playlists oficiais (IDs conferidos pelo oEmbed em 14/10/2026).
 * - Demais: playlists reais do Deezer (API pública), com capa. Tocar abre o player flutuante.
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

function itemsOf(g: Genre): Item[] {
  const list: Item[] = (DEEZER_PLAYLISTS[g.id] ?? []).map((p) => ({
    kind: 'deezer',
    id: p.id,
    title: p.title,
    cover: p.cover,
    meta: `${p.tracks} músicas${p.editor ? ' · Editorial' : ''}`,
    genre: g.id,
  }));
  return g.spotify ? [{ kind: 'spotify', id: g.spotify.id, title: g.spotify.title, meta: 'Oficial do Spotify', genre: g.id }, ...list] : list;
}

export function WorkoutPlaylist() {
  const [playing, setPlaying] = useState<Item | null>(readSaved);
  const [q, setQ] = useState('');
  const [only, setOnly] = useState<string | null>(null);
  useEffect(() => {
    try {
      if (playing) localStorage.setItem(KEY, JSON.stringify(playing));
    } catch {
      /* sem armazenamento */
    }
  }, [playing]);

  const total = useMemo(() => GENRES.reduce((n, g) => n + itemsOf(g).length, 0), []);
  const query = norm(q.trim());
  const rows = GENRES.filter((g) => !only || g.id === only)
    .map((g) => ({ g, items: itemsOf(g).filter((it) => !query || norm(`${it.title} ${g.label}`).includes(query)) }))
    .filter((r) => r.items.length);

  return (
    <div className="space-y-6 pb-28">
      {/* topo */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-navy p-5 text-white sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-10 size-56 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
          <Headphones className="size-4" aria-hidden /> Playlist do treino
        </p>
        <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Qual é a vibe de hoje?</h2>
        <p className="mt-1 text-sm text-white/80">
          {total} playlists em {GENRES.length} gêneros. Toque em uma capa e o player abre aqui embaixo.
        </p>
        <div className="mt-4 flex max-w-md items-center gap-2 rounded-xl bg-white/15 px-3 backdrop-blur focus-within:bg-white/25">
          <Search className="size-4 shrink-0 text-white/70" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar: funk, academia, corrida, anos 2000…"
            aria-label="Buscar playlist"
            className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/60"
          />
          {q && (
            <button type="button" onClick={() => setQ('')} className="grid size-7 place-items-center rounded-md hover:bg-white/15" aria-label="Limpar busca">
              <X className="size-4" />
            </button>
          )}
        </div>
      </section>

      {/* atalhos de gênero */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none]" role="radiogroup" aria-label="Filtrar gênero">
        <Chip on={!only} onClick={() => setOnly(null)}>🎶 Todos</Chip>
        {GENRES.map((g) => (
          <Chip key={g.id} on={only === g.id} onClick={() => setOnly(only === g.id ? null : g.id)}>
            {g.emoji} {g.label}
          </Chip>
        ))}
      </div>

      {/* fileiras por gênero */}
      {rows.map(({ g, items }) => (
        <GenreRow key={g.id} genre={g} items={items} playing={playing} onPlay={setPlaying} expanded={!!only} />
      ))}
      {rows.length === 0 && <p className="text-sm text-foreground/60">Nenhuma playlist com “{q}”. Tente outro termo.</p>}

      {/* portal: fora da animação da página, senão o player não fica fixo na tela */}
      {playing && createPortal(<MiniPlayer item={playing} onClose={() => setPlaying(null)} />, document.body)}
    </div>
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
        'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-all duration-200',
        on ? 'border-primary bg-primary text-white shadow-neon' : 'border-border bg-card hover:border-primary/50 hover:bg-muted',
      )}
    >
      {children}
    </button>
  );
}

function GenreRow({ genre, items, playing, onPlay, expanded }: { genre: Genre; items: Item[]; playing: Item | null; onPlay: (i: Item) => void; expanded: boolean }) {
  const scroller = useRef<HTMLUListElement>(null);
  const slide = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.85, behavior: 'smooth' });
  return (
    <section aria-label={genre.label} className="space-y-3">
      <div className="flex items-end gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-xl" aria-hidden>
          {genre.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold leading-tight">{genre.label}</h3>
          <p className="truncate text-xs text-foreground/55">
            {genre.vibe} · {items.length} playlists
          </p>
        </div>
        {!expanded && (
          <div className="hidden gap-1 sm:flex">
            <button type="button" onClick={() => slide(-1)} className="grid size-8 place-items-center rounded-full border border-border bg-card hover:bg-muted" aria-label={`Voltar em ${genre.label}`}>
              <ChevronLeft className="size-4" />
            </button>
            <button type="button" onClick={() => slide(1)} className="grid size-8 place-items-center rounded-full border border-border bg-card hover:bg-muted" aria-label={`Avançar em ${genre.label}`}>
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>
      <ul
        ref={scroller}
        className={cn(
          expanded
            ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6'
            : '-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:none]',
        )}
      >
        {items.map((it) => (
          <li key={`${it.kind}-${it.id}`} className={cn(!expanded && 'w-36 shrink-0 snap-start sm:w-40')}>
            <Cover item={it} emoji={genre.emoji} active={playing?.id === it.id} onClick={() => onPlay(it)} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Cover({ item, emoji, active, onClick }: { item: Item; emoji: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className="group block w-full text-left">
      <span
        className={cn(
          'relative block aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-navy shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg',
          active && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        )}
      >
        {item.cover ? (
          <img src={item.cover} alt="" loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <span className="grid size-full place-items-center bg-[radial-gradient(circle_at_30%_20%,#1DB954,transparent_60%)] text-5xl" aria-hidden>
            {emoji}
          </span>
        )}
        <span className={cn('absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow', item.kind === 'spotify' ? 'bg-[#1DB954]' : 'bg-black/55 backdrop-blur')}>
          {item.kind === 'spotify' ? 'Spotify' : 'Deezer'}
        </span>
        <span className={cn('absolute bottom-2 right-2 grid size-10 place-items-center rounded-full bg-primary text-white shadow-lg transition-all duration-200', active ? 'opacity-100' : 'translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100')}>
          <Play className="size-4 fill-current" aria-hidden />
        </span>
        {active && <span className="absolute inset-x-0 bottom-0 h-1 bg-primary" aria-hidden />}
      </span>
      <span className="mt-2 line-clamp-2 block text-sm font-semibold leading-snug">{item.title}</span>
      <span className="block text-xs text-foreground/55">{item.meta}</span>
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
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
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
        <iframe key={item.id} title={`Spotify: ${item.title}`} src={`https://open.spotify.com/embed/playlist/${item.id}?utm_source=generator&theme=0`} className="block h-[232px] w-full" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
      ) : (
        <iframe key={item.id} title={`Deezer: ${item.title}`} src={`https://widget.deezer.com/widget/dark/playlist/${item.id}?tracklist=true`} className="block h-[232px] w-full" allow="encrypted-media; clipboard-write" />
      )}
      <p className="px-3 py-1.5 text-[10px] text-foreground/45">Sem login tocam prévias de 30 s · entre no Spotify/Deezer ou abra no app para ouvir inteira.</p>
    </div>
  );
}
