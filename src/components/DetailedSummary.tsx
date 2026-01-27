import { 
  MapPin, 
  Ruler, 
  TriangleAlert, 
  TrendingUp,
  Calendar,
  Info,
  Car,
  Mountain
} from 'lucide-react';
import { PlotData } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

interface DetailedSummaryProps {
  selectedPlots: PlotData[];
  isMultiSelect?: boolean;
}

export const DetailedSummary = ({ selectedPlots, isMultiSelect = false }: DetailedSummaryProps) => {
  const isMobile = useIsMobile();
  
  if (selectedPlots.length === 0) return null;

  // Calculate aggregated values
  const totalArea = selectedPlots.length * 120; // Approximate 120 sq.m per plot cell
  const avgElevation = selectedPlots.reduce((sum, p) => sum + p.indicators.elevation.plotElevation, 0) / selectedPlots.length;
  const avgIntensity = selectedPlots.reduce((sum, p) => sum + p.exposureIntensity, 0) / selectedPlots.length;
  
  // Flood frequency calculation from historical data
  const totalFloodYears = selectedPlots.reduce((sum, p) => sum + p.indicators.floodExposure.yearsAffected, 0);
  const avgFloodFrequency = totalFloodYears / selectedPlots.length;
  const floodPercentage = (avgFloodFrequency / 10) * 100;

  // Road distance calculation
  const avgRoadDistance = selectedPlots.reduce((sum, p) => sum + p.indicators.roadAccessibility.distanceMeters, 0) / selectedPlots.length;

  // River proximity
  const avgRiverProximity = selectedPlots.reduce((sum, p) => sum + p.indicators.floodExposure.riverProximity, 0) / selectedPlots.length;

  const getRiskClassification = (intensity: number): { label: string; class: string; description: string } => {
    if (intensity < 35) {
      return {
        label: 'Low Exposure',
        class: 'risk-badge-low',
        description: 'Minimal flood/waterlogging history. Standard construction practices generally suitable.'
      };
    } else if (intensity < 65) {
      return {
        label: 'Medium Exposure',
        class: 'risk-badge-moderate',
        description: 'Moderate flood events recorded. Consider elevated foundation design.'
      };
    } else {
      return {
        label: 'High Exposure',
        class: 'risk-badge-elevated',
        description: 'Significant flood/waterlogging history. Special mitigation may be required.'
      };
    }
  };

  const risk = getRiskClassification(avgIntensity);

  const DataRow = ({ 
    icon: Icon, 
    label, 
    value, 
    tooltip 
  }: { 
    icon: React.ElementType; 
    label: string; 
    value: string; 
    tooltip: string;
  }) => {
    const content = (
      <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-foreground">{value}</span>
          <Info className="w-3 h-3 text-muted-foreground/50" />
        </div>
      </div>
    );

    if (isMobile) return content;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">{content}</div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {isMultiSelect ? 'Selected Area Summary' : 'Plot Summary'}
        </h3>
        <span className="text-xs text-muted-foreground">
          {selectedPlots.length} plot{selectedPlots.length > 1 ? 's' : ''} selected
        </span>
      </div>

      {/* Risk Classification Card */}
      <div className={cn("rounded-lg p-4", risk.class.replace('badge', 'card'))}>
        <div className="flex items-start gap-3">
          <TriangleAlert className="w-5 h-5 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-lg font-bold">{risk.label}</h4>
            <p className="text-xs mt-1 opacity-80">{risk.description}</p>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="bg-secondary/30 rounded-lg p-3">
        <DataRow 
          icon={Ruler} 
          label="Total Area" 
          value={`${totalArea.toLocaleString()} sq.m`}
          tooltip="Estimated area based on grid cell dimensions. Actual survey measurements may vary."
        />
        <DataRow 
          icon={Mountain} 
          label="Elevation" 
          value={`${Math.round(avgElevation)}m`}
          tooltip="Average elevation across selected plots. Source: Digital Elevation Model (DEM) data."
        />
        <DataRow 
          icon={Calendar} 
          label="Flood Frequency" 
          value={`${avgFloodFrequency.toFixed(1)}/10 years`}
          tooltip="Computed from historical satellite-detected flood data (2009–2019)."
        />
        <DataRow 
          icon={MapPin} 
          label="River Proximity" 
          value={`${Math.round(avgRiverProximity)}m`}
          tooltip="Distance to nearest major river (Bishnumati River)."
        />
        <DataRow 
          icon={Car} 
          label="Main Road Distance" 
          value={`${Math.round(avgRoadDistance)}m`}
          tooltip="Distance to nearest main road. Affects accessibility and emergency response."
        />
        <DataRow 
          icon={TrendingUp} 
          label="Exposure Score" 
          value={`${Math.round(avgIntensity)}%`}
          tooltip="Composite score derived from flood history, drainage patterns, and elevation factors."
        />
      </div>

      {/* Data Source Note */}
      <div className="bg-info/10 rounded-lg p-3 border border-info/20">
        <p className="text-[11px] text-info leading-relaxed">
          <strong>Data Source:</strong> Analysis based on historical satellite flood detection and DEM data from 2009–2019. 
          Sources include satellite imagery analysis and municipal records.
        </p>
      </div>
    </div>
  );
};
