/**
 * Mock API sobre localStorage. Todas as funções são assíncronas para que a troca
 * por um backend real (REST/Supabase) mantenha o mesmo contrato usado pelo React Query.
 */
import type {
  Category,
  Contact,
  Exercise,
  FocusSession,
  GratitudeEntry,
  GymData,
  Project,
  Task,
  TaskHistoryEntry,
  TaskInput,
  WheelAssessment,
  WorkoutDay,
  TrainingGoal,
  TrainingProfile,
  UserProfile,
  WorkoutSession,
} from '@/types';
import { nextOccurrence, STATUS_LABEL } from '@/lib/task-utils';
import { uid } from '@/lib/utils';
import { createSeed, migrate, USER_ID, type Database } from './seed';
import { categoriesFor, type StarterTask } from '@/lib/onboarding';

const STORAGE_KEY = 'secretaria:db:v1';
const LATENCY = 120;

let memory: Database | null = null;

function load(): Database {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Database;
      memory = migrate(parsed);
      if (memory !== parsed) persist();
      return memory;
    }
  } catch {
    /* localStorage indisponível ou corrompido: recomeça do seed */
  }
  memory = createSeed();
  persist();
  return memory;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch (err) {
    throw new Error(
      err instanceof DOMException && err.name === 'QuotaExceededError'
        ? 'Armazenamento local cheio. Remova anexos grandes.'
        : 'Não foi possível salvar os dados localmente.',
    );
  }
}

const delay = <T,>(value: T) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(structuredClone(value)), LATENCY));

const entry = (type: TaskHistoryEntry['type'], message: string): TaskHistoryEntry => ({
  id: uid('h'),
  type,
  message,
  at: new Date().toISOString(),
});

const FIELD_LABELS: Partial<Record<keyof Task, string>> = {
  title: 'título',
  priority: 'prioridade',
  dueDate: 'prazo',
  deadlineTime: 'horário',
  categoryId: 'categoria',
  projectId: 'projeto',
  whatToDo: 'o que fazer',
  howTo: 'como fazer',
  expectedResult: 'resultado esperado',
  description: 'descrição',
  subtasks: 'subtarefas',
  links: 'links',
  contactIds: 'pessoas',
  meetingUrl: 'link de reunião',
  location: 'local',
  attachments: 'anexos',
  recurrenceRule: 'recorrência',
  startDate: 'início',
  scope: 'escopo (pessoal/empresa)',
  lifeAreaId: 'área da vida',
};

/** undefined, '' e [] contam como "vazio" para não registrar alterações fantasmas. */
const norm = (v: unknown) =>
  JSON.stringify(v === '' || (Array.isArray(v) && v.length === 0) ? null : (v ?? null));

function diffFields(prev: Task, next: Partial<Task>) {
  return (Object.keys(FIELD_LABELS) as (keyof Task)[]).filter(
    (k) => k in next && norm(prev[k]) !== norm(next[k]),
  );
}

