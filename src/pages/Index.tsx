import { useState, useMemo, useEffect, useCallback } from 'react';
import { TopBar } from '@/components/TopBar';
import { MapView } from '@/components/MapView';
import { IndicatorPanel } from '@/components/IndicatorPanel';
import { Footer } from '@/components/Footer';
import { generateHeatmapGrid, PlotData, SearchResult } from '@/data/mockData';
import { toast } from 'sonner';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { ClickedFeature } from '@/types/mapTypes';

const Index = () => {
  const grid = useMemo(() => generateHeatmapGrid(), []);
  const [selectedPlot, setSelectedPlot] = useState<PlotData | null>(null);
  const [selectedPlots, setSelectedPlots] = useState<PlotData[]>([]);
  const [clickedFeature, setClickedFeature] = useState<ClickedFeature | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  // Open drawer when a plot is selected on mobile
  useEffect(() => {
    if (isMobile && (selectedPlot || selectedPlots.length > 0)) {
      setDrawerOpen(true);
    }
  }, [selectedPlot, selectedPlots, isMobile]);

  const handleSearch = (result: SearchResult) => {
    const flatGrid = grid.flat();
    const nearestPlot = flatGrid.reduce((nearest, plot) => {
      const distance = Math.sqrt(
        Math.pow(plot.coordinates.lat - result.coordinates.lat, 2) +
        Math.pow(plot.coordinates.lng - result.coordinates.lng, 2)
      );
      const nearestDistance = Math.sqrt(
        Math.pow(nearest.coordinates.lat - result.coordinates.lat, 2) +
        Math.pow(nearest.coordinates.lng - result.coordinates.lng, 2)
      );
      return distance < nearestDistance ? plot : nearest;
    }, flatGrid[0]);

    setSelectedPlot(nearestPlot);
    setSelectedPlots([]);
    toast.success(`Navigated to ${result.name}`, {
      description: 'Plot selected. View analysis in the panel.',
    });
  };

  const handleSelectPlot = (plot: PlotData) => {
    setSelectedPlot(plot);
    setSelectedPlots([]);
  };

  const handleSelectMultiplePlots = (plots: PlotData[]) => {
    setSelectedPlots(plots);
    if (plots.length === 1) {
      setSelectedPlot(plots[0]);
    } else if (plots.length > 1) {
      setSelectedPlot(null);
    }
    if (plots.length > 0) {
      toast.success(`${plots.length} plot${plots.length > 1 ? 's' : ''} selected`, {
        description: 'View combined analysis in the panel.',
      });
    }
  };

  const handleAnalyzeNew = () => {
    setSelectedPlot(null);
    setSelectedPlots([]);
    setClickedFeature(null);
    setDrawerOpen(false);
    toast.info('Click on the map to analyze flood risk for any location.');
  };

  const handleFeatureClick = useCallback((feature: ClickedFeature | null) => {
    setClickedFeature(feature);
    if (feature) {
      if (isMobile) {
        setDrawerOpen(true);
      }
      if (feature.isInFloodZone) {
        toast.warning('Flood Zone Detected', {
          description: 'This area has been affected by flooding.',
        });
      } else {
        toast.success('Safe Zone', {
          description: 'No flood detected in this area.',
        });
      }
    }
  }, [isMobile]);

  // Determine which plots to show in the panel
  const plotsForAnalysis = selectedPlots.length > 0 ? selectedPlots : selectedPlot ? [selectedPlot] : [];

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
      <TopBar onSearch={handleSearch} onAnalyzeNew={handleAnalyzeNew} />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative min-h-0">
        {/* Map Panel - Full screen on mobile */}
        <div className="flex-1 w-full lg:w-[60%] xl:w-[65%] relative min-h-[50vh] lg:min-h-0">
          <MapView 
            selectedPlot={selectedPlot}
            selectedPlots={selectedPlots}
            onSelectPlot={handleSelectPlot}
            onSelectMultiplePlots={handleSelectMultiplePlots}
            onFeatureClick={handleFeatureClick}
          />
        </div>

        {/* Desktop: Side Panel */}
        <div className="hidden lg:flex lg:flex-col lg:w-[40%] xl:w-[35%] border-l border-border bg-card overflow-hidden">
          <IndicatorPanel 
            selectedPlot={selectedPlot} 
            selectedPlots={plotsForAnalysis}
            clickedFeature={clickedFeature}
          />
        </div>

        {/* Mobile: Bottom Sheet Drawer */}
        {isMobile && (
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerContent className="max-h-[85dvh]">
              <DrawerHeader className="pb-0 border-b border-border">
                <DrawerTitle className="text-left">
                  {selectedPlots.length > 1 
                    ? `${selectedPlots.length} Plots Selected`
                    : selectedPlot 
                      ? `Plot ${selectedPlot.plotNumber} Analysis` 
                      : 'Select a Plot'}
                </DrawerTitle>
              </DrawerHeader>
              <div className="overflow-y-auto flex-1">
                <IndicatorPanel 
                  selectedPlot={selectedPlot}
                  selectedPlots={plotsForAnalysis}
                  clickedFeature={clickedFeature}
                />
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </main>

      {/* Footer - hidden on mobile */}
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
