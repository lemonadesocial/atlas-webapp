# Atlas Web App

The public-facing web app for [Atlas Protocol](https://github.com/lemonadesocial/atlas-protocol) -- unified event discovery across platforms.

Live at **atlas.lemonade.social**

## What is Atlas?

Atlas connects event platforms (Lemonade, Eventbrite, Lu.ma) into a single searchable index. This web app provides:

- **Event discovery** -- search and browse events across all connected platforms
- **Event detail pages** -- view event info, buy tickets via Stripe Checkout
- **Landing page** -- protocol marketing and organizer acquisition
- **SEO** -- server-rendered pages with JSON-LD, Open Graph, sitemap

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS v4, dark-mode-first semantic tokens
- **Maps:** Leaflet + OpenStreetMap (no API key required)
- **Geocoding:** Nominatim (OpenStreetMap, free)
- **Payments:** Stripe Checkout (redirect flow via backend)
- **Error tracking:** Sentry
- **Analytics:** Vercel Analytics
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone the repo
git clone https://github.com/lemonadesocial/atlas-webapp.git
cd atlas-webapp

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

See `.env.example` for all required variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_ATLAS_REGISTRY_URL` | Atlas Registry API base URL | Yes |
| `NEXT_PUBLIC_LEMONADE_BACKEND_URL` | Lemonade Backend API base URL | Yes |
| `NEXT_PUBLIC_SITE_URL` | Public URL of this app | Yes |
| `SENTRY_DSN` | Sentry project DSN for error tracking | No |

### Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    api/atlas/            # BFF proxy for backend API
    discover/             # Event discovery page
    events/[id]/          # Event detail page
  components/
    ui/                   # Base UI components (Button, Input, Badge, etc.)
    layout/               # Layout components (Navbar, Footer, ErrorBoundary)
    discover/             # Discovery feature components
    event/                # Event detail components
    landing/              # Landing page sections
  lib/
    hooks/                # Custom React hooks
    services/             # API client services
    types/                # TypeScript type definitions
    utils/                # Utility functions and constants
```

## Architecture

- **BFF Proxy:** All backend API calls go through `/api/atlas/[...path]` which adds the `Atlas-Agent-Id` header. No auth tokens are exposed to the browser in Phase 1.
- **Dark mode default:** Semantic color tokens with light mode toggle. Preference stored in localStorage and respects `prefers-color-scheme`.
- **SEO:** Server-rendered metadata, JSON-LD Event schema, Open Graph tags, dynamic sitemap from registry data.
- **Maps:** Leaflet with OpenStreetMap tiles, dynamically imported (client-side only).

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit with conventional commits (`feat:`, `fix:`, `chore:`)
4. Push and open a PR

## License

MIT -- see [LICENSE](LICENSE).
