import type { NoteBox, NoteColor } from '@/types';
import { uid } from './utils';

/** Cores das caixas (classes literais para o Tailwind encontrar). */
export const NOTE_COLORS: { id: NoteColor; label: string; dot: string; card: string }[] = [
  { id: 'padrao', label: 'Padrão', dot: 'bg-foreground/25', card: 'bg-card border-border' },
  { id: 'vermelho', label: 'Vermelho', dot: 'bg-red-500', card: 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30' },
  { id: 'laranja', label: 'Laranja', dot: 'bg-orange-500', card: 'bg-orange-50 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/30' },
  { id: 'amarelo', label: 'Amarelo', dot: 'bg-amber-400', card: 'bg-amber-50 border-amber-200 dark:bg-amber-400/10 dark:border-amber-400/30' },
  { id: 'verde', label: 'Verde', dot: 'bg-emerald-500', card: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30' },
  { id: 'azul', label: 'Azul', dot: 'bg-sky-500', card: 'bg-sky-50 border-sky-200 dark:bg-sky-500/10 dark:border-sky-500/30' },
  { id: 'roxo', label: 'Roxo', dot: 'bg-violet-500', card: 'bg-violet-50 border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/30' },
  { id: 'rosa', label: 'Rosa', dot: 'bg-pink-500', card: 'bg-pink-50 border-pink-200 dark:bg-pink-500/10 dark:border-pink-500/30' },
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
