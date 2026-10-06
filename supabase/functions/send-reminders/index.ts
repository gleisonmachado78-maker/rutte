// Rutte — envia os alertas que venceram (chamada a cada minuto pelo pg_cron; ver supabase/push.sql).
// Segredos (Edge Functions → Secrets): VAPID_PRIVATE_KEY e VAPID_SUBJECT (VAPID_PUBLIC_KEY é opcional: a pública
// está abaixo, igual à de src/lib/push.ts). Publicar SEM verificação de JWT (quem chama só dispara o envio do que já
// está na hora; nada é devolvido além da contagem).
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';

// chave pública (não é segredo; a mesma que está no app)
const PUBLIC_KEY = 'BK9sgXITZJuqNiaSPDgFR_FN4Mwz2PcQNgdWJqBQn2GrVQFllZU8HpThnpjozBG1ClSFqGh5V66FHwfzCsLqdbk';

// lê os segredos mesmo se as 3 linhas "NOME=valor" foram coladas juntas num campo só
function readKeys() {
  const kv: Record<string, string> = {};
  for (const n of ['VAPID_PRIVATE_KEY', 'VAPID_PUBLIC_KEY', 'VAPID_SUBJECT']) {
    for (const raw of (Deno.env.get(n) ?? '').split(/\r?\n/)) {
      const line = raw.trim().replace(/^["']|["']$/g, '');
      if (!line) continue;
      const m = line.match(/^(VAPID_[A-Z_]+)\s*=\s*(.*)$/);
      if (m) kv[m[1]] ??= m[2].trim().replace(/^["']|["']$/g, '');
      else kv[n] ??= line;
    }
  }
  return kv;
}
const clean = (s = '') => s.replace(/\s+/g, '').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

Deno.serve(async () => {
  const kv = readKeys();
  const priv = clean(kv.VAPID_PRIVATE_KEY);
  try {
    webpush.setVapidDetails(kv.VAPID_SUBJECT?.startsWith('mailto:') ? kv.VAPID_SUBJECT : 'mailto:gleisonmachado78@gmail.com', PUBLIC_KEY, priv);
  } catch (e) {
    return Response.json({ error: String(e), privateKeyLength: priv.length, found: Object.keys(kv) }, { status: 500 });
  }

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const now = Date.now();
  const { data: due, error } = await sb
    .from('reminders')
    .select('user_id, id, title, body, url')
    .eq('sent', false)
    .lte('at', new Date(now).toISOString())
    .gte('at', new Date(now - 2 * 3600e3).toISOString())
    .limit(500);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!due?.length) return Response.json({ sent: 0 });

  const users = [...new Set(due.map((r) => r.user_id))];
  const { data: subs } = await sb.from('push_subscriptions').select('endpoint, user_id, p256dh, auth').in('user_id', users);

  let sent = 0;
  for (const r of due) {
    const payload = JSON.stringify({ title: r.title, body: r.body ?? '', url: r.url ?? './', tag: r.id });
    for (const s of (subs ?? []).filter((x) => x.user_id === r.user_id)) {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 3600, urgency: 'high' });
        sent++;
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) await sb.from('push_subscriptions').delete().eq('endpoint', s.endpoint); // aparelho saiu
      }
    }
    await sb.from('reminders').update({ sent: true }).eq('user_id', r.user_id).eq('id', r.id);
  }
  return Response.json({ sent, reminders: due.length });
});
