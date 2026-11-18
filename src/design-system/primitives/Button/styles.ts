export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle';
export type ButtonSize = 'sm' | 'md' | 'lg';

export const buttonBase =
  'group focus-ring relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-[background-color,border-color,color,box-shadow,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-progress';

export const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-fg shadow-xs hover:bg-primary-hover active:bg-primary-press disabled:hover:bg-primary',
  secondary:
    'border border-border-subtle bg-surface text-fg shadow-xs hover:border-border-strong hover:bg-surface-muted disabled:hover:bg-surface',
  ghost: 'text-fg-muted hover:bg-surface-muted hover:text-fg disabled:hover:bg-transparent',
  danger: 'bg-danger text-bg hover:bg-danger/90 active:bg-danger disabled:hover:bg-danger',
  subtle:
    'bg-primary-tint text-primary-press hover:bg-primary/15 dark:text-primary disabled:hover:bg-primary-tint',
};

export const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm pointer-coarse:h-11',
  md: 'h-10 px-4 text-sm pointer-coarse:h-11',
  lg: 'h-12 px-5 text-base',
};

export const iconButtonSizes: Record<ButtonSize, string> = {
  sm: 'size-9 pointer-coarse:size-11',
  md: 'size-10 pointer-coarse:size-11',
  lg: 'size-12',
};

export const iconSizes: Record<ButtonSize, number> = { sm: 16, md: 16, lg: 20 };
