/** Fontes das notas. As extras (Google Fonts) só são baixadas quando as Notas abrem. */
import type { CSSProperties } from 'react';
import type { NoteFont } from '@/types';

export type { NoteFont };

export const NOTE_FONTS: { id: NoteFont; label: string; family: string; scale?: number }[] = [
  { id: 'padrao', label: 'Padrão', family: '"Plus Jakarta Sans", system-ui, sans-serif' },
  { id: 'classica', label: 'Clássica', family: 'Fraunces, Georgia, serif' },
  { id: 'serifada', label: 'Serifada', family: 'Lora, Georgia, serif' },
  { id: 'elegante', label: 'Elegante', family: '"Playfair Display", Georgia, serif' },
  { id: 'manuscrita', label: 'Manuscrita', family: 'Caveat, "Segoe Print", cursive', scale: 1.3 },
  { id: 'arredondada', label: 'Arredondada', family: 'Nunito, system-ui, sans-serif' },
  { id: 'mono', label: 'Máquina de escrever', family: '"JetBrains Mono", ui-monospace, Consolas, monospace', scale: 0.92 },
];
export const NOTE_FONT_BY_ID = Object.fromEntries(NOTE_FONTS.map((f) => [f.id, f])) as Record<NoteFont, (typeof NOTE_FONTS)[number]>;

/** Estilo do texto da nota para a fonte escolhida. */
export const noteFontStyle = (font?: NoteFont): CSSProperties => {
  const f = NOTE_FONT_BY_ID[font ?? 'padrao'] ?? NOTE_FONTS[0];
  return f.id === 'padrao' ? {} : { fontFamily: f.family, fontSize: f.scale ? `${f.scale}em` : undefined };
};

let loaded = false;
/** Baixa as fontes extras uma única vez (não pesa na abertura do app). */
export function ensureNoteFonts() {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=JetBrains+Mono:wght@400;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;700&family=Playfair+Display:wght@400;700&display=swap';
  document.head.appendChild(link);
}
