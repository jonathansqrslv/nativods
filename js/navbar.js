/**
 * DS Navbar
 *
 * Handles:
 *   - Mobile nav toggle (hamburger)
 *   - Close on outside click
 *   - Close on Escape
 *   - Sync aria-expanded on toggle button
 *
 * Markup contract:
 *   <nav class="navbar" data-navbar>
 *     <button class="navbar__toggle" data-navbar-toggle aria-controls="main-nav">…</button>
 *     <div class="navbar__nav" id="main-nav" data-navbar-nav>…</div>
 *   </nav>
 */

import { onOutsideClick, emit } from './utils.js';

class Navbar {
  constructor(el) {
    this.el      = el;
    this.toggle  = el.querySelector('[data-navbar-toggle], .navbar__toggle');
    this.nav     = el.querySelector('[data-navbar-nav], .navbar__nav');
    this._open   = false;
    this._cleanup = null;

    if (!this.toggle || !this.nav) return;
    this._setup();
  }

  _setup() {
    const navId = this.nav.id || 'ds-navbar-nav';
    this.nav.id = navId;
    this.toggle.setAttribute('aria-controls', navId);
    this.toggle.setAttribute('aria-expanded', 'false');

    this.toggle.addEventListener('click', () => this.toggleMenu());

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._open) this.closeMenu();
    });

    // Close when a nav link is clicked (SPA-friendly)
    this.nav.querySelectorAll('a, button').forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth < 768) this.closeMenu();
      });
    });
  }

  openMenu() {
    if (this._open) return;
    this._open = true;
    this.nav.classList.add('is-open');
    this.toggle.setAttribute('aria-expanded', 'true');
    this._cleanup = onOutsideClick(this.el, () => this.closeMenu());
    emit(this.el, 'navbar:open');
  }

  closeMenu() {
    if (!this._open) return;
    this._open = false;
    this.nav.classList.remove('is-open');
    this.toggle.setAttribute('aria-expanded', 'false');
    this._cleanup?.();
    this._cleanup = null;
    emit(this.el, 'navbar:close');
  }

  toggleMenu() {
    this._open ? this.closeMenu() : this.openMenu();
  }
}

export function initNavbar(root = document) {
  root.querySelectorAll('[data-navbar], .navbar').forEach(el => {
    if (!el._dsNavbar) el._dsNavbar = new Navbar(el);
  });
}

export { Navbar };
