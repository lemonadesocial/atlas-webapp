import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { STRINGS } from "@/lib/utils/constants";

export function ForOrganizers() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold text-primary">
              {STRINGS.forOrganizersTitle}
            </h2>
            <ul className="mt-6 space-y-4">
              {STRINGS.forOrganizersProps.map((prop, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mt-0.5 shrink-0 text-success"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-secondary">{prop}</span>
                </li>
              ))}
            </ul>
            <Link href="/onboard" className="mt-8 inline-block">
              <Button variant="primary" size="lg">
                Get Started
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center">
            {/* Platform logos */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              {STRINGS.supportedPlatforms.map((platform) => (
                <div
                  key={platform}
                  className="flex h-16 w-32 items-center justify-center rounded-lg border border-card-border bg-card text-sm font-medium text-secondary"
                >
                  {platform}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
