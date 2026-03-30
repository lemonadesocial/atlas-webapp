export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://atlas.lemonade.social";

// M1: Validate at first use (not module load) so tests can set env vars
let _registryUrl: string | undefined;
export function getRegistryUrl(): string {
  if (_registryUrl) return _registryUrl;
  _registryUrl = process.env.NEXT_PUBLIC_ATLAS_REGISTRY_URL;
  if (!_registryUrl) {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_ATLAS_REGISTRY_URL"
    );
  }
  return _registryUrl;
}

// For static imports that need a string value (sitemap, etc.)
export const ATLAS_REGISTRY_URL =
  process.env.NEXT_PUBLIC_ATLAS_REGISTRY_URL || "";

// M4: Backend URL is server-only (used in API routes and SSR).
// Client components must use /api/atlas/ BFF routes.
export const LEMONADE_BACKEND_URL =
  process.env.LEMONADE_BACKEND_URL || process.env.NEXT_PUBLIC_LEMONADE_BACKEND_URL || "";

export const NOMINATIM_URL =
  process.env.NEXT_PUBLIC_NOMINATIM_URL ||
  "https://nominatim.openstreetmap.org";

export const CATEGORIES = [
  "Music",
  "Tech",
  "Art",
  "Sports",
  "Networking",
  "Food & Drink",
  "Health",
  "Education",
  "Community",
  "Other",
] as const;

export const SOURCE_PLATFORMS = [
  { value: "", label: "All Platforms" },
  { value: "lemonade", label: "Lemonade" },
  { value: "eventbrite", label: "Eventbrite" },
  { value: "luma", label: "Lu.ma" },
] as const;

export const SORT_OPTIONS = [
  { value: "", label: "Relevance" },
  { value: "date_asc", label: "Date (soonest)" },
  { value: "price_asc", label: "Price (low to high)" },
  { value: "price_desc", label: "Price (high to low)" },
  { value: "popularity", label: "Popular" },
] as const;

export const DATE_FILTERS = [
  { value: "", label: "Any Date" },
  { value: "today", label: "Today" },
  { value: "weekend", label: "This Weekend" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
] as const;

export const PRICE_MODES = [
  { value: "", label: "Any Price" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
  { value: "range", label: "Custom Range" },
] as const;

// User-facing strings (centralized for future i18n)
export const STRINGS = {
  siteName: "Atlas",
  siteDescription:
    "Discover events from every platform, in one place. Atlas is the unified event discovery protocol.",
  heroHeadline: "Discover events from every platform, in one place",
  heroSubheadline:
    "Atlas connects event platforms so you can find, compare, and attend events across Lemonade, Eventbrite, Lu.ma, and more.",
  exploreEvents: "Explore Events",
  listYourEvents: "List Your Events",
  howItWorksTitle: "How it works",
  step1Title: "Connect",
  step1Desc: "Organizers connect their event platforms to Atlas in minutes.",
  step2Title: "Import",
  step2Desc: "Events sync automatically across all connected platforms.",
  step3Title: "Discover",
  step3Desc: "Attendees search once and find events everywhere.",
  forOrganizersTitle: "For organizers",
  forOrganizersProps: [
    "Reach more attendees across platforms",
    "Unified analytics for all your events",
    "Accept payments via Stripe",
  ],
  forAttendeesTitle: "For attendees",
  forAttendeesProps: [
    "One search across all event platforms",
    "Compare prices and availability",
    "Unified ticket management",
  ],
  supportedPlatforms: ["Lemonade", "Eventbrite", "Lu.ma"],
  searchPlaceholder: "Search events...",
  noEventsFound: "No events found. Try a different search.",
  loadMore: "Load more",
  showingResults: (shown: number, total: number) =>
    `Showing ${shown} of ${total} events`,
  errorLoadEvents: "Failed to load events. Please try again.",
  errorGeneric: "Something went wrong",
  reload: "Reload",
  pageNotFound: "Page not found",
  serverError: "Server error",
  retry: "Try again",
  cookieMessage: "We use cookies for analytics.",
  cookieAccept: "Accept",
  cookieReject: "Reject",
  privacyPolicy: "Privacy Policy",
  getTickets: "Get Tickets",
  soldOut: "Sold Out",
  free: "Free",
  processing: "Processing...",
  reservationExpired: "Your reservation expired. Please try again.",
  paymentCancelled: "Payment was cancelled",
  paymentSuccess: "Payment received! Your tickets are being processed.",
  ticketsProcessing:
    "Payment received! Your tickets are being processed. Check your email for confirmation.",
  shareLink: "Copy link",
  shareTwitter: "Twitter",
  shareWhatsApp: "WhatsApp",
  locationUnavailable: "Location not available. Enter a city manually.",
  locationDenied: "Location access denied. Enter a city manually.",
} as const;
