import { useState, useMemo, useEffect } from 'react';
import { TopBar } from '@/components/TopBar';
import { HeatmapGrid } from '@/components/HeatmapGrid';
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

const Index = () => {
  const grid = useMemo(() => generateHeatmapGrid(), []);
  const [selectedPlot, setSelectedPlot] = useState<PlotData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  // Open drawer when a plot is selected on mobile
  useEffect(() => {
    if (isMobile && selectedPlot) {
      setDrawerOpen(true);
    }
  }, [selectedPlot, isMobile]);

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
    toast.success(`Navigated to ${result.name}`, {
      description: 'Plot selected. View analysis below.',
    });
  };

  const handleSelectPlot = (plot: PlotData) => {
    setSelectedPlot(plot);
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
      <TopBar onSearch={handleSearch} />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Map Panel - Full screen on mobile */}
        <div className="flex-1 w-full lg:w-[60%] relative">
          <HeatmapGrid 
            grid={grid} 
            selectedPlot={selectedPlot} 
            onSelectPlot={handleSelectPlot} 
          />
        </div>

        {/* Desktop: Side Panel */}
        <div className="hidden lg:block lg:w-[40%] border-l border-border bg-card/50 overflow-hidden">
          <IndicatorPanel selectedPlot={selectedPlot} />
        </div>

        {/* Mobile: Bottom Sheet Drawer */}
        {isMobile && (
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerContent className="max-h-[85dvh]">
              <DrawerHeader className="pb-0">
                <DrawerTitle>
                  {selectedPlot ? `${selectedPlot.plotNumber} Analysis` : 'Select a Plot'}
                </DrawerTitle>
              </DrawerHeader>
              <div className="overflow-y-auto flex-1">
                <IndicatorPanel selectedPlot={selectedPlot} />
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </main>

      {/* Footer - hidden on mobile for more map space */}
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
