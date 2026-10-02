/**
 * Relatórios de dados do app, calculados no próprio aparelho.
 * A Rutte IA chama `buildReport` (ferramenta `gerar_relatorio`), mostra o cartão com gráficos
 * e recebe os números resumidos para comentar.
 */
import { addDays, differenceInCalendarDays, format, parseISO, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LIFE_AREAS, LIFE_AREA_BY_ID } from './life-areas';
import { isClosed, todayISO } from './task-utils';
import { api } from '@/services/api';

export type ReportTopic = 'produtividade' | 'academia' | 'foco' | 'roda_da_vida' | 'gratidao' | 'geral';

export const REPORT_TOPICS: { id: ReportTopic; label: string }[] = [
  { id: 'geral', label: 'Visão geral' },
  { id: 'produtividade', label: 'Afazeres' },
  { id: 'academia', label: 'Academia' },
  { id: 'foco', label: 'Foco' },
  { id: 'roda_da_vida', label: 'Roda da Vida' },
  { id: 'gratidao', label: 'Gratidão' },
];

export interface ReportKpi {
  label: string;
  value: string;
  hint?: string;
}
export interface ReportChart {
  title: string;
  kind: 'bar' | 'line';
  unit?: string;
  points: { label: string; value: number }[];
  /** escala fixa (ex.: 10 na Roda da Vida) */
  max?: number;
}
export interface Report {
  topic: ReportTopic;
  title: string;
  period: string;
  kpis: ReportKpi[];
  charts: ReportChart[];
  /** observações objetivas calculadas (a IA usa para comentar) */
  facts: string[];
  generatedAt: string;
}

const pct = (n: number) => `${Math.round(n * 100)}%`;
const fmtNum = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

/** Agrupa em semanas (segunda a domingo) dentro do período. */
function weeks(days: number) {
  const end = new Date();
  const first = startOfWeek(addDays(end, -days + 1), { weekStartsOn: 1 });
  const out: { start: string; end: string; label: string }[] = [];
  for (let d = first; d <= end; d = addDays(d, 7)) {
    out.push({ start: format(d, 'yyyy-MM-dd'), end: format(addDays(d, 6), 'yyyy-MM-dd'), label: format(d, 'dd/MM') });
  }
  return out;
}

