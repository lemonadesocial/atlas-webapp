import * as Sentry from "@sentry/nextjs";

/**
 * Track a custom event to Sentry for analytics (US-NF.20).
 * Events: search_query, onboarding_funnel_complete, onboarding_step_complete, faq_expand
 */
export function trackEvent(
  name: string,
  data?: Record<string, string | number | boolean>
) {
  try {
    Sentry.addBreadcrumb({
      category: "analytics",
      message: name,
      data,
      level: "info",
    });
    // Use Sentry's custom metrics/spans if available
    const span = Sentry.startInactiveSpan({
      name: `analytics.${name}`,
      op: "analytics.track",
      attributes: data as Record<string, string | number | boolean>,
    });
    span?.end();
  } catch {
    // Analytics should never break the app
  }
}
