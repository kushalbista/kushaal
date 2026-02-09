// Map-related type definitions

export interface ClickedFeature {
  isInFloodZone: boolean;
  properties: Record<string, unknown>;
  areaM2: number;
  coordinates: [number, number];
}

export interface TeraiBigha {
  bigha: number;
  katha: number;
  dhur: number;
}

export interface DrawnPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

// Conversion constants
export const BIGHA_TO_M2 = 6772.63;
export const KATHA_PER_BIGHA = 20;
export const DHUR_PER_KATHA = 20;

export function convertToTerai(areaM2: number): TeraiBigha {
  const totalBigha = areaM2 / BIGHA_TO_M2;
  const bigha = Math.floor(totalBigha);
  const remainingKatha = (totalBigha - bigha) * KATHA_PER_BIGHA;
  const katha = Math.floor(remainingKatha);
  const dhur = Math.round((remainingKatha - katha) * DHUR_PER_KATHA);
  return { bigha, katha, dhur };
}

export function convertToHectares(areaM2: number): number {
  return areaM2 / 10000;
}

export function formatTeraiUnits(units: TeraiBigha): string {
  const parts: string[] = [];
  if (units.bigha > 0) parts.push(`${units.bigha} Bigha`);
  if (units.katha > 0) parts.push(`${units.katha} Katha`);
  if (units.dhur > 0) parts.push(`${units.dhur} Dhur`);
  return parts.length > 0 ? parts.join(', ') : '0 Dhur';
}

// Sunsari bounds check
const SUNSARI_BOUNDS = { minLng: 87.002, maxLng: 87.311, minLat: 26.634, maxLat: 26.804 };

export function isWithinStudyArea(coords: number[][]): boolean {
  return coords.every(([lng, lat]) =>
    lng >= SUNSARI_BOUNDS.minLng && lng <= SUNSARI_BOUNDS.maxLng &&
    lat >= SUNSARI_BOUNDS.minLat && lat <= SUNSARI_BOUNDS.maxLat
  );
}