export async function buildReport(topic: ReportTopic, rawDays = 30): Promise<Report> {
  const days = Math.min(Math.max(Math.round(rawDays) || 30, 7), 180);
  const since = format(addDays(new Date(), -days + 1), 'yyyy-MM-dd');
  const today = todayISO();
  const period = `Últimos ${days} dias (${format(parseISO(since), 'dd/MM')} a ${format(new Date(), 'dd/MM')})`;
  const W = weeks(days);
  const inW = (date: string | undefined, w: { start: string; end: string }) => !!date && date >= w.start && date <= w.end;
  const [tasks, gym, focus, wheel, gratitude] = await Promise.all([api.listTasks(), api.getGym(), api.listFocusSessions(), api.listWheelAssessments(), api.listGratitude()]);

  const kpis: ReportKpi[] = [];
  const charts: ReportChart[] = [];
  const facts: string[] = [];
  const all = topic === 'geral';

  if (topic === 'produtividade' || all) {
    const created = tasks.filter((t) => t.createdAt.slice(0, 10) >= since);
    const done = tasks.filter((t) => t.completedAt && t.completedAt.slice(0, 10) >= since);
    const open = tasks.filter((t) => !isClosed(t));
    const overdue = open.filter((t) => t.dueDate < today);
    const dueInPeriod = tasks.filter((t) => t.dueDate >= since && t.dueDate <= today);
    const onTime = dueInPeriod.filter((t) => t.completedAt && t.completedAt.slice(0, 10) <= t.dueDate).length;
    const rate = dueInPeriod.length ? onTime / dueInPeriod.length : 0;
    kpis.push(
      { label: 'Concluídos', value: String(done.length), hint: `${created.length} criados no período` },
      { label: 'No prazo', value: dueInPeriod.length ? pct(rate) : '—', hint: `${onTime} de ${dueInPeriod.length} com prazo no período` },
      { label: 'Atrasados agora', value: String(overdue.length), hint: `${open.length} abertos` },
    );
    charts.push({ title: 'Afazeres concluídos por semana', kind: 'bar', points: W.map((w) => ({ label: w.label, value: done.filter((t) => inW(t.completedAt?.slice(0, 10), w)).length })) });
    if (!all) {
      const byArea = LIFE_AREAS.map((a) => ({ label: a.short, value: done.filter((t) => t.lifeAreaId === a.id).length })).filter((p) => p.value > 0);
      if (byArea.length) charts.push({ title: 'Concluídos por área da vida', kind: 'bar', points: byArea });
      const pr = { URGENT: 'Urgente', HIGH: 'Alta', MEDIUM: 'Média', LOW: 'Baixa' } as const;
      charts.push({ title: 'Abertos por prioridade', kind: 'bar', points: (Object.keys(pr) as (keyof typeof pr)[]).map((p) => ({ label: pr[p], value: open.filter((t) => t.priority === p).length })) });
    }
    const biz = done.filter((t) => t.scope === 'BUSINESS').length;
    facts.push(`Afazeres: ${done.length} concluídos (${biz} da empresa), ${created.length} criados, ${overdue.length} atrasados, ${pct(rate)} no prazo.`);
    if (overdue.length) facts.push(`Mais antigo atrasado: "${overdue.sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0].title}" desde ${overdue[0].dueDate}.`);
  }

  if (topic === 'academia' || all) {
    const sessions = gym.sessions.filter((s) => s.date >= since);
    const vol = (s: (typeof sessions)[number]) => s.entries.reduce((n, e) => n + e.sets.reduce((m, st) => m + st.reps * st.kg, 0), 0);
    const totalVol = sessions.reduce((n, s) => n + vol(s), 0);
    const perWeek = sessions.length / Math.max(1, days / 7);
    kpis.push(
      { label: 'Treinos', value: String(sessions.length), hint: `${fmtNum(perWeek)} por semana` },
      { label: 'Volume total', value: `${fmtNum(totalVol / 1000)} t`, hint: 'séries × repetições × kg' },
    );
    charts.push({ title: 'Treinos por semana', kind: 'bar', points: W.map((w) => ({ label: w.label, value: sessions.filter((s) => inW(s.date, w)).length })) });
    if (!all) {
      charts.push({ title: 'Volume por semana', kind: 'line', unit: 'kg', points: W.map((w) => ({ label: w.label, value: Math.round(sessions.filter((s) => inW(s.date, w)).reduce((n, s) => n + vol(s), 0)) })) });
      const body = (gym.bodyLog ?? []).filter((b) => b.date >= since).sort((a, b) => a.date.localeCompare(b.date));
      if (body.length >= 2) {
        charts.push({ title: 'Peso corporal', kind: 'line', unit: 'kg', points: body.map((b) => ({ label: format(parseISO(b.date), 'dd/MM'), value: b.weightKg })) });
        facts.push(`Peso foi de ${body[0].weightKg} kg para ${body.at(-1)!.weightKg} kg.`);
      }
      const byEx = new Map<string, number>();
      sessions.forEach((s) => s.entries.forEach((e) => byEx.set(e.exerciseId, (byEx.get(e.exerciseId) ?? 0) + e.sets.length)));
      const top = [...byEx.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
      if (top.length) facts.push(`Exercícios mais feitos (séries): ${top.map(([id, n]) => `${gym.exercises.find((x) => x.id === id)?.name ?? id} ${n}`).join(', ')}.`);
    }
    facts.push(`Academia: ${sessions.length} treinos (${fmtNum(perWeek)}/semana), volume ${Math.round(totalVol)} kg.`);
    const last = [...gym.sessions].sort((a, b) => b.date.localeCompare(a.date))[0];
    if (last) facts.push(`Último treino há ${differenceInCalendarDays(new Date(), parseISO(last.date))} dias (${last.title}).`);
  }

  if (topic === 'foco' || all) {
    const fs = focus.filter((f) => f.date >= since);
    const mins = fs.reduce((n, f) => n + f.minutes, 0);
    kpis.push({ label: 'Tempo de foco', value: `${fmtNum(mins / 60)} h`, hint: `${fs.length} pomodoros` });
    charts.push({ title: 'Minutos de foco por semana', kind: 'bar', unit: 'min', points: W.map((w) => ({ label: w.label, value: fs.filter((f) => inW(f.date, w)).reduce((n, f) => n + f.minutes, 0) })) });
    if (!all) {
      const byAct = new Map<string, number>();
      fs.forEach((f) => byAct.set(f.activity || 'Sem descrição', (byAct.get(f.activity || 'Sem descrição') ?? 0) + f.minutes));
      const top = [...byAct.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
      if (top.length) charts.push({ title: 'Onde foi o seu foco', kind: 'bar', unit: 'min', points: top.map(([label, value]) => ({ label: label.length > 14 ? label.slice(0, 13) + '…' : label, value })) });
    }
    facts.push(`Foco: ${mins} minutos em ${fs.length} pomodoros.`);
  }

  if (topic === 'roda_da_vida' || all) {
    const last = wheel.at(-1);
    const prev = wheel.at(-2);
    if (last) {
      const avg = LIFE_AREAS.reduce((n, a) => n + last.scores[a.id], 0) / LIFE_AREAS.length;
      kpis.push({ label: 'Média da Roda', value: fmtNum(avg), hint: `avaliada em ${format(parseISO(last.date), 'dd/MM')}` });
      charts.push({ title: 'Roda da Vida (0–10)', kind: 'bar', max: 10, points: LIFE_AREAS.map((a) => ({ label: a.short, value: last.scores[a.id] })) });
      const sorted = [...LIFE_AREAS].sort((a, b) => last.scores[a.id] - last.scores[b.id]);
      facts.push(`Roda da Vida: média ${fmtNum(avg)}; mais baixas: ${sorted.slice(0, 3).map((a) => `${a.short} ${last.scores[a.id]}`).join(', ')}; mais altas: ${sorted.slice(-2).map((a) => `${a.short} ${last.scores[a.id]}`).join(', ')}.`);
      if (prev) {
        const diffs = LIFE_AREAS.map((a) => ({ a, d: last.scores[a.id] - prev.scores[a.id] })).filter((x) => x.d !== 0);
        if (diffs.length) facts.push(`Mudanças desde ${prev.date}: ${diffs.map((x) => `${LIFE_AREA_BY_ID[x.a.id].short} ${x.d > 0 ? '+' : ''}${x.d}`).join(', ')}.`);
      }
    } else facts.push('Roda da Vida ainda não foi avaliada.');
  }

  if (topic === 'gratidao' || all) {
    const gs = gratitude.filter((g) => g.date >= since);
    kpis.push({ label: 'Dias de gratidão', value: String(gs.length), hint: `de ${days} dias` });
    if (!all) charts.push({ title: 'Registros de gratidão por semana', kind: 'bar', points: W.map((w) => ({ label: w.label, value: gs.filter((g) => inW(g.date, w)).length })) });
    facts.push(`Gratidão: ${gs.length} registros em ${days} dias.`);
  }

  const label = REPORT_TOPICS.find((t) => t.id === topic)?.label ?? 'Relatório';
  return {
    topic,
    title: topic === 'geral' ? 'Relatório geral' : `Relatório: ${label}`,
    period,
    kpis,
    charts: charts.filter((c) => c.points.length),
    facts,
    generatedAt: format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
  };
}

/** Versão em texto (para copiar). */
export function reportToText(r: Report, analysis?: string) {
  return [
    `${r.title} — ${r.period}`,
    ...r.kpis.map((k) => `• ${k.label}: ${k.value}${k.hint ? ` (${k.hint})` : ''}`),
    ...r.charts.map((c) => `\n${c.title}\n${c.points.map((p) => `  ${p.label}: ${p.value}${c.unit ? ' ' + c.unit : ''}`).join('\n')}`),
    analysis ? `\nAnálise da Rutte:\n${analysis}` : '',
    `\nGerado pela Rutte em ${r.generatedAt}`,
  ].join('\n');
}
