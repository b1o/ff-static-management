import { Directive } from '@angular/core';
import { classes } from '@spartan/utils';

@Directive({
	selector: 'hlm-select, brn-select [hlm]',
})
export class HlmSelect {
	constructor() {
		classes(() => 'space-y-2');
	}
}
