import { z } from 'zod';
import type { LifeAreaId, Task, TaskInput } from '@/types';
import type { TaskDefaults } from '@/store/ui';
import { todayISO } from '@/lib/task-utils';

const optionalUrl = z.union([z.literal(''), z.url('Informe uma URL válida (https://…)')]);

export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Dê um título ao afazer').max(160, 'Máximo de 160 caracteres'),
  description: z.string(),
  whatToDo: z.string(),
  howTo: z.string(),
  expectedResult: z.string(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'BLOCKED', 'COMPLETED', 'CANCELLED']),
  priority: z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW']),
  startDate: z.string(),
  dueDate: z.string().min(1, 'Informe o prazo'),
  deadlineTime: z.string(),
  recurrenceRule: z.string(),
  scope: z.enum(['PERSONAL', 'BUSINESS']),
  lifeAreaId: z.string(),
  categoryId: z.string(),
  projectId: z.string(),
  meetingUrl: optionalUrl,
  location: z
    .object({ address: z.string(), name: z.string().optional(), placeId: z.string().optional(), lat: z.number().optional(), lng: z.number().optional() })
    .optional(),
  subtasks: z.array(z.object({ id: z.string(), title: z.string().trim().min(1, 'Subtarefa vazia'), isCompleted: z.boolean() })),
  links: z.array(z.object({ id: z.string(), title: z.string(), url: z.url('URL inválida') })),
  contactIds: z.array(z.string()),
  attachments: z.array(
    z.object({ id: z.string(), name: z.string(), size: z.number(), type: z.string(), dataUrl: z.string() }),
  ),
}).refine((v) => !v.startDate || v.startDate <= v.dueDate, {
  path: ['startDate'],
  message: 'Início deve ser antes do prazo',
});

export type TaskFormValues = z.infer<typeof taskSchema>;

export function toFormValues(task?: Task, defaults?: TaskDefaults): TaskFormValues {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    whatToDo: task?.whatToDo ?? '',
    howTo: task?.howTo ?? '',
    expectedResult: task?.expectedResult ?? '',
    status: task?.status ?? 'NOT_STARTED',
    priority: task?.priority ?? 'MEDIUM',
    startDate: task?.startDate ?? '',
    dueDate: task?.dueDate ?? defaults?.dueDate ?? todayISO(),
    deadlineTime: task?.deadlineTime ?? '',
    recurrenceRule: task?.recurrenceRule ?? '',
    scope: task?.scope ?? defaults?.scope ?? 'PERSONAL',
    lifeAreaId: task?.lifeAreaId ?? defaults?.lifeAreaId ?? '',
    categoryId: task?.categoryId ?? '',
    projectId: task?.projectId ?? '',
    meetingUrl: task?.meetingUrl ?? '',
    location: task?.location,
    subtasks: task?.subtasks ?? [],
    links: task?.links ?? [],
    contactIds: task?.contactIds ?? [],
    attachments: task?.attachments ?? [],
  };
}

const opt = (s: string) => (s.trim() ? s.trim() : undefined);

export function toTaskInput(v: TaskFormValues): TaskInput {
  return {
    title: v.title.trim(),
    description: opt(v.description),
    whatToDo: opt(v.whatToDo),
    howTo: opt(v.howTo),
    expectedResult: opt(v.expectedResult),
    status: v.status,
    priority: v.priority,
    startDate: opt(v.startDate),
    dueDate: v.dueDate,
    deadlineTime: opt(v.deadlineTime),
    recurrenceRule: opt(v.recurrenceRule),
    scope: v.scope,
    lifeAreaId: opt(v.lifeAreaId) as LifeAreaId | undefined,
    categoryId: opt(v.categoryId),
    projectId: opt(v.projectId),
    meetingUrl: opt(v.meetingUrl),
    location: v.location?.address.trim() ? v.location : undefined,
    subtasks: v.subtasks,
    links: v.links.map((l) => ({ ...l, title: l.title.trim() || l.url })),
    contactIds: v.contactIds,
    attachments: v.attachments,
  };
}
