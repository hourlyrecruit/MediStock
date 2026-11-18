import type { ComponentProps, ReactNode } from 'react';
import { m } from 'framer-motion';
import { cn } from '@/shared/cn';
import { springs } from '../../motion/tokens';
import { Spinner } from '../Spinner';
import {
  buttonBase,
  buttonSizes,
  buttonVariants,
  iconSizes,
  type ButtonSize,
  type ButtonVariant,
} from './styles';

export type NativeButtonProps = Omit<
  ComponentProps<'button'>,
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'
>;

export interface ButtonProps extends NativeButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
}

export const pressMotion = { whileTap: { scale: 0.97 }, transition: springs.snappy };

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leadingIcon,
  trailingIcon,
  fullWidth,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
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
        buttonSizes[size],
        fullWidth && 'w-full',
        className,
      )}
    >
      <span className={cn('inline-flex items-center gap-2', loading && 'invisible')}>
        {leadingIcon && (
          <span aria-hidden className="inline-flex shrink-0">
            {leadingIcon}
          </span>
        )}
        {children}
        {trailingIcon && (
          <span aria-hidden className="nudge inline-flex shrink-0">
            {trailingIcon}
          </span>
        )}
      </span>
      {loading && (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner size={iconSizes[size]} />
        </span>
      )}
    </m.button>
  );
}
