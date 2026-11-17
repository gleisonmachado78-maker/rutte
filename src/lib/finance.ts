/**
 * Finanças e sonhos: contas (quanto guardar por mês, quando chego lá) e o catálogo de métodos
 * para conseguir o dinheiro (ganhar mais, gastar menos, fazer render). Conteúdo educativo.
 */
import { addMonths, differenceInCalendarDays, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Dream, DreamPlanConfig, FinanceBudget } from '@/types';

/* ---------------------------------- Dinheiro ---------------------------------- */

export const brl = (n: number, cents = false) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });

/** "R$ 1.234,56" / "1234,5" / "1.234" → número (NaN se vazio ou inválido). */
export function parseMoney(s: string): number {
  const t = s.replace(/[R$\s]/g, '');
  if (!t) return NaN;
  // com vírgula: ponto é milhar; sem vírgula: ponto seguido de 3 dígitos também é milhar
  const norm = t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : /^\d{1,3}(\.\d{3})+$/.test(t) ? t.replace(/\./g, '') : t;
  const n = Number(norm);
  return Number.isFinite(n) ? n : NaN;
}

/** Número → texto para editar no campo (sem "R$"). */
export const moneyInput = (n: number | undefined) => (n ? n.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '');

export const monthLabel = (iso: string) => format(parseISO(iso), "MMM 'de' yyyy", { locale: ptBR });

/* ----------------------------------- Contas ----------------------------------- */

export const DEFAULT_RATE = 0.8;

export const savedOf = (d: Pick<Dream, 'deposits'>) => d.deposits.reduce((s, x) => s + x.amount, 0);

/** Meses inteiros (depósitos mensais) entre hoje e o prazo; mínimo 1. */
export function monthsUntil(deadline: string, from = new Date()) {
  const days = differenceInCalendarDays(parseISO(deadline), from);
  return Math.max(1, Math.floor(days / 30.44));
}

/** Quanto guardar por mês para chegar ao valor no prazo, com rendimento mensal `rate` (%). */
export function monthlyNeeded(target: number, saved: number, months: number, rate: number) {
  const r = rate / 100;
  const n = Math.max(1, months);
  if (saved >= target) return 0;
  if (r <= 0) return (target - saved) / n;
  const g = (1 + r) ** n;
  return Math.max(0, ((target - saved * g) * r) / (g - 1));
}

/** Guardando `perMonth` por mês, em quantos meses chega (Infinity se nunca). */
export function monthsToReach(target: number, saved: number, perMonth: number, rate: number) {
  if (saved >= target) return 0;
  const r = rate / 100;
  if (perMonth <= 0 && (r <= 0 || saved <= 0)) return Infinity;
  if (r <= 0) return (target - saved) / perMonth;
  const n = Math.log((perMonth + target * r) / (perMonth + saved * r)) / Math.log(1 + r);
  return Number.isFinite(n) && n > 0 ? n : Infinity;
}

export interface DreamPlan {
  saved: number;
  remaining: number;
  pct: number;
  months: number;
  perMonth: number;
  perWeek: number;
  perDay: number;
  /** quanto já deveria ter, se guardasse igual desde o começo */
  expectedNow: number;
  status: 'realizado' | 'adiantado' | 'no-ritmo' | 'atrasado' | 'vencido';
}

export function planFor(d: Dream, rate = DEFAULT_RATE, today = new Date()): DreamPlan {
  const saved = savedOf(d);
  const remaining = Math.max(0, d.target - saved);
  const months = monthsUntil(d.deadline, today);
  const perMonth = monthlyNeeded(d.target, saved, months, rate);
  const total = Math.max(1, differenceInCalendarDays(parseISO(d.deadline), parseISO(d.createdAt)));
  const elapsed = Math.min(total, Math.max(0, differenceInCalendarDays(today, parseISO(d.createdAt))));
  const expectedNow = (d.target * elapsed) / total;
  const overdue = differenceInCalendarDays(parseISO(d.deadline), today) < 0;
  const status: DreamPlan['status'] =
    saved >= d.target ? 'realizado' : overdue ? 'vencido' : saved >= expectedNow * 1.1 && saved > 0 ? 'adiantado' : saved >= expectedNow * 0.85 ? 'no-ritmo' : 'atrasado';
  return {
    saved,
    remaining,
    pct: d.target > 0 ? Math.min(100, (saved / d.target) * 100) : 0,
    months,
    perMonth,
    perWeek: (perMonth * 12) / 52,
    perDay: (perMonth * 12) / 365,
    expectedNow,
    status,
  };
}

