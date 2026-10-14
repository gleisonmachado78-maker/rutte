import { ExternalLink, Headphones, Play, Search, Star, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SpotifyMark } from '@/components/library/podcast-card';
import { ratingKey, StarRating, StarsBadge, useStars } from '@/components/ui/star-rating';
import { useRatings } from '@/hooks/use-data';
import { SPOTIFY_PLAYLISTS, type SpotifyPlaylist } from '@/lib/spotify-playlists-data';
import { openSpotify, spotifyWebUrl } from '@/lib/spotify';
import { cn } from '@/lib/utils';

/**
 * Playlist do treino — no mesmo formato dos Podcasts da Biblioteca: busca, gêneros, seções com "Ver mais",
 * cartão com "Abrir no Spotify", "Ouvir aqui" e avaliação por estrelas.
 * Todas são playlists do Spotify conferidas no oEmbed oficial (título e capa do próprio Spotify).
 */
interface Genre {
  id: string;
  label: string;
  emoji: string;
  vibe: string;
}

const GENRES: Genre[] = [
  { id: 'motivacao', label: 'Motivação', emoji: '🔥', vibe: 'Pesado e motivador para bater recorde' },
  { id: 'funk', label: 'Funk', emoji: '🔊', vibe: 'Batida brasileira para não parar' },
  { id: 'sertanejo', label: 'Sertanejo', emoji: '🤠', vibe: 'Os sertanejos mais animados' },
  { id: 'phonk', label: 'Phonk', emoji: '🏎️', vibe: 'O som das academias do momento' },
  { id: 'rap', label: 'Rap / Hip-hop', emoji: '🎤', vibe: 'Rimas e graves para o treino pesado' },
  { id: 'trap', label: 'Trap', emoji: '💎', vibe: 'Graves fortes e energia lá em cima' },
  { id: 'eletronica', label: 'Eletrônica', emoji: '🎧', vibe: 'EDM, house e trance em ritmo constante' },
  { id: 'rock', label: 'Rock', emoji: '🎸', vibe: 'Guitarras para empurrar mais' },
  { id: 'metal', label: 'Metal', emoji: '🤘', vibe: 'Peso máximo, sem dó' },
  { id: 'pop', label: 'Pop', emoji: '✨', vibe: 'Hits pop para treinar no embalo' },
  { id: 'brasil', label: 'Top Brasil', emoji: '🇧🇷', vibe: 'O que está tocando no Brasil' },
  { id: 'pagode', label: 'Pagode & Samba', emoji: '🥁', vibe: 'Para treinar sorrindo' },
  { id: 'forro', label: 'Forró & Piseiro', emoji: '🪗', vibe: 'Pisadinha e paredão' },
  { id: 'brega', label: 'Brega Funk', emoji: '🕺', vibe: 'Tecnobrega, arrocha e paredão' },
  { id: 'gospel', label: 'Gospel', emoji: '🙏', vibe: 'Louvores animados para treinar' },
  { id: 'reggaeton', label: 'Reggaeton', emoji: '💃', vibe: 'Latino, dançante e quente' },
  { id: 'kpop', label: 'K-pop', emoji: '💜', vibe: 'Energia do pop coreano' },
  { id: 'mpb', label: 'MPB', emoji: '🌴', vibe: 'Brasilidades para um treino leve' },
  { id: 'flashback', label: 'Flashback', emoji: '📼', vibe: 'Anos 70, 80, 90 e 2000' },
  { id: 'cardio', label: 'Cardio & Corrida', emoji: '🏃', vibe: 'Ritmo certo para esteira, bike e HIIT' },
  { id: 'alongamento', label: 'Alongamento & Relax', emoji: '🧘', vibe: 'Calma para alongar e desacelerar' },
];

const chip = 'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors duration-200';
const chipOn = 'border-primary bg-primary text-white';
const chipOff = 'border-border bg-background hover:bg-muted';
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const PER_GENRE = 6;

