const BADGE_EVENT = 'badge-update';

interface BadgeDetail {
  friends?: number;
  messages?: number;
}

export function emitBadge(detail: BadgeDetail) {
  window.dispatchEvent(new CustomEvent(BADGE_EVENT, { detail }));
}

export function onBadge(cb: (detail: BadgeDetail) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<BadgeDetail>).detail);
  window.addEventListener(BADGE_EVENT, handler);
  return () => window.removeEventListener(BADGE_EVENT, handler);
}

export default { emitBadge, onBadge };
