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

// Conversion constants
// 1 Bigha = 6,772.63 m²
// 1 Bigha = 20 Katha
// 1 Katha = 20 Dhur
export const BIGHA_TO_M2 = 6772.63;
export const KATHA_PER_BIGHA = 20;
export const DHUR_PER_KATHA = 20;

// Convert m² to Terai local units
export function convertToTerai(areaM2: number): TeraiBigha {
  const totalBigha = areaM2 / BIGHA_TO_M2;
  const bigha = Math.floor(totalBigha);
  
  const remainingKatha = (totalBigha - bigha) * KATHA_PER_BIGHA;
  const katha = Math.floor(remainingKatha);
  
  const dhur = Math.round((remainingKatha - katha) * DHUR_PER_KATHA);
  
  return { bigha, katha, dhur };
}

// Convert m² to hectares
export function convertToHectares(areaM2: number): number {
  return areaM2 / 10000;
}

// Format Terai units as string
export function formatTeraiUnits(units: TeraiBigha): string {
  const parts: string[] = [];
  if (units.bigha > 0) parts.push(`${units.bigha} Bigha`);
  if (units.katha > 0) parts.push(`${units.katha} Katha`);
  if (units.dhur > 0) parts.push(`${units.dhur} Dhur`);
  return parts.length > 0 ? parts.join(', ') : '0 Dhur';
}
