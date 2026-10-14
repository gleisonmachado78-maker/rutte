/**
 * Junta dois bancos da Rutte (aparelho × nuvem) sem perder nada:
 * listas de itens com "id" viram a união dos dois (no mesmo id, fica a versão editada por último);
 * objetos são juntados campo a campo; valores simples ficam com a versão da nuvem quando ela tiver.
 */
type Json = unknown;
const isObj = (v: Json): v is Record<string, Json> => !!v && typeof v === 'object' && !Array.isArray(v);
const stamp = (v: Json) => {
  if (!isObj(v)) return 0;
  const s = v.updatedAt ?? v.completedAt ?? v.createdAt ?? v.at ?? v.date;
  const t = typeof s === 'string' ? Date.parse(s) : 0;
  return Number.isFinite(t) ? t : 0;
};

export function mergeValue(local: Json, remote: Json): Json {
  if (remote === undefined || remote === null) return local;
  if (local === undefined || local === null) return remote;
  if (Array.isArray(local) && Array.isArray(remote)) {
    const withId = [...local, ...remote].every((x) => isObj(x) && typeof x.id === 'string');
    if (!withId) return [...new Set([...remote, ...local].map((x) => JSON.stringify(x)))].map((x) => JSON.parse(x));
    const byId = new Map<string, Json>();
    for (const x of remote as Record<string, Json>[]) byId.set(x.id as string, x);
    for (const x of local as Record<string, Json>[]) {
      const other = byId.get(x.id as string);
      byId.set(x.id as string, other === undefined ? x : stamp(x) > stamp(other) ? mergeValue(other, x) : mergeValue(x, other));
    }
    return [...byId.values()];
  }
  if (isObj(local) && isObj(remote)) {
    const out: Record<string, Json> = {};
    for (const k of new Set([...Object.keys(local), ...Object.keys(remote)])) out[k] = mergeValue(local[k], remote[k]);
    return out;
  }
  return remote;
}

/** Quantos itens o banco tem (para saber se algum lado está "vazio"). */
export function contentSize(db: Json): number {
  if (!isObj(db)) return 0;
  let n = 0;
  for (const v of Object.values(db)) {
    if (Array.isArray(v)) n += v.length;
    else if (isObj(v)) n += contentSize(v);
  }
  return n;
}
