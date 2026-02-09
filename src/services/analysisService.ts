const API_ENDPOINT = 'https://fh8xxfnn-8000.inc1.devtunnels.ms/analyze-plot';

export interface AnalysisRequest {
  geometry: GeoJSON.Geometry;
}

export interface AnalysisResponse {
  flood_prob: number;
  agri_prob: number;
  ph: number;
  landslide_prob: number;
  slope: number;
  ndvi: number;
  rainfall: number;
  [key: string]: unknown;
}

export async function analyzePlot(geometry: GeoJSON.Geometry): Promise<AnalysisResponse> {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ geometry }),
  });

  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.status}`);
  }

  return response.json();
}
