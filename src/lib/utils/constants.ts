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

// Backend URL for client-side calls (public) and server-side SSR (internal k8s).
export const LEMONADE_BACKEND_URL =
  process.env.LEMONADE_BACKEND_URL || process.env.NEXT_PUBLIC_LEMONADE_BACKEND_URL || "";

// AI service URL for client-side chat
export const LEMONADE_AI_URL =
  process.env.NEXT_PUBLIC_LEMONADE_AI_URL || "";

// Lemonade main app URL (for dashboard/create-event links)
export const LEMONADE_APP_URL =
  process.env.NEXT_PUBLIC_LEMONADE_APP_URL || "https://app.lemonade.social";

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

  // Phase 2: Auth
  signIn: "Sign In",
  signOut: "Sign Out",
  signingIn: "Signing you in...",
  signInFailed: "Sign in failed. Please try again.",
  signInDenied:
    "You declined to sign in. You can try again anytime.",
  signInUnavailable:
    "Unable to connect to sign-in service. Please try again later.",
  sessionExpired: "Your session expired. Please sign in again.",
  myEvents: "My Events",
  dashboard: "Dashboard",

  // Phase 2: Onboarding
  onboardTitle: "Get on Atlas",
  onboardStep1Title: "Sign in",
  onboardStep1Desc: "Sign in with your Lemonade account to get started.",
  signInWithLemonade: "Sign in with Lemonade",
  onboardStep2Title: "Select a Space",
  onboardStep2Desc: "Choose an existing space or create a new one.",
  createNewSpace: "Create New Space",
  onboardStep3Title: "Connect Stripe",
  onboardStep3Desc: "Connect Stripe to accept payments for your events.",
  connectStripe: "Connect Stripe",
  stripeConnected: "Stripe Connected",
  skipForNow: "Skip for now",
  verifyingStripe: "Verifying Stripe connection...",
  stripeNotCompleted:
    "Stripe setup not completed. You can try again or skip for now.",
  onboardStep4Title: "Connect Platforms",
  onboardStep4Desc:
    "Import your events from other platforms, or create events on Lemonade.",
  connectEventbrite: "Connect Eventbrite",
  connectLuma: "Connect Lu.ma",
  lumaApiKeyPlaceholder: "Enter your Lu.ma API key",
  invalidApiKey: "Invalid API key. Please check and try again.",
  importingEvents: (count: number) => `Importing ${count} events...`,
  retryFailed: "Retry Failed",
  createOnLemonade: "Create Event on Lemonade",
  onboardDoneTitle: "You're on Atlas!",
  onboardDoneSummary: (events: number, platforms: string[], space: string) =>
    `${events} events imported from ${platforms.join(", ")} to ${space}.`,
  viewYourEvents: "View Your Events on Atlas",
  goToDashboard: "Go to Dashboard",

  // Phase 2: Leaderboard
  leaderboardTitle: "Leaderboard",
  leaderboardDesc: "Top spaces and communities on Atlas",
  allTime: "All Time",
  thisMonth: "This Month",
  thisWeek: "This Week",
  trendingThisWeek: "Trending This Week",
  rank: "Rank",
  spaceName: "Space",
  totalEvents: "Events",
  totalAttendees: "Attendees",
  avgRating: "Avg Rating",
  connectedPlatforms: "Platforms",
  verified: "Verified",
  noLeaderboardData: "No leaderboard data available yet.",
  leaderboardError: "Failed to load leaderboard. Please try again.",

  // Phase 3: Chat
  chatTitle: "Atlas Chat",
  chatDescription: "Search events, get recommendations, or manage your events with natural language.",
  chatPlaceholder: "Ask about events...",
  chatSignInPrompt: "Sign in to manage events, view ticket sales, and more.",
  chatClear: "Clear chat",
  chatError: "Failed to send message. Please try again.",

  // Navigation
  navExplore: "Explore",
  navLeaderboard: "Leaderboard",
  navDocs: "Docs",
  navChat: "Chat",

  // Common
  search: "Search",
  goHome: "Go Home",
  searchEvents: "Search Events",
  share: "Share",
  copied: "Copied!",
  loading: "Loading...",
  about: "About",
  backToExplore: "Back to Explore",
  viewOriginalListing: "View original listing",

  // Footer
  footerProtocol: "Protocol",
  footerDocumentation: "Documentation",
  footerGitHub: "GitHub",
  footerMainSite: "Main Site",
  footerLegal: "Legal",
  footerTerms: "Terms of Service",
  footerTagline: "Atlas Protocol by Lemonade",

  // Phase 4: Docs
  docsTitle: "Documentation",
  docsDescription: "Everything you need to know about Atlas Protocol.",
  docsLoadError: "Failed to load docs. Please try again.",

  docsWhatIsAtlasTitle: "What is Atlas Protocol?",
  docsWhatIsAtlasBody:
    "Atlas (Agent Ticketing, Listing, And Settlement) is an open protocol that makes every event on the internet discoverable, bookable, and settleable by software agents. It standardizes how events are discovered, listed, purchased, and settled across platforms. Think of it as what DNS did for domain names, but for events.",

  docsHowItWorksTitle: "How it works",
  docsHowItWorksIntro:
    "Atlas uses a three-layer architecture. Each layer serves a different participant while reinforcing the others.",
  docsLayer1Title: "Layer 1: Protocol Core",
  docsLayer1Desc:
    "The foundation. Standardizes discovery (federated registry + well-known endpoints), listing (JSON-LD extending Schema.org), purchase (HTTP 402 + ticket holds), settlement (USDC on Tempo, sub-cent fees), and receipts (cryptographic proof of purchase).",
  docsLayer2Title: "Layer 2: Platforms (B2B)",
  docsLayer2Desc:
    "Existing event platforms integrate @atlas/sdk to become Atlas-compliant. New platforms can build on Atlas as infrastructure from day one, skipping the need to build their own payments, discovery, or agent access.",
  docsLayer3Title: "Layer 3: Organizers (B2C)",
  docsLayer3Desc:
    "Individual organizers connect their existing platform accounts (Eventbrite, Lu.ma, etc.) via OAuth. Their events become Atlas-discoverable instantly. No platform approval needed.",

  docsApiReferenceTitle: "API Reference",
  docsApiReferenceDesc:
    "The Atlas Registry exposes a RESTful API for federated event search.",
  docsApiSearchEndpoint: "GET /atlas/v1/search",
  docsApiSearchDesc: "Search events across all connected platforms. Supports full-text search, date/location/price/category filters, and pagination.",
  docsApiEventsEndpoint: "GET /atlas/v1/events/:id",
  docsApiEventsDesc: "Retrieve full details for a specific event, including ticket types, pricing, and availability.",
  docsApiHoldsEndpoint: "POST /atlas/v1/holds",
  docsApiHoldsDesc: "Create a temporary ticket hold. Holds expire after 10 minutes if not checked out.",
  docsApiCheckoutEndpoint: "POST /atlas/v1/holds/:id/checkout",
  docsApiCheckoutDesc: "Complete a purchase from an existing hold. Returns a Stripe Checkout session URL or processes USDC payment.",
  docsApiReceiptsEndpoint: "GET /atlas/v1/receipts/:id",
  docsApiReceiptsDesc: "Retrieve a cryptographic receipt for a completed purchase.",
  docsApiVersionHeader: "All requests require the Atlas-Version: 1.0 header.",

  docsCliTitle: "CLI Reference",
  docsCliDesc:
    "The Atlas CLI lets you search events, manage connectors, and interact with the registry from your terminal.",
  docsCliNpmPackage: "@lemonade-social/cli",
  docsCliGithubRepo: "lemonadesocial/lemonade-cli",
  docsCliInstall: "npm install -g @lemonade-social/cli",

  docsPlatformsTitle: "Supported Platforms",
  docsPlatformLemonade: "Lemonade",
  docsPlatformLemonadeDesc: "Native platform. Full ticketing, payments, and analytics support.",
  docsPlatformEventbrite: "Eventbrite",
  docsPlatformEventbriteDesc: "Import events via OAuth. Ticket sales redirect to Eventbrite checkout.",
  docsPlatformLuma: "Lu.ma",
  docsPlatformLumaDesc: "Import events via API key. Ticket sales redirect to Lu.ma checkout.",

  docsFaqTitle: "FAQ",
  docsFaq: [
    {
      q: "Is Atlas free to use?",
      a: "Atlas is free for organizers and attendees. A 2% protocol fee applies to transactions processed through Atlas settlement. There are no listing fees, subscription fees, or setup costs.",
    },
    {
      q: "Do I need to leave my current event platform?",
      a: "No. Atlas connects to your existing accounts via OAuth. Your events stay on Eventbrite, Lu.ma, or wherever you host them. Atlas makes them discoverable to more people and to AI agents.",
    },
    {
      q: "How do payments work?",
      a: "Atlas settles in USDC on Tempo with sub-cent transaction fees. Attendees can pay with cards or crypto wallets via Stripe. Organizers receive their revenue minus the 2% protocol fee.",
    },
    {
      q: "What data does Atlas collect?",
      a: "Atlas indexes public event metadata (title, date, location, price, description). It does not store personal attendee data. Purchase data is handled by the ticketing platform (Lemonade, Eventbrite, etc.) and Stripe.",
    },
    {
      q: "Can AI agents use Atlas?",
      a: "Yes. Atlas is built for agent access. Any AI agent can query the Atlas Registry API to search events, check availability, and initiate purchases programmatically.",
    },
    {
      q: "How do I integrate my platform with Atlas?",
      a: "Integrate the @atlas/sdk into your platform to become Atlas-compliant. See the API Reference section above or visit the GitHub repo for the full integration guide.",
    },
  ] as readonly { q: string; a: string }[],
} as const;
