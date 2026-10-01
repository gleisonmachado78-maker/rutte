import type { LifeAreaId } from '@/types';

export type VideoStyle = 'animado' | 'palestra';

export interface LifeVideo {
  area: LifeAreaId;
  youtubeId: string;
  title: string;
  channel: string;
  /** animado = animação/ilustração explicativa; palestra = pessoa falando */
  style: VideoStyle;
  /** Duração aproximada e popularidade no momento da curadoria */
  meta: string;
}

/**
 * Curadoria de vídeos em português por área da vida — maioria animados/ilustrados
 * (menos cansativos) e algumas palestras marcantes.
 * IDs verificados via oEmbed do YouTube em 30/09/2026 (existentes e incorporáveis).
 */
export const LIFE_VIDEOS: LifeVideo[] = [
  // Saúde
  { area: 'saude', youtubeId: 'Un67JkVy0xo', title: 'Leite – Bebida Saudável ou Veneno?', channel: 'Em Poucas Palavras – Kurzgesagt', style: 'animado', meta: '10 min · 1,5 mi views' },
  { area: 'saude', youtubeId: '9YtebqIFB9Q', title: 'O SONO E A INSÔNIA', channel: 'Minutos Psíquicos', style: 'animado', meta: '5 min · 285 mil views' },
  { area: 'saude', youtubeId: 'IBHyEn6qMe4', title: 'ATIVIDADES FÍSICAS: APENAS FAÇA!', channel: 'Minutos Psíquicos', style: 'animado', meta: '5 min · 262 mil views' },
  { area: 'saude', youtubeId: 'Hvte3XpPceQ', title: 'Sedentarismo: o pai de todos os males | Coluna #107', channel: 'Drauzio Varella', style: 'palestra', meta: '5 min · 1 mi views' },

  // Emocional
  { area: 'emocional', youtubeId: 'Tv0gJTBmVuc', title: 'ANSIEDADE', channel: 'Minutos Psíquicos', style: 'animado', meta: '5 min · 1,5 mi views' },
  { area: 'emocional', youtubeId: 'AwxYSQGT734', title: '8 TÉCNICAS DE CONTROLE EMOCIONAL QUE MUITOS USAM', channel: 'Minutos Psíquicos', style: 'animado', meta: '11 min · 1,2 mi views' },
  { area: 'emocional', youtubeId: '5QFMjbwxJc0', title: '10 Hábitos para diminuir a ANSIEDADE | SejaUmaPessoaMelhor', channel: 'SejaUmaPessoaMelhor', style: 'animado', meta: '6 min · 330 mil views' },

  // Intelectual
  { area: 'intelectual', youtubeId: 'O_v-tIndr1M', title: 'Mude a sua vida – Um passinho de cada vez', channel: 'Em Poucas Palavras – Kurzgesagt', style: 'animado', meta: '11 min · 1,2 mi views' },
  { area: 'intelectual', youtubeId: '9BtrLf6PfYY', title: 'O PODER DO HÁBITO | Charles Duhigg | Resumo Animado do Livro', channel: 'IlustradaMente', style: 'animado', meta: '7 min · 1,2 mi views' },
  { area: 'intelectual', youtubeId: 'xjkHcFKUkKY', title: 'HÁBITOS ATÔMICOS | SejaUmaPessoaMelhor', channel: 'SejaUmaPessoaMelhor', style: 'animado', meta: '7 min · 330 mil views' },
  { area: 'intelectual', youtubeId: 'TRPBY_lxJfE', title: 'Motivação para estudar (BRIO) | Clóvis de Barros', channel: 'Clóvis de Barros', style: 'palestra', meta: '9 min · 5 mi views' },

  // Profissional
  { area: 'profissional', youtubeId: 'hfxfJ7Qa4sg', title: 'COMO TER MAIS FOCO | A TÉCNICA POMODORO | RESUMO ANIMADO', channel: 'IlustradaMente', style: 'animado', meta: '7 min · 2,2 mi views' },
  { area: 'profissional', youtubeId: 'PRcB4gGC4eA', title: 'OS 7 HÁBITOS DAS PESSOAS ALTAMENTE EFICAZES | Stephen Covey | Resumo Animado do Livro', channel: 'IlustradaMente', style: 'animado', meta: '9 min · 1,1 mi views' },
  { area: 'profissional', youtubeId: 'Mivz8Qh-DwI', title: 'PROCRASTINAÇÃO', channel: 'Minutos Psíquicos', style: 'animado', meta: '5 min · 445 mil views' },
  { area: 'profissional', youtubeId: 'ypt0YZKqwo8', title: 'Mario Sergio Cortella - Como ser o melhor profissional do mundo', channel: 'Canal do Cortella', style: 'palestra', meta: '7 min · 2,7 mi views' },

  // Finanças
  { area: 'financas', youtubeId: 'Mx6EEpsIE5w', title: 'Aprenda com o PAI RICO PAI POBRE como ficar RICO | Seja Uma Pessoa Melhor', channel: 'SejaUmaPessoaMelhor', style: 'animado', meta: '9 min · 3,8 mi views' },
  { area: 'financas', youtubeId: 'd6CI30Y_iSU', title: 'O Segredo Que Pode Deixar Qualquer Pessoa Rica | O HOMEM MAIS RICO DA BABILÔNIA | Resumo Animado', channel: 'IlustradaMente', style: 'animado', meta: '7 min · 865 mil views' },
  { area: 'financas', youtubeId: 'CB5zuxQl5ro', title: 'O Que É Educação Financeira? Como Usar o Dinheiro? | Educação Financeira Ilustrada (1/10)', channel: 'Manual da Evolução', style: 'animado', meta: '9 min · 315 mil views' },
  { area: 'financas', youtubeId: 'in0XbfQEm2A', title: 'COMO ORGANIZAR SUAS FINANÇAS E GUARDAR DINHEIRO | Planejamento financeiro FÁCIL', channel: 'O Primo Rico', style: 'palestra', meta: '17 min · 4,8 mi views' },

  // Relacionamento amoroso
  { area: 'relacionamentos', youtubeId: '8RzFggd8Nc8', title: 'Descubra AS 5 LINGUAGENS DO AMOR | Seja Uma Pessoa Melhor', channel: 'SejaUmaPessoaMelhor', style: 'animado', meta: '8 min · 1,1 mi views' },
  { area: 'relacionamentos', youtubeId: 'Y_hyuGHogCE', title: 'A PSICOLOGIA DO AMOR', channel: 'Minutos Psíquicos', style: 'animado', meta: '6 min · 269 mil views' },
  { area: 'relacionamentos', youtubeId: 'sm7_I41LIC8', title: '7 FATOS SOBRE RELACIONAMENTOS ROMÂNTICOS', channel: 'Minutos Psíquicos', style: 'animado', meta: '5 min · 267 mil views' },

  // Família
  { area: 'familia', youtubeId: 'y_r-S7KMq_8', title: 'COMO A SUA FAMÍLIA TE INFLUENCIA?', channel: 'Minutos Psíquicos', style: 'animado', meta: '10 min · 376 mil views' },
  { area: 'familia', youtubeId: 'h4-YXXKPXVg', title: 'O QUE É A ADOLESCÊNCIA?', channel: 'Minutos Psíquicos', style: 'animado', meta: '10 min · 441 mil views' },
  { area: 'familia', youtubeId: '9GghNaQBX8o', title: '5 Estilos de Parentalidade e Seus Efeitos na Vida', channel: 'Sprouts Português', style: 'animado', meta: '7 min · 12 mil views' },
  { area: 'familia', youtubeId: 'n32rp06PqfQ', title: 'Os melhores pais | Marcos Piangers | TEDxUnisinos', channel: 'TEDx Talks', style: 'palestra', meta: '9 min · 730 mil views' },

  // Vida social
  { area: 'social', youtubeId: 'OIsPAA9T7m4', title: 'Solidão', channel: 'Em Poucas Palavras – Kurzgesagt', style: 'animado', meta: '13 min · 1,1 mi views' },
  { area: 'social', youtubeId: '2EnWN3e59XI', title: '5 DICAS PARA TER CONVERSAS MENOS CHATAS', channel: 'Minutos Psíquicos', style: 'animado', meta: '6 min · 1 mi views' },
  { area: 'social', youtubeId: 'M77vgtZVkJU', title: 'Como Fazer Amigos e Influenciar Pessoas | RESENHA SejaUmaPessoaMelhor', channel: 'SejaUmaPessoaMelhor', style: 'animado', meta: '7 min · 645 mil views' },

  // Espiritualidade
  { area: 'espiritualidade', youtubeId: 'fOPF8khGeII', title: 'Salmos || Bible Project Português ||', channel: 'BibleProject - Português', style: 'animado', meta: '9 min · 521 mil views' },
  { area: 'espiritualidade', youtubeId: 'JHwKaiF6XYA', title: 'Um antídoto para a insatisfação', channel: 'Em Poucas Palavras – Kurzgesagt', style: 'animado', meta: '10 min · 535 mil views' },
  { area: 'espiritualidade', youtubeId: 'LVBzJRfG0eM', title: 'A CIÊNCIA DA MEDITAÇÃO', channel: 'Minutos Psíquicos', style: 'animado', meta: '6 min · 116 mil views' },
  { area: 'espiritualidade', youtubeId: 'r3w3Uj3rX5Q', title: 'A Vida é Feita de Escolhas - Pe. Fábio de Melo (06/09/2009)', channel: 'Canção Nova Play', style: 'palestra', meta: '1 h · 2,4 mi views' },

  // Lazer
  { area: 'lazer', youtubeId: '-gtlWxYf9LI', title: 'O JEITO HARVARD DE SER FELIZ | por Shawn Achor | Resumo Animado', channel: 'Epifania Experiência', style: 'animado', meta: '7 min · 477 mil views' },
  { area: 'lazer', youtubeId: 'q_8iqvFLrvU', title: 'FELICIDADE', channel: 'Minutos Psíquicos', style: 'animado', meta: '6 min · 120 mil views' },
  { area: 'lazer', youtubeId: '8P-zRYfbmYQ', title: 'A importância de ter hobbies e fazer trabalhos manuais', channel: 'Drauzio Varella', style: 'palestra', meta: '2 min · 2 mi views' },
  { area: 'lazer', youtubeId: 'HsQx02JdZ2Q', title: 'Felicidade é aqui e agora | Clóvis de Barros Filho | TEDxSãoPaulo', channel: 'TEDx Talks', style: 'palestra', meta: '17 min · 3,4 mi views' },
];

