import { create } from 'zustand';
import { Button } from './button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './sheet';

/**
 * Confirmação dentro do próprio app (substitui window.confirm, que não aparece
 * em muitos leitores de HTML do iPhone e em páginas embutidas).
 */
interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  resolve?: (ok: boolean) => void;
}

const useConfirmStore = create<ConfirmState>(() => ({ open: false, title: '' }));

export function askConfirm(opts: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    useConfirmStore.getState().resolve?.(false);
    useConfirmStore.setState({ ...opts, open: true, resolve });
  });
}

function settle(ok: boolean) {
  const { resolve } = useConfirmStore.getState();
  useConfirmStore.setState({ open: false, resolve: undefined });
  resolve?.(ok);
}

export function ConfirmHost() {
  const { open, title, message, confirmLabel, danger } = useConfirmStore();
  return (
    <Dialog open={open} onOpenChange={(o) => !o && settle(false)}>
      <DialogContent>
        <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
        {message && <DialogDescription className="mt-2 text-sm text-foreground/70">{message}</DialogDescription>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => settle(false)}>
            Cancelar
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={() => settle(true)} autoFocus>
            {confirmLabel ?? 'Confirmar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
