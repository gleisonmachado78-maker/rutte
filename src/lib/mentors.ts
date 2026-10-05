/**
 * Grandes nomes por área: empreendedores, investidores, mentores, pensadores e líderes de fé
 * com podcast no Spotify (os IDs são os de `podcasts.ts`, já conferidos).
 * `match` liga a pessoa aos livros (autor) e vídeos (canal) que já estão na Biblioteca.
 */

export type MentorArea = 'negocios' | 'financas' | 'performance' | 'carreira' | 'comunicacao' | 'mente' | 'relacionamentos' | 'saude' | 'filosofia' | 'fe';

export const MENTOR_AREAS: { id: MentorArea; label: string; emoji: string }[] = [
  { id: 'negocios', label: 'Empreendedorismo e negócios', emoji: '🚀' },
  { id: 'financas', label: 'Dinheiro e investimentos', emoji: '💰' },
  { id: 'performance', label: 'Alta performance', emoji: '🔥' },
  { id: 'carreira', label: 'Carreira e liderança', emoji: '🧭' },
  { id: 'comunicacao', label: 'Comunicação e vendas', emoji: '🎤' },
  { id: 'mente', label: 'Mente e emoções', emoji: '🧠' },
  { id: 'relacionamentos', label: 'Relacionamentos', emoji: '❤️' },
  { id: 'saude', label: 'Saúde', emoji: '🩺' },
  { id: 'filosofia', label: 'Filosofia e reflexão', emoji: '📜' },
  { id: 'fe', label: 'Fé e espiritualidade', emoji: '🙏' },
];

export interface Mentor {
  id: string;
  name: string;
  /** quem é, em poucas palavras */
  role: string;
  areas: MentorArea[];
  /** podcasts dele(a) (ids do Spotify em `podcasts.ts`) */
  podcasts: string[];
  /** trechos para achar livros (autor) e vídeos (canal) na Biblioteca */
  match?: string[];
  /** os mais conhecidos aparecem primeiro */
  top?: boolean;
}

