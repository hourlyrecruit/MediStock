import { useRef, useState } from 'react';
import { CheckCircle2, CircleAlert, Info, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/cn';
import type { ToastItem, ToastKind } from './store';
import { useToastTimer } from './useToastTimer';

const icons: Record<ToastKind, { icon: LucideIcon; className: string }> = {
  success: { icon: CheckCircle2, className: 'text-success' },
  error: { icon: CircleAlert, className: 'text-danger' },
  info: { icon: Info, className: 'text-info' },
};

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export function ToastCard({ toast, onDismiss }: ToastCardProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const dismiss = () => onDismiss(toast.id);
  useToastTimer(toast.duration, hovered || focused, dismiss, progressRef);
  const { icon: Icon, className } = icons[toast.kind];

  return (
    <div
      role={toast.kind === 'error' ? 'alert' : 'status'}
      aria-atomic="true"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="border-border-subtle bg-surface shadow-raised relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4 pr-3"
    >
      <Icon aria-hidden className={cn('mt-0.5 size-5 shrink-0', className)} strokeWidth={1.75} />
      <div className="min-w-0 flex-1">
        <p className="text-fg text-sm font-medium">{toast.message}</p>
        {toast.description && <p className="text-fg-muted mt-0.5 text-sm">{toast.description}</p>}
      </div>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            dismiss();
          }}
          className="focus-ring text-primary hover:bg-primary-tint -my-1 h-8 shrink-0 rounded-sm px-2.5 text-sm font-medium transition-colors active:scale-[0.97] pointer-coarse:h-11"
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={dismiss}
        className="focus-ring text-fg-faint hover:bg-surface-muted hover:text-fg -my-1 grid size-8 shrink-0 place-items-center rounded-sm transition-colors active:scale-[0.97] pointer-coarse:size-11"
      >
        <X aria-hidden className="size-4" />
      </button>
      {toast.action && (
        <div
          ref={progressRef}
          aria-hidden
          className="bg-primary/60 absolute inset-x-0 bottom-0 h-0.5 origin-left"
        />
      )}
    </div>
  );
}
