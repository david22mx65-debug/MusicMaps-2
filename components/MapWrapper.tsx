import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, useMap, useMapEvents, Rectangle, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { Coordinates, Zone } from '../types';

// Fix for default marker icons in Leaflet with React
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapWrapperProps {
  userLocation: Coordinates;
  zones: Zone[];
  onMapClick: (coords: Coordinates) => void;
  isAutoCenterEnabled: boolean;
  onManualDrag: () => void;
  theme: 'dark' | 'light';
}

// Component to handle auto-centering
const AutoCenter: React.FC<{ center: Coordinates, enabled: boolean }> = ({ center, enabled }) => {
  const map = useMap();
  useEffect(() => {
    if (enabled) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, enabled, map]);
  return null;
};

// Component to fix the "cut off" map issue by invalidating size
const ResizeHandler: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    // Invalidate size on mount and after a small delay to ensure container is ready
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    
    const handleResize = () => {
      map.invalidateSize();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [map]);
  return null;
};

// Component to handle map events
const MapEvents: React.FC<{ onMapClick: (coords: Coordinates) => void, onManualDrag: () => void }> = ({ onMapClick, onManualDrag }) => {
  useMapEvents({
    click: (e) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
    dragstart: () => {
      onManualDrag();
    },
    zoomstart: () => {
      onManualDrag();
    }
  });
  return null;
};

const MapWrapper: React.FC<MapWrapperProps> = ({ 
  userLocation, 
  zones, 
  onMapClick, 
  isAutoCenterEnabled,
  onManualDrag,
  theme
}) => {
  return (
    <div className={`w-full h-full relative z-0 ${theme === 'light' ? 'bg-[#f5f5f5]' : 'bg-[#121212]'}`}>
      <MapContainer 
        center={[userLocation.lat, userLocation.lng]} 
        zoom={15} 
        scrollWheelZoom={true}
        zoomControl={false}
        className="h-full w-full"
      >
        {/* CartoDB TileLayer based on theme */}
        {theme === 'dark' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
        )}

        <AutoCenter center={userLocation} enabled={isAutoCenterEnabled} />
        <ResizeHandler />
        <MapEvents onMapClick={onMapClick} onManualDrag={onManualDrag} />

        {/* User Location Marker */}
        <Circle
          center={[userLocation.lat, userLocation.lng]}
          radius={15}
          pathOptions={{ 
            fillColor: '#1DB954', 
            fillOpacity: 0.6, 
            color: theme === 'light' ? '#000' : '#fff', 
            weight: 2 
          }}
        />
        <Circle
          center={[userLocation.lat, userLocation.lng]}
          radius={40}
          pathOptions={{ 
            fillColor: '#1DB954', 
            fillOpacity: 0.1, 
            color: 'transparent' 
          }}
        />

        {/* Zones */}
        {zones.map(zone => {
          const commonOptions = {
            fillColor: '#1DB954',
            fillOpacity: 0.15,
            color: '#1DB954',
            weight: 1,
            dashArray: '5, 5'
          };

          let shapeComponent = null;

          if (!zone.shape || zone.shape === 'circle') {
            shapeComponent = (
              <Circle
                center={[zone.center.lat, zone.center.lng]}
                radius={zone.radius}
                pathOptions={commonOptions}
              />
            );
          } else if (zone.shape === 'rectangle' && zone.bounds) {
            shapeComponent = (
              <Rectangle
                bounds={[[zone.bounds[0].lat, zone.bounds[0].lng], [zone.bounds[1].lat, zone.bounds[1].lng]]}
                pathOptions={commonOptions}
              />
            );
          } else if (zone.shape === 'square') {
            const latDiff = (zone.radius / 111320);
            const lngDiff = (zone.radius / (111320 * Math.cos(zone.center.lat * Math.PI / 180)));
            const bounds: [[number, number], [number, number]] = [
              [zone.center.lat - latDiff, zone.center.lng - lngDiff],
              [zone.center.lat + latDiff, zone.center.lng + lngDiff]
            ];
            shapeComponent = (
              <Rectangle
                bounds={bounds}
                pathOptions={commonOptions}
              />
            );
          } else if ((zone.shape === 'triangle' || zone.shape === 'custom') && zone.points) {
            shapeComponent = (
              <Polygon
                positions={zone.points.map(p => [p.lat, p.lng])}
                pathOptions={commonOptions}
              />
            );
          }

          return (
            <React.Fragment key={zone.id}>
              {shapeComponent}
              <Marker 
                position={[zone.center.lat, zone.center.lng]}
                icon={L.divIcon({
                  className: 'custom-div-icon',
                  html: `<div style="color: #1DB954; font-weight: bold; font-size: 10px; text-shadow: ${theme === 'light' ? '0 0 4px rgba(255,255,255,0.8)' : '0 0 4px rgba(0,0,0,0.8)'}; white-space: nowrap; transform: translate(-50%, -120%);">${zone.name.toUpperCase()}</div>`,
                  iconSize: [0, 0]
                })}
              />
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* HUD Info */}
      <div className="absolute bottom-6 left-6 z-[400] flex flex-col gap-1 pointer-events-none">
        <div className={`backdrop-blur text-[10px] px-2 py-1 rounded border opacity-60 ${theme === 'light' ? 'bg-white/80 text-black border-black/10' : 'bg-black/80 text-white border-white/10'}`}>
          STREET MAP MODE (NO API KEY)
        </div>
        <div className={`backdrop-blur text-[8px] px-2 py-1 rounded border opacity-40 font-mono ${theme === 'light' ? 'bg-white/80 text-black border-black/10' : 'bg-black/80 text-white border-white/10'}`}>
          LAT: {userLocation.lat.toFixed(4)} LNG: {userLocation.lng.toFixed(4)}
        </div>
      </div>
    </div>
  );
};

export default MapWrapper;