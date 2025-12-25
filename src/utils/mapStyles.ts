// Map styling utilities
// Risk colors are derived from CSS variables for consistency

export const RISK_COLORS = {
  low: 'hsla(142, 76%, 36%, VAR)',      // green
  moderate: 'hsla(45, 93%, 47%, VAR)',   // yellow/amber
  high: 'hsla(0, 84%, 60%, VAR)'         // red
} as const;

// Get RGBA color for heatmap with adjustable opacity
export function getHeatmapColor(riskLevel: 'low' | 'moderate' | 'high', opacity: number): string {
  const baseColor = RISK_COLORS[riskLevel];
  return baseColor.replace('VAR', String(opacity));
}

// Get heatmap intensity color based on numeric value
export function getIntensityColor(intensity: number, opacity: number): string {
  if (intensity < 35) return getHeatmapColor('low', opacity);
  if (intensity < 65) return getHeatmapColor('moderate', opacity);
  return getHeatmapColor('high', opacity);
}

// Drawing tool styles
export const DRAWING_STYLES = {
  stroke: 'hsl(215, 70%, 55%)',
  fill: 'hsla(215, 70%, 55%, 0.15)',
  selectedFill: 'hsla(215, 70%, 55%, 0.25)',
  lineWidth: 2,
  lineDash: [5, 5],
  vertexRadius: 5
} as const;

// Heatmap default settings
export const HEATMAP_DEFAULTS = {
  opacity: 0.55,
  minOpacity: 0.2,
  maxOpacity: 0.8,
  blendMode: 'multiply' as GlobalCompositeOperation
} as const;
