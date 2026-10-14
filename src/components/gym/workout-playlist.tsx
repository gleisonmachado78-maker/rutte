import { ExternalLink, Headphones, Music2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Playlists de treino por gosto musical. As que têm "spotify" são playlists oficiais do Spotify
 * (IDs conferidos pelo oEmbed em 14/10/2026) e tocam aqui mesmo; as demais abrem a busca pronta.
 */
interface Style {
  id: string;
  label: string;
  emoji: string;
  vibe: string;
  spotify?: string;
  search: string;
}

const STYLES: Style[] = [
  { id: 'motivacao', label: 'Beast Mode', emoji: '🔥', vibe: 'Pesado e motivador para bater recorde', spotify: '37i9dQZF1DX76Wlfdnj7AP', search: 'beast mode treino' },
  { id: 'funk', label: 'Funk', emoji: '🔊', vibe: 'Batida brasileira para não parar', spotify: '37i9dQZF1DWTkIwO2HDifB', search: 'funk treino academia' },
  { id: 'sertanejo', label: 'Sertanejo', emoji: '🤠', vibe: 'Os sertanejos mais animados', spotify: '37i9dQZF1DXdSjVZQzv2tl', search: 'sertanejo treino' },
  { id: 'rap', label: 'Rap / Hip-hop', emoji: '🎤', vibe: 'Rimas e graves para o treino pesado', spotify: '37i9dQZF1DX9oh43oAzkyx', search: 'rap treino academia' },
  { id: 'rock', label: 'Rock', emoji: '🎸', vibe: 'Clássicos do rock para empurrar mais', spotify: '37i9dQZF1DWXRqgorJj26U', search: 'rock treino academia' },
  { id: 'metal', label: 'Metal', emoji: '🤘', vibe: 'Peso máximo, sem dó', spotify: '37i9dQZF1DWTcqUzwhNmKv', search: 'metal treino' },
  { id: 'eletronica', label: 'Eletrônica', emoji: '🎧', vibe: 'Dance e house em ritmo constante', spotify: '37i9dQZF1DX4dyzvuaRJ0n', search: 'eletrônica treino academia' },
  { id: 'phonk', label: 'Phonk', emoji: '🏎️', vibe: 'O som das academias do momento', spotify: '37i9dQZF1DWWY64wDtewQt', search: 'phonk gym' },
  { id: 'pop', label: 'Pop', emoji: '✨', vibe: 'Hits pop para treinar no embalo', spotify: '37i9dQZF1DXdxcBWuJkbcy', search: 'pop treino academia' },
  { id: 'brasil', label: 'Top Brasil', emoji: '🇧🇷', vibe: 'O que está tocando no Brasil', spotify: '37i9dQZF1DX0FOF1IUWK1W', search: 'top brasil' },
  { id: 'kpop', label: 'K-pop', emoji: '💜', vibe: 'Energia do pop coreano', spotify: '37i9dQZF1DX9tPFwDMOaN1', search: 'kpop workout' },
  { id: 'cardio', label: 'Cardio', emoji: '🏃', vibe: 'Ritmo certo para esteira e bike', spotify: '37i9dQZF1DWSJHnPb1f0X3', search: 'cardio treino' },
  { id: 'pagode', label: 'Pagode', emoji: '🥁', vibe: 'Pagode animado para treinar sorrindo', search: 'pagode treino' },
  { id: 'gospel', label: 'Gospel', emoji: '🙏', vibe: 'Louvores animados para treinar', search: 'gospel treino academia' },
];

const KEY = 'rutte:gym-music';
const q = encodeURIComponent;
const links = (s: Style) => [
  { label: 'Spotify', href: s.spotify ? `https://open.spotify.com/playlist/${s.spotify}` : `https://open.spotify.com/search/${q(s.search)}/playlists`, color: 'bg-[#1DB954] text-white' },
  { label: 'YouTube Music', href: `https://music.youtube.com/search?q=${q(s.search)}`, color: 'bg-[#FF0033] text-white' },
  { label: 'Deezer', href: `https://www.deezer.com/br/search/${q(s.search)}/playlist`, color: 'bg-[#A238FF] text-white' },
];

export function WorkoutPlaylist() {
  const [sel, setSel] = useState<string>(() => {
    try {
      return localStorage.getItem(KEY) || 'motivacao';
    } catch {
      return 'motivacao';
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(KEY, sel);
    } catch {
      /* sem armazenamento */
    }
  }, [sel]);
  const style = STYLES.find((s) => s.id === sel) ?? STYLES[0];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Headphones className="size-5 text-primary dark:text-neon" aria-hidden /> Playlist do treino
        </h2>
        <p className="text-sm text-foreground/60">Escolha o seu estilo. A Rutte lembra da sua escolha para o próximo treino.</p>
      </div>

      <div role="radiogroup" aria-label="Estilo musical" className="flex flex-wrap gap-2">
        {STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={sel === s.id}
            onClick={() => setSel(s.id)}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-all duration-200',
              sel === s.id ? 'border-primary bg-primary text-white shadow-neon' : 'border-border bg-card hover:border-primary/50 hover:bg-muted',
            )}
          >
            <span aria-hidden>{s.emoji}</span> {s.label}
          </button>
        ))}
      </div>

      <section key={style.id} className="fade-up overflow-hidden rounded-2xl border border-border bg-card">
        <header className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-2xl" aria-hidden>{style.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="font-bold">{style.label}</p>
            <p className="text-sm text-foreground/60">{style.vibe}</p>
          </div>
        </header>
        {style.spotify ? (
          <iframe
            key={style.spotify}
            title={`Playlist ${style.label} no Spotify`}
            src={`https://open.spotify.com/embed/playlist/${style.spotify}?utm_source=generator&theme=0`}
            className="block h-[352px] w-full"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center gap-3 p-5 text-sm text-foreground/70">
            <Music2 className="size-5 shrink-0 text-primary dark:text-neon" aria-hidden />
            Abra no seu app favorito: a busca já vem pronta com as melhores playlists de {style.label.toLowerCase()} para treinar.
          </div>
        )}
        <div className="flex flex-wrap gap-2 border-t border-border p-4">
          {links(style).map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className={cn('inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition-opacity hover:opacity-90', l.color)}>
              {l.label} <ExternalLink className="size-3.5" aria-hidden />
            </a>
          ))}
        </div>
      </section>
      <p className="text-xs text-foreground/50">No Spotify sem login, o player toca prévias de 30 s. Entrando na sua conta do Spotify neste navegador (ou abrindo no app), toca a playlist inteira.</p>
    </div>
  );
}
