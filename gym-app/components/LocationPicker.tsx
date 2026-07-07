"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 16);
  }, [lat, lng, map]);
  return null;
}

function DraggableMarker({
  lat,
  lng,
  onMove,
}: {
  lat: number;
  lng: number;
  onMove: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const pos = marker.getLatLng();
        onMove(pos.lat, pos.lng);
      }
    },
  };

  return (
    <Marker
      ref={markerRef}
      position={[lat, lng]}
      draggable={true}
      icon={icon}
      eventHandlers={eventHandlers}
    />
  );
}

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function SearchBox({ onSelect }: { onSelect: (lat: number, lng: number, name: string) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ lat: string; lon: string; display_name: string }[]>([]);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    }
  }, []);

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          search(e.target.value);
        }}
        placeholder="Search for your gym location..."
        className="w-full rounded-lg bg-white/[0.06] px-3.5 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none"
      />
      {results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-[1000] mt-1 rounded-lg border border-white/[0.08] bg-bg-base shadow-2xl">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onSelect(parseFloat(r.lat), parseFloat(r.lon), r.display_name);
                setQuery(r.display_name);
                setResults([]);
              }}
              className="w-full px-3.5 py-2.5 text-left text-xs text-text-secondary hover:bg-white/[0.04] first:rounded-t-lg last:rounded-b-lg"
            >
              {r.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LocationPicker({
  lat,
  lng,
  radius,
  onLocationChange,
  onRadiusChange,
}: {
  lat: number;
  lng: number;
  radius: number;
  onLocationChange: (lat: number, lng: number) => void;
  onRadiusChange: (r: number) => void;
}) {
  const [useMyLocation, setUseMyLocation] = useState(false);

  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setUseMyLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationChange(pos.coords.latitude, pos.coords.longitude);
        setUseMyLocation(false);
      },
      () => setUseMyLocation(false)
    );
  }, [onLocationChange]);

  const handleSearchSelect = useCallback(
    (slat: number, slng: number, _name: string) => {
      onLocationChange(slat, slng);
    },
    [onLocationChange]
  );

  const hasLocation = lat !== 0 || lng !== 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <SearchBox onSelect={handleSearchSelect} />
        </div>
        <button
          type="button"
          onClick={handleMyLocation}
          disabled={useMyLocation}
          className="shrink-0 rounded-lg bg-primary/15 px-3.5 py-2.5 text-xs font-medium text-primary hover:bg-primary/25 transition-all disabled:opacity-50"
        >
          {useMyLocation ? "Locating..." : "My Location"}
        </button>
      </div>

      <div className="h-56 w-full overflow-hidden rounded-xl">
        {hasLocation && typeof window !== "undefined" ? (
          <MapContainer
            center={[lat, lng]}
            zoom={16}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onMapClick={onLocationChange} />
            <DraggableMarker lat={lat} lng={lng} onMove={onLocationChange} />
            <MapUpdater lat={lat} lng={lng} />
          </MapContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl bg-white/[0.03] text-sm text-text-muted">
            Search or use your location to see the map
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs text-text-muted mb-1">Latitude</label>
          <input
            type="number"
            step="any"
            value={lat || ""}
            readOnly
            className="w-full rounded-lg bg-white/[0.03] px-3 py-2.5 text-sm text-text-muted outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-text-muted mb-1">Longitude</label>
          <input
            type="number"
            step="any"
            value={lng || ""}
            readOnly
            className="w-full rounded-lg bg-white/[0.03] px-3 py-2.5 text-sm text-text-muted outline-none"
          />
        </div>
        <div className="w-32">
          <label className="block text-xs text-text-muted mb-1">Radius (m)</label>
          <input
            type="number"
            min="10"
            step="10"
            value={radius}
            onChange={(e) => onRadiusChange(Math.max(10, Number(e.target.value) || 100))}
            placeholder="100"
            className="w-full rounded-lg bg-white/[0.04] px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none"
          />
        </div>
      </div>
    </div>
  );
}
