export const TONES = [
  'neutral',
  'primary',
  'success',
  'warning',
  'urgent',
  'danger',
  'info',
] as const;
export type Tone = (typeof TONES)[number];

export const softTone: Record<Tone, string> = {
  neutral: 'bg-surface-muted text-fg-muted',
  primary: 'bg-primary-tint text-primary-press dark:text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  urgent: 'bg-urgent-soft text-urgent',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
};

export const solidTone: Record<Tone, string> = {
  neutral: 'bg-fg text-bg',
  primary: 'bg-primary text-primary-fg',
  success: 'bg-success text-bg',
  warning: 'bg-warning text-bg',
  urgent: 'bg-urgent text-bg',
  danger: 'bg-danger text-bg',
  info: 'bg-info text-bg',
};

export const fillTone: Record<Tone, string> = {
  neutral: 'bg-fg-faint',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  urgent: 'bg-urgent',
  danger: 'bg-danger',
  info: 'bg-info',
};

export const textTone: Record<Tone, string> = {
  neutral: 'text-fg-muted',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  urgent: 'text-urgent',
  danger: 'text-danger',
  info: 'text-info',
};
