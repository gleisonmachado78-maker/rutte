import type { Load } from './exercise-guide';
import type { MotionKey } from './exercise-motion';

/** Movimento (animação do personagem) e carga de cada exercício do catálogo — chave sem o prefixo "cx_". */
export const CATALOG_MOTION: Record<string, [MotionKey, Load]> = {
  // peito
  supino_declinado: ['benchPress', 'barbell'], supino_inclinado_barra: ['inclinePress', 'barbell'], supino_declinado_halter: ['benchPress', 'dumbbell'],
  supino_smith: ['benchPress', 'barbell'], supino_inclinado_smith: ['inclinePress', 'barbell'], supino_maquina: ['benchPress', 'none'],
  supino_inclinado_maquina: ['inclinePress', 'none'], supino_articulado: ['benchPress', 'none'], crucifixo_reto: ['fly', 'dumbbell'],
  crucifixo_inclinado: ['fly', 'dumbbell'], crucifixo_maquina: ['fly', 'none'], crossover_alto: ['fly', 'none'], crossover_baixo: ['fly', 'none'],
  crossover_medio: ['fly', 'none'], pullover_halter: ['overheadExt', 'dumbbell'], flexao_inclinada: ['pushUp', 'none'], flexao_declinada: ['pushUp', 'none'],
  flexao_joelhos: ['pushUp', 'none'], flexao_diamante: ['pushUp', 'none'], paralelas_peito: ['dip', 'none'], svend_press: ['benchPress', 'none'],
  // costas
  puxada_aberta: ['pulldown', 'none'], puxada_triangulo: ['pulldown', 'none'], puxada_supinada: ['pulldown', 'none'], puxada_neutra: ['pulldown', 'none'],
  puxada_unilateral: ['pulldown', 'none'], puxada_articulada: ['pulldown', 'none'], pulldown_braco_estendido: ['pulldown', 'none'],
  remada_cavalinho: ['bentRow', 'barbell'], remada_maquina: ['seatedRow', 'none'], remada_articulada: ['seatedRow', 'none'],
  remada_baixa_triangulo: ['seatedRow', 'none'], remada_baixa_aberta: ['seatedRow', 'none'], remada_unilateral_cabo: ['seatedRow', 'none'],
  remada_curvada_supinada: ['bentRow', 'barbell'], remada_smith: ['bentRow', 'barbell'], remada_serrote: ['bentRow', 'dumbbell'],
  remada_pendlay: ['bentRow', 'barbell'], remada_inclinada_halter: ['bentRow', 'dumbbell'], barra_fixa_pronada: ['pullUp', 'none'],
  barra_fixa_supinada: ['pullUp', 'none'], barra_graviton: ['pullUp', 'none'], remada_australiana: ['seatedRow', 'none'],
  levantamento_terra: ['hinge', 'barbell'], hiperextensao: ['hinge', 'none'], good_morning: ['hinge', 'barbell'],
  encolhimento_barra: ['calf', 'barbell'], encolhimento_halter: ['calf', 'dumbbell'], superman: ['plank', 'none'],
  // ombros
  desenvolvimento_barra: ['shoulderPress', 'barbell'], desenvolvimento_maquina: ['shoulderPress', 'none'], desenvolvimento_smith: ['shoulderPress', 'barbell'],
  desenvolvimento_arnold: ['shoulderPress', 'dumbbell'], elevacao_lateral_cabo: ['lateralRaise', 'none'], elevacao_lateral_maquina: ['lateralRaise', 'none'],
  elevacao_lateral_sentado: ['lateralRaise', 'dumbbell'], elevacao_frontal: ['lateralRaise', 'dumbbell'], elevacao_frontal_anilha: ['lateralRaise', 'none'],
  elevacao_frontal_cabo: ['lateralRaise', 'none'], crucifixo_inverso: ['facePull', 'dumbbell'], crucifixo_inverso_maquina: ['facePull', 'none'],
  remada_alta: ['shoulderPress', 'barbell'], remada_alta_cabo: ['facePull', 'none'], pike_pushup: ['pushUp', 'none'],
  // bíceps
  rosca_barra_w: ['curl', 'barbell'], rosca_alternada: ['curl', 'dumbbell'], rosca_scott: ['curl', 'barbell'], rosca_scott_maquina: ['curl', 'none'],
  rosca_concentrada: ['curl', 'dumbbell'], rosca_cabo: ['curl', 'none'], rosca_inversa: ['curl', 'barbell'], rosca_inclinada: ['curl', 'dumbbell'],
  rosca_spider: ['curl', 'dumbbell'], rosca_21: ['curl', 'barbell'], rosca_martelo_cabo: ['curl', 'none'], rosca_punho: ['curl', 'barbell'],
  // tríceps
  triceps_corda: ['pushdown', 'none'], triceps_barra_v: ['pushdown', 'none'], triceps_inverso: ['pushdown', 'none'], triceps_testa: ['overheadExt', 'barbell'],
  triceps_coice: ['pushdown', 'dumbbell'], triceps_unilateral_cabo: ['pushdown', 'none'], triceps_frances_cabo: ['overheadExt', 'none'],
  triceps_maquina: ['dip', 'none'], supino_fechado: ['benchPress', 'barbell'], paralelas_triceps: ['dip', 'none'],
  // pernas
  agachamento_smith: ['squatBar', 'barbell'], agachamento_hack: ['squat', 'none'], agachamento_frontal: ['squatBar', 'barbell'],
  agachamento_sumo: ['squatGoblet', 'dumbbell'], agachamento_bulgaro: ['lunge', 'dumbbell'], agachamento_sissy: ['squat', 'none'],
  agachamento_pendulo: ['squat', 'none'], agachamento_belt: ['squat', 'none'], leg_press_horizontal: ['legPress', 'none'],
  leg_press_unilateral: ['legPress', 'none'], extensora_unilateral: ['legExtension', 'none'], flexora_sentada: ['legCurl', 'none'],
  flexora_em_pe: ['legCurl', 'none'], afundo_caminhando: ['lunge', 'dumbbell'], afundo_smith: ['lunge', 'barbell'], passada_reversa: ['lunge', 'none'],
  subida_banco: ['lunge', 'dumbbell'], adutora: ['legExtension', 'none'], stiff_halter: ['hinge', 'dumbbell'], levantamento_romeno: ['hinge', 'barbell'],
  mesa_flexora_unilateral: ['legCurl', 'none'], agachamento_isometrico: ['squat', 'none'],
  // glúteos
  elevacao_pelvica_maquina: ['hipThrust', 'none'], elevacao_pelvica_smith: ['hipThrust', 'barbell'], abdutora: ['legExtension', 'none'],
  gluteo_cabo: ['bridge', 'none'], gluteo_maquina: ['bridge', 'none'], gluteo_quatro_apoios: ['bridge', 'none'], abducao_cabo: ['bridge', 'none'],
  abducao_elastico: ['bridge', 'none'], ponte_unilateral: ['bridge', 'none'], kettlebell_swing: ['hinge', 'dumbbell'], pull_through: ['hinge', 'none'],
  frog_pump: ['bridge', 'none'],
  // panturrilha
  panturrilha_sentado: ['calf', 'none'], panturrilha_leg_press: ['calf', 'none'], panturrilha_smith: ['calf', 'barbell'],
  panturrilha_unilateral: ['calf', 'dumbbell'], panturrilha_maquina: ['calf', 'none'], panturrilha_burrinho: ['calf', 'none'],
  // abdômen
  abdominal_infra: ['legRaise', 'none'], abdominal_obliquo: ['bicycle', 'none'], abdominal_remador: ['crunch', 'none'], abdominal_maquina: ['crunch', 'none'],
  abdominal_cabo: ['crunch', 'none'], abdominal_declinado: ['crunch', 'none'], elevacao_pernas_barra: ['legRaise', 'none'],
  elevacao_pernas_paralela: ['legRaise', 'none'], prancha_lateral: ['plank', 'none'], prancha_dinamica: ['plank', 'none'], russian_twist: ['bicycle', 'none'],
  canivete: ['crunch', 'none'], roda_abdominal: ['plank', 'none'], pallof: ['plank', 'none'], dead_bug: ['bicycle', 'none'], mountain_climber: ['plank', 'none'],
  hollow: ['plank', 'none'], lenhador_cabo: ['crunch', 'none'],
  // cardio
  escada: ['run', 'none'], eliptico: ['run', 'none'], bike_spinning: ['bike', 'none'], bike_horizontal: ['bike', 'none'], remo: ['seatedRow', 'none'],
  caminhada_inclinada: ['run', 'none'], corrida: ['run', 'none'], caminhada: ['run', 'none'], pular_corda: ['jumpingJack', 'none'], air_bike: ['bike', 'none'],
  battle_rope: ['jumpingJack', 'none'], box_jump: ['squat', 'none'], thruster: ['squatGoblet', 'dumbbell'], wall_ball: ['squatGoblet', 'none'],
  agachamento_salto: ['squat', 'none'], farmer_walk: ['run', 'dumbbell'], sled: ['run', 'none'],
};

