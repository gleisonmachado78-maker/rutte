/**
 * Leitura de calendários iCal (.ics) dos portais (Moodle, Canvas, Google Classroom, AVAs, Outlook…).
 * Extrai eventos (VEVENT) e tarefas com prazo (VTODO) como itens de calendário.
 */
export interface FeedEvent {
  uid: string;
  title: string;
  date: string; // yyyy-MM-dd (horário local)
  time?: string; // HH:mm
  url?: string;
  /** VTODO (tarefa com prazo) */
  todo: boolean;
}

const unfold = (s: string) => s.replace(/\r?\n[ \t]/g, '');
const unescape = (s: string) => s.replace(/\\n/gi, ' ').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\').trim();
const pad = (n: number) => String(n).padStart(2, '0');

/** Converte DTSTART/DUE (data ou data-hora, UTC ou local) para data e hora locais. */
function toLocal(value: string): { date: string; time?: string } | null {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?/);
  if (!m) return null;
  const [, y, mo, d, h, mi, , z] = m;
  if (!h) return { date: `${y}-${mo}-${d}` };
  const dt = z ? new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi)) : new Date(+y, +mo - 1, +d, +h, +mi);
  // 23:59 / meia-noite costumam ser "até o fim do dia"
  return { date: `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`, time: `${pad(dt.getHours())}:${pad(dt.getMinutes())}` };
}

export function parseIcs(text: string): FeedEvent[] {
  const out: FeedEvent[] = [];
  const blocks = unfold(text).split(/BEGIN:(VEVENT|VTODO)/i).slice(1);
  for (let i = 0; i < blocks.length; i += 2) {
    const kind = blocks[i].toUpperCase();
    const body = blocks[i + 1]?.split(/END:(VEVENT|VTODO)/i)[0] ?? '';
    const get = (key: string) => body.match(new RegExp(`^${key}(?:;[^:\\r\\n]*)?:(.*)$`, 'mi'))?.[1]?.trim();
    const when = get(kind === 'VTODO' ? 'DUE' : 'DTSTART') ?? get('DTSTART') ?? get('DUE');
    const at = when ? toLocal(when) : null;
    if (!at) continue;
    out.push({
      uid: get('UID') ?? `${kind}-${i}-${when}`,
      title: unescape(get('SUMMARY') ?? 'Compromisso'),
      date: at.date,
      time: at.time,
      url: get('URL'),
      todo: kind === 'VTODO',
    });
  }
  return out;
}