export const thumbUrl = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const embedUrl = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&hl=pt-BR&cc_lang_pref=pt`;
export const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

/** Descrição curta de cada vídeo: o que você leva dele (baseada no tema do título). */
export const VIDEO_DESC: Record<string, string> = {
  // Saúde
  Un67JkVy0xo: 'O que a ciência diz sobre os prós e contras do leite, sem mitos e com animação clara.',
  '9YtebqIFB9Q': 'Como o sono funciona, por que a insônia aparece e o que ajuda a dormir melhor.',
  IBHyEn6qMe4: 'Os efeitos do exercício no corpo e na mente — e por que vale começar mesmo pequeno.',
  Hvte3XpPceQ: 'Drauzio explica por que ficar parado faz tão mal e como o movimento protege a saúde.',
  // Emocional
  Tv0gJTBmVuc: 'O que é a ansiedade, de onde ela vem e como reconhecer os sinais no dia a dia.',
  AwxYSQGT734: 'Oito técnicas práticas para lidar com raiva, medo e estresse no momento em que surgem.',
  '5QFMjbwxJc0': 'Dez hábitos simples de rotina que ajudam a diminuir a ansiedade com o tempo.',
  // Intelectual
  'O_v-tIndr1M': 'Por que mudanças pequenas e constantes vencem grandes resoluções que não duram.',
  '9BtrLf6PfYY': 'O ciclo gatilho → rotina → recompensa e como usá-lo para trocar maus hábitos.',
  xjkHcFKUkKY: 'As ideias de “Hábitos Atômicos”: melhorar 1% ao dia e facilitar o hábito certo.',
  TRPBY_lxJfE: 'Clóvis de Barros fala sobre a energia de querer aprender e não desistir dos estudos.',
  // Profissional
  hfxfJ7Qa4sg: 'Como funciona a técnica Pomodoro e por que blocos curtos de foco rendem mais.',
  PRcB4gGC4eA: 'Resumo dos 7 hábitos de Stephen Covey para ser mais eficaz no trabalho e na vida.',
  'Mivz8Qh-DwI': 'Por que adiamos as tarefas e estratégias práticas para vencer a procrastinação.',
  ypt0YZKqwo8: 'Cortella reflete sobre o que diferencia um bom profissional: competência e atitude.',
  // Finanças
  Mx6EEpsIE5w: 'As lições de “Pai Rico, Pai Pobre”: ativos, passivos e fazer o dinheiro trabalhar.',
  d6CI30Y_iSU: 'As regras de “O Homem Mais Rico da Babilônia” para guardar e multiplicar dinheiro.',
  CB5zuxQl5ro: 'O básico da educação financeira: para que serve o dinheiro e como usá-lo melhor.',
  in0XbfQEm2A: 'Um passo a passo para organizar o orçamento e começar a guardar dinheiro.',
  // Relacionamento amoroso
  '8RzFggd8Nc8': 'As 5 linguagens do amor e como descobrir a sua e a de quem você ama.',
  Y_hyuGHogCE: 'O que acontece no cérebro quando nos apaixonamos e como o amor evolui.',
  sm7_I41LIC8: 'Sete fatos da psicologia sobre relacionamentos amorosos que poucos conhecem.',
  // Família
  'y_r-S7KMq_8': 'Como a família em que crescemos molda quem somos — e como lidar com isso.',
  'h4-YXXKPXVg': 'O que muda no cérebro e nas emoções na adolescência, para entender melhor os filhos.',
  '9GghNaQBX8o': 'Os principais estilos de criar filhos e os efeitos de cada um no futuro deles.',
  n32rp06PqfQ: 'Marcos Piangers conta, com humor, o que aprendeu sobre ser um pai presente.',
  // Vida social
  OIsPAA9T7m4: 'Por que a solidão faz tão mal e o que podemos fazer para nos conectar de novo.',
  '2EnWN3e59XI': 'Cinco dicas para conversas mais interessantes e para ser lembrado de um jeito bom.',
  M77vgtZVkJU: 'Os princípios de Dale Carnegie para fazer amigos e se comunicar melhor.',
  // Espiritualidade
  fOPF8khGeII: 'Uma visão animada do livro de Salmos: oração, lamento e esperança.',
  JHwKaiF6XYA: 'Por que nunca nos sentimos satisfeitos e como a gratidão pode mudar isso.',
  LVBzJRfG0eM: 'O que a ciência já mostrou sobre os efeitos da meditação no cérebro.',
  r3w3Uj3rX5Q: 'Padre Fábio de Melo fala sobre responsabilidade, escolhas e o sentido da vida.',
  // Lazer
  '-gtlWxYf9LI': 'As ideias de Shawn Achor: como a felicidade vem antes do sucesso, e não depois.',
  q_8iqvFLrvU: 'O que a psicologia diz sobre felicidade e o que realmente nos deixa mais felizes.',
  '8P-zRYfbmYQ': 'Por que ter hobbies e fazer trabalhos manuais faz bem para a mente.',
  HsQx02JdZ2Q: 'Clóvis de Barros sobre viver o presente em vez de adiar a felicidade.',
};

export const videoDesc = (id: string) => VIDEO_DESC[id] ?? '';
