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
  /** breve biografia */
  bio?: string;
  /** página na Wikipédia em português (foto livre de direitos, quando houver) */
  wiki?: string;
  /** arquivo de foto livre no Wikimedia Commons, quando a pessoa não tem página com foto */
  commons?: string;
  /** foto do canal oficial da pessoa no YouTube (nome conferido) — usada quando não há foto livre */
  photo?: string;
  /** canal de onde veio a foto */
  photoFrom?: string;
}

export const MENTORS: Mentor[] = [
  // Empreendedorismo e negócios
  { id: 'tallis', name: 'Tallis Gomes', role: 'Fundador da Easy Taxi e do G4 Educação', areas: ['negocios', 'carreira'], podcasts: ['0uNjUO4oP1UDaV0JHRAhXJ', '5ySYYT3Q0g93G6ohtDq2NE'], match: ['Tallis'], top: true, bio: 'Criou a Easy Taxi aos 24 anos, depois a Singu, e hoje lidera o G4 Educação, escola de gestão para empresários. Fala de crescimento, cultura e execução.', wiki: 'Tallis Gomes' },
  { id: 'alfredo', name: 'Alfredo Soares', role: 'Cofundador do G4 Educação, referência em vendas', areas: ['negocios', 'comunicacao'], podcasts: ['0uNjUO4oP1UDaV0JHRAhXJ'], match: ['Alfredo Soares'], bio: 'Empreendedor desde jovem, virou referência em vendas e varejo digital. É sócio do G4 Educação e autor de “Bora Vender”.', wiki: 'Alfredo Soares' },
  { id: 'nardon', name: 'Bruno Nardon', role: 'Cofundador do G4 Educação', areas: ['negocios', 'carreira'], podcasts: ['0uNjUO4oP1UDaV0JHRAhXJ', '5ySYYT3Q0g93G6ohtDq2NE'], bio: 'Empreendedor e investidor-anjo, cofundou o G4 Educação e ajudou a escalar startups como a Rappi no Brasil. Fala de gestão e crescimento.', wiki: 'Bruno Nardon' },
  { id: 'flavio', name: 'Flávio Augusto', role: 'Fundador da Wise Up e do Geração de Valor', areas: ['negocios', 'performance'], podcasts: ['4l3hikQIqZKAvtWTpLzQk4', '2zXvEmjy4kmP9Bp9wn2KYX'], match: ['Flávio Augusto'], top: true, bio: 'Saiu do subúrbio do Rio, fundou a escola de inglês Wise Up aos 23 anos e depois criou o Geração de Valor. Dono do Orlando City, fala de atitude empreendedora.', wiki: 'Flávio Augusto da Silva' },
  { id: 'caio', name: 'Caio Carneiro', role: 'Empresário e autor de “Seja Foda!”', areas: ['negocios', 'performance'], podcasts: ['1QJgd5aW274UcsHAShJwSE'], match: ['Caio Carneiro'], top: true, bio: 'Empresário que construiu carreira em vendas diretas e virou autor best-seller com “Seja Foda!”. Fala de atitude, disciplina e mentalidade de crescimento.', photo: 'https://yt3.googleusercontent.com/OfNCBFNrrEAgNDXnxwM3QZZ_WR3mHtjj37rJJGVqqn8zI9r46sjy9FGjeKQZ2CEneVBPkTDM=s400-c-k-c0x00ffffff-no-rj', photoFrom: 'https://www.youtube.com/@caiocarneiro' },
  { id: 'erico', name: 'Érico Rocha', role: 'Pioneiro dos lançamentos digitais no Brasil', areas: ['negocios', 'comunicacao'], podcasts: ['3KEC65F3KsxQCFuyzapeRp', '1AY0VkUZWHeMrSJxrZ7ubN'], match: ['Erico Rocha', 'Érico Rocha'], top: true, bio: 'Popularizou no Brasil a Fórmula de Lançamento para vender cursos e produtos digitais. Ensina marketing online para quem quer viver da internet.' },
  { id: 'ladeira', name: 'Leandro Ladeira', role: 'Especialista em marketing digital e vendas online', areas: ['negocios', 'comunicacao'], podcasts: ['1AY0VkUZWHeMrSJxrZ7ubN'], match: ['Ladeira'], bio: 'Especialista em marketing digital e copywriting, conhecido por um jeito bem-humorado de ensinar a vender pela internet.' },
  { id: 'conrado', name: 'Conrado Adolpho', role: 'Criador dos 8Ps do Marketing Digital', areas: ['negocios', 'comunicacao'], podcasts: ['6kNQGYNAI02UbohuevXMnW'], match: ['Conrado'], bio: 'Criou o método dos 8Ps do Marketing Digital, um passo a passo para pequenas empresas venderem online.', photo: 'https://yt3.googleusercontent.com/D8xWVtda1ysyHo4fvGqmXCyeYQe5pJRSbW7uec4JKa6kTYyU6oZ6hrZ1CSAZPYir9tdabC5DuA=s400-c-k-c0x00ffffff-no-rj', photoFrom: 'https://www.youtube.com/@conradoadolpho' },
  { id: 'leandro-vieira', name: 'Leandro Vieira', role: 'Fundador do Administradores.com', areas: ['negocios', 'carreira'], podcasts: ['5HoZGHqVtcHOjshdhdBWWU'], bio: 'Fundou o portal Administradores.com, um dos maiores de gestão do país. Fala de carreira, negócios e liderança.' },
  { id: 'anderson', name: 'Anderson Cavalcante', role: 'Escritor e mentor de empresários', areas: ['negocios', 'relacionamentos'], podcasts: ['01ChDp9TdZ7xM2bvjMyr1Y'], match: ['Anderson Cavalcante'], bio: 'Escritor e mentor de empresários, autor de livros sobre propósito e prosperidade. Une negócios, família e vida pessoal.', commons: 'Anderson Cavalcante.jpg' },

  // Dinheiro e investimentos
  { id: 'nigro', name: 'Thiago Nigro (Primo Rico)', role: 'Fundador do Grupo Primo e autor de “Do Mil ao Milhão”', areas: ['financas', 'negocios'], podcasts: ['2gCj9YG9tjMexhS4pIlRHo', '2VhPmYjfLVpXCNUKxcyQj9'], match: ['Thiago Nigro', 'Primo Rico'], top: true, bio: 'Saiu do zero, juntou o primeiro milhão investindo e criou o canal O Primo Rico e o Grupo Primo. Autor de “Do Mil ao Milhão”, ensina finanças de forma direta.', wiki: 'Thiago Nigro' },
  { id: 'perini', name: 'Bruno Perini', role: 'Sócio do Grupo Primo, investidor e educador financeiro', areas: ['financas', 'performance'], podcasts: ['17bkR8GX6FmyKYvhQv4nOi', '2VhPmYjfLVpXCNUKxcyQj9'], match: ['Perini'], top: true, bio: 'Investidor e educador financeiro, sócio do Grupo Primo. Ensina sobre ações, renda passiva e independência financeira com foco no longo prazo.', photo: 'https://yt3.googleusercontent.com/ytc/AIdro_l6tUjwilRjMDBJ0p36NnmeSiU01y2N-4HZVS34VwheCrQ=s400-c-k-c0x00ffffff-no-rj', photoFrom: 'https://www.youtube.com/@brunoperini' },
  { id: 'arcuri', name: 'Nathalia Arcuri', role: 'Criadora do Me Poupe!', areas: ['financas'], podcasts: ['0UR7uvXIwzbEiSLZlrp9Na', '62JPP6v2HX6beGwMFSj1Hs'], match: ['Nathalia Arcuri', 'Me Poupe'], top: true, bio: 'Jornalista que criou o Me Poupe!, um dos maiores canais de finanças pessoais do mundo. Fala de dinheiro com leveza e sem economês.', wiki: 'Nathalia Arcuri' },
  { id: 'cerbasi', name: 'Gustavo Cerbasi', role: 'Educador financeiro, autor de “Casais Inteligentes Enriquecem Juntos”', areas: ['financas', 'relacionamentos'], podcasts: ['2VqGZVZmUnEqieAp7kwPKO'], match: ['Cerbasi'], top: true, bio: 'Um dos educadores financeiros mais conhecidos do país, autor de “Casais Inteligentes Enriquecem Juntos” e “Pais Inteligentes Enriquecem seus Filhos”.', wiki: 'Gustavo Cerbasi' },
  { id: 'raul', name: 'Raul Sena', role: 'Criador do Investidor Sardinha', areas: ['financas'], podcasts: ['1oSLfLD1e4l4BiU9dB0hUt'], match: ['Raul Sena', 'Investidor Sardinha'], bio: 'Criou o Investidor Sardinha para explicar investimentos a quem está começando, de forma simples e com humor.', photo: 'https://yt3.googleusercontent.com/q6bgR6BvYXgq3u9GF_MP_YrVW4myeX_ETDwgM68vUA4XkahJUCoxnFy-MnELZPd5n875FDi5Fw=s400-c-k-c0x00ffffff-no-rj', photoFrom: 'https://www.youtube.com/@investidorsardinha' },
  { id: 'reinaldo', name: 'Reinaldo Domingos', role: 'Educador financeiro e escritor', areas: ['financas'], podcasts: ['3G2T9qUqGA8t4bx0glUaKK'], match: ['Reinaldo Domingos'], bio: 'Educador financeiro, criou a metodologia DSOP e escreveu “Terapia Financeira”. Foca em sair das dívidas e construir sonhos.' },

  // Alta performance e desenvolvimento
  { id: 'joel', name: 'Joel Jota', role: 'Ex-atleta da seleção de natação, mentor de alta performance', areas: ['performance', 'carreira'], podcasts: ['6wqBtC9OMq2mLvhDjZbqVM'], match: ['Joel Jota'], top: true, bio: 'Ex-nadador da seleção brasileira, virou treinador, mentor e empresário. Fala de disciplina, rotina e alta performance aplicada à vida e aos negócios.', photo: 'https://yt3.googleusercontent.com/0TK1Rp3PWZNA2Nj3o7eutFLunpR2WeDH1SBbRzWTjza_L6VLI1LeFmdZiaCu8nbxRqpOdlYj=s400-c-k-c0x00ffffff-no-rj', photoFrom: 'https://www.youtube.com/@joeljota' },
  { id: 'paulo-vieira', name: 'Paulo Vieira', role: 'Fundador da Febracis, autor de “O Poder da Ação”', areas: ['performance', 'mente'], podcasts: ['5A4c3s98g8cseaT59FfFrU'], match: ['Paulo Vieira'], top: true, bio: 'Fundador da Febracis e criador do Coaching Integral Sistêmico. Autor de “O Poder da Ação”, fala de crenças, mudança de hábitos e resultados.' },
  { id: 'geronimo', name: 'Geronimo Theml', role: 'Especialista em produtividade e hábitos', areas: ['performance'], podcasts: ['1nuFSa15qyDWQ4kY9kOwRD'], match: ['Geronimo'], bio: 'Especialista em produtividade, comunicação e hábitos. Ensina a organizar a rotina e fazer mais com menos estresse.', photo: 'https://yt3.googleusercontent.com/GtTa7BWKXi0g1dXENLy4KD2QwNT6I4QZyMYLto0zPuZAviH0wDMtcNalX18_VkLN3EGlOAHP=s400-c-k-c0x00ffffff-no-rj', photoFrom: 'https://www.youtube.com/@geronimotheml' },
  { id: 'thais', name: 'Thais Godinho', role: 'Criadora do Vida Organizada', areas: ['performance'], podcasts: ['4hP6XOduJZfuAPwWxV2335'], match: ['Thais Godinho'], bio: 'Criadora do blog e podcast Vida Organizada, uma referência em organização pessoal e no método GTD no Brasil.' },
  { id: 'izabella', name: 'Izabella Camargo', role: 'Jornalista, fala sobre tempo, saúde mental e equilíbrio', areas: ['performance', 'mente'], podcasts: ['7DFuli7bfCvfvl4jgYBe29'], bio: 'Jornalista que, depois de um burnout em rede nacional, passou a falar de tempo, saúde mental e equilíbrio entre trabalho e vida.', wiki: 'Izabella Camargo' },

  // Carreira e liderança
  { id: 'max', name: 'Max Gehringer', role: 'Escritor e comentarista de carreira da CBN', areas: ['carreira'], podcasts: ['4UUYI2nWlhhfTxnqZabK9r'], match: ['Gehringer'], top: true, bio: 'Executivo que virou comentarista de carreira na rádio CBN e autor de vários livros. Dá conselhos práticos e bem-humorados sobre o mundo do trabalho.', wiki: 'Max Gehringer' },

  // Comunicação e vendas
  { id: 'concer', name: 'Thiago Concer', role: 'Especialista em vendas, criador do Orgulho de Ser Vendedor', areas: ['comunicacao', 'negocios'], podcasts: ['1j1N97xKTq2RMvvinVd1ZF'], match: ['Concer'], bio: 'Palestrante e especialista em vendas, criador do movimento Orgulho de Ser Vendedor. Ensina prospecção, negociação e postura comercial.', photo: 'https://yt3.googleusercontent.com/6H6oVgDpRxsSo84s5qfLWD76wYgj43LOpv5hNfnc2bI-0rR_SXsN9XNzgLHbkT9L4meXC0CHt6w=s400-c-k-c0x00ffffff-no-rj', photoFrom: 'https://www.youtube.com/@thiagoconcer' },
  { id: 'leny', name: 'Leny Kyrillos', role: 'Fonoaudióloga e especialista em comunicação', areas: ['comunicacao'], podcasts: ['5n09xVJqMutv1e5PkSaCLf'], match: ['Kyrillos'], bio: 'Fonoaudióloga e especialista em voz e comunicação, comentarista da CBN. Ensina a falar melhor em público, em entrevistas e no dia a dia.' },

  // Mente e emoções
  { id: 'rossandro', name: 'Rossandro Klinjey', role: 'Psicólogo e escritor', areas: ['mente', 'relacionamentos'], podcasts: ['3s4vCUCoXANiCbXNunQifz', '3vR5toLyDCDFVvdXxXri1C', '6udUGLxJqeOLsv6tzGCpXJ'], match: ['Klinjey'], top: true, bio: 'Psicólogo, escritor e palestrante. Fala de educação dos filhos, família e inteligência emocional de forma acessível.', photo: 'https://yt3.googleusercontent.com/S7Zl-Q1MKeNN23VCeYHiw1zbqfG54xz6HWcK8UWcEcygCH_TDDiCPGnblCtT5caJ85dGhuf_pfQ=s400-c-k-c0x00ffffff-no-rj', photoFrom: 'https://www.youtube.com/@rossandroklinjey' },
  { id: 'anabeatriz', name: 'Ana Beatriz Barbosa Silva', role: 'Psiquiatra e escritora', areas: ['mente'], podcasts: ['5vLv8tZMOsid9WXYiRy3il'], match: ['Ana Beatriz'], top: true, bio: 'Psiquiatra e autora de best-sellers como “Mentes Perigosas” e “Mentes Ansiosas”. Explica saúde mental de forma clara para o grande público.', wiki: 'Ana Beatriz Barbosa Silva' },
  { id: 'dunker', name: 'Christian Dunker', role: 'Psicanalista e professor da USP', areas: ['mente'], podcasts: ['0GAwVQxxkmfESH5W2xEv3k'], match: ['Dunker'], bio: 'Psicanalista e professor do Instituto de Psicologia da USP. Fala de sofrimento, afetos e relações à luz da psicanálise.', wiki: 'Christian Dunker' },

  // Relacionamentos
  { id: 'cardoso', name: 'Renato e Cristiane Cardoso', role: 'Autores de “Casamento Blindado”', areas: ['relacionamentos'], podcasts: ['37G86fqz2HJ1IWvV3YSiUl'], match: ['Renato Cardoso', 'Cristiane Cardoso'], top: true, bio: 'Casal autor de “Casamento Blindado”, com programas e cursos sobre vida a dois. Falam de comunicação, conflitos e compromisso no relacionamento.', wiki: 'Renato Cardoso' },
  { id: 'ceribelli', name: 'Marcela Ceribelli', role: 'Jornalista, criadora da Obvious', areas: ['relacionamentos', 'mente'], podcasts: ['1592iJQt0IlC5u5lKXrbyS'], match: ['Ceribelli'], bio: 'Jornalista e empresária, criadora da Obvious e do podcast Bom Dia, Obvious. Fala de relações, autoconhecimento e vida adulta.' },

  // Saúde
  { id: 'drauzio', name: 'Drauzio Varella', role: 'Médico e escritor', areas: ['saude'], podcasts: ['5SWaT0blo4yKdyTJ51sM9o'], match: ['Drauzio'], top: true, bio: 'Médico oncologista e escritor, autor de “Estação Carandiru”. Há décadas leva informação de saúde de qualidade ao grande público.', wiki: 'Drauzio Varella' },

  // Filosofia e reflexão
  { id: 'cortella', name: 'Mario Sergio Cortella', role: 'Filósofo, professor e escritor', areas: ['filosofia', 'carreira'], podcasts: ['4Jsclu68AmZIaczJo10HY9'], match: ['Cortella'], top: true, bio: 'Filósofo, professor e escritor de dezenas de livros. Fala de ética, propósito e trabalho de um jeito acessível e bem-humorado.', wiki: 'Mario Sergio Cortella' },
  { id: 'karnal', name: 'Leandro Karnal', role: 'Historiador e professor', areas: ['filosofia'], podcasts: ['2Yk1btoIXthB9TGp1JHQVV'], match: ['Karnal'], top: true, bio: 'Historiador e professor da Unicamp, conhecido por palestras sobre ética, comportamento e o sentido da vida.', wiki: 'Leandro Karnal' },
  { id: 'clovis', name: 'Clóvis de Barros Filho', role: 'Filósofo e professor de ética', areas: ['filosofia'], podcasts: ['5cbphPhNPoYWFR1rfIqC0Z'], match: ['Clóvis de Barros', 'Clovis de Barros'], top: true, bio: 'Filósofo e professor de ética, conhecido pelas aulas cheias de energia sobre felicidade, virtude e convivência.', wiki: 'Clóvis de Barros Filho' },
  { id: 'monja', name: 'Monja Coen', role: 'Monja zen budista', areas: ['filosofia', 'fe', 'mente'], podcasts: ['0CcR9PFfGyQylzL4bC7ayH'], match: ['Monja Coen'], top: true, bio: 'Monja zen budista e fundadora da comunidade Zen Brasil. Ensina meditação, presença e serenidade para o dia a dia.', wiki: 'Monja Coen' },

  // Fé e espiritualidade
  { id: 'brunet', name: 'Tiago Brunet', role: 'Escritor e conferencista sobre propósito e inteligência emocional', areas: ['fe', 'performance'], podcasts: ['5IXarGBfiBawMDbm5GmUMP', '3MgZco4ylGj3RNGZUBPDrq'], match: ['Brunet'], top: true, bio: 'Escritor e conferencista, autor de “Especialista em Pessoas”. Fala de propósito, inteligência emocional e fé na prática.', photo: 'https://yt3.googleusercontent.com/Gj83EwSm7mMpHoh351IgDFmIeUA2SSQnIIARIbWjNkpjaxaykdL53QCGohwd2NnGHq6GRkql=s400-c-k-c0x00ffffff-no-rj', photoFrom: 'https://www.youtube.com/@TiagoBrunetOficial' },
  { id: 'gilson', name: 'Frei Gilson', role: 'Frade carmelita, pregador e cantor', areas: ['fe'], podcasts: ['7HeYuy5fUD5xWaWoxLvBsX', '0xHmiubsPvyfhOtIYnVeS9'], match: ['Frei Gilson'], top: true, bio: 'Frade carmelita, sacerdote e cantor católico. Ficou conhecido pelas pregações e orações transmitidas ao vivo, que reúnem milhões.', wiki: 'Frei Gilson' },
  { id: 'fabio', name: 'Padre Fábio de Melo', role: 'Padre, cantor e escritor', areas: ['fe'], podcasts: ['402p05xzOGsFt4ubrme1um'], match: ['Fábio de Melo', 'Fabio de Melo'], top: true, bio: 'Padre, cantor e escritor, um dos comunicadores católicos mais conhecidos do país. Fala de fé, afetos e sentido da vida.', wiki: 'Fábio de Melo' },
  { id: 'hernandes', name: 'Hernandes Dias Lopes', role: 'Pastor presbiteriano e escritor', areas: ['fe'], podcasts: ['1Z94gxLF4pIGbtcgGnvn7I'], match: ['Hernandes'], bio: 'Pastor presbiteriano e escritor com mais de cem livros. Conhecido pela pregação expositiva da Bíblia.', wiki: 'Hernandes Dias Lopes', commons: 'Rev. Hernandes Dias Lopes ministrando no Ministério Canaã da Assembleia de Deus no Brasil.jpg' },
  { id: 'rostirola', name: 'Junior Rostirola', role: 'Pastor, autor de “Café com Deus Pai”', areas: ['fe'], podcasts: ['5Yl4ao85LeyLc56nvm1E2T'], match: ['Rostirola'], bio: 'Pastor e autor do devocional “Café com Deus Pai”, um dos livros mais vendidos do país. Fala de fé no cotidiano.', photo: 'https://yt3.googleusercontent.com/BxkW7axGWCP3T9_grTGb8z9HK_1LLx_-JW88kaCgUNQVcZqXOjRSBbTBdgkMSDXdUh-NWP8yl_s=s400-c-k-c0x00ffffff-no-rj', photoFrom: 'https://www.youtube.com/@juniorrostirola' },
  { id: 'deive', name: 'Deive Leonardo', role: 'Pregador e escritor', areas: ['fe'], podcasts: ['3qUNfDtaQHhsEFSJ5Pt7LT'], match: ['Deive Leonardo'], bio: 'Pregador e escritor jovem, conhecido pelas mensagens nas redes sociais sobre fé, propósito e esperança.' },
];
