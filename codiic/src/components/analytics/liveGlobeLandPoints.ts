import landPointsData from './liveGlobeLandPoints.data.json';

export type GlobeLatLng = {
  lat: number;
  lng: number;
};

/** Precomputed hexagonal land samples (Shopify-style mesh). */
export const LIVE_GLOBE_LAND_POINTS: GlobeLatLng[] = (
  landPointsData as Array<[number, number]>
).map(([lat, lng]) => ({ lat, lng }));

/** Demo markers for UI (Ghaziabad area). */
export const LIVE_GLOBE_DEMO_MARKERS = {
  order: { lat: 28.67, lng: 77.45 } as GlobeLatLng,
  visitor: { lat: 28.55, lng: 77.2 } as GlobeLatLng,
};

export function latLngToCartesian(
  lat: number,
  lng: number,
  radius: number,
): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return [x, y, z];
}
