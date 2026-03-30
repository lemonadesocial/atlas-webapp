"use client";

import { useState, useEffect } from "react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import {
  CATEGORIES,
  SOURCE_PLATFORMS,
  DATE_FILTERS,
  SORT_OPTIONS,
} from "@/lib/utils/constants";
import { searchCities, getCityName, type NominatimResult } from "@/lib/services/nominatim";

export interface FilterValues {
  dateFilter: string;
  city: string;
  lat?: number;
  lng?: number;
  category: string;
  source_platform: string;
  free_only: boolean;
  sort: string;
}

interface FilterBarProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onClear: () => void;
}

const categoryOptions = [
  { value: "", label: "All Categories" },
  ...CATEGORIES.map((c) => ({ value: c.toLowerCase(), label: c })),
];

export function FilterBar({ values, onChange, onClear }: FilterBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cityInput, setCityInput] = useState(values.city);
  const [citySuggestions, setCitySuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (cityInput.length < 2) {
      setCitySuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await searchCities(cityInput);
      setCitySuggestions(results);
      setShowSuggestions(true);
    }, 1000); // 1s debounce per Nominatim policy
    return () => clearTimeout(timer);
  }, [cityInput]);

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          ...values,
          city: "Near me",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setCityInput("Near me");
      },
      () => {
        alert("Location access denied. Please enter a city manually.");
      }
    );
  };

  const selectCity = (result: NominatimResult) => {
    const name = getCityName(result);
    setCityInput(name);
    setShowSuggestions(false);
    onChange({
      ...values,
      city: name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    });
  };

  const hasActiveFilters =
    values.dateFilter ||
    values.city ||
    values.category ||
    values.source_platform ||
    values.free_only ||
    values.sort;

  const filterContent = (
    <div className="flex flex-wrap items-end gap-3">
      <Select
        id="date-filter"
        label="Date"
        options={[...DATE_FILTERS]}
        value={values.dateFilter}
        onChange={(e) =>
          onChange({ ...values, dateFilter: e.target.value })
        }
      />

      {/* City with autocomplete */}
      <div className="relative flex flex-col gap-1">
        <label htmlFor="city-filter" className="text-sm text-secondary">
          Location
        </label>
        <div className="flex gap-1">
          <input
            id="city-filter"
            type="text"
            value={cityInput}
            onChange={(e) => {
              setCityInput(e.target.value);
              if (!e.target.value) {
                onChange({ ...values, city: "", lat: undefined, lng: undefined });
              }
            }}
            onFocus={() => citySuggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="City..."
            className="w-32 rounded-md border border-card-border bg-card px-3 py-2 text-sm text-primary placeholder:text-quaternary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
            aria-label="Filter by city"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={handleNearMe}
            className="rounded-md border border-card-border bg-card px-2 py-2 text-xs text-tertiary transition-colors hover:bg-card-hover"
            aria-label="Use my location"
            title="Near me"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          </button>
        </div>
        {showSuggestions && citySuggestions.length > 0 && (
          <ul className="absolute left-0 top-full z-20 mt-1 max-h-48 w-64 overflow-y-auto rounded-md border border-card-border bg-overlay-primary shadow-lg">
            {citySuggestions.map((r) => (
              <li key={r.place_id}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-secondary hover:bg-card-hover"
                  onMouseDown={() => selectCity(r)}
                >
                  {r.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Select
        id="category-filter"
        label="Category"
        options={categoryOptions}
        value={values.category}
        onChange={(e) =>
          onChange({ ...values, category: e.target.value })
        }
      />

      <Select
        id="source-filter"
        label="Platform"
        options={[...SOURCE_PLATFORMS]}
        value={values.source_platform}
        onChange={(e) =>
          onChange({ ...values, source_platform: e.target.value })
        }
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm text-secondary">Price</label>
        <label className="flex items-center gap-2 rounded-md border border-card-border bg-card px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={values.free_only}
            onChange={(e) =>
              onChange({ ...values, free_only: e.target.checked })
            }
            className="accent-accent"
          />
          <span className="text-secondary">Free only</span>
        </label>
      </div>

      <Select
        id="sort-filter"
        label="Sort"
        options={[...SORT_OPTIONS]}
        value={values.sort}
        onChange={(e) => onChange({ ...values, sort: e.target.value })}
      />

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  );

  return (
    <div>
      {/* Mobile toggle */}
      <button
        className="mb-3 flex items-center gap-2 rounded-md bg-btn-tertiary px-3 py-2 text-sm text-btn-tertiary-content md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-expanded={mobileOpen}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="16" y2="12" />
          <line x1="4" y1="18" x2="12" y2="18" />
        </svg>
        Filters
        {hasActiveFilters && (
          <span className="h-2 w-2 rounded-full bg-accent" />
        )}
      </button>

      {/* Desktop: always visible. Mobile: toggle */}
      <div className={`${mobileOpen ? "block" : "hidden"} md:block`}>
        {filterContent}
      </div>
    </div>
  );
}