export function WorkoutPlaylist() {
  const { data: ratings = {} } = useRatings();
  const [q, setQ] = useState('');
  const [genre, setGenre] = useState<string>('ALL');
  const [topRated, setTopRated] = useState(false);
  const [open, setOpen] = useState<string[]>([]);

  const total = useMemo(() => GENRES.reduce((n, g) => n + (SPOTIFY_PLAYLISTS[g.id]?.length ?? 0), 0), []);
  const starsOf = (id: string) => (ratings as Record<string, { stars: number } | undefined>)[ratingKey('playlist', id)]?.stars ?? 0;
  const ratedCount = Object.keys(ratings).filter((k) => k.startsWith('playlist:')).length;
  const query = norm(q.trim());

  const sections = GENRES.filter((g) => genre === 'ALL' || g.id === genre)
    .map((g) => {
      let list = (SPOTIFY_PLAYLISTS[g.id] ?? []).filter((p) => !query || norm(`${p.title} ${g.label}`).includes(query));
      if (topRated) list = list.filter((p) => starsOf(p.id) > 0).sort((a, b) => starsOf(b.id) - starsOf(a.id));
      return { g, list };
    })
    .filter((s) => s.list.length);

  return (
    <div className="space-y-5">
      <header>
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
          <Headphones className="size-6 text-primary dark:text-neon" aria-hidden /> Playlist do treino
        </h2>
        <p className="text-sm text-foreground/60">{total} playlists do Spotify para treinar no seu ritmo, organizadas por gênero.</p>
      </header>

      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar playlist… (academia, corrida, anos 2000)"
            aria-label="Buscar playlist"
            className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-9 text-sm focus:border-primary focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {q && (
            <button type="button" onClick={() => setQ('')} className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-foreground/50 hover:bg-muted" aria-label="Limpar busca">
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none]" role="toolbar" aria-label="Gêneros">
          <button type="button" aria-pressed={genre === 'ALL'} onClick={() => setGenre('ALL')} className={cn(chip, genre === 'ALL' ? chipOn : chipOff)}>
            Todos
          </button>
          {GENRES.map((g) => (
            <button key={g.id} type="button" aria-pressed={genre === g.id} onClick={() => setGenre(g.id)} className={cn(chip, genre === g.id ? chipOn : chipOff)}>
              <span aria-hidden>{g.emoji}</span> {g.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Filtros de playlist">
          <button
            type="button"
            aria-pressed={topRated}
            onClick={() => setTopRated((v) => !v)}
            className={cn(chip, 'h-8 text-xs', topRated ? 'border-amber-500 bg-amber-500 text-navy' : chipOff)}
            title="Mostra só as que você avaliou, da maior nota para a menor"
          >
            <Star className={cn('size-3.5', topRated && 'fill-current')} aria-hidden /> Mais bem avaliadas <span className="tabular-nums opacity-70">{ratedCount}</span>
          </button>
          <span className="text-xs text-foreground/55">“Abrir no Spotify” abre o app direto no celular; “Ouvir aqui” toca dentro da Rutte.</span>
        </div>
      </div>

      {sections.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-foreground/60">
          {topRated ? 'Você ainda não avaliou playlists. Toque nas estrelas de uma playlist para dar sua nota.' : 'Nenhuma playlist encontrada.'}
        </p>
      ) : (
        sections.map(({ g, list }) => {
          const all = open.includes(g.id) || genre !== 'ALL' || !!query || topRated;
          const shown = all ? list : list.slice(0, PER_GENRE);
          return (
            <section key={g.id} aria-labelledby={`pl-${g.id}`} className="space-y-2">
              <h3 id={`pl-${g.id}`} className="flex items-center gap-2 font-bold">
                <span className="text-lg" aria-hidden>
                  {g.emoji}
                </span>
                {g.label}
                <span className="text-sm font-medium text-foreground/45">{list.length}</span>
              </h3>
              <div className="stagger grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {shown.map((p) => (
                  <PlaylistCard key={p.id} playlist={p} genre={g} />
                ))}
              </div>
              {list.length > PER_GENRE && genre === 'ALL' && !query && !topRated && (
                <button
                  type="button"
                  onClick={() => setOpen((o) => (o.includes(g.id) ? o.filter((x) => x !== g.id) : [...o, g.id]))}
                  aria-expanded={all}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-semibold hover:border-primary hover:text-primary"
                >
                  {all ? 'Ver menos' : `Ver mais ${list.length - PER_GENRE} playlists de ${g.label}`}
                </button>
              )}
            </section>
          );
        })
      )}
      <p className="text-xs text-foreground/50">Sem login no Spotify, o player toca prévias de 30 s. Entrando na sua conta (ou abrindo no app), toca a playlist inteira.</p>
    </div>
  );
}

/** Cartão no mesmo formato do podcast da Biblioteca. */
function PlaylistCard({ playlist, genre }: { playlist: SpotifyPlaylist; genre: Genre }) {
  const [listening, setListening] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const key = ratingKey('playlist', playlist.id);
  const stars = useStars(key);

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3">
      <div className="flex gap-3">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-24">
          {playlist.cover && !imgFailed ? (
            <img src={playlist.cover} alt={`Capa da playlist ${playlist.title}`} loading="lazy" onError={() => setImgFailed(true)} className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center bg-gradient-to-br from-primary to-navy text-3xl" aria-hidden>
              {genre.emoji}
            </div>
          )}
          <StarsBadge stars={stars} className="absolute left-1 top-1" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="line-clamp-2 font-semibold leading-snug" title={playlist.title}>
            {playlist.title}
          </h4>
          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-foreground/60">
            {playlist.editorial && (
              <span className="inline-block rounded-full bg-[#1DB954]/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0f7a37] dark:text-[#1ed760]">Oficial</span>
            )}
            <span>
              {genre.emoji} {genre.label}
            </span>
          </p>
          <p className="mt-1 text-sm leading-snug text-foreground/75">{genre.vibe}</p>
        </div>
      </div>

      {listening && (
        <iframe
          src={`https://open.spotify.com/embed/playlist/${playlist.id}?utm_source=generator&theme=0`}
          title={`Player do Spotify: ${playlist.title}`}
          className="h-[152px] w-full rounded-xl border-0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <a
          href={spotifyWebUrl('playlist', playlist.id)}
          onClick={(e) => {
            e.preventDefault();
            openSpotify('playlist', playlist.id);
          }}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1DB954] px-4 text-sm font-bold text-black transition-colors hover:bg-[#1ed760]"
        >
          <SpotifyMark className="size-4" /> Abrir no Spotify
        </a>
        <button
          type="button"
          onClick={() => setListening((v) => !v)}
          aria-expanded={listening}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-sm font-medium hover:bg-muted"
        >
          {listening ? <X className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />} {listening ? 'Fechar player' : 'Ouvir aqui'}
        </button>
        <a href={spotifyWebUrl('playlist', playlist.id)} target="_blank" rel="noreferrer" className="ml-auto grid size-9 place-items-center rounded-full text-foreground/45 hover:bg-muted hover:text-foreground" aria-label="Abrir no navegador" title="Abrir no navegador">
          <ExternalLink className="size-4" />
        </a>
      </div>
      <StarRating itemKey={key} label={playlist.title} withNote={false} />
    </article>
  );
}
