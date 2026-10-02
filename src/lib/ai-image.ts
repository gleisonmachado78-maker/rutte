/**
 * Imagens da Rutte IA (ferramenta `criar_imagem`).
 * - Infográfico/esquema: a própria IA de texto desenha um SVG (texto nítido em português; funciona no Gemini grátis e na Claude).
 * - Foto/ilustração: gerador de imagens do Gemini; se não estiver liberado na conta, cai para o infográfico.
 * As imagens são mostradas como <img> (data URL), então nenhum script do SVG é executado.
 */
import { getAiKey, getAiModel, getProvider } from './ai';
import { geminiText, getGeminiKey } from './ai-gemini';

export type ImageStyle = 'infografico' | 'ilustracao' | 'foto';

export interface ChatImage {
  src: string;
  alt: string;
  style: ImageStyle;
  /** como foi feita (para mostrar ao usuário) */
  engine: 'svg' | 'gemini-image';
}

const PALETTE = 'fundo #111727 (azul-marinho), destaques #B91B1C (vermelho) e #7F1D1C (vinho), textos #FFFFFF e #E5E7EB';

/** Remove o que não deve existir num SVG mostrado como imagem (defesa extra). */
function sanitizeSvg(raw: string): string | null {
  const m = raw.match(/<svg[\s\S]*<\/svg>/i);
  if (!m) return null;
  let svg = m[0];
  svg = svg
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*')/gi, '')
    .replace(/(href|xlink:href)\s*=\s*("|')\s*(javascript:|https?:)[^"']*\2/gi, '');
  if (!/xmlns=/.test(svg)) svg = svg.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  return svg;
}

const toDataUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

async function claudeText(prompt: string, maxTokens: number, signal?: AbortSignal): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal,
    headers: {
      'content-type': 'application/json',
      'x-api-key': getAiKey(),
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: getAiModel(), max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) throw new Error(`Claude ${res.status}`);
  const data = await res.json();
  return (data.content ?? []).map((b: { type: string; text?: string }) => (b.type === 'text' ? b.text : '')).join('');
}

/** Infográfico em SVG desenhado pela IA de texto do provedor ativo. */
async function svgImage(description: string, style: ImageStyle, signal?: AbortSignal): Promise<ChatImage> {
  const prompt = [
    `Crie ${style === 'infografico' ? 'um infográfico explicativo' : 'uma ilustração explicativa simples, em estilo flat'} em SVG sobre: ${description}`,
    'Regras: responda SOMENTE com o código <svg>…</svg>, sem explicações e sem ```.',
    'Use viewBox="0 0 800 1100", width="800" height="1100", fonte font-family="Arial, Helvetica, sans-serif".',
    `Cores: ${PALETTE}. Visual moderno, limpo, com blocos/cartões arredondados, ícones simples feitos com formas, números grandes e boa hierarquia.`,
    'Todo o texto em português do Brasil, curto e legível (mínimo 20px), sem sair da área. Título no topo e rodapé "Rutte • sua secretária digital".',
    'Proibido: <script>, <foreignObject>, imagens externas, links, fontes externas.',
  ].join('\n');
  const raw = getProvider() === 'claude' ? await claudeText(prompt, 8000, signal) : await geminiText(prompt, 8192, signal);
  const svg = sanitizeSvg(raw);
  if (!svg) throw new Error('A IA não devolveu uma imagem válida. Tente pedir de novo.');
  return { src: toDataUrl(svg), alt: description, style, engine: 'svg' };
}

/** Reduz e converte para JPEG (para caber no armazenamento do navegador). */
async function shrink(dataUrl: string, max = 1024): Promise<string> {
  try {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * k);
    c.height = Math.round(img.height * k);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.82);
  } catch {
    return dataUrl;
  }
}

/** Foto/ilustração com o gerador de imagens do Gemini. */
async function geminiImage(description: string, style: ImageStyle, signal?: AbortSignal): Promise<ChatImage> {
  const key = getGeminiKey();
  if (!key) throw new Error('sem chave do Gemini');
  const prompt =
    style === 'foto'
      ? `Foto realista, bem iluminada e explicativa: ${description}. Sem textos na imagem.`
      : `Ilustração colorida, moderna e explicativa (estilo flat), cores vermelho #B91B1C e azul-marinho #111727: ${description}. Evite textos longos na imagem.`;
  for (const model of ['gemini-2.5-flash-image', 'gemini-2.0-flash-preview-image-generation']) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      signal,
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['TEXT', 'IMAGE'] } }),
    });
    if (!res.ok) continue;
    const data = await res.json();
    const part = (data?.candidates?.[0]?.content?.parts ?? []).find((p: { inlineData?: { data?: string } }) => p.inlineData?.data);
    if (part) {
      const src = await shrink(`data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`);
      return { src, alt: description, style, engine: 'gemini-image' };
    }
  }
  throw new Error('gerador de imagens indisponível');
}

/** Cria a imagem pedida; fotos/ilustrações tentam o gerador do Gemini e, se não der, viram infográfico. */
export async function createImage(description: string, style: ImageStyle, signal?: AbortSignal): Promise<{ image: ChatImage; note?: string }> {
  if (style !== 'infografico' && getProvider() === 'gemini') {
    try {
      return { image: await geminiImage(description, style, signal) };
    } catch (e) {
      if ((e as Error).name === 'AbortError') throw e;
      const image = await svgImage(description, 'infografico', signal);
      return { image, note: 'O gerador de fotos do Gemini não está liberado na sua conta grátis, então fiz um infográfico.' };
    }
  }
  return { image: await svgImage(description, style === 'foto' ? 'infografico' : style, signal) };
}
