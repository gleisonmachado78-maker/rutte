import logoUrl from '@/assets/rutte-logo.png';
import { cn } from '@/lib/utils';

/**
 * Logo da Rutte em PNG de alta resolução (public/rutte-logo.png, gerado por `npm run logo`):
 * traço vermelho da marca sobre oval branco. `glow` adiciona o brilho neon.
 */
export function RutteLogo({
  className,
  glow = false,
  title = 'Rutte',
}: {
  className?: string;
  glow?: boolean;
  title?: string;
}) {
  return (
    <img
      src={logoUrl}
      alt={title}
      width={1108}
      height={1024}
      draggable={false}
      className={cn('h-auto shrink-0 select-none object-contain', glow && 'logo-glow', className)}
    />
  );
}

export const BRAND = {
  name: 'Rutte',
  tagline: 'Sua secretária digital',
};
