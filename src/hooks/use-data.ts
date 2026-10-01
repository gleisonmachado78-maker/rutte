import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { api } from '@/services/api';
import type { Rating, RelationshipStatus } from '@/services/seed';
import { useUI } from '@/store/ui';
import { formatKg, newRecordsIn } from '@/lib/gym';
import type { Category, Contact, Exercise, GymData, Project, Task, TaskInput, WorkoutDay } from '@/types';

export const qk = {
  tasks: ['tasks'] as const,
  categories: ['categories'] as const,
  projects: ['projects'] as const,
  contacts: ['contacts'] as const,
  wheel: ['wheel'] as const,
  gym: ['gym'] as const,
  user: ['user'] as const,
  focus: ['focus'] as const,
  shelf: ['shelf'] as const,
  gratitude: ['gratitude'] as const,
  ratings: ['ratings'] as const,
  relationship: ['relationship'] as const,
};

export const useTasks = () => useQuery({ queryKey: qk.tasks, queryFn: api.listTasks });
export const useCategories = () => useQuery({ queryKey: qk.categories, queryFn: api.listCategories });
export const useProjects = () => useQuery({ queryKey: qk.projects, queryFn: api.listProjects });
export const useContacts = () => useQuery({ queryKey: qk.contacts, queryFn: api.listContacts });

/** Mapas id → entidade para lookup rápido nos cards. */
export function useLookups() {
  const { data: categories = [] } = useCategories();
  const { data: projects = [] } = useProjects();
  const { data: contacts = [] } = useContacts();
  return {
    categories,
    projects,
    contacts,
    categoryById: new Map<string, Category>(categories.map((c) => [c.id, c])),
    projectById: new Map<string, Project>(projects.map((p) => [p.id, p])),
    contactById: new Map<string, Contact>(contacts.map((c) => [c.id, c])),
  };
}

const errorToast = (err: unknown) =>
  toast.error(err instanceof Error ? err.message : 'Algo deu errado');

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskInput) => api.createTask(input),
    onSuccess: (task) => {
      qc.setQueryData<Task[]>(qk.tasks, (old = []) => [task, ...old]);
      toast.success('Afazer criado', {
        description: task.title,
        action: { label: 'Abrir', onClick: () => useUI.getState().openTask(task.id) },
      });
    },
    onError: errorToast,
  });
}

/** Atualização com otimismo: a UI muda na hora e reverte se a API falhar. */
export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<TaskInput>; silent?: boolean }) =>
      api.updateTask(id, patch),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: qk.tasks });
      const previous = qc.getQueryData<Task[]>(qk.tasks);
      qc.setQueryData<Task[]>(qk.tasks, (old = []) =>
        old.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      );
      return { previous };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(qk.tasks, ctx.previous);
      errorToast(err);
    },
    onSuccess: ({ task, spawned }, { patch, silent }) => {
      qc.setQueryData<Task[]>(qk.tasks, (old = []) => {
        const list = old.map((t) => (t.id === task.id ? task : t));
        return spawned ? [spawned, ...list] : list;
      });
      if (silent) return;
      if (patch.status === 'COMPLETED') {
        toast.success('Afazer concluído 🎉', {
          description: spawned ? `Próxima ocorrência criada para ${spawned.dueDate.split('-').reverse().join('/')}` : task.title,
        });
      } else {
        toast.success('Alterações salvas');
      }
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: (task) => {
      qc.setQueryData<Task[]>(qk.tasks, (old = []) => old.filter((t) => t.id !== task.id));
      toast('Afazer excluído', {
        description: task.title,
        duration: 8000,
        action: {
          label: 'Desfazer',
          onClick: async () => {
            const restored = await api.restoreTask(task);
            qc.setQueryData<Task[]>(qk.tasks, (old = []) => [restored, ...old]);
            toast.success('Afazer restaurado');
          },
        },
      });
    },
    onError: errorToast,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createCategory,
    onSuccess: (c) => {
      qc.setQueryData<Category[]>(qk.categories, (old = []) => [...old, c]);
      toast.success('Categoria criada');
    },
    onError: errorToast,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createProject,
    onSuccess: (p) => {
      qc.setQueryData<Project[]>(qk.projects, (old = []) => [...old, p]);
      toast.success('Projeto criado');
    },
    onError: errorToast,
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createContact,
    onSuccess: (c) => {
      qc.setQueryData<Contact[]>(qk.contacts, (old = []) => [...old, c]);
      toast.success('Contato adicionado');
    },
    onError: errorToast,
  });
}

