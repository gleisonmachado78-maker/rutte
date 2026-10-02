import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ApiMessage, PersonaId } from '@/lib/ai';

/** Item mostrado na conversa (o histórico da API fica junto, para continuar o assunto). */
export interface ChatItem {
  id: string;
  kind: 'user' | 'assistant' | 'tool' | 'error';
  text: string;
  ok?: boolean;
  at: string;
}

interface ChatState {
  items: ChatItem[];
  history: ApiMessage[];
  persona: PersonaId;
  setPersona: (p: PersonaId) => void;
  push: (item: Omit<ChatItem, 'id' | 'at'>) => string;
  patch: (id: string, text: string) => void;
  remove: (id: string) => void;
  addHistory: (msgs: ApiMessage[]) => void;
  clear: () => void;
}

const MAX_HISTORY = 30;

export const useChat = create<ChatState>()(
  persist(
    (set) => ({
      items: [],
      history: [],
      persona: 'motivadora',
      setPersona: (persona) => set({ persona }),
      push: (item) => {
        const id = `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
        set((s) => ({ items: [...s.items, { ...item, id, at: new Date().toISOString() }].slice(-120) }));
        return id;
      },
      patch: (id, text) => set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, text } : i)) })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      addHistory: (msgs) =>
        set((s) => {
          let h = [...s.history, ...msgs];
          // Mantém as últimas mensagens, sempre começando por uma fala da pessoa (exigência da API)
          if (h.length > MAX_HISTORY) {
            h = h.slice(-MAX_HISTORY);
            while (h.length && !(h[0].role === 'user' && h[0].content.some((b) => b.type === 'text'))) h.shift();
          }
          return { history: h };
        }),
      clear: () => set({ items: [], history: [] }),
    }),
    { name: 'rutte:chat', version: 1 },
  ),
);
