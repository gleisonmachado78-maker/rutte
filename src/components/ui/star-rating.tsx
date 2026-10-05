import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRatings, useSetRating } from '@/hooks/use-data';
import { cn } from '@/lib/utils';

const LABELS = ['', 'Não gostei', 'Mais ou menos', 'Bom', 'Muito bom', 'Excelente'];

/** Chave da avaliação: tipo + id do item ("book:abc", "video:xyz", "prayer:salmo-23"). */
export type RatingKind = 'book' | 'free' | 'video' | 'prayer' | 'meditation' | 'podcast' | 'mentor';
export const ratingKey = (kind: RatingKind, id: string) => `${kind}:${id}`;

/** Lê a nota (0 = sem avaliação) de um item. */
export function useStars(key: string) {
  const { data = {} } = useRatings();
  return data[key]?.stars ?? 0;
}

/** Estrelas somente leitura (selo pequeno). */
export function StarsBadge({ stars, className }: { stars: number; className?: string }) {
  if (!stars) return null;
  return (
    <span className={cn('inline-flex items-center gap-0.5 rounded-full bg-amber-400/95 px-1.5 py-0.5 text-[11px] font-bold text-navy', className)} title={`Sua nota: ${stars} de 5`}>
      <Star className="size-3 fill-current" aria-hidden />
      {stars}
      <span className="sr-only"> de 5 estrelas</span>
    </span>
  );
}

/**
 * Avaliação do usuário: 1 a 5 estrelas + opinião curta opcional.
 * Clicar de novo na mesma estrela remove a nota.
 */
export function StarRating({ itemKey, label, withNote = true, className }: { itemKey: string; label: string; withNote?: boolean; className?: string }) {
  const { data = {} } = useRatings();
  const setRating = useSetRating();
  const current = data[itemKey];
  const stars = current?.stars ?? 0;
  const [hover, setHover] = useState(0);
  const [note, setNote] = useState(current?.note ?? '');
  const [editing, setEditing] = useState(false);

  useEffect(() => setNote(current?.note ?? ''), [current?.note]);

  const shown = hover || stars;
  const rate = (n: number) => setRating.mutate({ key: itemKey, stars: n === stars ? 0 : n, note: n === stars ? undefined : note });
  const saveNote = () => {
    setEditing(false);
    if (stars && note.trim() !== (current?.note ?? '')) setRating.mutate({ key: itemKey, stars, note });
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div role="radiogroup" aria-label={`Sua avaliação: ${label}`} className="flex" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={stars === n}
              aria-label={`${n} ${n === 1 ? 'estrela' : 'estrelas'} — ${LABELS[n]}`}
              onMouseEnter={() => setHover(n)}
              onClick={() => rate(n)}
              className="grid size-7 place-items-center rounded-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Star className={cn('size-[18px] transition-colors', n <= shown ? 'fill-amber-400 text-amber-400' : 'text-foreground/25')} aria-hidden />
            </button>
          ))}
        </div>
        <span className="text-xs text-foreground/55">{shown ? LABELS[shown] : 'Avalie'}</span>
        {withNote && stars > 0 && !editing && (
          <button type="button" onClick={() => setEditing(true)} className="text-xs font-medium text-primary hover:underline dark:text-neon">
            {current?.note ? 'Editar opinião' : '+ Sua opinião'}
          </button>
        )}
      </div>
      {withNote && stars > 0 && !editing && current?.note && <p className="text-xs italic leading-snug text-foreground/70">“{current.note}”</p>}
      {withNote && editing && (
        <input
          autoFocus
          value={note}
          maxLength={140}
          onChange={(e) => setNote(e.target.value)}
          onBlur={saveNote}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveNote();
            if (e.key === 'Escape') {
              setNote(current?.note ?? '');
              setEditing(false);
            }
          }}
          placeholder="O que achou? (até 140 caracteres)"
          aria-label="Sua opinião"
          className="h-8 w-full rounded-lg border border-border bg-background px-2.5 text-xs outline-none focus:ring-2 focus:ring-primary"
        />
      )}
    </div>
  );
}
