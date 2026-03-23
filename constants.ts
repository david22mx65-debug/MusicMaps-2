import { Coordinates } from "./types";

export const DEFAULT_CENTER: Coordinates = { lat: 19.4326, lng: -99.1332 }; // Mexico City as default
export const DEFAULT_ZOOM = 15;
export const MAX_ZOOM = 22; // Allow zooming in much closer (digital zoom past 19)
export const DEFAULT_RADIUS = 50; // meters

// Haversine formula to calculate distance between two points in meters
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (coord1.lat * Math.PI) / 180;
  const φ2 = (coord2.lat * Math.PI) / 180;
  const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const Δλ = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Point in Polygon (Ray Casting Algorithm)
export const isPointInPolygon = (point: Coordinates, polygon: Coordinates[]): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat;
    const xj = polygon[j].lng, yj = polygon[j].lat;
    const intersect = ((yi > point.lat) !== (yj > point.lat)) &&
      (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

// Point in Rectangle
export const isPointInRect = (point: Coordinates, bounds: [Coordinates, Coordinates]): boolean => {
  const [sw, ne] = bounds;
  const minLat = Math.min(sw.lat, ne.lat);
  const maxLat = Math.max(sw.lat, ne.lat);
  const minLng = Math.min(sw.lng, ne.lng);
  const maxLng = Math.max(sw.lng, ne.lng);
  return point.lat >= minLat && point.lat <= maxLat &&
         point.lng >= minLng && point.lng <= maxLng;
};

/**
 * Returns a dynamic Green Pixel Heart Icon (URI-encoded SVG)
 * The color parameter allows the icon to match the user's selected primary color.
 * Square 16x16 viewBox ensures it never deforms.
 */
export const getAppIcon = (color: string) => {
  const encodedColor = encodeURIComponent(color);
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='${encodedColor}' d='M4 3h3v1H4V3zm6 0h3v1h-3V3zM3 4h5v1H3V4zm5 0h5v1H8V4zM2 5h12v5H2V5zm1 5h10v1H3v-1zm1 1h8v1H4v-1zm1 1h6v1H5v-1zm1 1h4v1H6v-1zm1 1h2v1H7v-1z'/%3E%3C/svg%3E`;
};
