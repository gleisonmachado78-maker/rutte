import { addDays, format, subDays } from 'date-fns';
import type { Category, Contact, FocusSession, GratitudeEntry, GymData, Project, Task, UserProfile, WheelAssessment } from '@/types';
import { createGymSeed } from '@/lib/gym';

export const USER_ID = 'user_1';
export const DB_VERSION = 3;

export interface Database {
  version: number;
  tasks: Task[];
  categories: Category[];
  projects: Project[];
  contacts: Contact[];
  wheelAssessments: WheelAssessment[];
  gym: GymData;
  /** respostas da personalização (ausente = mostrar a primeira conversa) */
  user?: UserProfile;
  /** pomodoros concluídos */
  focusSessions?: FocusSession[];
  /** estante pessoal de livros: id do Google Livros → status */
  bookShelf?: Record<string, 'quero' | 'lendo' | 'lido'>;
  /** diário de gratidão */
  gratitude?: GratitudeEntry[];
  /** avaliações do usuário: "book:ID", "video:ID", "prayer:ID"… → nota */
  ratings?: Record<string, Rating>;
  /** situação amorosa (muda as sugestões da área Relacionamento) */
  relationship?: RelationshipStatus;
}

export type RelationshipStatus = 'casal' | 'solteiro';

export interface Rating {
  stars: number;
  note?: string;
  at: string;
}

const d = (offset: number) => format(addDays(new Date(), offset), 'yyyy-MM-dd');

/** Categorias padrão: Pessoal (seu CPF) e Empresa. */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_academia', name: 'Academia', color: '#DC2626', scope: 'PERSONAL' },
  { id: 'cat_despesas', name: 'Despesas', color: '#D97706', scope: 'PERSONAL' },
  { id: 'cat_casa', name: 'Casa', color: '#059669', scope: 'PERSONAL' },
  { id: 'cat_igreja', name: 'Igreja', color: '#9333EA', scope: 'PERSONAL' },
  { id: 'cat_reunioes', name: 'Reuniões', color: '#2563EB', scope: 'BUSINESS' },
  { id: 'cat_comercial', name: 'Comercial', color: '#0891B2', scope: 'BUSINESS' },
  { id: 'cat_admin', name: 'Administrativo', color: '#475569', scope: 'BUSINESS' },
];

