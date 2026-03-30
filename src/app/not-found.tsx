import Link from "next/link";
import { STRINGS } from "@/lib/utils/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-6xl font-bold text-quaternary">404</h1>
      <h2 className="text-xl font-semibold text-primary">
        {STRINGS.pageNotFound}
      </h2>
      <p className="text-secondary">
        The page you are looking for does not exist.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-md bg-btn-secondary px-4 py-2 text-sm font-medium text-btn-secondary-content transition-colors hover:bg-btn-secondary-hover"
        >
          Go Home
        </Link>
        <Link
          href="/discover"
          className="rounded-md bg-btn-tertiary px-4 py-2 text-sm font-medium text-btn-tertiary-content transition-colors hover:bg-btn-tertiary-hover"
        >
          Search Events
        </Link>
      </div>
    </div>
  );
}
