"use client";

type View = "grid" | "map";

interface ViewToggleProps {
  view: View;
  onChange: (view: View) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex rounded-md border border-card-border" role="radiogroup" aria-label="View mode">
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={`flex items-center gap-1.5 rounded-l-md px-3 py-2 text-sm transition-colors ${
          view === "grid"
            ? "bg-btn-tertiary text-primary"
            : "text-tertiary hover:text-secondary"
        }`}
        role="radio"
        aria-checked={view === "grid"}
        aria-label="Grid view"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
        Grid
      </button>
      <button
        type="button"
        onClick={() => onChange("map")}
        className={`flex items-center gap-1.5 rounded-r-md px-3 py-2 text-sm transition-colors ${
          view === "map"
            ? "bg-btn-tertiary text-primary"
            : "text-tertiary hover:text-secondary"
        }`}
        role="radio"
        aria-checked={view === "map"}
        aria-label="Map view"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
        Map
      </button>
    </div>
  );
}
