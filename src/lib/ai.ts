/**
 * Rutte IA: conversa com o Claude (API da Anthropic) direto do navegador, com a chave da própria pessoa.
 * A cada mensagem, a Rutte manda um resumo dos dados do app (afazeres, metas, treinos, Roda da Vida)
 * e oferece ferramentas para criar, concluir e adiar afazeres.
 */
import { differenceInCalendarDays, format, parseISO, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LIFE_AREAS, LIFE_AREA_BY_ID } from './life-areas';
import { GOALS, PEAKS, SITUATIONS, STRUGGLES } from './onboarding';
import { isClosed, todayISO } from './task-utils';
import { api } from '@/services/api';
import type { LifeAreaId, Priority, Task, TaskInput } from '@/types';

/* --------------------------------- Chave e modelo --------------------------------- */

const KEY_STORAGE = 'rutte:ai-key';
const MODEL_STORAGE = 'rutte:ai-model';

export const AI_MODELS = [
  { id: 'claude-sonnet-5-5', label: 'Equilibrado (Sonnet 5.5)', hint: 'Recomendado: rápido e muito bom' },
  { id: 'claude-haiku-4-5-20251001', label: 'Econômico (Haiku 4.5)', hint: 'Mais rápido e mais barato' },
  { id: 'claude-opus-5-5', label: 'Mais inteligente (Opus 5.5)', hint: 'Para planos mais elaborados; custa mais' },
] as const;

const read = (k: string) => {
  try {
    return localStorage.getItem(k) ?? '';
  } catch {
    return '';
  }
};
const write = (k: string, v: string) => {
  try {
    if (v) localStorage.setItem(k, v);
    else localStorage.removeItem(k);
  } catch {
    /* navegador sem armazenamento */
  }
  window.dispatchEvent(new Event('rutte:ai-key'));
};

export const getAiKey = () => read(KEY_STORAGE);
export const setAiKey = (k: string) => write(KEY_STORAGE, k.trim());
export const getAiModel = () => read(MODEL_STORAGE) || AI_MODELS[0].id;
export const setAiModel = (m: string) => write(MODEL_STORAGE, m);
export const looksLikeAnthropicKey = (k: string) => /^sk-ant-[A-Za-z0-9_-]{20,}$/.test(k.trim());

/* ---------------------------------- Personalidade ---------------------------------- */

export const PERSONAS = [
  { id: 'motivadora', label: 'Motivadora', emoji: '🔥', prompt: 'Seja animada e encorajadora: celebre cada avanço, use energia positiva e chame para a ação, sem exagerar.' },
  { id: 'calma', label: 'Calma', emoji: '🌿', prompt: 'Seja serena e acolhedora: fale com leveza, valide sentimentos e proponha passos pequenos e possíveis.' },
  { id: 'direta', label: 'Direta', emoji: '🎯', prompt: 'Seja objetiva e prática: vá direto ao ponto, use listas curtas e diga claramente o que fazer primeiro.' },
  { id: 'divertida', label: 'Divertida', emoji: '😄', prompt: 'Seja bem-humorada e leve: use um pouco de humor brasileiro e emojis com moderação, mantendo as dicas úteis.' },
] as const;
export type PersonaId = (typeof PERSONAS)[number]['id'];

/* ------------------------------------ Contexto ------------------------------------ */

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const PRIORITY_PT: Record<Priority, string> = { URGENT: 'urgente', HIGH: 'alta', MEDIUM: 'média', LOW: 'baixa' };