export const MENTORS: Mentor[] = [
  // Empreendedorismo e negócios
  { id: 'tallis', name: 'Tallis Gomes', role: 'Fundador da Easy Taxi e do G4 Educação', areas: ['negocios', 'carreira'], podcasts: ['0uNjUO4oP1UDaV0JHRAhXJ', '5ySYYT3Q0g93G6ohtDq2NE'], match: ['Tallis'], top: true },
  { id: 'alfredo', name: 'Alfredo Soares', role: 'Cofundador do G4 Educação, referência em vendas', areas: ['negocios', 'comunicacao'], podcasts: ['0uNjUO4oP1UDaV0JHRAhXJ'], match: ['Alfredo Soares'] },
  { id: 'nardon', name: 'Bruno Nardon', role: 'Cofundador do G4 Educação', areas: ['negocios', 'carreira'], podcasts: ['0uNjUO4oP1UDaV0JHRAhXJ', '5ySYYT3Q0g93G6ohtDq2NE'] },
  { id: 'flavio', name: 'Flávio Augusto', role: 'Fundador da Wise Up e do Geração de Valor', areas: ['negocios', 'performance'], podcasts: ['4l3hikQIqZKAvtWTpLzQk4', '2zXvEmjy4kmP9Bp9wn2KYX'], match: ['Flávio Augusto'], top: true },
  { id: 'caio', name: 'Caio Carneiro', role: 'Empresário e autor de “Seja Foda!”', areas: ['negocios', 'performance'], podcasts: ['1QJgd5aW274UcsHAShJwSE'], match: ['Caio Carneiro'], top: true },
  { id: 'erico', name: 'Érico Rocha', role: 'Pioneiro dos lançamentos digitais no Brasil', areas: ['negocios', 'comunicacao'], podcasts: ['3KEC65F3KsxQCFuyzapeRp', '1AY0VkUZWHeMrSJxrZ7ubN'], match: ['Erico Rocha', 'Érico Rocha'], top: true },
  { id: 'ladeira', name: 'Leandro Ladeira', role: 'Especialista em marketing digital e vendas online', areas: ['negocios', 'comunicacao'], podcasts: ['1AY0VkUZWHeMrSJxrZ7ubN'], match: ['Ladeira'] },
  { id: 'conrado', name: 'Conrado Adolpho', role: 'Criador dos 8Ps do Marketing Digital', areas: ['negocios', 'comunicacao'], podcasts: ['6kNQGYNAI02UbohuevXMnW'], match: ['Conrado'] },
  { id: 'leandro-vieira', name: 'Leandro Vieira', role: 'Fundador do Administradores.com', areas: ['negocios', 'carreira'], podcasts: ['5HoZGHqVtcHOjshdhdBWWU'] },
  { id: 'anderson', name: 'Anderson Cavalcante', role: 'Escritor e mentor de empresários', areas: ['negocios', 'relacionamentos'], podcasts: ['01ChDp9TdZ7xM2bvjMyr1Y'], match: ['Anderson Cavalcante'] },

  // Dinheiro e investimentos
  { id: 'nigro', name: 'Thiago Nigro (Primo Rico)', role: 'Fundador do Grupo Primo e autor de “Do Mil ao Milhão”', areas: ['financas', 'negocios'], podcasts: ['2gCj9YG9tjMexhS4pIlRHo', '2VhPmYjfLVpXCNUKxcyQj9'], match: ['Thiago Nigro', 'Primo Rico'], top: true },
  { id: 'perini', name: 'Bruno Perini', role: 'Sócio do Grupo Primo, investidor e educador financeiro', areas: ['financas', 'performance'], podcasts: ['17bkR8GX6FmyKYvhQv4nOi', '2VhPmYjfLVpXCNUKxcyQj9'], match: ['Perini'], top: true },
  { id: 'arcuri', name: 'Nathalia Arcuri', role: 'Criadora do Me Poupe!', areas: ['financas'], podcasts: ['0UR7uvXIwzbEiSLZlrp9Na', '62JPP6v2HX6beGwMFSj1Hs'], match: ['Nathalia Arcuri', 'Me Poupe'], top: true },
  { id: 'cerbasi', name: 'Gustavo Cerbasi', role: 'Educador financeiro, autor de “Casais Inteligentes Enriquecem Juntos”', areas: ['financas', 'relacionamentos'], podcasts: ['2VqGZVZmUnEqieAp7kwPKO'], match: ['Cerbasi'], top: true },
  { id: 'raul', name: 'Raul Sena', role: 'Criador do Investidor Sardinha', areas: ['financas'], podcasts: ['1oSLfLD1e4l4BiU9dB0hUt'], match: ['Raul Sena', 'Investidor Sardinha'] },
  { id: 'reinaldo', name: 'Reinaldo Domingos', role: 'Educador financeiro e escritor', areas: ['financas'], podcasts: ['3G2T9qUqGA8t4bx0glUaKK'], match: ['Reinaldo Domingos'] },

  // Alta performance e desenvolvimento
  { id: 'joel', name: 'Joel Jota', role: 'Ex-atleta da seleção de natação, mentor de alta performance', areas: ['performance', 'carreira'], podcasts: ['6wqBtC9OMq2mLvhDjZbqVM'], match: ['Joel Jota'], top: true },
  { id: 'paulo-vieira', name: 'Paulo Vieira', role: 'Fundador da Febracis, autor de “O Poder da Ação”', areas: ['performance', 'mente'], podcasts: ['5A4c3s98g8cseaT59FfFrU'], match: ['Paulo Vieira'], top: true },
  { id: 'geronimo', name: 'Geronimo Theml', role: 'Especialista em produtividade e hábitos', areas: ['performance'], podcasts: ['1nuFSa15qyDWQ4kY9kOwRD'], match: ['Geronimo'] },
  { id: 'thais', name: 'Thais Godinho', role: 'Criadora do Vida Organizada', areas: ['performance'], podcasts: ['4hP6XOduJZfuAPwWxV2335'], match: ['Thais Godinho'] },
  { id: 'izabella', name: 'Izabella Camargo', role: 'Jornalista, fala sobre tempo, saúde mental e equilíbrio', areas: ['performance', 'mente'], podcasts: ['7DFuli7bfCvfvl4jgYBe29'] },

  // Carreira e liderança
  { id: 'max', name: 'Max Gehringer', role: 'Escritor e comentarista de carreira da CBN', areas: ['carreira'], podcasts: ['4UUYI2nWlhhfTxnqZabK9r'], match: ['Gehringer'], top: true },

  // Comunicação e vendas
  { id: 'concer', name: 'Thiago Concer', role: 'Especialista em vendas, criador do Orgulho de Ser Vendedor', areas: ['comunicacao', 'negocios'], podcasts: ['1j1N97xKTq2RMvvinVd1ZF'], match: ['Concer'] },
  { id: 'leny', name: 'Leny Kyrillos', role: 'Fonoaudióloga e especialista em comunicação', areas: ['comunicacao'], podcasts: ['5n09xVJqMutv1e5PkSaCLf'], match: ['Kyrillos'] },

  // Mente e emoções
  { id: 'rossandro', name: 'Rossandro Klinjey', role: 'Psicólogo e escritor', areas: ['mente', 'relacionamentos'], podcasts: ['3s4vCUCoXANiCbXNunQifz', '3vR5toLyDCDFVvdXxXri1C', '6udUGLxJqeOLsv6tzGCpXJ'], match: ['Klinjey'], top: true },
  { id: 'anabeatriz', name: 'Ana Beatriz Barbosa Silva', role: 'Psiquiatra e escritora', areas: ['mente'], podcasts: ['5vLv8tZMOsid9WXYiRy3il'], match: ['Ana Beatriz'], top: true },
  { id: 'dunker', name: 'Christian Dunker', role: 'Psicanalista e professor da USP', areas: ['mente'], podcasts: ['0GAwVQxxkmfESH5W2xEv3k'], match: ['Dunker'] },

  // Relacionamentos
  { id: 'cardoso', name: 'Renato e Cristiane Cardoso', role: 'Autores de “Casamento Blindado”', areas: ['relacionamentos'], podcasts: ['37G86fqz2HJ1IWvV3YSiUl'], match: ['Renato Cardoso', 'Cristiane Cardoso'], top: true },
  { id: 'ceribelli', name: 'Marcela Ceribelli', role: 'Jornalista, criadora da Obvious', areas: ['relacionamentos', 'mente'], podcasts: ['1592iJQt0IlC5u5lKXrbyS'], match: ['Ceribelli'] },

  // Saúde
  { id: 'drauzio', name: 'Drauzio Varella', role: 'Médico e escritor', areas: ['saude'], podcasts: ['5SWaT0blo4yKdyTJ51sM9o'], match: ['Drauzio'], top: true },

  // Filosofia e reflexão
  { id: 'cortella', name: 'Mario Sergio Cortella', role: 'Filósofo, professor e escritor', areas: ['filosofia', 'carreira'], podcasts: ['4Jsclu68AmZIaczJo10HY9'], match: ['Cortella'], top: true },
  { id: 'karnal', name: 'Leandro Karnal', role: 'Historiador e professor', areas: ['filosofia'], podcasts: ['2Yk1btoIXthB9TGp1JHQVV'], match: ['Karnal'], top: true },
  { id: 'clovis', name: 'Clóvis de Barros Filho', role: 'Filósofo e professor de ética', areas: ['filosofia'], podcasts: ['5cbphPhNPoYWFR1rfIqC0Z'], match: ['Clóvis de Barros', 'Clovis de Barros'], top: true },
  { id: 'monja', name: 'Monja Coen', role: 'Monja zen budista', areas: ['filosofia', 'fe', 'mente'], podcasts: ['0CcR9PFfGyQylzL4bC7ayH'], match: ['Monja Coen'], top: true },

  // Fé e espiritualidade
  { id: 'brunet', name: 'Tiago Brunet', role: 'Escritor e conferencista sobre propósito e inteligência emocional', areas: ['fe', 'performance'], podcasts: ['5IXarGBfiBawMDbm5GmUMP', '3MgZco4ylGj3RNGZUBPDrq'], match: ['Brunet'], top: true },
  { id: 'gilson', name: 'Frei Gilson', role: 'Frade carmelita, pregador e cantor', areas: ['fe'], podcasts: ['7HeYuy5fUD5xWaWoxLvBsX', '0xHmiubsPvyfhOtIYnVeS9'], match: ['Frei Gilson'], top: true },
  { id: 'fabio', name: 'Padre Fábio de Melo', role: 'Padre, cantor e escritor', areas: ['fe'], podcasts: ['402p05xzOGsFt4ubrme1um'], match: ['Fábio de Melo', 'Fabio de Melo'], top: true },
  { id: 'hernandes', name: 'Hernandes Dias Lopes', role: 'Pastor presbiteriano e escritor', areas: ['fe'], podcasts: ['1Z94gxLF4pIGbtcgGnvn7I'], match: ['Hernandes'] },
  { id: 'rostirola', name: 'Junior Rostirola', role: 'Pastor, autor de “Café com Deus Pai”', areas: ['fe'], podcasts: ['5Yl4ao85LeyLc56nvm1E2T'], match: ['Rostirola'] },
  { id: 'deive', name: 'Deive Leonardo', role: 'Pregador e escritor', areas: ['fe'], podcasts: ['3qUNfDtaQHhsEFSJ5Pt7LT'], match: ['Deive Leonardo'] },
];