/** Dados iniciais realistas, com datas relativas ao dia em que o app é aberto pela primeira vez. */
export function createSeed(): Database {
  const now = new Date().toISOString();
  const projects: Project[] = [
    { id: 'prj_site', name: 'Novo Site', color: '#7C3AED', scope: 'BUSINESS' },
    { id: 'prj_mudanca', name: 'Mudança de Casa', color: '#0891B2', scope: 'PERSONAL' },
  ];
  const contacts: Contact[] = [{ id: 'ct_ana', name: 'Ana Souza', email: 'ana.souza@exemplo.com' }];

  const created = () => [
    { id: `h_${Math.random().toString(36).slice(2, 9)}`, type: 'CREATED' as const, message: 'Tarefa criada', at: now },
  ];

  const tasks: Task[] = [
    {
      id: 'tsk_1',
      title: 'Pagar fatura do cartão de crédito',
      whatToDo: 'Quitar a fatura do mês antes que gere juros.',
      howTo: '1. Conferir lançamentos no app do banco\n2. Contestar compras não reconhecidas\n3. Pagar via Pix',
      expectedResult: 'Fatura paga e comprovante salvo na pasta de finanças.',
      status: 'NOT_STARTED',
      priority: 'URGENT',
      dueDate: d(-1),
      deadlineTime: '18:00',
      scope: 'PERSONAL',
      categoryId: 'cat_despesas',
      lifeAreaId: 'financas',
      userId: USER_ID,
      subtasks: [
        { id: 'st_1a', title: 'Conferir lançamentos', isCompleted: true },
        { id: 'st_1b', title: 'Pagar fatura', isCompleted: false },
        { id: 'st_1c', title: 'Salvar comprovante', isCompleted: false },
      ],
      links: [{ id: 'lk_1', title: 'Internet Banking', url: 'https://www.exemplo.com/banco' }],
      history: created(),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tsk_2',
      title: 'Revisar proposta de layout da home',
      description: 'Feedback da primeira versão do layout enviada pela designer.',
      whatToDo: 'Analisar o protótipo da página inicial e consolidar comentários.',
      howTo: 'Abrir o protótipo, comparar com o briefing e anotar ajustes por seção.',
      expectedResult: 'Lista de ajustes enviada para a Ana por e-mail.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      startDate: d(-4),
      dueDate: d(-2),
      deadlineTime: '12:00',
      scope: 'BUSINESS',
      categoryId: 'cat_comercial',
      projectId: 'prj_site',
      lifeAreaId: 'profissional',
      userId: USER_ID,
      subtasks: [
        { id: 'st_2a', title: 'Revisar header e menu', isCompleted: true },
        { id: 'st_2b', title: 'Revisar vitrine', isCompleted: true },
        { id: 'st_2c', title: 'Revisar rodapé', isCompleted: false },
        { id: 'st_2d', title: 'Checar versão mobile', isCompleted: false },
        { id: 'st_2e', title: 'Enviar feedback', isCompleted: false },
      ],
      links: [{ id: 'lk_2', title: 'Protótipo (Figma)', url: 'https://www.figma.com/' }],
      contactIds: ['ct_ana'],
      history: created(),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tsk_3',
      title: 'Reunião de alinhamento do Novo Site',
      whatToDo: 'Alinhar cronograma e responsabilidades da fase 2.',
      howTo: 'Levar a lista de ajustes da home e o status do checklist.',
      expectedResult: 'Datas da fase 2 aprovadas e registradas.',
      status: 'NOT_STARTED',
      priority: 'HIGH',
      dueDate: d(0),
      deadlineTime: '15:00',
      scope: 'BUSINESS',
      categoryId: 'cat_reunioes',
      projectId: 'prj_site',
      lifeAreaId: 'profissional',
      userId: USER_ID,
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      subtasks: [
        { id: 'st_3a', title: 'Preparar pauta', isCompleted: false },
        { id: 'st_3b', title: 'Enviar ata', isCompleted: false },
      ],
      links: [],
      contactIds: ['ct_ana'],
      history: created(),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tsk_4',
      title: 'Orçar empresa de mudança',
      whatToDo: 'Pedir pelo menos 3 orçamentos para a mudança.',
      howTo: 'Enviar lista de móveis e fotos para as empresas.',
      expectedResult: 'Planilha comparando preço, prazo e seguro.',
      status: 'NOT_STARTED',
      priority: 'MEDIUM',
      dueDate: d(0),
      scope: 'PERSONAL',
      categoryId: 'cat_casa',
      projectId: 'prj_mudanca',
      lifeAreaId: 'familia',
      userId: USER_ID,
      subtasks: [
        { id: 'st_4a', title: 'Listar móveis', isCompleted: true },
        { id: 'st_4b', title: 'Pedir 3 orçamentos', isCompleted: false },
      ],
      links: [],
      history: created(),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tsk_5',
      title: 'Check-in semanal com a Ana',
      whatToDo: 'Conversa rápida sobre andamento das tarefas da semana.',
      status: 'NOT_STARTED',
      priority: 'LOW',
      dueDate: d(3),
      deadlineTime: '10:00',
      recurrenceRule: 'FREQ=WEEKLY',
      scope: 'BUSINESS',
      categoryId: 'cat_reunioes',
      projectId: 'prj_site',
      lifeAreaId: 'profissional',
      userId: USER_ID,
      meetingUrl: 'https://meet.google.com/xyz-abcd-efg',
      subtasks: [],
      links: [],
      contactIds: ['ct_ana'],
      history: created(),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tsk_6',
      title: 'Treino de pernas',
      whatToDo: 'Treino A da planilha da academia.',
      status: 'NOT_STARTED',
      priority: 'MEDIUM',
      dueDate: d(1),
      deadlineTime: '07:00',
      recurrenceRule: 'FREQ=WEEKLY',
      scope: 'PERSONAL',
      categoryId: 'cat_academia',
      lifeAreaId: 'saude',
      userId: USER_ID,
      subtasks: [
        { id: 'st_6a', title: 'Agachamento 4x10', isCompleted: false },
        { id: 'st_6b', title: 'Leg press 4x12', isCompleted: false },
        { id: 'st_6c', title: 'Alongamento', isCompleted: false },
      ],
      links: [],
      history: created(),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tsk_7',
      title: 'Culto de domingo',
      status: 'NOT_STARTED',
      priority: 'LOW',
      dueDate: format(nextSunday(), 'yyyy-MM-dd'),
      deadlineTime: '18:30',
      recurrenceRule: 'FREQ=WEEKLY',
      scope: 'PERSONAL',
      categoryId: 'cat_igreja',
      lifeAreaId: 'espiritualidade',
      userId: USER_ID,
      subtasks: [],
      links: [],
      history: created(),
      createdAt: now,
      updatedAt: now,
    },
  ];

  const wheelAssessments: WheelAssessment[] = [
    {
      id: 'wa_1',
      date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      scores: {
        saude: 5, emocional: 6, intelectual: 7, profissional: 7, financas: 4,
        relacionamentos: 7, familia: 8, social: 5, espiritualidade: 6, lazer: 3,
      },
      note: 'Primeira avaliação (exemplo).',
    },
  ];

  return { version: DB_VERSION, tasks, categories: DEFAULT_CATEGORIES, projects, contacts, wheelAssessments, gym: createGymSeed() };
}

function nextSunday() {
  const t = new Date();
  return addDays(t, (7 - t.getDay()) % 7 || 7);
}

/** Migra bancos salvos por versões anteriores sem perder dados do usuário. */
export function migrate(db: Database): Database {
  const v = db.version ?? 1;
  if (v >= DB_VERSION) return db;
  if (v >= 2) return { ...db, version: DB_VERSION, gym: db.gym ?? createGymSeed() };
  const legacyBusiness = new Set(['cat_trabalho']);
  const categories = [...db.categories];
  for (const c of categories) c.scope ??= legacyBusiness.has(c.id) ? 'BUSINESS' : 'PERSONAL';
  for (const def of DEFAULT_CATEGORIES) if (!categories.some((c) => c.id === def.id)) categories.push(def);
  const projects = db.projects.map((p) => ({ ...p, scope: p.scope ?? (p.id === 'prj_site' ? 'BUSINESS' : 'PERSONAL') }) as Project);
  const catScope = new Map(categories.map((c) => [c.id, c.scope]));
  const tasks = db.tasks.map((t) => ({
    ...t,
    scope: t.scope ?? (t.categoryId && catScope.get(t.categoryId)) ?? 'PERSONAL',
  })) as Task[];
  return {
    ...db,
    version: DB_VERSION,
    categories,
    projects,
    tasks,
    wheelAssessments: db.wheelAssessments ?? [],
    gym: db.gym ?? createGymSeed(),
  };
}
