import { createContext, useContext, type RefObject } from 'react';

export interface PointerState {
  x: number;
  y: number;
}

const fallbackPointer: RefObject<PointerState> = { current: { x: 0, y: 0 } };

export const PointerContext = createContext<RefObject<PointerState>>(fallbackPointer);

export function usePointer(): RefObject<PointerState> {
  return useContext(PointerContext);
}
