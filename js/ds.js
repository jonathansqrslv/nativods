/**
 * Legacy compatibility entry for projects that still import js/ds.js.
 *
 * New projects should import js/brisa.js and use Brisa directly.
 */

import { Brisa } from './brisa.js';

export const DS = Brisa;

window.DS = Brisa;
