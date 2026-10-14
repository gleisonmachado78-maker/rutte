import { ExternalLink, Headphones, Music2, Play, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DEEZER_PLAYLISTS } from '@/lib/workout-playlists-data';
import { cn } from '@/lib/utils';

/**
 * Playlists de treino por gosto musical.
 * - Destaque Spotify: playlists oficiais (IDs conferidos pelo oEmbed em 14/10/2026).
 * - Demais: playlists reais do Deezer (API pública), com capa, tocando no player do Deezer.
 */
interface Style {
  id: string;
  label: string;
  emoji: string;
  vibe: string;
  spotify?: { id: string; title: string };
  search: string;
}

const STYLES: Style[] = [
  { id: 'motivacao', label: 'Motivação', emoji: '🔥', vibe: 'Pesado e motivador para bater recorde', spotify: { id: '37i9dQZF1DX76Wlfdnj7AP', title: 'Beast Mode' }, search: 'treino motivação' },
  { id: 'funk', label: 'Funk', emoji: '🔊', vibe: 'Batida brasileira para não parar', spotify: { id: '37i9dQZF1DWTkIwO2HDifB', title: 'Funk Hits' }, search: 'funk treino' },
  { id: 'sertanejo', label: 'Sertanejo', emoji: '🤠', vibe: 'Os sertanejos mais animados', spotify: { id: '37i9dQZF1DXdSjVZQzv2tl', title: 'Esquenta Sertanejo' }, search: 'sertanejo treino' },
  { id: 'rap', label: 'Rap / Hip-hop', emoji: '🎤', vibe: 'Rimas e graves para o treino pesado', spotify: { id: '37i9dQZF1DX9oh43oAzkyx', title: 'Beast Mode Hip-Hop' }, search: 'rap treino' },
  { id: 'trap', label: 'Trap', emoji: '💎', vibe: 'Graves fortes e energia lá em cima', spotify: { id: '37i9dQZF1DX0XUsuxWHRQd', title: 'RapCaviar' }, search: 'trap treino' },
  { id: 'rock', label: 'Rock', emoji: '🎸', vibe: 'Guitarras para empurrar mais', spotify: { id: '37i9dQZF1DWXRqgorJj26U', title: 'Rock Classics' }, search: 'rock treino' },
  { id: 'metal', label: 'Metal', emoji: '🤘', vibe: 'Peso máximo, sem dó', spotify: { id: '37i9dQZF1DWTcqUzwhNmKv', title: 'Kickass Metal' }, search: 'metal treino' },
  { id: 'eletronica', label: 'Eletrônica', emoji: '🎧', vibe: 'EDM e house em ritmo constante', spotify: { id: '37i9dQZF1DX4dyzvuaRJ0n', title: 'mint' }, search: 'eletrônica treino' },
  { id: 'phonk', label: 'Phonk', emoji: '🏎️', vibe: 'O som das academias do momento', spotify: { id: '37i9dQZF1DWWY64wDtewQt', title: 'phonk' }, search: 'phonk gym' },
  { id: 'pop', label: 'Pop', emoji: '✨', vibe: 'Hits pop para treinar no embalo', spotify: { id: '37i9dQZF1DXdxcBWuJkbcy', title: 'Gym Hits' }, search: 'pop treino' },
  { id: 'brasil', label: 'Top Brasil', emoji: '🇧🇷', vibe: 'O que está tocando no Brasil', spotify: { id: '37i9dQZF1DX0FOF1IUWK1W', title: 'Top Brasil' }, search: 'top brasil' },
  { id: 'pagode', label: 'Pagode', emoji: '🥁', vibe: 'Pagode animado para treinar sorrindo', search: 'pagode treino' },
  { id: 'gospel', label: 'Gospel', emoji: '🙏', vibe: 'Louvores animados para treinar', search: 'gospel treino' },
  { id: 'reggaeton', label: 'Reggaeton', emoji: '💃', vibe: 'Latino, dançante e quente', search: 'reggaeton treino' },
  { id: 'kpop', label: 'K-pop', emoji: '💜', vibe: 'Energia do pop coreano', spotify: { id: '37i9dQZF1DX9tPFwDMOaN1', title: 'K-Pop ON!' }, search: 'kpop workout' },
  { id: 'flashback', label: 'Flashback', emoji: '📼', vibe: 'Anos 80, 90 e 2000 para treinar', search: 'flashback treino' },
  { id: 'cardio', label: 'Cardio / Corrida', emoji: '🏃', vibe: 'Ritmo certo para esteira e bike', spotify: { id: '37i9dQZF1DWSJHnPb1f0X3', title: 'Cardio' }, search: 'corrida treino' },
  { id: 'alongamento', label: 'Alongamento', emoji: '🧘', vibe: 'Calma para alongar e desacelerar', search: 'alongamento relaxar' },
];

