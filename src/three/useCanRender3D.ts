import { useSyncExternalStore } from 'react';
import { useReducedMotion } from '@/shared/hooks/useMotion';
const MIN_DEVICE_MEMORY_GB = 4;
const MIN_CORES = 4;

interface NetworkHints {
  saveData?: boolean;
}

export interface NavigatorHints {
  connection?: NetworkHints;
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

export interface CapabilityEnvironment {
  webgl2: boolean;
  reducedMotion: boolean;
  navigator: NavigatorHints;
}

export function detect3DSupport({
  webgl2,
  reducedMotion,
  navigator: nav,
}: CapabilityEnvironment): boolean {
  if (!webgl2 || reducedMotion) return false;
  if (nav.connection?.saveData === true) return false;
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory < MIN_DEVICE_MEMORY_GB)
    return false;
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency < MIN_CORES)
    return false;
  return true;
}

let webgl2Cache: boolean | null = null;

export function resetWebGL2Cache(): void {
  webgl2Cache = null;
}

function hasWebGL2(): boolean {
  if (webgl2Cache !== null) return webgl2Cache;
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2');
    webgl2Cache = context !== null && context !== undefined;
    context?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webgl2Cache = false;
  }
  return webgl2Cache;
}

function subscribe(): () => void {
  return () => undefined;
}

function getSnapshot(): boolean {
  const nav: NavigatorHints = window.navigator;
  return detect3DSupport({ webgl2: hasWebGL2(), reducedMotion: false, navigator: nav });
}

function getServerSnapshot(): boolean {
  return false;
}

export function useCanRender3D(): boolean {
  const reduce = useReducedMotion();
  const capable = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return capable && !reduce;
}
