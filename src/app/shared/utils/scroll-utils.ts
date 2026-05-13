function preventDefault(e: Event): void {
  e.preventDefault();
}

export function disableScroll(): void {
  document.addEventListener('wheel', preventDefault, { passive: false });
  document.addEventListener('touchmove', preventDefault, { passive: false });
  document.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

export function enableScroll(): void {
  document.removeEventListener('wheel', preventDefault);
  document.removeEventListener('touchmove', preventDefault);
  document.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}

function preventDefaultForScrollKeys(e: KeyboardEvent): void {
  if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Space'].includes(e.code)) {
    e.preventDefault();
  }
}
