/**
 * Rutte IA com o Gemini (Google AI Studio), que tem plano gratuito.
 * Usa os mesmos dados, ferramentas e histórico da versão com Claude (blocos no formato da Anthropic),
 * convertidos para o formato do Gemini a cada envio.
 * Pesquisa na web: ferramenta `pesquisar_web`, resolvida com uma chamada separada usando a busca do Google.
 */
import { AiError, buildContext, getAiWeb, runTool, TOOLS, type ApiMessage, type Block, type ChatHooks, type PersonaId, type WebSource } from './ai';

const KEY_STORAGE = 'rutte:gemini-key';
const MODEL_STORAGE = 'rutte:gemini-model';
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export const GEMINI_MODELS = [
  { id: 'gemini-flash-latest', label: 'Gemini Flash', hint: 'Recomendado: rápido, bom e com cota grátis' },
  { id: 'gemini-flash-lite-latest', label: 'Gemini Flash-Lite', hint: 'Mais rápido, com a maior cota grátis' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', hint: 'Versão fixa, caso as outras deem erro' },
] as const;

const read = (k: string) => {
  try {
    return localStorage.getItem(k) ?? '';
  } catch {
    return '';
  }
};
const write = (k: string, v: string) => {
  try {
    if (v) localStorage.setItem(k, v);
    else localStorage.removeItem(k);
  } catch {
    /* sem armazenamento */
  }
  window.dispatchEvent(new Event('rutte:ai-key'));
};

export const getGeminiKey = () => read(KEY_STORAGE);
export const setGeminiKey = (k: string) => write(KEY_STORAGE, k.trim());
export const getGeminiModel = () => read(MODEL_STORAGE) || GEMINI_MODELS[0].id;
export const setGeminiModel = (m: string) => write(MODEL_STORAGE, m);
export const looksLikeGeminiKey = (k: string) => /^AIza[0-9A-Za-z_-]{30,}$/.test(k.trim());

/* ------------------------------- Formato do Gemini ------------------------------- */

interface GPart {
  text?: string;
  functionCall?: { name: string; args?: Record<string, unknown>; id?: string };
  functionResponse?: { name: string; response: Record<string, unknown>; id?: string };
  thought?: boolean;
  thoughtSignature?: string;
}
interface GContent {
  role: 'user' | 'model';
  parts: GPart[];
}

const WEB_TOOL = {
  name: 'pesquisar_web',
  description: 'Pesquisa na internet (Google) informações atuais ou externas — preços, notícias, lugares, estudos — e devolve um resumo com as fontes.',
  parameters: { type: 'object', properties: { consulta: { type: 'string', description: 'O que pesquisar, em poucas palavras' } }, required: ['consulta'] },
};

const declarations = () => [...TOOLS.map((t) => ({ name: t.name, description: t.description, parameters: t.input_schema })), ...(getAiWeb() ? [WEB_TOOL] : [])];

/** Converte o histórico guardado (formato Anthropic) para o formato do Gemini. */
function toGemini(history: ApiMessage[]): GContent[] {
  const names = new Map<string, string>();
  const out: GContent[] = [];
  for (const m of history) {
    const parts: GPart[] = [];
    for (const b of m.content) {
      if (b.type === 'text' && b.text) parts.push({ text: b.text });
      else if (b.type === 'tool_use') {
        names.set(b.id, b.name);
        parts.push({ functionCall: { name: b.name, args: b.input } });
      } else if (b.type === 'tool_result') {
        let response: Record<string, unknown>;
        try {
          response = JSON.parse(b.content);
        } catch {
          response = { resultado: b.content };
        }
        parts.push({ functionResponse: { name: names.get(b.tool_use_id) ?? 'ferramenta', response } });
      }
    }
    if (!parts.length) continue;
    const role = m.role === 'assistant' ? 'model' : 'user';
    const last = out.at(-1);
    if (last && last.role === role) last.parts.push(...parts);
    else out.push({ role, parts });
  }
  return out;
}

async function call(path: string, body: unknown, signal: AbortSignal) {
  const key = getGeminiKey();
  if (!key) throw new AiError('Configure sua chave do Gemini primeiro.');
  let res: Response;
  try {
    res = await fetch(`${BASE}/${getGeminiModel()}:${path}`, {
      method: 'POST',
      signal,
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
    });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new AiError('Sem conexão com o Gemini. Verifique a internet.');
  }
  if (!res.ok) {
    let detail = '';
    try {
      detail = (await res.json())?.error?.message ?? '';
    } catch {
      /* sem corpo */
    }
    const msg =
      /API key not valid|API_KEY_INVALID/i.test(detail) || res.status === 401 || res.status === 403
        ? 'A chave do Gemini é inválida (ou a API não está liberada). Confira em Configurações → Rutte IA.'
        : res.status === 429
          ? 'Você atingiu o limite gratuito do Gemini por agora. Espere um pouco (o limite renova por minuto e por dia) ou troque para o modelo Flash-Lite.'
          : res.status === 404
            ? 'Esse modelo do Gemini não está disponível para a sua chave. Escolha outro em Configurações → Rutte IA.'
            : `O Gemini respondeu com erro ${res.status}${detail ? `: ${detail}` : ''}.`;
    throw new AiError(msg, res.status === 400 && /key/i.test(detail) ? 401 : res.status);
  }
  return res;
}

/** Uma rodada com streaming; devolve as partes da resposta (texto + chamadas de função). */
async function streamRound(contents: GContent[], system: string, signal: AbortSignal, onText: (t: string) => void) {
  const res = await call(
    'streamGenerateContent?alt=sse',
    {
      systemInstruction: { parts: [{ text: system }] },
      contents,
      tools: [{ functionDeclarations: declarations() }],
      generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
    },
    signal,
  );
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  const parts: GPart[] = [];
  let buf = '';
  let blocked = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl;
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line.startsWith('data:')) continue;
      let ev: { candidates?: { content?: { parts?: GPart[] }; finishReason?: string }[]; promptFeedback?: { blockReason?: string } };
      try {
        ev = JSON.parse(line.slice(5));
      } catch {
        continue;
      }
      if (ev.promptFeedback?.blockReason) blocked = ev.promptFeedback.blockReason;
      const cand = ev.candidates?.[0];
      for (const p of cand?.content?.parts ?? []) {
        if (p.text && !p.thought) onText(p.text);
        parts.push(p);
      }
      if (cand?.finishReason === 'SAFETY') blocked = 'SAFETY';
    }
  }
  if (blocked && !parts.length) throw new AiError('O Gemini bloqueou essa resposta pelos filtros de segurança. Tente reformular.');
  return parts;
}

