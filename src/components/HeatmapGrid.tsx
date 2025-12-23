import { useState } from 'react';
import { PlotData } from '@/data/mockData';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ChevronUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import gongabuSatellite from '@/assets/gongabu-satellite.jpg';

interface HeatmapGridProps {
  grid: PlotData[][];
  selectedPlot: PlotData | null;
  onSelectPlot: (plot: PlotData) => void;
}

export const HeatmapGrid = ({ grid, selectedPlot, onSelectPlot }: HeatmapGridProps) => {
  const [hoveredPlot, setHoveredPlot] = useState<PlotData | null>(null);
  const [showAreaRisk, setShowAreaRisk] = useState(false);
  const isMobile = useIsMobile();

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
    <div 
      className="w-full h-full relative"
      style={{
        backgroundImage: `url(${gongabuSatellite})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '400px'
      }}
    >
      {/* Subtle overlay for visibility */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Grid overlay - fills the entire container */}
      <div 
        className="absolute inset-0 grid p-2 sm:p-4 md:p-6"
        style={{ 
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: '2px'
        }}
      >
        {grid.flat().map((plot) => {
          const isSelected = selectedPlot?.id === plot.id;
          const isHovered = hoveredPlot?.id === plot.id;
          const showColor = isSelected || showAreaRisk;
          
          const PlotButton = (
            <button
              onClick={() => onSelectPlot(plot)}
              onMouseEnter={() => !isMobile && setHoveredPlot(plot)}
              onMouseLeave={() => !isMobile && setHoveredPlot(null)}
              onTouchStart={() => isMobile && setHoveredPlot(plot)}
              onTouchEnd={() => isMobile && setTimeout(() => setHoveredPlot(null), 1000)}
              className={cn(
                "w-full h-full rounded-sm transition-all duration-200 cursor-pointer border border-white/20 touch-manipulation flex items-center justify-center",
                showColor && getRiskColor(plot.exposureIntensity, isSelected, showAreaRisk && !isSelected),
                isSelected && "ring-2 ring-white ring-offset-1 ring-offset-transparent scale-[1.02] z-20 shadow-lg border-white/60",
                isHovered && !isSelected && "border-white/50 bg-white/20"
              )}
              aria-label={`Plot ${plot.plotNumber} - ${plot.areaName} - ${getRiskLevel(plot.exposureIntensity)} Risk`}
            >
              {isSelected && (
                <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow-lg">
                  ✓
                </span>
              )}
            </button>
          );

          // Only show tooltips on desktop
          if (isMobile) {
            return <div key={plot.id} className="w-full h-full">{PlotButton}</div>;
          }

          return (
            <Tooltip key={plot.id}>
              <TooltipTrigger asChild>
                {PlotButton}
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

      {/* Location label */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 glass rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 shadow-card z-30">
        <p className="text-xs sm:text-sm font-semibold text-foreground">Gongabu, Kathmandu</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground">गोंगबु</p>
      </div>

      {/* Area Risk Toggle */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 glass rounded-lg p-2 sm:p-3 shadow-card z-30">
        <div className="flex items-center gap-2 sm:gap-3">
          {showAreaRisk ? (
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          )}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Switch
              id="area-risk"
              checked={showAreaRisk}
              onCheckedChange={setShowAreaRisk}
              className="scale-90 sm:scale-100"
            />
            <Label htmlFor="area-risk" className="text-[10px] sm:text-xs font-medium cursor-pointer">
              {isMobile ? 'Area' : 'Show Area Risk'}
            </Label>
          </div>
        </div>
      </div>

      {/* Legend - only visible when area risk is shown */}
      {showAreaRisk && (
        <div className="absolute bottom-16 sm:bottom-4 left-2 sm:left-4 glass rounded-lg p-2 sm:p-3 shadow-card animate-fade-in z-30">
          <p className="text-[10px] sm:text-xs font-medium text-foreground mb-1.5 sm:mb-2">Risk Levels</p>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-[hsl(210,80%,55%)]" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-[hsl(45,95%,55%)]" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">Mod</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-[hsl(0,75%,55%)]" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">High</span>
            </div>
          </div>
        </div>
      )}

      {/* Selected plot info - mobile bottom bar */}
      {isMobile && selectedPlot && (
        <div className="absolute bottom-0 left-0 right-0 glass-strong rounded-t-xl px-4 py-3 shadow-card flex items-center justify-between z-30">
          <div>
            <p className="text-sm font-medium text-foreground">{selectedPlot.plotNumber}</p>
            <p className="text-xs text-muted-foreground">{selectedPlot.areaName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs px-2 py-1 rounded font-medium",
              getRiskLevel(selectedPlot.exposureIntensity) === 'Low' && "bg-[hsl(210,80%,55%)]/20 text-[hsl(210,80%,45%)]",
              getRiskLevel(selectedPlot.exposureIntensity) === 'Moderate' && "bg-[hsl(45,95%,55%)]/20 text-[hsl(45,80%,35%)]",
              getRiskLevel(selectedPlot.exposureIntensity) === 'Elevated' && "bg-[hsl(0,75%,55%)]/20 text-[hsl(0,75%,45%)]"
            )}>
              {getRiskLevel(selectedPlot.exposureIntensity)}
            </span>
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Coordinates display - desktop only */}
      {!isMobile && (hoveredPlot || selectedPlot) && (
        <div className="absolute bottom-4 right-4 glass rounded-lg px-3 py-2 shadow-card z-30">
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
        <div className={cn(
          "absolute glass rounded-lg px-3 py-2 shadow-card animate-pulse z-30",
          isMobile ? "bottom-4 left-1/2 -translate-x-1/2" : "bottom-4 left-4"
        )}>
          <p className="text-xs text-muted-foreground">
            {isMobile ? '👆 Tap a plot' : '👆 Click any plot to view analysis'}
          </p>
        </div>
      )}
    </div>
  );
};
