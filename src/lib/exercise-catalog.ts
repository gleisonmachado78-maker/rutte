import type { Exercise, MuscleGroup, Restriction, TrainingPlace } from '@/types';

/**
 * Catálogo amplo de exercícios — aparelhos e variações encontrados em academias de bairro e redes
 * (Smart Fit, Bluefit, Selfit, Panobianco…), com pesos livres, cabos, máquinas e peso do corpo.
 * Onde: m = só academia (máquina/cabo), l = pesos livres (academia ou halteres em casa), c = qualquer lugar.
 */
type Where = 'm' | 'l' | 'c';
export interface CatalogItem extends Exercise {
  where: Where;
  compound?: boolean;
  stress?: Restriction[];
  /** outros nomes usados nas academias (ajuda a busca) */
  aka?: string;
}

const e = (id: string, name: string, muscle: MuscleGroup, where: Where, extra: Partial<Pick<CatalogItem, 'compound' | 'stress' | 'aka'>> = {}): CatalogItem => ({
  id: `cx_${id}`,
  name,
  muscle,
  where,
  ...extra,
});
const X = { compound: true };

export const EXERCISE_CATALOG: CatalogItem[] = [
  /* ------------------------------- Peito ------------------------------- */
  e('supino_declinado', 'Supino declinado com barra', 'peito', 'm', X),
  e('supino_inclinado_barra', 'Supino inclinado com barra', 'peito', 'm', { ...X, stress: ['ombro'] }),
  e('supino_declinado_halter', 'Supino declinado com halteres', 'peito', 'l', X),
  e('supino_smith', 'Supino reto no Smith', 'peito', 'm', X),
  e('supino_inclinado_smith', 'Supino inclinado no Smith', 'peito', 'm', X),
  e('supino_maquina', 'Supino reto na máquina (chest press)', 'peito', 'm', { ...X, aka: 'chest press supino sentado articulado' }),
  e('supino_inclinado_maquina', 'Supino inclinado na máquina', 'peito', 'm', { ...X, aka: 'articulado' }),
  e('supino_articulado', 'Supino articulado (Hammer)', 'peito', 'm', { ...X, aka: 'hammer strength' }),
  e('crucifixo_reto', 'Crucifixo reto com halteres', 'peito', 'l'),
  e('crucifixo_inclinado', 'Crucifixo inclinado com halteres', 'peito', 'l'),
  e('crucifixo_maquina', 'Voador / Peck deck (máquina)', 'peito', 'm', { aka: 'fly peckdeck voador' }),
  e('crossover_alto', 'Crossover polia alta', 'peito', 'm', { aka: 'cross over cabo' }),
  e('crossover_baixo', 'Crossover polia baixa', 'peito', 'm', { aka: 'cross over cabo' }),
  e('crossover_medio', 'Crossover polia média', 'peito', 'm'),
  e('pullover_halter', 'Pullover com halter', 'peito', 'l'),
  e('flexao_inclinada', 'Flexão inclinada (mãos no banco)', 'peito', 'c', X),
  e('flexao_declinada', 'Flexão declinada (pés no banco)', 'peito', 'c', X),
  e('flexao_joelhos', 'Flexão com joelhos no chão', 'peito', 'c', X),
  e('flexao_diamante', 'Flexão diamante', 'triceps', 'c', X),
  e('paralelas_peito', 'Mergulho nas paralelas (peito)', 'peito', 'm', { ...X, stress: ['ombro'], aka: 'dips' }),
  e('svend_press', 'Svend press (anilha)', 'peito', 'l'),

  /* ------------------------------- Costas ------------------------------- */
  e('puxada_aberta', 'Puxada aberta pela frente', 'costas', 'm', { ...X, aka: 'pulldown pulley alto' }),
  e('puxada_triangulo', 'Puxada com triângulo', 'costas', 'm', { ...X, aka: 'pulldown pegada fechada' }),
  e('puxada_supinada', 'Puxada supinada', 'costas', 'm', X),
  e('puxada_neutra', 'Puxada pegada neutra', 'costas', 'm', X),
  e('puxada_unilateral', 'Puxada unilateral no cabo', 'costas', 'm'),
  e('puxada_articulada', 'Puxada articulada (máquina)', 'costas', 'm', { ...X, aka: 'hammer' }),
  e('pulldown_braco_estendido', 'Pulldown com braços estendidos', 'costas', 'm', { aka: 'pullover no cabo straight arm' }),
  e('remada_cavalinho', 'Remada cavalinho (T-bar)', 'costas', 'm', { ...X, stress: ['lombar'], aka: 'tbar' }),
  e('remada_maquina', 'Remada sentada na máquina', 'costas', 'm', { ...X, aka: 'remada articulada' }),
  e('remada_articulada', 'Remada articulada (Hammer)', 'costas', 'm', X),
  e('remada_baixa_triangulo', 'Remada baixa com triângulo', 'costas', 'm', X),
  e('remada_baixa_aberta', 'Remada baixa pegada aberta', 'costas', 'm', X),
  e('remada_unilateral_cabo', 'Remada unilateral no cabo', 'costas', 'm'),
  e('remada_curvada_supinada', 'Remada curvada supinada', 'costas', 'l', { ...X, stress: ['lombar'] }),
  e('remada_smith', 'Remada curvada no Smith', 'costas', 'm', { ...X, stress: ['lombar'] }),
  e('remada_serrote', 'Remada serrote', 'costas', 'l', { ...X, aka: 'remada unilateral halter' }),
  e('remada_pendlay', 'Remada Pendlay', 'costas', 'l', { ...X, stress: ['lombar'] }),
  e('remada_inclinada_halter', 'Remada apoiada no banco inclinado', 'costas', 'l', X),
  e('barra_fixa_pronada', 'Barra fixa pronada', 'costas', 'c', X),
  e('barra_fixa_supinada', 'Barra fixa supinada (chin-up)', 'costas', 'c', X),
  e('barra_graviton', 'Barra no graviton (assistida)', 'costas', 'm', { ...X, aka: 'gravitron' }),
  e('remada_australiana', 'Remada australiana (invertida)', 'costas', 'c', X),
  e('levantamento_terra', 'Levantamento terra', 'costas', 'l', { ...X, stress: ['lombar'], aka: 'deadlift' }),
  e('hiperextensao', 'Hiperextensão lombar (banco romano)', 'costas', 'm', { aka: 'extensão lombar' }),
  e('good_morning', 'Bom dia (good morning)', 'costas', 'l', { stress: ['lombar'] }),
  e('encolhimento_barra', 'Encolhimento com barra', 'costas', 'l', { aka: 'trapézio shrug' }),
  e('encolhimento_halter', 'Encolhimento com halteres', 'costas', 'l', { aka: 'trapézio shrug' }),
  e('superman', 'Superman (lombar no solo)', 'costas', 'c'),

  /* ------------------------------- Ombros ------------------------------- */
  e('desenvolvimento_barra', 'Desenvolvimento com barra', 'ombros', 'l', { ...X, stress: ['ombro'], aka: 'militar' }),
  e('desenvolvimento_maquina', 'Desenvolvimento na máquina', 'ombros', 'm', { ...X, aka: 'shoulder press' }),
  e('desenvolvimento_smith', 'Desenvolvimento no Smith', 'ombros', 'm', X),
  e('desenvolvimento_arnold', 'Desenvolvimento Arnold', 'ombros', 'l', X),
  e('elevacao_lateral_cabo', 'Elevação lateral no cabo', 'ombros', 'm'),
  e('elevacao_lateral_maquina', 'Elevação lateral na máquina', 'ombros', 'm'),
  e('elevacao_lateral_sentado', 'Elevação lateral sentado', 'ombros', 'l'),
  e('elevacao_frontal', 'Elevação frontal com halteres', 'ombros', 'l'),
  e('elevacao_frontal_anilha', 'Elevação frontal com anilha', 'ombros', 'l'),
  e('elevacao_frontal_cabo', 'Elevação frontal no cabo', 'ombros', 'm'),
  e('crucifixo_inverso', 'Crucifixo inverso com halteres', 'ombros', 'l', { aka: 'posterior deltoide' }),
  e('crucifixo_inverso_maquina', 'Crucifixo inverso na máquina (voador invertido)', 'ombros', 'm', { aka: 'peck deck invertido posterior' }),
  e('remada_alta', 'Remada alta', 'ombros', 'l', { stress: ['ombro'] }),
  e('remada_alta_cabo', 'Remada alta no cabo', 'ombros', 'm', { stress: ['ombro'] }),
  e('pike_pushup', 'Flexão pike (ombros)', 'ombros', 'c', X),

  /* ------------------------------- Bíceps ------------------------------- */
  e('rosca_barra_w', 'Rosca direta com barra W', 'biceps', 'l'),
  e('rosca_alternada', 'Rosca alternada com halteres', 'biceps', 'l'),
  e('rosca_scott', 'Rosca Scott', 'biceps', 'm'),
  e('rosca_scott_maquina', 'Rosca Scott na máquina', 'biceps', 'm'),
  e('rosca_concentrada', 'Rosca concentrada', 'biceps', 'l'),
  e('rosca_cabo', 'Rosca no cabo (polia baixa)', 'biceps', 'm'),
  e('rosca_inversa', 'Rosca inversa', 'biceps', 'l', { aka: 'antebraço' }),
  e('rosca_inclinada', 'Rosca no banco inclinado', 'biceps', 'l'),
  e('rosca_spider', 'Rosca spider', 'biceps', 'l'),
  e('rosca_21', 'Rosca 21', 'biceps', 'l'),
  e('rosca_martelo_cabo', 'Rosca martelo na corda', 'biceps', 'm'),
  e('rosca_punho', 'Rosca de punho (antebraço)', 'biceps', 'l', { aka: 'antebraço flexão de punho' }),

  /* ------------------------------- Tríceps ------------------------------- */
  e('triceps_corda', 'Tríceps na corda', 'triceps', 'm', { aka: 'pulley corda' }),
  e('triceps_barra_v', 'Tríceps pulley barra V', 'triceps', 'm'),
  e('triceps_inverso', 'Tríceps pulley pegada inversa', 'triceps', 'm'),
  e('triceps_testa', 'Tríceps testa', 'triceps', 'l', { aka: 'skull crusher' }),
  e('triceps_coice', 'Tríceps coice com halter', 'triceps', 'l', { aka: 'kickback' }),
  e('triceps_unilateral_cabo', 'Tríceps unilateral no cabo', 'triceps', 'm'),
  e('triceps_frances_cabo', 'Tríceps francês na corda (acima da cabeça)', 'triceps', 'm'),
  e('triceps_maquina', 'Tríceps na máquina (paralela sentado)', 'triceps', 'm'),
  e('supino_fechado', 'Supino fechado', 'triceps', 'l', X),
  e('paralelas_triceps', 'Paralelas (tríceps)', 'triceps', 'm', { ...X, stress: ['ombro'], aka: 'dips mergulho' }),

  /* ------------------------------- Pernas (quadríceps/posterior) ------------------------------- */
  e('agachamento_smith', 'Agachamento no Smith', 'pernas', 'm', { ...X, stress: ['joelho'] }),
  e('agachamento_hack', 'Agachamento hack (máquina)', 'pernas', 'm', { ...X, stress: ['joelho'], aka: 'hack machine' }),
  e('agachamento_frontal', 'Agachamento frontal', 'pernas', 'l', { ...X, stress: ['joelho', 'lombar'] }),
  e('agachamento_sumo', 'Agachamento sumô', 'pernas', 'l', { ...X, aka: 'sumo' }),
  e('agachamento_bulgaro', 'Agachamento búlgaro', 'pernas', 'l', { ...X, stress: ['joelho'], aka: 'afundo búlgaro' }),
  e('agachamento_sissy', 'Agachamento sissy', 'pernas', 'c', { stress: ['joelho'] }),
  e('agachamento_pendulo', 'Agachamento pêndulo', 'pernas', 'm', { ...X, stress: ['joelho'] }),
  e('agachamento_belt', 'Agachamento no belt squat', 'pernas', 'm', X),
  e('leg_press_horizontal', 'Leg press horizontal', 'pernas', 'm', { ...X, stress: ['joelho'] }),
  e('leg_press_unilateral', 'Leg press unilateral', 'pernas', 'm', { ...X, stress: ['joelho'] }),
  e('extensora_unilateral', 'Cadeira extensora unilateral', 'pernas', 'm', { stress: ['joelho'] }),
  e('flexora_sentada', 'Cadeira flexora (sentada)', 'pernas', 'm'),
  e('flexora_em_pe', 'Flexora em pé (unilateral)', 'pernas', 'm'),
  e('afundo_caminhando', 'Afundo caminhando', 'pernas', 'l', { ...X, stress: ['joelho'], aka: 'passada' }),
  e('afundo_smith', 'Afundo no Smith', 'pernas', 'm', { ...X, stress: ['joelho'] }),
  e('passada_reversa', 'Passada reversa (recuo)', 'pernas', 'c', { ...X, stress: ['joelho'] }),
  e('subida_banco', 'Subida no banco (step-up)', 'pernas', 'l', X),
  e('adutora', 'Cadeira adutora', 'pernas', 'm', { aka: 'adução parte interna' }),
  e('stiff_halter', 'Stiff com halteres', 'pernas', 'l', { ...X, stress: ['lombar'] }),
  e('levantamento_romeno', 'Levantamento terra romeno', 'pernas', 'l', { ...X, stress: ['lombar'], aka: 'rdl' }),
  e('mesa_flexora_unilateral', 'Mesa flexora unilateral', 'pernas', 'm'),
  e('agachamento_isometrico', 'Agachamento isométrico na parede (seg)', 'pernas', 'c'),

  /* ------------------------------- Glúteos ------------------------------- */
  e('elevacao_pelvica_maquina', 'Elevação pélvica na máquina', 'gluteos', 'm', { ...X, aka: 'hip thrust' }),
  e('elevacao_pelvica_smith', 'Elevação pélvica no Smith', 'gluteos', 'm', X),
  e('abdutora', 'Cadeira abdutora', 'gluteos', 'm', { aka: 'abdução' }),
  e('gluteo_cabo', 'Glúteo coice no cabo', 'gluteos', 'm', { aka: 'kickback quatro apoios cabo' }),
  e('gluteo_maquina', 'Glúteo na máquina (coice)', 'gluteos', 'm', { aka: 'glute machine' }),
  e('gluteo_quatro_apoios', 'Glúteo quatro apoios (caneleira)', 'gluteos', 'c', { aka: 'coice caneleira' }),
  e('abducao_cabo', 'Abdução de quadril no cabo', 'gluteos', 'm'),
  e('abducao_elastico', 'Abdução com mini band', 'gluteos', 'c', { aka: 'elástico ostra' }),
  e('ponte_unilateral', 'Ponte de glúteo unilateral', 'gluteos', 'c'),
  e('kettlebell_swing', 'Kettlebell swing', 'gluteos', 'l', { ...X, stress: ['lombar'] }),
  e('pull_through', 'Pull through no cabo', 'gluteos', 'm'),
  e('frog_pump', 'Frog pump', 'gluteos', 'c'),

  /* ------------------------------- Panturrilha ------------------------------- */
  e('panturrilha_sentado', 'Panturrilha sentado (gêmeos sentado)', 'panturrilha', 'm', { aka: 'sóleo' }),
  e('panturrilha_leg_press', 'Panturrilha no leg press', 'panturrilha', 'm'),
  e('panturrilha_smith', 'Panturrilha no Smith', 'panturrilha', 'm'),
  e('panturrilha_unilateral', 'Panturrilha unilateral com halter', 'panturrilha', 'l'),
  e('panturrilha_maquina', 'Panturrilha em pé na máquina', 'panturrilha', 'm', { aka: 'gêmeos' }),
  e('panturrilha_burrinho', 'Panturrilha burrinho', 'panturrilha', 'm', { aka: 'donkey' }),

  /* ------------------------------- Abdômen / core ------------------------------- */
  e('abdominal_infra', 'Abdominal infra', 'abdomen', 'c', { aka: 'elevação de quadril' }),
  e('abdominal_obliquo', 'Abdominal oblíquo', 'abdomen', 'c'),
  e('abdominal_remador', 'Abdominal remador', 'abdomen', 'c'),
  e('abdominal_maquina', 'Abdominal na máquina', 'abdomen', 'm'),
  e('abdominal_cabo', 'Abdominal na polia (crunch no cabo)', 'abdomen', 'm', { aka: 'ajoelhado corda' }),
  e('abdominal_declinado', 'Abdominal no banco declinado', 'abdomen', 'm'),
  e('elevacao_pernas_barra', 'Elevação de pernas na barra', 'abdomen', 'c'),
  e('elevacao_pernas_paralela', 'Elevação de joelhos na paralela (capitão)', 'abdomen', 'm', { aka: 'cadeira do capitão' }),
  e('prancha_lateral', 'Prancha lateral (seg)', 'abdomen', 'c'),
  e('prancha_dinamica', 'Prancha com toque no ombro', 'abdomen', 'c'),
  e('russian_twist', 'Rotação russa (russian twist)', 'abdomen', 'c'),
  e('canivete', 'Abdominal canivete (V-up)', 'abdomen', 'c'),
  e('roda_abdominal', 'Roda abdominal', 'abdomen', 'l', { stress: ['lombar'], aka: 'rolinho ab wheel' }),
  e('pallof', 'Pallof press (anti-rotação)', 'abdomen', 'm'),
  e('dead_bug', 'Dead bug', 'abdomen', 'c'),
  e('mountain_climber', 'Escalador (mountain climber)', 'abdomen', 'c'),
  e('hollow', 'Hollow hold (seg)', 'abdomen', 'c'),
  e('lenhador_cabo', 'Lenhador no cabo (woodchopper)', 'abdomen', 'm'),

  /* ------------------------------- Cardio / funcional ------------------------------- */
  e('escada', 'Escada / simulador de escada (min)', 'cardio', 'm', { aka: 'stairmaster' }),
  e('eliptico', 'Elíptico / transport (min)', 'cardio', 'm', { aka: 'transport' }),
  e('bike_spinning', 'Bike de spinning (min)', 'cardio', 'm'),
  e('bike_horizontal', 'Bicicleta horizontal (min)', 'cardio', 'm'),
  e('remo', 'Remo ergômetro (min)', 'cardio', 'm', { aka: 'remoergômetro' }),
  e('caminhada_inclinada', 'Caminhada inclinada na esteira (min)', 'cardio', 'm'),
  e('corrida', 'Corrida ao ar livre (min)', 'cardio', 'c'),
  e('caminhada', 'Caminhada (min)', 'cardio', 'c'),
  e('pular_corda', 'Pular corda (min)', 'cardio', 'c'),
  e('air_bike', 'Air bike (min)', 'cardio', 'm', { aka: 'assault bike' }),
  e('battle_rope', 'Corda naval (battle rope)', 'cardio', 'm'),
  e('box_jump', 'Salto na caixa (box jump)', 'cardio', 'm', { stress: ['joelho'] }),
  e('thruster', 'Thruster', 'cardio', 'l', X),
  e('wall_ball', 'Wall ball', 'cardio', 'm', X),
  e('agachamento_salto', 'Agachamento com salto', 'cardio', 'c', { stress: ['joelho'] }),
  e('farmer_walk', 'Caminhada do fazendeiro', 'cardio', 'l', { aka: 'farmer carry' }),
  e('sled', 'Empurrar trenó (sled)', 'cardio', 'm'),
];

/** Exercícios do catálogo que ainda não estão na lista da pessoa (os dela vêm primeiro). */
export function mergeCatalog(mine: Exercise[], ...more: Exercise[][]): Exercise[] {
  const have = new Set(mine.map((x) => x.id));
  const out = [...mine];
  for (const list of [...more, EXERCISE_CATALOG]) {
    for (const x of list) {
      if (have.has(x.id)) continue;
      have.add(x.id);
      out.push(x);
    }
  }
  return out;
}

export const PLACES_BY_WHERE: Record<Where, TrainingPlace[]> = {
  m: ['academia'],
  l: ['academia', 'halteres'],
  c: ['academia', 'halteres', 'corpo'],
};

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
/** Busca por nome ou apelido, sem acento. */
export function matchExercise(x: Exercise, q: string) {
  if (!q) return true;
  const hay = norm(`${x.name} ${(x as CatalogItem).aka ?? ''}`);
  return norm(q).split(/\s+/).every((w) => hay.includes(w));
}
