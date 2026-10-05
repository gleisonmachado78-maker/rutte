import { BookOpen, ChevronRight, CirclePlay, Crown, Headphones, Play, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SpotifyMark } from '@/components/library/podcast-card';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/sheet';
import { BOOKS } from '@/lib/books';
import { useMentorPhotos } from '@/lib/mentor-photos';
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

type Photos = ReturnType<typeof useMentorPhotos>;

/** Foto: a da Wikipédia; sem ela, a capa do primeiro podcast; sem nada, as iniciais. */
function Avatar({ m, photos, size = 'md' }: { m: Mentor; photos: Photos; size?: 'sm' | 'md' | 'lg' }) {
  const [failed, setFailed] = useState<string[]>([]);
  const options = [photos[m.id]?.src, POD.get(m.podcasts[0])?.thumb].filter((s): s is string => !!s && !failed.includes(s));
  const src = options[0];
  const box = size === 'sm' ? 'size-7 rounded-full text-[10px]' : size === 'lg' ? 'size-24 rounded-2xl text-2xl' : 'size-14 rounded-xl text-base';
  return src ? (
    <img src={src} alt={size === 'sm' ? '' : `Foto de ${m.name}`} loading="lazy" onError={() => setFailed((f) => [...f, src])} className={cn('shrink-0 bg-muted object-cover object-top ring-1 ring-border', box)} />
  ) : (
    <span className={cn('grid shrink-0 place-items-center bg-gradient-to-br from-primary to-navy font-bold text-white', box)}>{initials(m.name)}</span>
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

function TopBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
      <Crown className="size-3" aria-hidden /> Top
    </span>
  );
}

/** Cartão compacto do quadro: foto, nome, quem é e um trecho da biografia. */
function MentorCard({ m, photos, onOpen }: { m: Mentor; photos: Photos; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full flex-col gap-2.5 rounded-xl border border-border bg-card p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span className="flex items-center gap-3">
        <Avatar m={m} photos={photos} />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5 font-bold leading-snug">
            {m.name}
            {m.top && <TopBadge />}
          </span>
          <span className="mt-0.5 block text-xs leading-snug text-foreground/60">{m.role}</span>
        </span>
      </span>
      {m.bio && <span className="line-clamp-3 text-[13px] leading-relaxed text-foreground/75">{m.bio}</span>}
      <span className="flex items-center justify-between border-t border-border pt-2 text-xs font-medium text-foreground/55">
        <span className="inline-flex items-center gap-1">
          <Headphones className="size-3.5" aria-hidden /> {m.podcasts.length === 1 ? '1 podcast' : `${m.podcasts.length} podcasts`}
        </span>
        <span className="inline-flex items-center gap-0.5 text-primary opacity-80 transition-opacity group-hover:opacity-100">
          Ver perfil <ChevronRight className="size-3.5" aria-hidden />
        </span>
      </span>
    </button>
  );
}

/** Perfil completo: foto grande, biografia, áreas, podcasts, livros e vídeos. */
function MentorProfile({ m, photos }: { m: Mentor; photos: Photos }) {
  const pods = m.podcasts.map((id) => POD.get(id)).filter((p): p is Podcast => !!p);
  const keys = (m.match ?? []).map(norm);
  const books = keys.length ? BOOKS.filter((b) => keys.some((k) => norm(b.author).includes(k))) : [];
  const videos = keys.length ? LIFE_VIDEOS.filter((v) => keys.some((k) => norm(`${v.channel} ${v.title}`).includes(k))) : [];
  const photo = photos[m.id];
  return (
    <div className="space-y-4 p-5 sm:p-6">
      <header className="flex items-start gap-4 pr-10">
        <Avatar m={m} photos={photos} size="lg" />
        <div className="min-w-0 flex-1">
          <DialogTitle className="flex flex-wrap items-center gap-1.5 text-xl font-bold leading-tight">
            {m.name}
            {m.top && <TopBadge />}
          </DialogTitle>
          <p className="mt-1 text-sm text-foreground/70">{m.role}</p>
          <p className="mt-2 flex flex-wrap gap-1">
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

      {m.bio && <DialogDescription className="text-[15px] leading-relaxed text-foreground/85">{m.bio}</DialogDescription>}

      <section>
        <h3 className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-foreground/50">
          <Headphones className="size-3.5" aria-hidden /> {pods.length === 1 ? 'Podcast' : `${pods.length} podcasts`}
        </h3>
        <ul className="space-y-1.5">
          {pods.map((p) => (
            <PodcastRow key={p.spotifyId} p={p} />
          ))}
        </ul>
      </section>

      {(books.length > 0 || videos.length > 0) && (
        <section className="flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-3 text-xs text-foreground/60">
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
        </section>
      )}

      {photo && (
        <p className="text-[11px] text-foreground/45">
          Foto:{' '}
          <a href={photo.page} target="_blank" rel="noreferrer" className="underline hover:text-primary">
            Wikipédia / Wikimedia Commons
          </a>
        </p>
      )}
    </div>
  );
}

