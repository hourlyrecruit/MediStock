import { useEffect, useEffectEvent, useRef, type RefObject } from 'react';

export function useToastTimer(
  duration: number,
  paused: boolean,
  onDone: () => void,
  progressRef: RefObject<HTMLElement | null>,
) {
  const remaining = useRef(duration);
  const animation = useRef<Animation | null>(null);
  const done = useEffectEvent(onDone);

  useEffect(() => {
    const node = progressRef.current;
    if (!node || typeof node.animate !== 'function' || duration === Infinity) return;
    const anim = node.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], {
      duration,
      easing: 'linear',
      fill: 'forwards',
    });
    animation.current = anim;
    return () => anim.cancel();
  }, [duration, progressRef]);

  useEffect(() => {
    if (duration === Infinity) return;
    if (paused) {
      animation.current?.pause();
      return;
    }
    animation.current?.play();
    const startedAt = Date.now();
    const timer = window.setTimeout(() => done(), remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt));
    };
  }, [paused, duration]);
}
