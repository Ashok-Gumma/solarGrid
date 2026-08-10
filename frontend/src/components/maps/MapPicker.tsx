import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Check, Search, Loader2 } from 'lucide-react';

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onConfirm: (location: { address: string; lat: number; lng: number }) => void;
  onCancel?: () => void;
}

export function MapPicker({
  initialLat = 18.5204,
  initialLng = 73.8567,
  initialAddress = '',
  onConfirm,
  onCancel,
}: MapPickerProps) {
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [address, setAddress] = useState(initialAddress || 'Site Location, India');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([lat, lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background-color:#183d2a;color:#c5df54;padding:3px 8px;border-radius:10px;font-size:10px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3);position:absolute;bottom:38px;left:-50px;">Solar Installation Site</div><div style="font-size:32px;line-height:1;color:#a62b2b;text-align:center;">📍</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([lat, lng], { draggable: true, icon: customIcon }).addTo(map);
      markerRef.current = marker;
      mapInstanceRef.current = map;

      // Click on map to place pin
      map.on('click', (e: L.LeafletMouseEvent) => {
        const newLat = e.latlng.lat;
        const newLng = e.latlng.lng;
        setLat(newLat);
        setLng(newLng);
        marker.setLatLng([newLat, newLng]);
        reverseGeocode(newLat, newLng);
      });

      // Drag marker
      marker.on('dragend', () => {
        const newPos = marker.getLatLng();
        setLat(newPos.lat);
        setLng(newPos.lng);
        reverseGeocode(newPos.lat, newPos.lng);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const updateMapPosition = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([newLat, newLng], 15);
      markerRef.current.setLatLng([newLat, newLng]);
    }
  };

  // Reverse geocode via OpenStreetMap Nominatim
  const reverseGeocode = async (latitude: number, longitude: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch (err) {
      console.warn('Geocoding fallback:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Forward address search via Nominatim
  const handleSearch = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const topResult = data[0];
        const newLat = parseFloat(topResult.lat);
        const newLng = parseFloat(topResult.lon);
        updateMapPosition(newLat, newLng);
        setAddress(topResult.display_name);
      } else {
        alert('Location not found. Please try searching another landmark or city.');
      }
    } catch (err) {
      alert('Could not connect to map search service.');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Browser Real-time GPS Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        updateMapPosition(newLat, newLng);
        reverseGeocode(newLat, newLng);
      },
      () => {
        setIsGeocoding(false);
        alert('Unable to retrieve your live GPS location. Please allow browser location access.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[#cdd5bd] bg-[#fbfcf6] p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-[#183d2a]">
          <MapPin size={18} className="text-[#658e38]" />
          <span>Real-World Leaflet Interactive Map</span>
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#cdd5bd] bg-white px-3 py-1.5 text-xs font-bold text-[#244f36] hover:bg-[#eaf1d8] transition cursor-pointer shadow-xs"
        >
          <Navigation size={13} className="text-[#5d8136]" /> Use My Live GPS Location
        </button>
      </div>

      {/* Address Search Container */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-3 text-[#7d8c80]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e);
              }
            }}
            placeholder="Search any town, city, landmark, or street address..."
            className="w-full rounded-xl border border-[#ccd6c5] bg-white pl-9 pr-3 py-2 text-xs text-[#27472f] outline-none focus:border-[#6f9841]"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={isGeocoding}
          className="rounded-xl bg-[#244f36] px-4 py-2 text-xs font-bold text-white hover:bg-[#183d2a] disabled:opacity-50 transition cursor-pointer"
        >
          {isGeocoding ? <Loader2 size={14} className="animate-spin" /> : 'Search'}
        </button>
      </div>

      {/* Leaflet Real Interactive Map Container */}
      <div className="relative h-64 w-full overflow-hidden rounded-xl border border-[#b8c6a8] bg-[#e4ecda] shadow-inner z-0">
        <div ref={mapContainerRef} className="h-full w-full z-0" />

        {isGeocoding && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="flex items-center gap-2 rounded-xl bg-[#183d2a] px-3 py-2 text-xs font-bold text-white shadow-md">
              <Loader2 size={15} className="animate-spin text-[#c5df54]" />
              <span>Fetching Real-World Address...</span>
            </div>
          </div>
        )}

        {/* Real-time Lat & Lng Overlay Badge */}
        <div className="absolute bottom-2 left-2 z-10 rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-mono text-[#183d2a] backdrop-blur border border-[#cdd5bd] shadow-xs">
          <b>GPS:</b> {lat.toFixed(5)}, {lng.toFixed(5)}
        </div>
      </div>

      {/* Confirmed Real-World Address Field */}
      <div>
        <label className="mb-1 block text-[11px] font-bold uppercase text-[#738276]">
          Confirmed Installation Site Address
        </label>
        <textarea
          rows={2}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Click pin or drag on map to auto-fill street address..."
          className="w-full rounded-xl border border-[#ccd6c5] bg-white p-2.5 text-xs text-[#27472f] outline-none focus:border-[#6f9841]"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-3.5 py-2 text-xs font-semibold text-[#5a6a5e] hover:bg-[#eaeedb] cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={() => onConfirm({ address, lat, lng })}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#244f36] px-5 py-2 text-xs font-bold text-white hover:bg-[#183d2a] cursor-pointer shadow-sm"
        >
          <Check size={14} /> Confirm Location
        </button>
      </div>
    </div>
  );
}
