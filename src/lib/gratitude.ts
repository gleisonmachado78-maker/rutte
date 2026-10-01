/**
 * Conteúdo da seção Gratidão: perguntas do diário, orações tradicionais (domínio público)
 * e reflexões escritas para o app.
 */

/** Perguntas do diário: mudam a cada dia para não virar rotina mecânica. */
export const PROMPTS = {
  present: [
    'Pelo que você é grato(a) hoje?',
    'Que pessoa tornou seu dia melhor?',
    'Que coisa simples você teve hoje e que muita gente não tem?',
    'O que no seu corpo funcionou bem hoje?',
    'Que pequena alegria aconteceu hoje?',
    'O que você aprendeu hoje?',
    'Qual conforto da sua casa você nem percebe mais?',
  ],
  past: [
    'Que momento do passado te trouxe até aqui?',
    'Quem te ajudou quando você mais precisou?',
    'Qual dificuldade que você superou e hoje agradece por ter vivido?',
    'Que lugar ou fase da sua vida você guarda com carinho?',
    'Que porta que se fechou acabou abrindo outra melhor?',
  ],
  future: [
    'O que você ainda vai conquistar e já agradece?',
    'Que sonho está a caminho?',
    'Que versão sua você agradece por estar construindo?',
    'O que você quer viver neste ano, como se já tivesse acontecido?',
    'Que pessoa você ainda vai ajudar no futuro?',
  ],
};

export const promptOf = (list: string[], date = new Date()) => {
  const day = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86_400_000);
  return list[day % list.length];
};

export interface Prayer {
  id: string;
  title: string;
  /** de onde vem o texto */
  origin: string;
  text: string;
}

/** Orações tradicionais (textos de domínio público) e orações de gratidão escritas para o app. */
export const PRAYERS: Prayer[] = [
  {
    id: 'gratidao-dia',
    title: 'Oração de gratidão pelo dia',
    origin: 'Escrita para a Rutte',
    text: `Obrigado por este dia.
Pelo ar que respiro, pelo corpo que me carrega e pela mente que me permite escolher.
Obrigado pelas pessoas que caminham comigo, pelas que já passaram e deixaram algo bom, e pelas que ainda vão chegar.
Obrigado pelo que tenho, pelo que já tive e pelo que ainda virá.
Que eu saiba enxergar o bem nas coisas pequenas e devolver ao mundo um pouco do que recebo.
Amém.`,
  },
  {
    id: 'manha',
    title: 'Oração da manhã',
    origin: 'Escrita para a Rutte',
    text: `Senhor, obrigado por mais um amanhecer.
Coloco em tuas mãos este dia: meu trabalho, meus planos e as pessoas que vou encontrar.
Dá-me calma para as dificuldades, coragem para fazer o que é certo e alegria para perceber as bênçãos do caminho.
Que eu termine este dia melhor do que comecei.
Amém.`,
  },
  {
    id: 'noite',
    title: 'Oração da noite',
    origin: 'Escrita para a Rutte',
    text: `Obrigado por tudo o que vivi hoje — o que deu certo e também o que me ensinou.
Perdoa meus erros e me ajuda a perdoar quem me feriu.
Entrego minhas preocupações e descanso em paz.
Protege a minha casa e as pessoas que eu amo.
Amém.`,
  },
  {
    id: 'pai-nosso',
    title: 'Pai Nosso',
    origin: 'Oração tradicional cristã',
    text: `Pai nosso, que estais nos céus,
santificado seja o vosso nome;
venha a nós o vosso reino;
seja feita a vossa vontade,
assim na terra como no céu.
O pão nosso de cada dia nos dai hoje;
perdoai-nos as nossas ofensas,
assim como nós perdoamos a quem nos tem ofendido;
e não nos deixeis cair em tentação,
mas livrai-nos do mal.
Amém.`,
  },
  {
    id: 'ave-maria',
    title: 'Ave Maria',
    origin: 'Oração tradicional católica',
    text: `Ave Maria, cheia de graça,
o Senhor é convosco;
bendita sois vós entre as mulheres,
e bendito é o fruto do vosso ventre, Jesus.
Santa Maria, Mãe de Deus,
rogai por nós, pecadores,
agora e na hora de nossa morte.
Amém.`,
  },
  {
    id: 'sao-francisco',
    title: 'Oração de São Francisco',
    origin: 'Oração tradicional (atribuída a São Francisco de Assis)',
    text: `Senhor, fazei de mim um instrumento de vossa paz.
Onde houver ódio, que eu leve o amor;
onde houver ofensa, que eu leve o perdão;
onde houver discórdia, que eu leve a união;
onde houver dúvida, que eu leve a fé;
onde houver erro, que eu leve a verdade;
onde houver desespero, que eu leve a esperança;
onde houver tristeza, que eu leve a alegria;
onde houver trevas, que eu leve a luz.
Ó Mestre, fazei que eu procure mais
consolar, que ser consolado;
compreender, que ser compreendido;
amar, que ser amado.
Pois é dando que se recebe,
é perdoando que se é perdoado,
e é morrendo que se vive para a vida eterna.`,
  },
  {
    id: 'salmo-23',
    title: 'Salmo 23',
    origin: 'Bíblia — tradução de João Ferreira de Almeida (domínio público)',
    text: `O Senhor é o meu pastor; nada me faltará.
Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.
Refrigera a minha alma; guia-me pelas veredas da justiça, por amor do seu nome.
Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo;
a tua vara e o teu cajado me consolam.
Preparas uma mesa perante mim na presença dos meus inimigos,
unges a minha cabeça com óleo, o meu cálice transborda.
Certamente que a bondade e a misericórdia me seguirão todos os dias da minha vida;
e habitarei na casa do Senhor por longos dias.`,
  },
  {
    id: 'serenidade',
    title: 'Oração da Serenidade',
    origin: 'Atribuída a Reinhold Niebuhr',
    text: `Concedei-me, Senhor, a serenidade necessária
para aceitar as coisas que não posso modificar,
coragem para modificar aquelas que posso
e sabedoria para distinguir umas das outras.`,
  },
];

