import { useEffect, useRef, useState, useCallback } from 'react';
import { PlotData } from '@/data/mockData';
import { X, RotateCcw, Maximize2, Minimize2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PLACEHOLDER_360_IMAGES } from '@/utils/constants';
import { getRiskLevel } from '@/services/riskService';

interface Viewer360Props {
  plot: PlotData;
  className?: string;
  onClose?: () => void;
  isOverlay?: boolean;
}

export const Viewer360 = ({ plot, className, onClose, isOverlay = false }: Viewer360Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Get placeholder image based on risk level
  const get360ImageUrl = useCallback(() => {
    const riskLevel = getRiskLevel(plot.exposureIntensity);
    return PLACEHOLDER_360_IMAGES[riskLevel] || PLACEHOLDER_360_IMAGES.default;
  }, [plot.exposureIntensity]);

  // Initialize 360 viewer
  useEffect(() => {
    let viewer: any = null;
    let isMounted = true;

    const initViewer = async () => {
      if (!containerRef.current || !isMounted) return;

      try {
        setIsLoading(true);
        setHasError(false);

        // Dynamically import Photo Sphere Viewer
        const { Viewer } = await import('@photo-sphere-viewer/core');
        await import('@photo-sphere-viewer/core/index.css');

        if (!containerRef.current || !isMounted) return;

        // Clean up existing viewer
        if (viewerRef.current) {
          viewerRef.current.destroy();
        }

        viewer = new Viewer({
          container: containerRef.current,
          panorama: get360ImageUrl(),
          navbar: ['zoom', 'move', 'fullscreen'],
          defaultZoomLvl: 50,
          touchmoveTwoFingers: true,
          mousewheelCtrlKey: false,
          loadingTxt: 'Loading 360° view...',
        });

        viewerRef.current = viewer;

        viewer.addEventListener('ready', () => {
          if (isMounted) {
            setIsLoading(false);
          }
        });

      } catch (error) {
        console.error('Failed to initialize 360 viewer:', error);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    initViewer();

    return () => {
      isMounted = false;
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (e) {
          // Viewer might already be destroyed
        }
        viewerRef.current = null;
      }
    };
  }, [get360ImageUrl]);

  // Handle manual rotation for fallback view
  const handleRotate = () => {
    setRotation(prev => (prev + 45) % 360);
  };

  // Fallback when Photo Sphere Viewer fails
  const renderFallbackView = () => (
    <div 
      className="relative w-full h-full bg-muted flex items-center justify-center overflow-hidden"
      style={{ minHeight: isExpanded ? '400px' : '200px' }}
    >
      <img
        src={get360ImageUrl()}
        alt={`360° view of Plot ${plot.plotNumber}`}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
        style={{ transform: `scale(1.2) rotate(${rotation}deg)` }}
        onError={() => setHasError(true)}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <div className="text-white text-xs">
          <p className="font-medium">Plot {plot.plotNumber}</p>
          <p className="text-white/70">
            {plot.coordinates.lat.toFixed(4)}°N, {plot.coordinates.lng.toFixed(4)}°E
          </p>
        </div>
        
        <Button
          variant="secondary"
          size="icon"
          onClick={handleRotate}
          className="h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30"
        >
          <RotateCcw className="w-4 h-4 text-white" />
        </Button>
      </div>

      {/* Compass indicator */}
      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
        <span 
          className="text-xs font-bold text-primary transition-transform duration-500"
          style={{ transform: `rotate(-${rotation}deg)` }}
        >
          N
        </span>
      </div>
    </div>
  );

  return (
    <div 
      className={cn(
        "rounded-xl overflow-hidden border border-border bg-card",
        isOverlay && "fixed inset-4 z-50 shadow-2xl",
        isExpanded && !isOverlay && "fixed inset-4 z-50 shadow-2xl",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-secondary/50 border-b border-border">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">360° View</span>
          <span className="text-xs text-muted-foreground">• Plot {plot.plotNumber}</span>
        </div>
        <div className="flex items-center gap-1">
          {!isOverlay && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "Minimize" : "Expand"}
            >
              {isExpanded ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </Button>
          )}
          {(isOverlay || isExpanded) && onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onClose || (() => setIsExpanded(false))}
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Viewer Container */}
      <div 
        className={cn(
          "relative bg-muted transition-all duration-300",
          isExpanded || isOverlay ? "h-[calc(100%-48px)]" : "h-48"
        )}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Loading 360° view...</p>
            </div>
          </div>
        )}

        {hasError ? (
          renderFallbackView()
        ) : (
          <div 
            ref={containerRef} 
            className="w-full h-full"
            style={{ minHeight: isExpanded || isOverlay ? '400px' : '192px' }}
          />
        )}
      </div>

      {/* Instructions Footer */}
      <div className="px-3 py-2 bg-secondary/30 text-[10px] text-muted-foreground border-t border-border">
        <p>• Drag to pan • Scroll to zoom • Double-click for fullscreen</p>
        <p className="text-muted-foreground/70 mt-0.5">
          Image URL will be loaded from plot metadata in production
        </p>
      </div>
    </div>
  );
};

export default Viewer360;
