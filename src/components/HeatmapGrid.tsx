import { useState } from 'react';
import { PlotData } from '@/data/mockData';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import gongabuSatellite from '@/assets/gongabu-satellite.jpg';

interface HeatmapGridProps {
  grid: PlotData[][];
  selectedPlot: PlotData | null;
  onSelectPlot: (plot: PlotData) => void;
}

export const HeatmapGrid = ({ grid, selectedPlot, onSelectPlot }: HeatmapGridProps) => {
  const [hoveredPlot, setHoveredPlot] = useState<PlotData | null>(null);

  const getHeatmapColor = (intensity: number): string => {
    if (intensity < 35) {
      return 'bg-heatmap-low/60 hover:bg-heatmap-low/80 border-heatmap-low/40';
    } else if (intensity < 65) {
      return 'bg-heatmap-medium/60 hover:bg-heatmap-medium/80 border-heatmap-medium/40';
    } else {
      return 'bg-heatmap-elevated/60 hover:bg-heatmap-elevated/80 border-heatmap-elevated/40';
    }
  };

  const rows = grid.length;
  const cols = grid[0]?.length || 10;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Satellite image background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${gongabuSatellite})` }}
      />
      
      {/* Dark overlay for better visibility */}
      <div className="absolute inset-0 bg-background/20" />

      {/* Grid overlay container */}
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
        <div 
          className="relative w-full h-full max-w-[700px] max-h-[560px] rounded-lg overflow-hidden shadow-2xl border border-border/30"
          style={{ aspectRatio: `${cols}/${rows}` }}
        >
          {/* Grid cells */}
          <div 
            className="absolute inset-0 grid gap-[2px] p-1"
            style={{ 
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
            }}
          >
            {grid.flat().map((plot) => (
              <Tooltip key={plot.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSelectPlot(plot)}
                    onMouseEnter={() => setHoveredPlot(plot)}
                    onMouseLeave={() => setHoveredPlot(null)}
                    className={cn(
                      "w-full h-full rounded-sm transition-all duration-200 cursor-pointer border backdrop-blur-[1px]",
                      getHeatmapColor(plot.exposureIntensity),
                      selectedPlot?.id === plot.id && "ring-2 ring-white ring-offset-1 ring-offset-transparent scale-[1.02] z-20 shadow-lg",
                      hoveredPlot?.id === plot.id && selectedPlot?.id !== plot.id && "scale-[1.02] z-10 brightness-110"
                    )}
                    aria-label={`Plot ${plot.plotNumber} - ${plot.areaName}`}
                  >
                    {selectedPlot?.id === plot.id && (
                      <span className="text-[8px] md:text-[10px] font-bold text-white drop-shadow-lg">
                        ✓
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs bg-card/95 backdrop-blur-sm">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">{plot.plotNumber}</p>
                    <p className="text-xs text-muted-foreground">{plot.areaName}</p>
                    <p className="text-[10px] text-muted-foreground/80 mt-1">
                      Click to view exposure analysis
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>

      {/* Location label */}
      <div className="absolute top-4 right-4 glass rounded-lg px-4 py-2 shadow-card">
        <p className="text-sm font-semibold text-foreground">Gongabu, Kathmandu</p>
        <p className="text-xs text-muted-foreground">गोंगबु</p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass rounded-lg p-3 shadow-card">
        <p className="text-xs font-medium text-foreground mb-2">Historical Exposure</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-sm bg-heatmap-low border border-heatmap-low/60" />
            <span className="text-xs text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-sm bg-heatmap-medium border border-heatmap-medium/60" />
            <span className="text-xs text-muted-foreground">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-sm bg-heatmap-elevated border border-heatmap-elevated/60" />
            <span className="text-xs text-muted-foreground">Elevated</span>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/70 mt-2 max-w-[200px]">
          Based on historical data only. Not a risk assessment.
        </p>
      </div>

      {/* Coordinates & Plot info display */}
      {(hoveredPlot || selectedPlot) && (
        <div className="absolute top-4 left-4 glass rounded-lg px-3 py-2 shadow-card">
          <p className="text-xs font-medium text-foreground">
            {(hoveredPlot || selectedPlot)?.plotNumber}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {(hoveredPlot || selectedPlot)?.coordinates.lat.toFixed(4)}°N, {(hoveredPlot || selectedPlot)?.coordinates.lng.toFixed(4)}°E
          </p>
        </div>
      )}

      {/* Click instruction */}
      {!selectedPlot && (
        <div className="absolute bottom-4 right-4 glass rounded-lg px-3 py-2 shadow-card animate-pulse">
          <p className="text-xs text-muted-foreground">
            👆 Click any plot to view analysis
          </p>
        </div>
      )}
    </div>
  );
};
