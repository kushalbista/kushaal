import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ExposureBandProps {
  level: 'low' | 'moderate' | 'elevated';
}

export const ExposureBand = ({ level }: ExposureBandProps) => {
  const levels = ['low', 'moderate', 'elevated'] as const;
  const activeIndex = levels.indexOf(level);

  return (
    <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">Exposure Context</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-1 hover:bg-muted rounded-lg transition-colors">
              <Info className="w-4 h-4 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-xs">Relative exposure based on historical data. Not a legal or risk assessment.</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center gap-1">
        {levels.map((l, index) => (
          <button
            key={l}
            className={cn(
              "flex-1 py-2.5 px-3 rounded-lg text-xs font-medium transition-all capitalize",
              index === activeIndex
                ? l === 'low' 
                  ? "bg-heatmap-low text-foreground shadow-card" 
                  : l === 'moderate'
                    ? "bg-heatmap-medium text-foreground shadow-card"
                    : "bg-heatmap-elevated text-foreground shadow-card"
                : "bg-muted text-muted-foreground"
            )}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
};
