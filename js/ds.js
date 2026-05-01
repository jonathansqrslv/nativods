/**
 * DS — Design System behavior layer
 *
 * Usage (ES module):
 *   import { DS } from './js/ds.js';
 *   DS.toast.success('Salvo!');
 *
 * Usage (script tag):
 *   <script type="module" src="js/ds.js"></script>
 *   window.DS.toast.success('Salvo!');
 *
 * Auto-initializes all components on DOMContentLoaded.
 * Re-run DS.init(root) to initialize dynamically added content.
 */

import { initDropdowns } from './dropdown.js';
import { initTabs }      from './tabs.js';
import { initModals, modal } from './modal.js';
import { initNavbar }    from './navbar.js';
import { toast }         from './toast.js';

// Inject global keyframe for toast spinner (not worth a separate CSS file)
const styleId = 'ds-runtime-styles';
if (!document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes ds-spin { to { transform: rotate(360deg); } }
    .toast { display:flex; align-items:flex-start; gap:var(--space-3); }
    .toast__close:hover { color: var(--text-primary) !important; }
  `;
  document.head.appendChild(style);
}

/**
 * Initialize all DS components within a root element.
 * Idempotent — calling twice on the same element is safe.
 */
function init(root = document) {
  initDropdowns(root);
  initTabs(root);
  initModals(root);
  initNavbar(root);
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => init());
} else {
  init();
}

// MutationObserver — auto-init components added dynamically to the DOM
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType !== 1) continue;
      init(node);
    }
  }
});
observer.observe(document.body, { childList: true, subtree: true });

export const DS = { init, toast, modal };

// Expose on window for non-module script usage
window.DS = DS;
