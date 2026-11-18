import { useUiStore } from './uiStore';

describe('useUiStore', () => {
  it('updates and persists preferences only', () => {
    const store = useUiStore.getState();
    store.setSidebarCollapsed(true);
    expect(useUiStore.getState().sidebarCollapsed).toBe(true);
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarCollapsed).toBe(false);
    useUiStore.getState().markWelcomeSeen();
    useUiStore.getState().setCommandOpen(true);
    expect(useUiStore.getState().commandOpen).toBe(true);
    const stored = JSON.parse(localStorage.getItem('medistock:ui') ?? '{}') as {
      state: Record<string, unknown>;
    };
    expect(stored.state).toEqual({
      sidebarCollapsed: false,
      hasSeenWelcome: true,
      theme: 'system',
      motion: 'on',
    });
  });

  it('stores the motion preference', () => {
    useUiStore.getState().setMotion('off');
    expect(useUiStore.getState().motion).toBe('off');
    const stored = JSON.parse(localStorage.getItem('medistock:ui') ?? '{}') as {
      state: Record<string, unknown>;
    };
    expect(stored.state.motion).toBe('off');
    useUiStore.getState().setMotion('on');
  });
});
