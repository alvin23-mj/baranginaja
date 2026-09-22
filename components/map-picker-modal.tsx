"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat: number | null;
  initialLng: number | null;
  onSelectLocation: (lat: number, lng: number) => void;
}

const SURABAYA_LAT = -7.257472;
const SURABAYA_LNG = 112.752088;

export function MapPickerModal({
  isOpen,
  onClose,
  initialLat,
  initialLng,
  onSelectLocation,
}: MapPickerModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerInstanceRef = useRef<L.Marker | null>(null);

  const startLat = initialLat ?? SURABAYA_LAT;
  const startLng = initialLng ?? SURABAYA_LNG;

  const [selectedLat, setSelectedLat] = useState<number>(startLat);
  const [selectedLng, setSelectedLng] = useState<number>(startLng);
  const [addressText, setAddressText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState<boolean>(false);

  // Sync state with props when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedLat(initialLat ?? SURABAYA_LAT);
      setSelectedLng(initialLng ?? SURABAYA_LNG);
      setAddressText("");
      setSearchQuery("");
    }
  }, [isOpen, initialLat, initialLng]);

  // Reverse geocoding helper using Nominatim
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            "Accept-Language": "id,en",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          setAddressText(data.display_name);
        }
      }
    } catch {
      // Ignore geocode error if offline
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Destroy existing map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current).setView([selectedLat, selectedLng], 15);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Custom Map Pin Icon
    const customIcon = L.divIcon({
      className: "custom-map-pin",
      html: `
        <div style="
          transform: translate(-50%, -100%);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="#2563eb" stroke="#ffffff" stroke-width="1.5" style="filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.4));">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="3.5" fill="#ffffff" />
          </svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    const marker = L.marker([selectedLat, selectedLng], {
      draggable: true,
      icon: customIcon,
    }).addTo(map);
    markerInstanceRef.current = marker;

    fetchAddress(selectedLat, selectedLng);

    // Update coordinates when marker is dragged
    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      setSelectedLat(pos.lat);
      setSelectedLng(pos.lng);
      fetchAddress(pos.lat, pos.lng);
    });

    // Update marker when user clicks on map
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setSelectedLat(lat);
      setSelectedLng(lng);
      marker.setLatLng([lat, lng]);
      fetchAddress(lat, lng);
    });

    // Invalidate size after rendering to prevent gray tiles issue
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Handle Search Location
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const q = searchQuery.includes("Surabaya")
        ? searchQuery
        : `${searchQuery}, Surabaya, Indonesia`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`,
        {
          headers: {
            "Accept-Language": "id,en",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const newLat = parseFloat(data[0].lat);
          const newLng = parseFloat(data[0].lon);
          setSelectedLat(newLat);
          setSelectedLng(newLng);
          setAddressText(data[0].display_name);

          if (mapInstanceRef.current && markerInstanceRef.current) {
            mapInstanceRef.current.flyTo([newLat, newLng], 16);
            markerInstanceRef.current.setLatLng([newLat, newLng]);
          }
        } else {
          alert("Lokasi tidak ditemukan. Coba gunakan kata kunci lain.");
        }
      }
    } catch {
      alert("Gagal melakukan pencarian lokasi.");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Get GPS Location
  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung Geolocation.");
      return;
    }
    setIsLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setSelectedLat(lat);
        setSelectedLng(lng);
        setIsLocatingGPS(false);

        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 16);
          markerInstanceRef.current.setLatLng([lat, lng]);
        }
        fetchAddress(lat, lng);
      },
      (err) => {
        setIsLocatingGPS(false);
        alert(
          err.code === err.PERMISSION_DENIED
            ? "Izin lokasi ditolak oleh browser."
            : "Gagal mengambil lokasi GPS Anda."
        );
      }
    );
  };

  // Handle Confirm Selection
  const handleConfirm = () => {
    onSelectLocation(selectedLat, selectedLng);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-2xl h-[85vh] max-h-[680px] rounded-2xl bg-white shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-zinc-50">
                Pilih Lokasi dari Maps (Leaflet)
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Geser marker atau klik pada peta untuk menentukan posisi presisi
              </p>
            </div>
          </div>
          <button
            suppressHydrationWarning
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
            aria-label="Tutup Maps"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar & Toolbar */}
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row gap-2 shrink-0">
          <div className="flex flex-1 gap-2">
            <input
              suppressHydrationWarning
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchSubmit(e);
                }
              }}
              placeholder="Cari lokasi/alamat (contoh: ITS, Tunjungan, Benowo)..."
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-950 shadow-2xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <button
              suppressHydrationWarning
              type="button"
              onClick={handleSearchSubmit}
              disabled={isSearching}
              className="rounded-lg bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors shrink-0 disabled:opacity-60"
            >
              {isSearching ? "Mencari..." : "Cari"}
            </button>
          </div>

          <button
            suppressHydrationWarning
            type="button"
            onClick={handleGetGPS}
            disabled={isLocatingGPS}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors shrink-0 disabled:opacity-60"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{isLocatingGPS ? "GPS..." : "Lokasi Saya"}</span>
          </button>
        </div>

        {/* Map View Container */}
        <div className="relative flex-1 w-full bg-zinc-100 dark:bg-zinc-950">
          <div ref={mapContainerRef} className="absolute inset-0 z-10 w-full h-full" />
        </div>

        {/* Selected Coordinates & Address Footer */}
        <div className="p-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Koordinat:
              </span>
              <span className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                {selectedLat.toFixed(6)}, {selectedLng.toFixed(6)}
              </span>
            </div>
            {addressText && (
              <p className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400 truncate">
                {addressText}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              suppressHydrationWarning
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              Batal
            </button>
            <button
              suppressHydrationWarning
              type="button"
              onClick={handleConfirm}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              Gunakan Lokasi Ini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
