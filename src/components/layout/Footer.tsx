import Link from "next/link";
import { STRINGS } from "@/lib/utils/constants";

export function Footer() {
  return (
    <footer className="border-t border-divider bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-primary">{STRINGS.siteName}</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/discover"
                  className="text-sm text-tertiary hover:text-secondary transition-colors"
                >
                  {STRINGS.exploreEvents}
                </Link>
              </li>
              <li>
                <Link
                  href="/onboard"
                  className="text-sm text-tertiary hover:text-secondary transition-colors"
                >
                  {STRINGS.listYourEvents}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary">{STRINGS.footerProtocol}</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/docs"
                  className="text-sm text-tertiary hover:text-secondary transition-colors"
                >
                  {STRINGS.footerDocumentation}
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/lemonadesocial/atlas-protocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-tertiary hover:text-secondary transition-colors"
                >
                  {STRINGS.footerGitHub}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary">Lemonade</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href="https://lemonade.social"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-tertiary hover:text-secondary transition-colors"
                >
                  {STRINGS.footerMainSite}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary">{STRINGS.footerLegal}</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-tertiary hover:text-secondary transition-colors"
                >
                  {STRINGS.footerTerms}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-tertiary hover:text-secondary transition-colors"
                >
                  {STRINGS.privacyPolicy}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-divider pt-8 text-center">
          <p className="text-sm text-quaternary">
            {STRINGS.footerTagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
