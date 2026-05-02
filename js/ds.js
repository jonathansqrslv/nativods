/**
 * Legacy compatibility entry for projects that still import js/ds.js.
 *
 * New projects should import js/nativo.js and use Nativo directly.
 */

import { Nativo } from './nativo.js';

export const DS = Nativo;

window.DS = Nativo;
