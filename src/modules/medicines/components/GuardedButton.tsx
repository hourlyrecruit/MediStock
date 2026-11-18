import { Button, Tooltip, type ButtonProps } from '@/design-system';
import { cn } from '@/shared/cn';

interface GuardedButtonProps extends ButtonProps {
  blockedReason?: string;
}

export function GuardedButton({ blockedReason, onClick, className, ...props }: GuardedButtonProps) {
  if (!blockedReason) return <Button {...props} onClick={onClick} className={className} />;
  return (
    <Tooltip content={blockedReason}>
      <Button
        {...props}
        aria-disabled
        onClick={(event) => event.preventDefault()}
        className={cn('cursor-not-allowed opacity-50', className)}
      />
    </Tooltip>
  );
}
