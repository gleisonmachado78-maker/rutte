import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Hourglass, Loader2, LogIn, Mail, RefreshCw, UserPlus } from 'lucide-react';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { DevCredit } from '@/components/brand/credit';
import { RutteLogo } from '@/components/brand/rutte';
import { authErrorPt, cloudEnabled, googleEnabled, siteUrl, supabase, cloudData, getLastEmail, getRemember, setRemember } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { api, readLocalDb } from '@/services/api';
import { getMyProfile, OWNER_EMAIL, touchProfile } from '@/services/profiles';
import { flushSync, startSync, stopSync } from '@/services/sync';

interface AuthInfo {
  /** e-mail da conta (null no modo sem login) */
  email: string | null;
  /** administrador (pode ver e ajustar as outras contas) */
  isAdmin: boolean;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthInfo>({ email: null, isAdmin: false, signOut: async () => {} });
export const useAuth = () => useContext(AuthContext);

/* ----------------------------------- Visual comum ----------------------------------- */

function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-navy px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_80%_110%,rgb(185_27_28/0.35),transparent_60%),radial-gradient(700px_400px_at_10%_-10%,rgb(127_29_28/0.4),transparent_60%)]" aria-hidden />
      <div className="relative w-full max-w-md">
        {children}
        <DevCredit className="mt-6 text-center" />
      </div>
    </div>
  );
}

function Brand({ subtitle }: { subtitle: string }) {
  return (
    <div className="mb-6 flex flex-col items-center text-center">
      <RutteLogo glow className="w-20" />
      <h1 className="mt-3 font-brand text-4xl font-bold">Rutte</h1>
      <p className="mt-1 text-sm text-white/65">{subtitle}</p>
    </div>
  );
}

const field = 'h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-[15px] text-white placeholder:text-white/35 focus:border-neon focus:outline-none';

function Splash({ text }: { text: string }) {
  return (
    <Screen>
      <div className="flex flex-col items-center gap-4 text-center" role="status" aria-live="polite">
        <RutteLogo glow className="w-20 animate-pulse" />
        <p className="flex items-center gap-2 text-sm text-white/75">
          <Loader2 className="size-4 animate-spin" aria-hidden /> {text}
        </p>
      </div>
    </Screen>
  );
}

/* --------------------------------------- Login --------------------------------------- */

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12Z" />
    </svg>
  );
}