/** Resumo dos dados do app para a IA (curto, para gastar poucos tokens). */
export async function buildContext(persona: PersonaId): Promise<string> {
  const [tasks, user, wheel, gym, focus, gratitude, relationship] = await Promise.all([
    api.listTasks(),
    api.getUser(),
    api.listWheelAssessments(),
    api.getGym(),
    api.listFocusSessions(),
    api.listGratitude(),
    api.getRelationship(),
  ]);
  const today = todayISO();
  const now = new Date();
  const open = tasks.filter((t) => !isClosed(t)).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const overdue = open.filter((t) => t.dueDate < today);
  const doneWeek = tasks.filter((t) => t.completedAt && differenceInCalendarDays(now, parseISO(t.completedAt)) <= 7).length;

  const taskLine = (t: Task) =>
    `- [${t.id}] ${t.title} · vence ${t.dueDate}${t.deadlineTime ? ' ' + t.deadlineTime : ''} · prioridade ${PRIORITY_PT[t.priority]} · ${t.scope === 'BUSINESS' ? 'empresa' : 'pessoal'}${t.status === 'IN_PROGRESS' ? ' · em andamento' : ''}${t.lifeAreaId ? ' · área ' + LIFE_AREA_BY_ID[t.lifeAreaId]?.short : ''}${t.recurrenceRule ? ' · recorrente' : ''}`;

  const lastWheel = wheel.at(-1);
  const wheelText = lastWheel
    ? LIFE_AREAS.map((a) => `${a.short} ${lastWheel.scores[a.id]}`).join(', ') + ` (avaliado em ${lastWheel.date})`
    : 'ainda não avaliada';

  const sessions = [...gym.sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const focusMin = focus.filter((f) => f.date >= weekStart).reduce((n, f) => n + f.minutes, 0);
  const persona_ = PERSONAS.find((p) => p.id === persona) ?? PERSONAS[0];

  return [
    'Você é a Rutte, a secretária digital da pessoa, dentro do app Rutte (produtividade e desenvolvimento pessoal).',
    'Responda sempre em português do Brasil, com mensagens curtas e práticas (no máximo ~180 palavras, salvo se pedirem mais). Use listas com "-" e **negrito** quando ajudar.',
    `Personalidade: ${persona_.prompt}`,
    'Você pode criar, concluir e adiar afazeres com as ferramentas. Só use quando a pessoa pedir ou concordar; ao criar vários, confirme o que foi criado. Datas no formato yyyy-MM-dd.',
    'Não invente dados que não estão abaixo. Para saúde, finanças ou emoções sérias, dê orientações gerais e sugira um profissional quando fizer sentido.',
    '',
    `Agora: ${format(now, "EEEE, d 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })} (hoje = ${today}).`,
    user
      ? `Pessoa: ${user.name}. Situação: ${user.situations.map((s) => SITUATIONS[s]?.label).join(', ') || '—'}. Objetivos: ${user.goals.map((g) => GOALS[g]?.label).join(', ') || '—'}. Rende mais: ${PEAKS[user.peak]?.label ?? user.peak}. Maior dificuldade: ${STRUGGLES[user.struggle]?.label ?? user.struggle}.`
      : 'Pessoa ainda não fez a personalização.',
    relationship ? `Vida amorosa: ${relationship === 'casal' ? 'em um relacionamento' : 'solteiro(a)'}.` : '',
    '',
    `Afazeres abertos (${open.length}; ${overdue.length} atrasados; ${doneWeek} concluídos nos últimos 7 dias):`,
    ...(open.length ? open.slice(0, 60).map(taskLine) : ['- nenhum']),
    '',
    `Roda da Vida (0–10): ${wheelText}.`,
    `Academia: objetivo ${gym.profile?.goal ?? '—'}; plano semanal: ${gym.plan.filter((d) => d.title).map((d) => `${WEEKDAYS[d.weekday]} ${d.title}`).join(', ') || '—'}; últimos treinos: ${sessions.map((s) => `${s.date} ${s.title}`).join('; ') || 'nenhum'}.`,
    `Foco (pomodoro) nesta semana: ${focusMin} min. Diário de gratidão: ${gratitude.length} registros${gratitude[0] ? `, último em ${gratitude[0].date}` : ''}.`,
  ]
    .filter((l) => l !== undefined)
    .join('\n');
}

/* ----------------------------------- Ferramentas ----------------------------------- */

export const TOOLS = [
  {
    name: 'criar_afazer',
    description: 'Cria um afazer na lista da pessoa.',
    input_schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string', description: 'Título curto e acionável' },
        data: { type: 'string', description: 'Data de vencimento yyyy-MM-dd' },
        horario: { type: 'string', description: 'Horário HH:mm (opcional)' },
        prioridade: { type: 'string', enum: ['URGENT', 'HIGH', 'MEDIUM', 'LOW'] },
        o_que_fazer: { type: 'string', description: 'Detalhes do que fazer (opcional)' },
        recorrencia: { type: 'string', enum: ['DIARIA', 'SEMANAL', 'MENSAL'], description: 'Opcional' },
        escopo: { type: 'string', enum: ['PESSOAL', 'EMPRESA'] },
        area: { type: 'string', enum: LIFE_AREAS.map((a) => a.id), description: 'Área da Roda da Vida (opcional)' },
      },
      required: ['titulo', 'data'],
    },
  },
  {
    name: 'concluir_afazer',
    description: 'Marca um afazer como concluído, pelo id mostrado entre colchetes.',
    input_schema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
  },
  {
    name: 'adiar_afazer',
    description: 'Muda a data de vencimento de um afazer.',
    input_schema: { type: 'object', properties: { id: { type: 'string' }, nova_data: { type: 'string', description: 'yyyy-MM-dd' } }, required: ['id', 'nova_data'] },
  },
] as const;

