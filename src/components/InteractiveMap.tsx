import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Sanctuary, SpeciesCategory, IUCNStatus } from '../types';
import { MapPin, Navigation, Compass, Layers, Info, ExternalLink, Calendar, Users, ShieldAlert } from 'lucide-react';

interface InteractiveMapProps {
  sanctuaries: Sanctuary[];
  selectedSanctuary: Sanctuary | null;
  onSelectSanctuary: (s: Sanctuary) => void;
  onApplyVolunteer: (s: Sanctuary) => void;
  language: 'es' | 'en';
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  sanctuaries,
  selectedSanctuary,
  onSelectSanctuary,
  onApplyVolunteer,
  language
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const zoneCircleRef = useRef<L.Circle | null>(null);

  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite' | 'terrain'>('streets');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [maxRadiusFilter, setMaxRadiusFilter] = useState<number | 'all'>('all');

  // Species icons or colors
  const getMarkerIcon = (category: SpeciesCategory, isSelected: boolean) => {
    let color = '#0f766e'; // teal
    if (category === 'big_cats') color = '#d97706'; // amber
    if (category === 'primates') color = '#15803d'; // emerald
    if (category === 'marine_wildlife') color = '#0284c7'; // cyan
    if (category === 'megaherbivores') color = '#7c2d12'; // warm brown
    if (category === 'raptors_birds') color = '#4f46e5'; // indigo

    const size = isSelected ? 34 : 26;
    const border = isSelected ? '3px solid #ffffff' : '2px solid #ffffff';
    const shadow = isSelected ? '0 0 16px rgba(15, 118, 110, 0.8)' : '0 2px 6px rgba(0,0,0,0.3)';

    return L.divIcon({
      className: 'custom-wildlife-pin',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border: ${border};
          border-radius: 50%;
          box-shadow: ${shadow};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 11px;
          transition: transform 0.2s ease;
        ">
          <svg width="${size * 0.55}" height="${size * 0.55}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path>
            <circle cx="12" cy="10" r="2.5"></circle>
          </svg>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2 - 4]
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [12.0, 15.0],
      zoom: 3,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial base layer (Esri World Street Map - 100% Free, No API Key Required, Fast & High Contrast)
    const baseLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China, TomTom',
      maxZoom: 19
    }).addTo(map);

    (map as any)._baseTileLayer = baseLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if ((map as any)._baseTileLayer) {
      map.removeLayer((map as any)._baseTileLayer);
    }

    let url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
    let attr = 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China, TomTom';
    let maxZ = 19;

