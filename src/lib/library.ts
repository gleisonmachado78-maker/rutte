import {
  Brain,
  Church,
  Crown,
  HeartHandshake,
  HeartPulse,
  Mic,
  PartyPopper,
  Sprout,
  Timer,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { LifeAreaId } from '@/types';

export type TopicId =
  | 'emocional'
  | 'financas'
  | 'desenvolvimento'
  | 'oratoria'
  | 'lideranca'
  | 'produtividade'
  | 'relacionamentos'
  | 'proposito'
  | 'saude'
  | 'lazer';

export interface Topic {
  id: TopicId;
  label: string;
  icon: LucideIcon;
  color: string;
  /** áreas da Roda da Vida cujos vídeos entram neste tema */
  videoAreas: LifeAreaId[];
}

/** Temas da Biblioteca (livros e vídeos). Cores são de apoio e sempre vêm com ícone + nome. */
export const TOPICS: Topic[] = [
  { id: 'emocional', label: 'Inteligência emocional', icon: Brain, color: '#DB2777', videoAreas: ['emocional'] },
  { id: 'financas', label: 'Finanças', icon: Wallet, color: '#059669', videoAreas: ['financas'] },
  { id: 'desenvolvimento', label: 'Desenvolvimento pessoal', icon: Sprout, color: '#7C3AED', videoAreas: ['intelectual'] },
  { id: 'oratoria', label: 'Oratória e comunicação', icon: Mic, color: '#0891B2', videoAreas: ['social'] },
  { id: 'lideranca', label: 'Liderança', icon: Crown, color: '#D97706', videoAreas: [] },
  { id: 'produtividade', label: 'Produtividade e foco', icon: Timer, color: '#2563EB', videoAreas: ['profissional'] },
  { id: 'relacionamentos', label: 'Relacionamentos e família', icon: HeartHandshake, color: '#E11D48', videoAreas: ['relacionamentos', 'familia'] },
  { id: 'proposito', label: 'Propósito e espiritualidade', icon: Church, color: '#9333EA', videoAreas: ['espiritualidade'] },
  { id: 'saude', label: 'Saúde e bem-estar', icon: HeartPulse, color: '#DC2626', videoAreas: ['saude'] },
  { id: 'lazer', label: 'Felicidade e lazer', icon: PartyPopper, color: '#65A30D', videoAreas: ['lazer'] },
];

export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((t) => [t.id, t])) as Record<TopicId, Topic>;

/** Tema de vídeos correspondente a uma área da Roda da Vida. */
export const topicForArea = (area: LifeAreaId): TopicId | undefined => TOPICS.find((t) => t.videoAreas.includes(area))?.id;

export type ShelfStatus = 'quero' | 'lendo' | 'lido';
export const SHELF_LABEL: Record<ShelfStatus, string> = { quero: 'Quero ler', lendo: 'Lendo', lido: 'Lido' };

export interface Book {
  topic: TopicId;
  googleId: string;
  title: string;
  author: string;
  publisher: string;
  year: string;
  isbn13: string;
  pages: number;
  why: string;
}

export const coverUrl = (googleId: string) =>
  `https://books.google.com/books/content?id=${googleId}&printsec=frontcover&img=1&zoom=1`;

const q = (s: string) => encodeURIComponent(s);

/** Onde encontrar: lojas e acervos (links de busca, sempre válidos). */
export function whereToFind(b: Book) {
  const key = b.isbn13 || `${b.title.split(': ')[0]} ${b.author}`;
  return [
    { label: 'Amazon', href: `https://www.amazon.com.br/s?k=${q(key)}&i=stripbooks` },
    { label: 'Estante Virtual', hint: 'usados', href: `https://www.estantevirtual.com.br/busca?q=${q(`${b.title.split(': ')[0]} ${b.author.split(',')[0]}`)}` },
    { label: 'Google Livros', hint: 'prévia', href: `https://books.google.com.br/books?id=${b.googleId}` },
  ];
}
