import { useState } from 'react';
import { 
  Droplets, 
  Mountain, 
  GitBranch, 
  Layers, 
  Car,
  MapPin,
  TreePine,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  TrendingDown
} from 'lucide-react';
import { PlotData } from '@/data/mockData';
import { cn } from '@/lib/utils';

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
  levelBadge?: {
    level: string;
    colorClass: string;
  };
  disclaimer?: string;
  defaultOpen?: boolean;
}

const IndicatorItem = ({ 
  icon, 
  title, 
  value, 
  subValue, 
  detailedSummary, 
  iconColorClass,
  levelBadge,
  disclaimer,
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
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-foreground">{title}</h4>
            {levelBadge && (
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", levelBadge.colorClass)}>
                {levelBadge.level}
              </span>
            )}
          </div>
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
          <div className="p-3 bg-secondary/30 rounded-lg space-y-2">
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              {detailedSummary}
            </p>
            {disclaimer && (
              <div className="flex items-start gap-1.5 pt-1 border-t border-border/50">
                <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground/80 italic">
                  {disclaimer}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const getLevelBadgeClass = (level: 'Low' | 'Medium' | 'High' | 'Good' | 'Moderate' | 'Limited' | 'Flat' | 'Steep') => {
  switch (level) {
    case 'Low':
    case 'Good':
    case 'Flat':
      return 'bg-[hsl(var(--risk-low))]/20 text-[hsl(var(--risk-low))]';
    case 'Medium':
    case 'Moderate':
      return 'bg-[hsl(var(--risk-moderate))]/20 text-[hsl(var(--risk-moderate))]';
    case 'High':
    case 'Limited':
    case 'Steep':
      return 'bg-[hsl(var(--risk-elevated))]/20 text-[hsl(var(--risk-elevated))]';
    default:
      return 'bg-secondary text-muted-foreground';
  }
};

export const RiskIndicatorSection = ({ indicators }: RiskIndicatorSectionProps) => {
  const indicatorData = [
    // Flood Exposure (Historical)
    {
      icon: <Droplets className="w-4 h-4" />,
      title: "Flood Exposure (Historical)",
      value: `${indicators.floodExposure.yearsAffected} of ${indicators.floodExposure.totalYears} years affected`,
      subValue: `${indicators.floodExposure.riverProximity}m from ${indicators.floodExposure.riverName}`,
      detailedSummary: indicators.floodExposure.yearsAffected > 0
        ? `Based on satellite-detected flood occurrence from 2009-2019, this plot experienced flooding in ${indicators.floodExposure.yearsAffected} years. Located ${indicators.floodExposure.riverProximity}m from ${indicators.floodExposure.riverName}. ${indicators.floodExposure.lastFloodYear ? `Last recorded flood event: ${indicators.floodExposure.lastFloodYear}.` : ''}`
        : `No significant flood events detected in satellite imagery from 2009-2019. Located ${indicators.floodExposure.riverProximity}m from ${indicators.floodExposure.riverName}.`,
      iconColorClass: "text-[hsl(210,80%,50%)]",
      levelBadge: {
        level: indicators.floodExposure.level,
        colorClass: getLevelBadgeClass(indicators.floodExposure.level)
      },
      defaultOpen: true
    },
    // Drainage & Water Accumulation Risk
    {
      icon: <TrendingDown className="w-4 h-4" />,
      title: "Drainage & Water Accumulation",
      value: `Flow accumulation: ${indicators.drainageRisk.flowAccumulation}`,
      subValue: indicators.drainageRisk.isWaterConvergence ? 'Water convergence zone detected' : indicators.drainageRisk.isLowLying ? 'Low-lying area' : 'Standard drainage conditions',
      detailedSummary: `Derived from DEM-based flow accumulation analysis. ${indicators.drainageRisk.isLowLying ? 'This plot is in a low-lying zone with potential water accumulation. ' : ''}${indicators.drainageRisk.isWaterConvergence ? 'Located in a water convergence area where multiple flow paths meet. ' : ''}Flow accumulation is ${indicators.drainageRisk.flowAccumulation.toLowerCase()}.`,
      iconColorClass: "text-[hsl(195,70%,45%)]",
      levelBadge: {
        level: indicators.drainageRisk.level,
        colorClass: getLevelBadgeClass(indicators.drainageRisk.level)
      }
    },
    // Terrain Slope Sensitivity
    {
      icon: <Mountain className="w-4 h-4" />,
      title: "Terrain Slope",
      value: `${indicators.terrainSlope.category} (${indicators.terrainSlope.slopePercent}% grade)`,
      subValue: `Aspect: ${indicators.terrainSlope.aspect}`,
      detailedSummary: `Calculated using elevation data. Slope is ${indicators.terrainSlope.slopePercent}% facing ${indicators.terrainSlope.aspect}. ${indicators.terrainSlope.category === 'Flat' ? 'Flat terrain may accumulate water but is easier for construction.' : indicators.terrainSlope.category === 'Steep' ? 'Steep slopes may have erosion concerns but better natural drainage.' : 'Moderate slopes offer balanced drainage characteristics.'}`,
      iconColorClass: "text-earth-400",
      levelBadge: {
        level: indicators.terrainSlope.category,
        colorClass: getLevelBadgeClass(indicators.terrainSlope.category)
      }
    },
    // Elevation Context
    {
      icon: <MapPin className="w-4 h-4" />,
      title: "Elevation Context",
      value: `${indicators.elevation.plotElevation}m elevation`,
      subValue: `${indicators.elevation.difference >= 0 ? '+' : ''}${indicators.elevation.difference}m vs ward average (${indicators.elevation.wardAverage}m)`,
      detailedSummary: `Plot elevation compared to surrounding area: ${indicators.elevation.relativePosition}. ${indicators.elevation.relativePosition === 'Lower' ? 'Being lower than surrounding land increases water accumulation risk during heavy rainfall.' : indicators.elevation.relativePosition === 'Higher' ? 'Higher position relative to surroundings provides natural drainage advantage.' : 'Similar elevation to surroundings indicates standard drainage patterns.'}`,
      iconColorClass: "text-[hsl(38,92%,45%)]",
      levelBadge: {
        level: indicators.elevation.relativePosition,
        colorClass: indicators.elevation.relativePosition === 'Lower' 
          ? 'bg-[hsl(var(--risk-elevated))]/20 text-[hsl(var(--risk-elevated))]'
          : indicators.elevation.relativePosition === 'Higher'
          ? 'bg-[hsl(var(--risk-low))]/20 text-[hsl(var(--risk-low))]'
          : 'bg-secondary text-muted-foreground'
      }
    },
    // Road Accessibility Proximity
    {
      icon: <Car className="w-4 h-4" />,
      title: "Road Accessibility",
      value: `${indicators.roadAccessibility.distanceMeters}m from main road`,
      subValue: `Nearest: ${indicators.roadAccessibility.nearestRoad}`,
      detailedSummary: `Distance from nearest main road is ${indicators.roadAccessibility.distanceMeters}m (${indicators.roadAccessibility.nearestRoad}). ${indicators.roadAccessibility.accessLevel === 'Good' ? 'Excellent access for construction and emergency vehicles.' : indicators.roadAccessibility.accessLevel === 'Limited' ? 'Limited access may affect construction logistics and emergency response.' : 'Moderate access suitable for most purposes.'}`,
      iconColorClass: "text-[hsl(260,60%,50%)]",
      levelBadge: {
        level: indicators.roadAccessibility.accessLevel,
        colorClass: getLevelBadgeClass(indicators.roadAccessibility.accessLevel)
      }
    },
    // Surrounding Land Use Context
    {
      icon: <TreePine className="w-4 h-4" />,
      title: "Surrounding Land Use",
      value: `Dominant: ${indicators.surroundingLandUse.dominant}`,
      subValue: `Also nearby: ${indicators.surroundingLandUse.categories.slice(1).join(', ')}`,
      detailedSummary: `The dominant nearby land use is ${indicators.surroundingLandUse.dominant}. Other land use types in the vicinity include ${indicators.surroundingLandUse.categories.join(', ')}. This provides context for understanding local drainage patterns and development characteristics.`,
      iconColorClass: "text-[hsl(142,50%,40%)]"
    },
    // Indicative Soil Type
    {
      icon: <Layers className="w-4 h-4" />,
      title: "Indicative Soil Type",
      value: indicators.soilType.type,
      subValue: `Category: ${indicators.soilType.category}`,
      detailedSummary: `Generalized soil type based on regional soil maps: ${indicators.soilType.type} (${indicators.soilType.category}). ${indicators.soilType.category === 'Clay-Dominant' ? 'Clay soils may have lower permeability, potentially leading to water accumulation.' : indicators.soilType.category === 'Sandy-Loam' ? 'Sandy-loam soils typically have good drainage characteristics.' : 'Soil characteristics may vary within the area.'}`,
      iconColorClass: "text-earth-500",
      disclaimer: indicators.soilType.disclaimer
    }
  ];

  return (
    <div className="space-y-2 md:space-y-3">
      <h3 className="text-sm font-semibold text-foreground px-1">Environmental Indicators</h3>
      <div className="space-y-2">
        {indicatorData.map((indicator, index) => (
          <IndicatorItem key={index} {...indicator} />
        ))}
      </div>
    </div>
  );
};
