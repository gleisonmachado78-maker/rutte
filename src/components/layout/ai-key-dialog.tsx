import { ExternalLink, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/form-controls';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/sheet';
import { AI_MODELS, getAiKey, getAiModel, looksLikeAnthropicKey, setAiKey, setAiModel } from '@/lib/ai';
import { cn } from '@/lib/utils';

/** Onde a pessoa cola a própria chave da Claude (fica só neste navegador) e escolhe o modelo. */
export function AiKeyDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [value, setValue] = useState('');
  const [model, setModel] = useState(getAiModel());
  const current = getAiKey();

  useEffect(() => {
    if (open) {
      setValue('');
      setModel(getAiModel());
    }
  }, [open]);

  const save = () => {
    const k = value.trim();
    if (k && !looksLikeAnthropicKey(k)) {
      toast.error('Essa não parece uma chave da Claude', { description: 'Ela começa com “sk-ant-”.' });
      return;
    }
    if (!k && !current) {
      toast.error('Cole sua chave para ativar a Rutte IA');
      return;
    }
    if (k) setAiKey(k);
    setAiModel(model);
    toast.success('Rutte IA pronta', { description: 'Abra “Rutte IA” no menu e comece a conversar.' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
        <DialogTitle className="flex items-center gap-2 text-lg font-bold">
          <Sparkles className="size-5 text-primary" aria-hidden /> Rutte IA (Claude)
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm text-foreground/70">
          Com a sua chave da Claude, a Rutte conversa com você, entende seus afazeres, metas e treinos, e cria afazeres por você.
        </DialogDescription>

        <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm text-foreground/80">
          <li>
            Entre no{' '}
            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline">
              Console da Anthropic <ExternalLink className="size-3" aria-hidden />
            </a>{' '}
            e faça login (ou crie uma conta).
          </li>
          <li>Em “Billing”, adicione créditos (a cobrança é por uso; uma conversa curta custa centavos).</li>
          <li>Em “API Keys”, crie uma chave e copie (começa com “sk-ant-…”).</li>
        </ol>
        <p className="mt-2 text-xs leading-snug text-foreground/55">
          A chave fica salva só neste navegador. Quando você conversa, a Rutte envia para a Anthropic sua mensagem e um resumo dos seus dados (afazeres, metas, treinos, Roda da Vida) para a IA poder te ajudar. Use uma chave só sua e não compartilhe este arquivo com a chave salva.
        </p>

        <div className="mt-4">
          <Label htmlFor="ai-key">Sua chave</Label>
          <Input
            id="ai-key"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            placeholder={current ? 'Chave já salva — cole uma nova para trocar' : 'sk-ant-…'}
          />
          {current && <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">Chave configurada neste navegador (termina em …{current.slice(-4)}).</p>}
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-medium">Modelo</legend>
          <div className="mt-1.5 grid gap-1.5">
            {AI_MODELS.map((m) => (
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

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {current && (
            <Button
              variant="ghost"
              className="mr-auto text-brand"
              onClick={() => {
                setAiKey('');
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
          <Button onClick={save}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