/** Pesquisa na web com a busca do Google (chamada separada, sem ferramentas próprias). */
async function webSearch(query: string, signal: AbortSignal): Promise<{ text: string; sources: WebSource[] }> {
  const res = await call(
    'generateContent',
    {
      contents: [{ role: 'user', parts: [{ text: `Pesquise na web e resuma em português do Brasil, com dados concretos e atuais (cerca de 150 palavras): ${query}` }] }],
      tools: [{ google_search: {} }],
    },
    signal,
  );
  const data = await res.json();
  const cand = data?.candidates?.[0];
  const text = (cand?.content?.parts ?? []).map((p: GPart) => p.text ?? '').join('');
  const chunks: { web?: { uri?: string; title?: string } }[] = cand?.groundingMetadata?.groundingChunks ?? [];
  const sources = chunks.filter((c) => c.web?.uri).map((c) => ({ url: c.web!.uri!, title: c.web!.title || c.web!.uri! })).slice(0, 8);
  return { text, sources };
}

let seq = 0;
const newId = () => `g_${Date.now().toString(36)}_${(seq++).toString(36)}`;

/** Mesma interface do `chat` da Claude: devolve as novas mensagens no formato guardado. */
export async function chatGemini(history: ApiMessage[], persona: PersonaId, signal: AbortSignal, hooks: ChatHooks): Promise<ApiMessage[]> {
  const system = await buildContext(persona);
  const contents = toGemini(history);
  const added: ApiMessage[] = [];
  for (let round = 0; round < 6; round++) {
    const parts = await streamRound(contents, system, signal, hooks.onText);
    // guarda a resposta como veio (inclui assinaturas de "pensamento" exigidas nas próximas rodadas)
    contents.push({ role: 'model', parts });
    const calls = parts.filter((p) => p.functionCall);
    const text = parts
      .filter((p) => p.text && !p.thought)
      .map((p) => p.text)
      .join('');
    const blocks: Block[] = [];
    if (text) blocks.push({ type: 'text', text });
    const ids = calls.map(() => newId());
    // a pesquisa na web não entra no histórico como ferramenta (assim a conversa continua válida se trocar para a Claude)
    calls.forEach((p, i) => p.functionCall!.name !== 'pesquisar_web' && blocks.push({ type: 'tool_use', id: ids[i], name: p.functionCall!.name, input: p.functionCall!.args ?? {} }));
    if (!blocks.length) blocks.push({ type: 'text', text: calls.length ? '(pesquisei na web)' : '…' });
    added.push({ role: 'assistant', content: blocks });
    if (!calls.length) break;

    const responses: GPart[] = [];
    const results: Block[] = [];
    for (let i = 0; i < calls.length; i++) {
      const fc = calls[i].functionCall!;
      let result: string;
      let ok = true;
      if (fc.name === 'pesquisar_web') {
        const q = String(fc.args?.consulta ?? '');
        hooks.onSearch?.(q);
        try {
          const r = await webSearch(q, signal);
          if (r.sources.length) hooks.onSources?.(r.sources);
          result = JSON.stringify({ resumo: r.text, fontes: r.sources.map((s) => s.title) });
        } catch (e) {
          if ((e as Error).name === 'AbortError') throw e;
          ok = false;
          result = JSON.stringify({ ok: false, erro: e instanceof Error ? e.message : 'falha na pesquisa' });
          hooks.onTool('Não consegui pesquisar na web agora', false);
        }
      } else {
        const r = await runTool(fc.name, fc.args ?? {});
        hooks.onTool(r.summary, r.ok, r.report);
        result = r.result;
        ok = r.ok;
      }
      let response: Record<string, unknown>;
      try {
        response = JSON.parse(result);
      } catch {
        response = { resultado: result };
      }
      responses.push({ functionResponse: { name: fc.name, response, ...(fc.id ? { id: fc.id } : {}) } });
      if (fc.name !== 'pesquisar_web') results.push({ type: 'tool_result', tool_use_id: ids[i], content: result, is_error: !ok });
    }
    contents.push({ role: 'user', parts: responses });
    if (results.length) added.push({ role: 'user', content: results });
    hooks.onRound();
  }
  // junta falas seguidas da IA (quando só houve pesquisa entre elas)
  const merged: ApiMessage[] = [];
  for (const m of added) {
    const last = merged.at(-1);
    if (last && last.role === m.role) last.content = [...last.content, ...m.content];
    else merged.push({ role: m.role, content: [...m.content] });
  }
  return merged;
}
