"use client";

import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Crosshair, MapPin, Loader2 } from "lucide-react";

// Fix icon Leaflet di Next.js agar tidak hilang
const iconUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png";
const iconRetinaUrl =
  "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const shadowUrl =
  "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png";

const customIcon = new L.Icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationPickerProps {
  initialLat?: string;
  initialLng?: string;
  onConfirmLocation: (lat: string, lng: string) => void;
  onClose: () => void;
}

export default function LocationPicker({
  initialLat,
  initialLng,
  onConfirmLocation,
  onClose,
}: LocationPickerProps) {
  // Koordinat default (Solo) atau koordinat sebelumnya
  const defaultCenter = {
    lat: initialLat ? parseFloat(initialLat) : -7.566139,
    lng: initialLng ? parseFloat(initialLng) : 110.82303,
  };

  const [position, setPosition] = useState(defaultCenter);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);

  const handleConfirm = () => {
    onConfirmLocation(position.lat.toString(), position.lng.toString());
    onClose();
  };

  // --- KOMPONEN KONTROL PETA ---

  // 1. Menangani KLIK user di peta (Pindah Pin)
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });
    return null;
  }

  // 2. Komponen Tombol "Lokasi Saya" (Diperbaiki dengan Native API)
  function LocateControl() {
    const map = useMap();
    const [isLocating, setIsLocating] = useState(false);

    const handleLocate = (e: React.MouseEvent) => {
      // Mencegah event bubbling (agar tidak dianggap klik peta)
      e.preventDefault();
      e.stopPropagation();

      setIsLocating(true);

      if (!navigator.geolocation) {
        alert("Browser Anda tidak mendukung Geolocation.");
        setIsLocating(false);
        return;
      }

      // Menggunakan Native Browser API agar lebih stabil daripada Leaflet built-in
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const newPos = { lat: latitude, lng: longitude };

          // 1. Update State Pin
          setPosition(newPos);

          // 2. Simpan data akurasi (untuk lingkaran biru)
          setUserLocation({ ...newPos, accuracy });

          // 3. Gerakkan Peta (FlyTo)
          map.flyTo(newPos, 18, {
            animate: true,
            duration: 1.5, // durasi animasi detik
          });

          setIsLocating(false);
        },
        (err) => {
          setIsLocating(false);
          console.error("Geolocation error:", err);

          let errorMsg = "Gagal mendeteksi lokasi.";
          if (err.code === 1)
            errorMsg =
              "Izin lokasi ditolak. Mohon izinkan akses lokasi di browser.";
          if (err.code === 2)
            errorMsg = "Sinyal GPS tidak ditemukan. Pastikan GPS aktif.";
          if (err.code === 3) errorMsg = "Waktu permintaan habis.";

          // Peringatan khusus untuk akses via IP Address (Bukan Localhost)
          if (
            window.location.hostname !== "localhost" &&
            window.location.protocol !== "https:"
          ) {
            errorMsg +=
              "\n\nCATATAN: Browser memblokir GPS karena Anda mengakses via HTTP (IP Address). Gunakan 'localhost' atau deploy ke HTTPS.";
          }

          alert(errorMsg);
        },
        {
          enableHighAccuracy: true, // Paksa GPS akurat
          timeout: 10000,
          maximumAge: 0,
        }
      );
    };

    return (
      <div className="leaflet-bottom leaflet-right">
        <div className="leaflet-control leaflet-bar m-4">
          <Button
            size="icon"
            className="bg-white hover:bg-gray-100 text-gray-800 shadow-md border border-gray-300 h-12 w-12 rounded-full flex items-center justify-center"
            onClick={handleLocate}
            title="Lokasi Saya"
            type="button"
          >
            {isLocating ? (
              <Loader2 className="h-6 w-6 text-[#8B6F47] animate-spin" />
            ) : (
              <Crosshair className="h-6 w-6 text-[#8B6F47]" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  // 3. Update tampilan peta saat position berubah manual (saat user klik peta)
  // Ini opsional, tapi bagus agar peta selalu center ke pin saat pertama buka
  function MapRecenter({ center }: { center: { lat: number; lng: number } }) {
    const map = useMap();
    // Hanya recenter jika jaraknya jauh (misal inisialisasi awal)
    // Kita tidak pakai useEffect terus menerus agar user masih bisa geser peta tanpa ditarik balik
    useEffect(() => {
      map.flyTo(center, map.getZoom());
    }, []); // Hanya jalan sekali saat mount
    return null;
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 relative min-h-[300px] w-full rounded-md overflow-hidden border border-gray-300 z-0">
        <MapContainer
          center={defaultCenter}
          zoom={15}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Logika-logika Peta */}
          <MapClickHandler />
          <LocateControl />
          <MapRecenter center={defaultCenter} />

          {/* Marker Utama (Pin Merah) */}
          <Marker position={position} icon={customIcon} />

          {/* Lingkaran Area Akurasi GPS User */}
          {userLocation && (
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={userLocation.accuracy}
              pathOptions={{
                color: "#4285F4",
                fillColor: "#4285F4",
                fillOpacity: 0.15,
                weight: 1,
              }}
            />
          )}
        </MapContainer>

        {/* Overlay Info di Atas Peta */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-[400] bg-white/95 backdrop-blur px-4 py-2 rounded-full shadow-lg text-xs font-medium text-gray-700 border border-gray-200 flex items-center gap-2 whitespace-nowrap">
          <MapPin className="h-3 w-3 text-red-500 fill-red-500" />
          Klik peta untuk menentukan titik
        </div>
      </div>

      <div className="pt-4 flex justify-between items-center gap-2 bg-white border-t mt-auto">
        <div className="text-xs text-gray-500 hidden sm:block">
          {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 sm:flex-none"
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-[#8B6F47] hover:bg-[#5D4037] text-white flex-1 sm:flex-none"
          >
            Pilih Lokasi Ini
          </Button>
        </div>
      </div>
    </div>
  );
}
