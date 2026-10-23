// Busca o calendário (iCal/.ics) de um portal — faculdade, escola, trabalho — para a Rutte mostrar no Calendário.
// O navegador não pode ler esses links direto (CORS); esta função faz a ponte com regras de segurança:
// só https, só endereços públicos, até 2 MB e só devolve se o conteúdo for mesmo um calendário (BEGIN:VCALENDAR).
export const config = { runtime: 'edge' };

const PRIVATE = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|\[?::1\]?|\[?f[cd]|.*\.local$|.*\.internal$)/i;

export default async function handler(req) {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=900' };
  const raw = new URL(req.url).searchParams.get('url') || '';
  let target;
  try {
    target = new URL(raw.replace(/^webcal:/i, 'https:'));
  } catch {
    return new Response('URL inválida', { status: 400, headers: cors });
  }
  if (target.protocol !== 'https:' || PRIVATE.test(target.hostname)) {
    return new Response('Use um endereço https público', { status: 400, headers: cors });
  }
  try {
    const res = await fetch(target.toString(), { headers: { Accept: 'text/calendar, */*' }, redirect: 'follow' });
    if (!res.ok) return new Response(`O portal respondeu ${res.status}`, { status: 502, headers: cors });
    const text = (await res.text()).slice(0, 2_000_000);
    if (!/BEGIN:VCALENDAR/i.test(text)) return new Response('Esse link não é um calendário (.ics)', { status: 422, headers: cors });
    return new Response(text, { status: 200, headers: { ...cors, 'Content-Type': 'text/calendar; charset=utf-8' } });
  } catch {
    return new Response('Não foi possível acessar o calendário', { status: 502, headers: cors });
  }
}
