import { CheckCircle2, CircleAlert, ExternalLink, Loader2, PlugZap, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/form-controls';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/sheet';
import {
  AI_MODELS,
  getAiKey,
  getAiModel,
  getAiWeb,
  getProvider,
  looksLikeAnthropicKey,
  setAiKey,
  setAiModel,
  setAiWeb,
  setProvider,
  type AiProvider,
} from '@/lib/ai';
import { cleanKey, GEMINI_MODELS, getGeminiKey, getGeminiModel, looksLikeGeminiKey, setGeminiKey, setGeminiModel, testGeminiKey } from '@/lib/ai-gemini';
import { cn } from '@/lib/utils';

const LINK = 'inline-flex items-center gap-0.5 font-medium text-primary hover:underline';

/** Escolha do provedor (Gemini grátis ou Claude), chave (fica só neste navegador), modelo e pesquisa na web. */
export function AiKeyDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [provider, setProv] = useState<AiProvider>(getProvider());
  const [value, setValue] = useState('');
  const [model, setModel] = useState('');
  const [web, setWeb] = useState(getAiWeb());
  const [testing, setTesting] = useState(false);
  const [test, setTest] = useState<{ ok: boolean; text: string } | null>(null);

  const isGemini = provider === 'gemini';
  const current = isGemini ? getGeminiKey() : getAiKey();
  const models = isGemini ? GEMINI_MODELS : AI_MODELS;

  useEffect(() => {
    if (open) {
      const p = getProvider();
      setProv(p);
      setValue('');
      setModel(p === 'gemini' ? getGeminiModel() : getAiModel());
      setWeb(getAiWeb());
      setTest(null);
    }
  }, [open]);

  const pick = (p: AiProvider) => {
    setProv(p);
    setValue('');
    setTest(null);
    setModel(p === 'gemini' ? getGeminiModel() : getAiModel());
  };

  /** Testa a chave do Gemini com o Google; devolve o modelo escolhido (ou null se falhou). */
  const runTest = async (k: string) => {
    setTesting(true);
    setTest(null);
    try {
      const r = await testGeminiKey(k, model);
      if (r.model !== model) setModel(r.model);
      const label = GEMINI_MODELS.find((m) => m.id === r.model)?.label ?? r.model;
      setTest({ ok: true, text: `Chave funcionando! Modelo: ${label}.` });
      return r.model;
    } catch (e) {
      setTest({ ok: false, text: e instanceof Error ? e.message : 'Não foi possível testar a chave.' });
      return null;
    } finally {
      setTesting(false);
    }
  };

  const save = async () => {
    const k = isGemini ? cleanKey(value) : value.trim();
    if (k && !(isGemini ? looksLikeGeminiKey(k) : looksLikeAnthropicKey(k))) {
      toast.error(isGemini ? 'Essa não parece uma chave do Gemini' : 'Essa não parece uma chave da Claude', {
        description: isGemini ? 'Copie a chave inteira no AI Studio (sem espaços) e cole de novo.' : 'Ela começa com “sk-ant-”.',
      });
      return;
    }
    if (!k && !current) {
      toast.error('Cole sua chave para ativar a Rutte IA');
      return;
    }
    let chosen = model;
    if (isGemini) {
      const ok = await runTest(k || current);
      if (!ok) return;
      chosen = ok;
    }
    if (k) (isGemini ? setGeminiKey : setAiKey)(k);
    (isGemini ? setGeminiModel : setAiModel)(chosen);
    setAiWeb(web);
    setProvider(provider);
    toast.success(`Rutte IA pronta com ${isGemini ? 'Gemini' : 'Claude'}`, { description: 'Abra “Rutte IA” no menu e comece a conversar.' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
        <DialogTitle className="flex items-center gap-2 text-lg font-bold">
          <Sparkles className="size-5 text-primary" aria-hidden /> Rutte IA
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm text-foreground/70">
          Escolha qual inteligência artificial a Rutte usa para conversar, entender seus dados e criar afazeres por você.
        </DialogDescription>

        <div role="radiogroup" aria-label="Provedor de IA" className="mt-4 grid grid-cols-2 gap-2">
          {(
            [
              ['gemini', 'Gemini', 'Google · tem plano grátis'],
              ['claude', 'Claude', 'Anthropic · pago por uso'],
            ] as const
          ).map(([id, label, hint]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={provider === id}
              onClick={() => pick(id)}
              className={cn('rounded-xl border p-3 text-left transition-colors', provider === id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-muted')}
            >
              <span className="block font-semibold">{label}</span>
              <span className="block text-xs text-foreground/60">{hint}</span>
              {(id === 'gemini' ? getGeminiKey() : getAiKey()) && <span className="mt-1 block text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Chave salva</span>}
            </button>
          ))}
        </div>

        {isGemini ? (
          <>
            <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm text-foreground/80">
              <li>
                Entre no{' '}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className={LINK}>
                  Google AI Studio <ExternalLink className="size-3" aria-hidden />
                </a>{' '}
                com a sua conta Google.
              </li>
              <li>Clique em “Create API key” (criar chave). Não precisa de cartão de crédito para o plano gratuito.</li>
              <li>Copie a chave (começa com “AIza…”) e cole abaixo.</li>
            </ol>
            <p className="mt-2 rounded-lg bg-amber-500/10 p-2.5 text-xs leading-snug text-foreground/75">
              <strong>Plano grátis:</strong> tem limite de pedidos por minuto e por dia (suficiente para uso pessoal). No plano gratuito, o Google pode usar o que for enviado — suas mensagens e o resumo dos seus dados — para melhorar os produtos dele. Se preferir mais privacidade, ative o faturamento no AI Studio ou use a Claude.
            </p>
          </>
        ) : (
          <>
            <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm text-foreground/80">
              <li>
                Entre no{' '}
                <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className={LINK}>
                  Console da Anthropic <ExternalLink className="size-3" aria-hidden />
                </a>{' '}
                e faça login (ou crie uma conta).
              </li>
              <li>Em “Billing”, adicione créditos (a cobrança é por uso; uma conversa curta custa centavos).</li>
              <li>Em “API Keys”, crie uma chave e copie (começa com “sk-ant-…”).</li>
            </ol>
          </>
        )}
        <p className="mt-2 text-xs leading-snug text-foreground/55">
          A chave fica salva só neste navegador. Quando você conversa, a Rutte envia sua mensagem e um resumo dos seus dados (afazeres, metas, treinos, Roda da Vida) para {isGemini ? 'o Google' : 'a Anthropic'}. Não compartilhe este arquivo com a chave salva.
        </p>

        <div className="mt-4">
          <Label htmlFor="ai-key">Sua chave {isGemini ? 'do Gemini' : 'da Claude'}</Label>
          <Input
            id="ai-key"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            placeholder={current ? 'Chave já salva — cole uma nova para trocar' : isGemini ? 'AIza…' : 'sk-ant-…'}
          />
          {current && <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">Chave configurada neste navegador (termina em …{current.slice(-4)}).</p>}
          {isGemini && (
            <Button type="button" variant="outline" size="sm" className="mt-2" disabled={testing || (!value.trim() && !current)} onClick={() => runTest(value.trim() ? value : current)}>
              {testing ? <Loader2 className="animate-spin" /> : <PlugZap />} {testing ? 'Testando…' : 'Testar chave'}
            </Button>
          )}
          {test && (
            <p role="status" className={cn('mt-2 flex items-start gap-1.5 rounded-lg p-2 text-xs leading-snug', test.ok ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-brand/10 text-foreground')}>
              {test.ok ? <CheckCircle2 className="mt-px size-4 shrink-0" aria-hidden /> : <CircleAlert className="mt-px size-4 shrink-0 text-brand" aria-hidden />}
              {test.text}
            </p>
          )}
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-medium">Modelo</legend>
          <div className="mt-1.5 grid gap-1.5">
            {models.map((m) => (
              <label key={m.id} className={cn('flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 text-sm', model === m.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted')}>
                <input type="radio" name="ai-model" value={m.id} checked={model === m.id} onChange={() => setModel(m.id)} className="mt-0.5 accent-[rgb(var(--primary))]" />
                <span>
                  <span className="block font-medium">{m.label}</span>
                  <span className="block text-xs text-foreground/60">{m.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-lg border border-border p-2.5 text-sm">
          <input type="checkbox" checked={web} onChange={(e) => setWeb(e.target.checked)} className="mt-0.5 size-4 accent-[rgb(var(--primary))]" />
          <span>
            <span className="block font-medium">Permitir pesquisas na web</span>
            <span className="block text-xs leading-snug text-foreground/60">
              {isGemini
                ? 'A Rutte pesquisa no Google quando precisar de informação atual e mostra as fontes. Conta dentro da cota grátis do Gemini (com limite diário próprio).'
                : 'A Rutte pesquisa na internet quando precisar de informação atual e mostra as fontes. A Anthropic cobra à parte (cerca de US$ 10 a cada 1.000 pesquisas). Se der erro, ative “Web search” em Settings → Privacy no console da Anthropic.'}
            </span>
          </span>
        </label>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {current && (
            <Button
              variant="ghost"
              className="mr-auto text-brand"
              onClick={() => {
                (isGemini ? setGeminiKey : setAiKey)('');
                toast('Chave removida');
                onOpenChange(false);
              }}
            >
              <Trash2 /> Remover chave
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={testing}>
            {testing && <Loader2 className="animate-spin" />} Salvar e usar {isGemini ? 'Gemini' : 'Claude'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
