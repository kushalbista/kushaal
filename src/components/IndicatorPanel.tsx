import { 
  MapPin, 
  Download, 
  Clock, 
  MessageSquarePlus,
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
import { ExposureToggle } from './ExposureToggle';
import { useState } from 'react';

interface IndicatorPanelProps {
  selectedPlot: PlotData | null;
}

export const IndicatorPanel = ({ selectedPlot }: IndicatorPanelProps) => {
  const isMobile = useIsMobile();
  const [exposureFilter, setExposureFilter] = useState<'all' | 'low' | 'moderate' | 'elevated'>('all');

  if (!selectedPlot) {
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
            ? 'Tap any plot on the map or draw a custom area to view risk analysis.' 
            : 'Click on any plot in the Gongabu map or use the drawing tools to select a custom area.'}
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
          icon: <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />,
          color: 'text-[hsl(var(--risk-low))]',
          cardClass: 'risk-card-low',
          label: 'Low Risk',
          description: 'Minimal environmental concerns identified'
        };
      case 'Moderate':
        return {
          icon: <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />,
          color: 'text-[hsl(var(--risk-moderate))]',
          cardClass: 'risk-card-moderate',
          label: 'Moderate Risk',
          description: 'Some factors require attention'
        };
      case 'Elevated':
        return {
          icon: <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />,
          color: 'text-[hsl(var(--risk-elevated))]',
          cardClass: 'risk-card-elevated',
          label: 'Elevated Risk',
          description: 'Significant concerns identified'
        };
    }
  };

  const riskConfig = getRiskConfig();

  const handleDownloadReport = () => {
    toast.success('Generating Due Diligence PDF', {
      description: `Preparing comprehensive report for ${plotNumber}...`,
    });
  };

  const handleViewTimeline = () => {
    toast.info('Historical Timeline', {
      description: 'Timeline view coming soon.',
    });
  };

  const handleAddAnnotation = () => {
    toast.info('Owner Annotation', {
      description: 'Annotation feature coming soon.',
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
                Exposure Analysis
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Plot {plotNumber}
              </p>
            </div>
            <a 
              href={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              View on Maps
            </a>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 bg-secondary rounded-md">{areaName}</span>
            <span className="px-2 py-1 bg-secondary rounded-md">
              {coordinates.lat.toFixed(4)}°N, {coordinates.lng.toFixed(4)}°E
            </span>
          </div>
        </div>

        {/* Exposure Context Toggle */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Filter by Risk Level</p>
          <ExposureToggle 
            selectedLevel={exposureFilter} 
            onLevelChange={setExposureFilter} 
          />
        </div>

        {/* Risk Level Card */}
        <div className={cn(
          "rounded-xl transition-all p-4 md:p-5",
          riskConfig.cardClass
        )}>
          <div className="flex items-center gap-3 md:gap-4">
            <div className={cn("p-2.5 md:p-3 rounded-xl bg-card/50", riskConfig.color)}>
              {riskConfig.icon}
            </div>
            <div className="flex-1">
              <h3 className={cn("text-xl md:text-2xl font-bold", riskConfig.color)}>
                {riskConfig.label}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                {riskConfig.description}
              </p>
            </div>
          </div>
        </div>

        {/* Risk Indicators Accordion */}
        <RiskIndicatorSection indicators={indicators} />

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
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline"
              onClick={handleViewTimeline}
              className="gap-2 h-10"
            >
              <Clock className="w-4 h-4" />
              <span className="text-xs md:text-sm">Timeline</span>
            </Button>
            <Button 
              variant="outline"
              onClick={handleAddAnnotation}
              className="gap-2 h-10"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span className="text-xs md:text-sm">Annotate</span>
            </Button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-[10px] md:text-xs text-muted-foreground/70 text-center pt-3 border-t border-border">
          <p>Historical data analysis only. This is not a legal, financial, or official land assessment.</p>
          <p className="mt-1">Data sources: Municipal records, satellite imagery, geological surveys.</p>
        </div>
      </div>
    </div>
  );
};