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

export type PrayerTheme = 'gratidao' | 'dia' | 'entrega' | 'perdao' | 'familia' | 'dificuldade' | 'tradicional';

export const PRAYER_THEMES: { id: PrayerTheme; label: string }[] = [
  { id: 'gratidao', label: 'Gratidão' },
  { id: 'dia', label: 'Manhã e noite' },
  { id: 'entrega', label: 'Entrega e paz' },
  { id: 'perdao', label: 'Perdão' },
  { id: 'familia', label: 'Família' },
  { id: 'dificuldade', label: 'Momentos difíceis' },
  { id: 'tradicional', label: 'Tradicionais e salmos' },
];

export interface Prayer {
  id: string;
  title: string;
  /** de onde vem o texto */
  origin: string;
  theme: PrayerTheme;
  text: string;
}

/** Orações tradicionais (textos de domínio público) e orações escritas para o app. */
export const PRAYERS: Prayer[] = [
  {
    id: 'gratidao-dia',
    title: 'Oração de gratidão profunda',
    origin: 'Escrita para a Rutte',
    theme: 'gratidao',
    text: `Senhor, antes de te pedir qualquer coisa, eu quero simplesmente te agradecer.

Obrigado pelo ar que entra nos meus pulmões sem que eu precise pedir, pelo coração que bate em silêncio e pelo corpo que me carrega, mesmo cansado.
Obrigado pela mesa, pelo teto e pela cama — coisas que eu chamo de comuns e que tantos ainda esperam ter.

Obrigado pelo que tenho hoje: as pessoas que me amam, o trabalho das minhas mãos, cada pequena alegria que passa despercebida.
Obrigado pelo que já tive: as pessoas que partiram e deixaram marcas boas, as fases que terminaram e me ensinaram, até as dores que me tornaram mais forte e mais humano.
Obrigado pelo que ainda terei: os sonhos que estão a caminho, as portas que ainda vão se abrir e a pessoa que estou me tornando.

Perdoa as vezes em que reclamei de barriga cheia, em que olhei só para o que falta e não para tudo o que sobra.
Ensina-me a enxergar a tua mão nas coisas pequenas, e a devolver ao mundo, em gentileza, um pouco de tudo o que recebo.

Que a gratidão não seja só uma palavra na minha boca, mas o jeito como eu vivo.
Amém.`,
  },
  {
    id: 'manha',
    title: 'Oração da manhã',
    origin: 'Escrita para a Rutte',
    theme: 'dia',
    text: `Senhor, obrigado por este novo amanhecer. Hoje é um presente que eu ainda não abri.

Coloco em tuas mãos as horas que estão diante de mim: o trabalho, os compromissos, as conversas e também os imprevistos que eu ainda não conheço.
Abençoa os meus pensamentos, para que sejam claros; as minhas palavras, para que construam e não firam; as minhas atitudes, para que sejam justas.

Dá-me paciência com quem é difícil e humildade para reconhecer quando o difícil sou eu.
Dá-me coragem para fazer o que é certo, mesmo quando ninguém estiver olhando.
Se hoje eu cair, levanta-me; se hoje eu acertar, que eu não me esqueça de que tudo vem de ti.

Protege a minha família, os meus amigos e todos os que vão cruzar o meu caminho.
Que no fim deste dia eu possa dizer: valeu a pena, porque eu vivi com amor.
Amém.`,
  },
  {
    id: 'noite',
    title: 'Oração da noite',
    origin: 'Escrita para a Rutte',
    theme: 'dia',
    text: `Senhor, o dia terminou e eu volto para ti.

Obrigado por tudo o que vivi hoje: pelo que deu certo, que me alegrou, e pelo que deu errado, que me ensinou.
Obrigado pelas pessoas que me sorriram, pelas que me ajudaram e até pelas que me testaram a paciência.

Perdoa as palavras que eu não deveria ter dito e o bem que deixei de fazer.
Ajuda-me a perdoar quem me feriu hoje; não quero levar mágoa para a cama nem para o amanhã.

Entrego em tuas mãos as preocupações que ainda pesam: as contas, os problemas, as decisões que não sei tomar.
Elas são grandes para mim, mas pequenas para ti.

Guarda o meu sono, a minha casa e as pessoas que eu amo.
Que eu descanse em paz, sabendo que tu velas por mim enquanto eu durmo.
Amém.`,
  },
  {
    id: 'entrega',
    title: 'Oração de entrega',
    origin: 'Escrita para a Rutte',
    theme: 'entrega',
    text: `Senhor, eu cansei de tentar controlar tudo.

Hoje eu abro as mãos e te entrego aquilo que eu não consigo resolver sozinho.
Te entrego o meu passado, com os erros que ainda me acusam.
Te entrego o meu presente, com as lutas que eu enfrento em silêncio.
Te entrego o meu futuro, com os medos que me tiram o sono.

Eu não preciso entender tudo para confiar em ti.
Se a resposta for “sim”, que eu seja grato; se for “não”, que eu aceite; se for “espere”, que eu tenha paciência.

Tira de mim a ansiedade de querer saber o fim da história antes da hora.
Dá-me a paz de quem sabe que está em boas mãos.

Seja feita a tua vontade, e não a minha — porque a tua é sempre maior e mais bonita do que eu consigo imaginar.
Amém.`,
  },
  {
    id: 'perdao',
    title: 'Oração para perdoar',
    origin: 'Escrita para a Rutte',
    theme: 'perdao',
    text: `Senhor, há uma ferida no meu coração que ainda dói.

Tu conheces o nome de quem me machucou e conheces também o tamanho dessa dor.
Eu não vou fingir que não aconteceu, nem que não importa. Importa, e doeu.

Mas eu não quero mais que essa mágoa governe os meus dias.
Ela me prende ao passado, me rouba a paz e envenena aquilo que tenho de bom.

Por isso, mesmo sem sentir vontade, eu escolho perdoar.
Não porque a pessoa mereça, mas porque eu mereço ser livre.
Abençoa quem me feriu, e cura em mim o que ficou quebrado.

E se eu também feri alguém, dá-me humildade para pedir perdão e coragem para reparar o que for possível.
Ensina-me a perdoar a mim mesmo pelas escolhas que hoje eu faria diferente.

Que o teu amor seja maior do que a minha dor.
Amém.`,
  },
  {
    id: 'familia',
    title: 'Oração pela família',
    origin: 'Escrita para a Rutte',
    theme: 'familia',
    text: `Senhor, obrigado pela minha família — do jeito que ela é, com suas belezas e seus defeitos.

Abençoa cada pessoa da minha casa: conheces as alegrias e as lutas de cada uma, até as que elas não contam a ninguém.
Onde houver cansaço, dá descanso; onde houver doença, dá cura; onde houver distância, dá reaproximação.

Que na nossa casa haja mais escuta do que cobrança, mais abraço do que crítica, mais paciência do que pressa.
Ensina-nos a pedir desculpas e a recomeçar quantas vezes forem necessárias.

Protege os que saem e traz de volta em segurança.
Guarda os que estão longe e consola os que sentem saudade de quem já partiu.

Que os nossos filhos, os nossos pais e todos os que amamos encontrem em nós um lugar seguro.
E que, aconteça o que acontecer, o amor seja sempre a nossa casa.
Amém.`,
  },
  {
    id: 'dificuldade',
    title: 'Oração para os momentos difíceis',
    origin: 'Escrita para a Rutte',
    theme: 'dificuldade',
    text: `Senhor, hoje está difícil.

Eu não tenho palavras bonitas, só um coração apertado e muitas perguntas sem resposta.
Tu sabes o que estou enfrentando, mesmo aquilo que eu não consigo explicar a ninguém.

Não te peço que tires toda a dor de uma vez; te peço força para atravessar este dia.
Se eu não conseguir ver o caminho inteiro, mostra-me apenas o próximo passo.

Lembra-me das outras vezes em que eu achei que não ia aguentar — e aguentei.
Tu estavas lá, mesmo quando eu não percebia.

Coloca perto de mim pessoas que me sustentem, e dá-me humildade para pedir ajuda.
Acalma a minha mente, aquieta a minha ansiedade e renova a minha esperança.

Esta fase vai passar. Até lá, segura a minha mão.
Amém.`,
  },
  {
    id: 'trabalho',
    title: 'Oração pelo trabalho',
    origin: 'Escrita para a Rutte',
    theme: 'gratidao',
    text: `Senhor, obrigado pelo meu trabalho e pelo sustento que vem dele.

Abençoa as minhas mãos e a minha mente, para que eu faça bem feito aquilo que me foi confiado.
Que eu trabalhe com honestidade, mesmo quando o atalho parecer mais fácil.
Dá-me sabedoria nas decisões, criatividade nos problemas e calma sob pressão.

Abençoa os meus colegas, os meus clientes e os meus líderes.
Que o meu trabalho sirva a alguém e faça a vida de alguém um pouco melhor.

Livra-me de colocar o trabalho acima das pessoas que eu amo, e lembra-me de que o meu valor não está no que eu produzo.
Amém.`,
  },
  {
    id: 'saude',
    title: 'Oração pela saúde',
    origin: 'Escrita para a Rutte',
    theme: 'dificuldade',
    text: `Senhor, coloco diante de ti o meu corpo e a saúde de quem eu amo.

Obrigado por cada dia de saúde que eu tive e que muitas vezes não percebi.
Onde houver dor, traz alívio; onde houver doença, traz cura; onde houver medo de um diagnóstico, traz paz.

Guia as mãos dos médicos, enfermeiros e de todos que cuidam dos doentes.
Dá-me disciplina para cuidar do corpo que me deste: comer bem, descansar, me movimentar.

E se a cura demorar, que eu não perca a fé nem a esperança.
Amém.`,
  },
  {
    id: 'pai-nosso',
    title: 'Pai Nosso',
    origin: 'Oração tradicional cristã',
    theme: 'tradicional',
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
    theme: 'tradicional',
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
    theme: 'tradicional',
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
    id: 'alma-de-cristo',
    title: 'Alma de Cristo (Anima Christi)',
    origin: 'Oração tradicional do séc. XIV, rezada por Santo Inácio de Loyola',
    theme: 'tradicional',
    text: `Alma de Cristo, santificai-me.
Corpo de Cristo, salvai-me.
Sangue de Cristo, inebriai-me.
Água do lado de Cristo, lavai-me.
Paixão de Cristo, confortai-me.
Ó bom Jesus, ouvi-me.
Dentro de vossas chagas, escondei-me.
Não permitais que eu me separe de vós.
Do inimigo maligno, defendei-me.
Na hora da minha morte, chamai-me
e mandai-me ir para vós,
para que com os vossos santos vos louve
por todos os séculos dos séculos.
Amém.`,
  },
  {
    id: 'tomai-senhor',
    title: 'Tomai, Senhor, e recebei',
    origin: 'Santo Inácio de Loyola, Exercícios Espirituais (1548)',
    theme: 'entrega',
    text: `Tomai, Senhor, e recebei
toda a minha liberdade,
a minha memória, o meu entendimento
e toda a minha vontade;
tudo o que tenho e possuo.
Vós me destes; a vós, Senhor, o restituo.
Tudo é vosso: disponde de tudo
segundo a vossa vontade.
Dai-me o vosso amor e a vossa graça,
que isso me basta.
Amém.`,
  },
  {
    id: 'salve-rainha',
    title: 'Salve Rainha',
    origin: 'Oração tradicional católica (séc. XI)',
    theme: 'tradicional',
    text: `Salve, Rainha, Mãe de misericórdia,
vida, doçura e esperança nossa, salve!
A vós bradamos, os degredados filhos de Eva;
a vós suspiramos, gemendo e chorando
neste vale de lágrimas.
Eia, pois, advogada nossa,
esses vossos olhos misericordiosos a nós volvei;
e depois deste desterro mostrai-nos Jesus,
bendito fruto do vosso ventre,
ó clemente, ó piedosa, ó doce sempre Virgem Maria.
Rogai por nós, santa Mãe de Deus,
para que sejamos dignos das promessas de Cristo.
Amém.`,
  },
  {
    id: 'vinde-espirito',
    title: 'Vinde, Espírito Santo',
    origin: 'Oração tradicional cristã',
    theme: 'tradicional',
    text: `Vinde, Espírito Santo,
enchei os corações dos vossos fiéis
e acendei neles o fogo do vosso amor.
Enviai o vosso Espírito e tudo será criado,
e renovareis a face da terra.

Ó Deus, que instruístes os corações dos vossos fiéis
com a luz do Espírito Santo,
concedei-nos que, no mesmo Espírito,
saibamos o que é reto
e gozemos sempre da sua consolação.
Amém.`,
  },
  {
    id: 'salmo-23',
    title: 'Salmo 23 — O Senhor é o meu pastor',
    origin: 'Bíblia — tradução de João Ferreira de Almeida (domínio público)',
    theme: 'tradicional',
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
    id: 'salmo-91',
    title: 'Salmo 91 — Proteção',
    origin: 'Bíblia — tradução de João Ferreira de Almeida (domínio público)',
    theme: 'dificuldade',
    text: `Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.
Direi do Senhor: Ele é o meu Deus, o meu refúgio, a minha fortaleza, e nele confiarei.
Porque ele te livrará do laço do passarinheiro e da peste perniciosa.
Ele te cobrirá com as suas penas, e debaixo das suas asas estarás seguro;
a sua verdade é escudo e broquel.
Não temerás espanto noturno, nem seta que voe de dia,
nem peste que ande na escuridão, nem mortandade que assole ao meio-dia.
Mil cairão ao teu lado, e dez mil à tua direita, mas não chegará a ti.
Porque tu, ó Senhor, és o meu refúgio. No Altíssimo fizeste a tua habitação.
Nenhum mal te sucederá, nem praga alguma chegará à tua tenda.
Porque aos seus anjos dará ordem a teu respeito, para te guardarem em todos os teus caminhos.
Eles te sustentarão nas suas mãos, para que não tropeces com o teu pé em pedra.
Pois que tão encarecidamente me amou, também eu o livrarei;
pô-lo-ei num alto retiro, porque conheceu o meu nome.
Ele me invocará, e eu lhe responderei; estarei com ele na angústia;
livrá-lo-ei e o glorificarei.
Fartá-lo-ei com longura de dias, e lhe mostrarei a minha salvação.`,
  },
  {
    id: 'salmo-121',
    title: 'Salmo 121 — O meu socorro vem do Senhor',
    origin: 'Bíblia — tradução de João Ferreira de Almeida (domínio público)',
    theme: 'entrega',
    text: `Levantarei os meus olhos para os montes, de onde vem o meu socorro.
O meu socorro vem do Senhor, que fez o céu e a terra.
Não deixará vacilar o teu pé; aquele que te guarda não tosquenejará.
Eis que não tosquenejará nem dormirá o guarda de Israel.
O Senhor é quem te guarda; o Senhor é a tua sombra à tua direita.
O sol não te molestará de dia, nem a lua de noite.
O Senhor te guardará de todo o mal; guardará a tua alma.
O Senhor guardará a tua entrada e a tua saída, desde agora e para sempre.`,
  },
  {
    id: 'magnificat',
    title: 'Magnificat — O cântico de Maria',
    origin: 'Bíblia, Lucas 1,46-55 — oração tradicional de gratidão',
    theme: 'gratidao',
    text: `A minha alma engrandece ao Senhor,
e o meu espírito se alegra em Deus, meu Salvador,
porque olhou para a humildade de sua serva.
Desde agora, todas as gerações me chamarão bem-aventurada,
porque o Poderoso fez em mim grandes coisas, e santo é o seu nome.
A sua misericórdia se estende de geração em geração
sobre os que o temem.
Mostrou o poder do seu braço,
dispersou os soberbos nos pensamentos de seus corações.
Derrubou os poderosos de seus tronos
e elevou os humildes.
Encheu de bens os famintos
e despediu vazios os ricos.
Socorreu Israel, seu servo,
lembrando-se da sua misericórdia,
como havia prometido a nossos pais,
a Abraão e à sua descendência, para sempre.`,
  },
  {
    id: 'serenidade',
    title: 'Oração da Serenidade',
    origin: 'Atribuída a Reinhold Niebuhr',
    theme: 'entrega',
    text: `Concedei-me, Senhor, a serenidade necessária
para aceitar as coisas que não posso modificar,
coragem para modificar aquelas que posso
e sabedoria para distinguir umas das outras.

Vivendo um dia de cada vez,
desfrutando um momento de cada vez,
aceitando as dificuldades como caminho para a paz.`,
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
  { title: 'A última vez', text: 'Você não sabe quando será a última vez que vai abraçar alguém, ouvir aquela risada ou comer aquela comida de casa. Viva os momentos comuns de hoje como se fossem raros — porque são.' },
  { title: 'Subtrair para valorizar', text: 'Imagine por um minuto a sua vida sem algo que você tem: uma pessoa, o emprego, a visão, a casa. Depois “devolva” isso a você. A pesquisa mostra que esse exercício aumenta a gratidão mais do que só listar coisas boas.' },
  { title: 'As mãos invisíveis', text: 'O café que você tomou passou pelas mãos de quem plantou, colheu, transportou e vendeu. Quase tudo que você usa hoje existe porque centenas de pessoas trabalharam. Você nunca está sozinho(a).' },
  { title: 'Gratidão não é conformismo', text: 'Agradecer pelo que tem não significa parar de querer mais. Significa caminhar em direção aos seus sonhos sem desprezar o lugar onde você está — e chegar lá mais leve.' },
  { title: 'O professor difícil', text: 'Pense em alguém que foi duro com você. Talvez essa pessoa tenha te ensinado limites, paciência ou a sua própria força. Você não precisa gostar dela para agradecer pela lição.' },
  { title: 'Três coisas boas', text: 'Antes de dormir, anote três coisas que deram certo hoje e por que elas aconteceram. Feito por uma semana, esse hábito simples já melhora o humor em estudos de psicologia positiva.' },
  { title: 'A carta que nunca enviou', text: 'Escreva uma carta para alguém que mudou a sua vida e a quem você nunca agradeceu direito. Se puder, leia para essa pessoa. É uma das práticas de gratidão com efeito mais duradouro.' },
  { title: 'O suficiente', text: 'Você não precisa ter tudo para ser feliz hoje. Olhe ao redor e pergunte: “O que já é suficiente?” Às vezes, a paz começa quando paramos de correr atrás do “só mais um pouco”.' },
  { title: 'Gratidão por quem você foi', text: 'O seu “eu do passado” tomou decisões difíceis, estudou, trabalhou e aguentou dias ruins para que você estivesse aqui. Agradeça a ele — ele fez o melhor que podia com o que sabia.' },
  { title: 'Gratidão pela natureza', text: 'Repare hoje no céu, numa árvore, na chuva ou no sol entrando pela janela. A natureza continua fazendo espetáculos de graça; só precisamos levantar a cabeça para ver.' },
];


/** Padrões de respiração para a meditação rápida (segundos por fase). */
export const BREATHING = [
  { id: 'calma', label: 'Calma', desc: 'Inspire 4 · segure 4 · solte 6', phases: [['Inspire', 4], ['Segure', 4], ['Solte', 6]] },
  { id: 'caixa', label: 'Respiração em caixa', desc: '4 · 4 · 4 · 4 — usada para foco e controle', phases: [['Inspire', 4], ['Segure', 4], ['Solte', 4], ['Segure', 4]] },
  { id: '478', label: '4-7-8 para dormir', desc: 'Inspire 4 · segure 7 · solte 8', phases: [['Inspire', 4], ['Segure', 7], ['Solte', 8]] },
] as const satisfies readonly { id: string; label: string; desc: string; phases: readonly (readonly [string, number])[] }[];
