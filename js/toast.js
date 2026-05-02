/**
 * Brisa Toast
 *
 * API:
 *   Brisa.toast.show({ message, title?, type?, duration?, closable? })
 *   Brisa.toast.success(message, options?)
 *   Brisa.toast.error(message, options?)
 *   Brisa.toast.warning(message, options?)
 *   Brisa.toast.info(message, options?)
 *   Brisa.toast.promise(promise, { loading, success, error })
 *
 * Options:
 *   message   string            — body text (required)
 *   title     string            — optional heading
 *   type      'info'|'success'|'warning'|'error'|'neutral'  default: 'neutral'
 *   duration  number (ms)       — 0 = persist. default: 4000
 *   closable  boolean           — show close button. default: true
 *   position  'bottom-right'|'bottom-left'|'top-right'|'top-left'|'top-center'|'bottom-center'
 */

import { emit } from './utils.js';

const ICONS = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  error:   `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info:    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  neutral: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`,
  loading: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation:ds-spin .7s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
};

const ICON_COLOR = {
  success: 'var(--feedback-success-icon)',
  error:   'var(--feedback-error-icon)',
  warning: 'var(--feedback-warning-icon)',
  info:    'var(--feedback-info-icon)',
  neutral: 'var(--text-tertiary)',
  loading: 'var(--interactive-default)',
};

const MAX_TOASTS = 5;
const DEFAULT_DURATION = 4000;

class ToastManager {
  constructor() {
    this._containers = {};
    this._active = [];
  }

  _getContainer(position = 'bottom-right') {
    if (this._containers[position]) return this._containers[position];

    const [y, x] = position.split('-');
    const el = document.createElement('div');
    el.className = 'toast-container';
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'false');
    el.style.cssText = this._positionStyles(y, x);
    document.body.appendChild(el);
    this._containers[position] = el;
    return el;
  }

  _positionStyles(y, x) {
    const styles = [];
    if (y === 'top')    styles.push('top: var(--space-5)', 'bottom: auto', 'flex-direction: column');
    if (y === 'bottom') styles.push('bottom: var(--space-5)', 'top: auto', 'flex-direction: column-reverse');
    if (x === 'right')  styles.push('right: var(--space-5)', 'left: auto');
    if (x === 'left')   styles.push('left: var(--space-5)', 'right: auto');
    if (x === 'center') styles.push('left: 50%', 'transform: translateX(-50%)', 'right: auto', 'align-items: center');
    return styles.join(';');
  }

  show(options = {}) {
    const {
      message,
      title,
      type       = 'neutral',
      duration   = DEFAULT_DURATION,
      closable   = true,
      position   = 'bottom-right',
    } = options;

    // Prune if over limit
    if (this._active.length >= MAX_TOASTS) {
      this._dismiss(this._active[0]);
    }

    const container = this._getContainer(position);
    const el = this._build({ message, title, type, closable });
    container.appendChild(el);
    this._active.push(el);

    // Announce to screen readers
    el.setAttribute('role', 'status');
    if (type === 'error') el.setAttribute('role', 'alert');

    // Pause timer on hover
    let timerId;
    const start = () => {
      if (duration === 0) return;
      timerId = setTimeout(() => this._dismiss(el), duration);
    };
    const pause = () => clearTimeout(timerId);

    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', start);
    start();

    // Close button
    el.querySelector('.toast__close')?.addEventListener('click', () => {
      pause();
      this._dismiss(el);
    });

    emit(el, 'toast:show', { type, message });
    return el;
  }

  _build({ message, title, type, closable }) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `
      <span class="toast__icon" style="color:${ICON_COLOR[type] ?? ICON_COLOR.neutral};flex-shrink:0;display:flex;align-items:center;">
        ${ICONS[type] ?? ICONS.neutral}
      </span>
      <div class="toast__content" style="flex:1;min-width:0;">
        ${title ? `<p class="toast__title" style="font-weight:var(--weight-semibold);font-size:var(--text-sm);margin-bottom:var(--space-0-5, 0.125rem);">${title}</p>` : ''}
        <p class="toast__message" style="font-size:var(--text-sm);color:var(--text-secondary);line-height:var(--leading-snug);">${message}</p>
      </div>
      ${closable ? `<button class="toast__close" aria-label="Fechar notificação" style="flex-shrink:0;display:flex;align-items:center;background:none;border:none;cursor:pointer;color:var(--text-tertiary);padding:var(--space-1);border-radius:var(--radius-sm);transition:color var(--duration-fast) var(--ease-out);">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>` : ''}
    `;
    return el;
  }

  _dismiss(el) {
    if (!el || !el.parentNode) return;
    el.classList.add('toast--exiting');
    this._active = this._active.filter(t => t !== el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
    // Fallback in case animation doesn't fire
    setTimeout(() => el.remove(), 600);
    emit(el, 'toast:dismiss');
  }

  // Convenience shortcuts
  success(message, opts = {}) { return this.show({ ...opts, message, type: 'success' }); }
  error(message, opts = {})   { return this.show({ ...opts, message, type: 'error',   duration: opts.duration ?? 6000 }); }
  warning(message, opts = {}) { return this.show({ ...opts, message, type: 'warning' }); }
  info(message, opts = {})    { return this.show({ ...opts, message, type: 'info' }); }

  /**
   * Promise toast — shows loading, resolves to success or error.
   * @param {Promise} promise
   * @param {{ loading: string, success: string | fn, error: string | fn }} messages
   */
  promise(promise, { loading = 'Carregando…', success, error }) {
    const el = this.show({ message: loading, type: 'loading', duration: 0, closable: false });

    const resolve = (msg, type) => {
      this._dismiss(el);
      this.show({ message: typeof msg === 'function' ? msg() : msg, type });
    };

    promise
      .then(val  => resolve(typeof success === 'function' ? success(val) : success ?? 'Concluído!', 'success'))
      .catch(err => resolve(typeof error   === 'function' ? error(err)   : error   ?? 'Erro!', 'error'));

    return promise;
  }
}

export const toast = new ToastManager();
