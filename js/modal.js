/**
 * nativo Modal / Drawer
 *
 * API:
 *   Nativo.modal.open('my-modal')
 *   Nativo.modal.close('my-modal')
 */

import { trapFocus, lockScroll, unlockScroll, emit } from './utils.js';

class Modal {
  constructor(el) {
    this.el = el;
    this._releaseFocus = null;
    this._setup();
  }

  _setup() {
    const el = this.el;
    if (!el.getAttribute('aria-modal')) el.setAttribute('aria-modal', 'true');

    // Backdrop click
    el.addEventListener('click', (e) => {
      if (el.hasAttribute('data-modal-no-backdrop-close')) return;
      // The dialog's padding area IS the backdrop when using <dialog>
      const rect = el.getBoundingClientRect();
      const isBackdrop =
        e.clientX < rect.left || e.clientX > rect.right ||
        e.clientY < rect.top  || e.clientY > rect.bottom;
      if (isBackdrop) this.close();
    });

    // Close buttons inside the dialog
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-modal-close]')) this.close();
    });

    // Escape — native <dialog> fires 'cancel' on Escape
    el.addEventListener('cancel', (e) => {
      e.preventDefault();
      this.close();
    });

    // Observe open state if showModal() is called directly
    const observer = new MutationObserver(() => {
      if (el.open) this._onOpen();
      else         this._onClose();
    });
    observer.observe(el, { attributes: true, attributeFilter: ['open'] });
  }

  _onOpen() {
    lockScroll();
    this._releaseFocus = trapFocus(this.el);
    emit(this.el, 'modal:open');
  }

  _onClose() {
    unlockScroll();
    this._releaseFocus?.();
    this._releaseFocus = null;
    emit(this.el, 'modal:close');
  }

  open() {
    if (this.el.open) return;
    this.el.showModal();
  }

  close() {
    if (!this.el.open) return;
    this.el.close();
  }

  toggle() {
    this.el.open ? this.close() : this.open();
  }
}

// Global trigger wiring — [data-modal-open="id"]
function wireGlobalTriggers(root = document) {
  root.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-modal-open]');
    if (!trigger) return;
    const id = trigger.getAttribute('data-modal-open');
    const dialog = document.getElementById(id);
    if (dialog?._dsModal) dialog._dsModal.open();
    else if (dialog) dialog.showModal();
  });
}

export function initModals(root = document) {
  root.querySelectorAll('dialog[data-modal], dialog.modal, dialog.drawer').forEach(el => {
    if (!el._dsModal) el._dsModal = new Modal(el);
  });
  wireGlobalTriggers(root);
}

// Programmatic API
export const modal = {
  open(id) {
    const el = document.getElementById(id);
    el?._dsModal ? el._dsModal.open() : el?.showModal();
  },
  close(id) {
    const el = document.getElementById(id);
    el?._dsModal ? el._dsModal.close() : el?.close();
  },
};

export { Modal };
