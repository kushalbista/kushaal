import { useState, useCallback, useMemo } from 'react';
import { PlotData } from '@/data/mockData';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ZoomIn, ZoomOut, Crosshair } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MapToolbar, DrawingTool } from './MapToolbar';
import { DrawingCanvas } from './DrawingCanvas';
import { Button } from '@/components/ui/button';
import gongabuSatellite from '@/assets/gongabu-satellite.jpg';

interface Point {
  x: number;
  y: number;
}

interface HeatmapGridProps {
  grid: PlotData[][];
  selectedPlot: PlotData | null;
  selectedPlots: PlotData[];
  onSelectPlot: (plot: PlotData) => void;
  onSelectMultiplePlots: (plots: PlotData[]) => void;
}

export const HeatmapGrid = ({ 
  grid, 
  selectedPlot, 
  selectedPlots,
  onSelectPlot, 
  onSelectMultiplePlots 
}: HeatmapGridProps) => {
  const [hoveredPlot, setHoveredPlot] = useState<PlotData | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [activeTool, setActiveTool] = useState<DrawingTool>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnShape, setDrawnShape] = useState<Point[]>([]);
  const [zoom, setZoom] = useState(1);
  const [drawingHistory, setDrawingHistory] = useState<Point[][]>([]);
  const isMobile = useIsMobile();

  const rows = grid.length;
  const cols = grid[0]?.length || 10;

  const getRiskColor = (intensity: number, isSelected: boolean): string => {
    if (!showHeatmap && !isSelected) return '';
    
    const opacity = isSelected ? 70 : showHeatmap ? 55 : 0;
    
    if (intensity < 35) {
      return `bg-[hsl(var(--risk-low))]/${opacity}`;
    } else if (intensity < 65) {
      return `bg-[hsl(var(--risk-moderate))]/${opacity}`;
    } else {
      return `bg-[hsl(var(--risk-elevated))]/${opacity}`;
    }
  };

  const getRiskLevel = (intensity: number): 'Low' | 'Moderate' | 'High' => {
    if (intensity < 35) return 'Low';
    if (intensity < 65) return 'Moderate';
    return 'High';
  };

  const getRiskBadgeClass = (level: 'Low' | 'Moderate' | 'High') => {
    switch (level) {
      case 'Low': return 'risk-badge-low';
      case 'Moderate': return 'risk-badge-moderate';
      case 'High': return 'risk-badge-elevated';
    }
  };

  // Check if a point is inside a polygon using ray casting
  const isPointInPolygon = useCallback((point: Point, polygon: Point[]): boolean => {
    if (polygon.length < 3) return false;
    
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      
      if (((yi > point.y) !== (yj > point.y)) &&
          (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }, []);

  // Get plots that intersect with drawn shape
  const getSelectedPlotsFromShape = useCallback((shape: Point[]): PlotData[] => {
    if (shape.length < 3) return [];
    
    const flatGrid = grid.flat();
    return flatGrid.filter(plot => {
      // Calculate plot center in percentage coordinates
      const plotCenterX = ((plot.gridX + 0.5) / cols) * 100;
      const plotCenterY = ((plot.gridY + 0.5) / rows) * 100;
      
      return isPointInPolygon({ x: plotCenterX, y: plotCenterY }, shape);
    });
  }, [grid, cols, rows, isPointInPolygon]);

  const handleDrawingComplete = useCallback((points: Point[]) => {
    setDrawnShape(points);
    setDrawingHistory(prev => [...prev, points]);
    
    const selectedFromShape = getSelectedPlotsFromShape(points);
    if (selectedFromShape.length > 0) {
      onSelectMultiplePlots(selectedFromShape);
    }
    setActiveTool('select');
  }, [getSelectedPlotsFromShape, onSelectMultiplePlots]);

  const handleDrawingUpdate = useCallback((points: Point[]) => {
    // Preview selection while drawing
  }, []);

  const handleToolChange = (tool: DrawingTool) => {
    setActiveTool(tool);
    if (tool !== 'select' && tool !== 'edit') {
      setDrawnShape([]);
    }
  };

  const handleUndo = () => {
    if (drawingHistory.length > 0) {
      const newHistory = [...drawingHistory];
      newHistory.pop();
      setDrawingHistory(newHistory);
      if (newHistory.length > 0) {
        const lastShape = newHistory[newHistory.length - 1];
        setDrawnShape(lastShape);
        const selectedFromShape = getSelectedPlotsFromShape(lastShape);
        onSelectMultiplePlots(selectedFromShape);
      } else {
        setDrawnShape([]);
        onSelectMultiplePlots([]);
      }
    }
  };

  const handleClear = () => {
    setDrawnShape([]);
    setDrawingHistory([]);
    onSelectMultiplePlots([]);
    setActiveTool('select');
  };

  const handleConfirm = () => {
    // Already handled in handleDrawingComplete
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  // Compute risk statistics for legend
  const riskStats = useMemo(() => {
    const flatGrid = grid.flat();
    const low = flatGrid.filter(p => p.exposureIntensity < 35).length;
    const moderate = flatGrid.filter(p => p.exposureIntensity >= 35 && p.exposureIntensity < 65).length;
    const high = flatGrid.filter(p => p.exposureIntensity >= 65).length;
    return { low, moderate, high, total: flatGrid.length };
  }, [grid]);

  const isPlotSelected = (plot: PlotData) => {
    return selectedPlot?.id === plot.id || selectedPlots.some(p => p.id === plot.id);
  };

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

        {/* Heatmap overlay when enabled */}
        {showHeatmap && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />
        )}

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
            const isSelected = isPlotSelected(plot);
            const isHovered = hoveredPlot?.id === plot.id;
            const riskLevel = getRiskLevel(plot.exposureIntensity);
            
            const PlotButton = (
              <button
                onClick={() => {
                  if (activeTool === 'select') {
                    onSelectPlot(plot);
                  }
                }}
                onMouseEnter={() => !isMobile && setHoveredPlot(plot)}
                onMouseLeave={() => !isMobile && setHoveredPlot(null)}
                onTouchStart={() => isMobile && setHoveredPlot(plot)}
                onTouchEnd={() => isMobile && setTimeout(() => setHoveredPlot(null), 800)}
                className={cn(
                  "w-full h-full rounded-sm transition-all duration-200 border border-white/10 touch-manipulation flex items-center justify-center",
                  activeTool === 'select' ? 'cursor-pointer' : 'cursor-default pointer-events-none',
                  getRiskColor(plot.exposureIntensity, isSelected),
                  isSelected && "ring-2 ring-white ring-offset-1 ring-offset-transparent scale-[1.03] z-20 shadow-lg border-white/70",
                  isHovered && !isSelected && "border-white/40 bg-white/15 scale-[1.02]"
                )}
                aria-label={`Plot ${plot.plotNumber} - ${riskLevel} Risk (${plot.exposureIntensity}%)`}
                disabled={activeTool !== 'select'}
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
                        {riskLevel} Risk ({plot.exposureIntensity}%)
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/80 mt-1">
                      Flood frequency: {plot.indicators.floodHistory.yearsAffected}/10 years
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 italic">
                      Computed from historical data (2009–2019)
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Drawing Canvas Overlay */}
        {(activeTool === 'polygon' || activeTool === 'rectangle') && (
          <DrawingCanvas
            activeTool={activeTool}
            onDrawingComplete={handleDrawingComplete}
            onDrawingUpdate={handleDrawingUpdate}
            isDrawing={isDrawing}
            setIsDrawing={setIsDrawing}
            gridBounds={{ rows, cols }}
          />
        )}
      </div>

      {/* Map Toolbar - Drawing Tools */}
      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-30">
        <MapToolbar
          activeTool={activeTool}
          onToolChange={handleToolChange}
          onUndo={handleUndo}
          onClear={handleClear}
          onConfirm={handleConfirm}
          hasDrawing={drawnShape.length > 0 || selectedPlots.length > 0}
          canUndo={drawingHistory.length > 0}
        />
      </div>

      {/* Location Label & Heatmap Toggle */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 z-30 flex flex-col gap-2">
        <div className="glass-strong rounded-lg px-3 py-2 md:px-4 md:py-2.5 shadow-lg">
          <p className="text-xs md:text-sm font-semibold text-foreground">Gongabu, Kathmandu</p>
          <p className="text-[10px] md:text-xs text-muted-foreground">27.7350°N, 85.3206°E</p>
        </div>

        <div className="glass-strong rounded-lg p-2 md:p-3 shadow-lg">
          <div className="flex items-center gap-2 md:gap-3">
            {showHeatmap ? (
              <Eye className="w-4 h-4 text-primary" />
            ) : (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            )}
            <div className="flex items-center gap-2">
              <Switch
                id="heatmap-toggle"
                checked={showHeatmap}
                onCheckedChange={setShowHeatmap}
                className="scale-90 md:scale-100"
              />
              <Label htmlFor="heatmap-toggle" className="text-[10px] md:text-xs font-medium cursor-pointer whitespace-nowrap">
                Heatmap
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

      {/* Legend - Always visible when heatmap is on */}
      {showHeatmap && (
        <div className="absolute bottom-20 md:bottom-4 left-2 md:left-4 glass-strong rounded-lg p-2 md:p-3 shadow-lg animate-fade-in z-30">
          <p className="text-[10px] md:text-xs font-medium text-foreground mb-1.5 md:mb-2">Risk Levels (Flood/Waterlogging)</p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm bg-[hsl(var(--risk-low))]" />
                <span className="text-[10px] md:text-xs text-muted-foreground">Low (&lt;35%)</span>
              </div>
              <span className="text-[10px] text-muted-foreground/70">{riskStats.low} plots</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm bg-[hsl(var(--risk-moderate))]" />
                <span className="text-[10px] md:text-xs text-muted-foreground">Medium (35-65%)</span>
              </div>
              <span className="text-[10px] text-muted-foreground/70">{riskStats.moderate} plots</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm bg-[hsl(var(--risk-elevated))]" />
                <span className="text-[10px] md:text-xs text-muted-foreground">High (&gt;65%)</span>
              </div>
              <span className="text-[10px] text-muted-foreground/70">{riskStats.high} plots</span>
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground/60 mt-2 italic">
            Source: Historical data (2009–2019)
          </p>
        </div>
      )}

      {/* Drawing instruction when using drawing tools */}
      {(activeTool === 'polygon' || activeTool === 'rectangle') && !isDrawing && (
        <div className="absolute bottom-20 md:bottom-16 left-1/2 -translate-x-1/2 glass-strong rounded-lg px-4 py-2 shadow-lg z-30 animate-pulse-soft">
          <p className="text-xs text-foreground">
            {activeTool === 'polygon' 
              ? '👆 Click to add points, double-click to complete' 
              : '👆 Click and drag to draw rectangle'}
          </p>
        </div>
      )}

      {/* Mobile: Selected Plot Bottom Bar */}
      {isMobile && (selectedPlot || selectedPlots.length > 0) && (
        <div className="absolute bottom-0 left-0 right-0 glass-strong rounded-t-xl px-4 py-3 shadow-lg flex items-center justify-between z-30 border-t border-border">
          <div>
            {selectedPlots.length > 1 ? (
              <>
                <p className="text-sm font-semibold text-foreground">{selectedPlots.length} plots selected</p>
                <p className="text-xs text-muted-foreground">Tap to view analysis</p>
              </>
            ) : selectedPlot ? (
              <>
                <p className="text-sm font-semibold text-foreground">{selectedPlot.plotNumber}</p>
                <p className="text-xs text-muted-foreground">{selectedPlot.areaName}</p>
              </>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {selectedPlot && (
              <span className={cn(
                "text-xs px-2.5 py-1 rounded-md font-medium",
                getRiskBadgeClass(getRiskLevel(selectedPlot.exposureIntensity))
              )}>
                {getRiskLevel(selectedPlot.exposureIntensity)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