const RRULE = { DIARIA: 'FREQ=DAILY', SEMANAL: 'FREQ=WEEKLY', MENSAL: 'FREQ=MONTHLY' } as const;
const isDate = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

/** Executa uma ferramenta pedida pela IA e devolve o resultado + um resumo para mostrar na conversa. */
export async function runTool(name: string, input: Record<string, unknown>): Promise<{ result: string; summary: string; ok: boolean }> {
  try {
    if (name === 'criar_afazer') {
      const data: TaskInput = {
        title: String(input.titulo ?? '').slice(0, 140) || 'Novo afazer',
        whatToDo: input.o_que_fazer ? String(input.o_que_fazer) : undefined,
        status: 'NOT_STARTED',
        priority: (['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const).includes(input.prioridade as Priority) ? (input.prioridade as Priority) : 'MEDIUM',
        dueDate: isDate(input.data) ? input.data : todayISO(),
        deadlineTime: typeof input.horario === 'string' && /^\d{2}:\d{2}$/.test(input.horario) ? input.horario : undefined,
        recurrenceRule: RRULE[input.recorrencia as keyof typeof RRULE],
        scope: input.escopo === 'EMPRESA' ? 'BUSINESS' : 'PERSONAL',
        lifeAreaId: LIFE_AREAS.some((a) => a.id === input.area) ? (input.area as LifeAreaId) : undefined,
        subtasks: [],
        links: [],
      };
      const t = await api.createTask(data);
      return { ok: true, result: JSON.stringify({ ok: true, id: t.id }), summary: `Afazer criado: ${t.title} (${format(parseISO(t.dueDate), 'dd/MM')})` };
    }
    if (name === 'concluir_afazer') {
      const { task } = await api.updateTask(String(input.id), { status: 'COMPLETED' });
      return { ok: true, result: JSON.stringify({ ok: true }), summary: `Concluído: ${task.title}` };
    }
    if (name === 'adiar_afazer') {
      if (!isDate(input.nova_data)) throw new Error('data inválida');
      const { task } = await api.updateTask(String(input.id), { dueDate: input.nova_data });
      return { ok: true, result: JSON.stringify({ ok: true }), summary: `Adiado: ${task.title} → ${format(parseISO(input.nova_data), 'dd/MM')}` };
    }
    throw new Error('ferramenta desconhecida');
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'erro';
    return { ok: false, result: JSON.stringify({ ok: false, erro: msg }), summary: `Não consegui executar (${msg})` };
  }
}

/* ------------------------------------ Conversa ------------------------------------ */

export type Block =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool_use_id: string; content: string; is_error?: boolean };

export interface ApiMessage {
  role: 'user' | 'assistant';
  content: Block[];
}

export class AiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

/** Uma chamada à API com streaming. `onText` recebe o texto à medida que chega. */
async function streamOnce(messages: ApiMessage[], system: string, signal: AbortSignal, onText: (t: string) => void): Promise<{ content: Block[]; stop: string }> {
  const key = getAiKey();
  if (!key) throw new AiError('Configure sua chave da Claude primeiro.');
  let res: Response;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({ model: getAiModel(), max_tokens: 1500, system, tools: TOOLS, messages, stream: true }),
    });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new AiError('Sem conexão com a Claude. Verifique a internet.');
  }
  if (!res.ok || !res.body) {
    let detail = '';
    try {
      detail = (await res.json())?.error?.message ?? '';
    } catch {
      /* sem corpo */
    }
    const msg =
      res.status === 401
        ? 'A chave da Claude é inválida. Confira em Configurações → Rutte IA.'
        : res.status === 429
          ? 'Muitas mensagens em pouco tempo (ou limite da conta). Tente de novo em instantes.'
          : res.status === 400 && /credit|billing/i.test(detail)
            ? 'Sua conta da Anthropic está sem créditos. Adicione créditos no console da Anthropic.'
            : `A Claude respondeu com erro ${res.status}${detail ? `: ${detail}` : ''}.`;
    throw new AiError(msg, res.status);
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  const blocks: (Block & { _json?: string })[] = [];
  let stop = 'end_turn';
  let buf = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl;
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line.startsWith('data:')) continue;
      let ev: Record<string, unknown>;
      try {
        ev = JSON.parse(line.slice(5));
      } catch {
        continue;
      }
      const type = ev.type as string;
      if (type === 'content_block_start') {
        const cb = ev.content_block as Record<string, unknown>;
        blocks[ev.index as number] = cb.type === 'tool_use' ? { type: 'tool_use', id: cb.id as string, name: cb.name as string, input: {}, _json: '' } : { type: 'text', text: '' };
      } else if (type === 'content_block_delta') {
        const d = ev.delta as Record<string, string>;
        const b = blocks[ev.index as number];
        if (d.type === 'text_delta' && b?.type === 'text') {
          b.text += d.text;
          onText(d.text);
        } else if (d.type === 'input_json_delta' && b?.type === 'tool_use') b._json += d.partial_json;
      } else if (type === 'content_block_stop') {
        const b = blocks[ev.index as number];
        if (b?.type === 'tool_use') {
          try {
            b.input = b._json ? JSON.parse(b._json) : {};
          } catch {
            b.input = {};
          }
          delete b._json;
        }
      } else if (type === 'message_delta') {
        stop = ((ev.delta as Record<string, string>)?.stop_reason as string) ?? stop;
      } else if (type === 'error') {
        throw new AiError(((ev.error as Record<string, string>)?.message as string) ?? 'Erro na resposta da Claude.');
      }
    }
  }
  return { content: blocks.filter(Boolean).filter((b) => b.type !== 'text' || b.text), stop };
}

