import {
  BookOpen,
  Brain,
  Briefcase,
  Church,
  HeartHandshake,
  HeartPulse,
  House,
  TreePalm,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { LifeAreaId } from '@/types';

export interface LifeArea {
  id: LifeAreaId;
  name: string;
  short: string;
  icon: LucideIcon;
  color: string;
  /** Pergunta-guia para dar a nota */
  question: string;
}

/** Áreas da Roda da Vida. As cores são de apoio (não substituem a paleta da marca) e sempre vêm com ícone + nome. */
export const LIFE_AREAS: LifeArea[] = [
  { id: 'saude', name: 'Saúde & Bem-estar', short: 'Saúde', icon: HeartPulse, color: '#DC2626', question: 'Como estão seu corpo, sono, alimentação e exercícios?' },
  { id: 'emocional', name: 'Equilíbrio Emocional', short: 'Emocional', icon: Brain, color: '#DB2777', question: 'Você lida bem com estresse, ansiedade e emoções?' },
  { id: 'intelectual', name: 'Desenvolvimento Intelectual', short: 'Intelectual', icon: BookOpen, color: '#7C3AED', question: 'Está aprendendo, lendo e evoluindo?' },
  { id: 'profissional', name: 'Carreira & Profissional', short: 'Profissional', icon: Briefcase, color: '#2563EB', question: 'Está satisfeito com seu trabalho e crescimento?' },
  { id: 'financas', name: 'Finanças', short: 'Finanças', icon: Wallet, color: '#059669', question: 'Suas contas, reservas e investimentos estão em ordem?' },
  { id: 'relacionamentos', name: 'Relacionamento Amoroso', short: 'Relacionamento', icon: HeartHandshake, color: '#E11D48', question: 'Como está sua vida amorosa — com seu par ou na busca por um?' },
  { id: 'familia', name: 'Família', short: 'Família', icon: House, color: '#D97706', question: 'Você tem tempo de qualidade com sua família?' },
  { id: 'social', name: 'Vida Social', short: 'Social', icon: Users, color: '#0891B2', question: 'Suas amizades e conexões estão nutridas?' },
  { id: 'espiritualidade', name: 'Espiritualidade', short: 'Espiritualidade', icon: Church, color: '#9333EA', question: 'Você se sente conectado à sua fé e propósito?' },
  { id: 'lazer', name: 'Lazer & Diversão', short: 'Lazer', icon: TreePalm, color: '#65A30D', question: 'Você descansa e faz coisas de que gosta?' },
];

export const LIFE_AREA_BY_ID = Object.fromEntries(LIFE_AREAS.map((a) => [a.id, a])) as Record<LifeAreaId, LifeArea>;

export const emptyScores = () =>
  Object.fromEntries(LIFE_AREAS.map((a) => [a.id, 5])) as Record<LifeAreaId, number>;

export interface LifeTip {
  title: string;
  /** Recorrência sugerida (RRULE simples) */
  recurrence?: 'FREQ=DAILY' | 'FREQ=WEEKLY' | 'FREQ=MONTHLY';
  /** explicação curta (vira o "o que fazer" do afazer) */
  how?: string;
}

/** Dicas de atividades para desenvolver cada área (sugestões — o usuário adapta). */
export const LIFE_TIPS: Record<LifeAreaId, LifeTip[]> = {
  saude: [
    { title: 'Caminhar 30 minutos', recurrence: 'FREQ=DAILY' },
    { title: 'Beber 2 litros de água', recurrence: 'FREQ=DAILY' },
    { title: 'Dormir antes das 23h (sem celular na cama)', recurrence: 'FREQ=DAILY' },
    { title: 'Agendar check-up e exames de rotina' },
    { title: 'Planejar as refeições da semana', recurrence: 'FREQ=WEEKLY' },
    { title: 'Alongar 10 minutos ao acordar', recurrence: 'FREQ=DAILY' },
  ],
  emocional: [
    { title: 'Escrever 3 coisas pelas quais sou grato', recurrence: 'FREQ=DAILY' },
    { title: 'Respiração 4-7-8 por 5 minutos', recurrence: 'FREQ=DAILY' },
    { title: 'Diário: como me senti hoje e por quê', recurrence: 'FREQ=DAILY' },
    { title: 'Desconectar das redes por 1 hora', recurrence: 'FREQ=DAILY' },
    { title: 'Conversar com alguém de confiança sobre o que me preocupa' },
    { title: 'Pesquisar/agendar sessão de terapia' },
  ],
  intelectual: [
    { title: 'Ler 10 páginas de um livro', recurrence: 'FREQ=DAILY' },
    { title: 'Escolher o próximo livro do mês', recurrence: 'FREQ=MONTHLY' },
    { title: 'Estudar 25 min (técnica Pomodoro)', recurrence: 'FREQ=DAILY' },
    { title: 'Assistir a uma aula ou documentário', recurrence: 'FREQ=WEEKLY' },
    { title: 'Anotar um aprendizado da semana', recurrence: 'FREQ=WEEKLY' },
    { title: 'Praticar um idioma por 15 minutos', recurrence: 'FREQ=DAILY' },
  ],
  profissional: [
    { title: 'Definir as 3 prioridades do dia', recurrence: 'FREQ=DAILY' },
    { title: 'Atualizar currículo e LinkedIn' },
    { title: 'Revisar metas do trimestre', recurrence: 'FREQ=MONTHLY' },
    { title: 'Fazer um curso da minha área' },
    { title: 'Pedir feedback ao gestor ou a um colega' },
    { title: 'Bloquear 2h de foco sem interrupções', recurrence: 'FREQ=WEEKLY' },
  ],
  financas: [
    { title: 'Anotar todos os gastos do dia', recurrence: 'FREQ=DAILY' },
    { title: 'Revisar o orçamento do mês', recurrence: 'FREQ=MONTHLY' },
    { title: 'Separar 10% da renda para a reserva de emergência', recurrence: 'FREQ=MONTHLY' },
    { title: 'Cancelar assinaturas que não uso' },
    { title: 'Listar dívidas e montar plano de quitação' },
    { title: 'Estudar um investimento por 20 minutos', recurrence: 'FREQ=WEEKLY' },
  ],
  relacionamentos: [
    { title: 'Noite a dois sem celular', recurrence: 'FREQ=WEEKLY' },
    { title: 'Mandar uma mensagem carinhosa sem motivo', recurrence: 'FREQ=DAILY' },
    { title: 'Planejar um passeio ou viagem juntos' },
    { title: 'Conversa sobre planos e sonhos do casal', recurrence: 'FREQ=MONTHLY' },
    { title: 'Fazer algo que meu par gosta' },
  ],
  familia: [
    { title: 'Ligar para meus pais', recurrence: 'FREQ=WEEKLY' },
    { title: 'Refeição em família sem telas', recurrence: 'FREQ=WEEKLY' },
    { title: 'Brincar/conversar 20 min com os filhos', recurrence: 'FREQ=DAILY' },
    { title: 'Organizar um almoço de domingo em família', recurrence: 'FREQ=MONTHLY' },
    { title: 'Lembrar datas importantes (aniversários) no calendário' },
  ],
  social: [
    { title: 'Mandar mensagem para um amigo que não vejo há tempo', recurrence: 'FREQ=WEEKLY' },
    { title: 'Marcar um café com um amigo' },
    { title: 'Participar de um grupo ou evento novo', recurrence: 'FREQ=MONTHLY' },
    { title: 'Fazer um trabalho voluntário' },
    { title: 'Elogiar alguém de forma sincera', recurrence: 'FREQ=DAILY' },
  ],
  espiritualidade: [
    { title: 'Oração ou meditação de 10 minutos', recurrence: 'FREQ=DAILY' },
    { title: 'Leitura devocional', recurrence: 'FREQ=DAILY' },
    { title: 'Ir ao culto/missa', recurrence: 'FREQ=WEEKLY' },
    { title: 'Momento de silêncio e reflexão sobre propósito', recurrence: 'FREQ=WEEKLY' },
    { title: 'Participar de um grupo de estudo ou pequeno grupo', recurrence: 'FREQ=WEEKLY' },
  ],
  lazer: [
    { title: 'Reservar 1 hora para um hobby', recurrence: 'FREQ=WEEKLY' },
    { title: 'Passeio ao ar livre no fim de semana', recurrence: 'FREQ=WEEKLY' },
    { title: 'Assistir a um filme sem culpa' },
    { title: 'Planejar as próximas férias' },
    { title: 'Aprender algo só por diversão (instrumento, desenho…)' },
    { title: 'Tarde sem compromissos', recurrence: 'FREQ=MONTHLY' },
  ],
};

/** Etapas para quem está solteiro(a) e quer encontrar um relacionamento. */
export const SINGLE_STEPS = [
  { id: 'comecar', label: 'Por onde começar', intro: 'Antes de procurar alguém, fique claro sobre o que você quer e cuide de quem você é.' },
  { id: 'onde', label: 'Onde conhecer pessoas', intro: 'Pessoas com valores parecidos costumam estar nos mesmos lugares que você gosta de frequentar.' },
  { id: 'acoes', label: 'Ações da semana', intro: 'Pequenas atitudes repetidas aumentam muito as chances de conhecer alguém especial.' },
  { id: 'cuidados', label: 'Cuidados', intro: 'Abra o coração, mas com segurança.' },
] as const;

export type SingleStepId = (typeof SINGLE_STEPS)[number]['id'];

/** Sugestões para quem está solteiro(a). */
export const SINGLE_TIPS: Record<SingleStepId, LifeTip[]> = {
  comecar: [
    { title: 'Escrever o que eu busco em um relacionamento', how: 'Liste 5 valores inegociáveis (respeito, fé, filhos, ambição…) e 3 coisas que você não aceita. Foque em valores, não em aparência.' },
    { title: 'Anotar o que aprendi com relações passadas', how: 'O que funcionou, o que não funcionou e o que você faria diferente. Isso evita repetir os mesmos padrões.' },
    { title: 'Fazer uma atividade só por mim', recurrence: 'FREQ=WEEKLY', how: 'Quem está bem consigo mesmo atrai relações mais saudáveis. Reserve um tempo para algo que te faz bem.' },
    { title: 'Renovar o visual (cabelo, roupas que me deixam confiante)', how: 'Não é para agradar ninguém: é para você se sentir bem e confiante ao sair.' },
    { title: 'Cuidar de feridas antigas (terapia, se precisar)', how: 'Se um término ainda dói ou você sente medo de se envolver, conversar com um psicólogo ajuda a começar leve.' },
  ],
  onde: [
    { title: 'Entrar em um grupo de hobby (corrida, trilha, dança, teatro)', recurrence: 'FREQ=WEEKLY', how: 'Atividades em grupo criam encontros naturais e repetidos — o jeito mais comum de as pessoas se conhecerem.' },
    { title: 'Fazer uma aula em grupo (dança de salão, idioma, culinária)', how: 'Aulas misturam pessoas novas toda semana e dão assunto pronto para puxar conversa.' },
    { title: 'Participar de um grupo da igreja ou da comunidade', recurrence: 'FREQ=WEEKLY', how: 'Bom caminho para quem quer alguém que compartilhe a mesma fé e os mesmos valores.' },
    { title: 'Aceitar convites de amigos para festas e encontros', how: 'Amigos em comum continuam sendo uma das principais formas de conhecer um par.' },
    { title: 'Pedir para amigos me apresentarem alguém', how: 'Diga aos amigos de confiança que você está aberto(a) a conhecer alguém e o que procura.' },
    { title: 'Fazer trabalho voluntário', recurrence: 'FREQ=MONTHLY', how: 'Você conhece pessoas generosas, com valores parecidos, fazendo algo que importa.' },
    { title: 'Criar um perfil honesto em um app de relacionamento', how: 'Fotos reais e atuais (sorrindo, fazendo algo que gosta) e uma bio sincera sobre quem você é e o que busca.' },
  ],
  acoes: [
    { title: 'Puxar conversa com uma pessoa nova', recurrence: 'FREQ=WEEKLY', how: 'Comece com algo do ambiente ou um elogio sincero e faça perguntas abertas. Sem pressão: é só treinar.' },
    { title: 'Ir a um lugar novo', recurrence: 'FREQ=WEEKLY', how: 'Sair da rotina de casa–trabalho multiplica as chances de cruzar com pessoas novas.' },
    { title: 'Convidar alguém interessante para um café', how: 'Primeiro encontro curto (30–60 min), leve e em lugar público. Se for bom, marque o segundo.' },
    { title: 'Praticar a escuta: perguntar mais e lembrar detalhes', recurrence: 'FREQ=DAILY', how: 'As pessoas se encantam por quem se interessa de verdade por elas.' },
    { title: 'Responder mensagens com interesse e sem joguinhos', how: 'Clareza e gentileza atraem quem também quer algo sério.' },
  ],
  cuidados: [
    { title: 'Marcar o primeiro encontro em lugar público e avisar um amigo', how: 'Compartilhe onde vai estar e com quem. Vá e volte por conta própria.' },
    { title: 'Nunca enviar dinheiro nem dados pessoais a quem conheci online', how: 'Pedidos de dinheiro, de documentos ou de fotos íntimas são sinais de golpe.' },
    { title: 'Observar sinais: respeito, coerência e como trata os outros', how: 'Repare em como a pessoa fala de ex, trata garçons e lida com um “não”.' },
  ],
};
