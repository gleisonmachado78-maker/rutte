import type { Book } from './library';

/**
 * Curadoria de livros de desenvolvimento em edições brasileiras (ISBN 978-85 / 978-65).
 * Capas: Google Livros (IDs conferidos em 01/10/2026 — imagem real, não o "sem capa").
 */
export const BOOKS: Book[] = [
  // Inteligência emocional
  { topic: 'emocional', googleId: 'ypRcZI8-EbEC', title: 'Inteligência emocional: A teoria revolucionária que redefine o que é ser inteligente', author: 'Daniel Goleman', publisher: 'Objetiva', year: '2012', isbn13: '9788539001910', pages: 396, why: 'Entender e gerenciar as próprias emoções para se relacionar e decidir melhor.' },
  { topic: 'emocional', googleId: 'vIYFEgAAQBAJ', title: 'Ansiedade: Como enfrentar o mal do século', author: 'Augusto Cury', publisher: 'Sextante', year: '2025', isbn13: '9786558104131', pages: 118, why: 'Reconhecer o pensamento acelerado e aprender a desacelerar a mente.' },
  { topic: 'emocional', googleId: 'GALMDwAAQBAJ', title: 'A arte da imperfeição: Abandone a pessoa que você acha que deve ser e seja você mesmo', author: 'Brené Brown', publisher: 'Sextante', year: '2020', isbn13: '9788543109237', pages: 187, why: 'Trocar o perfeccionismo pela autoaceitação e viver com mais autenticidade.' },
  { topic: 'emocional', googleId: '_bRIDwAAQBAJ', title: 'A coragem de não agradar: Como se libertar da opinião dos outros', author: 'Ichiro Kishimi, Fumitake Koga', publisher: 'Sextante', year: '2018', isbn13: '9788543105703', pages: 239, why: 'Libertar-se da necessidade de aprovação e assumir a responsabilidade pela própria vida.' },

  // Finanças
  { topic: 'financas', googleId: 'L_B3EAAAQBAJ', title: 'Pai Rico, Pai Pobre: O que os ricos ensinam a seus filhos sobre dinheiro', author: 'Robert T. Kiyosaki', publisher: 'Alta Books', year: '2018', isbn13: '9788550803852', pages: 348, why: 'Mudar a mentalidade sobre dinheiro e entender a diferença entre ativos e passivos.' },
  { topic: 'financas', googleId: '4LZwDwAAQBAJ', title: 'Do mil ao milhão: Sem cortar o cafezinho', author: 'Thiago Nigro', publisher: 'HarperCollins Brasil', year: '2018', isbn13: '9788595084421', pages: 166, why: 'Um caminho prático para gastar bem, poupar e começar a investir.' },
  { topic: 'financas', googleId: 'VOfT0AEACAAJ', title: 'Me Poupe!: 10 passos para nunca mais faltar dinheiro no seu bolso', author: 'Nathalia Arcuri', publisher: 'Sextante', year: '2021', isbn13: '9786555640786', pages: 178, why: 'Passos simples para sair das dívidas, organizar o orçamento e criar reservas.' },
  { topic: 'financas', googleId: 'FgaHBAAAQBAJ', title: 'Casais inteligentes enriquecem juntos: Finanças para casais', author: 'Gustavo Cerbasi', publisher: 'Sextante', year: '2014', isbn13: '9788543101446', pages: 130, why: 'Planejar as finanças a dois e transformar o dinheiro em projeto comum do casal.' },

  // Desenvolvimento pessoal
  { topic: 'desenvolvimento', googleId: 'qI6iDwAAQBAJ', title: 'Hábitos Atômicos: Um método fácil e comprovado de criar bons hábitos e se livrar dos maus', author: 'James Clear', publisher: 'Alta Books', year: '2019', isbn13: '9788550807577', pages: 230, why: 'Pequenas mudanças diárias que, somadas, geram grandes transformações.' },
  { topic: 'desenvolvimento', googleId: 'k0j8IgiMKoMC', title: 'O poder do hábito: Por que fazemos o que fazemos na vida e nos negócios', author: 'Charles Duhigg', publisher: 'Objetiva', year: '2012', isbn13: '9788539004256', pages: 486, why: 'Entender o ciclo gatilho → rotina → recompensa para mudar comportamentos.' },
  { topic: 'desenvolvimento', googleId: 'aizjDQAAQBAJ', title: 'Mindset: A nova psicologia do sucesso', author: 'Carol Dweck', publisher: 'Objetiva', year: '2017', isbn13: '9788543808246', pages: 347, why: 'Desenvolver a mentalidade de crescimento e ver os erros como aprendizado.' },
  { topic: 'desenvolvimento', googleId: 'ZHtzEAAAQBAJ', title: 'Os 7 hábitos das pessoas altamente eficazes', author: 'Stephen R. Covey, Sean Covey', publisher: 'Best Seller', year: '2022', isbn13: '9786557122105', pages: 621, why: 'Princípios atemporais de caráter e eficácia pessoal e profissional.' },

  // Oratória e comunicação
  { topic: 'oratoria', googleId: 'IgPICgAAQBAJ', title: '29 minutos para falar bem em público: E conversar com desenvoltura', author: 'Reinaldo Polito, Rachel Polito', publisher: 'Sextante', year: '2015', isbn13: '9788543102979', pages: 135, why: 'Dicas rápidas do maior especialista brasileiro para vencer o medo de falar em público.' },
  { topic: 'oratoria', googleId: 'A8b_CwAAQBAJ', title: 'TED Talks: O guia oficial do TED para falar em público', author: 'Chris Anderson', publisher: 'Intrínseca', year: '2016', isbn13: '9788580579369', pages: 277, why: 'Aprender a estruturar e apresentar ideias de forma marcante.' },
  { topic: 'oratoria', googleId: 'kkTWEQAAQBAJ', title: 'Como fazer amigos e influenciar pessoas', author: 'Dale Carnegie', publisher: 'Companhia Editora Nacional', year: '2026', isbn13: '9786558812999', pages: 260, why: 'Técnicas clássicas para criar conexões e conquistar a confiança das pessoas.' },
  { topic: 'oratoria', googleId: 'SAg1EAAAQBAJ', title: 'Comunicação não violenta: Técnicas para aprimorar relacionamentos pessoais e profissionais', author: 'Marshall B. Rosenberg', publisher: 'Ágora', year: '2021', isbn13: '9788571832657', pages: 219, why: 'Comunicar necessidades com empatia e resolver conflitos sem agressividade.' },

  // Liderança
  { topic: 'lideranca', googleId: '7lgqhG40iFUC', title: 'O monge e o executivo: Uma história sobre a essência da liderança', author: 'James C. Hunter', publisher: 'Sextante', year: '2010', isbn13: '9788575425749', pages: 144, why: 'Entender a liderança servidora, baseada em autoridade e não em poder.' },
  { topic: 'lideranca', googleId: 'uGBwDwAAQBAJ', title: 'Comece pelo porquê: Como grandes líderes inspiram pessoas e equipes a agir', author: 'Simon Sinek', publisher: 'Sextante', year: '2018', isbn13: '9788543106649', pages: 293, why: 'Liderar e inspirar a partir de um propósito claro.' },
  { topic: 'lideranca', googleId: 'j0UK8BHxlVAC', title: 'As 21 irrefutáveis leis da liderança', author: 'John C. Maxwell', publisher: 'Thomas Nelson Brasil', year: '2013', isbn13: '9788578604448', pages: 356, why: 'Princípios práticos para desenvolver a influência e a capacidade de liderar.' },
  { topic: 'lideranca', googleId: '7YCcDwAAQBAJ', title: 'A coragem para liderar', author: 'Brené Brown', publisher: 'Best Seller', year: '2019', isbn13: '9788576845829', pages: 330, why: 'Liderar com coragem, vulnerabilidade e confiança para formar equipes fortes.' },

  // Produtividade e foco
  { topic: 'produtividade', googleId: 'yvR4CAAAQBAJ', title: 'Essencialismo: A disciplinada busca por menos', author: 'Greg McKeown', publisher: 'Sextante', year: '2015', isbn13: '9788543102153', pages: 273, why: 'Aprender a dizer não ao que é trivial e focar no que realmente importa.' },
  { topic: 'produtividade', googleId: 'TDkfEAAAQBAJ', title: 'A única coisa: A verdade surpreendentemente simples por trás de resultados extraordinários', author: 'Gary Keller, Jay Papasan', publisher: 'Sextante', year: '2021', isbn13: '9786555641240', pages: 216, why: 'Identificar a tarefa mais importante e concentrar nela sua energia.' },
  { topic: 'produtividade', googleId: 'rR-hCgAAQBAJ', title: 'A arte de fazer acontecer: O método GTD — Getting Things Done', author: 'David Allen', publisher: 'Sextante', year: '2016', isbn13: '9788543102825', pages: 403, why: 'Um sistema para organizar tarefas, esvaziar a mente e produzir sem estresse.' },
  { topic: 'produtividade', googleId: '_8xqEAAAQBAJ', title: 'Quatro mil semanas: Gestão de tempo para mortais', author: 'Oliver Burkeman', publisher: 'Objetiva', year: '2022', isbn13: '9786557823798', pages: 265, why: 'Repensar a relação com o tempo e priorizar o que dá sentido à vida.' },

  // Relacionamentos e família
  { topic: 'relacionamentos', googleId: 'YcIoAAAAQBAJ', title: 'As cinco linguagens do amor: Como expressar um compromisso de amor a seu cônjuge', author: 'Gary Chapman', publisher: 'Mundo Cristão', year: '2013', isbn13: '9788573259285', pages: 192, why: 'Descobrir como você e quem você ama dão e recebem amor.' },
  { topic: 'relacionamentos', googleId: 'R9_aDwAAQBAJ', title: 'Como falar para seu filho ouvir e como ouvir para seu filho falar', author: 'Adele Faber, Elaine Mazlish', publisher: 'Summus', year: '2020', isbn13: '9788532311429', pages: 277, why: 'Técnicas de diálogo que melhoram a convivência entre pais e filhos.' },
  { topic: 'relacionamentos', googleId: 'E7IDEAAAQBAJ', title: 'O cérebro da criança: Estratégias para nutrir a mente em desenvolvimento do seu filho', author: 'Daniel J. Siegel', publisher: 'nVersos', year: '2020', isbn13: '9786587638164', pages: 226, why: 'Entender o cérebro infantil para educar com mais calma e conexão.' },
  { topic: 'relacionamentos', googleId: 'PagHEgAAQBAJ', title: 'Antes que você me destrua: Sobre se libertar de relacionamentos tóxicos', author: 'Rossandro Klinjey', publisher: 'Best Seller', year: '2026', isbn13: '9786557125991', pages: 293, why: 'Reconhecer relações tóxicas e encontrar caminhos para se libertar delas.' },

  // Propósito e espiritualidade
  { topic: 'proposito', googleId: 'QnaFEQAAQBAJ', title: 'Em busca de sentido', author: 'Viktor E. Frankl', publisher: 'Auster', year: '2025', isbn13: '9786580136674', pages: 194, why: 'Encontrar sentido na vida mesmo diante das maiores adversidades.' },
  { topic: 'proposito', googleId: '95TlM8WBXwIC', title: 'O poder do agora: Um guia para a iluminação espiritual', author: 'Eckhart Tolle', publisher: 'Sextante', year: '2010', isbn13: '9788575426319', pages: 213, why: 'Viver o momento presente e se libertar da ansiedade com passado e futuro.' },
  { topic: 'proposito', googleId: 'XjCDDQAAQBAJ', title: 'Propósito: A coragem de ser quem somos', author: 'Sri Prem Baba', publisher: 'Sextante', year: '2016', isbn13: '9788543104515', pages: 145, why: 'Reconhecer seus dons e alinhar a vida ao seu propósito.' },
  { topic: 'proposito', googleId: 'OpE4DwAAQBAJ', title: 'A sutil arte de ligar o f*da-se: Uma estratégia inusitada para uma vida melhor', author: 'Mark Manson', publisher: 'Intrínseca', year: '2017', isbn13: '9788551002506', pages: 185, why: 'Escolher com clareza com o que se importar e aceitar os limites da vida.' },
];
