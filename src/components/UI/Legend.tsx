import { cn } from '@/lib/utils';
import { DATA_SOURCE } from '@/utils/constants';

interface LegendItem {
  label: string;
  color: string;
  count?: number;
}

interface LegendProps {
  items: LegendItem[];
  title?: string;
  className?: string;
  showSource?: boolean;
}

export const Legend = ({ 
  items, 
  title = 'Risk Levels',
  className,
  showSource = true
}: LegendProps) => {
  return (
    <div className={cn(
      "glass-strong rounded-lg p-3 shadow-lg",
      className
    )}>
      <p className="text-xs font-medium text-foreground mb-2">{title}</p>
      
      <div className="flex flex-col gap-1.5">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <div 
                className="w-3.5 h-3.5 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
            {item.count !== undefined && (
              <span className="text-[10px] text-muted-foreground/70">
                {item.count} plots
              </span>
            )}
          </div>
        ))}
      </div>
      
      {showSource && (
        <p className="text-[9px] text-muted-foreground/60 mt-2 italic">
          Source: {DATA_SOURCE.yearRange}
        </p>
      )}
    </div>
  );
};

export default Legend;
