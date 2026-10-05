import { CirclePlay, ExternalLink, Mic, Palette, Wind } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/sheet';
import { LIFE_AREA_BY_ID } from '@/lib/life-areas';
import { cn } from '@/lib/utils';
import { ratingKey, StarRating, StarsBadge, useStars } from '@/components/ui/star-rating';
import { embedUrl, thumbUrl, videoDesc, watchUrl, type LifeVideo } from '@/lib/videos';
import { HIGHLIGHT_CARD } from '@/components/library/highlight';

export function VideoCard({ video, onPlay, highlight }: { video: LifeVideo; onPlay: (v: LifeVideo) => void; highlight?: boolean }) {
  const area = LIFE_AREA_BY_ID[video.area];
  const Icon = area.icon;
  const stars = useStars(ratingKey('video', video.youtubeId));
  return (
    <button
      type="button"
      onClick={() => onPlay(video)}
      className={cn(
        'group flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
        highlight && HIGHLIGHT_CARD,
      )}
      aria-label={`Assistir: ${video.title}`}
    >
      <span className="relative block aspect-video w-full overflow-hidden bg-muted">
        <img
          src={thumbUrl(video.youtubeId)}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute inset-0 grid place-items-center bg-navy/20 transition-colors group-hover:bg-navy/40">
          <span className="btn-neon grid size-14 place-items-center rounded-full text-white transition-transform duration-200 group-hover:scale-110">
            <CirclePlay className="size-8" aria-hidden />
          </span>
        </span>
        <span
          className={cn(
            'absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
            video.style === 'animado' ? 'bg-navy/85 text-white' : 'bg-white/95 text-navy',
          )}
        >
          {video.style === 'animado' ? <Palette className="size-3" aria-hidden /> : video.style === 'guiada' ? <Wind className="size-3" aria-hidden /> : <Mic className="size-3" aria-hidden />}
          {video.style === 'animado' ? 'Animado' : video.style === 'guiada' ? 'Guiada' : 'Palestra'}
        </span>
        <StarsBadge stars={stars} className="absolute left-2 top-2" />
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-navy">
          <Icon className="size-3" style={{ color: area.color }} aria-hidden />
          {area.short}
        </span>
      </span>
      <span className="flex flex-1 flex-col gap-1 p-3">
        <span className="line-clamp-2 text-sm font-semibold leading-snug">{video.title}</span>
        {(video.desc ?? videoDesc(video.youtubeId)) && <span className="line-clamp-2 text-xs leading-snug text-foreground/70">{video.desc ?? videoDesc(video.youtubeId)}</span>}
        <span className="mt-auto pt-1 text-xs text-foreground/50">
          {video.channel} · {video.meta}
        </span>
      </span>
    </button>
  );
}

/** Player em modal: abre e já começa a tocar (autoplay). */
export function VideoPlayerDialog({ video, onClose }: { video: LifeVideo | null; onClose: () => void }) {
  return (
    <Dialog open={!!video} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[min(calc(100%-2rem),calc((100dvh-10rem)*16/9))] max-w-4xl overflow-hidden p-0">
        {video && (
          <>
            <div className="aspect-video w-full bg-black">
              <iframe
                key={video.youtubeId}
                src={embedUrl(video.youtubeId)}
                title={video.title}
                className="size-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <div className="flex flex-wrap items-start gap-3 p-4">
              <div className="min-w-0 flex-1">
                <DialogTitle className="font-semibold leading-snug">{video.title}</DialogTitle>
                <DialogDescription className="mt-1 text-sm text-foreground/60">
                  {video.channel} · {LIFE_AREA_BY_ID[video.area].name}
                </DialogDescription>
                {(video.desc ?? videoDesc(video.youtubeId)) && <p className="mt-1.5 text-sm text-foreground/80">{video.desc ?? videoDesc(video.youtubeId)}</p>}
                <StarRating itemKey={ratingKey('video', video.youtubeId)} label={video.title} className="mt-2" />
              </div>
              <a
                href={watchUrl(video.youtubeId)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-sm font-medium hover:bg-muted"
              >
                <ExternalLink className="size-4" aria-hidden /> Abrir no YouTube
              </a>
              <button
                type="button"
                onClick={onClose}
                className="btn-neon inline-flex h-9 items-center rounded-xl px-4 text-sm font-semibold text-white"
              >
                Fechar
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function useVideoPlayer() {
  const [video, setVideo] = useState<LifeVideo | null>(null);
  return { video, play: setVideo, close: () => setVideo(null) };
}
