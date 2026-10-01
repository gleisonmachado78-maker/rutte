/**
 * Meditações guiadas escritas para a Rutte. Uma diferente a cada dia (rodízio pelo dia do ano).
 * Cada passo tem um tempo sugerido; o guia avança sozinho ou no toque.
 */

export interface MeditationStep {
  text: string;
  /** segundos sugeridos neste passo */
  secs: number;
}

export interface Meditation {
  id: string;
  title: string;
  /** para que serve, em poucas palavras */
  theme: string;
  intro: string;
  steps: MeditationStep[];
  closing: string;
}

export const MEDITATIONS: Meditation[] = [
  {
    id: 'chegar',
    title: 'Chegar ao momento presente',
    theme: 'Presença',
    intro: 'Uma pausa para tirar a mente do piloto automático e voltar para o agora.',
    steps: [
      { text: 'Sente-se com a coluna ereta, mas sem rigidez. Apoie os pés no chão e deixe as mãos descansarem sobre as pernas.', secs: 25 },
      { text: 'Feche os olhos ou baixe o olhar. Faça três respirações profundas, soltando o ar devagar pela boca.', secs: 30 },
      { text: 'Perceba cinco sons ao seu redor, um de cada vez. Não julgue nenhum: apenas note que eles existem.', secs: 45 },
      { text: 'Agora sinta o peso do seu corpo na cadeira. Os pontos de contato, a temperatura, a roupa na pele.', secs: 40 },
      { text: 'Leve a atenção para a respiração, no lugar onde ela é mais fácil de sentir: nariz, peito ou barriga.', secs: 60 },
      { text: 'Sempre que um pensamento aparecer, diga mentalmente “pensando” e volte, com gentileza, para o ar que entra e sai.', secs: 75 },
      { text: 'Pergunte a si mesmo(a): “O que é verdade agora, neste instante?” Fique com a resposta mais simples.', secs: 30 },
    ],
    closing: 'Abra os olhos devagar. O momento presente é o único lugar onde a vida realmente acontece — você pode voltar a ele sempre que quiser.',
  },
  {
    id: 'gratidao-corpo',
    title: 'Gratidão pelo corpo',
    theme: 'Gratidão',
    intro: 'Um escaneamento do corpo agradecendo a cada parte pelo trabalho silencioso que ela faz.',
    steps: [
      { text: 'Deite-se ou sente-se confortavelmente. Respire fundo três vezes e deixe o corpo pesar.', secs: 30 },
      { text: 'Leve a atenção aos pés. Eles te carregaram por todos os caminhos da sua vida. Agradeça a eles.', secs: 40 },
      { text: 'Suba para as pernas e o quadril: a força que te levanta, te sustenta e te leva até quem você ama.', secs: 40 },
      { text: 'Sinta a barriga e o peito subindo e descendo. Os pulmões respiram por você, até enquanto você dorme. Obrigado(a).', secs: 45 },
      { text: 'Coloque uma mão sobre o coração. Ele bate cerca de cem mil vezes por dia, sem pedir nada em troca. Sinta esse ritmo.', secs: 50 },
      { text: 'Agradeça às mãos e aos braços: tudo que você já construiu, abraçou e acariciou passou por eles.', secs: 40 },
      { text: 'Por fim, o rosto: os olhos que veem, os ouvidos que escutam, a boca que sorri e fala. Solte qualquer tensão da testa e do maxilar.', secs: 45 },
    ],
    closing: 'Seu corpo não precisa ser perfeito para merecer gratidão. Hoje, trate-o como trataria alguém que você ama.',
  },
  {
    id: 'ansiedade',
    title: 'Acalmar a ansiedade',
    theme: 'Calma',
    intro: 'Para quando a mente acelera e o peito aperta. Use o método 5-4-3-2-1 e a respiração longa.',
    steps: [
      { text: 'Reconheça o que está sentindo, sem brigar com isso: “Estou ansioso(a), e tudo bem. Isso vai passar.”', secs: 25 },
      { text: 'Inspire contando até 4 e solte o ar contando até 6. Expirar mais longo avisa ao corpo que você está seguro(a). Repita algumas vezes.', secs: 60 },
      { text: 'Olhe ao redor e nomeie 5 coisas que você vê.', secs: 25 },
      { text: 'Agora 4 coisas que você pode tocar. Toque-as de verdade e sinta a textura.', secs: 25 },
      { text: '3 sons que você escuta. 2 cheiros que consegue perceber. 1 sabor na boca.', secs: 35 },
      { text: 'Pergunte: “Isso que me preocupa está acontecendo agora ou é algo que imagino?” Separe o fato da imaginação.', secs: 40 },
      { text: 'Escolha um único passo pequeno que está ao seu alcance hoje. Só um. O resto pode esperar.', secs: 40 },
    ],
    closing: 'A ansiedade é uma onda: sobe, chega ao topo e desce. Você já atravessou outras e vai atravessar esta também.',
  },
  {
    id: 'bondade',
    title: 'Bondade amorosa',
    theme: 'Amor',
    intro: 'A prática tradicional de desejar o bem — a si mesmo, a quem ama e até a quem é difícil.',
    steps: [
      { text: 'Respire com calma e lembre de um momento em que alguém foi muito gentil com você. Deixe o calor dessa lembrança aparecer.', secs: 40 },
      { text: 'Deseje a si mesmo(a), em silêncio: “Que eu esteja em paz. Que eu tenha saúde. Que eu seja feliz. Que eu viva com leveza.”', secs: 50 },
      { text: 'Pense em alguém que você ama. Imagine o rosto dessa pessoa e repita os desejos para ela: “Que você esteja em paz…”', secs: 50 },
      { text: 'Agora alguém neutro: o porteiro, o caixa do mercado, um vizinho. Ele também quer ser feliz, como você. Deseje o mesmo a ele.', secs: 45 },
      { text: 'Se se sentir pronto(a), pense em alguém com quem tem dificuldade. Sem forçar: “Que você também encontre paz.”', secs: 50 },
      { text: 'Expanda para todos os seres, em todos os lugares: “Que todos estejam em paz. Que todos sejam livres do sofrimento.”', secs: 40 },
    ],
    closing: 'Desejar o bem não muda só o outro: suaviza o seu próprio coração. Leve esse calor para a próxima conversa do dia.',
  },
  {
    id: 'manha',
    title: 'Intenção para o dia',
    theme: 'Manhã',
    intro: 'Para começar o dia com direção, em vez de começar no celular.',
    steps: [
      { text: 'Antes de pegar o celular, sente-se na beira da cama. Sinta os pés no chão e respire fundo três vezes.', secs: 30 },
      { text: 'Agradeça por ter acordado. Muita gente não teve esse privilégio hoje.', secs: 25 },
      { text: 'Pergunte: “Como eu quero me sentir hoje?” Escolha uma palavra — calma, coragem, foco, alegria, paciência.', secs: 40 },
      { text: 'Imagine o seu dia acontecendo com essa qualidade: as conversas, o trabalho, os imprevistos. Veja-se reagindo bem.', secs: 60 },
      { text: 'Defina a única coisa que, se você fizer hoje, já fará o dia valer a pena.', secs: 40 },
      { text: 'Repita mentalmente a sua palavra três vezes, como uma âncora para os momentos difíceis.', secs: 25 },
    ],
    closing: 'Você não controla tudo o que vai acontecer hoje, mas escolheu como quer caminhar. Bom dia.',
  },
  {
    id: 'noite',
    title: 'Revisão gentil do dia',
    theme: 'Noite',
    intro: 'Inspirada no exame diário de Santo Inácio: olhar para o dia com gratidão antes de dormir.',
    steps: [
      { text: 'Deite-se e deixe o corpo afundar no colchão. Solte os ombros, a mandíbula e as mãos.', secs: 30 },
      { text: 'Volte ao começo do dia e assista ao filme dele, sem pressa, como um espectador gentil.', secs: 60 },
      { text: 'Pare nos momentos bons, mesmo os pequenos: um café, uma risada, uma mensagem. Agradeça por cada um.', secs: 60 },
      { text: 'Perceba onde você não foi quem gostaria de ser. Sem se culpar: apenas reconheça e diga “amanhã eu tento de novo”.', secs: 45 },
      { text: 'Se alguém te feriu hoje, imagine-se colocando essa mágoa numa caixa e deixando-a do lado de fora do quarto.', secs: 40 },
      { text: 'Pense em uma coisa que você espera de amanhã. Deixe a respiração ficar lenta e profunda.', secs: 45 },
    ],
    closing: 'O dia acabou e você fez o que pôde. Agora o seu único trabalho é descansar.',
  },
  {
    id: 'montanha',
    title: 'A montanha',
    theme: 'Estabilidade',
    intro: 'Uma visualização clássica para se sentir firme quando a vida está agitada.',
    steps: [
      { text: 'Sente-se com a coluna alta, como o pico de uma montanha. Base larga, ombros soltos.', secs: 30 },
      { text: 'Imagine uma montanha bonita, alta, antiga. Veja os detalhes: as pedras, as árvores, o cume tocando o céu.', secs: 50 },
      { text: 'Agora imagine que você é essa montanha. Seu corpo é a base sólida; sua cabeça é o cume.', secs: 45 },
      { text: 'Os dias passam sobre você: sol, chuva, tempestade, neve. O clima muda o tempo todo — a montanha continua.', secs: 60 },
      { text: 'Seus pensamentos e emoções são o clima. Deixe-os passar. Você é a montanha, não a tempestade.', secs: 60 },
      { text: 'Respire sentindo essa firmeza. Nada do que passa por você consegue tirar você do lugar.', secs: 40 },
    ],
    closing: 'Quando o dia ficar pesado, lembre: “Eu sou a montanha”. O clima sempre muda.',
  },
  {
    id: 'perdao',
    title: 'Soltar uma mágoa',
    theme: 'Perdão',
    intro: 'Perdoar não é concordar com o que aconteceu. É parar de carregar o peso sozinho(a).',
    steps: [
      { text: 'Respire fundo e coloque a mão no peito. Lembre-se: você está em segurança agora.', secs: 30 },
      { text: 'Traga à mente uma mágoa pequena — não a maior de todas. Perceba onde ela aparece no corpo.', secs: 45 },
      { text: 'Reconheça a dor: “Isso me machucou. Eu não merecia.” Deixe esse sentimento existir por alguns instantes.', secs: 45 },
      { text: 'Tente ver a pessoa como alguém imperfeito, que também carrega dores e erra, assim como todos nós.', secs: 50 },
      { text: 'Diga em silêncio, no seu tempo: “Eu escolho não carregar mais isso. Eu me liberto.”', secs: 45 },
      { text: 'Agora volte o perdão para você mesmo(a), por algo que se cobra até hoje: “Eu também mereço recomeçar.”', secs: 45 },
    ],
    closing: 'O perdão é um processo, não um instante. Cada vez que você pratica, a mágoa fica um pouco mais leve.',
  },
  {
    id: 'foco',
    title: 'Mente clara para focar',
    theme: 'Foco',
    intro: 'Três minutos para limpar o ruído antes de uma tarefa importante.',
    steps: [
      { text: 'Afaste o celular. Sente-se, feche os olhos e faça a respiração em caixa: inspire 4, segure 4, solte 4, segure 4.', secs: 60 },
      { text: 'Imagine que cada pensamento solto é uma aba aberta no navegador. Feche uma por uma.', secs: 40 },
      { text: 'Anote mentalmente (ou no papel) qualquer pendência que insistir em voltar. Ela está guardada; pode soltar.', secs: 30 },
      { text: 'Visualize a tarefa que vai fazer agora, já concluída. Como você se sente ao terminar?', secs: 40 },
      { text: 'Escolha o primeiro passo físico: abrir o arquivo, pegar a caneta, escrever a primeira frase.', secs: 25 },
    ],
    closing: 'Abra os olhos e faça só o primeiro passo. O foco nasce da ação, não da espera.',
  },
  {
    id: 'ja-tive',
    title: 'O que eu já vivi',
    theme: 'Gratidão',
    intro: 'Uma viagem pela memória para agradecer pelas pessoas e fases que te trouxeram até aqui.',
    steps: [
      { text: 'Respire devagar e imagine que está abrindo um álbum de fotografias da sua vida.', secs: 30 },
      { text: 'Primeira foto: a sua infância. Um lugar, um cheiro, alguém que cuidou de você. Agradeça.', secs: 55 },
      { text: 'Próxima foto: uma pessoa que acreditou em você antes de você mesmo(a) acreditar.', secs: 50 },
      { text: 'Agora uma fase difícil que você superou. Veja como ela te deixou mais forte. Agradeça até por ela.', secs: 55 },
      { text: 'Uma conquista que hoje parece comum, mas que um dia foi um sonho. Sinta de novo a alegria de alcançá-la.', secs: 50 },
      { text: 'Feche o álbum com carinho. Tudo isso faz parte de você e ninguém pode tirar.', secs: 30 },
    ],
    closing: 'Você não chegou até aqui sozinho(a) nem por acaso. Que tal mandar hoje uma mensagem a alguém dessas fotos?',
  },
  {
    id: 'futuro',
    title: 'Agradecer pelo que virá',
    theme: 'Esperança',
    intro: 'Visualizar o futuro com gratidão, como se ele já estivesse a caminho.',
    steps: [
      { text: 'Respire fundo e imagine-se daqui a um ano, num dia comum e feliz.', secs: 40 },
      { text: 'Onde você está? Quem está com você? Como é a luz, o som, o cheiro desse lugar?', secs: 55 },
      { text: 'O que você conquistou nesse ano? Veja os detalhes como se fossem reais.', secs: 55 },
      { text: 'Sinta a gratidão do seu “eu do futuro” pelas escolhas que você está fazendo hoje.', secs: 45 },
      { text: 'Pergunte a esse “eu do futuro”: “Qual é o conselho para hoje?” Escute a primeira resposta.', secs: 45 },
      { text: 'Volte ao presente trazendo esse conselho com você.', secs: 25 },
    ],
    closing: 'O futuro é construído com o que você faz hoje. Agradeça desde já pelo caminho.',
  },
  {
    id: 'respiracao-contada',
    title: 'Contar respirações',
    theme: 'Concentração',
    intro: 'A forma mais simples (e uma das mais antigas) de treinar a atenção.',
    steps: [
      { text: 'Sente-se confortável e respire normalmente, sem controlar o ritmo.', secs: 25 },
      { text: 'Ao soltar o ar, conte “um”. Na próxima expiração, “dois”. Vá até dez e recomece do um.', secs: 90 },
      { text: 'Se perder a conta ou passar do dez, não tem problema: isso é o treino. Recomece do um, sem bronca.', secs: 75 },
      { text: 'Agora pare de contar e apenas observe a respiração por conta própria, com a mente mais quieta.', secs: 60 },
    ],
    closing: 'Cada vez que você percebeu a distração e voltou, o seu “músculo” da atenção ficou mais forte.',
  },
  {
    id: 'entrega',
    title: 'Entregar o que não controlo',
    theme: 'Paz',
    intro: 'Para os dias em que a vontade de controlar tudo está pesando.',
    steps: [
      { text: 'Respire fundo e abra as mãos sobre as pernas, com as palmas para cima.', secs: 25 },
      { text: 'Pense nas preocupações que estão com você hoje. Imagine cada uma como uma pedra na sua mão.', secs: 45 },
      { text: 'Separe as pedras: quais dependem de você? Quais não dependem? (como ensinava o estoico Epicteto)', secs: 50 },
      { text: 'As que não dependem de você: imagine-se colocando-as no chão, uma por uma. Você não precisa carregá-las.', secs: 50 },
      { text: 'As que dependem: escolha uma e decida o próximo passo concreto. Só um.', secs: 40 },
      { text: 'Sinta as mãos mais leves. Respire nessa leveza.', secs: 30 },
    ],
    closing: 'Fazer a sua parte e soltar o resto não é desistir — é confiar. Isso também é coragem.',
  },
  {
    id: 'natureza',
    title: 'Caminhada pela floresta',
    theme: 'Relaxamento',
    intro: 'Uma visualização para descansar a mente quando não dá para sair de casa.',
    steps: [
      { text: 'Feche os olhos e imagine que está entrando numa floresta fresca, de manhã cedo.', secs: 35 },
      { text: 'Sinta o chão macio de folhas sob os pés e o ar úmido e perfumado entrando nos pulmões.', secs: 45 },
      { text: 'Escute os pássaros, o vento nas copas e, ao longe, o som de um riacho.', secs: 45 },
      { text: 'Chegue ao riacho. Coloque as mãos na água fria e imagine o cansaço indo embora com a correnteza.', secs: 50 },
      { text: 'Sente-se numa pedra, ao sol. Sinta o calor no rosto e fique ali, sem fazer nada.', secs: 60 },
      { text: 'Quando estiver pronto(a), volte pelo caminho, trazendo essa calma com você.', secs: 30 },
    ],
    closing: 'Esse lugar existe dentro de você. Volte a ele sempre que precisar de uma pausa.',
  },
];

const dayOfYear = (date: Date) => Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86_400_000);

/** A meditação de hoje (muda à meia-noite). `offset` permite ver as dos próximos dias. */
export const meditationOfDay = (date = new Date(), offset = 0) => MEDITATIONS[(((dayOfYear(date) + offset) % MEDITATIONS.length) + MEDITATIONS.length) % MEDITATIONS.length];

export const meditationSeconds = (m: Meditation) => m.steps.reduce((t, s) => t + s.secs, 0);

/** Item de uma lista que troca a cada dia. */
export const dailyPick = <T,>(list: T[], date = new Date(), salt = 0) => list[(dayOfYear(date) + salt) % list.length];
