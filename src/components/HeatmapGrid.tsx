import { useState, useMemo } from 'react';
import { PlotData } from '@/data/mockData';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface HeatmapGridProps {
  grid: PlotData[][];
  selectedPlot: PlotData | null;
  onSelectPlot: (plot: PlotData) => void;
}

export const HeatmapGrid = ({ grid, selectedPlot, onSelectPlot }: HeatmapGridProps) => {
  const [hoveredPlot, setHoveredPlot] = useState<PlotData | null>(null);

  const getHeatmapColor = (intensity: number): string => {
    // Gradient from soft blue -> amber -> terracotta (no red)
    if (intensity < 35) {
      return 'bg-heatmap-low/70 hover:bg-heatmap-low';
    } else if (intensity < 65) {
      return 'bg-heatmap-medium/70 hover:bg-heatmap-medium';
    } else {
      return 'bg-heatmap-elevated/70 hover:bg-heatmap-elevated';
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      {/* Simulated satellite background */}
      <div className="absolute inset-0 bg-gradient-to-br from-earth-300/30 via-earth-200/20 to-earth-100/30" />
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Grid overlay */}
      <div className="relative z-10 grid gap-1" style={{ 
        gridTemplateColumns: `repeat(${grid[0]?.length || 10}, 1fr)`,
        aspectRatio: '1',
        width: 'min(100%, 600px)',
        height: 'min(100%, 600px)',
      }}>
        {grid.flat().map((plot) => (
          <Tooltip key={plot.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSelectPlot(plot)}
                onMouseEnter={() => setHoveredPlot(plot)}
                onMouseLeave={() => setHoveredPlot(null)}
                className={cn(
                  "aspect-square rounded-sm transition-all duration-200 cursor-pointer",
                  getHeatmapColor(plot.exposureIntensity),
                  selectedPlot?.id === plot.id && "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-105 z-20",
                  hoveredPlot?.id === plot.id && selectedPlot?.id !== plot.id && "scale-105 z-10"
                )}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-xs font-medium">{plot.areaName}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Historical indicator frequency; not a risk score
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass rounded-lg p-3 shadow-card">
        <p className="text-xs font-medium text-foreground mb-2">Exposure Frequency</p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-sm bg-heatmap-low" />
            <span className="text-xs text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-sm bg-heatmap-medium" />
            <span className="text-xs text-muted-foreground">Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-sm bg-heatmap-elevated" />
            <span className="text-xs text-muted-foreground">Elevated</span>
          </div>
        </div>
      </div>

      {/* Coordinates display */}
      {hoveredPlot && (
        <div className="absolute top-4 left-4 glass rounded-lg px-3 py-2 shadow-card">
          <p className="text-xs text-muted-foreground">
            {hoveredPlot.coordinates.lat.toFixed(4)}°N, {hoveredPlot.coordinates.lng.toFixed(4)}°E
          </p>
        </div>
      )}
    </div>
  );
};
