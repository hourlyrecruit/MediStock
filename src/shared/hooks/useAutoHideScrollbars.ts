import { useEffect } from 'react';

const HIDE_AFTER_MS = 900;

export function useAutoHideScrollbars() {
  useEffect(() => {
    const timers = new WeakMap<Element, number>();
    const onScroll = (event: Event) => {
      const target = event.target instanceof Element ? event.target : document.scrollingElement;
      if (!(target instanceof HTMLElement)) return;
      target.dataset.scrolling = '';
      const pending = timers.get(target);
      if (pending !== undefined) window.clearTimeout(pending);
      timers.set(
        target,
        window.setTimeout(() => {
          delete target.dataset.scrolling;
          timers.delete(target);
        }, HIDE_AFTER_MS),
      );
    };
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => document.removeEventListener('scroll', onScroll, { capture: true });
  }, []);
}
