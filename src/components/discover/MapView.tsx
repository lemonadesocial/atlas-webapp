"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type L from "leaflet";
import type { AtlasSearchResultItem } from "@/lib/types/atlas";
import { formatPriceRange, formatDateShort } from "@/lib/utils/format";
import { escapeHtml } from "@/lib/utils/escape";

interface MapViewProps {
  results: AtlasSearchResultItem[];
  center?: { lat: number; lng: number };
}

export function MapView({ results, center }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const leafletRef = useRef<typeof L | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const updateMarkers = useCallback(
    (Leaf: typeof L, map: L.Map, items: AtlasSearchResultItem[]) => {
      if (markersRef.current) {
        markersRef.current.clearLayers();
      } else {
        markersRef.current = Leaf.layerGroup().addTo(map);
      }

      const icon = Leaf.divIcon({
        className: "atlas-marker",
        html: '<div style="background:#a78bfa;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const coords: Array<[number, number]> = [];

      items.forEach((item) => {
        const { event } = item;
        if (event.latitude && event.longitude) {
          coords.push([event.latitude, event.longitude]);
          const marker = Leaf.marker([event.latitude, event.longitude], {
            icon,
            title: event.title,
          });

          const safeTitle = escapeHtml(event.title);
          const safeDate = escapeHtml(formatDateShort(event.start));
          const safePrice = escapeHtml(
            formatPriceRange(event.min_price, event.max_price, event.currency)
          );
          const safeId = escapeHtml(event.id || "");

          marker.bindPopup(
            `<div style="min-width:180px">
              <strong>${safeTitle}</strong><br/>
              <span style="font-size:12px;color:#888">${safeDate}</span><br/>
              <span style="font-size:12px">${safePrice}</span><br/>
              ${safeId ? `<a href="/events/${safeId}" style="font-size:12px;color:#a78bfa">View details</a>` : ""}
            </div>`
          );

          markersRef.current!.addLayer(marker);
        }
      });

      if (coords.length > 0) {
        const bounds = Leaf.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    },
    []
  );

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let cancelled = false;

    async function initMap() {
      try {
        const Leaf = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        if (cancelled || !mapRef.current) return;

        const defaultCenter = center || { lat: 48.8566, lng: 2.3522 };
        const map = Leaf.map(mapRef.current).setView(
          [defaultCenter.lat, defaultCenter.lng],
          center ? 12 : 3
        );

        Leaf.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
        }).addTo(map);

        mapInstanceRef.current = map;
        leafletRef.current = Leaf;
        setLoading(false);

        updateMarkers(Leaf, map, results);
      } catch {
        setError(true);
        setLoading(false);
      }
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when results change
  useEffect(() => {
    if (mapInstanceRef.current && leafletRef.current) {
      updateMarkers(leafletRef.current, mapInstanceRef.current, results);
    }
  }, [results, updateMarkers]);

  // Re-center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView([center.lat, center.lng], 12);
    }
  }, [center]);

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
