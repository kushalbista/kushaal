import { useState } from 'react';
import { PlotData } from '@/data/mockData';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ChevronUp, ZoomIn, ZoomOut, Crosshair } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MapToolbar, DrawingTool } from './MapToolbar';
import { Button } from '@/components/ui/button';
import gongabuSatellite from '@/assets/gongabu-satellite.jpg';

interface HeatmapGridProps {
  grid: PlotData[][];
  selectedPlot: PlotData | null;
  onSelectPlot: (plot: PlotData) => void;
}

export const HeatmapGrid = ({ grid, selectedPlot, onSelectPlot }: HeatmapGridProps) => {
  const [hoveredPlot, setHoveredPlot] = useState<PlotData | null>(null);
  const [showAreaRisk, setShowAreaRisk] = useState(false);
  const [activeTool, setActiveTool] = useState<DrawingTool>('select');
  const [hasDrawing, setHasDrawing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const isMobile = useIsMobile();

  const getRiskColor = (intensity: number, isSelected: boolean, isAreaView: boolean): string => {
    const opacity = isSelected ? '60' : isAreaView ? '45' : '0';
    
    if (intensity < 35) {
      return `bg-[hsl(var(--risk-low))]/${opacity}`;
    } else if (intensity < 65) {
      return `bg-[hsl(var(--risk-moderate))]/${opacity}`;
    } else {
      return `bg-[hsl(var(--risk-elevated))]/${opacity}`;
    }
  };

  const getRiskLevel = (intensity: number): 'Low' | 'Moderate' | 'Elevated' => {
    if (intensity < 35) return 'Low';
    if (intensity < 65) return 'Moderate';
    return 'Elevated';
  };

  const getRiskBadgeClass = (level: 'Low' | 'Moderate' | 'Elevated') => {
    switch (level) {
      case 'Low': return 'risk-badge-low';
      case 'Moderate': return 'risk-badge-moderate';
      case 'Elevated': return 'risk-badge-elevated';
    }
  };

  const handleToolChange = (tool: DrawingTool) => {
    setActiveTool(tool);
  };

  const handleUndo = () => {
    // Placeholder for undo functionality
  };

  const handleClear = () => {
    setHasDrawing(false);
  };

  const handleConfirm = () => {
    // Placeholder for confirm analysis
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  const rows = grid.length;
  const cols = grid[0]?.length || 10;

  return (
    <div className="w-full h-full relative overflow-hidden bg-muted">
      {/* Map Container with zoom */}
      <div 
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center'
        }}
      >
        {/* Satellite Image */}
        <img
          src={gongabuSatellite}
          alt="Gongabu satellite view"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Subtle overlay for better grid visibility */}
        <div className="absolute inset-0 bg-black/5" />

        {/* Grid overlay */}
        <div 
          className="absolute inset-0 grid p-2 md:p-4 lg:p-6"
          style={{ 
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: isMobile ? '1px' : '2px'
          }}
        >
          {grid.flat().map((plot) => {
            const isSelected = selectedPlot?.id === plot.id;
            const isHovered = hoveredPlot?.id === plot.id;
            const showColor = isSelected || showAreaRisk;
            const riskLevel = getRiskLevel(plot.exposureIntensity);
            
            const PlotButton = (
              <button
                onClick={() => onSelectPlot(plot)}
                onMouseEnter={() => !isMobile && setHoveredPlot(plot)}
                onMouseLeave={() => !isMobile && setHoveredPlot(null)}
                onTouchStart={() => isMobile && setHoveredPlot(plot)}
                onTouchEnd={() => isMobile && setTimeout(() => setHoveredPlot(null), 800)}
                className={cn(
                  "w-full h-full rounded-sm transition-all duration-200 cursor-pointer border border-white/15 touch-manipulation flex items-center justify-center",
                  showColor && getRiskColor(plot.exposureIntensity, isSelected, showAreaRisk && !isSelected),
                  isSelected && "ring-2 ring-white ring-offset-1 ring-offset-transparent scale-[1.03] z-20 shadow-lg border-white/70",
                  isHovered && !isSelected && "border-white/40 bg-white/15 scale-[1.02]"
                )}
                aria-label={`Plot ${plot.plotNumber} - ${plot.areaName} - ${riskLevel} Risk`}
              >
                {isSelected && (
                  <span className="text-[10px] md:text-xs font-bold text-white drop-shadow-lg">
                    ✓
                  </span>
                )}
              </button>
            );

            if (isMobile) {
              return <div key={plot.id} className="w-full h-full">{PlotButton}</div>;
            }

            return (
              <Tooltip key={plot.id}>
                <TooltipTrigger asChild>
                  {PlotButton}
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs bg-card/95 backdrop-blur-sm border-border">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-foreground">{plot.plotNumber}</p>
                    <p className="text-xs text-muted-foreground">{plot.areaName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded font-medium",
                        getRiskBadgeClass(riskLevel)
                      )}>
                        {riskLevel} Risk
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/80 mt-1.5">
                      Click to view detailed analysis
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Map Toolbar - Drawing Tools */}
      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-30">
        <MapToolbar
          activeTool={activeTool}
          onToolChange={handleToolChange}
          onUndo={handleUndo}
          onClear={handleClear}
          onConfirm={handleConfirm}
          hasDrawing={hasDrawing}
          canUndo={false}
        />
      </div>

      {/* Location & Heatmap Toggle Panel */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 z-30 flex flex-col gap-2">
        {/* Location Label */}
        <div className="glass-strong rounded-lg px-3 py-2 md:px-4 md:py-2.5 shadow-lg">
          <p className="text-xs md:text-sm font-semibold text-foreground">Gongabu, Kathmandu</p>
          <p className="text-[10px] md:text-xs text-muted-foreground">27.7350°N, 85.3206°E</p>
        </div>

        {/* Area Risk Toggle */}
        <div className="glass-strong rounded-lg p-2 md:p-3 shadow-lg">
          <div className="flex items-center gap-2 md:gap-3">
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
                className="scale-90 md:scale-100"
              />
              <Label htmlFor="area-risk" className="text-[10px] md:text-xs font-medium cursor-pointer whitespace-nowrap">
                {isMobile ? 'Heatmap' : 'Show Heatmap'}
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-20 md:bottom-4 right-2 md:right-4 z-30 flex flex-col gap-1">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomIn}
          className="h-8 w-8 md:h-9 md:w-9 glass-strong shadow-lg"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomOut}
          className="h-8 w-8 md:h-9 md:w-9 glass-strong shadow-lg"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleResetZoom}
          className="h-8 w-8 md:h-9 md:w-9 glass-strong shadow-lg"
          aria-label="Reset zoom"
        >
          <Crosshair className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend - only visible when heatmap is shown */}
      {showAreaRisk && (
        <div className="absolute bottom-20 md:bottom-4 left-2 md:left-4 glass-strong rounded-lg p-2 md:p-3 shadow-lg animate-fade-in z-30">
          <p className="text-[10px] md:text-xs font-medium text-foreground mb-1.5 md:mb-2">Risk Levels</p>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm bg-[hsl(var(--risk-low))]" />
              <span className="text-[10px] md:text-xs text-muted-foreground">Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm bg-[hsl(var(--risk-moderate))]" />
              <span className="text-[10px] md:text-xs text-muted-foreground">Mod</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm bg-[hsl(var(--risk-elevated))]" />
              <span className="text-[10px] md:text-xs text-muted-foreground">High</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile: Selected Plot Bottom Bar */}
      {isMobile && selectedPlot && (
        <div className="absolute bottom-0 left-0 right-0 glass-strong rounded-t-xl px-4 py-3 shadow-lg flex items-center justify-between z-30 border-t border-border">
          <div>
            <p className="text-sm font-semibold text-foreground">{selectedPlot.plotNumber}</p>
            <p className="text-xs text-muted-foreground">{selectedPlot.areaName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs px-2.5 py-1 rounded-md font-medium",
              getRiskBadgeClass(getRiskLevel(selectedPlot.exposureIntensity))
            )}>
              {getRiskLevel(selectedPlot.exposureIntensity)}
            </span>
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Desktop: Coordinates Display */}
      {!isMobile && (hoveredPlot || selectedPlot) && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-strong rounded-lg px-4 py-2 shadow-lg z-30">
          <p className="text-xs font-medium text-foreground">
            {(hoveredPlot || selectedPlot)?.plotNumber} • {(hoveredPlot || selectedPlot)?.areaName}
          </p>
          <p className="text-[10px] text-muted-foreground text-center">
            {(hoveredPlot || selectedPlot)?.coordinates.lat.toFixed(4)}°N, {(hoveredPlot || selectedPlot)?.coordinates.lng.toFixed(4)}°E
          </p>
        </div>
      )}

      {/* Initial instruction */}
      {!selectedPlot && !showAreaRisk && !isMobile && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 glass-strong rounded-lg px-4 py-2 shadow-lg animate-pulse-soft z-30">
          <p className="text-xs text-muted-foreground">
            👆 Click any plot to view risk analysis, or use drawing tools to select a custom area
          </p>
        </div>
      )}
    </div>
  );
};