/** Aba "Grandes nomes": quadro (kanban) com uma coluna por área; cada pessoa abre o próprio perfil. */
export function MentorsTab({ query }: { query: string }) {
  const photos = useMentorPhotos();
  const [area, setArea] = useState<MentorArea | 'ALL'>('ALL');
  const [person, setPerson] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const q = norm(query.trim());

  const visible = useMemo(
    () =>
      MENTORS.filter((m) => (!person || m.id === person) && (!q || norm(`${m.name} ${m.role} ${m.bio ?? ''} ${m.podcasts.map((id) => POD.get(id)?.title ?? '').join(' ')}`).includes(q))).sort(
        (a, b) => Number(!!b.top) - Number(!!a.top),
      ),
    [person, q],
  );

  // Cada pessoa fica na coluna da sua área principal; ao filtrar uma área, entram todos que atuam nela.
  const columns = MENTOR_AREAS.filter((a) => area === 'ALL' || a.id === area)
    .map((a) => ({ ...a, people: visible.filter((m) => (area === 'ALL' ? m.areas[0] === a.id : m.areas.includes(a.id))) }))
    .filter((c) => c.people.length > 0);

  const opened = MENTORS.find((m) => m.id === openId);
  const chip = 'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors';
  return (
    <div className="space-y-4">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none]" role="toolbar" aria-label="Áreas">
        <button type="button" aria-pressed={area === 'ALL'} onClick={() => setArea('ALL')} className={cn(chip, area === 'ALL' ? 'border-primary bg-primary text-white' : 'border-border bg-background hover:bg-muted')}>
          Todas as áreas
        </button>
        {MENTOR_AREAS.filter((a) => MENTORS.some((m) => m.areas.includes(a.id))).map((a) => (
          <button key={a.id} type="button" aria-pressed={area === a.id} onClick={() => setArea(a.id)} className={cn(chip, area === a.id ? 'border-primary bg-primary text-white' : 'border-border bg-background hover:bg-muted')}>
            <span aria-hidden>{a.emoji}</span> {a.label}
          </button>
        ))}
      </div>

      {/* Filtro por nome: uma linha de fotos que rola de lado */}
      <div className="flex items-center gap-2">
        <div className="-mx-4 flex flex-1 gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:thin]" role="toolbar" aria-label="Filtrar por nome">
          {MENTORS.filter((m) => area === 'ALL' || m.areas.includes(area)).map((m) => {
            const on = person === m.id;
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={on}
                onClick={() => setPerson(on ? null : m.id)}
                className={cn('inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border pl-1 pr-3 text-sm font-medium transition-colors', on ? 'border-primary bg-primary text-white' : 'border-border bg-background hover:border-primary/60')}
              >
                <Avatar m={m} photos={photos} size="sm" />
                {m.name}
              </button>
            );
          })}
        </div>
        {person && (
          <button type="button" onClick={() => setPerson(null)} className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-border px-3 text-xs font-medium text-foreground/70 hover:text-primary">
            <X className="size-3.5" aria-hidden /> Todos
          </button>
        )}
      </div>

      {columns.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-foreground/60">Ninguém encontrado com esse filtro.</p>
      ) : columns.length === 1 ? (
        <section className="rounded-2xl border border-border bg-muted/40 p-3">
          <ColumnHeader emoji={columns[0].emoji} label={columns[0].label} count={columns[0].people.length} />
          <div className="stagger grid grid-cols-1 items-start gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {columns[0].people.map((m) => (
              <MentorCard key={m.id} m={m} photos={photos} onOpen={() => setOpenId(m.id)} />
            ))}
          </div>
        </section>
      ) : (
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0" role="list" aria-label="Quadro por área">
          {columns.map((c) => (
            <section key={c.id} role="listitem" className="flex w-[82vw] max-w-[300px] shrink-0 snap-start flex-col rounded-2xl border border-border bg-muted/40 p-3 sm:w-[300px]">
              <ColumnHeader emoji={c.emoji} label={c.label} count={c.people.length} />
              <div className="stagger flex flex-col gap-2.5">
                {c.people.map((m) => (
                  <MentorCard key={m.id} m={m} photos={photos} onOpen={() => setOpenId(m.id)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <Dialog open={!!opened} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-xl overflow-y-auto p-0">{opened && <MentorProfile m={opened} photos={photos} />}</DialogContent>
      </Dialog>
    </div>
  );
}

function ColumnHeader({ emoji, label, count }: { emoji: string; label: string; count: number }) {
  return (
    <h3 className="mb-3 flex items-center gap-2 px-1 text-sm font-bold">
      <span aria-hidden>{emoji}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="rounded-full bg-background px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground/60">{count}</span>
    </h3>
  );
}
