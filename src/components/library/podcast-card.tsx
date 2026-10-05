import { Headphones, Play, X } from 'lucide-react';
import { useState } from 'react';
import { ratingKey, StarRating, StarsBadge, useStars } from '@/components/ui/star-rating';
import { TOPIC_BY_ID } from '@/lib/library';
import type { Podcast } from '@/lib/podcasts';
import { openSpotify, spotifyEmbedUrl, spotifyWebUrl } from '@/lib/spotify';

/** Ícone do Spotify (marca simplificada) */
function SpotifyMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1 .25c-2.8-1.7-6.4-2.1-10.5-1.2a.75.75 0 1 1-.33-1.46c4.5-1 8.4-.6 11.6 1.4.35.21.46.67.24 1.01Zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.2-2-8.1-2.5-11.9-1.4a.94.94 0 0 1-.55-1.8c4.3-1.3 9.7-.7 13.4 1.6.44.27.58.85.31 1.29Zm.13-3.4C15.2 8.3 8.9 8.1 5.2 9.2a1.13 1.13 0 1 1-.65-2.16c4.2-1.3 11.2-1 15.6 1.6a1.13 1.13 0 0 1-1.15 1.94Z" />
    </svg>
  );
}

export function PodcastCard({ podcast }: { podcast: Podcast }) {
  const [listening, setListening] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const topic = TOPIC_BY_ID[podcast.topic];
  const key = ratingKey('podcast', podcast.spotifyId);
  const stars = useStars(key);

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3">
      <div className="flex gap-3">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-24">
          {podcast.thumb && !imgFailed ? (
            <img src={podcast.thumb} alt={`Capa do podcast ${podcast.title}`} loading="lazy" onError={() => setImgFailed(true)} className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center text-white" style={{ background: `linear-gradient(160deg, ${topic.color}, #111727)` }}>
              <Headphones className="size-8" aria-hidden />
            </div>
          )}
          <StarsBadge stars={stars} className="absolute left-1 top-1" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold leading-snug">
            {podcast.title}
            {podcast.featured && <span className="ml-1.5 inline-block rounded-full bg-amber-400/20 px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">Popular</span>}
          </h4>
          <p className="text-xs text-foreground/60">{podcast.host}</p>
          <p className="mt-1 text-sm leading-snug text-foreground/80">{podcast.desc}</p>
        </div>
      </div>

      {listening && (
        <iframe
          src={spotifyEmbedUrl(podcast.spotifyId)}
          title={`Player do Spotify: ${podcast.title}`}
          className="h-[152px] w-full rounded-xl border-0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <a
          href={spotifyWebUrl('show', podcast.spotifyId)}
          onClick={(e) => {
            e.preventDefault();
            openSpotify('show', podcast.spotifyId);
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
      </div>
      <StarRating itemKey={key} label={podcast.title} withNote={false} />
    </article>
  );
}

export { SpotifyMark };
