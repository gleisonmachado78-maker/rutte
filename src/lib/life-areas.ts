import {
  BookOpen,
  Brain,
  Briefcase,
  Church,
  HeartHandshake,
  HeartPulse,
  House,
  TreePalm,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { LifeAreaId } from '@/types';

export interface LifeArea {
  id: LifeAreaId;
  name: string;
  short: string;
  icon: LucideIcon;
  color: string;
  /** Pergunta-guia para dar a nota */
  question: string;
}

/** Áreas da Roda da Vida. As cores são de apoio (não substituem a paleta da marca) e sempre vêm com ícone + nome. */
export const LIFE_AREAS: LifeArea[] = [
  { id: 'saude', name: 'Saúde & Bem-estar', short: 'Saúde', icon: HeartPulse, color: '#DC2626', question: 'Como estão seu corpo, sono, alimentação e exercícios?' },
  { id: 'emocional', name: 'Equilíbrio Emocional', short: 'Emocional', icon: Brain, color: '#DB2777', question: 'Você lida bem com estresse, ansiedade e emoções?' },
  { id: 'intelectual', name: 'Desenvolvimento Intelectual', short: 'Intelectual', icon: BookOpen, color: '#7C3AED', question: 'Está aprendendo, lendo e evoluindo?' },
  { id: 'profissional', name: 'Carreira & Profissional', short: 'Profissional', icon: Briefcase, color: '#2563EB', question: 'Está satisfeito com seu trabalho e crescimento?' },
  { id: 'financas', name: 'Finanças', short: 'Finanças', icon: Wallet, color: '#059669', question: 'Suas contas, reservas e investimentos estão em ordem?' },
  { id: 'relacionamentos', name: 'Relacionamento Amoroso', short: 'Relacionamento', icon: HeartHandshake, color: '#E11D48', question: 'Como está a relação com seu par (ou consigo)?' },
  { id: 'familia', name: 'Família', short: 'Família', icon: House, color: '#D97706', question: 'Você tem tempo de qualidade com sua família?' },
  { id: 'social', name: 'Vida Social', short: 'Social', icon: Users, color: '#0891B2', question: 'Suas amizades e conexões estão nutridas?' },
  { id: 'espiritualidade', name: 'Espiritualidade', short: 'Espiritualidade', icon: Church, color: '#9333EA', question: 'Você se sente conectado à sua fé e propósito?' },
  { id: 'lazer', name: 'Lazer & Diversão', short: 'Lazer', icon: TreePalm, color: '#65A30D', question: 'Você descansa e faz coisas de que gosta?' },
];

export const LIFE_AREA_BY_ID = Object.fromEntries(LIFE_AREAS.map((a) => [a.id, a])) as Record<LifeAreaId, LifeArea>;

export const emptyScores = () =>
  Object.fromEntries(LIFE_AREAS.map((a) => [a.id, 5])) as Record<LifeAreaId, number>;

export interface LifeTip {
  title: string;
  /** Recorrência sugerida (RRULE simples) */
  recurrence?: 'FREQ=DAILY' | 'FREQ=WEEKLY' | 'FREQ=MONTHLY';
}

/** Dicas de atividades para desenvolver cada área (sugestões — o usuário adapta). */
export const LIFE_TIPS: Record<LifeAreaId, LifeTip[]> = {
  saude: [
    { title: 'Caminhar 30 minutos', recurrence: 'FREQ=DAILY' },
    { title: 'Beber 2 litros de água', recurrence: 'FREQ=DAILY' },
    { title: 'Dormir antes das 23h (sem celular na cama)', recurrence: 'FREQ=DAILY' },
    { title: 'Agendar check-up e exames de rotina' },
    { title: 'Planejar as refeições da semana', recurrence: 'FREQ=WEEKLY' },
    { title: 'Alongar 10 minutos ao acordar', recurrence: 'FREQ=DAILY' },
  ],
  emocional: [
    { title: 'Escrever 3 coisas pelas quais sou grato', recurrence: 'FREQ=DAILY' },
    { title: 'Respiração 4-7-8 por 5 minutos', recurrence: 'FREQ=DAILY' },
    { title: 'Diário: como me senti hoje e por quê', recurrence: 'FREQ=DAILY' },
    { title: 'Desconectar das redes por 1 hora', recurrence: 'FREQ=DAILY' },
    { title: 'Conversar com alguém de confiança sobre o que me preocupa' },
    { title: 'Pesquisar/agendar sessão de terapia' },
  ],
  intelectual: [
    { title: 'Ler 10 páginas de um livro', recurrence: 'FREQ=DAILY' },
    { title: 'Escolher o próximo livro do mês', recurrence: 'FREQ=MONTHLY' },
    { title: 'Estudar 25 min (técnica Pomodoro)', recurrence: 'FREQ=DAILY' },
    { title: 'Assistir a uma aula ou documentário', recurrence: 'FREQ=WEEKLY' },
    { title: 'Anotar um aprendizado da semana', recurrence: 'FREQ=WEEKLY' },
    { title: 'Praticar um idioma por 15 minutos', recurrence: 'FREQ=DAILY' },
  ],
  profissional: [
    { title: 'Definir as 3 prioridades do dia', recurrence: 'FREQ=DAILY' },
    { title: 'Atualizar currículo e LinkedIn' },
    { title: 'Revisar metas do trimestre', recurrence: 'FREQ=MONTHLY' },
    { title: 'Fazer um curso da minha área' },
    { title: 'Pedir feedback ao gestor ou a um colega' },
    { title: 'Bloquear 2h de foco sem interrupções', recurrence: 'FREQ=WEEKLY' },
  ],
  financas: [
    { title: 'Anotar todos os gastos do dia', recurrence: 'FREQ=DAILY' },
    { title: 'Revisar o orçamento do mês', recurrence: 'FREQ=MONTHLY' },
    { title: 'Separar 10% da renda para a reserva de emergência', recurrence: 'FREQ=MONTHLY' },
    { title: 'Cancelar assinaturas que não uso' },
    { title: 'Listar dívidas e montar plano de quitação' },
    { title: 'Estudar um investimento por 20 minutos', recurrence: 'FREQ=WEEKLY' },
  ],
  relacionamentos: [
    { title: 'Noite a dois sem celular', recurrence: 'FREQ=WEEKLY' },
    { title: 'Mandar uma mensagem carinhosa sem motivo', recurrence: 'FREQ=DAILY' },
    { title: 'Planejar um passeio ou viagem juntos' },
    { title: 'Conversa sobre planos e sonhos do casal', recurrence: 'FREQ=MONTHLY' },
    { title: 'Fazer algo que meu par gosta' },
  ],
  familia: [
    { title: 'Ligar para meus pais', recurrence: 'FREQ=WEEKLY' },
    { title: 'Refeição em família sem telas', recurrence: 'FREQ=WEEKLY' },
    { title: 'Brincar/conversar 20 min com os filhos', recurrence: 'FREQ=DAILY' },
    { title: 'Organizar um almoço de domingo em família', recurrence: 'FREQ=MONTHLY' },
    { title: 'Lembrar datas importantes (aniversários) no calendário' },
  ],
  social: [
    { title: 'Mandar mensagem para um amigo que não vejo há tempo', recurrence: 'FREQ=WEEKLY' },
    { title: 'Marcar um café com um amigo' },
    { title: 'Participar de um grupo ou evento novo', recurrence: 'FREQ=MONTHLY' },
    { title: 'Fazer um trabalho voluntário' },
    { title: 'Elogiar alguém de forma sincera', recurrence: 'FREQ=DAILY' },
  ],
  espiritualidade: [
    { title: 'Oração ou meditação de 10 minutos', recurrence: 'FREQ=DAILY' },
    { title: 'Leitura devocional', recurrence: 'FREQ=DAILY' },
    { title: 'Ir ao culto/missa', recurrence: 'FREQ=WEEKLY' },
    { title: 'Momento de silêncio e reflexão sobre propósito', recurrence: 'FREQ=WEEKLY' },
    { title: 'Participar de um grupo de estudo ou pequeno grupo', recurrence: 'FREQ=WEEKLY' },
  ],
  lazer: [
    { title: 'Reservar 1 hora para um hobby', recurrence: 'FREQ=WEEKLY' },
    { title: 'Passeio ao ar livre no fim de semana', recurrence: 'FREQ=WEEKLY' },
    { title: 'Assistir a um filme sem culpa' },
    { title: 'Planejar as próximas férias' },
    { title: 'Aprender algo só por diversão (instrumento, desenho…)' },
    { title: 'Tarde sem compromissos', recurrence: 'FREQ=MONTHLY' },
  ],
};