function LoginScreen() {
  const [mode, setMode] = useState<'entrar' | 'criar' | 'esqueci'>('entrar');
  const [email, setEmail] = useState(getLastEmail);
  const [password, setPassword] = useState('');
  const [remember, setRememberState] = useState(getRemember);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setError('');
    setBusy(true);
    if (mode !== 'esqueci') setRemember(remember, email.trim());
    try {
      if (mode === 'entrar') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      } else if (mode === 'criar') {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: siteUrl() } });
        if (error) throw error;
        if (!data.session) setSent(`Enviamos um link de confirmação para ${email.trim()}. Abra o e-mail, confirme e depois entre aqui.`);
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: siteUrl() });
        if (error) throw error;
        setSent(`Se existir uma conta com ${email.trim()}, enviamos um link para criar uma nova senha.`);
      }
    } catch (err) {
      setError(authErrorPt(err instanceof Error ? err.message : String(err)));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    if (!supabase) return;
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: siteUrl() } });
    if (error) setError(authErrorPt(error.message));
  };

  if (sent) {
    return (
      <Screen>
        <Brand subtitle="Sua secretária digital" />
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <Mail className="mx-auto size-10 text-neon" aria-hidden />
          <p className="mt-3 text-[15px] leading-relaxed">{sent}</p>
          <p className="mt-2 text-xs text-white/55">Não chegou? Confira a pasta de spam.</p>
          <button type="button" onClick={() => { setSent(''); setMode('entrar'); }} className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 font-semibold hover:brightness-110">
            Voltar para entrar
          </button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <Brand subtitle={mode === 'esqueci' ? 'Vamos criar uma nova senha' : 'Organize o que você precisa fazer. Evolua no que você precisa ser.'} />
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur sm:p-6">
        {mode !== 'esqueci' && (
          <div role="tablist" aria-label="Entrar ou criar conta" className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1">
            {(
              [
                ['entrar', 'Entrar'],
                ['criar', 'Criar conta'],
              ] as const
            ).map(([id, label]) => (
              <button key={id} type="button" role="tab" aria-selected={mode === id} onClick={() => { setMode(id); setError(''); }} className={cn('h-10 rounded-lg text-sm font-semibold transition-colors', mode === id ? 'bg-primary text-white shadow' : 'text-white/65 hover:text-white')}>
                {label}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3" noValidate>
          <div>
            <label htmlFor="auth-email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/60">
              E-mail
            </label>
            <input id="auth-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" className={field} />
          </div>
          {mode !== 'esqueci' && (
            <div>
              <label htmlFor="auth-pass" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/60">
                Senha
              </label>
              <div className="relative">
                <input
                  id="auth-pass"
                  type={show ? 'text' : 'password'}
                  autoComplete={mode === 'criar' ? 'new-password' : 'current-password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'criar' ? 'Crie uma senha (mín. 6 caracteres)' : 'Sua senha'}
                  className={cn(field, 'pr-12')}
                />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-white/55 hover:text-white" aria-label={show ? 'Esconder senha' : 'Mostrar senha'}>
                  {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>
          )}

          {mode !== 'esqueci' && (
            <label className="flex cursor-pointer select-none items-center gap-2.5 pt-1 text-sm text-white/80">
              <input type="checkbox" checked={remember} onChange={(e) => setRememberState(e.target.checked)} className="size-4 cursor-pointer rounded border-white/30 bg-white/5 accent-[#E0393A]" />
              Lembrar de mim
              <span className="text-xs text-white/45">{remember ? '(continua conectado neste aparelho)' : '(sai ao fechar o navegador)'}</span>
            </label>
          )}

          {error && (
            <p role="alert" className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy || !email.trim() || (mode !== 'esqueci' && password.length < 6)} className="btn-neon inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-bold text-white disabled:opacity-50">
            {busy ? <Loader2 className="size-5 animate-spin" /> : mode === 'entrar' ? <LogIn className="size-5" /> : mode === 'criar' ? <UserPlus className="size-5" /> : <Mail className="size-5" />}
            {mode === 'entrar' ? 'Entrar' : mode === 'criar' ? 'Criar minha conta' : 'Enviar link'}
          </button>
        </form>

        {mode === 'entrar' && (
          <button type="button" onClick={() => { setMode('esqueci'); setError(''); }} className="mt-3 w-full text-center text-sm text-white/60 underline-offset-2 hover:text-white hover:underline">
            Esqueci minha senha
          </button>
        )}
        {mode === 'esqueci' && (
          <button type="button" onClick={() => { setMode('entrar'); setError(''); }} className="mt-3 w-full text-center text-sm text-white/60 hover:text-white">
            Voltar
          </button>
        )}

        {googleEnabled && mode !== 'esqueci' && (
          <>
            <div className="my-4 flex items-center gap-3 text-xs text-white/40">
              <span className="h-px flex-1 bg-white/10" /> ou <span className="h-px flex-1 bg-white/10" />
            </div>
            <button type="button" onClick={google} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-[15px] font-semibold text-navy hover:bg-white/90">
              <GoogleIcon /> Continuar com Google
            </button>
          </>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-white/45">{cloudData ? 'Seus dados ficam salvos na sua conta e aparecem em qualquer aparelho.' : 'Seus dados ficam guardados neste aparelho, separados para cada conta.'}</p>
    </Screen>
  );
}

/** Depois de clicar no link de recuperação do e-mail. */
function NewPasswordScreen({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(authErrorPt(error.message));
    toast.success('Senha atualizada!');
    onDone();
  };
  return (
    <Screen>
      <Brand subtitle="Crie sua nova senha" />
      <form onSubmit={save} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
        <label htmlFor="new-pass" className="block text-xs font-semibold uppercase tracking-wide text-white/60">
          Nova senha
        </label>
        <input id="new-pass" type="password" autoComplete="new-password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo de 6 caracteres" className={field} autoFocus />
        {error && <p role="alert" className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{error}</p>}
        <button type="submit" disabled={busy || password.length < 6} className="btn-neon inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl font-bold text-white disabled:opacity-50">
          {busy && <Loader2 className="size-5 animate-spin" />} Salvar nova senha
        </button>
      </form>
    </Screen>
  );
}

/* --------------------------------------- Portão --------------------------------------- */

/**
 * Com o Supabase configurado, só mostra o app depois do login e da sincronização.
 * Sem configuração, deixa o app como antes (sem login).
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [session, setSession] = useState<Session | null | undefined>(cloudEnabled ? undefined : null);
  const [recovery, setRecovery] = useState(false);
  const [ready, setReady] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [pending, setPending] = useState(false);
  const uid = session?.user.id ?? null;

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      setSession(s);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!cloudEnabled) return;
    if (!uid) {
      stopSync();
      setReady(false);
      setIsAdmin(false);
      setBlocked(false);
      setPending(false);
      return;
    }
    let alive = true;
    setReady(false);
    setSyncError('');
    startSync(uid)
      .then(async () => {
        // perfil na nuvem: último acesso, papel, bloqueio e nome definido pelo administrador
        const localName = readLocalDb()?.user?.name ?? '';
        const touched = await touchProfile(localName === 'Você' ? '' : localName); // 'Você' é o nome provisório
        // confirma que a resposta é desta conta; se não vier, lê o perfil direto
        const profile = touched && touched.id === uid ? touched : await getMyProfile(uid);
        if (!alive) return;
        const owner = (session?.user.email ?? '').toLowerCase() === OWNER_EMAIL;
        if (profile?.name_locked && profile.name) api.applyAdminName(profile.name);
        setIsAdmin(owner || profile?.role === 'admin');
        setBlocked(!!profile?.blocked);
        // Só entra com aprovação confirmada. Sem resposta do servidor: com internet, espera (tela "em análise");
        // sem internet, segue com o que está no aparelho para não travar quem já usava.
        if (owner) setPending(false);
        else if (profile) setPending(profile.approved === false && profile.role !== 'admin');
        else setPending(navigator.onLine);
        qc.clear();
        setReady(true);
      })
      .catch((e) => alive && setSyncError(e instanceof Error ? e.message : String(e)));
    return () => {
      alive = false;
    };
  }, [uid, attempt, qc]);

  if (!cloudEnabled) return <AuthContext.Provider value={{ email: null, isAdmin: false, signOut: async () => {} }}>{children}</AuthContext.Provider>;
  if (session === undefined) return <Splash text="Abrindo a Rutte…" />;
  if (recovery && session) return <NewPasswordScreen onDone={() => setRecovery(false)} />;
  if (!session) return <LoginScreen />;
  if (syncError)
    return (
      <Screen>
        <Brand subtitle="Não consegui carregar seus dados" />
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-sm text-white/80">{syncError}</p>
          <div className="mt-5 flex justify-center gap-2">
            <button type="button" onClick={() => setAttempt((a) => a + 1)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-semibold">
              <RefreshCw className="size-4" /> Tentar de novo
            </button>
            <button type="button" onClick={() => supabase?.auth.signOut()} className="inline-flex h-11 items-center rounded-xl border border-white/15 px-5 font-semibold text-white/80">
              Sair
            </button>
          </div>
        </div>
      </Screen>
    );
  if (!ready) return <Splash text="Carregando seus dados…" />;
  if (pending)
    return (
      <Screen>
        <Brand subtitle="Cadastro em análise" />
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <Hourglass className="mx-auto size-10 text-neon" aria-hidden />
          <p className="mt-3 text-[15px] leading-relaxed">Recebemos seu pedido de acesso com <strong>{session.user.email}</strong>.</p>
          <p className="mt-2 text-sm text-white/70">Assim que o administrador aprovar, é só voltar aqui e entrar. Você não precisa se cadastrar de novo.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => setAttempt((a) => a + 1)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-semibold hover:brightness-110">
              <RefreshCw className="size-4" aria-hidden /> Já fui aprovado
            </button>
            <button type="button" onClick={() => supabase?.auth.signOut()} className="inline-flex h-11 items-center rounded-xl border border-white/15 px-5 font-semibold text-white/80">
              Sair
            </button>
          </div>
        </div>
      </Screen>
    );
  if (blocked)
    return (
      <Screen>
        <Brand subtitle="Acesso bloqueado" />
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-sm text-white/80">Esta conta foi bloqueada pelo administrador da Rutte. Se acha que é um engano, fale com quem te convidou.</p>
          <button type="button" onClick={() => supabase?.auth.signOut()} className="mt-5 inline-flex h-11 items-center rounded-xl bg-primary px-5 font-semibold">
            Sair
          </button>
        </div>
      </Screen>
    );

  const signOut = async () => {
    await flushSync();
    await supabase?.auth.signOut();
    qc.clear();
  };
  return <AuthContext.Provider value={{ email: session.user.email ?? null, isAdmin, signOut }}>{children}</AuthContext.Provider>;
}
