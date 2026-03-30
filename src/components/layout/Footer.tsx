import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-divider bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-primary">Atlas</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/discover"
                  className="text-sm text-tertiary hover:text-secondary transition-colors"
                >
                  Explore Events
                </Link>
              </li>
              <li>
                <Link
                  href="/onboard"
                  className="text-sm text-tertiary hover:text-secondary transition-colors"
                >
                  List Your Events
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary">Protocol</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/docs"
                  className="text-sm text-tertiary hover:text-secondary transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/lemonadesocial/atlas-protocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-tertiary hover:text-secondary transition-colors"
                >
                  GitHub
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
                  Main Site
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary">Legal</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-tertiary hover:text-secondary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-tertiary hover:text-secondary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-divider pt-8 text-center">
          <p className="text-sm text-quaternary">
            Atlas Protocol by Lemonade
          </p>
        </div>
      </div>
    </footer>
  );
}
