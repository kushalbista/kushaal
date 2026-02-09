import {
  Download,
  Clock,
  AlertTriangle,
  CheckCircle,
  Waves,
  Info,
  Leaf,
  Mountain,
  TreePine,
  CloudRain,
  MapPin,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { AnalysisResponse } from '@/services/analysisService';

interface AnalysisPanelProps {
  analysis: AnalysisResponse | null;
  isLoading: boolean;
  error: string | null;
}

export const AnalysisPanel = ({ analysis, isLoading, error }: AnalysisPanelProps) => {
  const isMobile = useIsMobile();

  // Loading state
  if (isLoading) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center text-center gap-4",
        isMobile ? "p-6" : "h-full p-8"
      )}>
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Processing GEE Data...</h3>
          <p className="text-sm text-muted-foreground">Analyzing your plot with Earth Engine</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!analysis) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center text-center",
        isMobile ? "p-6" : "h-full p-8"
      )}>
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <MapPin className="w-7 h-7 md:w-8 md:h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Draw a Plot to Analyze</h3>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Use the draw tool to outline a plot on the map, then click "Analyze" to get GEE-powered insights.
        </p>
      </div>
    );
  }

  const isHighFloodRisk = analysis.flood_prob > 50;
  const isHighLandslide = analysis.landslide_prob > 50;

  const floodLabel = isHighFloodRisk ? 'High Risk' : 'Low Risk';
  const floodDesc = isHighFloodRisk ? 'Flood probability exceeds 50%' : 'Flood probability below threshold';

  return (
    <div className={cn(
      "overflow-y-auto scrollbar-thin",
      isMobile ? "p-4 pb-8" : "h-full p-5 lg:p-6"
    )}>
      <div className="space-y-5 md:space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg md:text-xl font-bold text-foreground">GEE Analysis Results</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Earth Engine powered insights</p>
        </div>

        {/* Flood Risk Card */}
        <div className={cn(
          "rounded-xl p-4 border-2",
          isHighFloodRisk
            ? "bg-destructive/10 border-destructive/30"
            : "bg-[hsl(var(--risk-low))]/10 border-[hsl(var(--risk-low))]/30"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              isHighFloodRisk ? "bg-destructive/20" : "bg-[hsl(var(--risk-low))]/20"
            )}>
              {isHighFloodRisk
                ? <Waves className="w-6 h-6 text-destructive" />
                : <CheckCircle className="w-6 h-6 text-[hsl(var(--risk-low))]" />
              }
            </div>
            <div className="flex-1">
              <p className={cn(
                "font-bold text-lg",
                isHighFloodRisk ? "text-destructive" : "text-[hsl(var(--risk-low))]"
              )}>
                {floodLabel}
              </p>
              <p className="text-sm text-muted-foreground">{floodDesc}</p>
            </div>
            <span className={cn(
              "text-2xl font-bold",
              isHighFloodRisk ? "text-destructive" : "text-[hsl(var(--risk-low))]"
            )}>
              {analysis.flood_prob.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Indicator Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Agriculture */}
          <div className="bg-secondary rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-[hsl(var(--risk-low))]" />
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Agriculture</h4>
            </div>
            <p className="text-xl font-bold text-foreground">{analysis.agri_prob.toFixed(1)}%</p>
            <p className="text-[11px] text-muted-foreground">Suitability</p>
            <div className="pt-1 border-t border-border">
              <p className="text-[11px] text-muted-foreground">Soil pH</p>
              <p className="text-sm font-semibold text-foreground">{analysis.ph.toFixed(1)}</p>
            </div>
          </div>

          {/* Landslide */}
          <div className="bg-secondary rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Mountain className="w-4 h-4 text-[hsl(var(--risk-moderate))]" />
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Landslide</h4>
            </div>
            <p className={cn(
              "text-xl font-bold",
              isHighLandslide ? "text-destructive" : "text-foreground"
            )}>
              {analysis.landslide_prob.toFixed(1)}%
            </p>
            <p className="text-[11px] text-muted-foreground">Risk Probability</p>
            <div className="pt-1 border-t border-border">
              <p className="text-[11px] text-muted-foreground">Slope</p>
              <p className="text-sm font-semibold text-foreground">{analysis.slope.toFixed(1)}°</p>
            </div>
          </div>
        </div>

        {/* Environmental Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TreePine className="w-4 h-4 text-[hsl(var(--risk-low))]" />
            <h3 className="font-semibold text-sm text-foreground">Environmental Indicators</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-lg p-3">
              <p className="text-xs text-muted-foreground">NDVI (Vegetation)</p>
              <p className="text-lg font-semibold text-foreground">{analysis.ndvi.toFixed(3)}</p>
              <div className="mt-1.5 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[hsl(var(--risk-low))]"
                  style={{ width: `${Math.max(0, Math.min(100, analysis.ndvi * 100))}%` }}
                />
              </div>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <CloudRain className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Rainfall</p>
              </div>
              <p className="text-lg font-semibold text-foreground">{analysis.rainfall.toFixed(0)}</p>
              <p className="text-[10px] text-muted-foreground">mm (annual avg)</p>
            </div>
          </div>
        </div>

        {/* Analysis Details */}
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
          <p>Historical data analysis only. Not a legal, financial, or official land assessment.</p>
          <p className="mt-1">Data source: Sentinel-1 SAR (Monsoon 2024) via Google Earth Engine</p>
        </div>
      </div>
    </div>
  );
};
