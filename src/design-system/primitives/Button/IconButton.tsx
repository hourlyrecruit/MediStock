import type { ReactNode } from 'react';
import { m } from 'framer-motion';
import { cn } from '@/shared/cn';
import { Spinner } from '../Spinner';
import { pressMotion, type NativeButtonProps } from './Button';
import {
  buttonBase,
  buttonVariants,
  iconButtonSizes,
  iconSizes,
  type ButtonSize,
  type ButtonVariant,
} from './styles';

export interface IconButtonProps extends Omit<NativeButtonProps, 'children' | 'aria-label'> {
  'aria-label': string;
  icon: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  round?: boolean;
}

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  loading = false,
  round = false,
  disabled,
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  const inactive = disabled || loading;
  return (
    <m.button
      {...props}
      {...(inactive ? {} : pressMotion)}
      type={type}
      disabled={inactive}
      aria-busy={loading || undefined}
      className={cn(
        buttonBase,
        buttonVariants[variant],
        iconButtonSizes[size],
        'p-0',
        round && 'rounded-full',
        className,
      )}
    >
      {loading ? (
        <Spinner size={iconSizes[size]} />
      ) : (
        <span aria-hidden className="inline-flex">
          {icon}
        </span>
      )}
    </m.button>
  );
}
