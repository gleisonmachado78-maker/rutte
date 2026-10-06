import { ExternalLink, KeyRound, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/form-controls';
import { PanelFrame, PDesc, PTitle, type PanelProps } from './panel-frame';
import { getMapsKey, setMapsKey } from '@/lib/maps';

/** Onde a pessoa cola a própria chave do Google Maps (fica só neste navegador). */
export function MapsKeyDialog({ open = true, onOpenChange = () => {}, inline }: PanelProps) {
  const [value, setValue] = useState('');
  const current = getMapsKey();

  useEffect(() => {
    if (open) setValue('');
  }, [open]);

  const save = () => {
    const k = value.trim();
    if (!/^AIza[0-9A-Za-z_-]{30,}$/.test(k)) {
      toast.error('Essa não parece uma chave do Google Maps', { description: 'Ela começa com “AIza” e tem cerca de 39 caracteres.' });
      return;
    }
    setMapsKey(k);
    toast.success('Chave do Google Maps salva', { description: 'Abra um afazer e use o campo “Local do compromisso”.' });
    onOpenChange(false);
  };

  return (
    <PanelFrame inline={inline} open={open} onOpenChange={onOpenChange}>
        <PTitle className="flex items-center gap-2 text-lg font-bold">
          <KeyRound className="size-5 text-primary" aria-hidden /> Google Maps
        </PTitle>
        <PDesc className="mt-1 text-sm text-foreground/70">
          Com a sua chave, o campo de local sugere endereços enquanto você digita e mostra o mapa. Sem ela, você digita o endereço e os botões “Como chegar” continuam funcionando.
        </PDesc>

        <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm text-foreground/80">
          <li>
            Entre no{' '}
            <a href="https://console.cloud.google.com/google/maps-apis/start" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline">
              Google Cloud Console <ExternalLink className="size-3" aria-hidden />
            </a>{' '}
            e crie (ou escolha) um projeto.
          </li>
          <li>
            Ative <strong>Maps JavaScript API</strong> e <strong>Places API (New)</strong>.
          </li>
          <li>Em “Credenciais”, crie uma <strong>chave de API</strong> e, em restrições, limite-a a essas duas APIs.</li>
          <li>Copie a chave (começa com “AIza…”) e cole abaixo.</li>
        </ol>
        <p className="mt-2 text-xs text-foreground/55">
          O Google cobra por uso acima de uma cota gratuita mensal; confira os valores no console. Restringir por site (domínio) é mais seguro quando a Rutte estiver hospedada; no arquivo HTML aberto direto do aparelho, use só a restrição por API.
        </p>

        <div className="mt-4">
          <Label htmlFor="maps-key">Sua chave</Label>
          <Input
            id="maps-key"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            placeholder={current ? 'Chave já salva — cole uma nova para trocar' : 'AIza…'}
          />
          {current && <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">Chave configurada neste navegador (termina em …{current.slice(-4)}).</p>}
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {current && (
            <Button
              variant="ghost"
              className="mr-auto text-brand"
              onClick={() => {
                setMapsKey('');
                toast('Chave removida');
                onOpenChange(false);
              }}
            >
              <Trash2 /> Remover chave
            </Button>
          )}
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={!value.trim()}>
            Salvar chave
          </Button>
        </div>
      </PanelFrame>
  );
}
