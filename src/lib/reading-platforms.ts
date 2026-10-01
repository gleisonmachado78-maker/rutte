import type { ReadingPlatform } from './library';

/**
 * Caminhos legais para ler best-sellers atuais sem pagar (ou só com uma assinatura que a pessoa já tem).
 * Best-sellers recentes têm direitos autorais: nunca indicar PDFs "grátis" deles.
 */
export const READING_PLATFORMS: ReadingPlatform[] = [
  { name: 'BibliON – Biblioteca digital de SP', what: 'Biblioteca pública digital com mais de 20 mil e-books e audiolivros, incluindo best-sellers de autoajuda, negócios e ficção.', condition: 'Grátis com cadastro. Empresta até 2 títulos por vez, por 15 dias (dá para renovar). Site e app para Android e iPhone.', url: 'https://www.biblion.org.br/', bestSellersExamples: '' },
  { name: 'Amostras grátis do Google Play Livros', what: 'Leia de graça o começo de quase qualquer e-book à venda — ótimo para conhecer o livro antes de comprar.', condition: 'Grátis com uma conta Google.', url: 'https://play.google.com/store/books', bestSellersExamples: '' },
  { name: 'Kindle Unlimited (Amazon)', what: 'Catálogo com muitos livros de negócios, finanças e desenvolvimento pessoal. Qualquer e-book Kindle também tem amostra grátis.', condition: 'Assinatura paga com período de teste gratuito (cancele antes se não quiser continuar).', url: 'https://www.amazon.com.br/kindle-dbs/hz/subscribe/ku', bestSellersExamples: '' },
  { name: 'Prime Reading (Amazon)', what: 'Seleção rotativa de e-books, incluindo alguns best-sellers, para ler sem custo extra.', condition: 'Incluso para quem já assina o Amazon Prime.', url: 'https://www.amazon.com.br/prime', bestSellersExamples: '' },
  { name: 'Skeelo', what: 'App de e-books e audiolivros que libera títulos todo mês.', condition: 'Grátis como benefício para clientes de operadoras e parceiros participantes.', url: 'https://skeelo.app/', bestSellersExamples: '' },
];
