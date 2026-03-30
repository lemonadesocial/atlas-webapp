"use client";

import { useState, useEffect } from "react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import {
  CATEGORIES,
  SOURCE_PLATFORMS,
  DATE_FILTERS,
  SORT_OPTIONS,
  PRICE_MODES,
  STRINGS,
} from "@/lib/utils/constants";
import { searchCities, getCityName, type NominatimResult } from "@/lib/services/nominatim";

export interface FilterValues {
  dateFilter: string;
  city: string;
  lat?: number;
  lng?: number;
  categories: string[];
  source_platform: string;
  priceMode: string;
  price_min?: number;
  price_max?: number;
  sort: string;
}

interface FilterBarProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onClear: () => void;
}

export function FilterBar({ values, onChange, onClear }: FilterBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cityInput, setCityInput] = useState(values.city);
  const [citySuggestions, setCitySuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => {
    if (cityInput.length < 2) {
      setCitySuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await searchCities(cityInput);
      setCitySuggestions(results);
      setShowSuggestions(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [cityInput]);

  // M13: IP-based geolocation fallback
  const ipFallback = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/", {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.city && data.latitude && data.longitude) {
        onChange({
          ...values,
          city: data.city,
          lat: data.latitude,
          lng: data.longitude,
        });
        setCityInput(data.city);
        setLocationError("");
      }
    } catch {
      // IP geolocation also failed, leave empty
    }
  };

  const handleNearMe = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError(STRINGS.locationUnavailable);
      ipFallback();
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
        setLocationError(STRINGS.locationDenied);
        ipFallback();
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

  const toggleCategory = (cat: string) => {
    const current = values.categories;
    const next = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    onChange({ ...values, categories: next });
  };

  const hasActiveFilters =
    values.dateFilter ||
    values.city ||
    values.categories.length > 0 ||
    values.source_platform ||
    values.priceMode ||
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

      {/* City with autocomplete (L14: ARIA combobox) */}
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
              setLocationError("");
              if (!e.target.value) {
                onChange({ ...values, city: "", lat: undefined, lng: undefined });
              }
            }}
            onFocus={() => citySuggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="City..."
            className="w-44 rounded-md border border-card-border bg-card px-3 py-2 text-sm text-primary placeholder:text-quaternary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
            role="combobox"
            aria-expanded={showSuggestions && citySuggestions.length > 0}
            aria-autocomplete="list"
            aria-controls="city-suggestions"
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
        {locationError && (
          <p className="text-xs text-warning">{locationError}</p>
        )}
        {showSuggestions && citySuggestions.length > 0 && (
          <ul
            id="city-suggestions"
            role="listbox"
            className="absolute left-0 top-full z-20 mt-1 max-h-48 w-64 overflow-y-auto rounded-md border border-card-border bg-overlay-primary shadow-lg"
          >
            {citySuggestions.map((r) => (
              <li key={r.place_id} role="option" aria-selected={false}>
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

      {/* M14: Multi-select category */}
      <div className="relative flex flex-col gap-1">
        <label className="text-sm text-secondary">Category</label>
        <button
          type="button"
          onClick={() => setCategoryOpen(!categoryOpen)}
          className="flex items-center gap-2 rounded-md border border-card-border bg-card px-3 py-2 text-sm text-primary"
          aria-expanded={categoryOpen}
          aria-haspopup="listbox"
        >
          {values.categories.length > 0
            ? `${values.categories.length} selected`
            : "All Categories"}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {categoryOpen && (
          <div
            className="absolute left-0 top-full z-20 mt-1 max-h-48 w-48 overflow-y-auto rounded-md border border-card-border bg-overlay-primary shadow-lg"
            role="listbox"
            aria-multiselectable="true"
          >
            {CATEGORIES.map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-secondary hover:bg-card-hover cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={values.categories.includes(cat.toLowerCase())}
                  onChange={() => toggleCategory(cat.toLowerCase())}
                  className="accent-accent"
                />
                {cat}
              </label>
            ))}
          </div>
        )}
      </div>

      <Select
        id="source-filter"
        label="Platform"
        options={[...SOURCE_PLATFORMS]}
        value={values.source_platform}
        onChange={(e) =>
          onChange({ ...values, source_platform: e.target.value })
        }
      />

      {/* H3: Price filter with Free/Paid/Range */}
      <div className="flex flex-col gap-1">
        <Select
          id="price-mode"
          label="Price"
          options={[...PRICE_MODES]}
          value={values.priceMode}
          onChange={(e) =>
            onChange({
              ...values,
              priceMode: e.target.value,
              price_min: undefined,
              price_max: undefined,
            })
          }
        />
      </div>
      {values.priceMode === "range" && (
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="price-min" className="text-sm text-secondary">Min</label>
            <input
              id="price-min"
              type="number"
              min="0"
              placeholder="0"
              value={values.price_min ?? ""}
              onChange={(e) =>
                onChange({
                  ...values,
                  price_min: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-20 rounded-md border border-card-border bg-card px-2 py-2 text-sm text-primary focus:border-accent focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="price-max" className="text-sm text-secondary">Max</label>
            <input
              id="price-max"
              type="number"
              min="0"
              placeholder="Any"
              value={values.price_max ?? ""}
              onChange={(e) =>
                onChange({
                  ...values,
                  price_max: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-20 rounded-md border border-card-border bg-card px-2 py-2 text-sm text-primary focus:border-accent focus:outline-none"
            />
          </div>
        </div>
      )}

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
