import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Ban, Crown, Loader2, Pencil, RefreshCw, Search, ShieldCheck, Trash2, UserCheck, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/auth-gate';
import { Button } from '@/components/ui/button';
import { askConfirm } from '@/components/ui/confirm';
import { Input, Label, Select, Textarea } from '@/components/ui/form-controls';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { deleteAccount, listProfiles, updateProfile, type Profile, type ProfilePatch } from '@/services/profiles';

const KEY = ['admin', 'profiles'];
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const ago = (iso: string | null) => (iso ? formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ptBR }) : 'nunca entrou');
const ONLINE_MS = 10 * 60 * 1000;

/** Área do administrador: lista de contas, ajustes de perfil, bloqueio e exclusão. */
export function AdminPage() {
  const { isAdmin, email } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'blocked' | 'admin'>('all');
  const [editing, setEditing] = useState<Profile | null>(null);

  const { data = [], isLoading, error, refetch, isFetching } = useQuery({ queryKey: KEY, queryFn: listProfiles, enabled: isAdmin });

  const save = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: ProfilePatch }) => updateProfile(id, patch),
    onSuccess: (p) => {
      qc.setQueryData<Profile[]>(KEY, (old = []) => old.map((x) => (x.id === p.id ? p : x)));
      toast.success('Perfil atualizado');
    },
    onError: (e) => toast.error(`Não foi possível salvar: ${e instanceof Error ? e.message : e}`),
  });
  const remove = useMutation({
    mutationFn: deleteAccount,
    onSuccess: (_, id) => {
      qc.setQueryData<Profile[]>(KEY, (old = []) => old.filter((x) => x.id !== id));
      toast.success('Conta apagada');
    },
    onError: (e) => toast.error(`Não foi possível apagar: ${e instanceof Error ? e.message : e}`),
  });

  const list = useMemo(() => {
    const s = norm(q.trim());
    return data.filter((p) => (filter === 'all' || (filter === 'blocked' ? p.blocked : p.role === 'admin')) && (!s || norm(`${p.email} ${p.name ?? ''} ${p.note ?? ''}`).includes(s)));
  }, [data, q, filter]);

  if (!isAdmin) return <Navigate to="/" replace />;

  const now = Date.now();
  const stats = [
    { label: 'Contas', value: data.length },
    { label: 'Ativas nos últimos 7 dias', value: data.filter((p) => p.last_seen && now - Date.parse(p.last_seen) < 7 * 864e5).length },
    { label: 'Novas nos últimos 7 dias', value: data.filter((p) => now - Date.parse(p.created_at) < 7 * 864e5).length },
    { label: 'Bloqueadas', value: data.filter((p) => p.blocked).length },
  ];

  const toggleBlock = async (p: Profile) => {
    if (!p.blocked && !(await askConfirm({ title: `Bloquear ${p.name || p.email}?`, message: 'A pessoa não consegue mais usar a Rutte até você desbloquear. Os dados no aparelho dela não são apagados.', confirmLabel: 'Bloquear', danger: true }))) return;
    save.mutate({ id: p.id, patch: { blocked: !p.blocked } });
  };
  const del = async (p: Profile) => {
    if (await askConfirm({ title: `Apagar a conta de ${p.email}?`, message: 'O login deixa de existir e o e-mail sai da lista. Não dá para desfazer (a pessoa pode criar uma conta nova depois).', confirmLabel: 'Apagar conta', danger: true }))
      remove.mutate(p.id);
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <ShieldCheck className="size-7 text-primary" aria-hidden /> Administração
          </h1>
          <p className="text-sm text-foreground/60">Quem usa a Rutte. Ajuste nomes, bloqueie ou apague contas. Os afazeres e notas de cada pessoa ficam no aparelho dela.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} aria-hidden /> Atualizar
        </Button>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
            <p className="text-xs text-foreground/60">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-0 flex-1 basis-60">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" aria-hidden />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por e-mail, nome ou observação…" className="pl-9" aria-label="Buscar contas" />
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} aria-label="Filtrar" className="w-auto">
          <option value="all">Todas</option>
          <option value="blocked">Bloqueadas</option>
          <option value="admin">Administradores</option>
        </Select>
      </div>

      {isLoading ? (
        <p className="flex items-center gap-2 text-sm text-foreground/60">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Carregando contas…
        </p>
      ) : error ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-sm text-foreground/70">
          Não consegui ler as contas ({error instanceof Error ? error.message : String(error)}). Confira se o arquivo <code>supabase/admin.sql</code> foi rodado no Supabase.
        </p>
      ) : list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-foreground/60">Nenhuma conta encontrada.</p>
      ) : (
        <ul className="stagger space-y-2">
          {list.map((p) => {
            const me = p.email === email;
            const online = p.last_seen && now - Date.parse(p.last_seen) < ONLINE_MS;
            return (
              <li key={p.id} className={cn('flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3', p.blocked && 'opacity-70')}>
                <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-navy text-sm font-bold uppercase text-white">
                  {(p.name || p.email).slice(0, 1)}
                  {online && <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-emerald-500" title="Usando agora" />}
                </span>
                <div className="min-w-0 flex-1 basis-56">
                  <p className="flex flex-wrap items-center gap-1.5 font-semibold leading-snug">
                    {p.name || <span className="text-foreground/50">Sem nome</span>}
                    {p.role === 'admin' && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300">
                        <Crown className="size-3" aria-hidden /> Admin
                      </span>
                    )}
                    {p.blocked && <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">Bloqueada</span>}
                    {me && <span className="text-xs font-normal text-foreground/50">(você)</span>}
                  </p>
                  <p className="truncate text-sm text-foreground/70">{p.email}</p>
                  <p className="text-xs text-foreground/50">
                    Cadastro em {format(new Date(p.created_at), "dd/MM/yyyy")} · último acesso {ago(p.last_seen)}
                  </p>
                  {p.note && <p className="mt-1 line-clamp-2 text-xs italic text-foreground/60">“{p.note}”</p>}
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => setEditing(p)}>
                    <Pencil className="size-3.5" aria-hidden /> Editar
                  </Button>
                  {!me && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => toggleBlock(p)} aria-label={p.blocked ? `Desbloquear ${p.email}` : `Bloquear ${p.email}`}>
                        {p.blocked ? <UserCheck className="size-3.5" aria-hidden /> : <Ban className="size-3.5" aria-hidden />}
                        {p.blocked ? 'Desbloquear' : 'Bloquear'}
                      </Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => del(p)} aria-label={`Apagar a conta de ${p.email}`} title="Apagar conta">
                        <Trash2 className="size-4 text-primary" aria-hidden />
                      </Button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="flex items-center gap-1.5 text-xs text-foreground/50">
        <Users className="size-3.5" aria-hidden /> A mesma lista aparece no Supabase em Authentication → Users.
      </p>

      <EditDialog profile={editing} isSelf={editing?.email === email} onClose={() => setEditing(null)} onSave={(patch) => (editing ? save.mutateAsync({ id: editing.id, patch }).then(() => setEditing(null)) : undefined)} />
    </div>
  );
}

function EditDialog({ profile, isSelf, onClose, onSave }: { profile: Profile | null; isSelf: boolean; onClose: () => void; onSave: (patch: ProfilePatch) => Promise<unknown> | undefined }) {
  return (
    <Dialog open={!!profile} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-md p-5">
        {profile && <EditForm key={profile.id} profile={profile} isSelf={isSelf} onSave={onSave} />}
      </DialogContent>
    </Dialog>
  );
}

function EditForm({ profile, isSelf, onSave }: { profile: Profile; isSelf: boolean; onSave: (patch: ProfilePatch) => Promise<unknown> | undefined }) {
  const [name, setName] = useState(profile.name ?? '');
  const [role, setRole] = useState(profile.role);
  const [note, setNote] = useState(profile.note ?? '');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const patch: ProfilePatch = { role, note: note.trim() || null };
    if (name.trim() !== (profile.name ?? '')) Object.assign(patch, { name: name.trim() || null, name_locked: !!name.trim() });
    setBusy(true);
    try {
      await onSave(patch);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <DialogTitle className="text-lg font-bold">Editar perfil</DialogTitle>
        <DialogDescription className="text-sm text-foreground/60">{profile.email}</DialogDescription>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="adm-name">Nome</Label>
        <Input id="adm-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como a pessoa aparece na Rutte" />
        <p className="text-xs text-foreground/50">Ao mudar, o novo nome aparece para a pessoa na próxima vez que ela abrir a Rutte.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="adm-role">Papel</Label>
        <Select id="adm-role" value={role} onChange={(e) => setRole(e.target.value as Profile['role'])} disabled={isSelf}>
          <option value="user">Usuário</option>
          <option value="admin">Administrador (vê e ajusta todas as contas)</option>
        </Select>
        {isSelf && <p className="text-xs text-foreground/50">Você não pode tirar o próprio acesso de administrador.</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="adm-note">Observação (só administradores veem)</Label>
        <Textarea id="adm-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Ex.: cliente do plano anual, indicado pela Ana…" />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden />} Salvar
        </Button>
      </div>
    </form>
  );
}
