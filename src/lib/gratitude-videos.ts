import type { LifeVideo } from './videos';

export type GratitudeGroup = 'meditacao' | 'gratidao' | 'oracao';

export const GRATITUDE_VIDEO_GROUPS: { id: GratitudeGroup; label: string }[] = [
  { id: 'meditacao', label: 'Meditação guiada' },
  { id: 'gratidao', label: 'Gratidão' },
  { id: 'oracao', label: 'Oração' },
];

export interface GratitudeVideo extends LifeVideo {
  group: GratitudeGroup;
}

/** Vídeos em português — IDs verificados via oEmbed do YouTube em 01/10/2026. */
export const GRATITUDE_VIDEOS: GratitudeVideo[] = [
  // Meditação guiada
  { group: 'meditacao', area: 'emocional', youtubeId: 'RylLBe8yAwc', title: 'MEDITAÇÃO GUIADA 5 MINUTOS | RÁPIDO E EFICAZ, BOM DEMAIS', channel: 'Raissa Zoccal', style: 'guiada', meta: '6 min · 3 mi views', desc: 'Uma pausa guiada de 5 minutos para acalmar a mente em qualquer hora do dia.' },
  { group: 'meditacao', area: 'emocional', youtubeId: '32UM11dSves', title: 'MEDITAÇÃO PARA INICIANTES | Aprenda a meditar', channel: 'Camila Zen', style: 'guiada', meta: '18 min · 1,7 mi views', desc: 'Aprenda o básico da meditação com uma prática guiada feita para quem está começando.' },
  { group: 'meditacao', area: 'emocional', youtubeId: 'pv-aymg97JM', title: 'MEDITAÇÃO CALMA para ALIVIAR Preocupações, Medo e Ansiedade', channel: 'Raissa Zoccal', style: 'guiada', meta: '7 min · 1,1 mi views', desc: 'Meditação curta e tranquila para aliviar a ansiedade e soltar as preocupações.' },
  { group: 'meditacao', area: 'emocional', youtubeId: 'r_oozyhRYQU', title: 'Meditação Zen-Budista | Monja Coen', channel: 'NAMU', style: 'guiada', meta: '8 min · 1 mi views', desc: 'A Monja Coen ensina a postura e a respiração do zazen, a meditação zen.' },
  { group: 'meditacao', area: 'emocional', youtubeId: 'oOkqYAP1-qQ', title: 'MEDITAÇÃO PARA DORMIR: SONO PROFUNDO EM POUCOS MINUTOS', channel: 'Meditar para Despertar', style: 'guiada', meta: '1h05 · 6,8 mi views', desc: 'Relaxamento guiado para desacelerar o corpo e pegar no sono profundo.' },
  { group: "meditacao", area: "emocional", youtubeId: "r5OXSHC8wqo", title: "Prática de Mindfulness: Escaneamento Corporal por Dr Marcelo Demarzo", channel: "Mindfulness Brasil", style: "guiada", meta: "18 min · 98 mil views", desc: "Escaneamento corporal guiado por um especialista em mindfulness." },
  { group: "meditacao", area: "emocional", youtubeId: "59FH8nYCYXo", title: "Meditação da manhã: 10 minutos para ter um dia maravilhoso", channel: "Meditar para Despertar", style: "guiada", meta: "10 min · 1,5 mi views", desc: "Meditação curta para começar o dia com calma e intenção." },
  { group: "meditacao", area: "emocional", youtubeId: "33_k9XeV118", title: "Meditação de Autocompaixão – Você Não Precisa Ser Forte o Tempo Todo", channel: "Camila Zen", style: "guiada", meta: "20 min · 66 mil views", desc: "Prática guiada de autocompaixão e acolhimento." },
  // Gratidão
  { group: 'gratidao', area: 'espiritualidade', youtubeId: '2YBJZOYJBY0', title: 'Meditação para GRATIDÃO', channel: 'Raissa Zoccal', style: 'guiada', meta: '11 min · 5,9 mi views', desc: 'Meditação guiada para perceber e sentir a gratidão pelo que já existe na sua vida.' },
  { group: 'gratidao', area: 'espiritualidade', youtubeId: 'JHwKaiF6XYA', title: 'Um antídoto para a insatisfação', channel: 'Em Poucas Palavras – Kurzgesagt', style: 'animado', meta: '10 min · 535 mil views', desc: 'Animação que explica, com base na ciência, como a gratidão combate a insatisfação.' },
  { group: 'gratidao', area: 'espiritualidade', youtubeId: 'h2HuMveeXls', title: 'A CIÊNCIA DA GRATIDÃO', channel: 'Minutos Psíquicos', style: 'animado', meta: '5 min · 124 mil views', desc: 'Animação rápida sobre o que a psicologia descobriu a respeito dos efeitos da gratidão.' },
  { group: 'gratidao', area: 'espiritualidade', youtubeId: 'g5z0QRPnVAo', title: 'A gratidão é inesquecível? - Mario Sergio Cortella', channel: 'Canal do Cortella', style: 'palestra', meta: '5 min · 55 mil views', desc: 'Cortella reflete sobre o valor da gratidão e por que ela é tão marcante.' },
  { group: 'gratidao', area: 'espiritualidade', youtubeId: 'eLrkGah3X90', title: 'MONJA COEN GRATIDÃO PELA VIDA', channel: 'Zendo Brasil', style: 'palestra', meta: '13 min · 6 mil views', desc: 'A Monja Coen fala sobre cultivar a gratidão pela própria vida no dia a dia.' },
  { group: "gratidao", area: "espiritualidade", youtubeId: "VNJpFZKBhUc", title: "Gratidão: uma ferramenta evolutiva? – Mario Sergio Cortella", channel: "Canal do Cortella", style: "palestra", meta: "5 min · 43 mil views", desc: "Cortella reflete sobre o papel da gratidão na convivência humana." },
  { group: "gratidao", area: "espiritualidade", youtubeId: "99OoD9scILg", title: "A gratidão que qualifica | José J. Camargo | TEDxUnisinosSalon", channel: "TEDx Talks", style: "palestra", meta: "17 min · 106 mil views", desc: "Um médico conta histórias sobre como a gratidão dá sentido à vida." },
  { group: "gratidao", area: "espiritualidade", youtubeId: "n0kHIX3TscI", title: "GRATIDÃO – O mundo precisa mais disto", channel: "Vida Animada", style: "animado", meta: "2 min · 143 mil views", desc: "Curta animado que convida a reconhecer o que há de bom em cada dia." },
  // Oração
  { group: 'oracao', area: 'espiritualidade', youtubeId: '_1CE_z59Fuw', title: 'Oração para começar bem o dia! Padre Adriano Zandoná', channel: 'Padre Adriano Zandoná', style: 'guiada', meta: '14 min · 2,8 mi views', desc: 'Oração guiada da manhã para entregar o dia a Deus com serenidade.' },
  { group: 'oracao', area: 'espiritualidade', youtubeId: 'boPX3Bo05Ks', title: 'ORAÇÃO PODEROSA CONTRA A ANSIEDADE E PARA ACALMAR O CORAÇÃO - Padre Adriano Zandoná', channel: 'Padre Adriano Zandoná', style: 'guiada', meta: '11 min · 990 mil views', desc: 'Oração guiada para acalmar o coração e entregar as angústias a Deus.' },
  { group: 'oracao', area: 'espiritualidade', youtubeId: 'OX2EjvxWqE0', title: 'SALMO 91 - UMA ORAÇÃO DE PROTEÇÃO | Padre Manzotti', channel: 'Padre Reginaldo Manzotti', style: 'guiada', meta: '13 min · 8,4 mi views', desc: 'O Padre Manzotti reza o Salmo 91 pedindo proteção e confiança em Deus.' },
  { group: 'oracao', area: 'espiritualidade', youtubeId: 'SMcDfntyKk0', title: 'Salmos 23 - Cid Moreira - (Bíblia em Áudio)', channel: 'MensagemdeDeus1', style: 'guiada', meta: '2 min · 17 mi views', desc: 'O Salmo 23, “O Senhor é meu pastor”, narrado pela voz de Cid Moreira.' },
  { group: 'oracao', area: 'espiritualidade', youtubeId: 'NdQdS5aeGX8', title: 'Aprofunde-se no significado da oração do Pai Nosso • Sermão do Monte (Episódio 7)', channel: 'BibleProject - Português', style: 'animado', meta: '10 min · 51 mil views', desc: 'Animação que explica, frase por frase, o significado da oração do Pai Nosso.' },
  { group: "oracao", area: "espiritualidade", youtubeId: "egz9nmSonBc", title: "Confiar a Deus suas preocupações | A Imitação de Cristo", channel: "Frei Gilson / Som do Monte – OFICIAL", style: "guiada", meta: "11 min · 1,5 mi views", desc: "Reflexão e oração com Frei Gilson para entregar as preocupações a Deus." },
  { group: "oracao", area: "espiritualidade", youtubeId: "XsIK6Xi0Jig", title: "Terço da Misericórdia", channel: "Canção Nova Oficial", style: "guiada", meta: "10 min", desc: "O Terço da Misericórdia rezado e cantado, do canal oficial da Canção Nova." },
  { group: "oracao", area: "espiritualidade", youtubeId: "bcVo7pKoH6A", title: "O PODER DA ORAÇÃO – Hernandes Dias Lopes", channel: "Hernandes Dias Lopes", style: "palestra", meta: "23 min · 420 mil views", desc: "Mensagem evangélica sobre o valor e a prática da oração." },
];
