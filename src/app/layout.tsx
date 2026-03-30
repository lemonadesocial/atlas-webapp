import type { Metadata } from "next";
import { STRINGS, SITE_URL } from "@/lib/utils/constants";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { SkipToContent } from "@/components/layout/SkipToContent";
import { ErrorBoundaryWrapper } from "@/components/layout/ErrorBoundaryWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${STRINGS.siteName} - ${STRINGS.siteDescription}`,
    template: `%s | ${STRINGS.siteName}`,
  },
  description: STRINGS.siteDescription,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    siteName: STRINGS.siteName,
    title: STRINGS.siteName,
    description: STRINGS.siteDescription,
    url: SITE_URL,
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: STRINGS.siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: STRINGS.siteName,
    description: STRINGS.siteDescription,
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-primary">
        <SkipToContent />
        <ErrorBoundaryWrapper>
          <Navbar />
          <main id="main-content" className="min-h-[calc(100vh-4rem)]">
            {children}
          </main>
          <Footer />
          <CookieConsent />
        </ErrorBoundaryWrapper>
      </body>
    </html>
  );
}