type Pick = { kind: 'spotify' | 'deezer'; id: string; title: string };

const KEY = 'rutte:gym-music';
const q = encodeURIComponent;
const read = (): { style: string; pick?: Pick } => {
  try {
    const raw = localStorage.getItem(KEY) ?? '';
    return raw.startsWith('{') ? JSON.parse(raw) : { style: raw || 'motivacao' };
  } catch {
    return { style: 'motivacao' };
  }
};

export function WorkoutPlaylist() {
  const [state, setState] = useState(read);
  const top = useRef<HTMLElement>(null);
  // tocar uma playlist leva até o player
  const play = (p: Pick) => {
    setState({ style: state.style, pick: p });
    top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* sem armazenamento */
    }
  }, [state]);

  const style = STYLES.find((s) => s.id === state.style) ?? STYLES[0];
  const deezer = DEEZER_PLAYLISTS[style.id] ?? [];
  const pick: Pick | undefined = useMemo(() => {
    if (state.pick) return state.pick;
    if (style.spotify) return { kind: 'spotify', ...style.spotify };
    return deezer[0] && { kind: 'deezer', id: deezer[0].id, title: deezer[0].title };
  }, [state.pick, style, deezer]);

  const openLinks = [
    pick?.kind === 'deezer'
      ? { label: 'Abrir no Deezer', href: `https://www.deezer.com/br/playlist/${pick.id}`, cls: 'bg-[#A238FF] text-white' }
      : { label: 'Abrir no Spotify', href: pick ? `https://open.spotify.com/playlist/${pick.id}` : `https://open.spotify.com/search/${q(style.search)}`, cls: 'bg-[#1DB954] text-white' },
    { label: 'YouTube Music', href: `https://music.youtube.com/search?q=${q(style.search)}`, cls: 'bg-[#FF0033] text-white' },
    pick?.kind === 'deezer'
      ? { label: 'Buscar no Spotify', href: `https://open.spotify.com/search/${q(style.search)}/playlists`, cls: 'bg-[#1DB954] text-white' }
      : { label: 'Buscar no Deezer', href: `https://www.deezer.com/br/search/${q(style.search)}/playlist`, cls: 'bg-[#A238FF] text-white' },
  ];

  return (
    <div className="space-y-5">
      {/* topo: estilo atual + player */}
      <section ref={top} className="scroll-mt-4 overflow-hidden rounded-3xl border border-border bg-card">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary/70 to-navy px-5 pb-5 pt-5 text-white">
          <span className="pointer-events-none absolute -right-6 -top-8 select-none text-[120px] leading-none opacity-20" aria-hidden>
            {style.emoji}
          </span>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
            <Headphones className="size-4" aria-hidden /> Playlist do treino
          </p>
          <h2 className="mt-1 text-2xl font-bold">{style.label}</h2>
          <p className="text-sm text-white/80">{style.vibe}</p>
          {pick && (
            <p className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Play className="size-3 shrink-0 fill-current" aria-hidden /> <span className="truncate">Tocando: {pick.title}</span>
            </p>
          )}
        </div>
        {pick?.kind === 'spotify' && (
          <iframe
            key={pick.id}
            title={`Playlist ${pick.title} no Spotify`}
            src={`https://open.spotify.com/embed/playlist/${pick.id}?utm_source=generator&theme=0`}
            className="block h-[352px] w-full"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        )}
        {pick?.kind === 'deezer' && (
          <iframe
            key={pick.id}
            title={`Playlist ${pick.title} no Deezer`}
            src={`https://widget.deezer.com/widget/dark/playlist/${pick.id}?tracklist=true`}
            className="block h-[352px] w-full"
            allow="encrypted-media; clipboard-write"
            loading="lazy"
          />
        )}
        <div className="flex flex-wrap gap-2 p-4">
          {openLinks.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className={cn('inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition-opacity hover:opacity-90', l.cls)}>
              {l.label} <ExternalLink className="size-3.5" aria-hidden />
            </a>
          ))}
        </div>
      </section>

      {/* estilos */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/50">Escolha o estilo</p>
        <div role="radiogroup" aria-label="Estilo musical" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none]">
          {STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={style.id === s.id}
              onClick={() => setState({ style: s.id })}
              className={cn(
                'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-all duration-200',
                style.id === s.id ? 'border-primary bg-primary text-white shadow-neon' : 'border-border bg-card hover:border-primary/50 hover:bg-muted',
              )}
            >
              <span aria-hidden>{s.emoji}</span> {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* playlists do estilo */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/50">
          {deezer.length + (style.spotify ? 1 : 0)} playlists de {style.label.toLowerCase()} · toque para tocar
        </p>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {style.spotify && (
            <li>
              <PlaylistCard
                active={pick?.kind === 'spotify' && pick.id === style.spotify.id}
                onClick={() => play({ kind: 'spotify', ...style.spotify! })}
                title={style.spotify.title}
                meta="Oficial do Spotify"
                badge="Spotify"
                badgeCls="bg-[#1DB954]"
                emoji={style.emoji}
              />
            </li>
          )}
          {deezer.map((p) => (
            <li key={p.id}>
              <PlaylistCard
                active={pick?.kind === 'deezer' && pick.id === p.id}
                onClick={() => play({ kind: 'deezer', id: p.id, title: p.title })}
                title={p.title}
                meta={`${p.tracks} músicas${p.editor ? ' · Editorial' : ''}`}
                badge="Deezer"
                badgeCls="bg-[#A238FF]"
                cover={p.cover}
              />
            </li>
          ))}
        </ul>
        {deezer.length === 0 && !style.spotify && (
          <p className="flex items-center gap-2 text-sm text-foreground/60">
            <Music2 className="size-4" aria-hidden /> Use os botões acima para abrir a busca pronta no seu app.
          </p>
        )}
      </div>
      <p className="flex items-start gap-1.5 text-xs text-foreground/50">
        <Sparkles className="mt-0.5 size-3.5 shrink-0" aria-hidden /> Sem login, os players tocam prévias de 30 s. Entrando na sua conta do Spotify ou do Deezer (ou abrindo no app), toca a playlist inteira.
      </p>
    </div>
  );
}

function PlaylistCard({ active, onClick, title, meta, badge, badgeCls, cover, emoji }: { active: boolean; onClick: () => void; title: string; meta: string; badge: string; badgeCls: string; cover?: string; emoji?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'group flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-card text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
        active ? 'border-primary ring-2 ring-primary/40' : 'border-border',
      )}
    >
      <span className="relative block aspect-square w-full overflow-hidden bg-gradient-to-br from-primary to-navy">
        {cover ? (
          <img src={cover} alt="" loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <span className="grid size-full place-items-center text-6xl" aria-hidden>
            {emoji}
          </span>
        )}
        <span className={cn('absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white', badgeCls)}>{badge}</span>
        <span className={cn('absolute bottom-2 right-2 grid size-10 place-items-center rounded-full bg-primary text-white shadow-lg transition-all duration-200', active ? 'opacity-100' : 'translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100')}>
          <Play className="size-4 fill-current" aria-hidden />
        </span>
      </span>
      <span className="flex flex-1 flex-col p-2.5">
        <span className="line-clamp-2 text-sm font-semibold leading-snug">{title}</span>
        <span className="mt-0.5 text-xs text-foreground/55">{meta}</span>
      </span>
    </button>
  );
}
