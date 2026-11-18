import { useReducedMotion } from '@/shared/hooks/useMotion';
import { useMediaQuery } from '@/shared/hooks';

export function useFinePointer() {
  return useMediaQuery('(hover: hover) and (pointer: fine)');
}

export function usePointerEffects() {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  return fine && !reduce;
}