/**
 * Envia a conversa e resolve as ferramentas pedidas (até 4 rodadas).
 * Devolve as novas mensagens (respostas da IA e resultados das ferramentas) para guardar no histórico.
 */
export async function chat(
  history: ApiMessage[],
  persona: PersonaId,
  signal: AbortSignal,
  hooks: { onText: (t: string) => void; onTool: (summary: string, ok: boolean) => void; onRound: () => void },
): Promise<ApiMessage[]> {
  const system = await buildContext(persona);
  const added: ApiMessage[] = [];
  for (let round = 0; round < 5; round++) {
    const { content, stop } = await streamOnce([...history, ...added], system, signal, hooks.onText);
    added.push({ role: 'assistant', content });
    if (stop !== 'tool_use') break;
    const results: Block[] = [];
    for (const b of content) {
      if (b.type !== 'tool_use') continue;
      const r = await runTool(b.name, b.input);
      hooks.onTool(r.summary, r.ok);
      results.push({ type: 'tool_result', tool_use_id: b.id, content: r.result, is_error: !r.ok });
    }
    added.push({ role: 'user', content: results });
    hooks.onRound();
  }
  return added;
}

/** Atalhos de conversa. */
export const QUICK_PROMPTS = [
  { label: '☀️ Resumo da manhã', text: 'Faça meu resumo da manhã: o que é mais importante hoje, o que está atrasado e uma dica para o dia.' },
  { label: '🌙 Revisão da noite', text: 'Vamos fazer a revisão da noite: o que concluí, o que ficou pendente e como deixar o amanhã mais leve.' },
  { label: '🗓️ Planejar a semana', text: 'Me ajude a planejar a semana: distribua meus afazeres por dia de forma realista e diga o que posso adiar.' },
  { label: '🎯 Onde focar', text: 'Olhando minha Roda da Vida e meus afazeres, em quais áreas devo focar agora? Sugira 3 ações pequenas.' },
  { label: '💪 Treino de hoje', text: 'Com base no meu plano e nos últimos treinos, qual treino faço hoje e o que preciso lembrar?' },
  { label: '😮‍💨 Estou sobrecarregado(a)', text: 'Estou me sentindo sobrecarregado(a). Me ajude a escolher só o essencial de hoje.' },
] as const;
