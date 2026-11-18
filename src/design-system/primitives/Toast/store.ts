import { create } from 'zustand';

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  description?: string;
  action?: ToastAction;
  duration?: number;
  id?: string;
}

export interface ToastItem {
  id: string;
  kind: ToastKind;
  message: string;
  description?: string;
  action?: ToastAction;
  duration: number;
}

interface ToastState {
  toasts: ToastItem[];
  push: (toast: ToastItem) => void;
  dismiss: (id?: string) => void;
}

export const MAX_VISIBLE_TOASTS = 4;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) =>
    set((state) => ({ toasts: [toast, ...state.toasts.filter((item) => item.id !== toast.id)] })),
  dismiss: (id) =>
    set((state) => ({ toasts: id ? state.toasts.filter((item) => item.id !== id) : [] })),
}));

let counter = 0;

function defaultDuration(kind: ToastKind, options: ToastOptions) {
  if (options.duration !== undefined) return options.duration;
  if (options.action) return 6000;
  return kind === 'error' ? 6000 : 4000;
}

function show(kind: ToastKind, message: string, options: ToastOptions = {}) {
  counter += 1;
  const id = options.id ?? `toast-${counter}`;
  useToastStore.getState().push({
    id,
    kind,
    message,
    description: options.description,
    action: options.action,
    duration: defaultDuration(kind, options),
  });
  return id;
}

export const toast = {
  success: (message: string, options?: ToastOptions) => show('success', message, options),
  error: (message: string, options?: ToastOptions) => show('error', message, options),
  info: (message: string, options?: ToastOptions) => show('info', message, options),
  dismiss: (id?: string) => useToastStore.getState().dismiss(id),
};
