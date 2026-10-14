import { Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

interface News {
  id: string;
  emoji?: string;
  title: string;
  body: string;
  cta?: string;
  url?: string;
}

const SEEN = 'rutte:news-seen';

/**
 * Aviso de novidade (public/news.json): aparece uma vez para cada pessoa, em qualquer aparelho,
 * na próxima vez que ela abrir a Rutte. Para anunciar algo novo, troque o "id" do arquivo.
 */
export function NewsPopup() {
  const [news, setNews] = useState<News | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (import.meta.env.MODE === 'single' || location.protocol !== 'https:') return;
    let alive = true;
    fetch(`/news.json?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((n: News | null) => {
        if (!alive || !n?.id) return;
        let seen = '';
        try {
          seen = localStorage.getItem(SEEN) ?? '';
        } catch {
          /* sem armazenamento */
        }
        if (seen !== n.id) window.setTimeout(() => alive && setNews(n), 1200);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!news) return null;
  const close = () => {
    try {
      localStorage.setItem(SEEN, news.id);
    } catch {
      /* sem armazenamento */
    }
    setNews(null);
  };
  return createPortal(
    <div className="fixed inset-0 z-[90] grid place-items-center bg-navy/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="news-title" onClick={close}>
      <div className="fade-up relative w-full max-w-md overflow-hidden rounded-3xl bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative bg-gradient-to-br from-primary via-primary/80 to-navy px-6 pb-6 pt-7 text-white">
          <span className="pointer-events-none absolute -right-4 -top-6 select-none text-[110px] leading-none opacity-20" aria-hidden>
            {news.emoji ?? '✨'}
          </span>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider">
            <Sparkles className="size-3.5" aria-hidden /> Novidade
          </p>
          <h2 id="news-title" className="mt-3 text-balance text-2xl font-bold leading-tight">
            {news.emoji} {news.title}
          </h2>
          <button type="button" onClick={close} className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/15 hover:bg-white/25" aria-label="Fechar">
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-5 p-6">
          <p className="text-[15px] leading-relaxed text-foreground/80">{news.body}</p>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={close} className="h-10 rounded-xl px-4 text-sm font-semibold text-foreground/60 hover:bg-muted">
              Depois
            </button>
            {news.url && (
              <button
                type="button"
                onClick={() => {
                  close();
                  navigate(news.url!);
                }}
                className="btn-neon h-10 rounded-xl px-5 text-sm font-semibold text-white"
              >
                {news.cta ?? 'Ver agora'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
