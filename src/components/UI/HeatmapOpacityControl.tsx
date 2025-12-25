import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Eye, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HEATMAP_DEFAULTS } from '@/utils/mapStyles';

interface HeatmapOpacityControlProps {
  opacity: number;
  onOpacityChange: (value: number) => void;
  className?: string;
}

export const HeatmapOpacityControl = ({ 
  opacity, 
  onOpacityChange, 
  className 
}: HeatmapOpacityControlProps) => {
  return (
    <div className={cn(
      "glass-strong rounded-lg p-3 shadow-lg space-y-2",
      className
    )}>
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-primary" />
        <Label className="text-xs font-medium">Heatmap Opacity</Label>
      </div>
      
      <div className="flex items-center gap-3">
        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
        <Slider
          value={[opacity]}
          onValueChange={([value]) => onOpacityChange(value)}
          min={HEATMAP_DEFAULTS.minOpacity * 100}
          max={HEATMAP_DEFAULTS.maxOpacity * 100}
          step={5}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground w-8 text-right">
          {Math.round(opacity)}%
        </span>
      </div>
    </div>
  );
};

export default HeatmapOpacityControl;
