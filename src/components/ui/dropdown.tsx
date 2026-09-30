import * as DM from '@radix-ui/react-dropdown-menu';
import { Check } from 'lucide-react';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

export const DropdownMenu = DM.Root;
export const DropdownMenuTrigger = DM.Trigger;
export const DropdownMenuLabel = ({ className, ...p }: ComponentPropsWithoutRef<typeof DM.Label>) => (
  <DM.Label className={cn('px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/50', className)} {...p} />
);
export const DropdownMenuSeparator = () => <DM.Separator className="my-1 h-px bg-border" />;

export function DropdownMenuContent({ className, align = 'start', ...props }: ComponentPropsWithoutRef<typeof DM.Content>) {
  return (
    <DM.Portal>
      <DM.Content
        align={align}
        sideOffset={6}
        className={cn(
          'z-50 min-w-[12rem] max-h-[60vh] overflow-y-auto rounded-xl border border-border bg-background p-1 shadow-xl data-[state=open]:animate-zoom-in',
          className,
        )}
        {...props}
      />
    </DM.Portal>
  );
}

const itemCls =
  'relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-2 text-sm outline-none transition-colors data-[highlighted]:bg-muted data-[disabled]:opacity-50';

export function DropdownMenuItem({ className, ...props }: ComponentPropsWithoutRef<typeof DM.Item>) {
  return <DM.Item className={cn(itemCls, '[&_svg]:size-4', className)} {...props} />;
}

export function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof DM.CheckboxItem>) {
  return (
    <DM.CheckboxItem
      className={cn(itemCls, 'pl-8', className)}
      onSelect={(e) => e.preventDefault()}
      {...props}
    >
      <span className="absolute left-2 grid size-4 place-items-center rounded border border-foreground/30 data-[state=checked]:border-primary">
        <DM.ItemIndicator>
          <Check className="size-3 text-primary" strokeWidth={3} />
        </DM.ItemIndicator>
      </span>
      {children}
    </DM.CheckboxItem>
  );
}