export function useResetData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.resetDatabase,
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success('Dados de exemplo restaurados');
    },
  });
}

/* ------------------------------ Escopo Pessoal/Empresa ------------------------------ */

/** Tarefas filtradas pelo escopo global escolhido (Todos / Pessoal / Empresa). */
export function useScopedTasks() {
  const scope = useUI((s) => s.scope);
  const query = useTasks();
  const data = useMemo(
    () => (scope === 'ALL' ? query.data : query.data?.filter((t) => t.scope === scope)),
    [query.data, scope],
  );
  return { ...query, data };
}

/* ---------------------------------- Roda da Vida ---------------------------------- */

export const useWheelAssessments = () =>
  useQuery({ queryKey: qk.wheel, queryFn: api.listWheelAssessments });

export function useSaveWheel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.saveWheelAssessment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.wheel });
      toast.success('Roda da Vida salva', { description: 'A Rutte guardou sua avaliação de hoje.' });
    },
    onError: errorToast,
  });
}

export function useDeleteWheel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteWheelAssessment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.wheel });
      toast('Avaliação removida');
    },
    onError: errorToast,
  });
}

/* ------------------------------------ Academia ------------------------------------ */

export const useGym = () => useQuery({ queryKey: qk.gym, queryFn: api.getGym });

export function useSavePlanDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.savePlanDay,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.gym });
      toast.success('Plano do dia salvo');
    },
    onError: errorToast,
  });
}

export function useCreateExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createExercise,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.gym }),
    onError: errorToast,
  });
}

/** Salva o treino e comemora novos PRs. */
export function useSaveSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (session: Parameters<typeof api.saveSession>[0]) => {
      const before = (qc.getQueryData<GymData>(qk.gym) ?? (await api.getGym())).sessions;
      const saved = await api.saveSession(session);
      return { saved, records: newRecordsIn(saved, before) };
    },
    onSuccess: ({ records }) => {
      qc.invalidateQueries({ queryKey: qk.gym });
      const gym = qc.getQueryData<GymData>(qk.gym);
      const name = (id: string) => gym?.exercises.find((e) => e.id === id)?.name ?? 'Exercício';
      if (records.length) {
        toast.success(`🏆 ${records.length === 1 ? 'Novo PR!' : `${records.length} novos PRs!`}`, {
          description: records.map((r) => `${name(r.exerciseId)}: ${formatKg(r.kg)} × ${r.reps}`).join(' · '),
          duration: 8000,
        });
      } else {
        toast.success('Treino salvo 💪', { description: 'A Rutte registrou seu treino de hoje.' });
      }
    },
    onError: errorToast,
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.gym });
      toast('Treino removido');
    },
    onError: errorToast,
  });
}

export function useSaveGymProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.saveGymProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.gym }),
    onError: errorToast,
  });
}

export function useApplyGeneratedPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ plan, newExercises }: { plan: WorkoutDay[]; newExercises: Exercise[] }) =>
      api.applyGeneratedPlan(plan, newExercises),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.gym });
      toast.success('Novo plano aplicado 🏋️', { description: 'Você pode ajustá-lo a qualquer momento em “Plano semanal”.' });
    },
    onError: errorToast,
  });
}

export function useSaveBody() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ silent: _silent, ...data }: Parameters<typeof api.saveBody>[0] & { silent?: boolean }) => api.saveBody(data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: qk.gym });
      if (!vars.silent) toast.success('Medidas salvas', { description: 'A Rutte vai acompanhar sua evolução.' });
    },
    onError: errorToast,
  });
}

