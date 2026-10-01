import type { FreeBook } from './library';

/**
 * Livros gratuitos e LEGAIS: domínio público ou publicações oficiais/abertas.
 * Links conferidos em 01/10/2026 (HTTP 200, application/pdf). Nunca incluir PDFs piratas.
 * Traduções da Universidade de Coimbra estão em português de Portugal.
 */
export const FREE_BOOKS: FreeBook[] = [
  // Finanças
  { topic: 'financas', title: 'Caderno de Educação Financeira – Gestão de Finanças Pessoais', author: 'Banco Central do Brasil', source: 'Banco Central do Brasil', url: 'https://www.bcb.gov.br/content/cidadaniafinanceira/documentos_cidadania/Cuidando_do_seu_dinheiro_Gestao_de_Financas_Pessoais/caderno_cidadania_financeira.pdf', kind: 'pdf', license: 'Publicação oficial gratuita', pages: 98, why: 'Ensina a organizar o orçamento, consumir com consciência, usar crédito sem se endividar e começar a poupar.' },
  { topic: 'financas', title: 'Planejamento Financeiro Pessoal (Livro TOP)', author: 'CVM e Planejar', source: 'Portal do Investidor (CVM)', url: 'https://www.gov.br/investidor/pt-br/educacional/publicacoes-educacionais/livros-cvm/livro-top-planejamento-financeiro-pessoal/@@display-file/file', kind: 'pdf', license: 'Publicação oficial gratuita', pages: 314, why: 'Guia completo sobre gestão financeira, investimentos, aposentadoria, seguros, tributos e sucessão.' },

  // Produtividade
  { topic: 'produtividade', title: 'Gestão do tempo: ferramentas de organização para auxiliar na aprendizagem', author: 'Universidade Federal do Agreste de Pernambuco (UFAPE)', source: 'UFAPE', url: 'https://ufape.edu.br/sites/default/files/2024-12/Orienta%C3%A7%C3%B5es%20Pedag%C3%B3gicas%20Volume%201%20-%20Coordenadoria%20de%20Orienta%C3%A7%C3%A3o%20Pedag%C3%B3gica%20da%20UFAPE.pdf', kind: 'pdf', license: 'Publicação oficial gratuita', pages: 26, why: 'Ferramentas práticas como GTD, Matriz GUT e 5W2H para priorizar tarefas e render mais com menos estresse.' },
  { topic: 'produtividade', title: 'A Sciencia do Bom Homem Ricardo, ou Meios de Fazer Fortuna', author: 'Benjamin Franklin (edição de 1825)', source: 'Biblioteca Nacional Digital (Portugal)', url: 'https://purl.pt/14349/4/sc-36981-p_PDF/sc-36981-p_PDF_24-C-R0150/sc-36981-p_0000_capa-capa_t24-C-R0150.pdf', kind: 'pdf', license: 'Domínio público', pages: 20, why: 'Os conselhos clássicos de Franklin sobre diligência, uso do tempo e economia (digitalização com a ortografia da época).' },

  // Inteligência emocional
  { topic: 'emocional', title: 'Encheirídion de Epicteto', author: 'Epicteto (trad. Aldo Dinucci e Alfredo Julien)', source: 'Imprensa da Universidade de Coimbra', url: 'https://dl.uc.pt/bitstream/10316.2/32825/1/epicteto.pdf', kind: 'pdf', license: 'Publicação oficial gratuita', pages: 100, why: 'O manual estoico que ensina a separar o que depende de você do que não depende, para ter serenidade diante das emoções.' },
  { topic: 'emocional', title: 'Guia do Estudante – Como lidar com a ansiedade', author: 'Thais Pereira da Silva (Unama)', source: 'eduCAPES (CAPES)', url: 'https://educapes.capes.gov.br/bitstream/capes/1132054/2/Guia%20do%20estudante%20-%20Como%20lidar%20com%20a%20ANSIEDADE.pdf', kind: 'pdf', license: 'Distribuição gratuita do autor', pages: 13, why: 'Guia curto e acolhedor para entender a ansiedade e aplicar estratégias simples de autocuidado.' },

  // Relacionamentos
  { topic: 'relacionamentos', title: 'Obras Morais – Como Distinguir um Adulador de um Amigo', author: 'Plutarco (trad. Paula Barata Dias)', source: 'Universidade de Coimbra', url: 'https://dl.uc.pt/bitstream/10316.2/2396/1/sobre_a_amizade.pdf', kind: 'pdf', license: 'Publicação oficial gratuita', pages: 228, why: 'Ensina a reconhecer amizades verdadeiras, evitar bajuladores e tirar aprendizado até dos conflitos.' },
  { topic: 'relacionamentos', title: 'Obras Morais – Diálogo sobre o Amor', author: 'Plutarco (trad. Carlos de Jesus)', source: 'Imprensa da Universidade de Coimbra', url: 'https://dl.uc.pt/bitstream/10316.2/2409/1/sobre_o_amor.pdf', kind: 'pdf', license: 'Publicação oficial gratuita', pages: 159, why: 'Reflexão clássica sobre o amor, o casamento e o que sustenta uma relação a dois.' },

  // Desenvolvimento pessoal
  { topic: 'desenvolvimento', title: 'O Poder da Vontade, ou Caráter, Comportamento e Perseverança (Self-Help)', author: 'Samuel Smiles (edição de 1870)', source: 'Biblioteca Digital de Obras Raras (USP)', url: 'https://obrasraras.usp.br/xmlui/bitstream/handle/123456789/2383/S_131459_SMILES_Poder_da_vontade_1870.pdf?sequence=1', kind: 'pdf', license: 'Domínio público', pages: 453, why: 'O livro que deu origem à “autoajuda”: histórias reais de perseverança e disciplina que formam o caráter.' },

  // Liderança
  { topic: 'lideranca', title: 'Gestão de pessoas: liderança e competências para o setor público', author: 'Sandro Trescastro Bergue (Enap)', source: 'Repositório Enap', url: 'https://repositorio.enap.gov.br/bitstreams/925965e6-7af5-4629-bc17-453be6c2b95b/download', kind: 'pdf', license: 'Publicação oficial gratuita', pages: 181, why: 'Como desenvolver liderança e competências para conduzir equipes com propósito e resultados.' },

  // Oratória
  { topic: 'oratoria', title: 'A Arte de Falar Bem: técnicas e estratégias de oratória', author: 'Alexandre A. Lamattina, Carlos E. Paulino e Durval S. de Oliveira', source: 'eduCAPES (CAPES)', url: 'https://educapes.capes.gov.br/bitstream/capes/870321/2/A%20arte%20de%20falar%20bem.pdf', kind: 'pdf', license: 'Distribuição gratuita do autor', pages: 118, why: 'Técnicas práticas para estruturar falas, controlar o nervosismo e se comunicar com clareza em público.' },

  // Propósito
  { topic: 'proposito', title: 'As Diatribes de Epicteto, Livro I', author: 'Epicteto (trad. Aldo Dinucci)', source: 'Imprensa da Universidade de Coimbra', url: 'https://monographs.uc.pt/iuc/catalog/download/13/36/54-1?inline=1', kind: 'pdf', license: 'Publicação oficial gratuita', pages: 216, why: 'Lições de Epicteto sobre viver de acordo com seus valores e encontrar sentido no que está ao seu alcance.' },
];
