/**
 * nativo Dropdown
 *
 * Markup contract:
 *   <div class="dropdown" data-dropdown>
 *     <button class="dropdown__trigger" data-dropdown-trigger>…</button>
 *     <div class="dropdown__menu" data-dropdown-menu role="menu">
 *       <button class="dropdown__item" role="menuitem">…</button>
 *     </div>
 *   </div>
 *
 * Without [data-dropdown-*] attrs the init still works using class selectors as fallback.
 */

import { onOutsideClick, uid, emit } from './utils.js';

const ITEM_SEL = '.dropdown__item:not([disabled]):not([aria-disabled="true"])';

class Dropdown {
  constructor(el) {
    this.el      = el;
    this.trigger = el.querySelector('[data-dropdown-trigger], .dropdown__trigger');
    this.menu    = el.querySelector('[data-dropdown-menu], .dropdown__menu');
    this._cleanup = null;
    this._open   = false;

    if (!this.trigger || !this.menu) return;
    this._setup();
  }

  _setup() {
    // Accessibility
    const menuId = this.menu.id || uid('dropdown-menu');
    this.menu.id = menuId;
    this.trigger.setAttribute('aria-haspopup', 'true');
    this.trigger.setAttribute('aria-expanded', 'false');
    this.trigger.setAttribute('aria-controls', menuId);

    if (!this.menu.getAttribute('role')) this.menu.setAttribute('role', 'menu');
    this.menu.querySelectorAll('.dropdown__item').forEach(item => {
      if (!item.getAttribute('role')) item.setAttribute('role', 'menuitem');
    });

    // Events
    this.trigger.addEventListener('click', (e) => { e.stopPropagation(); this.toggle(); });
    this.menu.addEventListener('keydown', (e) => this._onKeydown(e));
    this.trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); this.open(); this._focusItem(0); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); this.open(); this._focusItem(-1); }
      if (e.key === 'Escape')    { this.close(); this.trigger.focus(); }
    });
  }

  _items() {
    return Array.from(this.menu.querySelectorAll(ITEM_SEL));
  }

  _focusItem(index) {
    const items = this._items();
    if (!items.length) return;
    const i = index < 0 ? items.length + index : index;
    items[Math.max(0, Math.min(i, items.length - 1))]?.focus();
  }

  _currentIndex() {
    return this._items().indexOf(document.activeElement);
  }

  _onKeydown(e) {
    const items = this._items();
    const cur   = this._currentIndex();
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        items[(cur + 1) % items.length]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        items[(cur - 1 + items.length) % items.length]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        items[items.length - 1]?.focus();
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
        this.trigger.focus();
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  open() {
    if (this._open) return;
    this._open = true;
    this.menu.classList.add('is-open');
    this.trigger.setAttribute('aria-expanded', 'true');
    this._cleanup = onOutsideClick(this.el, () => this.close());
    emit(this.el, 'dropdown:open');
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this.menu.classList.remove('is-open');
    this.trigger.setAttribute('aria-expanded', 'false');
    this._cleanup?.();
    this._cleanup = null;
    emit(this.el, 'dropdown:close');
  }

  toggle() {
    this._open ? this.close() : this.open();
  }

  destroy() {
    this.close();
  }
}

export function initDropdowns(root = document) {
  root.querySelectorAll('[data-dropdown], .dropdown').forEach(el => {
    if (!el._dsDropdown) el._dsDropdown = new Dropdown(el);
  });
}

export { Dropdown };
