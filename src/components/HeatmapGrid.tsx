import { useState } from 'react';
import { PlotData } from '@/data/mockData';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import gongabuSatellite from '@/assets/gongabu-satellite.jpg';

interface HeatmapGridProps {
  grid: PlotData[][];
  selectedPlot: PlotData | null;
  onSelectPlot: (plot: PlotData) => void;
}

export const HeatmapGrid = ({ grid, selectedPlot, onSelectPlot }: HeatmapGridProps) => {
  const [hoveredPlot, setHoveredPlot] = useState<PlotData | null>(null);
  const [showAreaRisk, setShowAreaRisk] = useState(false);

  const getRiskColor = (intensity: number, isSelected: boolean, isAreaView: boolean): string => {
    const opacity = isSelected ? '70' : isAreaView ? '50' : '0';
    
    if (intensity < 35) {
      return `bg-[hsl(210,80%,55%)]/${opacity}`;
    } else if (intensity < 65) {
      return `bg-[hsl(45,95%,55%)]/${opacity}`;
    } else {
      return `bg-[hsl(0,75%,55%)]/${opacity}`;
    }
  };

  const getRiskLevel = (intensity: number): 'Low' | 'Moderate' | 'Elevated' => {
    if (intensity < 35) return 'Low';
    if (intensity < 65) return 'Moderate';
    return 'Elevated';
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
      
      {/* Subtle dark overlay for visibility */}
      <div className="absolute inset-0 bg-background/10" />

      {/* Grid overlay container */}
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
        <div 
          className="relative w-full h-full max-w-[700px] max-h-[560px] rounded-lg overflow-hidden shadow-2xl border border-border/30"
          style={{ aspectRatio: `${cols}/${rows}` }}
        >
          {/* Grid cells */}
          <div 
            className="absolute inset-0 grid gap-[1px] p-0.5"
            style={{ 
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
            }}
          >
            {grid.flat().map((plot) => {
              const isSelected = selectedPlot?.id === plot.id;
              const isHovered = hoveredPlot?.id === plot.id;
              const showColor = isSelected || showAreaRisk;
              
              return (
                <Tooltip key={plot.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onSelectPlot(plot)}
                      onMouseEnter={() => setHoveredPlot(plot)}
                      onMouseLeave={() => setHoveredPlot(null)}
                      className={cn(
                        "w-full h-full rounded-sm transition-all duration-200 cursor-pointer border border-transparent",
                        showColor && getRiskColor(plot.exposureIntensity, isSelected, showAreaRisk && !isSelected),
                        isSelected && "ring-2 ring-white ring-offset-1 ring-offset-transparent scale-[1.03] z-20 shadow-lg border-white/50",
                        isHovered && !isSelected && "border-white/40 scale-[1.02] z-10 bg-white/10"
                      )}
                      aria-label={`Plot ${plot.plotNumber} - ${plot.areaName}`}
                    >
                      {isSelected && (
                        <span className="text-[10px] md:text-xs font-bold text-white drop-shadow-lg">
                          ✓
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs bg-card/95 backdrop-blur-sm">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-foreground">{plot.plotNumber}</p>
                      <p className="text-xs text-muted-foreground">{plot.areaName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-medium",
                          getRiskLevel(plot.exposureIntensity) === 'Low' && "bg-[hsl(210,80%,55%)]/20 text-[hsl(210,80%,45%)]",
                          getRiskLevel(plot.exposureIntensity) === 'Moderate' && "bg-[hsl(45,95%,55%)]/20 text-[hsl(45,80%,35%)]",
                          getRiskLevel(plot.exposureIntensity) === 'Elevated' && "bg-[hsl(0,75%,55%)]/20 text-[hsl(0,75%,45%)]"
                        )}>
                          {getRiskLevel(plot.exposureIntensity)} Risk
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground/80 mt-1">
                        Click to view analysis
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>

      {/* Location label */}
      <div className="absolute top-4 right-4 glass rounded-lg px-4 py-2 shadow-card">
        <p className="text-sm font-semibold text-foreground">Gongabu, Kathmandu</p>
        <p className="text-xs text-muted-foreground">गोंगबु</p>
      </div>

      {/* Area Risk Toggle */}
      <div className="absolute top-4 left-4 glass rounded-lg p-3 shadow-card">
        <div className="flex items-center gap-3">
          {showAreaRisk ? (
            <Eye className="w-4 h-4 text-primary" />
          ) : (
            <EyeOff className="w-4 h-4 text-muted-foreground" />
          )}
          <div className="flex items-center gap-2">
            <Switch
              id="area-risk"
              checked={showAreaRisk}
              onCheckedChange={setShowAreaRisk}
            />
            <Label htmlFor="area-risk" className="text-xs font-medium cursor-pointer">
              Show Area Risk
            </Label>
          </div>
        </div>
      </div>

      {/* Legend - only visible when area risk is shown */}
      {showAreaRisk && (
        <div className="absolute bottom-4 left-4 glass rounded-lg p-3 shadow-card animate-fade-in">
          <p className="text-xs font-medium text-foreground mb-2">Risk Levels</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-sm bg-[hsl(210,80%,55%)]" />
              <span className="text-xs text-muted-foreground">Low</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-sm bg-[hsl(45,95%,55%)]" />
              <span className="text-xs text-muted-foreground">Moderate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-sm bg-[hsl(0,75%,55%)]" />
              <span className="text-xs text-muted-foreground">Elevated</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/70 mt-2 max-w-[200px]">
            Based on historical data only. Not a risk assessment.
          </p>
        </div>
      )}

      {/* Coordinates & Plot info display */}
      {(hoveredPlot || selectedPlot) && (
        <div className="absolute bottom-4 right-4 glass rounded-lg px-3 py-2 shadow-card">
          <p className="text-xs font-medium text-foreground">
            {(hoveredPlot || selectedPlot)?.plotNumber}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {(hoveredPlot || selectedPlot)?.coordinates.lat.toFixed(4)}°N, {(hoveredPlot || selectedPlot)?.coordinates.lng.toFixed(4)}°E
          </p>
        </div>
      )}

      {/* Click instruction */}
      {!selectedPlot && !showAreaRisk && (
        <div className="absolute bottom-4 left-4 glass rounded-lg px-3 py-2 shadow-card animate-pulse">
          <p className="text-xs text-muted-foreground">
            👆 Click any plot to view analysis
          </p>
        </div>
      )}
    </div>
  );
};
