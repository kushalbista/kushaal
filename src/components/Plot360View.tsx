import { useState } from 'react';
import { View, RotateCcw, ZoomIn, Maximize2 } from 'lucide-react';
import { PlotData } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Plot360ViewProps {
  plot: PlotData;
  className?: string;
}

export const Plot360View = ({ plot, className }: Plot360ViewProps) => {
  const [rotation, setRotation] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Generate a pseudo-realistic street view URL based on coordinates
  // In production, this would use Google Street View API or similar
  const getStreetViewPlaceholder = () => {
    const { lat, lng } = plot.coordinates;
    // Using a static satellite view as placeholder
    return `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${lng},${lat},18,0/400x300?access_token=pk.placeholder`;
  };

  return (
    <div className={cn("rounded-xl overflow-hidden border border-border bg-card", className)}>
      <div className="flex items-center justify-between px-3 py-2 bg-secondary/50 border-b border-border">
        <div className="flex items-center gap-2">
          <View className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">360° View</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleRotate}
            aria-label="Rotate view"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label="Expand view"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      
      <div 
        className={cn(
          "relative bg-muted transition-all duration-300",
          isExpanded ? "h-64" : "h-40"
        )}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Placeholder 360 view - in production would use actual street view */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-secondary to-muted">
          <View className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <p className="text-xs text-muted-foreground text-center px-4">
            360° Street View for Plot {plot.plotNumber}
          </p>
          <p className="text-[10px] text-muted-foreground/70 mt-1">
            {plot.coordinates.lat.toFixed(4)}°N, {plot.coordinates.lng.toFixed(4)}°E
          </p>
        </div>

        {/* Compass overlay */}
        <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center border border-border">
          <span className="text-[10px] font-bold text-primary" style={{ transform: `rotate(-${rotation}deg)` }}>N</span>
        </div>
      </div>

      <div className="px-3 py-2 bg-secondary/30 text-[10px] text-muted-foreground">
        <p>• Drag to pan • Double-click to zoom</p>
        <p className="text-muted-foreground/70">View centered on selected plot boundary</p>
      </div>
    </div>
  );
};
