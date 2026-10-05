import { BookOpen, CirclePlay, Crown, Headphones, Play, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SpotifyMark } from '@/components/library/podcast-card';
import { BOOKS } from '@/lib/books';
import { MENTOR_AREAS, MENTORS, type Mentor, type MentorArea } from '@/lib/mentors';
import { PODCASTS, type Podcast } from '@/lib/podcasts';
import { openSpotify, spotifyEmbedUrl, spotifyWebUrl } from '@/lib/spotify';
import { cn } from '@/lib/utils';
import { LIFE_VIDEOS } from '@/lib/videos';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const POD = new Map(PODCASTS.map((p) => [p.spotifyId, p]));
const initials = (name: string) =>
  name
    .replace(/\(.*?\)/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 || /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

/** Capa: a capa do primeiro podcast da pessoa (ou iniciais). */
function Avatar({ m, size = 'md' }: { m: Mentor; size?: 'sm' | 'md' }) {
  const [failed, setFailed] = useState(false);
  const thumb = POD.get(m.podcasts[0])?.thumb;
  const box = size === 'sm' ? 'size-7 text-[10px]' : 'size-16 text-lg';
  return thumb && !failed ? (
    <img src={thumb} alt="" loading="lazy" onError={() => setFailed(true)} className={cn('shrink-0 rounded-full object-cover ring-2 ring-white/10', box)} />
  ) : (
    <span className={cn('grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-navy font-bold text-white', box)}>{initials(m.name)}</span>
  );
}

function PodcastRow({ p }: { p: Podcast }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded-xl border border-border bg-background/60 p-2">
      <div className="flex items-center gap-2.5">
        <img src={p.thumb} alt="" loading="lazy" className="size-11 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold" title={p.title}>
            {p.title}
          </p>
          <p className="line-clamp-1 text-xs text-foreground/55">{p.desc}</p>
        </div>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="grid size-9 shrink-0 place-items-center rounded-full border border-border hover:bg-muted" aria-label={open ? `Fechar player de ${p.title}` : `Ouvir ${p.title} aqui`} title={open ? 'Fechar player' : 'Ouvir aqui'}>
          {open ? <X className="size-4" /> : <Play className="size-4" />}
        </button>
        <a
          href={spotifyWebUrl('show', p.spotifyId)}
          onClick={(e) => {
            e.preventDefault();
            openSpotify('show', p.spotifyId);
          }}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-[#1DB954] text-black hover:bg-[#1ed760]"
          aria-label={`Abrir ${p.title} no Spotify`}
          title="Abrir no Spotify"
        >
          <SpotifyMark className="size-4" />
        </a>
      </div>
      {open && <iframe src={spotifyEmbedUrl(p.spotifyId)} title={`Player do Spotify: ${p.title}`} className="mt-2 h-[152px] w-full rounded-xl border-0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />}
    </li>
  );
}

function MentorCard({ m, onPick }: { m: Mentor; onPick: (id: string) => void }) {
  const pods = m.podcasts.map((id) => POD.get(id)).filter((p): p is Podcast => !!p);
  const keys = (m.match ?? []).map(norm);
  const books = keys.length ? BOOKS.filter((b) => keys.some((k) => norm(b.author).includes(k))) : [];
  const videos = keys.length ? LIFE_VIDEOS.filter((v) => keys.some((k) => norm(`${v.channel} ${v.title}`).includes(k))) : [];
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <header className="flex items-center gap-3">
        <button type="button" onClick={() => onPick(m.id)} className="shrink-0 rounded-full focus-visible:outline-none" aria-label={`Ver só ${m.name}`}>
          <Avatar m={m} />
        </button>
        <div className="min-w-0 flex-1">
          <h3 className="flex flex-wrap items-center gap-1.5 font-bold leading-snug">
            {m.name}
            {m.top && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                <Crown className="size-3" aria-hidden /> Top
              </span>
            )}
          </h3>
          <p className="text-sm leading-snug text-foreground/70">{m.role}</p>
          <p className="mt-1 flex flex-wrap gap-1">
            {m.areas.map((a) => {
              const area = MENTOR_AREAS.find((x) => x.id === a)!;
              return (
                <span key={a} className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground/65">
                  {area.emoji} {area.label}
                </span>
              );
            })}
          </p>
        </div>
      </header>

      <div>
        <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-foreground/50">
          <Headphones className="size-3.5" aria-hidden /> {pods.length === 1 ? 'Podcast' : `${pods.length} podcasts`}
        </p>
        <ul className="space-y-1.5">
          {pods.map((p) => (
            <PodcastRow key={p.spotifyId} p={p} />
          ))}
        </ul>
      </div>

      {(books.length > 0 || videos.length > 0) && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-2 text-xs text-foreground/60">
          {books.map((b) => (
            <span key={b.googleId} className="inline-flex items-center gap-1">
              <BookOpen className="size-3.5" aria-hidden /> {b.title.split(': ')[0]}
            </span>
          ))}
          {videos.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <CirclePlay className="size-3.5" aria-hidden /> {videos.length} {videos.length === 1 ? 'vídeo' : 'vídeos'} na aba Vídeos
            </span>
          )}
        </div>
      )}
    </article>
  );
}

