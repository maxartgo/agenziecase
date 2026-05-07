/**
 * Sentry Client Configuration for Frontend
 * Environment: production
 */

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

// Get DSN from environment or use placeholder
const SENTRY_DSN = window.SENTRY_DSN || '';

// Init Sentry only if DSN is configured
if (SENTRY_DSN && SENTRY_DSN !== 'your-sentry-dsn-here') {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Filter sensitive data
    beforeSend(event) {
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      return event;
    },

    // Integrations
    integrations: [
      new BrowserTracing({
        tracePropagationTargets: ["localhost", "agenziecase.com", /^https:\/\/agenziecase\.com/],
      }),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Session replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });

  console.log('✅ Sentry monitoring attivato');
} else {
  console.log('⚠️ Sentry non configurato (SENTRY_DSN mancante)');
}

export default Sentry;
