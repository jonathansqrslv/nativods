/**
 * nativo Toast
 *
 * API:
 *   Nativo.toast.show({ message, title?, type?, duration?, closable? })
 *   Nativo.toast.success(message, options?)
 *   Nativo.toast.error(message, options?)
 *   Nativo.toast.warning(message, options?)
 *   Nativo.toast.info(message, options?)
 *   Nativo.toast.promise(promise, { loading, success, error })
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
import { icon } from './icons.js';

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
        ${type === 'loading' ? icon('loading', 18, { style: 'animation:nativo-spin .7s linear infinite' }) : icon(type, 18)}
      </span>
      <div class="toast__content" style="flex:1;min-width:0;">
        ${title ? `<p class="toast__title" style="font-weight:var(--weight-semibold);font-size:var(--text-sm);margin-bottom:var(--space-0-5, 0.125rem);">${title}</p>` : ''}
        <p class="toast__message" style="font-size:var(--text-sm);color:var(--text-secondary);line-height:var(--leading-snug);">${message}</p>
      </div>
      ${closable ? `<button class="toast__close" aria-label="Fechar notificação" style="flex-shrink:0;display:flex;align-items:center;background:none;border:none;cursor:pointer;color:var(--text-tertiary);padding:var(--space-1);border-radius:var(--radius-sm);transition:color var(--duration-fast) var(--ease-out);">
        ${icon('close', 14)}
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