export const STATUS_INFO: Record<DreamPlan['status'], { label: string; tone: string }> = {
  realizado: { label: 'Realizado', tone: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
  adiantado: { label: 'Adiantado', tone: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
  'no-ritmo': { label: 'No ritmo', tone: 'bg-sky-500/15 text-sky-700 dark:text-sky-300' },
  atrasado: { label: 'Abaixo do ritmo', tone: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
  vencido: { label: 'Prazo passou', tone: 'bg-red-500/15 text-red-700 dark:text-red-300' },
};

/** Data em que chega guardando `perMonth`. */
export const reachDate = (months: number) => (Number.isFinite(months) ? format(addMonths(new Date(), Math.ceil(months)), 'yyyy-MM-dd') : null);

/** Sobra do mês e quanto falta para os sonhos caberem no orçamento. */
export function budgetCheck(budget: FinanceBudget | null | undefined, needed: number) {
  if (!budget || !budget.income) return null;
  const free = budget.income - budget.expenses;
  return { free, needed, gap: Math.max(0, needed - free), share: free > 0 ? needed / free : Infinity };
}

/* ------------------------------ Ideias de sonhos ------------------------------ */

export interface DreamIdea {
  title: string;
  emoji: string;
  target: number;
  months: number;
  methods: string[];
}

export const DREAM_IDEAS: DreamIdea[] = [
  { title: 'Reserva de emergência', emoji: '🛟', target: 15000, months: 12, methods: ['pague-se', 'orcamento', 'render'] },
  { title: 'Viagem dos sonhos', emoji: '✈️', target: 8000, months: 10, methods: ['pague-se', 'desafio52', 'vender'] },
  { title: 'Carro', emoji: '🚗', target: 50000, months: 36, methods: ['promocao', 'renda-extra', 'render'] },
  { title: 'Entrada da casa própria', emoji: '🏠', target: 80000, months: 48, methods: ['promocao', 'pague-se', 'render'] },
  { title: 'Abrir meu negócio', emoji: '🚀', target: 20000, months: 18, methods: ['negocio', 'renda-extra', 'cortar'] },
  { title: 'Casamento', emoji: '💍', target: 35000, months: 24, methods: ['orcamento', 'renda-extra', 'extras'] },
  { title: 'Estudos / curso', emoji: '🎓', target: 12000, months: 12, methods: ['promocao', 'cortar', 'extras'] },
  { title: 'Celular ou notebook novo', emoji: '💻', target: 5000, months: 6, methods: ['vender', 'cortar', 'consciente'] },
  { title: 'Quitar dívidas', emoji: '🧾', target: 10000, months: 12, methods: ['dividas', 'orcamento', 'vender'] },
];

export const DREAM_EMOJIS = ['✨', '🛟', '✈️', '🚗', '🏠', '🚀', '💍', '🎓', '💻', '🧾', '🏖️', '🏍️', '👶', '🐶', '🎸', '💪', '🌎', '💰'];

/* ------------------------------ Métodos para chegar ------------------------------ */

export type MethodGroup = 'ganhar' | 'economizar' | 'render';

export const METHOD_GROUPS: { id: MethodGroup; label: string; intro: string }[] = [
  { id: 'ganhar', label: 'Ganhar mais', intro: 'Aumentar a renda é o que mais encurta o caminho até o sonho.' },
  { id: 'economizar', label: 'Gastar menos', intro: 'Cada real que deixa de sair vira um real guardado, sem depender de ninguém.' },
  { id: 'render', label: 'Fazer render', intro: 'Organizar e deixar o dinheiro trabalhando enquanto você trabalha.' },
];

export interface FinanceMethod {
  id: string;
  group: MethodGroup;
  emoji: string;
  title: string;
  summary: string;
  /** potencial aproximado */
  potential: string;
  /** em quanto tempo costuma dar resultado */
  time: string;
  steps: string[];
}

export const METHODS: FinanceMethod[] = [
  {
    id: 'promocao',
    group: 'ganhar',
    emoji: '📈',
    title: 'Conseguir uma promoção',
    summary: 'Mostrar resultado, deixar claro que você quer crescer e chegar preparado para a conversa.',
    potential: '+10% a 30% no salário',
    time: '6 a 12 meses',
    steps: [
      'Pergunte ao seu gestor o que é esperado de quem ocupa o próximo cargo',
      'Escolha 2 ou 3 entregas com resultado que dê para medir (tempo, dinheiro, clientes)',
      'Faça um curso ou certificação ligado ao cargo que você quer',
      'Anote suas conquistas toda sexta-feira (vira argumento na conversa)',
      'Peça uma conversa de feedback a cada 3 meses',
      'Pesquise quanto o mercado paga para o cargo e marque a conversa de promoção',
    ],
  },
  {
    id: 'emprego',
    group: 'ganhar',
    emoji: '💼',
    title: 'Negociar aumento ou trocar de emprego',
    summary: 'Às vezes o salário só sobe de verdade mudando de empresa, ou mostrando que poderia mudar.',
    potential: '+15% a 40% no salário',
    time: '2 a 6 meses',
    steps: [
      'Pesquise a faixa salarial do seu cargo (Glassdoor, Vagas, LinkedIn)',
      'Atualize o currículo e o LinkedIn com resultados em números',
      'Candidate-se a 3 vagas por semana, mesmo sem pressa de sair',
      'Treine as respostas mais comuns de entrevista em voz alta',
      'Com uma proposta na mão, converse com calma na empresa atual',
    ],
  },
  {
    id: 'negocio',
    group: 'ganhar',
    emoji: '🚀',
    title: 'Abrir um negócio',
    summary: 'Começar pequeno, vender antes de investir pesado e reinvestir o lucro.',
    potential: 'Sem teto (começa variável)',
    time: '3 a 12 meses para engrenar',
    steps: [
      'Liste problemas que você sabe resolver ou produtos que você domina',
      'Valide: tente vender para 10 pessoas antes de gastar com estrutura',
      'Calcule custo, preço de venda e margem de cada produto ou serviço',
      'Formalize como MEI no gov.br se a atividade e o faturamento se encaixarem',
      'Abra uma conta separada para o negócio e se pague um "salário" fixo',
      'Reinvista parte do lucro e acompanhe as vendas toda semana',
    ],
  },
  {
    id: 'renda-extra',
    group: 'ganhar',
    emoji: '🛠️',
    title: 'Renda extra com uma habilidade',
    summary: 'Freelance, aulas, consultoria, bicos de fim de semana: vender algumas horas do que você já sabe fazer.',
    potential: 'R$ 300 a R$ 3.000 por mês',
    time: '1 a 2 meses',
    steps: [
      'Liste 3 coisas que você faz bem e pelas quais alguém pagaria',
      'Defina quantas horas por semana pode dedicar (comece com 5)',
      'Defina um preço por hora ou por serviço olhando quem já faz',
      'Divulgue para conhecidos e em plataformas (Workana, 99Freelas, GetNinjas)',
      'Peça indicação e avaliação a cada cliente atendido',
    ],
  },
  {
    id: 'vender',
    group: 'ganhar',
    emoji: '📦',
    title: 'Vender o que você não usa',
    summary: 'Roupas, eletrônicos, móveis e objetos parados viram dinheiro rápido para o sonho.',
    potential: 'R$ 200 a R$ 2.000 de uma vez',
    time: '2 a 4 semanas',
    steps: [
      'Separe tudo o que você não usou nos últimos 12 meses',
      'Tire fotos com boa luz e fundo limpo',
      'Anuncie (OLX, Marketplace do Facebook, Enjoei) com preço justo',
      'Coloque 100% do que vender direto no sonho',
    ],
  },
  {
    id: 'orcamento',
    group: 'economizar',
    emoji: '📊',
    title: 'Organizar o orçamento (50/30/20)',
    summary: '50% para necessidades, 30% para desejos e 20% para o futuro: um ponto de partida simples.',
    potential: '10% a 20% da renda',
    time: '1 mês',
    steps: [
      'Anote todos os gastos por 30 dias (cartão, Pix e dinheiro)',
      'Separe em necessidades, desejos e futuro',
      'Veja quanto sobra hoje e preencha "Seu mês" aqui na Rutte',
      'Defina um teto para os desejos e acompanhe toda semana',
    ],
  },
  {
    id: 'cortar',
    group: 'economizar',
    emoji: '✂️',
    title: 'Cortar assinaturas e taxas esquecidas',
    summary: 'Streaming, apps, tarifas bancárias e seguros que ninguém lembra que existem.',
    potential: 'R$ 50 a R$ 400 por mês',
    time: '1 dia',
    steps: [
      'Abra as faturas dos últimos 3 meses e marque tudo que é recorrente',
      'Cancele o que você não usou no último mês',
      'Troque a conta com tarifa por uma conta digital gratuita',
      'Mande para o sonho todo mês o valor que deixou de pagar',
    ],
  },
  {
    id: 'dividas',
    group: 'economizar',
    emoji: '🧾',
    title: 'Renegociar contas e dívidas',
    summary: 'Juros de cartão e cheque especial comem qualquer sonho: primeiro estancar, depois guardar.',
    potential: 'R$ 100 a R$ 1.000 por mês',
    time: '1 a 3 meses',
    steps: [
      'Liste todas as dívidas com valor, juros ao mês e parcelas',
      'Ataque primeiro a de juros mais altos (cartão e cheque especial)',
      'Negocie desconto à vista ou parcelamento menor (Serasa Limpa Nome e o próprio banco)',
      'Peça desconto na internet, celular e seguros mostrando oferta da concorrência',
      'Quando quitar, continue pagando a mesma parcela, só que para o sonho',
    ],
  },
  {
    id: 'consciente',
    group: 'economizar',
    emoji: '🛒',
    title: 'Consumo consciente',
    summary: 'Pequenos hábitos que, somados, viram centenas de reais por mês.',
    potential: 'R$ 100 a R$ 600 por mês',
    time: 'imediato',
    steps: [
      'Regra das 48 horas: espere 2 dias antes de qualquer compra não planejada',
      'Vá ao mercado com lista e depois de comer',
      'Cozinhe em casa e leve marmita 3 vezes por semana',
      'Tire o cartão salvo dos apps de compra',
    ],
  },
  {
    id: 'desafio52',
    group: 'economizar',
    emoji: '🗓️',
    title: 'Desafio das 52 semanas',
    summary: 'Guarde R$ 10 na semana 1, R$ 20 na semana 2… Em um ano são R$ 13.780.',
    potential: 'R$ 13.780 em um ano',
    time: '12 meses',
    steps: [
      'Crie um lembrete semanal para guardar o valor da semana',
      'Registre cada depósito aqui no sonho para ver a barra subir',
      'Se uma semana apertar, troque com uma semana de valor menor',
    ],
  },
  {
    id: 'pague-se',
    group: 'render',
    emoji: '🏦',
    title: 'Pague-se primeiro',
    summary: 'Guardar no dia em que o dinheiro entra, não com o que sobra no fim do mês.',
    potential: 'O valor por mês do seu sonho',
    time: 'a partir do próximo salário',
    steps: [
      'Pegue o valor por mês que a Rutte calculou para o sonho',
      'Programe uma transferência automática para o dia do pagamento',
      'Use uma conta ou "caixinha" separada, só para o sonho',
      'Registre o depósito aqui todo mês',
    ],
  },
  {
    id: 'render',
    group: 'render',
    emoji: '🌱',
    title: 'Deixar o dinheiro rendendo com segurança',
    summary: 'Dinheiro parado na conta corrente perde para a inflação. Para sonhos, priorize segurança e poder sacar quando precisar.',
    potential: 'Rendimento sobre o que já guardou',
    time: 'contínuo',
    steps: [
      'Entenda as opções de renda fixa conservadoras (Tesouro Selic, CDB com liquidez diária, contas que rendem o CDI)',
      'Compare o rendimento líquido (já descontado o imposto) e a garantia do FGC',
      'Evite deixar o dinheiro do sonho parado na conta corrente',
      'Para sonhos de mais de 5 anos, converse com um profissional certificado sobre outras opções',
    ],
  },
  {
    id: 'extras',
    group: 'render',
    emoji: '🎁',
    title: 'Guardar o dinheiro extra',
    summary: '13º, férias, bônus, restituição do IR e presentes em dinheiro: o atalho mais fácil.',
    potential: '1 a 2 salários por ano',
    time: 'quando entrar',
    steps: [
      'Decida agora quanto de cada dinheiro extra vai para o sonho (sugestão: metade)',
      'Assim que cair, transfira antes de gastar',
      'Registre aqui como depósito com a observação "extra"',
    ],
  },
];

export const METHOD_BY_ID = Object.fromEntries(METHODS.map((m) => [m.id, m])) as Record<string, FinanceMethod>;

/* --------------------------- Plano para juntar o valor --------------------------- */

export interface PlanPart {
  id: string;
  methodId?: string;
  emoji: string;
  title: string;
  detail: string;
  /** por mês (0 se for de uma vez) */
  monthly: number;
  /** de uma vez */
  oneTime: number;
  total: number;
}

const roundUp = (n: number, step = 10) => Math.ceil(n / step) * step;

/**
 * Divide o que falta do sonho em fontes concretas (sobra, cortes, vendas, extras e renda extra),
 * cada uma com valor por mês e total no prazo. Conservador: não conta rendimento.
 */
export function savingPlan(d: Dream, budget: FinanceBudget | null | undefined, others: Dream[] = [], rate = DEFAULT_RATE, today = new Date()) {
  const saved = savedOf(d);
  const n = monthsUntil(d.deadline, today);
  let left = Math.max(0, d.target - saved);
  const parts: PlanPart[] = [];
  const push = (p: Omit<PlanPart, 'total'>) => {
    if (left <= 0) return;
    let { monthly, oneTime } = p;
    if (oneTime > left) oneTime = roundUp(left);
    if (monthly * n > left - oneTime) monthly = roundUp(Math.max(0, left - oneTime) / n);
    const total = Math.min(left, monthly * n + oneTime);
    if (total <= 0) return;
    left -= total;
    parts.push({ ...p, monthly, oneTime, total });
  };
  const totalFree = budget?.income ? Math.max(0, budget.income - budget.expenses) : null;
  // a sobra é dividida entre os sonhos em andamento, na proporção do que cada um pede por mês
  const need = (x: Dream) => {
    const pl = planFor(x, rate, today);
    return pl.status === 'realizado' || pl.status === 'vencido' ? 0 : pl.perMonth;
  };
  const mine = need(d);
  const all = mine + others.filter((x) => x.id !== d.id).reduce((s, x) => s + need(x), 0);
  // cortes e consumo também são divididos (o mesmo corte não paga dois sonhos)
  const share = all > 0 ? mine / all : 1;
  const free = totalFree === null ? null : all > totalFree && all > 0 ? (totalFree * mine) / all : totalFree;

  if (free) push({ id: 'sobra', methodId: 'pague-se', emoji: '🏦', title: 'Da sua sobra do mês', detail: others.length > 1 ? 'Sua parte da sobra, dividida entre os sonhos' : 'Transferência automática no dia do pagamento', monthly: Math.floor(free), oneTime: 0 });
  push({ id: 'cortar', methodId: 'cortar', emoji: '✂️', title: 'Cortar assinaturas e taxas', detail: 'Streaming, apps e tarifas que você não usa', monthly: roundUp(150 * share), oneTime: 0 });
  push({ id: 'consciente', methodId: 'consciente', emoji: '🛒', title: 'Consumo consciente', detail: 'Mercado com lista, marmita 3x por semana, regra das 48 h', monthly: roundUp(250 * share), oneTime: 0 });
  push({ id: 'vender', methodId: 'vender', emoji: '📦', title: 'Vender o que não usa', detail: 'Roupas, eletrônicos e objetos parados', monthly: 0, oneTime: 800 });
  if (n >= 6)
    push({
      id: 'extras',
      methodId: 'extras',
      emoji: '🎁',
      title: 'Metade do dinheiro extra',
      detail: '13º, férias, bônus ou restituição do IR',
      monthly: 0,
      oneTime: budget?.income ? roundUp(budget.income / 2, 50) : 1000,
    });
  if (left > 0)
    push({ id: 'renda-extra', methodId: 'renda-extra', emoji: '🛠️', title: 'Renda extra com uma habilidade', detail: 'Freelance, aulas, bicos de fim de semana', monthly: roundUp(left / n, 50), oneTime: 0 });

  const monthly = parts.reduce((s, p) => s + p.monthly, 0);
  return { parts, months: n, saved, monthly, total: parts.reduce((s, p) => s + p.total, 0) + saved };
}

export interface Boost {
  id: string;
  methodId: string;
  emoji: string;
  title: string;
  detail: string;
  /** a mais por mês */
  extra: number;
  /** de uma vez */
  oneTime: number;
  /** meses até realizar com o boost */
  months: number;
  /** meses a menos que o plano normal */
  gain: number;
}

/** Atalhos para ganhar mais e chegar antes: quanto rendem e quantos meses economizam. */
export function boostsFor(d: Dream, budget: FinanceBudget | null | undefined, rate = DEFAULT_RATE, today = new Date()): Boost[] {
  const plan = planFor(d, rate, today);
  if (plan.status === 'realizado') return [];
  const base = Math.max(plan.perMonth, 1);
  const baseMonths = monthsToReach(d.target, plan.saved, base, rate);
  const raise = budget?.income ? roundUp(budget.income * 0.15, 50) : 600;
  const opts: Omit<Boost, 'months' | 'gain'>[] = [
    { id: 'freela', methodId: 'renda-extra', emoji: '🛠️', title: 'Renda extra de 5 h por semana', detail: '≈ R$ 40 por hora em freelance, aulas ou bicos', extra: 800, oneTime: 0 },
    { id: 'promocao', methodId: 'promocao', emoji: '📈', title: 'Promoção ou aumento de 15%', detail: budget?.income ? `15% sobre ${brl(budget.income)} de renda` : 'Preencha "Seu mês" para calcular com a sua renda', extra: raise, oneTime: 0 },
    { id: 'negocio', methodId: 'negocio', emoji: '🚀', title: 'Negócio paralelo pequeno', detail: 'Lucro de R$ 1.500/mês depois de engrenar', extra: 1500, oneTime: 0 },
    { id: 'vender', methodId: 'vender', emoji: '📦', title: 'Vender o que não usa', detail: 'Um mutirão de vendas de uma vez', extra: 0, oneTime: 1000 },
    { id: 'tudo', methodId: 'renda-extra', emoji: '⚡', title: 'Renda extra + vendas + cortes', detail: 'R$ 800 de renda extra, R$ 400 de cortes e R$ 1.000 em vendas', extra: 1200, oneTime: 1000 },
  ];
  return opts.map((o) => {
    const months = monthsToReach(d.target, plan.saved + o.oneTime, base + o.extra, rate);
    return { ...o, months, gain: Math.max(0, Math.floor(baseMonths - months)) };
  });
}

/* ------------------------------ Simulador interativo ------------------------------ */

/** Inflação estimada ao ano (%) para corrigir o preço do sonho. */
export const INFLATION = 4.5;
/** Semanas por mês (para horas de renda extra). */
const WEEKS = 4.33;
export const PROMO_FROM = 6;
export const BUSINESS_FROM = 4;

/** Parte da sobra (e dos cortes) que cabe a este sonho quando há vários. */
export function shareOf(d: Dream, others: Dream[], rate = DEFAULT_RATE, today = new Date()) {
  const need = (x: Dream) => {
    const pl = planFor(x, rate, today);
    return pl.status === 'realizado' || pl.status === 'vencido' ? 0 : pl.perMonth;
  };
  const mine = need(d);
  const all = mine + others.filter((x) => x.id !== d.id).reduce((s, x) => s + need(x), 0);
  return all > 0 ? mine / all : 1;
}

/** Quantos dezembros cabem nos próximos `n` meses. */
export const decembersIn = (n: number, today = new Date()) => Array.from({ length: n }, (_, i) => addMonths(today, i + 1).getMonth()).filter((m) => m === 11).length;

/** Plano inicial: usa os números reais quando existem e completa com renda extra. */
export function defaultPlanConfig(d: Dream, budget: FinanceBudget | null | undefined, others: Dream[], rate = DEFAULT_RATE, today = new Date()): DreamPlanConfig {
  const share = shareOf(d, others, rate, today);
  const free = budget?.income ? Math.max(0, budget.income - budget.expenses) : 0;
  const n = monthsUntil(d.deadline, today);
  const cfg: DreamPlanConfig = {
    sobra: { on: free > 0, value: Math.floor((free * share) / 10) * 10 },
    cortes: { on: true, value: roundUp(150 * share) },
    consumo: { on: true, value: roundUp(250 * share) },
    vendas: { on: true, value: 800 },
    extra13: { on: decembersIn(n, today) > 0, value: budget?.income ? roundUp(budget.income / 2, 50) : 1000 },
    freela: { on: false, hours: 5, hourly: 40 },
    promocao: { on: false, pct: 10 },
    negocio: { on: false, value: 1500 },
    inflation: true,
  };
  // completa o que faltar com horas de renda extra (até 20 h por semana)
  const sim = simulate(d, cfg, budget, rate, today);
  if (sim.gapAtDeadline > 0) {
    const perMonth = sim.gapAtDeadline / n;
    cfg.freela = { on: true, hours: Math.min(20, Math.max(1, Math.ceil(perMonth / (cfg.freela.hourly * WEEKS)))), hourly: 40 };
  }
  return cfg;
}

export interface SimPoint {
  t: number;
  date: string;
  balance: number;
  target: number;
}

export interface SimResult {
  /** meses até o prazo */
  n: number;
  /** mês em que alcança (null = não alcança em 50 anos) */
  reach: number | null;
  reachDate: string | null;
  /** quanto entra por mês com tudo funcionando (depois de promoção e negócio) */
  monthlyFull: number;
  /** quanto entra por mês agora */
  monthlyNow: number;
  oneTimes: number;
  targetAtDeadline: number;
  balanceAtDeadline: number;
  gapAtDeadline: number;
  series: SimPoint[];
}

/** Valor por mês de cada fonte no mês `t` (1 = próximo mês). */
export function monthlyAt(cfg: DreamPlanConfig, budget: FinanceBudget | null | undefined, t: number) {
  let m = 0;
  if (cfg.sobra.on) m += cfg.sobra.value;
  if (cfg.cortes.on) m += cfg.cortes.value;
  if (cfg.consumo.on) m += cfg.consumo.value;
  if (cfg.freela.on) m += cfg.freela.hours * cfg.freela.hourly * WEEKS;
  if (cfg.promocao.on && t >= PROMO_FROM) m += ((budget?.income ?? 0) * cfg.promocao.pct) / 100;
  if (cfg.negocio.on && t >= BUSINESS_FROM) m += cfg.negocio.value;
  return m;
}

/** Simula mês a mês: depósitos, vendas, 13º em dezembro, rendimento e preço corrigido pela inflação. */
export function simulate(d: Dream, cfg: DreamPlanConfig, budget: FinanceBudget | null | undefined, rate = DEFAULT_RATE, today = new Date()): SimResult {
  const r = rate / 100;
  const inf = cfg.inflation ? (1 + INFLATION / 100) ** (1 / 12) - 1 : 0;
  const n = monthsUntil(d.deadline, today);
  let balance = savedOf(d);
  const series: SimPoint[] = [{ t: 0, date: format(today, 'yyyy-MM-dd'), balance, target: d.target }];
  let reach: number | null = balance >= d.target ? 0 : null;
  let oneTimes = 0;
  let atDeadline = { balance, target: d.target };
  for (let t = 1; t <= 600; t++) {
    const date = addMonths(today, t);
    let add = monthlyAt(cfg, budget, t);
    if (t === 1 && cfg.vendas.on) add += cfg.vendas.value;
    if (date.getMonth() === 11 && cfg.extra13.on) add += cfg.extra13.value;
    if (t <= n) oneTimes += (t === 1 && cfg.vendas.on ? cfg.vendas.value : 0) + (date.getMonth() === 11 && cfg.extra13.on ? cfg.extra13.value : 0);
    balance = balance * (1 + r) + add;
    const target = d.target * (1 + inf) ** t;
    if (t <= 120) series.push({ t, date: format(date, 'yyyy-MM-dd'), balance, target });
    if (t === n) atDeadline = { balance, target };
    if (reach === null && balance >= target) reach = t;
    if (reach !== null && t >= n && t >= Math.min(reach + 2, 120)) break;
  }
  const len = Math.min(120, Math.max(n, reach ?? n) + 2);
  return {
    n,
    reach,
    reachDate: reach !== null ? format(addMonths(today, reach), 'yyyy-MM-dd') : null,
    monthlyFull: monthlyAt(cfg, budget, 600),
    monthlyNow: monthlyAt(cfg, budget, 1),
    oneTimes,
    targetAtDeadline: atDeadline.target,
    balanceAtDeadline: atDeadline.balance,
    gapAtDeadline: Math.max(0, atDeadline.target - atDeadline.balance),
    series: series.slice(0, len + 1),
  };
}

/** Horas por semana de renda extra que fecham a diferença no prazo. */
export function hoursToClose(d: Dream, cfg: DreamPlanConfig, budget: FinanceBudget | null | undefined, rate = DEFAULT_RATE, today = new Date()) {
  for (let h = cfg.freela.on ? cfg.freela.hours : 0; h <= 40; h++) {
    const sim = simulate(d, { ...cfg, freela: { ...cfg.freela, on: h > 0, hours: h } }, budget, rate, today);
    if (sim.gapAtDeadline <= 0) return h;
  }
  return null;
}
