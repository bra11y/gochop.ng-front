import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0,

  // Environment tracking
  environment: process.env.NODE_ENV || "development",

  // Edge-specific configuration
  beforeSend(event, hint) {
    // Add edge runtime context
    event.tags = {
      ...event.tags,
      runtime: "edge",
    };

    return event;
  },
});
