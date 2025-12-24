import { useState } from 'react';
import { 
  Droplets, 
  Mountain, 
  GitBranch, 
  Layers, 
  Waves, 
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PlotData } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface RiskIndicatorSectionProps {
  indicators: PlotData['indicators'];
}

interface IndicatorItemProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subValue?: string;
  detailedSummary: string;
  iconColorClass: string;
  defaultOpen?: boolean;
}

const IndicatorItem = ({ 
  icon, 
  title, 
  value, 
  subValue, 
  detailedSummary, 
  iconColorClass,
  defaultOpen = false 
}: IndicatorItemProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card transition-all">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 md:p-4 flex items-center gap-3 text-left hover:bg-secondary/30 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className={cn("p-2 rounded-lg bg-secondary/50", iconColorClass)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground truncate">{value}</p>
          {subValue && (
            <p className="text-[10px] text-muted-foreground/70 truncate">{subValue}</p>
          )}
        </div>
        <div className="flex-shrink-0 text-muted-foreground">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-3 md:px-4 pb-3 md:pb-4 pt-0 animate-fade-in">
          <div className="p-3 bg-secondary/30 rounded-lg">
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              {detailedSummary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const RiskIndicatorSection = ({ indicators }: RiskIndicatorSectionProps) => {
  const indicatorData = [
    {
      icon: <Droplets className="w-4 h-4" />,
      title: "Flood History",
      value: `${indicators.floodHistory.yearsAffected} of ${indicators.floodHistory.totalYears} years`,
      subValue: indicators.floodHistory.lastFloodYear 
        ? `Last recorded ${indicators.floodHistory.lastFloodYear}`
        : 'No floods recorded',
      detailedSummary: indicators.floodHistory.yearsAffected > 0
        ? `This plot has experienced flooding in ${indicators.floodHistory.yearsAffected} out of the last ${indicators.floodHistory.totalYears} years. Climate projections suggest a potential 15-20% increase in flood risk. Mitigation: Consider elevating foundation or installing flood barriers.`
        : `No significant flood events recorded in the last ${indicators.floodHistory.totalYears} years. Continued monitoring recommended.`,
      iconColorClass: "text-[hsl(210,80%,50%)]",
      defaultOpen: true
    },
    {
      icon: <Mountain className="w-4 h-4" />,
      title: "Elevation",
      value: `${indicators.elevation.plotElevation}m elevation`,
      subValue: `${indicators.elevation.difference >= 0 ? '+' : ''}${indicators.elevation.difference}m vs ward avg (${indicators.elevation.wardAverage}m)`,
      detailedSummary: indicators.elevation.difference > 0
        ? `This plot is ${indicators.elevation.difference}m above the ward average. Higher elevation reduces downhill flooding risk but may increase drainage issues.`
        : `This plot is ${Math.abs(indicators.elevation.difference)}m below ward average. Lower areas are more susceptible to water accumulation.`,
      iconColorClass: "text-earth-400"
    },
    {
      icon: <GitBranch className="w-4 h-4" />,
      title: "Drainage Proximity",
      value: `${indicators.drainageProximity.distanceMeters}m distance`,
      subValue: indicators.drainageProximity.drainageType,
      detailedSummary: indicators.drainageProximity.distanceMeters < 100
        ? `Very close to ${indicators.drainageProximity.drainageType}. Good drainage access but overflow risk during monsoon.`
        : `Moderate distance from ${indicators.drainageProximity.drainageType}. On-site drainage solutions recommended.`,
      iconColorClass: "text-[hsl(38,92%,45%)]"
    },
    {
      icon: <Layers className="w-4 h-4" />,
      title: "Soil Type",
      value: indicators.soilType.type,
      subValue: `Permeability: ${indicators.soilType.permeability}`,
      detailedSummary: indicators.soilType.permeability === 'low'
        ? `${indicators.soilType.type} has low permeability, leading to waterlogging during rains. Soil treatment may be needed for construction.`
        : `${indicators.soilType.type} has ${indicators.soilType.permeability} permeability. Standard practices generally suitable.`,
      iconColorClass: "text-earth-500"
    },
    {
      icon: <Waves className="w-4 h-4" />,
      title: "Water Table",
      value: `${indicators.waterTable.depthMeters}m depth`,
      subValue: `Seasonal variation: ${indicators.waterTable.seasonalVariation}`,
      detailedSummary: indicators.waterTable.depthMeters < 3
        ? `Shallow water table at ${indicators.waterTable.depthMeters}m. Basements may experience water ingress during monsoon.`
        : `Water table at ${indicators.waterTable.depthMeters}m depth. Standard foundation depths should not be affected.`,
      iconColorClass: "text-[hsl(195,70%,45%)]"
    },
    {
      icon: <Info className="w-4 h-4" />,
      title: "Local Context",
      value: "Additional Information",
      subValue: "Infrastructure & local notes",
      detailedSummary: `• Traditional water management systems documented\n• Drainage improvements completed in 2022\n• Green infrastructure present nearby\n• Municipal services accessible`,
      iconColorClass: "text-muted-foreground"
    }
  ];

  return (
    <div className="space-y-2 md:space-y-3">
      <h3 className="text-sm font-semibold text-foreground px-1">Risk Indicators</h3>
      <div className="space-y-2">
        {indicatorData.map((indicator, index) => (
          <IndicatorItem key={index} {...indicator} />
        ))}
      </div>
    </div>
  );
};