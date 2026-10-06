// Rutte — envia os alertas que venceram (chamada a cada minuto pelo pg_cron; ver supabase/push.sql).
// Segredos necessários (Edge Functions → Secrets): VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT.
// Publicar sem verificação de JWT (quem chama só dispara o envio do que já está na hora; nada é lido de volta).
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async () => {
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT') ?? 'mailto:contato@rutte.app', Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!);

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
