import type { NoteBox, NoteColor } from '@/types';
import { uid } from './utils';

/** Cores das caixas (classes literais para o Tailwind encontrar). */
export const NOTE_COLORS: { id: NoteColor; label: string; dot: string; card: string; bar?: string }[] = [
  { id: 'padrao', label: 'Padrão', dot: 'bg-foreground/25', card: 'bg-card border-border' },
  { id: 'vermelho', label: 'Vermelho', dot: 'bg-red-500', card: 'bg-red-100 border-red-300 dark:bg-red-500/[0.18] dark:border-red-500/50', bar: 'bg-red-500' },
  { id: 'laranja', label: 'Laranja', dot: 'bg-orange-500', card: 'bg-orange-100 border-orange-300 dark:bg-orange-500/[0.18] dark:border-orange-500/50', bar: 'bg-orange-500' },
  { id: 'amarelo', label: 'Amarelo', dot: 'bg-amber-400', card: 'bg-amber-100 border-amber-300 dark:bg-amber-400/[0.18] dark:border-amber-400/50', bar: 'bg-amber-400' },
  { id: 'verde', label: 'Verde', dot: 'bg-emerald-500', card: 'bg-emerald-100 border-emerald-300 dark:bg-emerald-500/[0.18] dark:border-emerald-500/50', bar: 'bg-emerald-500' },
  { id: 'azul', label: 'Azul', dot: 'bg-sky-500', card: 'bg-sky-100 border-sky-300 dark:bg-sky-500/[0.18] dark:border-sky-500/50', bar: 'bg-sky-500' },
  { id: 'roxo', label: 'Roxo', dot: 'bg-violet-500', card: 'bg-violet-100 border-violet-300 dark:bg-violet-500/[0.18] dark:border-violet-500/50', bar: 'bg-violet-500' },
  { id: 'rosa', label: 'Rosa', dot: 'bg-pink-500', card: 'bg-pink-100 border-pink-300 dark:bg-pink-500/[0.18] dark:border-pink-500/50', bar: 'bg-pink-500' },
];
export const NOTE_COLOR_BY_ID = Object.fromEntries(NOTE_COLORS.map((c) => [c.id, c])) as Record<NoteColor, (typeof NOTE_COLORS)[number]>;

export const NOTEBOOK_EMOJIS = ['🗒️', '💡', '💼', '📚', '🏠', '🛒', '🎯', '✈️', '💪', '🙏', '💰', '❤️', '🧠', '🎨', '🍳', '🎵'];

export function newNote(notebookId: string, data: Partial<NoteBox> = {}, order = -Date.now()): NoteBox {
  const now = new Date().toISOString();
  return { id: uid('nt'), notebookId, title: '', kind: 'texto', text: '', items: [], color: 'padrao', pinned: false, order, createdAt: now, updatedAt: now, ...data };
}

export const newItem = (text = '') => ({ id: uid('it'), text, done: false });

/** Texto simples da caixa (para copiar, buscar e virar afazer). */
export function noteToText(n: NoteBox) {
  const body = n.kind === 'lista' ? n.items.map((i) => `${i.done ? '☑' : '☐'} ${i.text}`).join('\n') : n.text;
  return [n.title, body].filter(Boolean).join('\n\n');
}
