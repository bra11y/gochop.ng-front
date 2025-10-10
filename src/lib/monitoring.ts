// Simple logging utility (Sentry can be added later)
export function logError(error: Error, context?: any) {
  console.error('Error:', error);
  
  if (context) {
    console.error('Context:', context);
  }
  
  // In production, you would send this to your logging service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Add proper error tracking service
    console.error('Production error:', { error: error.message, context });
  }
}