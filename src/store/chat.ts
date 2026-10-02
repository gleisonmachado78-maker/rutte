import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ApiMessage, PersonaId, WebSource } from '@/lib/ai';
import type { ChatImage } from '@/lib/ai-image';
import type { Report } from '@/lib/reports';

/** Item mostrado na conversa (o histórico da API fica junto, para continuar o assunto). */
export interface ChatItem {
  id: string;
  kind: 'user' | 'assistant' | 'tool' | 'error' | 'search' | 'report' | 'image';
  text: string;
  ok?: boolean;
  /** fontes da pesquisa na web usadas nesta resposta */
  sources?: WebSource[];
  report?: Report;
  image?: ChatImage;
  at: string;
}

interface ChatState {
  items: ChatItem[];
  history: ApiMessage[];
  persona: PersonaId;
  setPersona: (p: PersonaId) => void;
  push: (item: Omit<ChatItem, 'id' | 'at'>) => string;
  patch: (id: string, text: string) => void;
  update: (id: string, data: Partial<ChatItem>) => void;
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
      update: (id, data) => set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...data } : i)) })),
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
    {
      name: 'rutte:chat',
      version: 1,
      // fotos pesam: guarda só as 6 últimas imagens grandes (as outras ficam como aviso)
      partialize: (s) => {
        let big = 0;
        const items = [...s.items].reverse().map((i) => {
          if (!i.image || i.image.src.length < 250_000) return i;
          big++;
          return big <= 6 ? i : { ...i, image: undefined, text: 'Imagem antiga (não guardada no aparelho)' };
        });
        return { items: items.reverse(), history: s.history, persona: s.persona };
      },
    },
  ),
);
