export type Priority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export type TaskStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'BLOCKED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface TaskLink {
  id: string;
  title: string;
  url: string;
}

/** Extensão do contrato: arquivos anexados (guardados como data URL no localStorage). */
export interface TaskAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

export type HistoryType = 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'COMPLETED' | 'REOPENED';

/** Extensão do contrato: log de alterações da tarefa. */
export interface TaskHistoryEntry {
  id: string;
  type: HistoryType;
  message: string;
  at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  whatToDo?: string;
  howTo?: string;
  expectedResult?: string;
  status: TaskStatus;
  priority: Priority;
  startDate?: string;
  dueDate: string;
  deadlineTime?: string;
  recurrenceRule?: string; // ex: 'FREQ=WEEKLY'
  categoryId?: string;
  projectId?: string;
  /** Pessoal (atividades no seu CPF) ou Empresa (tarefas dentro da empresa) */
  scope: Scope;
  /** Área da Roda da Vida à qual o afazer contribui */
  lifeAreaId?: LifeAreaId;
  userId: string;
  meetingUrl?: string;
  /** onde é o compromisso */
  location?: TaskLocation;
  subtasks: Subtask[];
  links: TaskLink[];
  contactIds?: string[];
  attachments?: TaskAttachment[];
  history?: TaskHistoryEntry[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  scope?: Scope;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  scope?: Scope;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export type TaskInput = Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'completedAt' | 'history'>;

export type Scope = 'PERSONAL' | 'BUSINESS';

export type LifeAreaId =
  | 'saude'
  | 'emocional'
  | 'intelectual'
  | 'profissional'
  | 'financas'
  | 'relacionamentos'
  | 'familia'
  | 'social'
  | 'espiritualidade'
  | 'lazer';

/** Uma avaliação da Roda da Vida (nota 0–10 por área). */
export interface WheelAssessment {
  id: string;
  date: string;
  scores: Record<LifeAreaId, number>;
  note?: string;
}

/* ---------------------------------- Academia ---------------------------------- */

export type MuscleGroup =
  | 'peito'
  | 'costas'
  | 'pernas'
  | 'gluteos'
  | 'ombros'
  | 'biceps'
  | 'triceps'
  | 'abdomen'
  | 'panturrilha'
  | 'cardio';

export interface Exercise {
  id: string;
  name: string;
  muscle: MuscleGroup;
}

/** Exercício previsto no plano (séries × repetições alvo). */
export interface PlannedExercise {
  exerciseId: string;
  sets: number;
  reps: string; // ex: "10", "8-12"
}

/** Plano de um dia da semana (0 = domingo … 6 = sábado). */
export interface WorkoutDay {
  weekday: number;
  title: string; // ex: "Peito e tríceps" — vazio = descanso
  exercises: PlannedExercise[];
}

export interface WorkoutSet {
  reps: number;
  kg: number;
}

export interface WorkoutEntry {
  exerciseId: string;
  sets: WorkoutSet[];
}

/** Um treino realizado. */
export interface WorkoutSession {
  id: string;
  date: string; // yyyy-MM-dd
  title: string;
  entries: WorkoutEntry[];
  note?: string;
  durationMin?: number;
}

export type TrainingGoal = 'hipertrofia' | 'emagrecimento' | 'forca' | 'definicao' | 'condicionamento';
export type TrainingLevel = 'iniciante' | 'intermediario' | 'avancado';
export type TrainingPlace = 'academia' | 'halteres' | 'corpo';
export type Restriction = 'joelho' | 'lombar' | 'ombro';

/** Respostas do questionário do gerador de treino. */
export interface TrainingProfile {
  goal: TrainingGoal;
  level: TrainingLevel;
  weekdays: number[];
  minutes: 30 | 45 | 60 | 90;
  focus: MuscleGroup[];
  place: TrainingPlace;
  restrictions: Restriction[];
  preferredTime?: string;
  /** Peso atual (kg) e altura (cm) */
  weightKg?: number;
  heightCm?: number;
  updatedAt?: string;
}

/** Registro de peso corporal ao longo do tempo. */
export interface BodyEntry {
  date: string;
  weightKg: number;
}

export interface GymData {
  exercises: Exercise[];
  plan: WorkoutDay[];
  sessions: WorkoutSession[];
  profile?: TrainingProfile;
  bodyLog?: BodyEntry[];
}

/* ------------------------------- Personalização ------------------------------- */

export type Situation = 'clt' | 'empresa' | 'autonomo' | 'estudante' | 'casa';
export type GoalId =
  | 'rotina'
  | 'produtividade'
  | 'empresa'
  | 'saude'
  | 'emagrecer'
  | 'massa'
  | 'financas'
  | 'estudos'
  | 'familia'
  | 'fe'
  | 'mente';
export type Peak = 'manha' | 'tarde' | 'noite';
export type Struggle = 'procrastinacao' | 'esquecimento' | 'tempo' | 'motivacao' | 'sobrecarga';

/** Respostas da primeira conversa com a Rutte — adaptam o app a cada pessoa. */
export interface UserProfile {
  name: string;
  situations: Situation[];
  goals: GoalId[];
  peak: Peak;
  struggle: Struggle;
  modules: { business: boolean; gym: boolean; life: boolean };
  /** quando terminou (ou pulou) o tutorial de boas-vindas */
  tutorialDoneAt?: string;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------ Foco ------------------------------------ */

/** Um pomodoro (bloco de foco) concluído. */
export interface FocusSession {
  id: string;
  /** yyyy-MM-dd */
  date: string;
  startedAt: string;
  endedAt: string;
  minutes: number;
  /** o que foi feito (texto livre ou título do afazer) */
  activity: string;
  taskId?: string;
}

/** Local de um compromisso (preenchido pelo Google Places ou digitado). */
export interface TaskLocation {
  /** endereço legível */
  address: string;
  /** nome do lugar (ex.: "Shopping Ibirapuera"), quando vier do Google */
  name?: string;
  placeId?: string;
  lat?: number;
  lng?: number;
}

/* ---------------------------------- Gratidão ---------------------------------- */

/** Um dia do diário de gratidão: o que tenho (hoje), o que já tive e o que ainda terei. */
export interface GratitudeEntry {
  id: string;
  /** yyyy-MM-dd */
  date: string;
  present: string[];
  past: string;
  future: string;
  createdAt: string;
}

/* ------------------------------------ Notas ------------------------------------ */

export type NoteColor = 'padrao' | 'vermelho' | 'laranja' | 'amarelo' | 'verde' | 'azul' | 'roxo' | 'rosa';

/** Um bloco de notas (ex.: "Ideias", "Trabalho"), com várias caixas dentro. */
export interface Notebook {
  id: string;
  name: string;
  emoji: string;
  order: number;
  createdAt: string;
}

export interface NoteItem {
  id: string;
  text: string;
  done: boolean;
}

/** Uma caixa dentro do bloco: texto livre ou lista de itens marcáveis. */
export interface NoteBox {
  id: string;
  notebookId: string;
  title: string;
  kind: 'texto' | 'lista';
  text: string;
  items: NoteItem[];
  color: NoteColor;
  pinned: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