/** Aba "Grandes nomes": filtro por área e por nome; cada pessoa com seus podcasts. */
export function MentorsTab({ query }: { query: string }) {
  const [area, setArea] = useState<MentorArea | 'ALL'>('ALL');
  const [person, setPerson] = useState<string | null>(null);
  const q = norm(query.trim());

  const byArea = useMemo(() => MENTORS.filter((m) => area === 'ALL' || m.areas.includes(area)).sort((a, b) => Number(!!b.top) - Number(!!a.top)), [area]);
  const list = byArea.filter((m) => (!person || m.id === person) && (!q || norm(`${m.name} ${m.role} ${m.podcasts.map((id) => POD.get(id)?.title ?? '').join(' ')}`).includes(q)));

  const chip = 'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors';
  return (
    <div className="space-y-4">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none]" role="toolbar" aria-label="Áreas">
        <button type="button" aria-pressed={area === 'ALL'} onClick={() => { setArea('ALL'); setPerson(null); }} className={cn(chip, area === 'ALL' ? 'border-primary bg-primary text-white' : 'border-border bg-background hover:bg-muted')}>
          Todas as áreas
        </button>
        {MENTOR_AREAS.filter((a) => MENTORS.some((m) => m.areas.includes(a.id))).map((a) => (
          <button key={a.id} type="button" aria-pressed={area === a.id} onClick={() => { setArea(a.id); setPerson(null); }} className={cn(chip, area === a.id ? 'border-primary bg-primary text-white' : 'border-border bg-background hover:bg-muted')}>
            <span aria-hidden>{a.emoji}</span> {a.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-3">
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-foreground/50">Filtrar por nome</p>
        <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto" role="toolbar" aria-label="Nomes">
          {byArea.map((m) => {
            const on = person === m.id;
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={on}
                onClick={() => setPerson(on ? null : m.id)}
                className={cn('inline-flex h-9 items-center gap-1.5 rounded-full border pl-1 pr-3 text-sm font-medium transition-colors', on ? 'border-primary bg-primary text-white' : 'border-border bg-background hover:border-primary/60')}
              >
                <Avatar m={m} size="sm" />
                {m.name}
              </button>
            );
          })}
        </div>
        {person && (
          <button type="button" onClick={() => setPerson(null)} className="mt-2 inline-flex items-center gap-1 px-1 text-xs font-medium text-foreground/60 hover:text-primary">
            <X className="size-3.5" aria-hidden /> Mostrar todos
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-foreground/60">Ninguém encontrado com esse filtro.</p>
      ) : (
        <div className="stagger grid grid-cols-1 items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((m) => (
            <MentorCard key={m.id} m={m} onPick={(id) => setPerson(id)} />
          ))}
        </div>
      )}
    </div>
  );
}
