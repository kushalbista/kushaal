import { AlertTriangle, CheckCircle, AlertCircle, TrendingUp, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRiskLevel, getRiskLabel, getRiskBadgeClass, computePolygonStats } from '@/services/riskService';
import { DATA_SOURCE } from '@/utils/constants';
import { PlotData } from '@/data/mockData';

interface PolygonRiskCardProps {
  selectedPlots: PlotData[];
  className?: string;
}

export const PolygonRiskCard = ({ selectedPlots, className }: PolygonRiskCardProps) => {
  const stats = computePolygonStats(selectedPlots);
  
  if (stats.plotCount === 0) {
    return null;
  }

  const getRiskIcon = () => {
    switch (stats.riskLevel) {
      case 'low':
        return <CheckCircle className="w-5 h-5 text-[hsl(var(--risk-low))]" />;
      case 'moderate':
        return <AlertCircle className="w-5 h-5 text-[hsl(var(--risk-moderate))]" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-[hsl(var(--risk-elevated))]" />;
    }
  };

  return (
    <div className={cn(
      "glass-strong rounded-xl p-4 space-y-3 shadow-lg border border-border",
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Risk of Selected Area</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {stats.plotCount} plot{stats.plotCount !== 1 ? 's' : ''} analyzed
          </p>
        </div>
        <span className={cn(
          "px-2.5 py-1 rounded-md text-xs font-medium",
          getRiskBadgeClass(stats.riskLevel)
        )}>
          {getRiskLabel(stats.riskLevel)}
        </span>
      </div>

      {/* Risk Score */}
      <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
        {getRiskIcon()}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Flood Risk Score</span>
            <span className="text-sm font-bold text-foreground">{stats.riskScore}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                stats.riskLevel === 'low' && "bg-[hsl(var(--risk-low))]",
                stats.riskLevel === 'moderate' && "bg-[hsl(var(--risk-moderate))]",
                stats.riskLevel === 'high' && "bg-[hsl(var(--risk-elevated))]"
              )}
              style={{ width: `${stats.riskScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 bg-secondary/30 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Flood Frequency</span>
          </div>
          <p className="text-sm font-semibold text-foreground">{stats.floodFrequency}</p>
        </div>
        
        <div className="p-2.5 bg-secondary/30 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Avg Elevation</span>
          </div>
          <p className="text-sm font-semibold text-foreground">{stats.avgElevation}m</p>
        </div>
      </div>

      {/* Soil Type */}
      <div className="p-2.5 bg-secondary/30 rounded-lg">
        <span className="text-[10px] text-muted-foreground">Dominant Soil Type: </span>
        <span className="text-xs font-medium text-foreground">{stats.dominantSoilType}</span>
      </div>

      {/* Data Source */}
      <div className="pt-2 border-t border-border">
        <p className="text-[10px] text-muted-foreground/70 italic">
          {stats.dataSource}
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
          Source: {DATA_SOURCE.name} ({DATA_SOURCE.yearRange})
        </p>
      </div>
    </div>
  );
};

export default PolygonRiskCard;
