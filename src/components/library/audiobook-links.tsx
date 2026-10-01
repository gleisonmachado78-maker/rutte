import { ExternalLink, Headphones } from 'lucide-react';
import { audiobookLinks, openSpotify } from '@/lib/spotify';

/** “Ouvir audiolivro”: Spotify (abre o app) + outras lojas de audiolivros. */
export function AudiobookLinks({ title, author }: { title: string; author: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      <span className="inline-flex items-center gap-1 font-semibold text-foreground/60">
        <Headphones className="size-3.5" aria-hidden /> Audiolivro:
      </span>
      {audiobookLinks(title, author).map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noreferrer"
          onClick={
            l.app
              ? (e) => {
                  e.preventDefault();
                  openSpotify('search', l.search!);
                }
              : undefined
          }
          className={l.app ? 'inline-flex items-center gap-0.5 font-semibold text-[#1a9e48] hover:underline dark:text-[#1DB954]' : 'inline-flex items-center gap-0.5 font-medium text-primary hover:underline dark:text-neon'}
        >
          {l.label}
          <ExternalLink className="size-3" aria-hidden />
        </a>
      ))}
    </div>
  );
}
