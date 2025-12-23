import { MapPin, Droplets, Mountain, GitBranch, Download, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { PlotData } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface IndicatorPanelProps {
  selectedPlot: PlotData | null;
}

export const IndicatorPanel = ({ selectedPlot }: IndicatorPanelProps) => {
  const isMobile = useIsMobile();

  if (!selectedPlot) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center text-center",
        isMobile ? "p-6" : "h-full p-8"
      )}>
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-muted flex items-center justify-center mb-3 sm:mb-4">
          <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Select a Plot</h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
          {isMobile ? 'Tap any plot on the map to view its risk analysis.' : 'Click on any plot in the Gongabu map to view its risk analysis.'}
        </p>
      </div>
    );
  }

  const { indicators, areaName, coordinates, plotNumber, exposureIntensity } = selectedPlot;

  const getRiskLevel = (intensity: number): 'Low' | 'Moderate' | 'Elevated' => {
    if (intensity < 35) return 'Low';
    if (intensity < 65) return 'Moderate';
    return 'Elevated';
  };

  const riskLevel = getRiskLevel(exposureIntensity);

  const getRiskConfig = () => {
    switch (riskLevel) {
      case 'Low':
        return {
          icon: <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
          color: 'text-[hsl(210,80%,45%)]',
          bgColor: 'bg-[hsl(210,80%,55%)]/10',
          borderColor: 'border-[hsl(210,80%,55%)]/30',
          label: 'Low Risk'
        };
      case 'Moderate':
        return {
          icon: <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
          color: 'text-[hsl(45,80%,35%)]',
          bgColor: 'bg-[hsl(45,95%,55%)]/10',
          borderColor: 'border-[hsl(45,95%,55%)]/30',
          label: 'Moderate Risk'
        };
      case 'Elevated':
        return {
          icon: <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />,
          color: 'text-[hsl(0,75%,45%)]',
          bgColor: 'bg-[hsl(0,75%,55%)]/10',
          borderColor: 'border-[hsl(0,75%,55%)]/30',
          label: 'Elevated Risk'
        };
    }
  };

  const riskConfig = getRiskConfig();

  const handleDownloadReport = () => {
    toast.success('Report Download Started', {
      description: `Generating PDF for ${plotNumber}...`,
    });
  };

  const getExplanation = () => {
    const factors: string[] = [];
    
    if (indicators.floodHistory.yearsAffected > 3) {
      factors.push('frequent flood exposure');
    } else if (indicators.floodHistory.yearsAffected > 0) {
      factors.push('occasional flood events');
    }
    
    if (indicators.drainageProximity.distanceMeters < 100) {
      factors.push('close drainage proximity');
    }
    
    if (indicators.elevation.difference < -5) {
      factors.push('below-average terrain elevation');
    } else if (indicators.elevation.difference > 5) {
      factors.push('elevated terrain');
    }

    if (factors.length === 0) {
      return 'No significant risk factors identified from historical data.';
    }
    
    return `Risk factors: ${factors.join(', ')}.`;
  };

  return (
    <div className={cn(
      "overflow-y-auto space-y-4",
      isMobile ? "p-4 pb-6" : "h-full p-4 lg:p-6 space-y-5"
    )}>
      {/* Header - Compact on mobile */}
      {!isMobile && (
        <div className="pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{plotNumber}</h2>
              <p className="text-sm text-muted-foreground">{areaName}</p>
            </div>
            <span className="text-xs text-muted-foreground">
              {coordinates.lat.toFixed(4)}°N, {coordinates.lng.toFixed(4)}°E
            </span>
          </div>
        </div>
      )}

      {/* Risk Level Card */}
      <div className={cn(
        "rounded-xl border-2 transition-all",
        isMobile ? "p-4" : "p-5",
        riskConfig.bgColor,
        riskConfig.borderColor
      )}>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={cn("p-2 sm:p-3 rounded-xl", riskConfig.bgColor, riskConfig.color)}>
            {riskConfig.icon}
          </div>
          <div>
            <h3 className={cn("text-xl sm:text-2xl font-bold", riskConfig.color)}>
              {riskConfig.label}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
              Based on historical exposure data
            </p>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="glass-strong rounded-lg p-3 sm:p-4">
        <h4 className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Analysis Summary</h4>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {getExplanation()}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="glass rounded-lg p-2 sm:p-3 text-center">
          <Droplets className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-0.5 sm:mb-1 text-[hsl(210,80%,55%)]" />
          <p className="text-sm sm:text-lg font-semibold text-foreground">
            {indicators.floodHistory.yearsAffected}/{indicators.floodHistory.totalYears}
          </p>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground">Flood Years</p>
        </div>
        <div className="glass rounded-lg p-2 sm:p-3 text-center">
          <Mountain className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-0.5 sm:mb-1 text-earth-400" />
          <p className="text-sm sm:text-lg font-semibold text-foreground">
            {indicators.elevation.difference >= 0 ? '+' : ''}{indicators.elevation.difference}m
          </p>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground">Elevation</p>
        </div>
        <div className="glass rounded-lg p-2 sm:p-3 text-center">
          <GitBranch className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-0.5 sm:mb-1 text-[hsl(45,95%,45%)]" />
          <p className="text-sm sm:text-lg font-semibold text-foreground">
            {indicators.drainageProximity.distanceMeters}m
          </p>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground">Drainage</p>
        </div>
      </div>

      {/* Download Report Button */}
      <div className={cn(
        "border-t border-border",
        isMobile ? "pt-3" : "pt-4"
      )}>
        <Button 
          onClick={handleDownloadReport}
          className="w-full gap-2"
          size={isMobile ? "default" : "lg"}
        >
          <Download className="w-4 h-4" />
          Download Report
        </Button>
        <p className="text-[9px] sm:text-[10px] text-muted-foreground text-center mt-2">
          PDF includes map, indicators & disclaimer
        </p>
      </div>

      {/* Disclaimer */}
      <div className="text-[9px] sm:text-[10px] text-muted-foreground/70 text-center pt-2 border-t border-border/50">
        Historical data only. Not a legal or financial assessment.
      </div>
    </div>
  );
};