    if (mapLayer === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attr = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
      maxZ = 18;
    } else if (mapLayer === 'terrain') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      attr = 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey';
      maxZ = 18;
    }

    const newLayer = L.tileLayer(url, { attribution: attr, maxZoom: maxZ }).addTo(map);
    (map as any)._baseTileLayer = newLayer;
  }, [mapLayer]);

  // Handle markers & polygons
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    if (zoneCircleRef.current) {
      zoneCircleRef.current.remove();
      zoneCircleRef.current = null;
    }

    // Filter by nearby radius if user location exists and radius set
    const displayedSanctuaries = sanctuaries.filter(s => {
      if (userLocation && maxRadiusFilter !== 'all') {
        const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, s.lat, s.lng);
        return dist <= maxRadiusFilter;
      }
      return true;
    });

    displayedSanctuaries.forEach(s => {
      const isSelected = selectedSanctuary?.id === s.id;
      const marker = L.marker([s.lat, s.lng], {
        icon: getMarkerIcon(s.speciesCategories[0], isSelected),
        title: s.name
      }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div style="min-width: 260px; max-width: 300px; font-family: inherit;">
          <div style="height: 120px; width: 100%; overflow: hidden; background: #1e293b; position: relative;">
            <img src="${s.imageUrl}" alt="${s.name}" referrerpolicy="no-referrer" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'" />
            <div style="position: absolute; bottom: 8px; left: 8px; background: rgba(15, 23, 42, 0.85); color: #f8fafc; font-size: 11px; padding: 2px 6px; font-weight: 600;">
              ${s.country}
            </div>
          </div>
          <div style="padding: 12px;">
            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px; line-height: 1.3;">
              ${s.name}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">
              ${s.rescuedAnimalTypes.slice(0, 2).join(' · ')}
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #475569; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-bottom: 10px;">
              <span><strong>${s.interventionAreaHectares.toLocaleString()} ha</strong> protegidas</span>
              <span style="color: #0f766e; font-weight: 600;">${s.rewildingSuccessRatePercent}% éxito</span>
            </div>
            <div style="display: flex; gap: 6px;">
              <button id="view-sanc-${s.id}" style="flex: 1; padding: 6px 8px; background: #0f766e; color: white; border: none; font-size: 11px; font-weight: 600; cursor: pointer; text-align: center;">
                ${language === 'es' ? 'Ver Detalles' : 'View Details'}
              </button>
              <button id="nav-sanc-${s.id}" style="padding: 6px 8px; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; font-size: 11px; cursor: pointer;" title="Google Maps">
                ↗
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        onSelectSanctuary(s);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-sanc-${s.id}`);
        if (btn) {
          btn.onclick = () => onSelectSanctuary(s);
        }
        const navBtn = document.getElementById(`nav-sanc-${s.id}`);
        if (navBtn) {
          navBtn.onclick = () => {
            window.open(`https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`, '_blank');
          };
        }
      });

      markersRef.current[s.id] = marker;
    });

    // If a sanctuary is selected, draw its active intervention zone perimeter
    if (selectedSanctuary) {
      // Draw approximate conservation buffer zone circle based on hectares
      const radiusMeters = Math.sqrt((selectedSanctuary.interventionAreaHectares * 10000) / Math.PI);
      const zoneCircle = L.circle([selectedSanctuary.lat, selectedSanctuary.lng], {
        radius: Math.min(radiusMeters, 25000), // bounded display
        color: '#0f766e',
        fillColor: '#0f766e',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 4'
      }).addTo(map);

      zoneCircleRef.current = zoneCircle;

      // Pan to selected sanctuary
      map.flyTo([selectedSanctuary.lat, selectedSanctuary.lng], 9, {
        duration: 1.2
      });

      if (markersRef.current[selectedSanctuary.id]) {
        markersRef.current[selectedSanctuary.id].openPopup();
      }
    }
  }, [sanctuaries, selectedSanctuary, userLocation, maxRadiusFilter, language]);

  // Geolocation trigger
  const handleLocateUser = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert(language === 'es' ? 'La geolocalización no es compatible con este navegador' : 'Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo([latitude, longitude], 6);
          // Add user pin
          const userPin = L.divIcon({
            className: 'user-location-pin',
            html: `
              <div style="width: 16px; height: 16px; background: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 12px rgba(37,99,235,0.8);"></div>
            `,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });
          L.marker([latitude, longitude], { icon: userPin, title: 'Tu posición de campo' }).addTo(map);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        alert(language === 'es' ? 'No se pudo obtener la ubicación GPS' : 'Could not retrieve GPS location');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative w-full h-[620px] rounded-none border border-slate-200 dark:border-slate-800 bg-slate-900 overflow-hidden flex flex-col">
      {/* Top Map HUD Controls */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-1.5 border border-slate-200 dark:border-slate-700 shadow-sm max-w-[calc(100%-24px)]">
        {/* Layer selector */}
        <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 px-1 border-r border-slate-200 dark:border-slate-700">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={() => setMapLayer('streets')}
            className={`px-2 py-1 text-xs font-medium transition-colors ${mapLayer === 'streets' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'hover:text-slate-900 dark:hover:text-white'}`}
          >
            {language === 'es' ? 'Plano' : 'Street'}
          </button>
          <button
            onClick={() => setMapLayer('satellite')}
            className={`px-2 py-1 text-xs font-medium transition-colors ${mapLayer === 'satellite' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'hover:text-slate-900 dark:hover:text-white'}`}
          >
            {language === 'es' ? 'Satélite' : 'Satellite'}
          </button>
          <button
            onClick={() => setMapLayer('terrain')}
            className={`px-2 py-1 text-xs font-medium transition-colors ${mapLayer === 'terrain' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'hover:text-slate-900 dark:hover:text-white'}`}
          >
            {language === 'es' ? 'Relieve' : 'Terrain'}
          </button>
        </div>

        {/* GPS Location Finder */}
        <button
          onClick={handleLocateUser}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-700 text-white hover:bg-emerald-800 transition-colors disabled:opacity-50"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? (language === 'es' ? 'Localizando...' : 'Locating...') : (language === 'es' ? 'Cerca de mí' : 'Near me')}</span>
        </button>

        {/* Radius Filter when user location exists */}
        {userLocation && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 pl-1 border-l border-slate-200 dark:border-slate-700">
            <span className="font-mono text-slate-400">Radio:</span>
            <select
              value={maxRadiusFilter}
              onChange={(e) => setMaxRadiusFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              aria-label="Radio de búsqueda"
              className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-1.5 py-0.5 text-slate-800 dark:text-slate-200"
            >
              <option value="all">{language === 'es' ? 'Sin límite' : 'Global'}</option>
              <option value={1000}>&le; 1.000 km</option>
              <option value={3000}>&le; 3.000 km</option>
              <option value={6000}>&le; 6.000 km</option>
            </select>
          </div>
        )}
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Bottom Floating Card for active selection */}
      {selectedSanctuary && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-4 shadow-lg">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {selectedSanctuary.country} · {selectedSanctuary.continent}
              </div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                {selectedSanctuary.name}
              </h4>
            </div>
            <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
              {selectedSanctuary.rewildingSuccessRatePercent}% rewilding
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
            {selectedSanctuary.description}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 py-2 border-t border-b border-slate-100 dark:border-slate-800 mb-3 font-mono">
            <div>
              <span className="block text-slate-400 text-[10px] uppercase">Área Activa</span>
              {selectedSanctuary.interventionAreaHectares.toLocaleString()} ha
            </div>
            <div>
              <span className="block text-slate-400 text-[10px] uppercase">Estancia Mín.</span>
              {selectedSanctuary.volunteerProgram.minDays} días
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onApplyVolunteer(selectedSanctuary)}
              className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-medium transition-colors text-center"
            >
              {language === 'es' ? 'Gestionar Voluntariado' : 'Manage Volunteering'}
            </button>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${selectedSanctuary.lat},${selectedSanctuary.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700"
              title="Abrir coordenadas en Google Maps"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Map Legend (quiet, non-pill) */}
      <div className="absolute top-3 right-3 z-[1000] hidden md:flex flex-col gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-2.5 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
        <span className="font-semibold text-slate-900 dark:text-white mb-1">
          {language === 'es' ? 'Grupos de Fauna' : 'Fauna Groups'}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 shrink-0"></span>
          <span>Primates</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0"></span>
          <span>Grandes Felinos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-900 shrink-0"></span>
          <span>Paquidermos & Sabana</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600 shrink-0"></span>
          <span>Fauna Marina & Quelonios</span>
        </div>
      </div>
    </div>
  );
};
