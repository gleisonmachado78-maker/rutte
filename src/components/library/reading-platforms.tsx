import { ExternalLink, Library } from 'lucide-react';
import { READING_PLATFORMS } from '@/lib/reading-platforms';
import { HIGHLIGHT_CARD } from '@/components/library/highlight';
import { cn } from '@/lib/utils';

/** Onde ler best-sellers atuais sem pagar, de forma legal (bibliotecas digitais e testes grátis). */
export function ReadingPlatforms() {
  if (!READING_PLATFORMS.length) return null;
  return (
    <section aria-labelledby="platforms-title" className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5">
      <h2 id="platforms-title" className="flex items-center gap-2 font-bold">
        <Library className="size-5 text-emerald-600 dark:text-emerald-400" aria-hidden /> Leia best-sellers de graça, de forma legal
      </h2>
      <p className="mt-1 text-sm text-foreground/65">
        Os best-sellers recentes têm direitos autorais e não podem ser baixados de graça em PDF. Mas dá para lê-los sem pagar por estes caminhos oficiais:
      </p>
      <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
        {READING_PLATFORMS.map((p) => (
          <li key={p.name} className={cn(HIGHLIGHT_CARD, 'flex flex-col gap-1 p-3 pl-4')}>
            <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline dark:text-neon">
              {p.name} <ExternalLink className="size-3.5" aria-hidden />
            </a>
            <p className="text-sm leading-snug text-foreground/80">{p.what}</p>
            <p className="text-xs text-foreground/60">
              <span className="font-semibold">Como funciona:</span> {p.condition}
            </p>
            {p.bestSellersExamples && (
              <p className="text-xs text-foreground/60">
                <span className="font-semibold">Exemplos:</span> {p.bestSellersExamples}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