export const api = {
  async listTasks(): Promise<Task[]> {
    return delay(load().tasks);
  },

  async getTask(id: string): Promise<Task | undefined> {
    return delay(load().tasks.find((t) => t.id === id));
  },

  async createTask(input: TaskInput): Promise<Task> {
    const db = load();
    const now = new Date().toISOString();
    const task: Task = {
      ...input,
      id: uid('tsk'),
      userId: USER_ID,
      createdAt: now,
      updatedAt: now,
      completedAt: input.status === 'COMPLETED' ? now : undefined,
      history: [entry('CREATED', 'Tarefa criada')],
    };
    db.tasks.unshift(task);
    persist();
    return delay(task);
  },

  /** Atualiza a tarefa registrando histórico. Ao concluir uma tarefa recorrente, gera a próxima ocorrência. */
  async updateTask(
    id: string,
    patch: Partial<TaskInput>,
  ): Promise<{ task: Task; spawned?: Task }> {
    const db = load();
    const idx = db.tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Tarefa não encontrada');
    const prev = db.tasks[idx];
    const now = new Date().toISOString();
    const history = [...(prev.history ?? [])];

    const changed = diffFields(prev, patch);
    if (changed.length) {
      history.push(entry('UPDATED', `Editou ${changed.map((k) => FIELD_LABELS[k]).join(', ')}`));
    }

    let completedAt = prev.completedAt;
    if (patch.status && patch.status !== prev.status) {
      if (patch.status === 'COMPLETED') {
        completedAt = now;
        history.push(entry('COMPLETED', 'Tarefa concluída'));
      } else if (prev.status === 'COMPLETED') {
        completedAt = undefined;
        history.push(entry('REOPENED', `Reaberta como "${STATUS_LABEL[patch.status]}"`));
      } else {
        history.push(
          entry('STATUS_CHANGED', `Status: ${STATUS_LABEL[prev.status]} → ${STATUS_LABEL[patch.status]}`),
        );
      }
    }

    const task: Task = { ...prev, ...patch, completedAt, history, updatedAt: now };
    db.tasks[idx] = task;

    let spawned: Task | undefined;
    const justClosed = task.status === 'COMPLETED' && prev.status !== 'COMPLETED';
    if (justClosed && task.recurrenceRule) {
      const nextDue = nextOccurrence(task.dueDate, task.recurrenceRule);
      if (nextDue) {
        spawned = {
          ...task,
          id: uid('tsk'),
          status: 'NOT_STARTED',
          dueDate: nextDue,
          startDate: undefined,
          completedAt: undefined,
          subtasks: task.subtasks.map((s) => ({ ...s, id: uid('st'), isCompleted: false })),
          history: [entry('CREATED', 'Criada automaticamente pela recorrência')],
          createdAt: now,
          updatedAt: now,
        };
        db.tasks.unshift(spawned);
      }
    }

    persist();
    return delay({ task, spawned });
  },

  async deleteTask(id: string): Promise<Task> {
    const db = load();
    const task = db.tasks.find((t) => t.id === id);
    if (!task) throw new Error('Tarefa não encontrada');
    db.tasks = db.tasks.filter((t) => t.id !== id);
    persist();
    return delay(task);
  },

  /** Reinsere uma tarefa excluída (usado pelo "Desfazer" do toast). */
  async restoreTask(task: Task): Promise<Task> {
    const db = load();
    db.tasks.unshift(task);
    persist();
    return delay(task);
  },

  async listCategories(): Promise<Category[]> {
    return delay(load().categories);
  },
  async listProjects(): Promise<Project[]> {
    return delay(load().projects);
  },
  async listContacts(): Promise<Contact[]> {
    return delay(load().contacts);
  },

  async createCategory(data: Omit<Category, 'id'>): Promise<Category> {
    const item = { ...data, id: uid('cat') };
    load().categories.push(item);
    persist();
    return delay(item);
  },
  async createProject(data: Omit<Project, 'id'>): Promise<Project> {
    const item = { ...data, id: uid('prj') };
    load().projects.push(item);
    persist();
    return delay(item);
  },
  async createContact(data: Omit<Contact, 'id'>): Promise<Contact> {
    const item = { ...data, id: uid('ct') };
    load().contacts.push(item);
    persist();
    return delay(item);
  },

  async listWheelAssessments(): Promise<WheelAssessment[]> {
    return delay([...load().wheelAssessments].sort((a, b) => a.date.localeCompare(b.date)));
  },
  async saveWheelAssessment(data: Omit<WheelAssessment, 'id'>): Promise<WheelAssessment> {
    const db = load();
    // Uma avaliação por dia: salvar de novo no mesmo dia substitui
    const existing = db.wheelAssessments.find((w) => w.date === data.date);
    const item: WheelAssessment = { ...data, id: existing?.id ?? uid('wa') };
    db.wheelAssessments = [...db.wheelAssessments.filter((w) => w.date !== data.date), item];
    persist();
    return delay(item);
  },
  async deleteWheelAssessment(id: string): Promise<void> {
    const db = load();
    db.wheelAssessments = db.wheelAssessments.filter((w) => w.id !== id);
    persist();
    return delay(undefined);
  },

  /* ------------------------------ Academia ------------------------------ */
  async getGym(): Promise<GymData> {
    return delay(load().gym);
  },
  async savePlanDay(day: WorkoutDay): Promise<WorkoutDay> {
    const db = load();
    db.gym.plan = db.gym.plan.map((d) => (d.weekday === day.weekday ? day : d));
    persist();
    return delay(day);
  },
  async createExercise(data: Omit<Exercise, 'id'>): Promise<Exercise> {
    const item = { ...data, id: uid('ex') };
    load().gym.exercises.push(item);
    persist();
    return delay(item);
  },
  /** Cria ou substitui um treino (mesmo id). */
  async saveSession(session: Omit<WorkoutSession, 'id'> & { id?: string }): Promise<WorkoutSession> {
    const db = load();
    const item: WorkoutSession = { ...session, id: session.id ?? uid('ws') };
    db.gym.sessions = [...db.gym.sessions.filter((s) => s.id !== item.id), item];
    persist();
    return delay(item);
  },
  async saveGymProfile(profile: TrainingProfile): Promise<TrainingProfile> {
    const db = load();
    db.gym.profile = { ...profile, updatedAt: new Date().toISOString() };
    persist();
    return delay(db.gym.profile);
  },
  /** Registra o peso do dia (substitui se já houver) e atualiza peso/altura do perfil. */
  async saveBody(data: { date: string; weightKg?: number; heightCm?: number }): Promise<void> {
    const db = load();
    const gym = db.gym;
    if (data.weightKg) {
      gym.bodyLog = [...(gym.bodyLog ?? []).filter((b) => b.date !== data.date), { date: data.date, weightKg: data.weightKg }];
    }
    gym.profile = {
      ...(gym.profile ?? { goal: 'hipertrofia', level: 'intermediario', weekdays: [1, 2, 3, 4, 5], minutes: 60, focus: [], place: 'academia', restrictions: [] }),
      ...(data.weightKg ? { weightKg: data.weightKg } : {}),
      ...(data.heightCm ? { heightCm: data.heightCm } : {}),
    };
    persist();
    return delay(undefined);
  },
  async deleteBodyEntry(date: string): Promise<void> {
    const db = load();
    db.gym.bodyLog = (db.gym.bodyLog ?? []).filter((b) => b.date !== date);
    persist();
    return delay(undefined);
  },
  /** Substitui o plano semanal pelo gerado e inclui na biblioteca exercícios que faltarem. */
  async applyGeneratedPlan(plan: WorkoutDay[], newExercises: Exercise[]): Promise<void> {
    const db = load();
    const have = new Set(db.gym.exercises.map((e) => e.id));
    db.gym.exercises.push(...newExercises.filter((e) => !have.has(e.id)));
    db.gym.plan = plan;
    persist();
    return delay(undefined);
  },
  async deleteSession(id: string): Promise<void> {
    const db = load();
    db.gym.sessions = db.gym.sessions.filter((s) => s.id !== id);
    persist();
    return delay(undefined);
  },

  /* -------------------------------- Foco -------------------------------- */
  async listFocusSessions(): Promise<FocusSession[]> {
    return delay([...(load().focusSessions ?? [])].sort((a, b) => b.endedAt.localeCompare(a.endedAt)));
  },
  /** Registra um pomodoro concluído (e anota no histórico do afazer, se houver). */
  async saveFocusSession(data: Omit<FocusSession, 'id'>): Promise<FocusSession> {
    const db = load();
    const item: FocusSession = { ...data, id: uid('fs') };
    db.focusSessions = [...(db.focusSessions ?? []), item];
    if (data.taskId) {
      const t = db.tasks.find((x) => x.id === data.taskId);
      if (t) t.history = [...(t.history ?? []), entry('UPDATED', `Pomodoro de ${data.minutes} min concluído`)];
    }
    persist();
    return delay(item);
  },
  async deleteFocusSession(id: string): Promise<void> {
    const db = load();
    db.focusSessions = (db.focusSessions ?? []).filter((s) => s.id !== id);
    persist();
    return delay(undefined);
  },

  /* ------------------------------ Biblioteca ------------------------------ */
  async getBookShelf(): Promise<Record<string, 'quero' | 'lendo' | 'lido'>> {
    return delay(load().bookShelf ?? {});
  },
  /** Define (ou remove, com null) o status de um livro na estante. */
  async setBookStatus(id: string, status: 'quero' | 'lendo' | 'lido' | null): Promise<void> {
    const db = load();
    const shelf = { ...(db.bookShelf ?? {}) };
    if (status) shelf[id] = status;
    else delete shelf[id];
    db.bookShelf = shelf;
    persist();
    return delay(undefined);
  },

  /* ------------------------------- Gratidão ------------------------------- */
  async listGratitude(): Promise<GratitudeEntry[]> {
    return delay([...(load().gratitude ?? [])].sort((a, b) => b.date.localeCompare(a.date)));
  },
  /** Salva o diário do dia (um registro por data: salvar de novo substitui). */
  async saveGratitude(data: Omit<GratitudeEntry, 'id' | 'createdAt'>): Promise<GratitudeEntry> {
    const db = load();
    const list = db.gratitude ?? [];
    const prev = list.find((g) => g.date === data.date);
    const item: GratitudeEntry = { ...data, id: prev?.id ?? uid('gr'), createdAt: prev?.createdAt ?? new Date().toISOString() };
    db.gratitude = [...list.filter((g) => g.date !== data.date), item];
    persist();
    return delay(item);
  },
  async deleteGratitude(id: string): Promise<void> {
    const db = load();
    db.gratitude = (db.gratitude ?? []).filter((g) => g.id !== id);
    persist();
    return delay(undefined);
  },

  /* --------------------------- Personalização --------------------------- */
  async getUser(): Promise<UserProfile | null> {
    return delay(load().user ?? null);
  },
  /** Verdadeiro quando os dados ainda são só os exemplos iniciais (nada criado pelo usuário). */
  isPristine(): boolean {
    const db = load();
    return (
      db.tasks.every((t) => /^tsk_\d+$/.test(t.id)) &&
      (db.gym?.sessions ?? []).every((s) => s.id.startsWith('ws_seed')) &&
      !(db.gym?.bodyLog?.length)
    );
  },
  /**
   * Conclui a primeira conversa: salva o perfil e prepara os dados.
   * mode: 'fresh' = começa do zero só com o que foi escolhido · 'keep' = mantém tudo · 'examples' = dados de exemplo.
   */
  async completeOnboarding(input: {
    profile: UserProfile;
    mode: 'fresh' | 'keep' | 'examples';
    starter: StarterTask[];
    time: string;
    gymGoal?: TrainingGoal;
  }): Promise<{ created: number }> {
    const { profile, mode, starter, time, gymGoal } = input;
    if (mode === 'examples') memory = createSeed();
    if (mode === 'fresh') {
      const seed = createSeed();
      memory = {
        ...seed,
        tasks: [],
        projects: [],
        contacts: [],
        wheelAssessments: [],
        categories: [],
        gym: { exercises: seed.gym.exercises, plan: seed.gym.plan.map((d) => ({ ...d, title: '', exercises: [] })), sessions: [], bodyLog: [] },
      };
    }
    const db = load();
    // Categorias do perfil que ainda não existem (por nome)
    const names = new Set(db.categories.map((c) => c.name.toLowerCase()));
    for (const c of categoriesFor(profile)) if (!names.has(c.name.toLowerCase())) db.categories.push(c);
    // Afazeres iniciais escolhidos
    const now = new Date().toISOString();
    const today = new Date().toISOString().slice(0, 10);
    let created = 0;
    for (const s of starter) {
      if (db.tasks.some((t) => t.title === s.title && t.status !== 'COMPLETED' && t.status !== 'CANCELLED')) continue;
      const cat = s.categoryName ? db.categories.find((c) => c.name.toLowerCase() === s.categoryName!.toLowerCase()) : undefined;
      db.tasks.unshift({
        id: uid('tsk'),
        title: s.title,
        status: 'NOT_STARTED',
        priority: 'MEDIUM',
        dueDate: today,
        deadlineTime: time,
        recurrenceRule: s.recurrence,
        scope: s.scope,
        categoryId: cat?.id,
        lifeAreaId: s.lifeAreaId,
        userId: USER_ID,
        subtasks: [],
        links: [],
        history: [entry('CREATED', 'Criado na personalização com a Rutte')],
        createdAt: now,
        updatedAt: now,
      });
      created++;
    }
    if (gymGoal && !db.gym.profile) {
      db.gym.profile = { goal: gymGoal, level: 'iniciante', weekdays: [1, 3, 5], minutes: 45, focus: [], place: 'academia', restrictions: [] };
    }
    db.user = { ...profile, updatedAt: now };
    persist();
    return delay({ created });
  },

  /** Backup: todos os dados em JSON. */
  async exportData(): Promise<string> {
    return JSON.stringify({ app: 'rutte', exportedAt: new Date().toISOString(), db: load() }, null, 2);
  },
  /** Restaura um backup (valida o formato e migra versões antigas). */
  async importData(json: string): Promise<{ tasks: number; sessions: number }> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      throw new Error('O arquivo não é um backup válido da Rutte (JSON inválido).');
    }
    const db = (parsed as { db?: Database })?.db ?? (parsed as Database);
    if (!db || !Array.isArray(db.tasks) || !Array.isArray(db.categories)) {
      throw new Error('Backup não reconhecido: faltam os afazeres ou as categorias.');
    }
    memory = migrate({ ...db, contacts: db.contacts ?? [], projects: db.projects ?? [], wheelAssessments: db.wheelAssessments ?? [] });
    persist();
    return delay({ tasks: memory.tasks.length, sessions: memory.gym?.sessions.length ?? 0 });
  },
  /** Verifica se o navegador está guardando os dados. */
  storageAvailable(): boolean {
    try {
      const k = '__rutte_test__';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  },

  async resetDatabase(): Promise<void> {
    memory = createSeed();
    persist();
    return delay(undefined);
  },
};