export function useDeleteBodyEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteBodyEntry,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.gym }),
    onError: errorToast,
  });
}

export function useImportData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.importData,
    onSuccess: ({ tasks, sessions }) => {
      qc.invalidateQueries();
      toast.success('Backup restaurado', { description: `${tasks} afazeres e ${sessions} treinos carregados.` });
    },
    onError: errorToast,
  });
}

/* --------------------------------- Personalização --------------------------------- */

export const useUser = () => useQuery({ queryKey: qk.user, queryFn: api.getUser });

export function useCompleteOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.completeOnboarding,
    onSuccess: ({ created }, vars) => {
      qc.invalidateQueries();
      toast.success(`Tudo pronto, ${vars.profile.name.split(' ')[0]}!`, {
        description: created ? `A Rutte criou ${created} afazeres para os seus objetivos.` : 'Seu app foi ajustado aos seus objetivos.',
      });
    },
    onError: errorToast,
  });
}

/** Módulos ligados na personalização (sem perfil = tudo ligado). */
export function useModules() {
  const { data: user } = useUser();
  return user?.modules ?? { business: true, gym: true, life: true };
}

/* -------------------------------------- Foco -------------------------------------- */

export const useFocusSessions = () => useQuery({ queryKey: qk.focus, queryFn: api.listFocusSessions });

export function useSaveFocusSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.saveFocusSession,
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: qk.focus });
      if (s.taskId) qc.invalidateQueries({ queryKey: qk.tasks });
    },
    onError: errorToast,
  });
}

export function useDeleteFocusSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteFocusSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.focus }),
    onError: errorToast,
  });
}

/* ------------------------------------ Biblioteca ------------------------------------ */

export const useBookShelf = () => useQuery({ queryKey: qk.shelf, queryFn: api.getBookShelf });

export function useSetBookStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'quero' | 'lendo' | 'lido' | null }) => api.setBookStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: qk.shelf });
      const prev = qc.getQueryData<Record<string, string>>(qk.shelf);
      qc.setQueryData<Record<string, string>>(qk.shelf, (old = {}) => {
        const next = { ...old };
        if (status) next[id] = status;
        else delete next[id];
        return next;
      });
      return { prev };
    },
    onError: (err, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.shelf, ctx.prev);
      errorToast(err);
    },
  });
}

/* ------------------------------------- Gratidão ------------------------------------- */

export const useGratitude = () => useQuery({ queryKey: qk.gratitude, queryFn: api.listGratitude });

export function useSaveGratitude() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.saveGratitude,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.gratitude });
      toast.success('Gratidão registrada 🙏', { description: 'A Rutte guardou o seu dia.' });
    },
    onError: errorToast,
  });
}

export function useDeleteGratitude() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteGratitude,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.gratitude }),
    onError: errorToast,
  });
}

/* ------------------------------------ Avaliações ------------------------------------ */

export const useRatings = () => useQuery({ queryKey: qk.ratings, queryFn: api.getRatings });

export function useSetRating() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, stars, note }: { key: string; stars: number; note?: string }) => api.setRating(key, stars, note),
    onMutate: async ({ key, stars, note }) => {
      await qc.cancelQueries({ queryKey: qk.ratings });
      const prev = qc.getQueryData<Record<string, Rating>>(qk.ratings);
      qc.setQueryData<Record<string, Rating>>(qk.ratings, (old = {}) => {
        const next = { ...old };
        if (stars > 0) next[key] = { stars, note: note?.trim() || undefined, at: new Date().toISOString() };
        else delete next[key];
        return next;
      });
      return { prev };
    },
    onError: (err, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.ratings, ctx.prev);
      errorToast(err);
    },
  });
}

/* --------------------------------- Situação amorosa --------------------------------- */

export const useRelationship = () => useQuery({ queryKey: qk.relationship, queryFn: api.getRelationship });

export function useSetRelationship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (s: RelationshipStatus | null) => api.setRelationship(s),
    onMutate: (s) => qc.setQueryData(qk.relationship, s),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.relationship }),
    onError: errorToast,
  });
}
