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

export const Nativo = { init, toast, modal };

window.Nativo = Nativo;
