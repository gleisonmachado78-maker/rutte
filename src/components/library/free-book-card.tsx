import { Award, Download, ExternalLink, Gift, Scale, UserPlus, Wrench } from 'lucide-react';
import { TOPIC_BY_ID, type FreeBook } from '@/lib/library';
import { ratingKey, StarRating } from '@/components/ui/star-rating';
import { HIGHLIGHT_CARD, HIGHLIGHT_STRONG } from '@/components/library/highlight';
import { cn } from '@/lib/utils';

/** Capa tipográfica para livros gratuitos (sem capa no Google Livros). */
function FreeCover({ book }: { book: FreeBook }) {
  const topic = TOPIC_BY_ID[book.topic];
  return (
    <div
      className="relative flex aspect-[2/3] flex-col justify-between rounded-md p-2.5 text-white shadow-md"
      style={{ background: `linear-gradient(160deg, ${topic.color}, #111727)` }}
      role="img"
      aria-label={`Capa: ${book.title}`}
    >
      <topic.icon className="size-4 opacity-80" aria-hidden />
      <span className="line-clamp-5 font-brand text-sm font-bold leading-tight">{book.title}</span>
      <span className="line-clamp-2 text-[10px] opacity-80">{book.author}</span>
      <span className="absolute -right-1.5 -top-1.5 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow">Grátis</span>
    </div>
  );
}

export function FreeBookCard({ book }: { book: FreeBook }) {
  return (
    <article className={cn(HIGHLIGHT_CARD, 'flex gap-3 p-3 pl-4', book.category === 'classico' && HIGHLIGHT_STRONG)}>
      <div className="w-[84px] shrink-0 sm:w-24">
        <FreeCover book={book} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div>
          <h4 className="font-semibold leading-snug">{book.title}</h4>
          <p className="text-xs text-foreground/60">
            {book.author}
            {book.pages ? ` · ${book.pages} págs.` : ''}
          </p>
          <p className="mt-1.5 text-sm leading-snug text-foreground/80">{book.why}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-700 dark:text-emerald-300">
            <Gift className="size-3" aria-hidden /> Grátis
          </span>
          {book.category === 'classico' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 font-semibold text-amber-700 dark:text-amber-300">
              <Award className="size-3" aria-hidden /> Clássico best-seller
            </span>
          )}
          {book.category === 'tecnica' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2 py-0.5 font-semibold text-sky-700 dark:text-sky-300">
              <Wrench className="size-3" aria-hidden /> Técnicas
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-medium text-foreground/70" title="Por que é legal baixar">
            <Scale className="size-3" aria-hidden /> {book.license}
          </span>
          <span className="text-foreground/55">Fonte: {book.source}</span>
          {book.needsSignup && (
            <span className="inline-flex items-center gap-1 text-foreground/55" title="O site pede um cadastro gratuito antes do download">
              <UserPlus className="size-3" aria-hidden /> pede cadastro grátis
            </span>
          )}
        </div>
        <StarRating itemKey={ratingKey('free', book.url)} label={book.title} />
        <a
          href={book.url}
          target="_blank"
          rel="noreferrer"
          className="mt-auto inline-flex h-9 w-fit items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          {book.kind === 'pdf' ? <Download className="size-4" aria-hidden /> : <ExternalLink className="size-4" aria-hidden />}
          {book.kind === 'pdf' ? 'Baixar PDF grátis' : 'Baixar grátis na fonte oficial'}
        </a>
      </div>
    </article>
  );
}
