/**
 * nativo Tabs
 *
 * Markup contract:
 *   <div class="tabs" data-tabs>
 *     <div class="tab-list" role="tablist">
 *       <button class="tab" role="tab" aria-selected="true"  aria-controls="panel-1" id="tab-1">…</button>
 *       <button class="tab" role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2">…</button>
 *     </div>
 *     <div id="panel-1" class="tab-panel" role="tabpanel" aria-labelledby="tab-1">…</div>
 *     <div id="panel-2" class="tab-panel" role="tabpanel" aria-labelledby="tab-2" hidden>…</div>
 *   </div>
 *
 * Existing panels wired via aria-controls / id are respected.
 * The component auto-generates missing IDs and aria attrs.
 */

import { uid, emit } from './utils.js';

class Tabs {
  /**
   * @param {HTMLElement} el
   * @param {{ activation?: 'auto' | 'manual' }} options
   *   auto  — tab activates on focus (default)
   *   manual — tab activates only on Enter/Space
   */
  constructor(el, { activation = 'auto' } = {}) {
    this.el = el;
    this.activation = activation;
    this.tablist = el.querySelector('[role="tablist"]');
    if (!this.tablist) return;
    this._setup();
  }

  _tabs() {
    return Array.from(this.tablist.querySelectorAll('[role="tab"]:not([disabled])'));
  }

  _panelFor(tab) {
    const id = tab.getAttribute('aria-controls');
    return id ? document.getElementById(id) : null;
  }

  _setup() {
    const tabs = this._tabs();

    // Ensure every tab has an id and its panel has aria-labelledby
    tabs.forEach((tab, i) => {
      if (!tab.id) tab.id = uid('tab');
      const panel = this._panelFor(tab);
      if (panel) {
        if (!panel.id) panel.id = uid('panel');
        tab.setAttribute('aria-controls', panel.id);
        panel.setAttribute('aria-labelledby', tab.id);
        if (!panel.getAttribute('role')) panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('tabindex', '0');
      }
    });

    // Roving tabindex — only selected tab is in tab order
    this._updateTabindex();

    this.tablist.addEventListener('keydown', (e) => this._onKeydown(e));
    tabs.forEach(tab => {
      tab.addEventListener('click', () => this.activate(tab));
      if (this.activation === 'auto') {
        tab.addEventListener('focus', () => this.activate(tab));
      }
    });
  }

  _updateTabindex() {
    this._tabs().forEach(tab => {
      tab.setAttribute('tabindex', tab.getAttribute('aria-selected') === 'true' ? '0' : '-1');
    });
  }

  _onKeydown(e) {
    const tabs = this._tabs();
    const cur  = tabs.indexOf(document.activeElement);
    if (cur === -1) return;

    let next = -1;
    const isVertical = this.el.classList.contains('tabs--vertical');

    switch (e.key) {
      case isVertical ? 'ArrowDown' : 'ArrowRight':
        e.preventDefault();
        next = (cur + 1) % tabs.length;
        break;
      case isVertical ? 'ArrowUp' : 'ArrowLeft':
        e.preventDefault();
        next = (cur - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        e.preventDefault();
        next = 0;
        break;
      case 'End':
        e.preventDefault();
        next = tabs.length - 1;
        break;
      case 'Enter':
      case ' ':
        if (this.activation === 'manual') {
          e.preventDefault();
          this.activate(tabs[cur]);
        }
        break;
    }

    if (next !== -1) {
      tabs[next].focus();
      if (this.activation === 'auto') this.activate(tabs[next]);
    }
  }

  activate(tab) {
    const tabs = this._tabs();
    if (tab.getAttribute('aria-selected') === 'true') return;

    tabs.forEach(t => {
      const isTarget = t === tab;
      t.setAttribute('aria-selected', String(isTarget));
      t.classList.toggle('tab--active', isTarget);
      const panel = this._panelFor(t);
      if (panel) panel.hidden = !isTarget;
    });

    this._updateTabindex();
    emit(this.el, 'tabs:change', { tab, panelId: tab.getAttribute('aria-controls') });
  }

  activateByIndex(index) {
    const tabs = this._tabs();
    if (tabs[index]) this.activate(tabs[index]);
  }

  activateByPanelId(panelId) {
    const tab = this.tablist.querySelector(`[aria-controls="${panelId}"]`);
    if (tab) this.activate(tab);
  }
}

export function initTabs(root = document) {
  root.querySelectorAll('[data-tabs], .tabs').forEach(el => {
    if (!el._dsTabs) el._dsTabs = new Tabs(el);
  });
}

export { Tabs };
