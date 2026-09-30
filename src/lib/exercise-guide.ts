import type { Exercise, MuscleGroup } from '@/types';
import { MUSCLE_FALLBACK, type MotionKey } from './exercise-motion';
import { MUSCLE_LABEL } from './gym';

export type Load = 'barbell' | 'dumbbell' | 'none';

export interface ExerciseGuide {
  motion: MotionKey;
  load: Load;
  target: string;
  steps: string[];
  mistakes: string[];
  breath: string;
}

const g = (motion: MotionKey, load: Load, target: string, steps: string[], mistakes: string[], breath: string): ExerciseGuide => ({
  motion, load, target, steps, mistakes, breath,
});

const EXPIRA = (fase: string) => `Solte o ar ${fase}; puxe o ar na volta controlada.`;

export const EXERCISE_GUIDE: Record<string, ExerciseGuide> = {
  // Peito
  ex_supino_reto: g('benchPress', 'barbell', 'Peitoral, tríceps e ombro anterior', [
    'Deite no banco com olhos abaixo da barra e pés firmes no chão.',
    'Pegue a barra um pouco mais aberta que os ombros e retraia as escápulas.',
    'Desça a barra controlando até tocar levemente o meio do peito.',
    'Empurre para cima até estender os braços, sem travar os cotovelos.',
  ], ['Tirar o quadril do banco', 'Deixar os cotovelos totalmente abertos a 90°', 'Quicar a barra no peito'], EXPIRA('ao empurrar a barra')),
  ex_supino_inclinado: g('inclinePress', 'dumbbell', 'Peitoral superior e ombro anterior', [
    'Ajuste o banco entre 30° e 45° e apoie bem as costas.',
    'Segure os halteres na linha do peito, cotovelos levemente abaixo dos ombros.',
    'Empurre para cima aproximando os halteres no topo.',
    'Desça devagar até sentir o alongamento do peito.',
  ], ['Banco inclinado demais (vira ombro)', 'Arquear muito a lombar'], EXPIRA('ao subir os halteres')),
  ex_supino_halter: g('benchPress', 'dumbbell', 'Peitoral, tríceps e ombro anterior', [
    'Deite no banco com um halter em cada mão apoiado nas coxas e leve-os ao peito.',
    'Com escápulas retraídas, empurre os halteres para cima.',
    'Desça controlando até os cotovelos ficarem um pouco abaixo do banco.',
  ], ['Bater os halteres no topo', 'Perder o controle na descida'], EXPIRA('ao empurrar')),
  ex_flexao: g('pushUp', 'none', 'Peitoral, tríceps e core', [
    'Mãos um pouco mais abertas que os ombros, corpo em linha reta da cabeça aos pés.',
    'Contraia abdômen e glúteos.',
    'Desça o peito até perto do chão com cotovelos a ~45° do corpo.',
    'Empurre o chão e volte à posição inicial.',
  ], ['Quadril caindo ou empinado', 'Cabeça projetada para frente'], EXPIRA('ao subir')),
  ex_crucifixo: g('fly', 'dumbbell', 'Peitoral (foco no alongamento)', [
    'Braços abertos com cotovelos levemente flexionados.',
    'Feche os braços em arco, como se fosse abraçar uma árvore.',
    'Aperte o peito no centro por 1 segundo.',
    'Volte abrindo devagar até sentir o alongamento.',
  ], ['Dobrar e esticar os cotovelos (vira supino)', 'Carga alta demais'], EXPIRA('ao fechar os braços')),

  // Tríceps
  ex_triceps_pulley: g('pushdown', 'none', 'Tríceps', [
    'Em pé, tronco levemente inclinado, segure a barra do pulley.',
    'Cole os cotovelos ao lado do corpo.',
    'Estenda os braços para baixo até esticar totalmente.',
    'Volte devagar até ~90° sem mexer os ombros.',
  ], ['Cotovelos saindo para frente', 'Usar o peso do corpo para empurrar'], EXPIRA('ao empurrar para baixo')),
  ex_triceps_frances: g('overheadExt', 'dumbbell', 'Tríceps (cabeça longa)', [
    'Sentado, segure um halter com as duas mãos acima da cabeça.',
    'Mantenha os cotovelos apontando para cima e próximos da cabeça.',
    'Desça o halter atrás da cabeça dobrando só os cotovelos.',
    'Estenda os braços de volta ao topo.',
  ], ['Abrir muito os cotovelos', 'Arquear a lombar'], EXPIRA('ao estender os braços')),
  ex_mergulho: g('dip', 'none', 'Tríceps e peitoral inferior', [
    'Apoie as mãos no banco atrás do corpo, dedos para frente.',
    'Pernas à frente (joelhos dobrados para facilitar).',
    'Desça o quadril dobrando os cotovelos até ~90°.',
    'Empurre o banco e suba.',
  ], ['Descer demais (sobrecarrega o ombro)', 'Afastar o quadril do banco'], EXPIRA('ao subir')),

  // Pernas
  ex_agachamento: g('squatBar', 'barbell', 'Quadríceps, glúteos e posterior', [
    'Barra apoiada no trapézio, pés na largura dos ombros, pontas levemente para fora.',
    'Inspire, contraia o abdômen e leve o quadril para trás e para baixo.',
    'Desça com joelhos acompanhando a linha dos pés até pelo menos paralelo.',
    'Empurre o chão com o pé inteiro para subir.',
  ], ['Joelhos entrando para dentro', 'Tirar os calcanhares do chão', 'Arredondar a lombar'], EXPIRA('ao subir')),
  ex_agachamento_goblet: g('squatGoblet', 'dumbbell', 'Quadríceps e glúteos', [
    'Segure o halter junto ao peito com as duas mãos.',
    'Pés na largura dos ombros, peito aberto.',
    'Agache entre as pernas mantendo o tronco o mais reto possível.',
    'Suba empurrando o chão.',
  ], ['Deixar o halter afastar do peito', 'Joelhos para dentro'], EXPIRA('ao subir')),
  ex_agachamento_corpo: g('squat', 'none', 'Quadríceps e glúteos', [
    'Pés na largura dos ombros e braços à frente para equilibrar.',
    'Leve o quadril para trás como se fosse sentar numa cadeira.',
    'Desça até as coxas ficarem paralelas ao chão.',
    'Suba contraindo os glúteos.',
  ], ['Calcanhar saindo do chão', 'Tronco caindo muito para frente'], EXPIRA('ao subir')),
  ex_leg_press: g('legPress', 'none', 'Quadríceps e glúteos', [
    'Costas e quadril bem apoiados no encosto.',
    'Pés no meio da plataforma, na largura dos ombros.',
    'Destrave e desça dobrando os joelhos até ~90°.',
    'Empurre sem travar os joelhos no final.',
  ], ['Tirar o quadril do banco na descida', 'Travar os joelhos esticados'], EXPIRA('ao empurrar')),
  ex_afundo: g('lunge', 'dumbbell', 'Quadríceps e glúteos', [
    'Dê um passo largo à frente, tronco ereto.',
    'Desça até o joelho de trás quase tocar o chão.',
    'O joelho da frente fica alinhado com o tornozelo.',
    'Empurre com a perna da frente para subir.',
  ], ['Joelho da frente passar muito do pé', 'Passo curto demais'], EXPIRA('ao subir')),
  ex_extensora: g('legExtension', 'none', 'Quadríceps', [
    'Sente com as costas apoiadas e o joelho alinhado ao eixo da máquina.',
    'Apoio logo acima do tornozelo.',
    'Estenda as pernas até ficarem retas e contraia 1 segundo.',
    'Volte devagar sem deixar o peso bater.',
  ], ['Balançar o corpo', 'Descer rápido demais'], EXPIRA('ao estender')),
  ex_flexora: g('legCurl', 'none', 'Posterior de coxa', [
    'Deite de bruços com o apoio logo acima dos calcanhares.',
    'Segure as alças e mantenha o quadril colado no banco.',
    'Flexione os joelhos trazendo os calcanhares em direção ao glúteo.',
    'Volte controlando até quase esticar.',
  ], ['Levantar o quadril', 'Movimento curto'], EXPIRA('ao flexionar')),
  ex_stiff: g('hinge', 'barbell', 'Posterior de coxa, glúteos e lombar', [
    'Em pé com a barra na frente das coxas, joelhos levemente flexionados.',
    'Leve o quadril para trás mantendo a coluna reta.',
    'Desça a barra rente às pernas até sentir o alongamento do posterior.',
    'Suba levando o quadril para frente e contraindo os glúteos.',
  ], ['Arredondar as costas', 'Dobrar demais os joelhos (vira agachamento)'], EXPIRA('ao subir')),
  ex_elevacao_pelvica: g('hipThrust', 'barbell', 'Glúteos', [
    'Apoie a parte de cima das costas no banco e a barra sobre o quadril.',
    'Pés firmes no chão, joelhos a ~90° no topo.',
    'Empurre o quadril para cima até alinhar tronco e coxas.',
    'Contraia os glúteos 1 segundo e desça controlando.',
  ], ['Hiperestender a lombar no topo', 'Empurrar com a ponta dos pés'], EXPIRA('ao subir o quadril')),
  ex_ponte: g('bridge', 'none', 'Glúteos e posterior', [
    'Deite de barriga para cima, joelhos dobrados e pés no chão.',
    'Braços ao lado do corpo.',
    'Suba o quadril contraindo os glúteos até alinhar com o tronco.',
    'Desça devagar sem encostar totalmente.',
  ], ['Arquear a lombar', 'Pés longe demais do quadril'], EXPIRA('ao subir')),
  ex_panturrilha: g('calf', 'none', 'Panturrilhas', [
    'Em pé, ponta dos pés em um degrau ou anilha.',
    'Suba o máximo nas pontas dos pés.',
    'Segure 1 segundo no topo.',
    'Desça abaixo da linha do degrau para alongar.',
  ], ['Fazer rápido demais', 'Dobrar os joelhos'], EXPIRA('ao subir')),

  // Costas
  ex_puxada: g('pulldown', 'none', 'Dorsais (costas) e bíceps', [
    'Sente com as coxas presas no apoio e pegue a barra mais aberta que os ombros.',
    'Incline levemente o tronco para trás.',
    'Puxe a barra até a parte de cima do peito levando os cotovelos para baixo.',
    'Volte devagar até esticar os braços.',
  ], ['Puxar atrás da nuca', 'Balançar o tronco'], EXPIRA('ao puxar')),
  ex_barra_fixa: g('pullUp', 'none', 'Dorsais, bíceps e core', [
    'Segure a barra com as mãos um pouco mais abertas que os ombros.',
    'Comece com os braços estendidos e escápulas "encaixadas".',
    'Puxe até o queixo passar a barra.',
    'Desça controlando até estender os braços.',
  ], ['Balançar as pernas (kipping)', 'Meia repetição'], EXPIRA('ao subir')),
  ex_remada_curvada: g('bentRow', 'barbell', 'Dorsais, trapézio e romboides', [
    'Incline o tronco à frente (~45°) com coluna reta e joelhos semiflexionados.',
    'Barra com braços estendidos abaixo dos ombros.',
    'Puxe a barra em direção ao umbigo aproximando as escápulas.',
    'Desça controlando.',
  ], ['Arredondar a coluna', 'Levantar o tronco a cada repetição'], EXPIRA('ao puxar')),
  ex_remada_baixa: g('seatedRow', 'none', 'Dorsais e meio das costas', [
    'Sente com os pés na plataforma e joelhos levemente dobrados.',
    'Segure o triângulo com os braços estendidos.',
    'Puxe até o abdômen levando os cotovelos para trás e o peito aberto.',
    'Volte alongando as costas sem curvar a lombar.',
  ], ['Balançar o tronco', 'Encolher os ombros'], EXPIRA('ao puxar')),
  ex_remada_halter: g('bentRow', 'dumbbell', 'Dorsais e meio das costas', [
    'Apoie um joelho e uma mão no banco, costas paralelas ao chão.',
    'Halter na mão livre com o braço estendido.',
    'Puxe o halter até a cintura com o cotovelo junto ao corpo.',
    'Desça até esticar o braço.',
  ], ['Girar o tronco', 'Puxar com o bíceps (cotovelo aberto)'], EXPIRA('ao puxar')),

  // Bíceps
  ex_rosca_direta: g('curl', 'barbell', 'Bíceps', [
    'Em pé, barra na largura dos ombros, palmas para frente.',
    'Cotovelos colados ao corpo.',
    'Suba a barra dobrando só os cotovelos.',
    'Desça devagar até estender os braços.',
  ], ['Balançar o tronco', 'Cotovelos indo para frente'], EXPIRA('ao subir')),
  ex_rosca_martelo: g('curl', 'dumbbell', 'Bíceps e antebraço (braquiorradial)', [
    'Halteres ao lado do corpo com as palmas voltadas uma para a outra.',
    'Cotovelos fixos.',
    'Suba os halteres mantendo a pegada neutra (como um martelo).',
    'Desça controlando.',
  ], ['Girar o punho', 'Usar impulso'], EXPIRA('ao subir')),

  // Ombros
  ex_desenvolvimento: g('shoulderPress', 'dumbbell', 'Deltoides e tríceps', [
    'Sentado com as costas apoiadas, halteres na altura das orelhas.',
    'Cotovelos levemente à frente do corpo.',
    'Empurre os halteres para cima até quase se encontrarem.',
    'Desça até a altura das orelhas.',
  ], ['Arquear a lombar', 'Descer demais atrás da cabeça'], EXPIRA('ao empurrar')),
  ex_elevacao_lateral: g('lateralRaise', 'dumbbell', 'Deltoide lateral', [
    'Em pé, halteres ao lado do corpo e cotovelos levemente dobrados.',
    'Eleve os braços para os lados até a altura dos ombros.',
    'Mantenha os punhos na linha dos cotovelos.',
    'Desça devagar.',
  ], ['Subir acima dos ombros encolhendo o trapézio', 'Usar balanço'], EXPIRA('ao subir')),
  ex_face_pull: g('facePull', 'none', 'Deltoide posterior e manguito rotador', [
    'Cabo na altura do rosto com a corda.',
    'Puxe a corda em direção ao rosto abrindo os cotovelos para os lados e para cima.',
    'Finalize com as mãos ao lado das orelhas.',
    'Volte controlando.',
  ], ['Cotovelos baixos', 'Carga pesada demais'], EXPIRA('ao puxar')),

  // Abdômen
  ex_abdominal: g('crunch', 'none', 'Reto abdominal', [
    'Deite de barriga para cima com joelhos dobrados.',
    'Mãos atrás da cabeça sem puxar o pescoço.',
    'Enrole o tronco tirando as escápulas do chão.',
    'Desça devagar.',
  ], ['Puxar a cabeça com as mãos', 'Subir com impulso'], EXPIRA('ao subir')),
  ex_abd_bicicleta: g('bicycle', 'none', 'Abdômen e oblíquos', [
    'Deitado, mãos atrás da cabeça e pernas elevadas.',
    'Leve um joelho ao peito enquanto estende a outra perna.',
    'Gire o tronco levando o cotovelo oposto em direção ao joelho.',
    'Alterne os lados de forma controlada.',
  ], ['Fazer rápido sem girar o tronco', 'Puxar o pescoço'], 'Solte o ar a cada giro.'),
  ex_elevacao_pernas: g('legRaise', 'none', 'Abdômen inferior', [
    'Deite de barriga para cima com as mãos ao lado do corpo.',
    'Pernas estendidas e juntas.',
    'Eleve as pernas até ~90° mantendo a lombar no chão.',
    'Desça devagar sem encostar os pés.',
  ], ['Tirar a lombar do chão', 'Descer rápido'], EXPIRA('ao subir as pernas')),
  ex_prancha: g('plank', 'none', 'Core (abdômen, lombar e ombros)', [
    'Apoie antebraços e pontas dos pés no chão.',
    'Cotovelos abaixo dos ombros.',
    'Corpo em linha reta: contraia abdômen e glúteos.',
    'Segure o tempo indicado respirando normalmente.',
  ], ['Quadril alto ou caído', 'Prender a respiração'], 'Respire devagar e contínuo durante toda a prancha.'),

  // Cardio
  ex_esteira: g('run', 'none', 'Condicionamento cardiovascular', [
    'Comece caminhando 3–5 minutos para aquecer.',
    'Aumente a velocidade até um ritmo em que ainda consiga falar frases curtas.',
    'Braços soltos acompanhando as passadas.',
    'Desacelere nos últimos minutos.',
  ], ['Segurar no corrimão o tempo todo', 'Passadas longas demais'], 'Respire em ritmo constante, pelo nariz e boca.'),
  ex_bike: g('bike', 'none', 'Condicionamento cardiovascular e pernas', [
    'Ajuste o banco: joelho levemente dobrado com o pedal embaixo.',
    'Tronco estável e mãos leves no guidão.',
    'Pedale em cadência constante (70–90 rpm).',
    'Ajuste a carga para manter o esforço moderado.',
  ], ['Banco baixo demais', 'Balançar o quadril'], 'Respire em ritmo constante.'),
  ex_polichinelo: g('jumpingJack', 'none', 'Condicionamento e coordenação', [
    'Em pé, pés juntos e braços ao lado do corpo.',
    'Salte abrindo as pernas e levando os braços acima da cabeça.',
    'Salte de volta à posição inicial.',
    'Mantenha um ritmo contínuo.',
  ], ['Aterrissar com o calcanhar', 'Braços sem completar o movimento'], 'Respire no ritmo dos saltos.'),
  ex_burpee: g('burpee', 'none', 'Corpo inteiro e condicionamento', [
    'Agache e apoie as mãos no chão.',
    'Jogue as pernas para trás em prancha (opcional: faça uma flexão).',
    'Volte os pés para perto das mãos.',
    'Salte estendendo o corpo com os braços para cima.',
  ], ['Lombar caindo na prancha', 'Aterrissar com os joelhos travados'], 'Solte o ar no salto.'),
};

/** Guia genérico para exercícios cadastrados pelo usuário (animação pelo grupo muscular). */
function fallback(muscle: MuscleGroup): ExerciseGuide {
  return {
    motion: MUSCLE_FALLBACK[muscle],
    load: 'none',
    target: MUSCLE_LABEL[muscle],
    steps: [
      'Ajuste o equipamento e posicione o corpo com a coluna neutra.',
      'Execute o movimento de forma controlada, na amplitude completa.',
      'Contraia o músculo alvo no ponto de maior esforço.',
      'Volte devagar à posição inicial.',
    ],
    mistakes: ['Usar impulso ou balanço', 'Carga maior do que consegue controlar'],
    breath: 'Solte o ar na fase de esforço e puxe na volta.',
  };
}

export function guideFor(ex: Pick<Exercise, 'id' | 'muscle'>): ExerciseGuide {
  return EXERCISE_GUIDE[ex.id] ?? fallback(ex.muscle);
}
