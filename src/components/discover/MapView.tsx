"use client";

import { useEffect, useRef, useState } from "react";
import type { AtlasSearchResultItem } from "@/lib/types/atlas";
import { formatPriceRange, formatDateShort } from "@/lib/utils/format";

interface MapViewProps {
  results: AtlasSearchResultItem[];
  center?: { lat: number; lng: number };
}

export function MapView({ results, center }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let cancelled = false;

    async function initMap() {
      try {
        // Dynamic import for Leaflet (client-side only)
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        if (cancelled || !mapRef.current) return;

        const defaultCenter = center || { lat: 48.8566, lng: 2.3522 };
        const map = L.map(mapRef.current).setView(
          [defaultCenter.lat, defaultCenter.lng],
          center ? 12 : 3
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
        }).addTo(map);

        // Custom marker icon
        const icon = L.divIcon({
          className: "atlas-marker",
          html: '<div style="background:#a78bfa;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const markers: Array<{ lat: number; lng: number }> = [];

        results.forEach((item) => {
          const { event } = item;
          if (event.latitude && event.longitude) {
            markers.push({ lat: event.latitude, lng: event.longitude });
            const marker = L.marker([event.latitude, event.longitude], {
              icon,
              title: event.title,
            }).addTo(map);

            marker.bindPopup(
              `<div style="min-width:180px">
                <strong>${event.title}</strong><br/>
                <span style="font-size:12px;color:#888">${formatDateShort(event.start)}</span><br/>
                <span style="font-size:12px">${formatPriceRange(event.min_price, event.max_price, event.currency)}</span><br/>
                <a href="/events/${event.id}" style="font-size:12px;color:#a78bfa">View details</a>
              </div>`
            );
          }
        });

        // Auto-fit bounds
        if (markers.length > 0) {
          const bounds = L.latLngBounds(
            markers.map((m) => [m.lat, m.lng])
          );
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        }

        mapInstanceRef.current = map;
        setLoading(false);
      } catch {
        setError(true);
        setLoading(false);
      }
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [results, center]);

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-card-border bg-card">
        <p className="text-sm text-tertiary">
          Map failed to load. Showing grid view instead.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-card">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="text-sm text-tertiary">Loading map...</p>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        className="h-96 w-full rounded-lg md:h-[500px]"
        role="application"
        aria-label="Event locations map"
      />
    </div>
  );
}
