/**
 * nativo — design system
 * Camada de comportamento
 *
 * Um sistema silencioso, mas vivo.
 */

import { initDropdowns } from './dropdown.js';
import { initTabs }      from './tabs.js';
import { initModals, modal } from './modal.js';
import { initNavbar }    from './navbar.js';
import { toast }         from './toast.js';
import { icon }          from './icons.js';

const styleId = 'nativo-runtime';
if (!document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes nativo-spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
}

function init(root = document) {
  initDropdowns(root);
  initTabs(root);
  initModals(root);
  initNavbar(root);
  injectNav(root);
}

/* ==========================================================================
   NAV INJECTION
   ========================================================================== */

const BASE = (() => {
  const path = window.location.pathname;
  if (path.includes('/paginas/componentes/')) return '../../';
  if (path.includes('/paginas/')) return '../';
  return '';
})();

const NAV_HTML = `
<nav class="navbar navbar--elevated" data-navbar>
  <a href="${BASE}index.html" class="navbar__brand">
    nativo/ds
  </a>
  <nav class="navbar__nav">
    <a href="${BASE}fundacao.html" class="navbar__link">Fundação</a>
    <a href="${BASE}paginas/componentes/botao.html" class="navbar__link">Componentes</a>
    <a href="${BASE}layout.html" class="navbar__link">Layout</a>
    <a href="${BASE}utilitarios.html" class="navbar__link">Utilitários</a>
  </nav>
  <div class="navbar__spacer"></div>
  <div class="navbar__actions">
    <a href="${BASE}" class="btn btn--ghost btn--icon btn--sm" aria-label="Início" title="Início">
      ${icon('home', 18)}
    </a>
  </div>
  <button class="navbar__toggle" data-navbar-toggle aria-label="Menu" aria-expanded="false"><span></span></button>
</nav>`;

const COMPONENTES = [
  { href: 'botao.html',      label: 'Botão',       cat: 'Core' },
  { href: 'input.html',      label: 'Input',       cat: 'Core' },
  { href: 'checkbox.html',   label: 'Checkbox',    cat: 'Core' },
  { href: 'card.html',       label: 'Card',        cat: 'Core' },
  { href: 'badge.html',      label: 'Badge',       cat: 'Core' },
  { href: 'table.html',      label: 'Tabela',      cat: 'Core' },
  { href: 'avatar.html',     label: 'Avatar',      cat: 'Core' },
  { href: 'modal.html',      label: 'Modal',       cat: 'Overlay' },
  { href: 'tooltip.html',    label: 'Tooltip',     cat: 'Overlay' },
  { href: 'dropdown.html',   label: 'Dropdown',    cat: 'Overlay' },
  { href: 'navbar.html',     label: 'Navbar',      cat: 'Navegação' },
  { href: 'tabs.html',       label: 'Tabs',        cat: 'Navegação' },
  { href: 'pagination.html', label: 'Paginação',   cat: 'Navegação' },
  { href: 'alert.html',      label: 'Alert',       cat: 'Feedback' },
  { href: 'spinner.html',    label: 'Spinner',     cat: 'Feedback' },
];

const currentFile = window.location.pathname.split('/').pop() || 'index.html';

function buildSidebar() {
  let html = '<nav class="sidebar">';
  html += '<div class="sidebar__section">';
  html += '<span class="sidebar__label">Fundação</span>';
  html += `<a href="${BASE}fundacao.html" class="sidebar__item${currentFile === 'fundacao.html' ? ' sidebar__item--active' : ''}">Tokens</a>`;
  html += '</div>';

  let lastCat = '';
  for (const item of COMPONENTES) {
    if (item.cat !== lastCat) {
      if (lastCat) html += '</div>';
      html += `<div class="sidebar__section"><span class="sidebar__label">${item.cat}</span>`;
      lastCat = item.cat;
    }
    const href = `${BASE}paginas/componentes/${item.href}`;
    const isActive = window.location.pathname.endsWith('/' + item.href);
    html += `<a href="${href}" class="sidebar__item${isActive ? ' sidebar__item--active' : ''}">${item.label}</a>`;
  }
  html += '</div>';

  html += '<div class="sidebar__section">';
  html += '<span class="sidebar__label">Layout</span>';
  html += `<a href="${BASE}layout.html" class="sidebar__item${currentFile === 'layout.html' ? ' sidebar__item--active' : ''}">Grid · Stack · Container</a>`;
  html += '</div>';

  html += '<div class="sidebar__section">';
  html += '<span class="sidebar__label">Utilitários</span>';
  html += `<a href="${BASE}utilitarios.html" class="sidebar__item${currentFile === 'utilitarios.html' ? ' sidebar__item--active' : ''}">Classes</a>`;
  html += '</div>';
  html += '</nav>';
  return html;
}

function injectNav(root = document) {
  const navEl = root.querySelector ? root.querySelector('[data-nativo-nav]') : null;
  if (navEl) {
    navEl.innerHTML = NAV_HTML;
    navEl.removeAttribute('data-nativo-nav');
  }
  const sidebarEl = root.querySelector ? root.querySelector('[data-nativo-sidebar]') : null;
  if (sidebarEl) {
    sidebarEl.innerHTML = buildSidebar();
    sidebarEl.removeAttribute('data-nativo-sidebar');
  }
}

/* ==========================================================================
   TOGGLE CODE
   ========================================================================== */

function toggleCode(btn) {
  const code = btn.parentElement.querySelector('.demo-preview__code');
  const expanded = !code.hidden;
  code.hidden = expanded;
  btn.setAttribute('aria-expanded', String(!expanded));
  btn.textContent = expanded ? 'Mostrar código' : 'Ocultar código';
}

/* ==========================================================================
   INIT
   ========================================================================== */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => init());
} else {
  init();
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType !== 1) continue;
      init(node);
    }
  }
});
observer.observe(document.body, { childList: true, subtree: true });

export const Nativo = { init, toast, modal, toggleCode };

window.Nativo = Nativo;
window.DS = Nativo;
