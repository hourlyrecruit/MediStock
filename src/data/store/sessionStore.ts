import { create } from 'zustand';
import type { CurrentUser } from '@/data/types';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface SessionState {
  status: LoadStatus;
  user: CurrentUser | null;
  error: string | null;
}

export const useSessionStore = create<SessionState>()(() => ({
  status: 'idle',
  user: null,
  error: null,
}));
