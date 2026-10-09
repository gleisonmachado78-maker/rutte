import type { GoalId } from '@/types';
import { BOOKS } from './books';

/** Uma dica prática tirada de um livro. */
export interface BookTip {
  tip: string;
  /** o "porquê" em uma frase */
  detail: string;
  book: string;
  author: string;
}

export interface GoalGuide {
  /** frase de abertura do guia */
  intro: string;
  tips: BookTip[];
  /** busca pronta no YouTube */
  search: string;
}

/** Guias por objetivo: dicas de livros conhecidos (edições em português) e a busca de vídeos. */
export const GOAL_GUIDES: Record<GoalId, GoalGuide> = {
  rotina: {
    intro: 'Rotina boa não é rígida: é previsível. Comece pequeno e repita.',
    search: 'como organizar a rotina diária dicas práticas',
    tips: [
      { tip: 'Empilhe hábitos', detail: 'Use a fórmula “depois de [algo que já faço], vou [hábito novo]”. O hábito antigo vira gatilho do novo.', book: 'Hábitos Atômicos', author: 'James Clear' },
      { tip: 'Regra dos 2 minutos', detail: 'Reduza o hábito até caber em 2 minutos: “ler 30 páginas” vira “ler uma página”. O importante é aparecer.', book: 'Hábitos Atômicos', author: 'James Clear' },
      { tip: 'Entenda o ciclo do hábito', detail: 'Todo hábito tem deixa → rotina → recompensa. Mantenha a deixa e a recompensa e troque só a rotina.', book: 'O poder do hábito', author: 'Charles Duhigg' },
      { tip: 'Proteja a primeira hora do dia', detail: 'Uma manhã com silêncio, movimento, leitura e escrita define o tom do resto do dia.', book: 'O milagre da manhã', author: 'Hal Elrod' },
      { tip: 'Menos, porém melhor', detail: 'Antes de aceitar algo, pergunte: isso é essencial? Se não for um “sim, claro!”, é um não.', book: 'Essencialismo', author: 'Greg McKeown' },
    ],
  },
  produtividade: {
    intro: 'Produtividade é fazer o que importa primeiro — não fazer mais coisas.',
    search: 'como ser mais produtivo técnicas que funcionam',
    tips: [
      { tip: 'Ache a única coisa', detail: 'Pergunte: qual é a única coisa que, se eu fizer, torna todo o resto mais fácil ou desnecessário?', book: 'A única coisa', author: 'Gary Keller e Jay Papasan' },
      { tip: 'Tire tudo da cabeça', detail: 'Anote cada pendência num lugar confiável. A mente serve para ter ideias, não para guardá-las.', book: 'A arte de fazer acontecer', author: 'David Allen' },
      { tip: 'Coma o sapo primeiro', detail: 'Comece o dia pela tarefa mais difícil e importante. O resto do dia fica leve.', book: 'Comece pelo mais difícil', author: 'Brian Tracy' },
      { tip: 'Blocos de trabalho focado', detail: 'Reserve períodos sem celular e sem notificações para o trabalho que exige raciocínio.', book: 'Trabalho focado', author: 'Cal Newport' },
      { tip: 'Trabalhe em pomodoros', detail: '25 minutos de foco total e 5 de pausa. A cada 4 ciclos, uma pausa maior.', book: 'A técnica Pomodoro', author: 'Francesco Cirillo' },
    ],
  },
  empresa: {
    intro: 'Empresa saudável depende de processo, cliente e caixa — nessa ordem de atenção diária.',
    search: 'como organizar e crescer uma pequena empresa dicas',
    tips: [
      { tip: 'Trabalhe no negócio, não só nele', detail: 'Escreva como cada tarefa é feita. Processo documentado é o que permite delegar e crescer.', book: 'O mito do empreendedor', author: 'Michael E. Gerber' },
      { tip: 'Construir, medir, aprender', detail: 'Lance uma versão simples, meça a reação dos clientes e ajuste rápido em vez de planejar por meses.', book: 'A startup enxuta', author: 'Eric Ries' },
      { tip: 'Comece com o fim em mente', detail: 'Defina onde a empresa precisa estar em 1 ano e escolha as tarefas da semana a partir disso.', book: 'Os 7 hábitos das pessoas altamente eficazes', author: 'Stephen R. Covey' },
      { tip: 'Crie algo único', detail: 'Em vez de copiar o concorrente, procure o que só você consegue entregar — é aí que está a margem.', book: 'De zero a um', author: 'Peter Thiel' },
    ],
  },
  saude: {
    intro: 'Saúde se constrói com sono, movimento e comida de verdade — todos os dias um pouco.',
    search: 'hábitos saudáveis para o dia a dia como começar',
    tips: [
      { tip: 'Durma no mesmo horário', detail: 'Horários regulares de dormir e acordar valem mais que dormir muito no fim de semana. Mire em 7 a 9 horas.', book: 'Por que nós dormimos', author: 'Matthew Walker' },
      { tip: 'Mova-se naturalmente', detail: 'As pessoas que vivem mais caminham, sobem escadas e cuidam da horta — o movimento faz parte do dia.', book: 'Zonas azuis', author: 'Dan Buettner' },
      { tip: 'Torne o hábito óbvio', detail: 'Deixe a roupa de treino e a garrafa de água à vista. O ambiente decide mais que a força de vontade.', book: 'Hábitos Atômicos', author: 'James Clear' },
      { tip: 'Exercício é remédio para a mente', detail: 'Atividade física melhora humor, foco e memória — não é só sobre o corpo.', book: 'Corpo ativo, mente desperta', author: 'John J. Ratey' },
    ],
  },
  emagrecer: {
    intro: 'Emagrecer é consistência, não sofrimento: ajuste o ambiente e a rotina de comer.',
    search: 'como emagrecer com saúde dicas de nutricionista',
    tips: [
      { tip: 'Coma comida de verdade', detail: '“Coma comida. Não muito. Principalmente plantas.” Prefira o que sua avó reconheceria como comida.', book: 'Em defesa da comida', author: 'Michael Pollan' },
      { tip: 'Pare antes de encher', detail: 'Termine a refeição quando estiver cerca de 80% satisfeito — o corpo demora para sinalizar a saciedade.', book: 'Zonas azuis', author: 'Dan Buettner' },
      { tip: 'Evite beliscar o dia todo', detail: 'Refeições definidas, com intervalos, ajudam a controlar a fome e a insulina.', book: 'O código da obesidade', author: 'Jason Fung' },
      { tip: 'Mude o ambiente', detail: 'Tire os doces da vista e deixe frutas na frente. O que está à mão é o que você come.', book: 'Hábitos Atômicos', author: 'James Clear' },
    ],
  },
  massa: {
    intro: 'Ganhar massa é treinar com progressão, comer proteína e dormir bem.',
    search: 'como ganhar massa muscular treino e alimentação iniciantes',
    tips: [
      { tip: 'Sobrecarga progressiva', detail: 'Aumente aos poucos carga ou repetições. Se o treino não fica mais desafiador, o músculo não tem motivo para crescer.', book: 'Maior, mais magro, mais forte', author: 'Michael Matthews' },
      { tip: 'Proteína em todas as refeições', detail: 'Distribua a proteína ao longo do dia em vez de concentrar numa refeição só.', book: 'Maior, mais magro, mais forte', author: 'Michael Matthews' },
      { tip: 'O músculo cresce no descanso', detail: 'É dormindo que o corpo se recupera. Pouco sono derruba força e recuperação.', book: 'Por que nós dormimos', author: 'Matthew Walker' },
      { tip: 'Nunca falhe duas vezes', detail: 'Perdeu um treino? Tudo bem. Só não deixe virar dois seguidos.', book: 'Hábitos Atômicos', author: 'James Clear' },
    ],
  },
  financas: {
    intro: 'Dinheiro em ordem é gastar consciente, guardar primeiro e deixar o tempo trabalhar.',
    search: 'como organizar as finanças pessoais passo a passo',
    tips: [
      { tip: 'Pague-se primeiro', detail: 'Guarde pelo menos 10% de tudo o que ganhar assim que o dinheiro entrar — antes das outras contas.', book: 'O homem mais rico da Babilônia', author: 'George S. Clason' },
      { tip: 'Ativos x passivos', detail: 'Ativo põe dinheiro no seu bolso; passivo tira. Compre ativos antes de luxos.', book: 'Pai Rico, Pai Pobre', author: 'Robert T. Kiyosaki' },
      { tip: 'Monte a reserva de emergência', detail: 'Antes de investir em risco, tenha guardado alguns meses do seu custo de vida.', book: 'Me Poupe!', author: 'Nathalia Arcuri' },
      { tip: 'Gaste bem, não pouco', detail: 'Corte o que não traz valor e mantenha o que te faz feliz — o cafezinho pode ficar.', book: 'Do mil ao milhão', author: 'Thiago Nigro' },
      { tip: 'O tempo é o maior aliado', detail: 'Juros compostos premiam quem começa cedo e não interrompe. Constância vence genialidade.', book: 'A psicologia financeira', author: 'Morgan Housel' },
    ],
  },
  estudos: {
    intro: 'Estudar bem é lembrar ativamente e revisar no tempo certo — não reler.',
    search: 'como estudar melhor técnicas de memorização comprovadas',
    tips: [
      { tip: 'Teste a si mesmo', detail: 'Feche o livro e tente lembrar. Puxar da memória fixa muito mais do que reler ou grifar.', book: 'Fixe o conhecimento', author: 'Peter C. Brown e outros' },
      { tip: 'Revise espaçado', detail: 'Revise um dia depois, uma semana depois, um mês depois. O esquecimento parcial fortalece a lembrança.', book: 'Fixe o conhecimento', author: 'Peter C. Brown e outros' },
      { tip: 'Alterne foco e descanso', detail: 'O cérebro aprende no modo focado e conecta ideias no modo difuso — a pausa faz parte do estudo.', book: 'Aprendendo a aprender', author: 'Barbara Oakley' },
      { tip: 'Pratique do jeito que vai usar', detail: 'Vai fazer prova? Resolva questões. Vai falar inglês? Converse. A prática direta acelera tudo.', book: 'Ultra-aprendizado', author: 'Scott H. Young' },
      { tip: 'O erro faz parte', detail: 'Com mentalidade de crescimento, “ainda não sei” substitui “não sou bom nisso”.', book: 'Mindset', author: 'Carol Dweck' },
    ],
  },
  familia: {
    intro: 'Família fortalece com presença de verdade, rituais simples e conversa sem pressa.',
    search: 'como ter mais tempo de qualidade com a família dicas',
    tips: [
      { tip: 'Fale a língua do outro', detail: 'Uns sentem amor com palavras, outros com tempo, presentes, ajuda ou toque. Descubra a de cada um.', book: 'As 5 linguagens do amor', author: 'Gary Chapman' },
      { tip: 'Conecte antes de corrigir', detail: 'Com crianças, acolha a emoção primeiro e só depois redirecione o comportamento.', book: 'O cérebro da criança', author: 'Daniel J. Siegel e Tina Payne Bryson' },
      { tip: 'Firmeza com gentileza', detail: 'Regras claras, ditas com respeito. Nem permissivo, nem autoritário.', book: 'Disciplina positiva', author: 'Jane Nelsen' },
      { tip: 'Reunião de família semanal', detail: 'Um momento fixo por semana para conversar, planejar e se divertir juntos.', book: 'Os 7 hábitos das famílias altamente eficazes', author: 'Stephen R. Covey' },
    ],
  },
  fe: {
    intro: 'Fé cresce com prática diária: silêncio, gratidão e servir.',
    search: 'como fortalecer a fé e a vida espiritual no dia a dia',
    tips: [
      { tip: 'Viva com propósito', detail: 'Pergunte todos os dias: para que estou aqui? O propósito orienta as escolhas pequenas.', book: 'Uma vida com propósitos', author: 'Rick Warren' },
      { tip: 'Encontre sentido até na dificuldade', detail: 'Não escolhemos tudo o que acontece, mas escolhemos a atitude diante disso.', book: 'Em busca de sentido', author: 'Viktor E. Frankl' },
      { tip: 'Pratique as disciplinas', detail: 'Oração, meditação, estudo e simplicidade são práticas — e práticas crescem com repetição.', book: 'Celebração da disciplina', author: 'Richard J. Foster' },
      { tip: 'Sirva quem está perto', detail: 'Liderança e espiritualidade se mostram em servir: escute, ajude, cuide.', book: 'O monge e o executivo', author: 'James C. Hunter' },
    ],
  },
  mente: {
    intro: 'Mente tranquila se treina: perceber o pensamento, nomear a emoção e voltar ao agora.',
    search: 'como controlar a ansiedade técnicas simples',
    tips: [
      { tip: 'Respiração de 3 minutos', detail: 'Pare, perceba o que sente, respire prestando atenção e expanda a atenção para o corpo todo.', book: 'Atenção plena', author: 'Mark Williams e Danny Penman' },
      { tip: 'Dê nome à emoção', detail: 'Reconhecer “estou com raiva” ou “estou ansioso” já diminui a força da emoção.', book: 'Inteligência emocional', author: 'Daniel Goleman' },
      { tip: 'Desacelere o pensamento', detail: 'Questione os pensamentos repetitivos em vez de alimentá-los: isso é fato ou suposição?', book: 'Ansiedade', author: 'Augusto Cury' },
      { tip: 'Volte para o presente', detail: 'A maior parte da angústia vive no passado ou no futuro. Sinta os pés no chão e a respiração agora.', book: 'O poder do agora', author: 'Eckhart Tolle' },
      { tip: 'Pare de buscar aprovação', detail: 'Separe o que é tarefa sua do que é tarefa dos outros. A opinião alheia não é sua responsabilidade.', book: 'A coragem de não agradar', author: 'Ichiro Kishimi e Fumitake Koga' },
    ],
  },
};

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Capa do livro, quando ele está na curadoria da Biblioteca. */
export function tipBook(tip: BookTip) {
  return BOOKS.find((b) => norm(b.title).startsWith(norm(tip.book)));
}

export const youtubeSearchUrl = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
