import { Directive } from '@angular/core';
import { provideHlmIconConfig } from '@spartan/icon';

@Directive({
	selector: '[hlmAlertIcon]',
	providers: [provideHlmIconConfig({ size: 'sm' })],
})
export class HlmAlertIcon {}