/** Reflexões curtas de gratidão (sem religião), escritas para o app. */
export const REFLECTIONS: { title: string; text: string }[] = [
  { title: 'O que você já tem', text: 'Pense em algo que hoje é comum para você e que um dia foi um sonho: a casa, um trabalho, uma amizade, a saúde. Agradeça por ele como se tivesse acabado de chegar.' },
  { title: 'O que você já teve', text: 'Nem tudo que passou foi perdido. Pessoas, fases e lugares que ficaram para trás moldaram quem você é. Agradeça pelo que viveu — inclusive pelo que doeu e ensinou.' },
  { title: 'O que você ainda terá', text: 'Gratidão também olha para frente: agradecer pelo que está a caminho dá força para continuar. Escolha um sonho e agradeça hoje pelo dia em que ele vai se realizar.' },
  { title: 'Gratidão pelas pessoas', text: 'Escolha alguém e diga hoje, de verdade, o quanto essa pessoa é importante. Uma mensagem simples pode mudar o dia dela — e o seu.' },
  { title: 'Gratidão pelo corpo', text: 'Seus olhos leem este texto, seus pulmões respiram sem você pedir, seu coração bate o dia todo. Respire fundo três vezes e agradeça ao seu corpo.' },
  { title: 'Gratidão nas dificuldades', text: 'Mesmo num dia difícil, procure uma coisa boa, por menor que seja. Treinar o olhar para o bem não apaga os problemas, mas devolve o ânimo para enfrentá-los.' },
];

/** Padrões de respiração para a meditação rápida (segundos por fase). */
export const BREATHING = [
  { id: 'calma', label: 'Calma', desc: 'Inspire 4 · segure 4 · solte 6', phases: [['Inspire', 4], ['Segure', 4], ['Solte', 6]] },
  { id: 'caixa', label: 'Respiração em caixa', desc: '4 · 4 · 4 · 4 — usada para foco e controle', phases: [['Inspire', 4], ['Segure', 4], ['Solte', 4], ['Segure', 4]] },
  { id: '478', label: '4-7-8 para dormir', desc: 'Inspire 4 · segure 7 · solte 8', phases: [['Inspire', 4], ['Segure', 7], ['Solte', 8]] },
] as const satisfies readonly { id: string; label: string; desc: string; phases: readonly (readonly [string, number])[] }[];
