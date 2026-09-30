/**
 * Personalização: opções da primeira conversa com a Rutte e as regras que
 * transformam as respostas em módulos, categorias, afazeres iniciais e dicas.
 */
import {
  Brain,
  Briefcase,
  Building,
  CalendarCheck,
  Church,
  Dumbbell,
  Flame,
  GraduationCap,
  HeartPulse,
  House,
  Rocket,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { Category, GoalId, LifeAreaId, Peak, Scope, Situation, Struggle, TrainingGoal, UserProfile } from '@/types';

export const SITUATIONS: Record<Situation, { label: string; desc: string; icon: LucideIcon }> = {
  clt: { label: 'Trabalho em uma empresa', desc: 'CLT, servidor ou contratado', icon: Briefcase },
  empresa: { label: 'Tenho uma empresa', desc: 'Sou dono(a) ou sócio(a)', icon: Building },
  autonomo: { label: 'Autônomo ou freelancer', desc: 'Atendo clientes por conta própria', icon: Rocket },
  estudante: { label: 'Estudo', desc: 'Faculdade, curso ou concurso', icon: GraduationCap },
  casa: { label: 'Cuido da casa e da família', desc: 'Rotina do lar, filhos, contas', icon: House },
};

export interface GoalDef {
  label: string;
  icon: LucideIcon;
  areas: LifeAreaId[];
  /** afazeres/hábitos sugeridos no início */
  starter: { title: string; recurrence?: string; scope?: Scope; category?: string }[];
  gym?: TrainingGoal;
  business?: boolean;
}

export const GOALS: Record<GoalId, GoalDef> = {
  rotina: {
    label: 'Organizar minha rotina', icon: CalendarCheck, areas: ['profissional', 'lazer'],
    starter: [
      { title: 'Planejar a semana', recurrence: 'FREQ=WEEKLY' },
      { title: 'Revisar os afazeres do dia', recurrence: 'FREQ=DAILY' },
    ],
  },
  produtividade: {
    label: 'Render mais no trabalho', icon: Briefcase, areas: ['profissional'],
    starter: [
      { title: 'Definir as 3 prioridades do dia', recurrence: 'FREQ=DAILY' },
      { title: 'Bloco de foco de 2 h sem celular', recurrence: 'FREQ=WEEKLY' },
    ],
  },
  empresa: {
    label: 'Fazer minha empresa crescer', icon: Building, areas: ['profissional', 'financas'], business: true,
    starter: [
      { title: 'Revisar os números da semana (vendas e caixa)', recurrence: 'FREQ=WEEKLY', scope: 'BUSINESS', category: 'Administrativo' },
      { title: 'Reunião de planejamento com a equipe', recurrence: 'FREQ=WEEKLY', scope: 'BUSINESS', category: 'Reuniões' },
    ],
  },
  saude: {
    label: 'Cuidar da saúde', icon: HeartPulse, areas: ['saude'], gym: 'condicionamento',
    starter: [
      { title: 'Caminhar 30 minutos', recurrence: 'FREQ=DAILY', category: 'Saúde' },
      { title: 'Beber 2 litros de água', recurrence: 'FREQ=DAILY', category: 'Saúde' },
    ],
  },
  emagrecer: {
    label: 'Emagrecer', icon: Flame, areas: ['saude'], gym: 'emagrecimento',
    starter: [
      { title: 'Treinar (plano da Academia)', recurrence: 'FREQ=DAILY', category: 'Academia' },
      { title: 'Registrar meu peso', recurrence: 'FREQ=WEEKLY', category: 'Saúde' },
    ],
  },
  massa: {
    label: 'Ganhar massa muscular', icon: Dumbbell, areas: ['saude'], gym: 'hipertrofia',
    starter: [
      { title: 'Treinar (plano da Academia)', recurrence: 'FREQ=DAILY', category: 'Academia' },
      { title: 'Bater a meta de proteína do dia', recurrence: 'FREQ=DAILY', category: 'Saúde' },
    ],
  },
  financas: {
    label: 'Organizar as finanças', icon: Wallet, areas: ['financas'],
    starter: [
      { title: 'Anotar os gastos do dia', recurrence: 'FREQ=DAILY', category: 'Despesas' },
      { title: 'Revisar o orçamento do mês', recurrence: 'FREQ=MONTHLY', category: 'Despesas' },
    ],
  },
  estudos: {
    label: 'Estudar e aprender', icon: GraduationCap, areas: ['intelectual'],
    starter: [
      { title: 'Estudar 25 minutos (Pomodoro)', recurrence: 'FREQ=DAILY', category: 'Estudos' },
      { title: 'Ler 10 páginas', recurrence: 'FREQ=DAILY', category: 'Estudos' },
    ],
  },
  familia: {
    label: 'Mais tempo com família e amor', icon: Users, areas: ['familia', 'relacionamentos'],
    starter: [
      { title: 'Refeição em família sem telas', recurrence: 'FREQ=WEEKLY', category: 'Casa' },
      { title: 'Mensagem carinhosa para quem eu amo', recurrence: 'FREQ=DAILY' },
    ],
  },
  fe: {
    label: 'Fortalecer a fé', icon: Church, areas: ['espiritualidade'],
    starter: [
      { title: 'Oração ou devocional (10 min)', recurrence: 'FREQ=DAILY', category: 'Igreja' },
      { title: 'Culto ou missa', recurrence: 'FREQ=WEEKLY', category: 'Igreja' },
    ],
  },
  mente: {
    label: 'Reduzir estresse e ansiedade', icon: Brain, areas: ['emocional'],
    starter: [
      { title: 'Respiração guiada (5 min)', recurrence: 'FREQ=DAILY' },
      { title: 'Escrever 3 gratidões', recurrence: 'FREQ=DAILY' },
    ],
  },
};

export const PEAKS: Record<Peak, { label: string; desc: string; time: string }> = {
  manha: { label: 'De manhã', desc: 'Acordo cedo e rendo mais cedo', time: '07:00' },
  tarde: { label: 'À tarde', desc: 'Pego no tranco depois do almoço', time: '14:00' },
  noite: { label: 'À noite', desc: 'Minha cabeça funciona melhor à noite', time: '20:00' },
};

export const STRUGGLES: Record<Struggle, { label: string; tips: string[] }> = {
  procrastinacao: {
    label: 'Deixo tudo para depois',
    tips: [
      'Comece pela menor tarefa da lista: terminar algo em 2 minutos destrava o resto do dia.',
      'Use 25 minutos de foco e 5 de pausa. Só comprometa-se com o primeiro bloco.',
      'Quebre o afazer grande em subtarefas; a primeira deve levar menos de 10 minutos.',
      'Faça a tarefa que você mais está evitando antes de abrir o WhatsApp.',
    ],
  },
  esquecimento: {
    label: 'Esqueço compromissos',
    tips: [
      'Coloque horário em todo afazer importante — assim ele aparece na sua agenda de hoje.',
      'Antes de dormir, confira o calendário de amanhã (2 minutos).',
      'Tarefas que se repetem? Marque a recorrência e a Rutte recria sozinha.',
      'Anote na hora: se lembrou de algo, toque em “Novo afazer” antes de esquecer.',
    ],
  },
  tempo: {
    label: 'Falta tempo',
    tips: [
      'Escolha só 3 prioridades para hoje. O resto é bônus.',
      'Agrupe tarefas parecidas (ligações, e-mails, compras) em um único bloco.',
      'Diga “não” para uma coisa pequena hoje e proteja 30 minutos para você.',
      'Veja no calendário onde estão os buracos da semana e encaixe o que importa.',
    ],
  },
  motivacao: {
    label: 'Perco a motivação',
    tips: [
      'Olhe para a sua Roda da Vida: escolha uma área e dê um passo pequeno nela hoje.',
      'Marque como concluído o que já fez — ver o progresso gera vontade de continuar.',
      'Combine um compromisso com alguém: é mais fácil cumprir o que foi prometido.',
      'Lembre do porquê: escreva na tarefa o resultado esperado e o que muda na sua vida.',
    ],
  },
  sobrecarga: {
    label: 'Tenho coisas demais',
    tips: [
      'Filtre por “Hoje” e esconda o resto. Uma lista curta acalma a cabeça.',
      'Delegue ou cancele ao menos um afazer de prioridade baixa esta semana.',
      'Separe o que é Pessoal do que é Empresa para não misturar as preocupações.',
      'Se algo está parado há semanas, decida: fazer, agendar ou apagar.',
    ],
  },
};

export const MAX_GOALS = 3;

/** Sugestões automáticas de módulos a partir das respostas. */
export function suggestedModules(situations: Situation[], goals: GoalId[]): UserProfile['modules'] {
  return {
    business: situations.includes('empresa') || situations.includes('autonomo') || goals.includes('empresa'),
    gym: goals.some((g) => GOALS[g].gym) || goals.includes('saude'),
    life: true,
  };
}

/** Áreas da Roda da Vida ligadas aos objetivos (sem repetir). */
export const focusAreas = (goals: GoalId[]) => [...new Set(goals.flatMap((g) => GOALS[g].areas))];

/** Objetivo de treino sugerido pelo perfil. */
export const gymGoalFor = (goals: GoalId[]): TrainingGoal | undefined => goals.map((g) => GOALS[g].gym).find(Boolean);

const CAT = (id: string, name: string, color: string, scope: Scope): Category => ({ id, name, color, scope });

/** Categorias iniciais conforme o momento de vida e os objetivos. */
export function categoriesFor(p: Pick<UserProfile, 'situations' | 'goals' | 'modules'>): Category[] {
  const cats: Category[] = [CAT('cat_despesas', 'Despesas', '#D97706', 'PERSONAL'), CAT('cat_casa', 'Casa', '#059669', 'PERSONAL')];
  const has = (g: GoalId) => p.goals.includes(g);
  if (p.modules.gym) cats.push(CAT('cat_academia', 'Academia', '#DC2626', 'PERSONAL'));
  if (has('saude') || has('emagrecer') || has('massa')) cats.push(CAT('cat_saude', 'Saúde', '#E11D48', 'PERSONAL'));
  if (p.situations.includes('estudante') || has('estudos')) cats.push(CAT('cat_estudos', 'Estudos', '#7C3AED', 'PERSONAL'));
  if (has('fe')) cats.push(CAT('cat_igreja', 'Igreja', '#9333EA', 'PERSONAL'));
  if (p.situations.includes('clt')) cats.push(CAT('cat_trabalho', 'Trabalho', '#2563EB', 'PERSONAL'));
  if (p.modules.business) {
    cats.push(
      CAT('cat_reunioes', 'Reuniões', '#2563EB', 'BUSINESS'),
      CAT('cat_comercial', 'Comercial', '#0891B2', 'BUSINESS'),
      CAT('cat_admin', 'Administrativo', '#475569', 'BUSINESS'),
    );
  }
  return cats;
}

export interface StarterTask {
  key: string;
  title: string;
  recurrence?: string;
  scope: Scope;
  categoryName?: string;
  lifeAreaId?: LifeAreaId;
  goal: GoalId;
}

/** Afazeres iniciais sugeridos pelos objetivos (o usuário escolhe quais aceitar). */
export function starterTasks(goals: GoalId[], modules: UserProfile['modules']): StarterTask[] {
  const seen = new Set<string>();
  const out: StarterTask[] = [];
  for (const g of goals) {
    const def = GOALS[g];
    for (const s of def.starter) {
      if (seen.has(s.title)) continue;
      if (s.scope === 'BUSINESS' && !modules.business) continue;
      if (s.category === 'Academia' && !modules.gym) continue;
      seen.add(s.title);
      out.push({ key: `${g}:${s.title}`, title: s.title, recurrence: s.recurrence, scope: s.scope ?? 'PERSONAL', categoryName: s.category, lifeAreaId: def.areas[0], goal: g });
    }
  }
  return out;
}

/** Dica do dia (muda a cada dia, conforme a maior dificuldade da pessoa). */
export function tipOfTheDay(struggle: Struggle, date = new Date()) {
  const tips = STRUGGLES[struggle].tips;
  const day = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86_400_000);
  return tips[day % tips.length];
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? '';
