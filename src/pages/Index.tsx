import { useState, useCallback } from 'react';
import { TopBar } from '@/components/TopBar';
import { MapView } from '@/components/MapView';
import { AnalysisPanel } from '@/components/AnalysisPanel';
import { Footer } from '@/components/Footer';
import { toast } from 'sonner';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { DrawnPolygon } from '@/types/mapTypes';
import { analyzePlot, AnalysisResponse } from '@/services/analysisService';

const Index = () => {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleAnalyze = useCallback(async (geometry: DrawnPolygon) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    if (isMobile) setDrawerOpen(true);

    try {
      const result = await analyzePlot(geometry);
      setAnalysis(result);
      toast.success('Analysis complete', {
        description: 'GEE data processed successfully.',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      setAnalysisError(msg);
      toast.error('Please draw a plot within the Sunsari study area.', {
        description: msg,
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [isMobile]);

  const handleClearAnalysis = useCallback(() => {
    setAnalysis(null);
    setAnalysisError(null);
    setDrawerOpen(false);
  }, []);

  const handleAnalyzeNew = () => {
    handleClearAnalysis();
    toast.info('Draw a polygon on the map to analyze a new plot.');
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
      <TopBar onSearch={() => {}} onAnalyzeNew={handleAnalyzeNew} />

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative min-h-0">
        {/* Map Panel */}
        <div className="flex-1 w-full lg:w-[60%] xl:w-[65%] relative min-h-[50vh] lg:min-h-0">
          <MapView
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            onClearAnalysis={handleClearAnalysis}
            hasAnalysis={analysis !== null}
            analysisComplete={analysis !== null && !isAnalyzing}
          />
        </div>

        {/* Desktop: Side Panel */}
        <div className="hidden lg:flex lg:flex-col lg:w-[40%] xl:w-[35%] border-l border-border bg-card overflow-hidden">
          <AnalysisPanel
            analysis={analysis}
            isLoading={isAnalyzing}
            error={analysisError}
          />
        </div>

        {/* Mobile: Bottom Sheet */}
        {isMobile && (
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerContent className="max-h-[85dvh]">
              <DrawerHeader className="pb-0 border-b border-border">
                <DrawerTitle className="text-left">
                  {isAnalyzing ? 'Analyzing...' : analysis ? 'Analysis Results' : 'Draw a Plot'}
                </DrawerTitle>
              </DrawerHeader>
              <div className="overflow-y-auto flex-1">
                <AnalysisPanel
                  analysis={analysis}
                  isLoading={isAnalyzing}
                  error={analysisError}
                />
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </main>

      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
