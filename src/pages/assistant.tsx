import { CheckCircle2, CircleAlert, KeyRound, SendHorizontal, Sparkles, Square, Trash2 } from 'lucide-react';
import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RutteLogo } from '@/components/brand/rutte';
import { AiKeyDialog } from '@/components/layout/ai-key-dialog';
import { Button } from '@/components/ui/button';
import { askConfirm } from '@/components/ui/confirm';
import { useUser } from '@/hooks/use-data';
import { AI_MODELS, AiError, chat, getAiKey, getAiModel, PERSONAS, QUICK_PROMPTS, type ApiMessage } from '@/lib/ai';
import { firstName } from '@/lib/onboarding';
import { cn } from '@/lib/utils';
import { useChat } from '@/store/chat';

/* ------------------------- Markdown simples (negrito e listas) ------------------------- */

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>,
  );
}

function RichText({ text }: { text: string }) {
  const lines = text.split('\n');
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      out.push(
        <ul key={`l${out.length}`} className="my-1 list-disc space-y-0.5 pl-5">
          {list.map((l, i) => (
            <li key={i}>{inline(l)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };
  lines.forEach((raw) => {
    const line = raw.trimEnd();
    const m = line.match(/^\s*(?:[-•*]|\d+[.)])\s+(.*)$/);
    if (m) {
      list.push(m[1]);
      return;
    }
    flush();
    if (!line.trim()) return;
    const h = line.match(/^#{1,4}\s+(.*)$/);
    out.push(
      h ? (
        <p key={`p${out.length}`} className="mt-1 font-bold">
          {inline(h[1])}
        </p>
      ) : (
        <p key={`p${out.length}`}>{inline(line)}</p>
      ),
    );
  });
  flush();
  return <div className="space-y-1.5 leading-relaxed">{out}</div>;
}

/* -------------------------------------- Página -------------------------------------- */

export function AssistantPage() {
  const { items, history, persona, setPersona, push, patch, remove, addHistory, clear } = useChat();
  const { data: user } = useUser();
  const qc = useQueryClient();
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [keyOpen, setKeyOpen] = useState(false);
  const [hasKey, setHasKey] = useState(() => !!getAiKey());
  const abort = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const model = AI_MODELS.find((m) => m.id === getAiModel());

  useEffect(() => {
    const sync = () => setHasKey(!!getAiKey());
    window.addEventListener('rutte:ai-key', sync);
    return () => window.removeEventListener('rutte:ai-key', sync);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [items]);

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || busy) return;
    if (!getAiKey()) {
      setKeyOpen(true);
      return;
    }
    setInput('');
    push({ kind: 'user', text: msg });
    const userMsg: ApiMessage = { role: 'user', content: [{ type: 'text', text: msg }] };
    const ctrl = new AbortController();
    abort.current = ctrl;
    setBusy(true);
    let bubble = push({ kind: 'assistant', text: '' });
    let acc = '';
    let touched = false;
    try {
      const added = await chat([...history, userMsg], persona, ctrl.signal, {
        onText: (t) => {
          acc += t;
          patch(bubble, acc);
        },
        onTool: (summary, ok) => {
          touched = true;
          if (!acc) remove(bubble);
          push({ kind: 'tool', text: summary, ok });
        },
        onRound: () => {
          // nova rodada de resposta depois das ferramentas: novo balão
          acc = '';
          bubble = push({ kind: 'assistant', text: '' });
        },
      });
      addHistory([userMsg, ...added]);
      if (!acc) remove(bubble);
    } catch (e) {
      if (!acc) remove(bubble);
      if ((e as Error).name !== 'AbortError') {
        push({ kind: 'error', text: e instanceof AiError ? e.message : 'Algo deu errado ao falar com a Claude.' });
        if (e instanceof AiError && e.status === 401) setKeyOpen(true);
      }
    } finally {
      setBusy(false);
      abort.current = null;
      if (touched) qc.invalidateQueries({ queryKey: ['tasks'] });
    }
  };

  const nick = user ? firstName(user.name) : '';

  return (
    <div className="mx-auto flex h-[calc(100dvh-9.5rem)] max-w-3xl flex-col md:h-[calc(100dvh-7rem)]">
      <header className="flex flex-wrap items-center gap-2 pb-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Sparkles className="size-6 text-primary" aria-hidden /> Rutte IA
        </h1>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setKeyOpen(true)} title="Chave e modelo">
            <KeyRound /> {hasKey ? (model?.label.split(' (')[0] ?? 'Configurar') : 'Configurar'}
          </Button>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={async () => (await askConfirm({ title: 'Apagar a conversa?', message: 'O histórico da conversa será apagado deste aparelho. Seus afazeres não mudam.', confirmLabel: 'Apagar', danger: true })) && clear()}
            >
              <Trash2 /> Limpar
            </Button>
          )}
        </div>
        <div role="radiogroup" aria-label="Personalidade da Rutte" className="flex w-full gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none]">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={persona === p.id}
              onClick={() => setPersona(p.id)}
              className={cn('h-8 shrink-0 rounded-full border px-3 text-xs font-semibold transition-colors', persona === p.id ? 'border-primary bg-primary text-white' : 'border-border bg-card hover:bg-muted')}
            >
              {p.emoji} {p.label}
            </button>
          ))}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-border bg-card p-3 sm:p-4" aria-live="polite">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <RutteLogo className="size-14" />
            <div>
              <p className="text-lg font-bold">{nick ? `Oi, ${nick}! ` : 'Oi! '}Eu sou a Rutte.</p>
              <p className="mx-auto max-w-md text-sm text-foreground/65">
                Conheço seus afazeres, metas, treinos e a sua Roda da Vida. Peça um resumo do dia, um plano para a semana ou diga “me lembra de pagar a conta amanhã” que eu crio o afazer.
              </p>
            </div>
            {!hasKey && (
              <Button onClick={() => setKeyOpen(true)}>
                <KeyRound /> Ativar com minha chave da Claude
              </Button>
            )}
            <div className="flex max-w-xl flex-wrap justify-center gap-1.5">
              {QUICK_PROMPTS.map((q) => (
                <button key={q.label} type="button" onClick={() => send(q.text)} disabled={busy} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium hover:border-primary hover:bg-primary/5">
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ol className="space-y-3">
            {items.map((m) => (
              <li key={m.id} className={cn('flex', m.kind === 'user' ? 'justify-end' : 'justify-start')}>
                {m.kind === 'tool' ? (
                  <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', m.ok ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/15 text-amber-700 dark:text-amber-300')}>
                    {m.ok ? <CheckCircle2 className="size-3.5" aria-hidden /> : <CircleAlert className="size-3.5" aria-hidden />} {m.text}
                  </span>
                ) : m.kind === 'error' ? (
                  <div className="flex max-w-[85%] items-start gap-2 rounded-2xl border border-brand/30 bg-brand/10 px-3.5 py-2.5 text-sm">
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden /> {m.text}
                  </div>
                ) : (
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm',
                      m.kind === 'user' ? 'rounded-br-md bg-primary text-white' : 'rounded-bl-md bg-muted text-foreground',
                    )}
                  >
                    {m.kind === 'assistant' ? (
                      m.text ? (
                        <RichText text={m.text} />
                      ) : (
                        <span className="inline-flex gap-1" aria-label="A Rutte está pensando">
                          {[0, 1, 2].map((i) => (
                            <span key={i} className="size-1.5 animate-bounce rounded-full bg-foreground/40" style={{ animationDelay: `${i * 120}ms` }} />
                          ))}
                        </span>
                      )
                    ) : (
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
        <div ref={endRef} />
      </div>

      {items.length > 0 && (
        <div className="-mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none]">
          {QUICK_PROMPTS.slice(0, 4).map((q) => (
            <button key={q.label} type="button" onClick={() => send(q.text)} disabled={busy} className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium hover:border-primary disabled:opacity-50">
              {q.label}
            </button>
          ))}
        </div>
      )}

      <form
        className="mt-2 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          Mensagem para a Rutte
        </label>
        <textarea
          id="chat-input"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder={hasKey ? 'Escreva para a Rutte… (ex.: crie um afazer para ligar pro dentista amanhã às 10h)' : 'Configure sua chave da Claude para conversar'}
          className="max-h-40 min-h-[44px] flex-1 resize-none rounded-2xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        {busy ? (
          <Button type="button" variant="outline" className="h-11 rounded-2xl" onClick={() => abort.current?.abort()} aria-label="Parar resposta">
            <Square /> Parar
          </Button>
        ) : (
          <Button type="submit" className="h-11 rounded-2xl" disabled={!input.trim()} aria-label="Enviar">
            <SendHorizontal />
          </Button>
        )}
      </form>
      <p className="mt-1 text-center text-[11px] text-foreground/45">A Rutte IA pode errar. Confira datas e informações importantes.</p>

      <AiKeyDialog open={keyOpen} onOpenChange={setKeyOpen} />
    </div>
  );
}
