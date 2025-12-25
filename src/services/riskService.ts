// Risk computation and mapping service
// All risk values are computed from data, not hardcoded

import { PlotData } from '@/data/mockData';

export type RiskLevel = 'low' | 'moderate' | 'high';

export interface RiskAnalysis {
  level: RiskLevel;
  label: string;
  score: number; // 0-100
  floodFrequency: number;
  avgElevation: number;
  totalArea: number;
  dataSource: string;
  confidence: 'high' | 'medium' | 'low';
}

// Map intensity to risk level - consistent across the app
export function getRiskLevel(intensity: number): RiskLevel {
  if (intensity < 35) return 'low';
  if (intensity < 65) return 'moderate';
  return 'high';
}

// Get display label for risk level
export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'Low Risk';
    case 'moderate': return 'Moderate Risk';
    case 'high': return 'High Risk';
  }
}

// Compute risk analysis for selected plots
export function computeRiskAnalysis(plots: PlotData[]): RiskAnalysis | null {
  if (plots.length === 0) return null;

  // Calculate averages
  const avgIntensity = plots.reduce((sum, p) => sum + p.exposureIntensity, 0) / plots.length;
  const avgElevation = plots.reduce((sum, p) => sum + p.indicators.elevation.plotElevation, 0) / plots.length;
  const totalFloodYears = plots.reduce((sum, p) => sum + p.indicators.floodHistory.yearsAffected, 0);
  const avgFloodFreq = totalFloodYears / plots.length;

  // Estimate area (mock: 500 sq.m per plot)
  const totalArea = plots.length * 500;

  const level = getRiskLevel(avgIntensity);

  return {
    level,
    label: getRiskLabel(level),
    score: Math.round(avgIntensity),
    floodFrequency: Math.round(avgFloodFreq * 10) / 10,
    avgElevation: Math.round(avgElevation),
    totalArea,
    dataSource: 'Derived from satellite flood history (2009–2019)',
    confidence: plots.length >= 3 ? 'high' : plots.length >= 1 ? 'medium' : 'low'
  };
}

// Get risk color for CSS classes
export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'hsl(var(--risk-low))';
    case 'moderate': return 'hsl(var(--risk-moderate))';
    case 'high': return 'hsl(var(--risk-elevated))';
  }
}

// Get risk badge CSS class
export function getRiskBadgeClass(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'risk-badge-low';
    case 'moderate': return 'risk-badge-moderate';
    case 'high': return 'risk-badge-elevated';
  }
}

// Get risk card CSS class
export function getRiskCardClass(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'risk-card-low';
    case 'moderate': return 'risk-card-moderate';
    case 'high': return 'risk-card-elevated';
  }
}

// Compute aggregate statistics for a drawn polygon area
export interface PolygonRiskStats {
  plotCount: number;
  riskLevel: RiskLevel;
  riskScore: number;
  floodFrequency: string;
  dataSource: string;
  avgElevation: number;
  dominantSoilType: string;
}

export function computePolygonStats(plots: PlotData[]): PolygonRiskStats {
  if (plots.length === 0) {
    return {
      plotCount: 0,
      riskLevel: 'low',
      riskScore: 0,
      floodFrequency: '0/10 years',
      dataSource: 'Derived from satellite flood history',
      avgElevation: 0,
      dominantSoilType: 'Unknown'
    };
  }

  const avgIntensity = plots.reduce((sum, p) => sum + p.exposureIntensity, 0) / plots.length;
  const avgElevation = plots.reduce((sum, p) => sum + p.indicators.elevation.plotElevation, 0) / plots.length;
  const avgFloodYears = plots.reduce((sum, p) => sum + p.indicators.floodHistory.yearsAffected, 0) / plots.length;

  // Find dominant soil type
  const soilCounts: Record<string, number> = {};
  plots.forEach(p => {
    const soil = p.indicators.soilType.type;
    soilCounts[soil] = (soilCounts[soil] || 0) + 1;
  });
  const dominantSoilType = Object.entries(soilCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

  return {
    plotCount: plots.length,
    riskLevel: getRiskLevel(avgIntensity),
    riskScore: Math.round(avgIntensity),
    floodFrequency: `${Math.round(avgFloodYears)}/10 years`,
    dataSource: 'Derived from satellite flood history',
    avgElevation: Math.round(avgElevation),
    dominantSoilType
  };
}
