import { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface IndicatorCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  tooltip: string;
  variant?: 'default' | 'low' | 'moderate' | 'elevated';
}

export const IndicatorCard = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  tooltip,
  variant = 'default' 
}: IndicatorCardProps) => {
  const getBorderColor = () => {
    switch (variant) {
      case 'low': return 'border-l-heatmap-low';
      case 'moderate': return 'border-l-heatmap-medium';
      case 'elevated': return 'border-l-heatmap-elevated';
      default: return 'border-l-border';
    }
  };

  return (
    <div className={cn(
      "bg-card rounded-xl p-4 shadow-card border border-border/50 border-l-4 transition-all hover:shadow-card-hover",
      getBorderColor()
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-lg font-semibold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-1 hover:bg-muted rounded-lg transition-colors">
              <Info className="w-4 h-4 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
