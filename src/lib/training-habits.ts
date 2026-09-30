import {
  Apple,
  BedDouble,
  CalendarClock,
  ChartLine,
  Droplets,
  Footprints,
  NotebookPen,
  Repeat2,
  Shirt,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { TrainingGoal } from '@/types';

export interface TrainingHabit {
  id: string;
  title: string;
  why: string;
  icon: LucideIcon;
  /** 'foco' = não sair da rotina · 'acelerar' = resultados mais rápidos */
  kind: 'foco' | 'acelerar';
  recurrence?: 'FREQ=DAILY' | 'FREQ=WEEKLY' | 'FREQ=MONTHLY';
  goals?: TrainingGoal[];
}

/** Boas práticas — orientações gerais, não substituem profissional de educação física/nutrição. */
export const TRAINING_HABITS: TrainingHabit[] = [
  // Foco / consistência
  { id: 'h_horario', kind: 'foco', icon: CalendarClock, title: 'Treinar sempre no mesmo horário', why: 'Horário fixo vira compromisso e reduz a decisão diária de “vou ou não vou”.', recurrence: 'FREQ=WEEKLY' },
  { id: 'h_roupa', kind: 'foco', icon: Shirt, title: 'Deixar a roupa e a garrafa prontas na noite anterior', why: 'Remove atrito: quanto menos passos, maior a chance de ir.', recurrence: 'FREQ=DAILY' },
  { id: 'h_2dias', kind: 'foco', icon: Repeat2, title: 'Regra dos 2 dias: nunca faltar dois treinos seguidos', why: 'Falhar um dia é normal; dois seguidos começa a quebrar o hábito.' },
  { id: 'h_registrar', kind: 'foco', icon: NotebookPen, title: 'Registrar todo treino aqui na Rutte', why: 'O que é medido melhora — e você enxerga o progresso nos gráficos.', recurrence: 'FREQ=DAILY' },
  { id: 'h_parceiro', kind: 'foco', icon: Users, title: 'Combinar treino com um parceiro 1× por semana', why: 'Compromisso social aumenta a frequência e a intensidade.', recurrence: 'FREQ=WEEKLY' },
  { id: 'h_meta', kind: 'foco', icon: Target, title: 'Definir uma meta de PR para o mês', why: 'Um alvo concreto (ex.: supino 80 kg) mantém a motivação alta.', recurrence: 'FREQ=MONTHLY' },

  // Acelerar resultados
  { id: 'h_progressao', kind: 'acelerar', icon: TrendingUp, title: 'Sobrecarga progressiva: subir a carga ao bater o topo das repetições', why: 'Quando fizer todas as séries no máximo da faixa, aumente 2,5–5 kg. É o principal motor de evolução.' },
  { id: 'h_sono', kind: 'acelerar', icon: BedDouble, title: 'Dormir 7 a 9 horas', why: 'O músculo se recupera e cresce durante o sono; dormir pouco reduz força e aumenta a fome.', recurrence: 'FREQ=DAILY' },
  { id: 'h_proteina', kind: 'acelerar', icon: Apple, title: 'Bater a meta de proteína do dia (≈1,6–2 g por kg)', why: 'Proteína suficiente é essencial para construir e preservar massa magra.', recurrence: 'FREQ=DAILY', goals: ['hipertrofia', 'forca', 'definicao', 'emagrecimento'] },
  { id: 'h_agua', kind: 'acelerar', icon: Droplets, title: 'Beber ~35 ml de água por kg de peso', why: 'Hidratação melhora desempenho e recuperação.', recurrence: 'FREQ=DAILY' },
  { id: 'h_passos', kind: 'acelerar', icon: Footprints, title: 'Caminhar 8 a 10 mil passos', why: 'Aumenta o gasto calórico diário sem atrapalhar a recuperação.', recurrence: 'FREQ=DAILY', goals: ['emagrecimento', 'definicao', 'condicionamento'] },
  { id: 'h_deficit', kind: 'acelerar', icon: Apple, title: 'Manter déficit calórico moderado (≈300–500 kcal)', why: 'Perda de gordura sustentável sem perder músculo.', recurrence: 'FREQ=DAILY', goals: ['emagrecimento', 'definicao'] },
  { id: 'h_superavit', kind: 'acelerar', icon: Apple, title: 'Comer um leve superávit calórico (≈200–300 kcal)', why: 'Energia extra para construir músculo com pouco ganho de gordura.', recurrence: 'FREQ=DAILY', goals: ['hipertrofia', 'forca'] },
  { id: 'h_deload', kind: 'acelerar', icon: ChartLine, title: 'Semana leve (deload) a cada 6–8 semanas', why: 'Reduzir volume por uma semana previne platôs e lesões.', recurrence: 'FREQ=MONTHLY', goals: ['hipertrofia', 'forca'] },
  { id: 'h_reavaliar', kind: 'acelerar', icon: Target, title: 'Refazer a pesquisa e fotos/medidas a cada 4 semanas', why: 'Ajustar o treino conforme o progresso evita estagnação.', recurrence: 'FREQ=MONTHLY' },
];

export const habitsFor = (goal: TrainingGoal) => TRAINING_HABITS.filter((h) => !h.goals || h.goals.includes(goal));
