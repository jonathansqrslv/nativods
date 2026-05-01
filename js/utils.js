/**
 * DS Utils — shared primitives for behavior layer
 */

let _uidCounter = 0;
export function uid(prefix = 'ds') {
  return `${prefix}-${++_uidCounter}`;
}

// Focusable selector used across components
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'details > summary',
].join(',');

export function getFocusable(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE)).filter(
    (el) => !el.closest('[hidden]') && !el.closest('[inert]')
  );
}

/**
 * Focus trap — keeps keyboard focus inside `container`.
 * Returns a cleanup function.
 */
export function trapFocus(container) {
  function handler(e) {
    if (e.key !== 'Tab') return;
    const focusable = getFocusable(container);
    if (!focusable.length) { e.preventDefault(); return; }
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }
  container.addEventListener('keydown', handler);
  // Focus first focusable element
  const focusable = getFocusable(container);
  if (focusable.length) focusable[0].focus();
  return () => container.removeEventListener('keydown', handler);
}

/**
 * Listen for clicks outside `el`. Returns cleanup function.
 */
export function onOutsideClick(el, callback) {
  function handler(e) {
    if (!el.contains(e.target)) callback(e);
  }
  // Use capture so it fires before the element's own click handler can stop propagation
  document.addEventListener('pointerdown', handler, true);
  return () => document.removeEventListener('pointerdown', handler, true);
}

/**
 * Prevent body scroll while keeping scrollbar width to avoid layout shift.
 */
export function lockScroll() {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = `${scrollbarWidth}px`;
}

export function unlockScroll() {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

/**
 * Dispatch a custom event from an element.
 */
export function emit(el, name, detail = {}) {
  el.dispatchEvent(new CustomEvent(`ds:${name}`, { bubbles: true, detail }));
}
