import type { KeyboardEvent, MouseEvent } from 'react';

const INTERACTIVE =
  'a,button,input,select,textarea,label,summary,[role="menuitem"],[role="checkbox"],[data-row-ignore]';

export function isFromInteractiveChild(
  event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
) {
  const target = event.target as HTMLElement | null;
  const hit = target?.closest(INTERACTIVE);
  return Boolean(hit && hit !== event.currentTarget && event.currentTarget.contains(hit));
}