/** Para exercícios cadastrados pela pessoa: adivinha o movimento pelo nome. */
const GUESS: [RegExp, MotionKey, Load][] = [
  [/supino.*inclin|inclin.*supino/, 'inclinePress', 'barbell'],
  [/supino|chest press/, 'benchPress', 'barbell'],
  [/crucifixo|voador|peck|cross|fly/, 'fly', 'none'],
  [/barra fixa|chin|graviton|gravitron/, 'pullUp', 'none'],
  [/puxada|pulldown|pulley alto/, 'pulldown', 'none'],
  [/serrote|cavalinho|remada curvada|remada unilateral/, 'bentRow', 'dumbbell'],
  [/remada|remo/, 'seatedRow', 'none'],
  [/rosca|b[ií]ceps/, 'curl', 'dumbbell'],
  [/franc[eê]s|testa/, 'overheadExt', 'dumbbell'],
  [/tr[ií]ceps|pulley|coice/, 'pushdown', 'none'],
  [/paralela|mergulho|dips/, 'dip', 'none'],
  [/desenvolvimento|militar|shoulder/, 'shoulderPress', 'dumbbell'],
  [/lateral|frontal/, 'lateralRaise', 'dumbbell'],
  [/face pull|posterior|inverso/, 'facePull', 'none'],
  [/extensora/, 'legExtension', 'none'],
  [/flexora/, 'legCurl', 'none'],
  [/leg ?press/, 'legPress', 'none'],
  [/afundo|passada|b[uú]lgaro|avan[cç]o|step/, 'lunge', 'dumbbell'],
  [/agachamento|hack|squat/, 'squat', 'none'],
  [/stiff|terra|deadlift|good morning|hiperextens/, 'hinge', 'barbell'],
  [/p[eé]lvica|hip thrust/, 'hipThrust', 'barbell'],
  [/ponte|glute|gl[uú]teo|abdu/, 'bridge', 'none'],
  [/panturrilha|g[eê]meos/, 'calf', 'none'],
  [/prancha|plank/, 'plank', 'none'],
  [/infra|eleva[cç][aã]o de pernas/, 'legRaise', 'none'],
  [/abdominal|crunch/, 'crunch', 'none'],
  [/flex[aã]o|push ?up/, 'pushUp', 'none'],
  [/bike|bicicleta|spinning/, 'bike', 'none'],
  [/esteira|corrida|caminhada|el[ií]ptico|escada/, 'run', 'none'],
  [/polichinelo|corda/, 'jumpingJack', 'none'],
  [/burpee/, 'burpee', 'none'],
];

export function guessMotion(name: string): [MotionKey, Load] | undefined {
  const n = name.toLowerCase();
  const hit = GUESS.find(([re]) => re.test(n));
  return hit ? [hit[1], hit[2]] : undefined;
}
