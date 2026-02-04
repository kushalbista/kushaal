import { 
  MapPin, 
  Download, 
  Clock,
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { PlotData } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { RiskIndicatorSection } from './RiskIndicatorSection';
import { DetailedSummary } from './DetailedSummary';

interface IndicatorPanelProps {
  selectedPlot: PlotData | null;
  selectedPlots: PlotData[];
}

export const IndicatorPanel = ({ selectedPlot, selectedPlots }: IndicatorPanelProps) => {
  const isMobile = useIsMobile();
  const isMultiSelect = selectedPlots.length > 1;
  const displayPlot = selectedPlot || (selectedPlots.length === 1 ? selectedPlots[0] : null);

  if (!displayPlot && selectedPlots.length === 0) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center text-center",
        isMobile ? "p-6" : "h-full p-8"
      )}>
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <MapPin className="w-7 h-7 md:w-8 md:h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Select a Plot</h3>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          {isMobile 
            ? 'Tap any plot or draw a shape to select multiple plots.' 
            : 'Click on any plot or use the drawing tools to select a custom area.'}
        </p>
      </div>
    );
  }

  const getRiskLevel = (intensity: number): 'Low' | 'Moderate' | 'Elevated' => {
    if (intensity < 35) return 'Low';
    if (intensity < 65) return 'Moderate';
    return 'Elevated';
  };

  const avgIntensity = selectedPlots.length > 0 
    ? selectedPlots.reduce((sum, p) => sum + p.exposureIntensity, 0) / selectedPlots.length
    : displayPlot?.exposureIntensity || 0;

  const riskLevel = getRiskLevel(avgIntensity);

  const getRiskConfig = () => {
    switch (riskLevel) {
      case 'Low':
        return {
          icon: <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />,
          color: 'text-[hsl(var(--risk-low))]',
          cardClass: 'risk-card-low',
          label: 'Low Exposure',
          description: 'Minimal flood/waterlogging concerns'
        };
      case 'Moderate':
        return {
          icon: <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />,
          color: 'text-[hsl(var(--risk-moderate))]',
          cardClass: 'risk-card-moderate',
          label: 'Medium Exposure',
          description: 'Moderate historical flood events'
        };
      case 'Elevated':
        return {
          icon: <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />,
          color: 'text-[hsl(var(--risk-elevated))]',
          cardClass: 'risk-card-elevated',
          label: 'High Exposure',
          description: 'Significant flood/waterlogging history'
        };
    }
  };

  const riskConfig = getRiskConfig();

  const handleDownloadReport = () => {
    toast.success('Generating Due Diligence PDF', {
      description: `Preparing comprehensive report for ${isMultiSelect ? `${selectedPlots.length} plots` : displayPlot?.plotNumber}...`,
    });
  };

  const handleViewTimeline = () => {
    toast.info('Historical Timeline', {
      description: 'Showing flood events from 2009-2019',
    });
  };

  return (
    <div className={cn(
      "overflow-y-auto scrollbar-thin",
      isMobile ? "p-4 pb-8" : "h-full p-5 lg:p-6"
    )}>
      <div className="space-y-5 md:space-y-6">
        {/* Header Section */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                Environmental Analysis
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isMultiSelect 
                  ? `${selectedPlots.length} plots selected`
                  : `Plot ${displayPlot?.plotNumber}`}
              </p>
            </div>
            {displayPlot && (
              <a 
                href={`https://www.google.com/maps?q=${displayPlot.coordinates.lat},${displayPlot.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                View on Maps
              </a>
            )}
          </div>
          
          {displayPlot && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-1 bg-secondary rounded-md">{displayPlot.areaName}</span>
              <span className="px-2 py-1 bg-secondary rounded-md">
                {displayPlot.coordinates.lat.toFixed(4)}°N, {displayPlot.coordinates.lng.toFixed(4)}°E
              </span>
            </div>
          )}
        </div>

        {/* Detailed Summary with computed values */}
        <DetailedSummary 
          selectedPlots={selectedPlots.length > 0 ? selectedPlots : (displayPlot ? [displayPlot] : [])}
          isMultiSelect={isMultiSelect}
        />

        {/* Risk Indicators - for single plot */}
        {displayPlot && !isMultiSelect && (
          <RiskIndicatorSection indicators={displayPlot.indicators} />
        )}

        {/* Multi-select notice for detailed indicators */}
        {isMultiSelect && (
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">
              Detailed indicators available for single-plot selection only.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button 
            onClick={handleDownloadReport}
            className="w-full gap-2 h-11"
            size="lg"
          >
            <Download className="w-4 h-4" />
            Download Due Diligence PDF
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleViewTimeline}
            className="w-full gap-2 h-10"
          >
            <Clock className="w-4 h-4" />
            View Historical Timeline
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="text-[10px] md:text-xs text-muted-foreground/70 text-center pt-3 border-t border-border">
          <p>Historical data analysis only. This is not a legal, financial, or official land assessment.</p>
          <p className="mt-1">Data sources: Satellite imagery (2009-2019), DEM data, regional soil maps.</p>
        </div>
      </div>
    </div>
  );
};
