import { 
  MapPin, 
  Download, 
  Clock,
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Waves,
  Info
} from 'lucide-react';
import { PlotData } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { RiskIndicatorSection } from './RiskIndicatorSection';
import { DetailedSummary } from './DetailedSummary';
import { ClickedFeature, convertToTerai, convertToHectares, formatTeraiUnits } from '@/types/mapTypes';

interface IndicatorPanelProps {
  selectedPlot: PlotData | null;
  selectedPlots: PlotData[];
  clickedFeature?: ClickedFeature | null;
}

export const IndicatorPanel = ({ selectedPlot, selectedPlots, clickedFeature }: IndicatorPanelProps) => {
  const isMobile = useIsMobile();
  const isMultiSelect = selectedPlots.length > 1;
  const displayPlot = selectedPlot || (selectedPlots.length === 1 ? selectedPlots[0] : null);

  // If we have a clicked feature from the real map, show that instead
  if (clickedFeature) {
    const teraiUnits = convertToTerai(clickedFeature.areaM2);
    const hectares = convertToHectares(clickedFeature.areaM2);
    
    return (
      <div className={cn(
        "overflow-y-auto scrollbar-thin",
        isMobile ? "p-4 pb-8" : "h-full p-5 lg:p-6"
      )}>
        <div className="space-y-5 md:space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-foreground">
                  Flood Risk Analysis
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {clickedFeature.coordinates[1].toFixed(4)}°N, {clickedFeature.coordinates[0].toFixed(4)}°E
                </p>
              </div>
            </div>
          </div>

          {/* Risk Status Card */}
          <div className={cn(
            "rounded-xl p-4 border-2",
            clickedFeature.isInFloodZone 
              ? "bg-destructive/10 border-destructive/30" 
              : "bg-[hsl(var(--risk-low))]/10 border-[hsl(var(--risk-low))]/30"
          )}>
            <div className="flex items-center gap-3">
              {clickedFeature.isInFloodZone ? (
                <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                  <Waves className="w-6 h-6 text-destructive" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-[hsl(var(--risk-low))]/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[hsl(var(--risk-low))]" />
                </div>
              )}
              <div>
                <p className={cn(
                  "font-bold text-lg",
                  clickedFeature.isInFloodZone ? "text-destructive" : "text-[hsl(var(--risk-low))]"
                )}>
                  {clickedFeature.isInFloodZone ? 'High Risk - Flood Zone' : 'Low Risk - Safe Zone'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {clickedFeature.isInFloodZone ? 'Submerged during monsoon 2024' : 'No flood detected'}
                </p>
              </div>
            </div>
          </div>

          {/* Area Information - only show if in flood zone */}
          {clickedFeature.isInFloodZone && clickedFeature.areaM2 > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-foreground">Affected Area</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Hectares</p>
                  <p className="text-lg font-semibold text-foreground">{hectares.toFixed(2)} ha</p>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Square Meters</p>
                  <p className="text-lg font-semibold text-foreground">{clickedFeature.areaM2.toLocaleString()} m²</p>
                </div>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Terai Local Units</p>
                <p className="text-lg font-semibold text-foreground">{formatTeraiUnits(teraiUnits)}</p>
              </div>
            </div>
          )}

          {/* Analysis Details Section */}
          <div className="space-y-3 bg-secondary/50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm text-foreground">Analysis Details</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model</span>
                <span className="text-foreground font-medium">Random Forest (Unbiased Stratified)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Overall Accuracy</span>
                <span className="text-foreground font-medium">89.47%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kappa Coefficient</span>
                <span className="text-foreground font-medium">0.78</span>
              </div>
              <div className="pt-2 border-t border-border mt-2">
                <p className="text-muted-foreground leading-relaxed">
                  Analysis uses Sentinel-1 SAR interference-filtered data to detect standing water at 10m resolution (Monsoon 2024).
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button 
              onClick={() => toast.success('Generating PDF report...')}
              className="w-full gap-2 h-11"
              size="lg"
            >
              <Download className="w-4 h-4" />
              Download Due Diligence PDF
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => toast.info('Showing historical flood events...')}
              className="w-full gap-2 h-10"
            >
              <Clock className="w-4 h-4" />
              View Historical Timeline
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="text-[10px] md:text-xs text-muted-foreground/70 text-center pt-3 border-t border-border">
            <p>Historical data analysis only. This is not a legal, financial, or official land assessment.</p>
            <p className="mt-1">Data source: Sentinel-1 SAR (Monsoon 2024)</p>
          </div>
        </div>
      </div>
    );
  }

  if (!displayPlot && selectedPlots.length === 0) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center text-center",
        isMobile ? "p-6" : "h-full p-8"
      )}>
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <MapPin className="w-7 h-7 md:w-8 md:h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Select a Location</h3>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          {isMobile 
            ? 'Tap anywhere on the map to check flood risk status.' 
            : 'Click anywhere on the map to check flood risk status.'}
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
