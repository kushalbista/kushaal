import { useState, useMemo } from 'react';
import { TopBar } from '@/components/TopBar';
import { HeatmapGrid } from '@/components/HeatmapGrid';
import { IndicatorPanel } from '@/components/IndicatorPanel';
import { Footer } from '@/components/Footer';
import { generateHeatmapGrid, PlotData, SearchResult } from '@/data/mockData';
import { toast } from 'sonner';

const Index = () => {
  const grid = useMemo(() => generateHeatmapGrid(), []);
  const [selectedPlot, setSelectedPlot] = useState<PlotData | null>(null);

  const handleSearch = (result: SearchResult) => {
    // Find nearest plot to search result
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
      description: 'Plot selected. View analysis on the right panel.',
    });
  };

  const handleSelectPlot = (plot: PlotData) => {
    setSelectedPlot(plot);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar onSearch={handleSearch} />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Map Panel */}
        <div className="flex-1 lg:w-[60%] relative bg-muted/30">
          <HeatmapGrid 
            grid={grid} 
            selectedPlot={selectedPlot} 
            onSelectPlot={handleSelectPlot} 
          />
        </div>

        {/* Indicator Panel */}
        <div className="lg:w-[40%] border-t lg:border-t-0 lg:border-l border-border bg-card/50 overflow-hidden">
          <IndicatorPanel selectedPlot={selectedPlot} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
