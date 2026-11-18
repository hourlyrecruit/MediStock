import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useUiStore } from '@/data/store/uiStore';
import {
  detect3DSupport,
  resetWebGL2Cache,
  useCanRender3D,
  type NavigatorHints,
} from './useCanRender3D';

const capable: NavigatorHints = {
  hardwareConcurrency: 8,
  deviceMemory: 8,
  connection: { saveData: false },
};

function stubMatchMedia(reduced: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: reduced,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    })),
  );
}

function stubNavigator(hints: NavigatorHints) {
  for (const [key, value] of Object.entries(hints)) {
    Object.defineProperty(window.navigator, key, { value, configurable: true });
  }
}

function stubWebGL2(available: boolean) {
  const context = available ? { getExtension: () => null } : null;
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    () => context as unknown as RenderingContext | null,
  );
}

describe('detect3DSupport', () => {
  it('allows capable devices', () => {
    expect(detect3DSupport({ webgl2: true, reducedMotion: false, navigator: capable })).toBe(true);
  });

  it('treats unknown hints as capable', () => {
    expect(detect3DSupport({ webgl2: true, reducedMotion: false, navigator: {} })).toBe(true);
  });

  it.each<[string, Partial<Parameters<typeof detect3DSupport>[0]>]>([
    ['no WebGL2', { webgl2: false }],
    ['reduced motion', { reducedMotion: true }],
    ['save-data', { navigator: { ...capable, connection: { saveData: true } } }],
    ['2 GB memory', { navigator: { ...capable, deviceMemory: 2 } }],
    ['2 cores', { navigator: { ...capable, hardwareConcurrency: 2 } }],
  ])('rejects %s', (_, override) => {
    expect(
      detect3DSupport({ webgl2: true, reducedMotion: false, navigator: capable, ...override }),
    ).toBe(false);
  });

  it('allows a typical phone with 4 GB and 4 cores', () => {
    expect(
      detect3DSupport({
        webgl2: true,
        reducedMotion: false,
        navigator: { deviceMemory: 4, hardwareConcurrency: 4 },
      }),
    ).toBe(true);
  });
});

describe('useCanRender3D', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    resetWebGL2Cache();
  });

  it('returns true on a capable device', () => {
    stubMatchMedia(false);
    stubNavigator(capable);
    stubWebGL2(true);
    const { result } = renderHook(() => useCanRender3D());
    expect(result.current).toBe(true);
  });

  it('returns false when motion is turned off in the app', () => {
    stubMatchMedia(false);
    stubNavigator(capable);
    stubWebGL2(true);
    useUiStore.getState().setMotion('off');
    try {
      const { result } = renderHook(() => useCanRender3D());
      expect(result.current).toBe(false);
    } finally {
      useUiStore.getState().setMotion('on');
    }
  });

  it('ignores the system reduced-motion preference', () => {
    stubMatchMedia(true);
    stubNavigator(capable);
    stubWebGL2(true);
    const { result } = renderHook(() => useCanRender3D());
    expect(result.current).toBe(true);
  });

  it('returns false without WebGL2', () => {
    stubMatchMedia(false);
    stubNavigator(capable);
    stubWebGL2(false);
    const { result } = renderHook(() => useCanRender3D());
    expect(result.current).toBe(false);
  });

  it('returns false on low-memory devices', () => {
    stubMatchMedia(false);
    stubNavigator({ ...capable, deviceMemory: 2 });
    stubWebGL2(true);
    const { result } = renderHook(() => useCanRender3D());
    expect(result.current).toBe(false);
  });
});
