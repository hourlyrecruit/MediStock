import { useEffect } from 'react';
import { useUiStore } from '@/data/store/uiStore';

export function useMotion() {
  const preference = useUiStore((s) => s.motion);
  const setMotion = useUiStore((s) => s.setMotion);
  return { preference, enabled: preference === 'on', setMotion };
}

export function useReducedMotion(): boolean {
  return useUiStore((s) => s.motion === 'off');
}

export function useApplyMotion() {
  const reduce = useReducedMotion();
  useEffect(() => {
    document.documentElement.dataset.motion = reduce ? 'off' : 'on';
  }, [reduce]);
}
