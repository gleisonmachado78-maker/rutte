import { cn } from '@/lib/utils';

/** Assinatura de quem desenvolveu a Rutte. */
export function DevCredit({ className }: { className?: string }) {
  return (
    <p className={cn('text-[11px] tracking-wide text-white/40', className)}>
      by <span className="font-semibold text-white/65">era.</span> consultoria
    </p>
  );
}
