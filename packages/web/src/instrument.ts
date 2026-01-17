import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { environment } from './environments/environment';

const telemetryUrlPattern = /\/api\/telemetry\//;

const configDefaults = {
  ignoreNetworkEvents: true,
  ignoreUrls: [telemetryUrlPattern],
  propagateTraceHeaderCorsUrls: [
    new RegExp(`${environment.API_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/api`),
  ],
};

// Capture click coordinates since shouldPreventSpanCreation doesn't receive the Event object
let lastClickCoords = { x: 0, y: 0 };
document.addEventListener(
  'click',
  (e) => {
    lastClickCoords = { x: e.clientX, y: e.clientY };
  },
  true,
);

if (environment.HONEYCOMB_SERVICE_NAME === '') {
  throw new Error('Missing Honeycomb service name');
}

const sdk = new HoneycombWebSDK({
  endpoint: `${environment.API_URL}/api/telemetry`,
  debug: false,
  apiKey: 'proxy', // Required by SDK but not used - server adds the real key
  serviceName: environment.HONEYCOMB_SERVICE_NAME,
  instrumentations: [
    getWebAutoInstrumentations({
      '@opentelemetry/instrumentation-xml-http-request': configDefaults,
      '@opentelemetry/instrumentation-fetch': configDefaults,
      '@opentelemetry/instrumentation-document-load': configDefaults,
      '@opentelemetry/instrumentation-user-interaction': {
        eventNames: ['click', 'submit', 'change'],
        shouldPreventSpanCreation: (eventType, element, span) => {
          // Only track interactive elements to avoid duplicate spans from event bubbling
          if (element.id) {
            span.setAttribute('element.id', element.id);
          }
          if (element.tagName) {
            span.setAttribute('element.tag', element.tagName.toLowerCase());
          }
          if (element.getAttribute('data-testid')) {
            span.setAttribute('element.testid', element.getAttribute('data-testid')!);
          }
          if (element.getAttribute('aria-label')) {
            span.setAttribute('element.aria_label', element.getAttribute('aria-label')!);
          }

          const text = element.textContent?.trim().slice(0, 50);
          if (text && ['BUTTON', 'A', 'LABEL'].includes(element.tagName)) {
            span.setAttribute('element.text', text);
          }

          span.setAttribute('event.type', eventType);

          // Add click coordinates for click events
          if (eventType === 'click') {
            span.setAttribute('click.x', lastClickCoords.x);
            span.setAttribute('click.y', lastClickCoords.y);
          }
        //   console.log('User Interaction Event:', { eventType, element });
          return false; // Allow span creation
        },
      },
    }),
  ],
  contextManager: new ZoneContextManager(),
});
sdk.start();
