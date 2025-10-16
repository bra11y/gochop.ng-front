import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0,

  // Environment tracking
  environment: process.env.NODE_ENV || "development",

  // Enhanced error context for server-side
  beforeSend(event, hint) {
    // Add server context
    event.server_name = process.env.VERCEL_URL || "localhost";

    // Filter out common server errors that aren't actionable
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error) {
        // Filter out connection errors
        if (
          error.message.includes("ECONNRESET") ||
          error.message.includes("ENOTFOUND") ||
          error.message.includes("timeout")
        ) {
          return null;
        }
      }
    }

    return event;
  },

  // Enhanced performance tracking
  beforeSendTransaction(event) {
    // Add performance context
    if (event.transaction) {
      // Track API routes separately
      if (event.transaction.startsWith("/api/")) {
        event.tags = {
          ...event.tags,
          route_type: "api",
        };
      }

      // Track store routes
      if (event.transaction.match(/^\/[^\/]+$/)) {
        event.tags = {
          ...event.tags,
          route_type: "store",
        };
      }
    }

    return event;
  },

  // Database and external service monitoring
  integrations: [
    // Monitor database performance
    Sentry.prismaIntegration(),
    // Monitor HTTP requests
    Sentry.httpIntegration({
      tracing: true,
    }),
  ],
});
