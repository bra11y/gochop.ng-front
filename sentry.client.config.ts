import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Replay may only be enabled for the client-side
  integrations: [
    Sentry.replayIntegration({
      // Mask all text content, emails, and usernames
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Performance Monitoring
  tracesSampleRate: 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.

  // Environment and Release tracking
  environment: process.env.NODE_ENV || "development",

  // Enhanced error filtering
  beforeSend(event, hint) {
    // Filter out common browser errors that aren't actionable
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error) {
        // Filter out network errors
        if (
          error.message.includes("NetworkError") ||
          error.message.includes("fetch")
        ) {
          return null;
        }

        // Filter out script loading errors
        if (
          error.message.includes("Loading chunk") ||
          error.message.includes("Loading CSS chunk")
        ) {
          return null;
        }
      }
    }

    return event;
  },

  // Enhanced error context
  beforeSendTransaction(event) {
    // Add tenant context to transactions
    const tenantSlug =
      typeof window !== "undefined"
        ? window.location.pathname.split("/")[1]
        : "unknown";

    event.tags = {
      ...event.tags,
      tenant: tenantSlug,
    };

    return event;
  },
});
