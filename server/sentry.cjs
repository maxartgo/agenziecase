/**
 * Sentry Configuration for Error Tracking
 * Environment: production
 */

const Sentry = require("@sentry/node");

// Init Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Filter sensitive data
  beforeSend(event, hint) {
    // Remove sensitive data from events
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }

    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    return event;
  },

  // Integrations
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express(),
    new Sentry.Integrations.Postgres(),
  ],

  // Performance monitoring
  beforeSendTransaction(event) {
    // Transaction names
    if (event.transaction) {
      event.transaction = event.transaction
        .replace(/\/var\/www\/agenziecase\/src/, '')
        .replace(/\\/g, '/');
    }
    return event;
  },
});

module.exports = Sentry;
