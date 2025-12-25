// GeoJSON data loading and filtering service
// Prepares the frontend for future Google Earth Engine integration

export interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    plot_id: string;
    flood_freq?: number;
    flood_risk?: 'low' | 'moderate' | 'high';
    elevation?: number;
    soil_type?: string;
    drainage_distance?: number;
    [key: string]: unknown;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon' | 'Point';
    coordinates: number[][][] | number[][][][] | number[];
  };
}

export interface GeoJSONCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// Load GeoJSON from file or API
export async function loadGeoJSON(path: string): Promise<GeoJSONCollection | null> {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load GeoJSON: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('GeoJSON loading error:', error);
    return null;
  }
}

// Filter features by property value
export function filterByProperty<T>(
  collection: GeoJSONCollection,
  property: string,
  value: T
): GeoJSONFeature[] {
  return collection.features.filter(
    (feature) => feature.properties[property] === value
  );
}

// Filter features by risk level
export function filterByRiskLevel(
  collection: GeoJSONCollection,
  levels: ('low' | 'moderate' | 'high')[]
): GeoJSONFeature[] {
  return collection.features.filter(
    (feature) => levels.includes(feature.properties.flood_risk as 'low' | 'moderate' | 'high')
  );
}

// Check if a point is inside a polygon (ray casting algorithm)
export function isPointInPolygon(point: [number, number], polygon: number[][]): boolean {
  let inside = false;
  const [x, y] = point;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}

// Get features that intersect with a drawn polygon
export function getFeaturesInPolygon(
  collection: GeoJSONCollection,
  drawnPolygon: number[][]
): GeoJSONFeature[] {
  return collection.features.filter((feature) => {
    if (feature.geometry.type === 'Point') {
      return isPointInPolygon(feature.geometry.coordinates as [number, number], drawnPolygon);
    }
    
    if (feature.geometry.type === 'Polygon') {
      // Check if centroid is inside drawn polygon
      const coords = feature.geometry.coordinates[0] as number[][];
      const centroid = getCentroid(coords);
      return isPointInPolygon(centroid, drawnPolygon);
    }
    
    return false;
  });
}

// Calculate polygon centroid
export function getCentroid(polygon: number[][]): [number, number] {
  let sumX = 0;
  let sumY = 0;
  const n = polygon.length;
  
  for (const [x, y] of polygon) {
    sumX += x;
    sumY += y;
  }
  
  return [sumX / n, sumY / n];
}

// Calculate polygon area (in coordinate units, for relative comparison)
export function calculatePolygonArea(polygon: number[][]): number {
  let area = 0;
  const n = polygon.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += polygon[i][0] * polygon[j][1];
    area -= polygon[j][0] * polygon[i][1];
  }
  
  return Math.abs(area / 2);
}
