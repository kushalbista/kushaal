import { Droplets, Mountain, GitBranch, MapPin, Layers, Waves } from 'lucide-react';
import { PlotData } from '@/data/mockData';
import { ExposureBand } from './ExposureBand';
import { IndicatorCard } from './IndicatorCard';
import { ContextSection } from './ContextSection';
import { ActionButtons } from './ActionButtons';

interface IndicatorPanelProps {
  selectedPlot: PlotData | null;
}

export const IndicatorPanel = ({ selectedPlot }: IndicatorPanelProps) => {
  if (!selectedPlot) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Select a Plot</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Click on any cell in the Gongabu heatmap to view historical exposure indicators for that location.
        </p>
      </div>
    );
  }

  const { indicators, exposureLevel, contextualInfo, areaName, coordinates, plotNumber } = selectedPlot;

  const getPermeabilityVariant = (permeability?: string) => {
    if (!permeability) return 'moderate';
    if (permeability === 'high') return 'low';
    if (permeability === 'medium') return 'moderate';
    return 'elevated';
  };

  const getWaterTableVariant = (depth?: number) => {
    if (depth === undefined) return 'moderate';
    if (depth >= 6) return 'low';
    if (depth >= 4) return 'moderate';
    return 'elevated';
  };

  const soilType = indicators?.soilType;
  const waterTable = indicators?.waterTable;

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">Exposure Analysis</h2>
          <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
            {plotNumber}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Historical Indicators - Gongabu</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
            {areaName}
          </span>
          <span className="text-xs text-muted-foreground">
            {coordinates.lat.toFixed(4)}°N, {coordinates.lng.toFixed(4)}°E
          </span>
        </div>
      </div>

      {/* Exposure Band */}
      <ExposureBand level={exposureLevel} />

      {/* Indicator Cards */}
      <div className="space-y-3">
        <IndicatorCard
          icon={<Droplets className="w-5 h-5 text-heatmap-low" />}
          title="Flood History"
          value={`${indicators.floodHistory.yearsAffected} of ${indicators.floodHistory.totalYears} years`}
          subtitle={indicators.floodHistory.lastFloodYear 
            ? `Last recorded: ${indicators.floodHistory.lastFloodYear}` 
            : 'No recorded events'}
          tooltip="Plot overlaps recorded flood extents in the specified number of years out of the last 10 years of available data."
          variant={indicators.floodHistory.yearsAffected <= 2 ? 'low' : indicators.floodHistory.yearsAffected <= 5 ? 'moderate' : 'elevated'}
        />

        <IndicatorCard
          icon={<Mountain className="w-5 h-5 text-earth-400" />}
          title="Elevation"
          value={`${indicators.elevation.plotElevation}m`}
          subtitle={`${indicators.elevation.difference >= 0 ? '+' : ''}${indicators.elevation.difference}m vs ward avg (${indicators.elevation.wardAverage}m)`}
          tooltip="Mean elevation of the selected plot compared to the ward-level average elevation."
          variant={indicators.elevation.difference >= 0 ? 'low' : indicators.elevation.difference >= -10 ? 'moderate' : 'elevated'}
        />

        <IndicatorCard
          icon={<GitBranch className="w-5 h-5 text-heatmap-medium" />}
          title="Drainage Proximity"
          value={`${indicators.drainageProximity.distanceMeters}m`}
          subtitle={indicators.drainageProximity.drainageType}
          tooltip="Distance from the plot center to the nearest drainage feature (canal, drain, or water channel)."
          variant={indicators.drainageProximity.distanceMeters > 200 ? 'low' : indicators.drainageProximity.distanceMeters > 100 ? 'moderate' : 'elevated'}
        />

        {soilType && (
          <IndicatorCard
            icon={<Layers className="w-5 h-5 text-amber-600" />}
            title="Soil Type"
            value={soilType.type}
            subtitle={`Permeability: ${soilType.permeability}`}
            tooltip="Soil classification and permeability rating affects water drainage capacity and foundation considerations."
            variant={getPermeabilityVariant(soilType.permeability)}
          />
        )}

        {waterTable && (
          <IndicatorCard
            icon={<Waves className="w-5 h-5 text-blue-500" />}
            title="Water Table"
            value={`${waterTable.depthMeters}m depth`}
            subtitle={`Seasonal variation: ${waterTable.seasonalVariation}`}
            tooltip="Depth to groundwater table and its seasonal fluctuation. Shallow water tables may indicate drainage challenges."
            variant={getWaterTableVariant(waterTable.depthMeters)}
          />
        )}
      </div>

      {/* Context Section */}
      <ContextSection items={contextualInfo} />

      {/* Actions */}
      <div className="pt-4 border-t border-border">
        <ActionButtons plotNumber={plotNumber} />
      </div>
    </div>
  );
};
